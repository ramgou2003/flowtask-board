import { supabase } from './supabase'
import { Project, Board, Task, Column } from '@/types/kanban'

// Database types
interface DatabaseProject {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

interface DatabaseTask {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  assignee: string | null
  position: number
  created_at: string
  updated_at: string
}

// Convert database task to app task format
const convertToAppTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  priority: dbTask.priority as 'low' | 'medium' | 'high' | 'urgent',
  dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
  tags: [], // Initialize empty tags array - we'll add tags support later
  assignee: dbTask.assignee || undefined,
  columnId: dbTask.status, // Use status as columnId for now
  order: dbTask.position || 0,
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at)
})

// Convert app task to database format
const convertToDatabaseTask = (task: Partial<Task>, projectId: string, userId: string, status: string, position: number = 0) => ({
  project_id: projectId,
  user_id: userId,
  title: task.title!,
  description: task.description || null,
  status,
  priority: task.priority || 'medium',
  due_date: task.dueDate || null,
  assignee: task.assignee || null,
  position
})

// Convert database project to app project format (simplified version)
const convertToAppProject = (dbProject: DatabaseProject): Project => {
  console.log('🔄 Converting project (sync):', dbProject);

  // Create empty columns for now - we'll load tasks separately
  const columns: Column[] = [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ];

  const project = {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description || '',
    color: dbProject.color,
    board: {
      columns,
      lastUpdated: new Date(dbProject.updated_at)
    },
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at)
  };

  console.log('✅ Converted project (sync):', project);
  return project;
}

// Convert app project to database format
const convertToDatabaseProject = (project: Partial<Project>, userId: string) => ({
  user_id: userId,
  name: project.name!,
  description: project.description || null,
  color: project.color || '#3b82f6'
})

// Load tasks for a specific project
const loadTasksForProject = async (projectId: string): Promise<(Task & { status: string })[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []).map(dbTask => ({
      ...convertToAppTask(dbTask),
      status: dbTask.status
    }));
  } catch (error) {
    console.error('Error loading tasks:', error)
    return []
  }
}

// Get project with tasks loaded into board
export const getProjectWithTasks = async (projectId: string): Promise<Project | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Project not found
      }
      throw error
    }

    const tasks = await loadTasksForProject(projectId);

    // Group tasks by status into columns
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const columns: Column[] = [
      { id: 'todo', title: 'To Do', tasks: todoTasks },
      { id: 'in-progress', title: 'In Progress', tasks: inProgressTasks },
      { id: 'review', title: 'Review', tasks: reviewTasks },
      { id: 'done', title: 'Done', tasks: doneTasks }
    ];

    const project = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      color: data.color,
      board: {
        columns,
        lastUpdated: new Date(data.updated_at)
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    return project;
  } catch (error) {
    console.error('Error getting project with tasks:', error)
    return null
  }
}

// Load all projects for the current user (optimized - no tasks loaded)
export const loadProjects = async (): Promise<{ projects: Project[]; lastUpdated: Date }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    // Convert projects without loading tasks for faster dashboard loading
    const projects = (data || []).map(dbProject => convertToAppProject(dbProject))

    return {
      projects,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Error loading projects:', error)
    return { projects: [], lastUpdated: new Date() }
  }
}

// Get a specific project by ID
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Project not found
      }
      throw error
    }

    return convertToAppProject(data);
  } catch (error) {
    console.error('Error getting project:', error)
    return null
  }
}

// Add a new project (optimized)
export const addProject = async (project: Project): Promise<Project | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbProject = convertToDatabaseProject(project, user.id)

    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...dbProject, id: project.id }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Return the project immediately without loading tasks (they're empty anyway)
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      color: data.color,
      board: {
        columns: [
          { id: 'todo', title: 'To Do', tasks: [] },
          { id: 'in-progress', title: 'In Progress', tasks: [] },
          { id: 'review', title: 'Review', tasks: [] },
          { id: 'done', title: 'Done', tasks: [] }
        ],
        lastUpdated: new Date(data.updated_at)
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error adding project:', error)
    return null
  }
}

// Update an existing project
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.board !== undefined) updateData.board = updates.board

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return convertToAppProject(data)
  } catch (error) {
    console.error('Error updating project:', error)
    return null
  }
}

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting project:', error)
    return false
  }
}

// Add a new task to a project
export const addTask = async (projectId: string, columnId: string, task: Omit<Task, 'id'>): Promise<Task | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the highest position in this column
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('position')
      .eq('project_id', projectId)
      .eq('status', columnId)
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)

    const newPosition = existingTasks && existingTasks.length > 0 ? existingTasks[0].position + 1 : 0

    const dbTask = convertToDatabaseTask(task, projectId, user.id, columnId, newPosition)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...dbTask, id: crypto.randomUUID() }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return convertToAppTask(data)
  } catch (error) {
    console.error('Error adding task:', error)
    return null
  }
}

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null
    if (updates.assignee !== undefined) updateData.assignee = updates.assignee || null

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return convertToAppTask(data)
  } catch (error) {
    console.error('Error updating task:', error)
    return null
  }
}

// Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    return false
  }
}

// Move a task between columns or reorder within a column
export const moveTask = async (taskId: string, newStatus: string, newPosition: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        position: newPosition
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error moving task:', error)
    return false
  }
}

// Update project board (for kanban operations) - now handles task movements
export const updateProjectBoard = async (projectId: string, board: Board): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Update task positions and statuses based on the board state
    const updatePromises: Promise<any>[] = []

    board.columns.forEach(column => {
      column.tasks.forEach((task, index) => {
        updatePromises.push(
          supabase
            .from('tasks')
            .update({
              status: column.id,
              position: index
            })
            .eq('id', task.id)
            .eq('user_id', user.id)
        )
      })
    })

    await Promise.all(updatePromises)

    // Update project's updated_at timestamp
    await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id)

    return true
  } catch (error) {
    console.error('Error updating project board:', error)
    return false
  }
}

// Create a new project with default structure
export const createProject = (name: string, description: string = '', color: string = '#3b82f6'): Project => {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    color,
    board: {
      columns: [
        { id: 'todo', title: 'To Do', tasks: [] },
        { id: 'in-progress', title: 'In Progress', tasks: [] },
        { id: 'review', title: 'Review', tasks: [] },
        { id: 'done', title: 'Done', tasks: [] }
      ],
      lastUpdated: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Create a new task
export const createTask = (title: string, description: string = '', priority: 'low' | 'medium' | 'high' = 'medium'): Omit<Task, 'id'> => {
  return {
    title,
    description,
    priority,
    dueDate: undefined,
    assignee: undefined
  }
}

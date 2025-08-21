import { Project, ProjectsData, KanbanBoard } from '@/types/kanban';

const PROJECTS_STORAGE_KEY = 'flowtask-projects-data';
const LEGACY_STORAGE_KEY = 'kanban-board-data';

// Default project template
const createDefaultProject = (name: string = 'My First Project'): Project => ({
  id: `project-${Date.now()}`,
  name,
  description: 'Your first FlowTask project',
  color: '#3b82f6',
  board: {
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        order: 0,
        tasks: [
          {
            id: 'task-1',
            title: 'Welcome to FlowTask!',
            description: 'This is your first task. Click to edit or drag to move between columns.',
            priority: 'medium',
            tags: ['Welcome'],
            columnId: 'col-1',
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: 'col-2',
        title: 'In Progress',
        order: 1,
        tasks: [],
      },
      {
        id: 'col-3',
        title: 'Review',
        order: 2,
        tasks: [],
      },
      {
        id: 'col-4',
        title: 'Done',
        order: 3,
        tasks: [],
      },
    ],
    lastUpdated: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Migration function to convert legacy single board to project structure
const migrateLegacyData = (): ProjectsData => {
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

  if (legacyData) {
    try {
      const parsed = JSON.parse(legacyData);
      // Convert date strings back to Date objects
      parsed.columns.forEach((col: any) => {
        col.tasks.forEach((task: any) => {
          task.createdAt = new Date(task.createdAt);
          task.updatedAt = new Date(task.updatedAt);
          if (task.dueDate) task.dueDate = new Date(task.dueDate);
        });
      });

      const migratedProject: Project = {
        id: 'project-migrated',
        name: 'Migrated Project',
        description: 'Your existing tasks migrated to the new project system',
        color: '#8b5cf6',
        board: parsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Remove legacy data after migration
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      return {
        projects: [migratedProject],
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to migrate legacy data:', error);
    }
  }

  // Return empty projects list if no legacy data
  return {
    projects: [],
    lastUpdated: new Date(),
  };
};

// Load all projects from localStorage
export const loadProjects = (): ProjectsData => {
  const savedData = localStorage.getItem(PROJECTS_STORAGE_KEY);

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);

      // Remove demo projects (projects with default demo tasks)
      const filteredProjects = parsed.projects.filter((project: Project) => {
        // Check if this is a demo project by looking for the welcome task
        const hasWelcomeTask = project.board.columns.some(col =>
          col.tasks.some(task => task.title === 'Welcome to FlowTask!')
        );
        return !hasWelcomeTask;
      });

      // Convert date strings back to Date objects
      filteredProjects.forEach((project: Project) => {
        project.createdAt = new Date(project.createdAt);
        project.updatedAt = new Date(project.updatedAt);
        project.board.lastUpdated = new Date(project.board.lastUpdated);
        project.board.columns.forEach((col: any) => {
          col.tasks.forEach((task: any) => {
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.dueDate) task.dueDate = new Date(task.dueDate);
          });
        });
      });

      const cleanedData = {
        projects: filteredProjects,
        lastUpdated: new Date(parsed.lastUpdated)
      };

      // Save the cleaned data back
      if (filteredProjects.length !== parsed.projects.length) {
        saveProjects(cleanedData);
      }

      return cleanedData;
    } catch (error) {
      console.error('Failed to load projects data:', error);
    }
  }

  // Check for legacy data and migrate
  return migrateLegacyData();
};

// Save all projects to localStorage
export const saveProjects = (projectsData: ProjectsData): void => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsData));
  } catch (error) {
    console.error('Failed to save projects data:', error);
  }
};

// Get a specific project by ID
export const getProject = (projectId: string): Project | null => {
  const projectsData = loadProjects();
  return projectsData.projects.find(p => p.id === projectId) || null;
};

// Create a new project
export const createProject = (name: string, description?: string, color?: string): Project => {
  return {
    id: `project-${Date.now()}`,
    name,
    description: description || `Project: ${name}`,
    color: color || '#3b82f6',
    board: {
      columns: [
        {
          id: 'col-1',
          title: 'To Do',
          order: 0,
          tasks: [],
        },
        {
          id: 'col-2',
          title: 'In Progress',
          order: 1,
          tasks: [],
        },
        {
          id: 'col-3',
          title: 'Review',
          order: 2,
          tasks: [],
        },
        {
          id: 'col-4',
          title: 'Done',
          order: 3,
          tasks: [],
        },
      ],
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Update a project
export const updateProject = (projectId: string, updates: Partial<Project>): boolean => {
  const projectsData = loadProjects();
  const projectIndex = projectsData.projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) return false;
  
  projectsData.projects[projectIndex] = {
    ...projectsData.projects[projectIndex],
    ...updates,
    updatedAt: new Date(),
  };
  
  projectsData.lastUpdated = new Date();
  saveProjects(projectsData);
  return true;
};

// Update a project's board
export const updateProjectBoard = (projectId: string, board: KanbanBoard): boolean => {
  const projectsData = loadProjects();
  const projectIndex = projectsData.projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) return false;
  
  projectsData.projects[projectIndex].board = {
    ...board,
    lastUpdated: new Date(),
  };
  projectsData.projects[projectIndex].updatedAt = new Date();
  projectsData.lastUpdated = new Date();
  
  saveProjects(projectsData);
  return true;
};

// Delete a project
export const deleteProject = (projectId: string): boolean => {
  const projectsData = loadProjects();
  const initialLength = projectsData.projects.length;
  
  projectsData.projects = projectsData.projects.filter(p => p.id !== projectId);
  
  if (projectsData.projects.length < initialLength) {
    projectsData.lastUpdated = new Date();
    saveProjects(projectsData);
    return true;
  }
  
  return false;
};

// Add a new project to the list
export const addProject = (project: Project): void => {
  const projectsData = loadProjects();
  projectsData.projects.push(project);
  projectsData.lastUpdated = new Date();
  saveProjects(projectsData);
};

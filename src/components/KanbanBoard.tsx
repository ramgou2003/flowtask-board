import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { Task, Column as ColumnType, KanbanBoard as KanbanBoardType } from '@/types/kanban';
import { getProject, getProjectWithTasks, updateProjectBoard, addTask, updateTask, deleteTask, createTask } from '@/lib/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const [data, setData] = useState<KanbanBoardType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 15,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const project = await getProjectWithTasks(projectId);
        if (project) {
          setData(project.board);
        } else {
          toast({
            title: 'Error',
            description: 'Project not found.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('KanbanBoard error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Save data to project storage
  useEffect(() => {
    const saveBoard = async () => {
      if (data) {
        await updateProjectBoard(projectId, data);
      }
    };
    saveBoard();
  }, [data, projectId]);

  // Cleanup: Re-enable scrolling if component unmounts during drag
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  // Filter tasks based on search query
  const filteredColumns = useMemo(() => {
    if (!data || !searchQuery) return data?.columns || [];

    return data.columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }));
  }, [data?.columns, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Disable scrolling when dragging starts
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !data) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task and over column
    const activeTask = findTask(activeId);
    const overColumn = findColumn(overId) || findColumnByTask(overId);

    if (!activeTask || !overColumn) return;

    // Move task between columns
    if (activeTask.columnId !== overColumn.id) {
      setData(prev => {
        if (!prev) return prev;
        const newColumns = prev.columns.map(col => {
          if (col.id === activeTask.columnId) {
            return {
              ...col,
              tasks: col.tasks.filter(task => task.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            const newTask = { ...activeTask, columnId: overColumn.id };
            return {
              ...col,
              tasks: [...col.tasks, newTask],
            };
          }
          return col;
        });

        return { ...prev, columns: newColumns };
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Re-enable scrolling when dragging ends
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    if (!over || !data) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTask(activeId);
    const overTask = findTask(overId);

    if (!activeTask) return;

    // Reorder tasks within the same column
    if (overTask && activeTask.columnId === overTask.columnId) {
      setData(prev => {
        if (!prev) return prev;
        const columnIndex = prev.columns.findIndex(col => col.id === activeTask.columnId);
        const column = prev.columns[columnIndex];

        const oldIndex = column.tasks.findIndex(task => task.id === activeId);
        const newIndex = column.tasks.findIndex(task => task.id === overId);

        const newTasks = arrayMove(column.tasks, oldIndex, newIndex);

        const newColumns = [...prev.columns];
        newColumns[columnIndex] = { ...column, tasks: newTasks };

        return { ...prev, columns: newColumns };
      });
    }

    toast({
      title: 'Task moved',
      description: `"${activeTask.title}" has been moved successfully.`,
    });
  };

  const findTask = (id: string): Task | null => {
    if (!data) return null;
    for (const column of data.columns) {
      const task = column.tasks.find(task => task.id === id);
      if (task) return task;
    }
    return null;
  };

  const findColumn = (id: string): ColumnType | null => {
    if (!data) return null;
    return data.columns.find(col => col.id === id) || null;
  };

  const findColumnByTask = (taskId: string): ColumnType | null => {
    if (!data) return null;
    for (const column of data.columns) {
      if (column.tasks.find(task => task.id === taskId)) {
        return column;
      }
    }
    return null;
  };

  const handleAddTask = (columnId: string) => {
    setNewTaskColumnId(columnId);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setNewTaskColumnId('');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    if (!data) return;

    try {
      if (selectedTask && selectedTask.id !== 'new') {
        // Editing existing task
        const updatedTask = await updateTask(selectedTask.id, task);
        if (updatedTask) {
          // Reload the project to get updated data
          const updatedProject = await getProject(projectId);
          if (updatedProject) {
            setData(updatedProject.board);
          }
          toast({
            title: 'Task updated',
            description: 'Task has been updated successfully.',
          });
        }
      } else {
        // Adding new task
        const newTask = await addTask(projectId, newTaskColumnId, task);
        if (newTask) {
          // Reload the project to get updated data
          const updatedProject = await getProject(projectId);
          if (updatedProject) {
            setData(updatedProject.board);
          }
          toast({
            title: 'Task created',
            description: 'Task has been created successfully.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save task. Please try again.',
        variant: 'destructive',
      });
    }

    setIsModalOpen(false);
    setSelectedTask(null);
    setNewTaskColumnId('');
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = findTask(taskId);
    if (!task || !data) return;

    try {
      const success = await deleteTask(taskId);
      if (success) {
        // Reload the project to get updated data
        const updatedProject = await getProject(projectId);
        if (updatedProject) {
          setData(updatedProject.board);
        }
        toast({
          title: 'Task deleted',
          description: `"${task.title}" has been deleted successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddColumn = () => {
    if (!data) return;

    const newColumn: ColumnType = {
      id: `col-${Date.now()}`,
      title: 'New Column',
      order: data.columns.length,
      tasks: [],
    };

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: [...prev.columns, newColumn],
      };
    });

    toast({
      title: 'Column added',
      description: 'New column has been created successfully.',
    });
  };

  const handleEditColumn = (columnId: string, title: string) => {
    if (!data) return;

    setData(prev => {
      if (!prev) return prev;
      const newColumns = prev.columns.map(col =>
        col.id === columnId ? { ...col, title } : col
      );
      return { ...prev, columns: newColumns };
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = findColumn(columnId);
    if (!column || !data) return;

    if (column.tasks.length > 0) {
      toast({
        title: 'Cannot delete column',
        description: 'Please move or delete all tasks before deleting the column.',
        variant: 'destructive',
      });
      return;
    }

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.filter(col => col.id !== columnId),
      };
    });

    toast({
      title: 'Column deleted',
      description: `"${column.title}" column has been deleted successfully.`,
    });
  };

  const activeTask = activeId ? findTask(activeId) : null;

  if (isLoading || !data) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading project...</h2>
          <p className="text-muted-foreground">Please wait while we load your project data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} currentProjectId={projectId} />

      <main className="px-6 pt-3 flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto h-full pb-4">
            {filteredColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
            
            {/* Add Column Button */}
            <div className="w-80 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={handleAddColumn}
                className="w-full h-full border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors animate-fade-in"
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add Column</span>
                </div>
              </Button>
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="drag-overlay">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
      />
    </div>
  );
};
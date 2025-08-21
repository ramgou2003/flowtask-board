import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
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
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'kanban-board-data';

const initialData: KanbanBoardType = {
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      order: 0,
      tasks: [
        {
          id: 'task-1',
          title: 'Design new landing page',
          description: 'Create a modern, responsive landing page with glassmorphism effects',
          priority: 'high',
          tags: ['Design', 'UI/UX'],
          columnId: 'col-1',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      ],
    },
    {
      id: 'col-2',
      title: 'In Progress',
      order: 1,
      tasks: [
        {
          id: 'task-2',
          title: 'Implement user authentication',
          description: 'Set up login, registration, and password reset functionality',
          priority: 'urgent',
          tags: ['Development', 'Backend'],
          columnId: 'col-2',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
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
      tasks: [
        {
          id: 'task-3',
          title: 'Set up project structure',
          description: 'Initialize React project with TypeScript and Tailwind CSS',
          priority: 'medium',
          tags: ['Setup', 'Development'],
          columnId: 'col-4',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ],
  lastUpdated: new Date(),
};

export const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<KanbanBoardType>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        parsed.columns.forEach((col: ColumnType) => {
          col.tasks.forEach((task: Task) => {
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.dueDate) task.dueDate = new Date(task.dueDate);
          });
        });
        setData(parsed);
      } catch (error) {
        console.error('Failed to load kanban data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved data. Using default layout.',
          variant: 'destructive',
        });
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Filter tasks based on search query
  const filteredColumns = useMemo(() => {
    if (!searchQuery) return data.columns;

    return data.columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }));
  }, [data.columns, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task and over column
    const activeTask = findTask(activeId);
    const overColumn = findColumn(overId) || findColumnByTask(overId);

    if (!activeTask || !overColumn) return;

    // Move task between columns
    if (activeTask.columnId !== overColumn.id) {
      setData(prev => {
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

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTask(activeId);
    const overTask = findTask(overId);

    if (!activeTask) return;

    // Reorder tasks within the same column
    if (overTask && activeTask.columnId === overTask.columnId) {
      setData(prev => {
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
    for (const column of data.columns) {
      const task = column.tasks.find(task => task.id === id);
      if (task) return task;
    }
    return null;
  };

  const findColumn = (id: string): ColumnType | null => {
    return data.columns.find(col => col.id === id) || null;
  };

  const findColumnByTask = (taskId: string): ColumnType | null => {
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

  const handleSaveTask = (task: Task) => {
    setData(prev => {
      const newColumns = prev.columns.map(col => {
        if (selectedTask) {
          // Editing existing task
          if (col.id === task.columnId) {
            return {
              ...col,
              tasks: col.tasks.map(t => t.id === task.id ? task : t),
            };
          }
          // Remove from old column if moved
          if (col.id === selectedTask.columnId && selectedTask.columnId !== task.columnId) {
            return {
              ...col,
              tasks: col.tasks.filter(t => t.id !== task.id),
            };
          }
        } else {
          // Adding new task
          if (col.id === newTaskColumnId) {
            const newTask = {
              ...task,
              columnId: newTaskColumnId,
              order: col.tasks.length,
            };
            return {
              ...col,
              tasks: [...col.tasks, newTask],
            };
          }
        }
        return col;
      });

      return { ...prev, columns: newColumns, lastUpdated: new Date() };
    });

    toast({
      title: selectedTask ? 'Task updated' : 'Task created',
      description: `"${task.title}" has been ${selectedTask ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = findTask(taskId);
    if (!task) return;

    setData(prev => {
      const newColumns = prev.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId),
      }));
      return { ...prev, columns: newColumns };
    });

    toast({
      title: 'Task deleted',
      description: `"${task.title}" has been deleted successfully.`,
    });
  };

  const handleAddColumn = () => {
    const newColumn: ColumnType = {
      id: `col-${Date.now()}`,
      title: 'New Column',
      order: data.columns.length,
      tasks: [],
    };

    setData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));

    toast({
      title: 'Column added',
      description: 'New column has been created successfully.',
    });
  };

  const handleEditColumn = (columnId: string, title: string) => {
    setData(prev => {
      const newColumns = prev.columns.map(col =>
        col.id === columnId ? { ...col, title } : col
      );
      return { ...prev, columns: newColumns };
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = findColumn(columnId);
    if (!column) return;

    if (column.tasks.length > 0) {
      toast({
        title: 'Cannot delete column',
        description: 'Please move or delete all tasks before deleting the column.',
        variant: 'destructive',
      });
      return;
    }

    setData(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId),
    }));

    toast({
      title: 'Column deleted',
      description: `"${column.title}" column has been deleted successfully.`,
    });
  };

  const activeTask = activeId ? findTask(activeId) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-6 py-8">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
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
                className="w-full h-32 border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors animate-fade-in"
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
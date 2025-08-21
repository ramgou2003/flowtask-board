import React, { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onEditColumn(column.id, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(column.title);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(column.title);
  };

  return (
    <div className="w-80 flex-shrink-0 animate-slide-in">
      <div className={`bg-card rounded-xl border border-border/50 h-[calc(100vh-12rem)] flex flex-col transition-all duration-200 
        ${isOver ? 'drop-zone-active' : ''}
      `}>
        {/* Column Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between gap-2">
            {isEditing ? (
              <div className="flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="text-sm font-medium bg-transparent border-0 p-0 h-auto focus:ring-0"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <h2 className="font-semibold text-card-foreground">{column.title}</h2>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteColumn(column.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Add Task Button */}
          <Button
            variant="ghost"
            onClick={() => onAddTask(column.id)}
            className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add task
          </Button>
        </div>

        {/* Tasks List */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-4 pt-4 pb-4 space-y-3">
            <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </SortableContext>

            {column.tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No tasks yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Click "Add task" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Badge component
import { Badge } from '@/components/ui/badge';
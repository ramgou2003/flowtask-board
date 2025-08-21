import React from 'react';
import { Calendar, Clock, Tag, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityConfig = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  urgent: { label: 'Urgent', className: 'priority-urgent' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date() > task.dueDate;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-card rounded-xl border border-border/50 p-4 cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-fade-in
        ${isDragging ? 'task-card-dragging' : 'hover:scale-[1.02]'}
        touch-none select-none
      `}
      onClick={() => onEdit(task)}
    >
      {/* Options Menu */}
      <div className="absolute bottom-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Content */}
      <div className="pb-8 space-y-3">
        {/* Title and Priority Badge in same row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-card-foreground leading-tight line-clamp-2 flex-1">
            {task.title}
          </h3>
          <Badge variant="secondary" className={`text-xs px-2 py-1 ${priority.className} flex-shrink-0`}>
            {priority.label}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            <span>{format(task.dueDate, 'MMM dd, yyyy')}</span>
            {isOverdue && <Clock className="h-3 w-3 animate-pulse" />}
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0 bg-background/50"
              >
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0 bg-background/50">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
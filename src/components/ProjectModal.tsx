import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Project } from '@/types/kanban';

interface ProjectModalProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'board'>) => void;
  onDelete?: (projectId: string) => void;
  isLoading?: boolean;
}

const colorOptions = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#3b82f6');
    } else {
      // Reset for new project
      setName('');
      setDescription('');
      setColor('#3b82f6');
    }
  }, [project, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    const projectData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    };

    onSave(projectData);
    onClose();
  };

  const handleDelete = () => {
    if (project && onDelete) {
      onDelete(project.id);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6" onKeyDown={handleKeyPress}>
          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Project Name *
            </label>
            <Input
              placeholder="Enter project name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Description
            </label>
            <Textarea
              placeholder="Add a description for this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Project Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption
                      ? 'border-foreground scale-110'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {project && onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="text-sm"
                >
                  Delete Project
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || isLoading}
                className="text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {project ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  `${project ? 'Update' : 'Create'} Project`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

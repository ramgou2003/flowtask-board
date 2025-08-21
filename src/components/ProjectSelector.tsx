import React from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/types/kanban';

interface ProjectSelectorProps {
  currentProject: Project | null;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
  onManageProjects: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  currentProject,
  projects,
  onProjectSelect,
  onCreateProject,
  onManageProjects,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto bg-background/50 hover:bg-background/80 border border-border/50"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentProject?.color || '#3b82f6' }}
          />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium truncate max-w-[200px]">
              {currentProject?.name || 'Select Project'}
            </span>
            {currentProject?.description && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {currentProject.description}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Switch Project
        </div>
        <DropdownMenuSeparator />
        
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onProjectSelect(project)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color || '#3b82f6' }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {project.name}
              </span>
              {project.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {project.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onCreateProject}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer text-primary hover:bg-gray-100 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600"
        >
          <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-1 h-1 bg-primary rounded-full" />
          </div>
          <span className="text-sm font-medium">Create New Project</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onManageProjects}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600"
        >
          <FolderOpen className="w-3 h-3" />
          <span className="text-sm font-medium">Manage Projects</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

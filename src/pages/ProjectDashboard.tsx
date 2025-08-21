import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectModal } from '@/components/ProjectModal';
import { Header } from '@/components/Header';
import { Project } from '@/types/kanban';
import { loadProjects, addProject, updateProject, deleteProject, createProject } from '@/lib/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    refreshProjects();
  }, []);

  // Add a function to refresh projects
  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await loadProjects();
      setProjects(projectsData.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for storage changes to refresh projects when they're created from header
  useEffect(() => {
    const handleStorageChange = () => {
      refreshProjects();
    };

    // Listen for custom storage events
    window.addEventListener('projectsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('projectsUpdated', handleStorageChange);
    };
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'board'>) => {
    try {
      setIsCreating(true);

      if (selectedProject) {
        // Update existing project
        const success = await updateProject(selectedProject.id, projectData);
        if (success) {
          await refreshProjects();
          toast({
            title: 'Project updated',
            description: `"${projectData.name}" has been updated successfully.`,
          });
        }
      } else {
        // Create new project
        const newProject = createProject(projectData.name, projectData.description, projectData.color);
        const result = await addProject(newProject);

        if (result) {
          // Optimistically add to local state for immediate UI update
          setProjects(prev => [result, ...prev]);

          toast({
            title: 'Project created',
            description: `"${projectData.name}" has been created successfully.`,
          });

          // Navigate to the new project immediately
          navigate(`/project/${result.id}`);
        } else {
          throw new Error('Failed to create project');
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const success = deleteProject(projectId);
    if (success) {
      refreshProjects();
      toast({
        title: 'Project deleted',
        description: `"${project.name}" has been deleted successfully.`,
      });
    }
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/project/${project.id}`);
  };

  const getProjectStats = (project: Project) => {
    const totalTasks = project.board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
    const completedTasks = project.board.columns
      .find(col => col.title.toLowerCase().includes('done') || col.title.toLowerCase().includes('complete'))
      ?.tasks.length || 0;
    
    return { totalTasks, completedTasks };
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-full" />
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-muted rounded" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <FolderOpen className="h-20 w-20 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-semibold mb-3">
                {searchQuery ? 'No projects found' : 'Welcome to FlowTask'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-lg text-lg">
                {searchQuery
                  ? 'Try adjusting your search terms to find the project you\'re looking for.'
                  : 'Create your first project to start organizing your tasks and workflow. Use the "New Project" button in the header to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <Card
                    key={project.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleOpenProject(project)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color || '#3b82f6' }}
                          />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">
                              {project.name}
                            </CardTitle>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Project Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tasks</span>
                          <span className="font-medium">
                            {stats.completedTasks}/{stats.totalTasks} completed
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: project.color || '#3b82f6',
                              width: stats.totalTasks > 0 ? `${(stats.completedTasks / stats.totalTasks) * 100}%` : '0%',
                            }}
                          />
                        </div>
                        
                        {/* Last Updated */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {format(project.updatedAt, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        isLoading={isCreating}
      />
    </div>
  );
};

export default ProjectDashboard;

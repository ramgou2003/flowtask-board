import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Kanban, ArrowLeft, Plus, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectSelector } from './ProjectSelector';
import { ProjectModal } from './ProjectModal';
import { InstallButton } from './InstallButton';
import { Project } from '@/types/kanban';
import { loadProjects, addProject, updateProject, deleteProject, createProject, getProject } from '@/lib/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentProjectId?: string;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, currentProjectId }) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const isProjectBoard = location.pathname.startsWith('/project/');
  const isDashboard = location.pathname === '/';

  useEffect(() => {
    const loadProjectsData = async () => {
      const projectsData = await loadProjects();
      setProjects(projectsData.projects);

      if (currentProjectId) {
        const project = await getProject(currentProjectId);
        setCurrentProject(project);
      }
    };
    loadProjectsData();
  }, [currentProjectId]);

  const handleProjectSelect = (project: Project) => {
    navigate(`/project/${project.id}`);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleManageProjects = () => {
    navigate('/');
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'board'>) => {
    try {
      if (selectedProject) {
        // Update existing project
        const updatedProject = await updateProject(selectedProject.id, projectData);
        if (updatedProject) {
          const updatedProjectsData = await loadProjects();
          setProjects(updatedProjectsData.projects);
          toast({
            title: 'Project updated',
            description: `"${projectData.name}" has been updated successfully.`,
          });
        } else {
          throw new Error('Failed to update project');
        }
      } else {
        // Create new project
        const newProject = createProject(projectData.name, projectData.description, projectData.color);
        const savedProject = await addProject(newProject);

        if (savedProject) {
          // Reload projects to get updated list
          const updatedProjectsData = await loadProjects();
          setProjects(updatedProjectsData.projects);

          toast({
            title: 'Project created',
            description: `"${projectData.name}" has been created successfully.`,
          });

          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('projectsUpdated'));

          // Only navigate to the new project if we're on the dashboard
          if (isDashboard) {
            navigate(`/project/${newProject.id}`);
          }
        } else {
          throw new Error('Failed to create project');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const success = await deleteProject(projectId);
    if (success) {
      const updatedProjectsData = await loadProjects();
      setProjects(updatedProjectsData.projects);
      toast({
        title: 'Project deleted',
        description: `"${project.name}" has been deleted successfully.`,
      });
      // Navigate to dashboard if current project was deleted
      if (currentProjectId === projectId) {
        navigate('/');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-0 border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Logo, Title, and Dashboard Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Kanban className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold tracking-tight">
                    <span className="text-xl font-bold">VIDEC</span>
                    <span className="text-base"> Task Board</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isProjectBoard ? currentProject?.description || 'Organize your workflow beautifully' : 'Manage your projects and tasks'}
                  </p>
                </div>
              </div>

              {/* Dashboard Button (only show on project board) */}
              {isProjectBoard && (
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="gap-2 touch-target"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              )}
            </div>

            {/* Right side: Project Selector and Actions */}
            <div className="flex items-center gap-4">
              {/* Install Button */}
              <InstallButton />

              {/* Project Selector (only show on project board) */}
              {isProjectBoard && (
                <ProjectSelector
                  currentProject={currentProject}
                  projects={projects}
                  onProjectSelect={handleProjectSelect}
                  onCreateProject={handleCreateProject}
                  onManageProjects={handleManageProjects}
                />
              )}

              {/* New Project Button (only show on dashboard) */}
              {isDashboard && (
                <Button onClick={handleCreateProject} className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Project</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={isProjectBoard ? "Search tasks..." : "Search projects..."}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-48 md:w-64 pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 touch-target"
                />
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden bg-background/50 hover:bg-background/80 border border-border/50 touch-target"
              >
                <Sun className={`h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="bg-background/50 hover:bg-background/80 border border-border/50 touch-target"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
    </>
  );
};
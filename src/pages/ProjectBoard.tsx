import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { getProject } from '@/lib/supabaseStorage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Project } from '@/types/kanban';

const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    // Load project from Supabase
    const checkProject = async () => {
      try {
        console.log('🔍 Starting to load project:', projectId);
        const foundProject = await getProject(projectId);
        console.log('📦 Project result:', foundProject);

        if (foundProject) {
          console.log('✅ Project found, setting state');
          setProject(foundProject);
          setLoading(false);
        } else {
          console.log('❌ Project not found, retrying...');
          // Try again after a short delay in case the project was just created
          setTimeout(async () => {
            console.log('🔄 Retrying project load...');
            const retryProject = await getProject(projectId);
            console.log('🔄 Retry result:', retryProject);
            if (retryProject) {
              console.log('✅ Project found on retry');
              setProject(retryProject);
              setLoading(false);
            } else {
              console.log('❌ Project still not found after retry');
              setNotFound(true);
              setLoading(false);
            }
          }, 500);
        }
      } catch (error) {
        console.error('💥 Error loading project:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    checkProject();
  }, [projectId, navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading project...</h2>
          <p className="text-muted-foreground">Please wait while we load your project data.</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return <KanbanBoard projectId={projectId} />;
};

export default ProjectBoard;

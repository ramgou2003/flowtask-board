import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { InstallBanner } from "@/components/InstallBanner";
import ProjectDashboard from "./pages/ProjectDashboard";
import ProjectBoard from "./pages/ProjectBoard";
import NotFound from "./pages/NotFound";
import { registerServiceWorker } from "@/utils/pwa";
import { useEffect } from "react";
import "@/styles/tablet.css";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ProtectedRoute>
                <div className="app-container">
                  <InstallBanner />
                  <Routes>
                    <Route path="/" element={<ProjectDashboard />} />
                    <Route path="/project/:projectId" element={<ProjectBoard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <PWAInstallPrompt />
                </div>
              </ProtectedRoute>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

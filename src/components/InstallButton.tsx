import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt result:', outcome);
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      // Show manual instructions
      setShowInstructions(true);
    }
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('ipad') || userAgent.includes('iphone')) {
      return {
        title: "Install on iOS",
        steps: [
          "1. Tap the Share button (⬆️) at the bottom",
          "2. Scroll down and tap 'Add to Home Screen'",
          "3. Tap 'Add' to confirm",
          "4. The app will appear on your home screen"
        ],
        icon: <Share className="h-5 w-5" />
      };
    } else if (userAgent.includes('android')) {
      return {
        title: "Install on Android",
        steps: [
          "1. Tap the menu (⋮) in your browser",
          "2. Look for 'Add to Home screen' or 'Install app'",
          "3. Tap to install",
          "4. The app will appear on your home screen"
        ],
        icon: <Download className="h-5 w-5" />
      };
    } else {
      return {
        title: "Install App",
        steps: [
          "1. Look for the install icon in your browser's address bar",
          "2. Or check your browser's menu for 'Install' option",
          "3. Follow the prompts to install",
          "4. The app will be available in your applications"
        ],
        icon: <Download className="h-5 w-5" />
      };
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <>
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogTrigger asChild>
          <Button 
            onClick={handleInstallClick}
            variant="outline" 
            size="sm" 
            className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20"
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {instructions.icon}
              {instructions.title}
            </DialogTitle>
            <DialogDescription>
              Follow these steps to install VIDEC Task Board on your device:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowInstructions(false)}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

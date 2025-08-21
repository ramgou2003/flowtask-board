import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt after a shorter delay for better UX
      setTimeout(() => {
        if (!isInstalled && !sessionStorage.getItem('pwa-install-dismissed')) {
          console.log('📱 Showing install prompt');
          setShowInstallPrompt(true);
        }
      }, 2000); // Reduced from 5000 to 2000
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // For iOS Safari, show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari && !isInstalled) {
      // Show iOS install instructions after a delay
      setTimeout(() => {
        if (!sessionStorage.getItem('ios-install-shown')) {
          setShowInstallPrompt(true);
          sessionStorage.setItem('ios-install-shown', 'true');
        }
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show for iOS even without deferredPrompt
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  // Don't show if no prompt available and not iOS Safari
  if (!showInstallPrompt || (!deferredPrompt && !(isIOS && isSafari))) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2">
      <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Install VIDEC Tasks</CardTitle>
                <CardDescription className="text-xs">
                  Get the full app experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tablet className="h-3 w-3" />
              <span>Perfect for tablets</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span>Works offline</span>
            </div>

            {/* iOS Safari Instructions */}
            {/iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">To install on iOS:</p>
                  <p>1. Tap the Share button (⬆️)</p>
                  <p>2. Scroll down and tap "Add to Home Screen"</p>
                  <p>3. Tap "Add" to confirm</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="w-full text-xs"
                >
                  Got it!
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={!deferredPrompt}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Later
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

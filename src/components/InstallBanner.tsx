import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Check if banner was dismissed
    const bannerDismissed = localStorage.getItem('install-banner-dismissed');
    
    // Show banner if not installed and not dismissed
    if (!isInstalled && !bannerDismissed) {
      // Show after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  const handleInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('ipad') || userAgent.includes('iphone')) {
      // iOS instructions
      alert(`To install VIDEC Task Board on iOS:

1. Tap the Share button (⬆️) at the bottom
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will then appear on your home screen!`);
    } else if (userAgent.includes('android')) {
      // Android instructions
      alert(`To install VIDEC Task Board on Android:

1. Tap the menu (⋮) in your browser
2. Look for "Add to Home screen" or "Install app"
3. Tap to install

The app will then appear on your home screen!`);
    } else {
      // Desktop instructions
      alert(`To install VIDEC Task Board:

1. Look for the install icon in your browser's address bar
2. Or check your browser's menu for "Install" option
3. Follow the prompts to install

The app will be available in your applications!`);
    }
    
    handleDismiss();
  };

  const getInstallText = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('ipad') || userAgent.includes('iphone')) {
      return {
        title: "Install VIDEC Task Board",
        subtitle: "Tap Share (⬆️) → Add to Home Screen",
        icon: <Share className="h-5 w-5" />
      };
    } else {
      return {
        title: "Install VIDEC Task Board",
        subtitle: "Get the full app experience",
        icon: <Download className="h-5 w-5" />
      };
    }
  };

  // Don't show if installed or not visible
  if (isInstalled || !isVisible) {
    return null;
  }

  const installText = getInstallText();

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {installText.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{installText.title}</h3>
            <p className="text-xs text-muted-foreground">{installText.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="text-xs px-3 py-1 h-8"
          >
            <Smartphone className="h-3 w-3 mr-1" />
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

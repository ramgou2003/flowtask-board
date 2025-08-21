import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Download, Smartphone } from 'lucide-react';

export const PWADebug: React.FC = () => {
  const [pwaStatus, setPwaStatus] = useState({
    serviceWorkerSupported: false,
    serviceWorkerRegistered: false,
    manifestSupported: false,
    manifestLoaded: false,
    isStandalone: false,
    isInstallable: false,
    platform: '',
    userAgent: '',
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const status = {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        serviceWorkerRegistered: false,
        manifestSupported: 'serviceWorker' in navigator,
        manifestLoaded: false,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true,
        isInstallable: false,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      };

      // Check service worker registration
      if (status.serviceWorkerSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          status.serviceWorkerRegistered = !!registration;
        } catch (error) {
          console.error('Error checking service worker:', error);
        }
      }

      // Check manifest
      try {
        const response = await fetch('/manifest.json');
        status.manifestLoaded = response.ok;
      } catch (error) {
        console.error('Error loading manifest:', error);
      }

      setPwaStatus(status);
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaStatus(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt result:', outcome);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getInstallInstructions = () => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) {
      return "Chrome: Look for install icon in address bar or use menu → 'Install VIDEC Task Board'";
    } else if (ua.includes('safari') && ua.includes('mobile')) {
      return "Safari iOS: Tap Share button → 'Add to Home Screen'";
    } else if (ua.includes('firefox')) {
      return "Firefox: Use menu → 'Install' or look for install icon";
    } else if (ua.includes('edg')) {
      return "Edge: Look for install icon in address bar or use menu → 'Apps' → 'Install this site as an app'";
    } else {
      return "Look for install option in browser menu or address bar";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          PWA Installation Debug
        </CardTitle>
        <CardDescription>
          Check PWA installation requirements and troubleshoot issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PWA Status Checks */}
        <div className="space-y-2">
          <h3 className="font-semibold">PWA Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon status={pwaStatus.serviceWorkerSupported} />
              <span>Service Worker Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={pwaStatus.serviceWorkerRegistered} />
              <span>Service Worker Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={pwaStatus.manifestLoaded} />
              <span>Manifest Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={window.location.protocol === 'https:'} />
              <span>HTTPS Enabled</span>
            </div>
          </div>
        </div>

        {/* Installation Status */}
        <div className="space-y-2">
          <h3 className="font-semibold">Installation Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={pwaStatus.isStandalone ? "default" : "secondary"}>
              {pwaStatus.isStandalone ? "Already Installed" : "Not Installed"}
            </Badge>
            <Badge variant={pwaStatus.isInstallable ? "default" : "secondary"}>
              {pwaStatus.isInstallable ? "Installable" : "Not Installable"}
            </Badge>
          </div>
        </div>

        {/* Install Button */}
        {deferredPrompt && !pwaStatus.isStandalone && (
          <div className="space-y-2">
            <h3 className="font-semibold">Quick Install</h3>
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install VIDEC Task Board
            </Button>
          </div>
        )}

        {/* Manual Instructions */}
        <div className="space-y-2">
          <h3 className="font-semibold">Manual Installation</h3>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p>{getInstallInstructions()}</p>
          </div>
        </div>

        {/* Troubleshooting */}
        {!pwaStatus.isInstallable && !pwaStatus.isStandalone && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Troubleshooting
            </h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>• Make sure you're using HTTPS (not localhost)</p>
              <p>• Try refreshing the page</p>
              <p>• Check if you've already dismissed the install prompt</p>
              <p>• Some browsers require user interaction before showing install prompt</p>
              <p>• Clear browser cache and reload</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold">Debug Information</summary>
          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
            <p>Platform: {pwaStatus.platform}</p>
            <p>User Agent: {pwaStatus.userAgent}</p>
            <p>Protocol: {window.location.protocol}</p>
            <p>Host: {window.location.host}</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

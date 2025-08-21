// Service Worker Registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Show update notification
const showUpdateNotification = (): void => {
  if (Notification.permission === 'granted') {
    new Notification('VIDEC Task Board Updated', {
      body: 'A new version is available. Refresh to update.',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        {
          action: 'refresh',
          title: 'Refresh Now'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
};

// Check if app is installed
export const isAppInstalled = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  return isStandalone || isInWebAppiOS;
};

// Get device type for better UX
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  if (/ipad|android(?!.*mobile)|tablet/.test(userAgent) || 
      (screenWidth >= 768 && screenWidth <= 1024)) {
    return 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile/.test(userAgent) || 
             screenWidth < 768) {
    return 'mobile';
  } else {
    return 'desktop';
  }
};

// Add to home screen guidance for iOS
export const showIOSInstallInstructions = (): void => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = (window.navigator as any).standalone;
  
  if (isIOS && !isInStandaloneMode) {
    // Show iOS-specific install instructions
    const instructions = `
      To install VIDEC Task Board on your iOS device:
      1. Tap the Share button (square with arrow)
      2. Scroll down and tap "Add to Home Screen"
      3. Tap "Add" to confirm
    `;
    
    // You could show this in a modal or toast
    console.log(instructions);
  }
};

// Background sync for offline actions
export const registerBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
    });
  }
};

// Cache management
export const clearAppCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('App cache cleared');
  }
};

// Check for app updates
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return registration.waiting !== null;
    }
  }
  return false;
};

// Apply app update
export const applyUpdate = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
};

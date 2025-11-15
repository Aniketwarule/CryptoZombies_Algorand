// Service Worker Registration and Management
interface ServiceWorkerConfig {
  swUrl: string;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private updateAvailable = false;

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
    this.setupOnlineOfflineListeners();
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Manager] Service Workers not supported');
      return null;
    }

    try {
      console.log('[SW Manager] Registering service worker...');
      
      this.registration = await navigator.serviceWorker.register(this.config.swUrl, {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      console.log('[SW Manager] Service worker registered successfully');

      // Handle different registration states
      if (this.registration.installing) {
        console.log('[SW Manager] Service worker installing...');
        this.trackServiceWorkerState(this.registration.installing);
      } else if (this.registration.waiting) {
        console.log('[SW Manager] Service worker waiting...');
        this.handleWaitingServiceWorker();
      } else if (this.registration.active) {
        console.log('[SW Manager] Service worker active');
        this.config.onSuccess?.(this.registration);
      }

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        console.log('[SW Manager] Update found');
        const newWorker = this.registration!.installing;
        if (newWorker) {
          this.trackServiceWorkerState(newWorker);
        }
      });

      // Check for updates every 30 seconds when app is active
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.checkForUpdates();
        }
      }, 30000);

      return this.registration;
    } catch (error) {
      console.error('[SW Manager] Service worker registration failed:', error);
      return null;
    }
  }

  private trackServiceWorkerState(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      console.log('[SW Manager] Service worker state changed:', worker.state);
      
      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW Manager] New service worker available');
            this.updateAvailable = true;
            this.config.onUpdate?.(this.registration!);
          } else {
            // Service worker installed for the first time
            console.log('[SW Manager] Service worker installed for the first time');
            this.config.onSuccess?.(this.registration!);
          }
          break;
        case 'activated':
          console.log('[SW Manager] Service worker activated');
          break;
        case 'redundant':
          console.log('[SW Manager] Service worker became redundant');
          break;
      }
    });
  }

  private handleWaitingServiceWorker(): void {
    this.updateAvailable = true;
    this.config.onUpdate?.(this.registration!);
  }

  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('[SW Manager] Failed to check for updates:', error);
    }
  }

  async activateUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      console.warn('[SW Manager] No waiting service worker to activate');
      return;
    }

    // Send message to waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Wait for the new service worker to take control
    await new Promise<void>((resolve) => {
      const handleControllerChange = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        resolve();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    });

    // Reload the page to use the new service worker
    window.location.reload();
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[SW Manager] Service worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('[SW Manager] Failed to unregister service worker:', error);
      return false;
    }
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      console.log('[SW Manager] App back online');
      this.config.onOnline?.();
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      console.log('[SW Manager] App went offline');
      this.config.onOffline?.();
    });
  }

  private async syncWhenOnline(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      // Register background sync if supported
      if ('sync' in this.registration) {
        await (this.registration as any).sync.register('progress-sync');
        console.log('[SW Manager] Background sync registered');
      }
    } catch (error) {
      console.error('[SW Manager] Background sync registration failed:', error);
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[SW Manager] Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[SW Manager] Notification permission:', permission);
    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('[SW Manager] No service worker registration');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      console.log('[SW Manager] Push subscription created');
      return subscription;
    } catch (error) {
      console.error('[SW Manager] Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get cache storage info
  async getCacheInfo(): Promise<{name: string, size: number}[]> {
    if (!('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );

      return cacheInfo;
    } catch (error) {
      console.error('[SW Manager] Failed to get cache info:', error);
      return [];
    }
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW Manager] All caches cleared');
    } catch (error) {
      console.error('[SW Manager] Failed to clear caches:', error);
    }
  }
}

// Default configuration
const defaultConfig: ServiceWorkerConfig = {
  swUrl: '/sw.js',
  onUpdate: (_registration) => {
    console.log('[SW Manager] Update available');
    // Show update notification to user
    if (window.confirm('A new version is available. Would you like to update now?')) {
      // Reload to activate new service worker
      window.location.reload();
    }
  },
  onSuccess: (_registration) => {
    console.log('[SW Manager] Service worker registered successfully');
  },
  onOffline: () => {
    console.log('[SW Manager] App is now offline');
    // Show offline notification
    const event = new CustomEvent('app-offline');
    window.dispatchEvent(event);
  },
  onOnline: () => {
    console.log('[SW Manager] App is back online');
    // Show online notification
    const event = new CustomEvent('app-online');
    window.dispatchEvent(event);
  }
};

// Create global service worker manager instance
export const swManager = new ServiceWorkerManager(defaultConfig);

// Initialize service worker when module loads
if (process.env.NODE_ENV === 'production') {
  swManager.register().catch(console.error);
}

export default ServiceWorkerManager;
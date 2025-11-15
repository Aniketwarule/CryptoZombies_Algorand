// Type-safe localStorage utilities for AlgoZombies
export type StorageKey = 
  | 'algozombies-progress'
  | 'algozombies-wallet'
  | 'algozombies-settings'
  | 'algozombies-theme'
  | 'algozombies-user-data';

export interface StorageData {
  'algozombies-progress': Record<string, {
    completed: boolean;
    score: number;
    completedAt?: Date;
  }>;
  'algozombies-wallet': {
    address: string;
    balance: number;
    lastConnected: Date;
  };
  'algozombies-settings': {
    theme: 'dark' | 'light';
    autoSave: boolean;
    notifications: boolean;
    language: string;
  };
  'algozombies-theme': 'dark' | 'light';
  'algozombies-user-data': {
    username: string;
    email?: string;
    preferences: Record<string, any>;
  };
}

class Storage {
  private prefix = 'algozombies_';

  /**
   * Get an item from localStorage with type safety
   */
  get<K extends StorageKey>(key: K): StorageData[K] | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) return null;
      
      const parsed = JSON.parse(item);
      
      // Handle Date objects
      if (key === 'algozombies-progress') {
        Object.keys(parsed).forEach(lessonId => {
          if (parsed[lessonId].completedAt) {
            parsed[lessonId].completedAt = new Date(parsed[lessonId].completedAt);
          }
        });
      }
      
      if (key === 'algozombies-wallet' && parsed.lastConnected) {
        parsed.lastConnected = new Date(parsed.lastConnected);
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set an item in localStorage with type safety
   */
  set<K extends StorageKey>(key: K, value: StorageData[K]): boolean {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  remove(key: StorageKey): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all AlgoZombies data from localStorage
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getUsageInfo(): { used: number; total: number; percentage: number } {
    if (!this.isAvailable()) {
      return { used: 0, total: 0, percentage: 0 };
    }

    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers limit localStorage to ~5MB
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * Backup all data to a JSON string
   */
  backup(): string {
    const data: Partial<StorageData> = {};
    const keys: StorageKey[] = [
      'algozombies-progress',
      'algozombies-wallet',
      'algozombies-settings',
      'algozombies-theme',
      'algozombies-user-data'
    ];

    keys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return JSON.stringify(data, null, 2);
  }

  /**
   * Restore data from a backup JSON string
   */
  restore(backupData: string): boolean {
    try {
      const data = JSON.parse(backupData);
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isValidKey(key)) {
          this.set(key as StorageKey, value);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  private isValidKey(key: string): key is StorageKey {
    const validKeys: StorageKey[] = [
      'algozombies-progress',
      'algozombies-wallet',
      'algozombies-settings',
      'algozombies-theme',
      'algozombies-user-data'
    ];
    return validKeys.includes(key as StorageKey);
  }
}

// Export singleton instance
export const storage = new Storage();

// Utility hooks for React components
export const useLocalStorage = <K extends StorageKey>(
  key: K,
  defaultValue: StorageData[K]
) => {
  const [value, setValue] = React.useState<StorageData[K]>(() => {
    return storage.get(key) ?? defaultValue;
  });

  const setStoredValue = (newValue: StorageData[K]) => {
    setValue(newValue);
    storage.set(key, newValue);
  };

  return [value, setStoredValue] as const;
};
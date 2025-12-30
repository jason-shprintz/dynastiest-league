/**
 * IndexedDB Cache Utility
 * Provides a simple key-value cache using IndexedDB for large data storage
 * Used for caching Sleeper players data which exceeds localStorage limits
 */

const DB_NAME = "sleeper_cache";
const DB_VERSION = 1;
const STORE_NAME = "cache";

interface CacheEntry {
  key: string;
  data: string; // JSON serialized data
  timestamp: number;
}

/**
 * Open or create the IndexedDB database
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });
};

interface ParsedCacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data from IndexedDB
 * @param key - The cache key
 * @returns The cached entry with parsed data or null if not found
 */
export const getCachedData = async <T>(
  key: string
): Promise<ParsedCacheEntry<T> | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error("Failed to get cached data"));
      };

      request.onsuccess = () => {
        const result = request.result as CacheEntry | undefined;
        if (result) {
          try {
            const parsedData = JSON.parse(result.data) as T;
            resolve({ data: parsedData, timestamp: result.timestamp });
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.error("IndexedDB get error:", err);
    return null;
  }
};

/**
 * Save data to IndexedDB cache
 * @param key - The cache key
 * @param data - The data to cache
 * @param timestamp - The timestamp when data was fetched
 */
export const setCachedData = async <T>(
  key: string,
  data: T,
  timestamp: number
): Promise<void> => {
  try {
    const db = await openDatabase();
    const serializedData = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const entry: CacheEntry = { key, data: serializedData, timestamp };
      const request = store.put(entry);

      request.onerror = () => {
        reject(new Error("Failed to save cached data"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.error("IndexedDB set error:", err);
  }
};

/**
 * Delete cached data from IndexedDB
 * @param key - The cache key to delete
 */
export const deleteCachedData = async (key: string): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error("Failed to delete cached data"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.error("IndexedDB delete error:", err);
  }
};

/**
 * Clear all cached data from IndexedDB
 */
export const clearCache = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error("Failed to clear cache"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.error("IndexedDB clear error:", err);
  }
};

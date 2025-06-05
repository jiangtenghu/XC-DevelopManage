// 本地缓存管理工具
export class LocalCache {
  private static readonly CACHE_PREFIX = 'casemanager_';
  
  // 缓存键名
  static readonly KEYS = {
    ITERATIONS: 'iterations',
    PENDING_ITERATIONS: 'pending_iterations',
    PROJECTS: 'projects',
    TEST_CASES: 'test_cases',
    TEST_PLANS: 'test_plans',
  };

  // 设置缓存
  static set(key: string, value: any, expiryMinutes?: number): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cacheData = {
        value,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : null
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('缓存设置失败:', error);
    }
  }

  // 获取缓存
  static get<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cacheStr = localStorage.getItem(cacheKey);
      
      if (!cacheStr) return null;
      
      const cacheData = JSON.parse(cacheStr);
      
      // 检查是否过期
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        this.remove(key);
        return null;
      }
      
      return cacheData.value as T;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  }

  // 删除缓存
  static remove(key: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('缓存删除失败:', error);
    }
  }

  // 清空所有缓存
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('缓存清空失败:', error);
    }
  }

  // 获取所有缓存键
  static getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .map(key => key.replace(this.CACHE_PREFIX, ''));
    } catch (error) {
      console.error('获取缓存键失败:', error);
      return [];
    }
  }

  // 获取缓存大小（字节）
  static getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      });
      return size;
    } catch (error) {
      console.error('获取缓存大小失败:', error);
      return 0;
    }
  }
}

// 待同步数据管理
export class PendingSyncManager {
  private static readonly SYNC_KEY = 'pending_sync_operations';

  // 添加待同步操作
  static addPendingOperation(operation: {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: string;
    data: any;
    timestamp: number;
  }): void {
    try {
      const operations = this.getPendingOperations();
      operations.push(operation);
      LocalCache.set(this.SYNC_KEY, operations);
    } catch (error) {
      console.error('添加待同步操作失败:', error);
    }
  }

  // 获取待同步操作
  static getPendingOperations(): any[] {
    return LocalCache.get<any[]>(this.SYNC_KEY) || [];
  }

  // 删除已同步操作
  static removePendingOperation(id: string): void {
    try {
      const operations = this.getPendingOperations();
      const filtered = operations.filter(op => op.id !== id);
      LocalCache.set(this.SYNC_KEY, filtered);
    } catch (error) {
      console.error('删除待同步操作失败:', error);
    }
  }

  // 清空所有待同步操作
  static clearPendingOperations(): void {
    LocalCache.remove(this.SYNC_KEY);
  }

  // 获取待同步操作数量
  static getPendingCount(): number {
    return this.getPendingOperations().length;
  }
}

// 导出工具类
const cacheUtils = {
  LocalCache,
  PendingSyncManager
};

export default cacheUtils;

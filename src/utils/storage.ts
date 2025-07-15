import { STORAGE_KEYS } from '@/constants'

// 本地存储工具类
export class LocalStorage {
  // 设置数据
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('Error setting localStorage item:', error)
    }
  }

  // 获取数据
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Error getting localStorage item:', error)
      return defaultValue || null
    }
  }

  // 删除数据
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing localStorage item:', error)
    }
  }

  // 清空所有数据
  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // 获取所有键
  static getAllKeys(): string[] {
    try {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      console.error('Error getting localStorage keys:', error)
      return []
    }
  }

  // 检查键是否存在
  static hasKey(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error('Error checking localStorage key:', error)
      return false
    }
  }
}

// 会话存储工具类
export class SessionStorage {
  // 设置数据
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('Error setting sessionStorage item:', error)
    }
  }

  // 获取数据
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Error getting sessionStorage item:', error)
      return defaultValue || null
    }
  }

  // 删除数据
  static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing sessionStorage item:', error)
    }
  }

  // 清空所有数据
  static clear(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
  }
}

// 用户设置存储工具
export const UserSettings = {
  // 获取主题设置
  getTheme(): string {
    return LocalStorage.getItem<string>(STORAGE_KEYS.THEME, 'light') || 'light'
  },

  // 设置主题
  setTheme(theme: string): void {
    LocalStorage.setItem(STORAGE_KEYS.THEME, theme)
  },

  // 获取语言设置
  getLanguage(): string {
    return LocalStorage.getItem<string>(STORAGE_KEYS.LANGUAGE, 'zh-CN') || 'zh-CN'
  },

  // 设置语言
  setLanguage(language: string): void {
    LocalStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
  },

  // 获取货币设置
  getCurrency(): string {
    return LocalStorage.getItem<string>(STORAGE_KEYS.CURRENCY, 'CNY') || 'CNY'
  },

  // 设置货币
  setCurrency(currency: string): void {
    LocalStorage.setItem(STORAGE_KEYS.CURRENCY, currency)
  },

  // 获取快速金额
  getQuickAmounts(): number[] {
    return LocalStorage.getItem<number[]>(STORAGE_KEYS.QUICK_AMOUNTS, [10, 20, 50, 100, 200, 500]) || [10, 20, 50, 100, 200, 500]
  },

  // 设置快速金额
  setQuickAmounts(amounts: number[]): void {
    LocalStorage.setItem(STORAGE_KEYS.QUICK_AMOUNTS, amounts)
  },

  // 获取默认账户
  getDefaultAccount(): string {
    return LocalStorage.getItem<string>(STORAGE_KEYS.DEFAULT_ACCOUNT, '') || ''
  },

  // 设置默认账户
  setDefaultAccount(accountId: string): void {
    LocalStorage.setItem(STORAGE_KEYS.DEFAULT_ACCOUNT, accountId)
  },

  // 获取默认分类
  getDefaultCategory(): Record<string, string> {
    return LocalStorage.getItem<Record<string, string>>(STORAGE_KEYS.DEFAULT_CATEGORY, {}) || {}
  },

  // 设置默认分类
  setDefaultCategory(type: string, categoryId: string): void {
    const categories = this.getDefaultCategory()
    categories[type] = categoryId
    LocalStorage.setItem(STORAGE_KEYS.DEFAULT_CATEGORY, categories)
  },

  // 获取最后备份时间
  getLastBackupTime(): string {
    return LocalStorage.getItem<string>(STORAGE_KEYS.LAST_BACKUP, '') || ''
  },

  // 设置最后备份时间
  setLastBackupTime(time: string): void {
    LocalStorage.setItem(STORAGE_KEYS.LAST_BACKUP, time)
  },

  // 获取所有用户设置
  getAllSettings(): Record<string, any> {
    return {
      theme: this.getTheme(),
      language: this.getLanguage(),
      currency: this.getCurrency(),
      quickAmounts: this.getQuickAmounts(),
      defaultAccount: this.getDefaultAccount(),
      defaultCategory: this.getDefaultCategory(),
      lastBackupTime: this.getLastBackupTime()
    }
  },

  // 重置所有设置
  resetAllSettings(): void {
    LocalStorage.removeItem(STORAGE_KEYS.THEME)
    LocalStorage.removeItem(STORAGE_KEYS.LANGUAGE)
    LocalStorage.removeItem(STORAGE_KEYS.CURRENCY)
    LocalStorage.removeItem(STORAGE_KEYS.QUICK_AMOUNTS)
    LocalStorage.removeItem(STORAGE_KEYS.DEFAULT_ACCOUNT)
    LocalStorage.removeItem(STORAGE_KEYS.DEFAULT_CATEGORY)
    LocalStorage.removeItem(STORAGE_KEYS.LAST_BACKUP)
  }
}

// 检查存储支持
export const checkStorageSupport = (): boolean => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    console.error('Storage not supported:', error)
    return false
  }
}

// 获取存储使用情况
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  try {
    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // 假设总容量为5MB
    const total = 5 * 1024 * 1024
    const percentage = (used / total) * 100

    return { used, total, percentage }
  } catch (error) {
    console.error('Error getting storage usage:', error)
    return { used: 0, total: 0, percentage: 0 }
  }
}

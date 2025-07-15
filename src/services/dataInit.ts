import { initializeDatabase } from './database'
import { categoryRepository, accountRepository } from './database/repositories'
import { DEFAULT_CATEGORIES } from './../constants/categories'
import { DEFAULT_ACCOUNTS } from './../constants/accounts'
import { LocalStorage } from '@/utils'

// 初始化状态键
const INIT_STATUS_KEY = 'mm_init_status'

// 初始化状态
interface InitStatus {
  isInitialized: boolean
  version: string
  initDate: string
  categories: boolean
  accounts: boolean
}

// 数据初始化服务
export class DataInitService {
  private static instance: DataInitService

  private constructor() {}

  static getInstance(): DataInitService {
    if (!DataInitService.instance) {
      DataInitService.instance = new DataInitService()
    }
    return DataInitService.instance
  }

  // 检查是否已初始化
  async isInitialized(): Promise<boolean> {
    const status = this.getInitStatus()
    return status.isInitialized
  }

  // 初始化应用数据
  async initializeApp(): Promise<void> {
    try {
      console.log('开始初始化应用数据...')

      // 1. 初始化数据库
      await initializeDatabase()

      // 2. 检查是否已初始化
      const isInit = await this.isInitialized()
      if (isInit) {
        console.log('应用数据已初始化')
        return
      }

      // 3. 初始化默认数据
      await this.initializeDefaultData()

      // 4. 标记初始化完成
      this.markInitialized()

      console.log('应用数据初始化完成')
    } catch (error) {
      console.error('应用数据初始化失败:', error)
      throw error
    }
  }

  // 初始化默认数据
  private async initializeDefaultData(): Promise<void> {
    await Promise.all([
      this.initializeDefaultCategories(),
      this.initializeDefaultAccounts()
    ])
  }

  // 初始化默认分类
  private async initializeDefaultCategories(): Promise<void> {
    try {
      console.log('正在初始化默认分类...')

      // 检查是否已有分类
      const existingCategories = await categoryRepository.findAll()
      if (existingCategories.length > 0) {
        console.log('分类已存在，跳过初始化')
        return
      }

      // 创建默认分类
      const categoriesToCreate = DEFAULT_CATEGORIES.map((category, index) => ({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        order: index,
        isSystem: true,
        isEnabled: true
      }))

      await categoryRepository.bulkCreate(categoriesToCreate)
      console.log(`创建了 ${categoriesToCreate.length} 个默认分类`)
    } catch (error) {
      console.error('初始化默认分类失败:', error)
      throw error
    }
  }

  // 初始化默认账户
  private async initializeDefaultAccounts(): Promise<void> {
    try {
      console.log('正在初始化默认账户...')

      // 检查是否已有账户
      const existingAccounts = await accountRepository.findAll()
      if (existingAccounts.length > 0) {
        console.log('账户已存在，跳过初始化')
        return
      }

      // 创建默认账户
      const accountsToCreate = DEFAULT_ACCOUNTS.map((account, index) => ({
        name: account.name,
        type: account.type,
        icon: account.icon,
        color: account.color,
        balance: 0,
        order: index,
        isEnabled: true
      }))

      await accountRepository.bulkCreate(accountsToCreate)
      console.log(`创建了 ${accountsToCreate.length} 个默认账户`)
    } catch (error) {
      console.error('初始化默认账户失败:', error)
      throw error
    }
  }

  // 获取初始化状态
  private getInitStatus(): InitStatus {
    const defaultStatus: InitStatus = {
      isInitialized: false,
      version: '1.0.0',
      initDate: '',
      categories: false,
      accounts: false
    }

    return LocalStorage.getItem<InitStatus>(INIT_STATUS_KEY, defaultStatus) || defaultStatus
  }

  // 标记初始化完成
  private markInitialized(): void {
    const status: InitStatus = {
      isInitialized: true,
      version: '1.0.0',
      initDate: new Date().toISOString(),
      categories: true,
      accounts: true
    }

    LocalStorage.setItem(INIT_STATUS_KEY, status)
  }

  // 重置初始化状态
  async resetInitialization(): Promise<void> {
    LocalStorage.removeItem(INIT_STATUS_KEY)
    console.log('初始化状态已重置')
  }

  // 重新初始化
  async reinitialize(): Promise<void> {
    await this.resetInitialization()
    await this.initializeApp()
  }

  // 检查数据完整性
  async checkDataIntegrity(): Promise<{
    categories: { count: number; hasDefault: boolean }
    accounts: { count: number; hasDefault: boolean }
    status: 'healthy' | 'needs_repair' | 'needs_init'
  }> {
    try {
      const categories = await categoryRepository.findAll()
      const accounts = await accountRepository.findAll()

      const categoriesHealth = {
        count: categories.length,
        hasDefault: categories.some((c: any) => c.isSystem)
      }

      const accountsHealth = {
        count: accounts.length,
        hasDefault: accounts.length > 0
      }

      let status: 'healthy' | 'needs_repair' | 'needs_init' = 'healthy'

      if (categories.length === 0 || accounts.length === 0) {
        status = 'needs_init'
      } else if (!categoriesHealth.hasDefault) {
        status = 'needs_repair'
      }

      return {
        categories: categoriesHealth,
        accounts: accountsHealth,
        status
      }
    } catch (error) {
      console.error('检查数据完整性失败:', error)
      return {
        categories: { count: 0, hasDefault: false },
        accounts: { count: 0, hasDefault: false },
        status: 'needs_init'
      }
    }
  }

  // 修复数据
  async repairData(): Promise<void> {
    const integrity = await this.checkDataIntegrity()

    if (integrity.status === 'needs_init') {
      await this.initializeApp()
    } else if (integrity.status === 'needs_repair') {
      if (!integrity.categories.hasDefault) {
        await this.initializeDefaultCategories()
      }
    }
  }
}

// 导出单例实例
export const dataInitService = DataInitService.getInstance()

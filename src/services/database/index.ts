import Dexie from 'dexie'
import type { Record } from '@/types/record'
import type { Category } from '@/types/category'
import type { Account } from '@/types/account'
import type { Budget } from '@/types/budget'
import { DATABASE_CONFIG } from '@/constants'

// 数据库设置接口
interface Settings {
  id: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  updatedAt: string
}

// 数据库类
class MochiMoneyDB extends Dexie {
  records!: Dexie.Table<Record, string>
  categories!: Dexie.Table<Category, string>
  accounts!: Dexie.Table<Account, string>
  budgets!: Dexie.Table<Budget, string>
  settings!: Dexie.Table<Settings, string>

  constructor() {
    super(DATABASE_CONFIG.name)

    this.version(DATABASE_CONFIG.version).stores({
      records: 'id, type, categoryId, accountId, date, time, amount, createdAt, updatedAt, isDeleted',
      categories: 'id, name, type, parentId, isSystem, isEnabled, order, createdAt, updatedAt',
      accounts: 'id, name, type, isEnabled, order, createdAt, updatedAt',
      budgets: 'id, name, type, targetId, period, startDate, endDate, isEnabled, createdAt, updatedAt',
      settings: 'id, key, updatedAt'
    })

    // 数据库打开时的钩子
    this.on('ready', () => {
      console.log('数据库已打开')
    })

    this.on('versionchange', () => {
      console.log('数据库版本变化，需要重新加载页面')
      // 可以在这里处理版本变化
    })
  }
}

// 创建数据库实例
export const db = new MochiMoneyDB()

// 数据库操作基类
export class BaseRepository<T extends { id: string; createdAt: string; updatedAt: string }> {
  protected table: Dexie.Table<T, string>

  constructor(table: Dexie.Table<T, string>) {
    this.table = table
  }

  // 创建记录
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString()
    const id = this.generateId()

    const record = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    } as T

    await this.table.add(record)
    return record
  }

  // 根据ID获取记录
  async findById(id: string): Promise<T | undefined> {
    return await this.table.get(id)
  }

  // 获取所有记录
  async findAll(): Promise<T[]> {
    return await this.table.toArray()
  }

  // 更新记录
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | undefined> {
    const now = new Date().toISOString()
    const updateData = { ...data, updatedAt: now }

    await this.table.update(id, updateData as any)
    return await this.findById(id)
  }

  // 删除记录
  async delete(id: string): Promise<void> {
    await this.table.delete(id)
  }

  // 批量删除
  async deleteMany(ids: string[]): Promise<void> {
    await this.table.bulkDelete(ids)
  }

  // 计数
  async count(): Promise<number> {
    return await this.table.count()
  }

  // 分页查询
  async paginate(page: number, pageSize: number): Promise<{ items: T[]; total: number }> {
    const total = await this.table.count()
    const items = await this.table
      .orderBy('createdAt')
      .reverse()
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    return { items, total }
  }

  // 生成ID
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// 数据库初始化
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open()
    console.log('数据库初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

// 数据库关闭
export const closeDatabase = async (): Promise<void> => {
  try {
    await db.close()
    console.log('数据库已关闭')
  } catch (error) {
    console.error('数据库关闭失败:', error)
    throw error
  }
}

// 清空数据库
export const clearDatabase = async (): Promise<void> => {
  try {
    await db.transaction('rw', [db.records, db.categories, db.accounts, db.budgets, db.settings], async () => {
      await db.records.clear()
      await db.categories.clear()
      await db.accounts.clear()
      await db.budgets.clear()
      await db.settings.clear()
    })
    console.log('数据库已清空')
  } catch (error) {
    console.error('清空数据库失败:', error)
    throw error
  }
}

// 数据库健康检查
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.open()
    const recordCount = await db.records.count()
    const categoryCount = await db.categories.count()
    const accountCount = await db.accounts.count()

    console.log('数据库健康检查:', {
      records: recordCount,
      categories: categoryCount,
      accounts: accountCount
    })

    return true
  } catch (error) {
    console.error('数据库健康检查失败:', error)
    return false
  }
}

// 数据库备份
export const backupDatabase = async (): Promise<any> => {
  try {
    const data = {
      version: DATABASE_CONFIG.version,
      timestamp: new Date().toISOString(),
      records: await db.records.toArray(),
      categories: await db.categories.toArray(),
      accounts: await db.accounts.toArray(),
      budgets: await db.budgets.toArray(),
      settings: await db.settings.toArray()
    }

    return data
  } catch (error) {
    console.error('数据库备份失败:', error)
    throw error
  }
}

// 数据库恢复
export const restoreDatabase = async (backupData: any): Promise<void> => {
  try {
    await db.transaction('rw', [db.records, db.categories, db.accounts, db.budgets, db.settings], async () => {
      // 清空现有数据
      await db.records.clear()
      await db.categories.clear()
      await db.accounts.clear()
      await db.budgets.clear()
      await db.settings.clear()

      // 恢复数据
      if (backupData.records) {
        await db.records.bulkAdd(backupData.records)
      }
      if (backupData.categories) {
        await db.categories.bulkAdd(backupData.categories)
      }
      if (backupData.accounts) {
        await db.accounts.bulkAdd(backupData.accounts)
      }
      if (backupData.budgets) {
        await db.budgets.bulkAdd(backupData.budgets)
      }
      if (backupData.settings) {
        await db.settings.bulkAdd(backupData.settings)
      }
    })

    console.log('数据库恢复成功')
  } catch (error) {
    console.error('数据库恢复失败:', error)
    throw error
  }
}

export default db

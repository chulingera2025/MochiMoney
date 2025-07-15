import { db } from './database'
import { accountRepository } from './database/repositories'
import { LocalStorage } from '@/utils'
import type { Migration } from '../types/database'

// 迁移状态键
const MIGRATION_STATUS_KEY = 'mm_migration_status'

// 迁移状态
interface MigrationStatus {
  currentVersion: number
  migrations: { version: number; appliedAt: string }[]
}

// 数据迁移服务
export class DataMigrationService {
  private static instance: DataMigrationService
  private migrations: Migration[] = []

  private constructor() {
    this.registerMigrations()
  }

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService()
    }
    return DataMigrationService.instance
  }

  // 注册迁移
  private registerMigrations(): void {
    // 迁移版本 1: 初始化数据库
    this.migrations.push({
      version: 1,
      description: '初始化数据库结构',
      up: async (database: IDBDatabase) => {
        console.log('执行迁移 v1: 初始化数据库结构')
        // 数据库结构在 Dexie 中自动创建，这里可以做一些初始化工作
      },
      down: async (database: IDBDatabase) => {
        console.log('回滚迁移 v1: 清空数据库')
        // 清空所有数据
      }
    })

    // 迁移版本 2: 修复账户isEnabled字段类型
    this.migrations.push({
      version: 2,
      description: '修复账户isEnabled字段类型问题',
      up: async (database: IDBDatabase) => {
        console.log('执行迁移 v2: 修复账户isEnabled字段类型')
        await accountRepository.migrateIsEnabledField()
      },
      down: async (database: IDBDatabase) => {
        console.log('回滚迁移 v2: isEnabled字段类型修复回滚')
        // 无需回滚操作
      }
    })

    // 未来的迁移可以在这里添加
    // 例如：
    // this.migrations.push({
    //   version: 3,
    //   description: '添加新字段',
    //   up: async (database: IDBDatabase) => {
    //     // 添加新字段的逻辑
    //   },
    //   down: async (database: IDBDatabase) => {
    //     // 回滚新字段的逻辑
    //   }
    // })
  }

  // 获取当前数据库版本
  getCurrentVersion(): number {
    const status = this.getMigrationStatus()
    return status.currentVersion
  }

  // 获取最新迁移版本
  getLatestVersion(): number {
    return Math.max(...this.migrations.map(m => m.version), 0)
  }

  // 检查是否需要迁移
  needsMigration(): boolean {
    const currentVersion = this.getCurrentVersion()
    const latestVersion = this.getLatestVersion()
    return currentVersion < latestVersion
  }

  // 执行迁移
  async migrate(): Promise<void> {
    if (!this.needsMigration()) {
      console.log('数据库已是最新版本，无需迁移')
      return
    }

    const currentVersion = this.getCurrentVersion()
    const latestVersion = this.getLatestVersion()

    console.log(`开始迁移数据库从版本 ${currentVersion} 到版本 ${latestVersion}`)

    try {
      // 获取需要执行的迁移
      const migrationsToRun = this.migrations.filter(m => m.version > currentVersion)

      // 按版本号排序
      migrationsToRun.sort((a, b) => a.version - b.version)

      // 依次执行迁移
      for (const migration of migrationsToRun) {
        await this.runMigration(migration)
      }

      console.log('数据库迁移完成')
    } catch (error) {
      console.error('数据库迁移失败:', error)
      throw error
    }
  }

  // 执行单个迁移
  private async runMigration(migration: Migration): Promise<void> {
    try {
      console.log(`执行迁移 v${migration.version}: ${migration.description}`)

      // 等待数据库打开
      await db.open()

      // 执行迁移
      await migration.up(db.backendDB())

      // 记录迁移状态
      this.recordMigration(migration.version)

      console.log(`迁移 v${migration.version} 完成`)
    } catch (error) {
      console.error(`迁移 v${migration.version} 失败:`, error)
      throw error
    }
  }

  // 回滚迁移
  async rollback(targetVersion: number): Promise<void> {
    const currentVersion = this.getCurrentVersion()

    if (targetVersion >= currentVersion) {
      console.log('目标版本不能大于或等于当前版本')
      return
    }

    console.log(`开始回滚数据库从版本 ${currentVersion} 到版本 ${targetVersion}`)

    try {
      // 获取需要回滚的迁移
      const migrationsToRollback = this.migrations.filter(
        m => m.version > targetVersion && m.version <= currentVersion
      )

      // 按版本号倒序排序
      migrationsToRollback.sort((a, b) => b.version - a.version)

      // 依次回滚迁移
      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration)
      }

      console.log('数据库回滚完成')
    } catch (error) {
      console.error('数据库回滚失败:', error)
      throw error
    }
  }

  // 回滚单个迁移
  private async rollbackMigration(migration: Migration): Promise<void> {
    try {
      console.log(`回滚迁移 v${migration.version}: ${migration.description}`)

      // 等待数据库打开
      await db.open()

      // 执行回滚
      await migration.down(db.backendDB())

      // 移除迁移记录
      this.removeMigrationRecord(migration.version)

      console.log(`迁移 v${migration.version} 回滚完成`)
    } catch (error) {
      console.error(`迁移 v${migration.version} 回滚失败:`, error)
      throw error
    }
  }

  // 获取迁移状态
  private getMigrationStatus(): MigrationStatus {
    const defaultStatus: MigrationStatus = {
      currentVersion: 0,
      migrations: []
    }

    return LocalStorage.getItem<MigrationStatus>(MIGRATION_STATUS_KEY, defaultStatus) || defaultStatus
  }

  // 记录迁移
  private recordMigration(version: number): void {
    const status = this.getMigrationStatus()

    // 添加迁移记录
    status.migrations.push({
      version,
      appliedAt: new Date().toISOString()
    })

    // 更新当前版本
    status.currentVersion = Math.max(status.currentVersion, version)

    // 保存状态
    LocalStorage.setItem(MIGRATION_STATUS_KEY, status)
  }

  // 移除迁移记录
  private removeMigrationRecord(version: number): void {
    const status = this.getMigrationStatus()

    // 移除迁移记录
    status.migrations = status.migrations.filter(m => m.version !== version)

    // 更新当前版本
    status.currentVersion = Math.max(
      ...status.migrations.map(m => m.version),
      0
    )

    // 保存状态
    LocalStorage.setItem(MIGRATION_STATUS_KEY, status)
  }

  // 获取迁移历史
  getMigrationHistory(): { version: number; appliedAt: string }[] {
    const status = this.getMigrationStatus()
    return status.migrations.sort((a, b) => a.version - b.version)
  }

  // 重置迁移状态
  resetMigrationStatus(): void {
    LocalStorage.removeItem(MIGRATION_STATUS_KEY)
    console.log('迁移状态已重置')
  }

  // 验证数据完整性
  async validateDataIntegrity(): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 检查数据库连接
      await db.open()

      // 检查表是否存在
      const tables = ['records', 'categories', 'accounts', 'budgets', 'settings']
      for (const tableName of tables) {
        try {
          const table = (db as any)[tableName]
          await table.limit(1).toArray()
        } catch (error) {
          errors.push(`表 ${tableName} 不存在或无法访问`)
        }
      }

      // 检查数据完整性
      const recordCount = await db.records.count()
      const categoryCount = await db.categories.count()
      const accountCount = await db.accounts.count()

      if (recordCount > 0 && categoryCount === 0) {
        errors.push('存在记录但没有分类数据')
      }

      if (recordCount > 0 && accountCount === 0) {
        errors.push('存在记录但没有账户数据')
      }

      // 检查外键完整性
      const categoryIds = (await db.categories.toArray()).map(c => c.id)
      const invalidRecords = await db.records
        .where('categoryId')
        .noneOf(categoryIds)
        .count()

      if (invalidRecords > 0) {
        warnings.push(`发现 ${invalidRecords} 条记录的分类ID无效`)
      }

      const accountIds = (await db.accounts.toArray()).map(a => a.id)
      const invalidAccountRecords = await db.records
        .where('accountId')
        .noneOf(accountIds)
        .count()

      if (invalidAccountRecords > 0) {
        warnings.push(`发现 ${invalidAccountRecords} 条记录的账户ID无效`)
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      errors.push(`数据完整性检查失败: ${error}`)
      return {
        valid: false,
        errors,
        warnings
      }
    }
  }
}

// 导出单例实例
export const dataMigrationService = DataMigrationService.getInstance()

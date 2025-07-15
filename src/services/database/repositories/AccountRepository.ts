import { db, BaseRepository } from '../index'
import type { Account, AccountQueryParams, AccountStats, AccountType } from '@/types/account'

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super(db.accounts)
  }

  // 根据类型查询账户
  async findByType(type: AccountType): Promise<Account[]> {
    return await this.table
      .where('type')
      .equals(type)
      .and(account => Boolean(account.isEnabled))
      .sortBy('order')
  }

  // 获取启用的账户
  async findEnabled(): Promise<Account[]> {
    return await this.table
      .filter(account => Boolean(account.isEnabled))
      .sortBy('order')
  }

  // 复合查询
  async findByQuery(params: AccountQueryParams): Promise<Account[]> {
    let collection = this.table.toCollection()

    if (params.type) {
      collection = collection.and(account => account.type === params.type)
    }

    if (params.isEnabled !== undefined) {
      collection = collection.and(account => Boolean(account.isEnabled) === Boolean(params.isEnabled))
    }

    if (params.keyword) {
      collection = collection.and(account =>
        account.name.includes(params.keyword!) ||
        (account.remark?.includes(params.keyword!) ?? false)
      )
    }

    return await collection.sortBy('order')
  }

  // 检查账户名称是否重复
  async isNameExists(name: string, excludeId?: string): Promise<boolean> {
    let collection = this.table.where('name').equals(name)

    if (excludeId) {
      collection = collection.and(account => account.id !== excludeId)
    }

    const count = await collection.count()
    return count > 0
  }

  // 更新账户余额
  async updateBalance(accountId: string, amount: number): Promise<void> {
    await this.table.update(accountId, {
      balance: amount,
      updatedAt: new Date().toISOString()
    })
  }

  // 增加账户余额
  async increaseBalance(accountId: string, amount: number): Promise<void> {
    const account = await this.findById(accountId)
    if (!account) {
      throw new Error('账户不存在')
    }

    const newBalance = account.balance + amount
    await this.updateBalance(accountId, newBalance)
  }

  // 减少账户余额
  async decreaseBalance(accountId: string, amount: number): Promise<void> {
    const account = await this.findById(accountId)
    if (!account) {
      throw new Error('账户不存在')
    }

    const newBalance = account.balance - amount
    await this.updateBalance(accountId, newBalance)
  }

  // 账户间转账
  async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    const fromAccount = await this.findById(fromAccountId)
    const toAccount = await this.findById(toAccountId)

    if (!fromAccount || !toAccount) {
      throw new Error('账户不存在')
    }

    // 检查余额是否充足（信用卡除外）
    if (fromAccount.type !== 'credit_card' && fromAccount.balance < amount) {
      throw new Error('账户余额不足')
    }

    // 使用事务确保数据一致性
    await db.transaction('rw', [db.accounts], async () => {
      await this.decreaseBalance(fromAccountId, amount)
      await this.increaseBalance(toAccountId, amount)
    })
  }

  // 获取账户统计
  async getAccountStats(): Promise<AccountStats[]> {
    const accounts = await this.findEnabled()
    const stats: AccountStats[] = []

    for (const account of accounts) {
      // 获取收入记录
      const incomeRecords = await db.records
        .where('accountId')
        .equals(account.id)
        .and(record => record.type === 'income' && !record.isDeleted)
        .toArray()

      // 获取支出记录
      const expenseRecords = await db.records
        .where('accountId')
        .equals(account.id)
        .and(record => record.type === 'expense' && !record.isDeleted)
        .toArray()

      const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
      const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0)

      stats.push({
        accountId: account.id,
        accountName: account.name,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        balance: account.balance,
        transactionCount: incomeRecords.length + expenseRecords.length
      })
    }

    return stats
  }

  // 获取总资产
  async getTotalAssets(): Promise<number> {
    const accounts = await this.findEnabled()
    return accounts
      .filter(account => account.type !== 'credit_card')
      .reduce((total, account) => total + account.balance, 0)
  }

  // 获取总负债
  async getTotalDebts(): Promise<number> {
    const accounts = await this.findEnabled()
    return accounts
      .filter(account => account.type === 'credit_card')
      .reduce((total, account) => total + Math.abs(account.balance), 0)
  }

  // 获取净资产
  async getNetAssets(): Promise<number> {
    const totalAssets = await this.getTotalAssets()
    const totalDebts = await this.getTotalDebts()
    return totalAssets - totalDebts
  }

  // 更新账户排序
  async updateOrder(accountOrders: { id: string; order: number }[]): Promise<void> {
    const updates = accountOrders.map(({ id, order }) => ({
      key: id,
      changes: { order, updatedAt: new Date().toISOString() }
    }))

    await this.table.bulkUpdate(updates)
  }

  // 删除账户（检查是否有关联记录）
  async deleteAccount(id: string): Promise<{ success: boolean; message?: string }> {
    // 检查是否有关联记录
    const recordCount = await db.records.where('accountId').equals(id).count()
    if (recordCount > 0) {
      return { success: false, message: '该账户下还有记录，无法删除' }
    }

    await this.delete(id)
    return { success: true }
  }

  // 启用/禁用账户
  async toggleEnabled(id: string): Promise<void> {
    const account = await this.findById(id)
    if (!account) {
      throw new Error('账户不存在')
    }

    await this.update(id, {
      isEnabled: !account.isEnabled
    })
  }

  // 批量创建账户
  async bulkCreate(accounts: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Account[]> {
    const now = new Date().toISOString()
    const accountsWithIds = accounts.map((account, index) => ({
      ...account,
      id: this.generateUniqueId(),
      order: account.order || index,
      createdAt: now,
      updatedAt: now
    }))

    await this.table.bulkAdd(accountsWithIds)
    return accountsWithIds
  }

  // 同步账户余额（根据记录重新计算）
  async syncBalance(accountId: string): Promise<void> {
    const incomeRecords = await db.records
      .where('accountId')
      .equals(accountId)
      .and(record => record.type === 'income' && !record.isDeleted)
      .toArray()

    const expenseRecords = await db.records
      .where('accountId')
      .equals(accountId)
      .and(record => record.type === 'expense' && !record.isDeleted)
      .toArray()

    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
    const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0)

    const balance = totalIncome - totalExpense
    await this.updateBalance(accountId, balance)
  }

  // 生成唯一ID
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 数据迁移：修复isEnabled字段类型
  async migrateIsEnabledField(): Promise<void> {
    try {
      const accounts = await this.table.toArray()
      const updates: any[] = []

      for (const account of accounts) {
        // 如果isEnabled是数字类型，转换为布尔类型
        if (typeof account.isEnabled === 'number') {
          updates.push({
            key: account.id,
            changes: {
              isEnabled: account.isEnabled === 1,
              updatedAt: new Date().toISOString()
            }
          })
        }
      }

      if (updates.length > 0) {
        await this.table.bulkUpdate(updates)
        console.log(`已修复 ${updates.length} 个账户的isEnabled字段类型`)
      }
    } catch (error) {
      console.error('迁移isEnabled字段失败:', error)
    }
  }
}

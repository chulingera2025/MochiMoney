import { db, BaseRepository } from '../index'
import type { Budget, BudgetQueryParams, BudgetStatus, BudgetStats } from '@/types/budget'
import { BudgetType, BudgetPeriod } from '@/types/budget'

export class BudgetRepository extends BaseRepository<Budget> {
  constructor() {
    super(db.budgets)
  }

  // 根据类型查询预算
  async findByType(type: BudgetType): Promise<Budget[]> {
    return await this.table
      .where('type')
      .equals(type)
      .and(budget => budget.isEnabled)
      .sortBy('createdAt')
  }

  // 根据周期查询预算
  async findByPeriod(period: BudgetPeriod): Promise<Budget[]> {
    return await this.table
      .where('period')
      .equals(period)
      .and(budget => budget.isEnabled)
      .sortBy('createdAt')
  }

  // 根据目标ID查询预算
  async findByTarget(targetId: string): Promise<Budget[]> {
    return await this.table
      .where('targetId')
      .equals(targetId)
      .and(budget => budget.isEnabled)
      .sortBy('createdAt')
  }

  // 根据日期范围查询预算
  async findByDateRange(startDate: string, endDate: string): Promise<Budget[]> {
    return await this.table
      .where('startDate')
      .belowOrEqual(endDate)
      .and(budget => budget.endDate >= startDate && budget.isEnabled)
      .sortBy('createdAt')
  }

  // 获取活跃预算
  async findActive(): Promise<Budget[]> {
    const now = new Date().toISOString().split('T')[0]
    return await this.table
      .filter(budget => 
        Boolean(budget.isEnabled) && 
        budget.startDate <= now && 
        budget.endDate >= now
      )
      .sortBy('createdAt')
  }

  // 复合查询
  async findByQuery(params: BudgetQueryParams): Promise<Budget[]> {
    let collection = this.table.toCollection()

    if (params.type) {
      collection = collection.and(budget => budget.type === params.type)
    }

    if (params.period) {
      collection = collection.and(budget => budget.period === params.period)
    }

    if (params.targetId) {
      collection = collection.and(budget => budget.targetId === params.targetId)
    }

    if (params.isEnabled !== undefined) {
      collection = collection.and(budget => budget.isEnabled === params.isEnabled)
    }

    if (params.startDate && params.endDate) {
      collection = collection.and(budget =>
        budget.startDate <= params.endDate! && budget.endDate >= params.startDate!
      )
    }

    return await collection.sortBy('createdAt')
  }

  // 检查预算名称是否重复
  async isNameExists(name: string, excludeId?: string): Promise<boolean> {
    let collection = this.table.where('name').equals(name)

    if (excludeId) {
      collection = collection.and(budget => budget.id !== excludeId)
    }

    const count = await collection.count()
    return count > 0
  }

  // 更新预算已使用金额
  async updateSpent(budgetId: string, amount: number): Promise<void> {
    await this.table.update(budgetId, {
      spent: Math.max(0, amount),
      updatedAt: new Date().toISOString()
    })
  }

  // 增加预算已使用金额
  async increaseSpent(budgetId: string, amount: number): Promise<void> {
    const budget = await this.findById(budgetId)
    if (!budget) {
      throw new Error('预算不存在')
    }

    const newSpent = budget.spent + amount
    await this.updateSpent(budgetId, newSpent)
  }

  // 减少预算已使用金额
  async decreaseSpent(budgetId: string, amount: number): Promise<void> {
    const budget = await this.findById(budgetId)
    if (!budget) {
      throw new Error('预算不存在')
    }

    const newSpent = Math.max(0, budget.spent - amount)
    await this.updateSpent(budgetId, newSpent)
  }

  // 获取预算状态
  async getBudgetStatus(budgetId: string): Promise<BudgetStatus | null> {
    const budget = await this.findById(budgetId)
    if (!budget) {
      return null
    }

    const remaining = Math.max(0, budget.amount - budget.spent)
    const usagePercentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0
    const isOverSpent = budget.spent > budget.amount
    const isNearLimit = usagePercentage >= budget.alertThreshold

    // 计算剩余天数
    const now = new Date()
    const endDate = new Date(budget.endDate)
    const diffTime = endDate.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      amount: budget.amount,
      spent: budget.spent,
      remaining,
      usagePercentage,
      isOverSpent,
      isNearLimit,
      daysLeft
    }
  }

  // 获取所有预算状态
  async getAllBudgetStatus(): Promise<BudgetStatus[]> {
    const budgets = await this.findActive()
    const statusList: BudgetStatus[] = []

    for (const budget of budgets) {
      const status = await this.getBudgetStatus(budget.id)
      if (status) {
        statusList.push(status)
      }
    }

    return statusList
  }

  // 获取预算统计
  async getBudgetStats(): Promise<BudgetStats> {
    const allBudgets = await this.findAll()
    const activeBudgets = await this.findActive()

    const overSpentBudgets = activeBudgets.filter(budget => budget.spent > budget.amount)
    const totalBudgetAmount = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpentAmount = activeBudgets.reduce((sum, budget) => sum + budget.spent, 0)
    const overallUsagePercentage = totalBudgetAmount > 0 ? Math.round((totalSpentAmount / totalBudgetAmount) * 100) : 0

    return {
      totalBudgets: allBudgets.length,
      activeBudgets: activeBudgets.length,
      overSpentBudgets: overSpentBudgets.length,
      totalBudgetAmount,
      totalSpentAmount,
      overallUsagePercentage
    }
  }

  // 获取需要提醒的预算
  async getBudgetsNeedingAlert(): Promise<Budget[]> {
    const activeBudgets = await this.findActive()
    const alertBudgets: Budget[] = []

    for (const budget of activeBudgets) {
      const usagePercentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
      const isOverSpent = budget.spent > budget.amount
      const isNearLimit = usagePercentage >= budget.alertThreshold

      if (isOverSpent || isNearLimit) {
        alertBudgets.push(budget)
      }
    }

    return alertBudgets
  }

  // 同步预算已使用金额
  async syncBudgetSpent(budgetId: string): Promise<void> {
    const budget = await this.findById(budgetId)
    if (!budget) {
      throw new Error('预算不存在')
    }

    let spent = 0

    if (budget.type === BudgetType.TOTAL) {
      // 总预算：计算所有支出
      const records = await db.records
        .where('date')
        .between(budget.startDate, budget.endDate, true, true)
        .and(record => record.type === 'expense' && !record.isDeleted)
        .toArray()

      spent = records.reduce((sum, record) => sum + record.amount, 0)
    } else if (budget.type === BudgetType.CATEGORY && budget.targetId) {
      // 分类预算：计算特定分类的支出
      const records = await db.records
        .where('categoryId')
        .equals(budget.targetId)
        .and(record =>
          record.type === 'expense' &&
          !record.isDeleted &&
          record.date >= budget.startDate &&
          record.date <= budget.endDate
        )
        .toArray()

      spent = records.reduce((sum, record) => sum + record.amount, 0)
    } else if (budget.type === BudgetType.ACCOUNT && budget.targetId) {
      // 账户预算：计算特定账户的支出
      const records = await db.records
        .where('accountId')
        .equals(budget.targetId)
        .and(record =>
          record.type === 'expense' &&
          !record.isDeleted &&
          record.date >= budget.startDate &&
          record.date <= budget.endDate
        )
        .toArray()

      spent = records.reduce((sum, record) => sum + record.amount, 0)
    }

    await this.updateSpent(budgetId, spent)
  }

  // 同步所有预算的已使用金额
  async syncAllBudgetsSpent(): Promise<void> {
    const budgets = await this.findActive()

    for (const budget of budgets) {
      await this.syncBudgetSpent(budget.id)
    }
  }

  // 删除预算
  async deleteBudget(id: string): Promise<{ success: boolean; message?: string }> {
    await this.delete(id)
    return { success: true }
  }

  // 启用/禁用预算
  async toggleEnabled(id: string): Promise<void> {
    const budget = await this.findById(id)
    if (!budget) {
      throw new Error('预算不存在')
    }

    await this.update(id, {
      isEnabled: !budget.isEnabled
    })
  }

  // 重置预算
  async resetBudget(budgetId: string): Promise<void> {
    await this.updateSpent(budgetId, 0)
  }

  // 批量创建预算
  async bulkCreate(budgets: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Budget[]> {
    const now = new Date().toISOString()
    const budgetsWithIds = budgets.map(budget => ({
      ...budget,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    }))

    await this.table.bulkAdd(budgetsWithIds)
    return budgetsWithIds
  }
}

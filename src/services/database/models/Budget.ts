import type { BaseEntity } from '@/types'
import { BudgetType, BudgetPeriod } from '@/types/budget'

// 预算数据模型
export class BudgetModel implements BaseEntity {
  id: string
  name: string
  type: BudgetType
  targetId?: string
  amount: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  spent: number
  isEnabled: boolean
  alertThreshold: number
  createdAt: string
  updatedAt: string

  constructor(data: Partial<BudgetModel> = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.type = data.type || BudgetType.TOTAL
    this.targetId = data.targetId
    this.amount = data.amount || 0
    this.period = data.period || BudgetPeriod.MONTHLY
    this.startDate = data.startDate || new Date().toISOString().split('T')[0]
    this.endDate = data.endDate || new Date().toISOString().split('T')[0]
    this.spent = data.spent || 0
    this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true
    this.alertThreshold = data.alertThreshold || 80
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  // 验证数据有效性
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.id) errors.push('ID不能为空')
    if (!this.name) errors.push('名称不能为空')
    if (this.name.length > 20) errors.push('名称长度不能超过20个字符')
    if (!this.type) errors.push('类型不能为空')
    if (!Object.values(BudgetType).includes(this.type)) errors.push('预算类型不正确')
    if (!this.period) errors.push('周期不能为空')
    if (!Object.values(BudgetPeriod).includes(this.period)) errors.push('预算周期不正确')
    if (!this.amount || this.amount <= 0) errors.push('预算金额必须大于0')
    if (!this.startDate) errors.push('开始日期不能为空')
    if (!this.endDate) errors.push('结束日期不能为空')
    if (this.startDate >= this.endDate) errors.push('结束日期必须晚于开始日期')
    if (this.spent < 0) errors.push('已使用金额不能为负数')
    if (this.alertThreshold < 0 || this.alertThreshold > 100) errors.push('提醒阈值必须在0-100之间')

    // 分类和账户预算必须指定目标ID
    if ((this.type === BudgetType.CATEGORY || this.type === BudgetType.ACCOUNT) && !this.targetId) {
      errors.push('分类或账户预算必须指定目标ID')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 转换为普通对象
  toObject(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      targetId: this.targetId,
      amount: this.amount,
      period: this.period,
      startDate: this.startDate,
      endDate: this.endDate,
      spent: this.spent,
      isEnabled: this.isEnabled,
      alertThreshold: this.alertThreshold,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // 从普通对象创建实例
  static fromObject(data: Record<string, any>): BudgetModel {
    return new BudgetModel(data)
  }

  // 启用/禁用
  toggleEnabled(): void {
    this.isEnabled = !this.isEnabled
    this.updatedAt = new Date().toISOString()
  }

  // 更新已使用金额
  updateSpent(amount: number): void {
    this.spent = Math.max(0, amount)
    this.updatedAt = new Date().toISOString()
  }

  // 增加已使用金额
  increaseSpent(amount: number): void {
    this.spent += amount
    this.updatedAt = new Date().toISOString()
  }

  // 减少已使用金额
  decreaseSpent(amount: number): void {
    this.spent = Math.max(0, this.spent - amount)
    this.updatedAt = new Date().toISOString()
  }

  // 获取使用百分比
  getUsagePercentage(): number {
    if (this.amount === 0) return 0
    return Math.round((this.spent / this.amount) * 100)
  }

  // 获取剩余金额
  getRemainingAmount(): number {
    return Math.max(0, this.amount - this.spent)
  }

  // 检查是否超支
  isOverSpent(): boolean {
    return this.spent > this.amount
  }

  // 检查是否接近限制
  isNearLimit(): boolean {
    return this.getUsagePercentage() >= this.alertThreshold
  }

  // 检查是否需要提醒
  needsAlert(): boolean {
    return this.isEnabled && (this.isNearLimit() || this.isOverSpent())
  }

  // 获取剩余天数
  getDaysLeft(): number {
    const now = new Date()
    const endDate = new Date(this.endDate)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // 检查是否已过期
  isExpired(): boolean {
    const now = new Date()
    const endDate = new Date(this.endDate)
    return now > endDate
  }

  // 检查是否活跃
  isActive(): boolean {
    if (!this.isEnabled) return false

    const now = new Date()
    const startDate = new Date(this.startDate)
    const endDate = new Date(this.endDate)

    return now >= startDate && now <= endDate
  }

  // 更新数据
  update(data: Partial<BudgetModel>): void {
    Object.assign(this, data)
    this.updatedAt = new Date().toISOString()
  }

  // 重置预算
  reset(): void {
    this.spent = 0
    this.updatedAt = new Date().toISOString()
  }
}

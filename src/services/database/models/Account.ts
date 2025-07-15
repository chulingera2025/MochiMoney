import type { BaseEntity } from '@/types/index'
import { AccountType } from '@/types/account'

// 账户数据模型
export class AccountModel implements BaseEntity {
  id: string
  name: string
  type: AccountType
  icon: string
  color: string
  balance: number
  isEnabled: boolean
  order: number
  remark?: string
  createdAt: string
  updatedAt: string

  constructor(data: Partial<AccountModel> = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.type = data.type || AccountType.CASH
    this.icon = data.icon || 'cash'
    this.color = data.color || '#2ECC71'
    this.balance = data.balance || 0
    this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true
    this.order = data.order || 0
    this.remark = data.remark || ''
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
    if (!Object.values(AccountType).includes(this.type)) errors.push('账户类型不正确')
    if (!this.icon) errors.push('图标不能为空')
    if (!this.color) errors.push('颜色不能为空')
    if (!this.color.match(/^#[0-9A-F]{6}$/i)) errors.push('颜色格式不正确')
    if (this.order < 0) errors.push('排序值不能为负数')
    if (this.remark && this.remark.length > 100) errors.push('备注长度不能超过100个字符')

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
      icon: this.icon,
      color: this.color,
      balance: this.balance,
      isEnabled: this.isEnabled,
      order: this.order,
      remark: this.remark,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // 从普通对象创建实例
  static fromObject(data: Record<string, any>): AccountModel {
    return new AccountModel(data)
  }

  // 启用/禁用
  toggleEnabled(): void {
    this.isEnabled = !this.isEnabled
    this.updatedAt = new Date().toISOString()
  }

  // 更新余额
  updateBalance(amount: number): void {
    this.balance = amount
    this.updatedAt = new Date().toISOString()
  }

  // 增加余额
  increaseBalance(amount: number): void {
    this.balance += amount
    this.updatedAt = new Date().toISOString()
  }

  // 减少余额
  decreaseBalance(amount: number): void {
    this.balance -= amount
    this.updatedAt = new Date().toISOString()
  }

  // 检查是否有足够余额
  hasEnoughBalance(amount: number): boolean {
    // 信用卡账户可以为负数，其他账户不能
    if (this.type === AccountType.CREDIT_CARD) {
      return true
    }
    return this.balance >= amount
  }

  // 更新数据
  update(data: Partial<AccountModel>): void {
    Object.assign(this, data)
    this.updatedAt = new Date().toISOString()
  }

  // 获取格式化的余额
  getFormattedBalance(): string {
    return (this.balance / 100).toFixed(2)
  }

  // 检查是否为负债账户
  isDebtAccount(): boolean {
    return this.type === AccountType.CREDIT_CARD
  }

  // 检查是否为资产账户
  isAssetAccount(): boolean {
    return !this.isDebtAccount()
  }
}

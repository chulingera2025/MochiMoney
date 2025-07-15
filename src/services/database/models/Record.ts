import type { BaseEntity } from '@/types'
import type { RecordType } from '@/types/record'

// 记录数据模型
export class RecordModel implements BaseEntity {
  id: string
  type: RecordType
  amount: number
  categoryId: string
  accountId: string
  date: string
  remark?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  isDeleted: boolean

  constructor(data: Partial<RecordModel> = {}) {
    this.id = data.id || ''
    this.type = data.type || 'expense'
    this.amount = data.amount || 0
    this.categoryId = data.categoryId || ''
    this.accountId = data.accountId || ''
    this.date = data.date || new Date().toISOString().split('T')[0]
    this.remark = data.remark || ''
    this.tags = data.tags || []
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
    this.isDeleted = data.isDeleted || false
  }

  // 验证数据有效性
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.id) errors.push('ID不能为空')
    if (!this.type) errors.push('类型不能为空')
    if (!['income', 'expense'].includes(this.type)) errors.push('类型必须是income或expense')
    if (!this.amount || this.amount <= 0) errors.push('金额必须大于0')
    if (!this.categoryId) errors.push('分类不能为空')
    if (!this.accountId) errors.push('账户不能为空')
    if (!this.date) errors.push('日期不能为空')
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
      type: this.type,
      amount: this.amount,
      categoryId: this.categoryId,
      accountId: this.accountId,
      date: this.date,
      remark: this.remark,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this.isDeleted
    }
  }

  // 从普通对象创建实例
  static fromObject(data: Record<string, any>): RecordModel {
    return new RecordModel(data)
  }

  // 软删除
  softDelete(): void {
    this.isDeleted = true
    this.updatedAt = new Date().toISOString()
  }

  // 恢复删除
  restore(): void {
    this.isDeleted = false
    this.updatedAt = new Date().toISOString()
  }

  // 更新数据
  update(data: Partial<RecordModel>): void {
    Object.assign(this, data)
    this.updatedAt = new Date().toISOString()
  }
}

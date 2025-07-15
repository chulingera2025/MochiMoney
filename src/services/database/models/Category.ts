import type { BaseEntity } from '@/types'
import type { RecordType } from '@/types/record'

// 分类数据模型
export class CategoryModel implements BaseEntity {
  id: string
  name: string
  type: RecordType
  icon: string
  color: string
  parentId?: string
  order: number
  isSystem: boolean
  isEnabled: boolean
  createdAt: string
  updatedAt: string

  constructor(data: Partial<CategoryModel> = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.type = data.type || 'expense'
    this.icon = data.icon || 'other'
    this.color = data.color || '#E0E0E0'
    this.parentId = data.parentId
    this.order = data.order || 0
    this.isSystem = data.isSystem || false
    this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true
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
    if (!['income', 'expense'].includes(this.type)) errors.push('类型必须是income或expense')
    if (!this.icon) errors.push('图标不能为空')
    if (!this.color) errors.push('颜色不能为空')
    if (!this.color.match(/^#[0-9A-F]{6}$/i)) errors.push('颜色格式不正确')
    if (this.order < 0) errors.push('排序值不能为负数')

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
      parentId: this.parentId,
      order: this.order,
      isSystem: this.isSystem,
      isEnabled: this.isEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // 从普通对象创建实例
  static fromObject(data: Record<string, any>): CategoryModel {
    return new CategoryModel(data)
  }

  // 启用/禁用
  toggleEnabled(): void {
    this.isEnabled = !this.isEnabled
    this.updatedAt = new Date().toISOString()
  }

  // 更新数据
  update(data: Partial<CategoryModel>): void {
    // 系统分类不允许修改某些字段
    if (this.isSystem) {
      const allowedFields = ['order', 'isEnabled']
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowedFields.includes(key))
      )
      Object.assign(this, filteredData)
    } else {
      Object.assign(this, data)
    }
    this.updatedAt = new Date().toISOString()
  }

  // 检查是否为子分类
  isSubCategory(): boolean {
    return !!this.parentId
  }

  // 检查是否为父分类
  isParentCategory(): boolean {
    return !this.parentId
  }
}

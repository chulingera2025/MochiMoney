import type { BaseEntity } from './index'
import type { RecordType } from './record'

// 分类类型
export type CategoryType = RecordType

// 分类实体
export interface Category extends BaseEntity {
  name: string
  type: RecordType
  icon: string
  color: string
  parentId?: string
  order: number
  isSystem: boolean
  isEnabled: boolean
  sort?: number
  remark?: string
}

// 创建分类的参数
export interface CreateCategoryParams {
  name: string
  type: RecordType
  icon: string
  color: string
  parentId?: string
  order?: number
}

// 更新分类的参数
export interface UpdateCategoryParams {
  name?: string
  icon?: string
  color?: string
  parentId?: string
  order?: number
  isEnabled?: boolean
}

// 分类查询参数
export interface CategoryQueryParams {
  type?: RecordType
  parentId?: string
  isEnabled?: boolean
  keyword?: string
}

// 分类统计
export interface CategoryStats {
  categoryId: string
  categoryName: string
  totalAmount: number
  count: number
  percentage: number
}

// 分类树节点
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[]
  level: number
}

// 默认分类配置
export interface DefaultCategoryConfig {
  name: string
  icon: string
  color: string
  type: RecordType
}

// 分类表单数据
export interface CategoryFormData {
  name: string
  type: RecordType
  icon: string
  color: string
  parentId: string
}
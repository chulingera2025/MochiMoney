import type { BaseEntity } from './index'

// 记录类型
export type RecordType = 'income' | 'expense'

// 记录实体
export interface Record extends BaseEntity {
  type: RecordType
  amount: number // 金额（分为单位）
  categoryId: string
  accountId: string
  date: string // 记录日期 (ISO格式)
  time: string // 记录时间 (HH:mm格式)
  remark?: string
  tags?: string[]
  isDeleted: boolean
}

// 创建记录的参数
export interface CreateRecordParams {
  type: RecordType
  amount: number
  categoryId: string
  accountId: string
  date: string
  time: string
  remark?: string
  tags?: string[]
}

// 创建记录数据的类型别名
export type CreateRecordData = CreateRecordParams

// 更新记录的参数
export interface UpdateRecordParams {
  amount?: number
  categoryId?: string
  accountId?: string
  date?: string
  remark?: string
  tags?: string[]
}

// 记录查询参数
export interface RecordQueryParams {
  type?: RecordType
  categoryId?: string
  accountId?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page?: number
  pageSize?: number
}

// 记录统计结果
export interface RecordStats {
  totalIncome: number
  totalExpense: number
  balance: number
  count: number
}

// 按日期分组的记录
export interface RecordsByDate {
  date: string
  records: Record[]
  totalIncome: number
  totalExpense: number
  balance: number
}

// 记录表单数据
export interface RecordFormData {
  type: RecordType
  amount: string
  categoryId: string
  accountId: string
  date: string
  remark: string
  tags: string[]
}
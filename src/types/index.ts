// 通用类型定义
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// 分页类型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 日期范围类型
export interface DateRange {
  startDate: string
  endDate: string
}

// 排序类型
export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

// 筛选选项
export interface FilterOptions {
  search?: string
  dateRange?: DateRange
  categoryId?: string
  accountId?: string
  type?: 'income' | 'expense'
}

// 统计汇总类型
export interface Summary {
  income: number
  expense: number
  balance: number
}

// 组件Props基础类型
export interface ComponentProps {
  className?: string
  style?: Record<string, any>
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: any) => boolean | string
}

// 主题类型
export type ThemeType = 'light' | 'dark' | 'auto'

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// 货币类型
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY'
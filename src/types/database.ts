// 数据库配置
export interface DatabaseConfig {
  name: string
  version: number
  stores: string[]
}

// 数据库存储配置
export interface StoreConfig {
  name: string
  keyPath: string
  indexes: IndexConfig[]
}

// 索引配置
export interface IndexConfig {
  name: string
  keyPath: string | string[]
  unique?: boolean
  multiEntry?: boolean
}

// 数据库迁移
export interface Migration {
  version: number
  description: string
  up: (db: IDBDatabase) => Promise<void>
  down: (db: IDBDatabase) => Promise<void>
}

// 查询选项
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  where?: Record<string, any>
}

// 数据库操作结果
export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  count?: number
}

// 备份数据结构
export interface BackupData {
  version: string
  timestamp: string
  records: any[]
  categories: any[]
  accounts: any[]
  budgets: any[]
  settings: any[]
}

// 数据验证规则
export interface DataValidationRule {
  field: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  enum?: any[]
  validator?: (value: any) => boolean
}

// 数据验证结果
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}
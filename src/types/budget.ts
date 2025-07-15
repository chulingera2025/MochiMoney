import type { BaseEntity } from './index'

// 预算类型枚举
export enum BudgetType {
  TOTAL = 'total',
  CATEGORY = 'category',
  ACCOUNT = 'account'
}

// 预算周期枚举
export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// 预算实体
export interface Budget extends BaseEntity {
  name: string
  type: BudgetType
  targetId?: string // 目标ID（分类ID或账户ID）
  amount: number // 预算金额（分为单位）
  period: BudgetPeriod
  startDate: string
  endDate: string
  spent: number // 已使用金额
  isEnabled: boolean
  alertThreshold: number // 提醒阈值（百分比）
}

// 创建预算的参数
export interface CreateBudgetParams {
  name: string
  type: BudgetType
  targetId?: string
  amount: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  alertThreshold?: number
}

// 更新预算的参数
export interface UpdateBudgetParams {
  name?: string
  amount?: number
  period?: BudgetPeriod
  startDate?: string
  endDate?: string
  isEnabled?: boolean
  alertThreshold?: number
}

// 预算查询参数
export interface BudgetQueryParams {
  type?: BudgetType
  period?: BudgetPeriod
  targetId?: string
  isEnabled?: boolean
  startDate?: string
  endDate?: string
}

// 预算执行状态
export interface BudgetStatus {
  budgetId: string
  budgetName: string
  amount: number
  spent: number
  remaining: number
  usagePercentage: number
  isOverSpent: boolean
  isNearLimit: boolean
  daysLeft: number
}

// 预算统计
export interface BudgetStats {
  totalBudgets: number
  activeBudgets: number
  overSpentBudgets: number
  totalBudgetAmount: number
  totalSpentAmount: number
  overallUsagePercentage: number
}

// 预算提醒
export interface BudgetAlert {
  budgetId: string
  budgetName: string
  type: 'near_limit' | 'over_spent'
  percentage: number
  message: string
  createdAt: string
}

// 预算表单数据
export interface BudgetFormData {
  name: string
  type: BudgetType
  targetId: string
  amount: string
  period: BudgetPeriod
  startDate: string
  endDate: string
  alertThreshold: number
}
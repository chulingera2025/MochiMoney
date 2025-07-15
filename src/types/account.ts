import type { BaseEntity } from './index'

// 账户类型枚举
export enum AccountType {
  CASH = 'cash',
  BANK_CARD = 'bank_card',
  CREDIT_CARD = 'credit_card',
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  INVESTMENT = 'investment',
  OTHER = 'other'
}

// 账户实体
export interface Account extends BaseEntity {
  name: string
  type: AccountType
  icon: string
  color: string
  balance: number // 余额（分为单位）
  isEnabled: boolean
  order: number
  remark?: string
}

// 创建账户的参数
export interface CreateAccountParams {
  name: string
  type: AccountType
  icon: string
  color: string
  balance?: number
  remark?: string
  order?: number
}

// 更新账户的参数
export interface UpdateAccountParams {
  name?: string
  type?: AccountType
  icon?: string
  color?: string
  balance?: number
  isEnabled?: boolean
  order?: number
  remark?: string
}

// 账户查询参数
export interface AccountQueryParams {
  type?: AccountType
  isEnabled?: boolean
  keyword?: string
}

// 账户统计
export interface AccountStats {
  accountId: string
  accountName: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

// 账户余额变动记录
export interface BalanceChangeRecord {
  id: string
  accountId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out'
  relatedRecordId?: string
  createdAt: string
}

// 转账参数
export interface TransferParams {
  fromAccountId: string
  toAccountId: string
  amount: number
  remark?: string
}

// 默认账户配置
export interface DefaultAccountConfig {
  name: string
  type: AccountType
  icon: string
  color: string
}

// 账户表单数据
export interface AccountFormData {
  name: string
  type: AccountType
  icon: string
  color: string
  balance: string
  remark: string
}
import type { DefaultAccountConfig } from '../types/account'
import { AccountType } from '../types/account'

// 默认账户配置
export const DEFAULT_ACCOUNTS: DefaultAccountConfig[] = [
  { name: '现金', type: AccountType.CASH, icon: 'paid', color: '#2ECC71' },
  { name: '银行卡', type: AccountType.BANK_CARD, icon: 'card', color: '#3498DB' },
  { name: '支付宝', type: AccountType.ALIPAY, icon: 'alipay', color: '#1890FF' },
  { name: '微信', type: AccountType.WECHAT, icon: 'wechat', color: '#52C41A' },
  { name: '信用卡', type: AccountType.CREDIT_CARD, icon: 'credit-card', color: '#F39C12' }
]

// 账户类型配置
export const ACCOUNT_TYPE_CONFIG = {
  [AccountType.CASH]: {
    name: '现金',
    icon: 'paid',
    color: '#2ECC71',
    description: '现金账户'
  },
  [AccountType.BANK_CARD]: {
    name: '银行卡',
    icon: 'card',
    color: '#3498DB',
    description: '银行储蓄卡'
  },
  [AccountType.CREDIT_CARD]: {
    name: '信用卡',
    icon: 'credit-card',
    color: '#F39C12',
    description: '信用卡账户'
  },
  [AccountType.ALIPAY]: {
    name: '支付宝',
    icon: 'alipay',
    color: '#1890FF',
    description: '支付宝账户'
  },
  [AccountType.WECHAT]: {
    name: '微信',
    icon: 'wechat-pay',
    color: '#52C41A',
    description: '微信钱包'
  },
  [AccountType.INVESTMENT]: {
    name: '投资',
    icon: 'bar-chart-o',
    color: '#8E44AD',
    description: '投资账户'
  },
  [AccountType.OTHER]: {
    name: '其他',
    icon: 'other-pay',
    color: '#95A5A6',
    description: '其他账户'
  }
}

// 账户颜色预设
export const ACCOUNT_COLORS = [
  '#2ECC71', '#3498DB', '#F39C12', '#1890FF', '#52C41A',
  '#8E44AD', '#95A5A6', '#E74C3C', '#34495E', '#16A085',
  '#D35400', '#7F8C8D', '#9B59B6', '#27AE60', '#2980B9'
]

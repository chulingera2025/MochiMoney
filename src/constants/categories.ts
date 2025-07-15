import type { DefaultCategoryConfig } from '../types/category'

// 默认支出分类
export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategoryConfig[] = [
  { name: '餐饮', icon: 'food', color: '#FF6B6B', type: 'expense' },
  { name: '交通', icon: 'transport', color: '#4ECDC4', type: 'expense' },
  { name: '购物', icon: 'shopping', color: '#45B7D1', type: 'expense' },
  { name: '娱乐', icon: 'entertainment', color: '#96CEB4', type: 'expense' },
  { name: '医疗', icon: 'medical', color: '#FFEAA7', type: 'expense' },
  { name: '教育', icon: 'education', color: '#DDA0DD', type: 'expense' },
  { name: '住房', icon: 'housing', color: '#98D8C8', type: 'expense' },
  { name: '通讯', icon: 'communication', color: '#F8BBD0', type: 'expense' },
  { name: '服装', icon: 'clothing', color: '#C5E1A5', type: 'expense' },
  { name: '美容', icon: 'beauty', color: '#FFCDD2', type: 'expense' },
  { name: '运动', icon: 'sports', color: '#B3E5FC', type: 'expense' },
  { name: '旅行', icon: 'travel', color: '#D1C4E9', type: 'expense' },
  { name: '宠物', icon: 'pet', color: '#FFE0B2', type: 'expense' },
  { name: '礼品', icon: 'gift', color: '#F8C4B4', type: 'expense' },
  { name: '其他', icon: 'other', color: '#E0E0E0', type: 'expense' }
]

// 默认收入分类
export const DEFAULT_INCOME_CATEGORIES: DefaultCategoryConfig[] = [
  { name: '工资', icon: 'salary', color: '#58D68D', type: 'income' },
  { name: '奖金', icon: 'bonus', color: '#82E0AA', type: 'income' },
  { name: '投资', icon: 'investment', color: '#A9DFBF', type: 'income' },
  { name: '兼职', icon: 'parttime', color: '#D5F4E6', type: 'income' },
  { name: '礼金', icon: 'gift-money', color: '#85C1E9', type: 'income' },
  { name: '分红', icon: 'dividend', color: '#A9D3AB', type: 'income' },
  { name: '租金', icon: 'rent', color: '#C7E9B4', type: 'income' },
  { name: '退款', icon: 'refund', color: '#B8E6B8', type: 'income' },
  { name: '其他', icon: 'other', color: '#E8F5E8', type: 'income' }
]

// 所有默认分类
export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES
]

// 分类图标映射
export const CATEGORY_ICONS = {
  // 支出类图标
  food: '🍽️',
  transport: '🚗',
  shopping: '🛒',
  entertainment: '🎬',
  medical: '🏥',
  education: '📚',
  housing: '🏠',
  communication: '📱',
  clothing: '👕',
  beauty: '💄',
  sports: '⚽',
  travel: '✈️',
  pet: '🐱',
  gift: '🎁',
  
  // 收入类图标
  salary: '💰',
  bonus: '🎯',
  investment: '📈',
  parttime: '💼',
  'gift-money': '🧧',
  dividend: '💎',
  rent: '🏘️',
  refund: '↩️',
  
  // 通用图标
  other: '📝'
}

// 分类颜色预设
export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F8BBD0', '#C5E1A5', '#FFCDD2',
  '#B3E5FC', '#D1C4E9', '#FFE0B2', '#F8C4B4', '#E0E0E0',
  '#58D68D', '#82E0AA', '#A9DFBF', '#D5F4E6', '#85C1E9',
  '#A9D3AB', '#C7E9B4', '#B8E6B8', '#E8F5E8'
]
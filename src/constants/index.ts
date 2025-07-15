// 应用基础信息
export const APP_INFO = {
  name: 'MochiMoney',
  version: '1.0.0',
  author: 'MochiMoney Team',
  description: '糯米记账 - 专注于个人记账的H5应用',
  homepage: 'https://mochimoney.app',
  repository: 'https://github.com/mochimoney/mochimoney'
}

// 数据库配置
export const DATABASE_CONFIG = {
  name: 'MochiMoney',
  version: 1,
  stores: ['records', 'categories', 'accounts', 'budgets', 'settings']
}

// 存储键名
export const STORAGE_KEYS = {
  THEME: 'mm_theme',
  LANGUAGE: 'mm_language',
  CURRENCY: 'mm_currency',
  LAST_BACKUP: 'mm_last_backup',
  USER_SETTINGS: 'mm_user_settings',
  QUICK_AMOUNTS: 'mm_quick_amounts',
  DEFAULT_ACCOUNT: 'mm_default_account',
  DEFAULT_CATEGORY: 'mm_default_category'
}

// 页面路由
export const ROUTES = {
  HOME: '/',
  RECORD_LIST: '/records',
  RECORD_ADD: '/records/add',
  RECORD_EDIT: '/records/edit',
  RECORD_DETAIL: '/records/detail',
  STATISTICS: '/statistics',
  STATISTICS_TREND: '/statistics/trend',
  STATISTICS_CATEGORY: '/statistics/category',
  STATISTICS_MONTHLY: '/statistics/monthly',
  BUDGET_LIST: '/budgets',
  BUDGET_ADD: '/budgets/add',
  BUDGET_EDIT: '/budgets/edit',
  BUDGET_DETAIL: '/budgets/detail',
  CATEGORY_LIST: '/categories',
  CATEGORY_ADD: '/categories/add',
  CATEGORY_EDIT: '/categories/edit',
  ACCOUNT_LIST: '/accounts',
  ACCOUNT_ADD: '/accounts/add',
  ACCOUNT_EDIT: '/accounts/edit',
  SETTINGS: '/settings',
  SETTINGS_THEME: '/settings/theme',
  SETTINGS_EXPORT: '/settings/export',
  SETTINGS_IMPORT: '/settings/import',
  SETTINGS_ABOUT: '/settings/about'
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// 日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
  DISPLAY_DATE: 'MM月DD日',
  DISPLAY_DATETIME: 'MM月DD日 HH:mm',
  DISPLAY_MONTH: 'YYYY年MM月',
  DISPLAY_YEAR: 'YYYY年'
}

// 金额限制
export const AMOUNT_LIMITS = {
  MIN: 0.01,
  MAX: 9999999999.99,
  DECIMAL_PLACES: 2
}

// 验证规则
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此项为必填项' },
  AMOUNT: {
    required: true,
    min: AMOUNT_LIMITS.MIN,
    max: AMOUNT_LIMITS.MAX,
    message: `金额必须在${AMOUNT_LIMITS.MIN}到${AMOUNT_LIMITS.MAX}之间`
  },
  NAME: {
    required: true,
    min: 1,
    max: 20,
    message: '名称长度必须在1到20个字符之间'
  },
  REMARK: {
    max: 100,
    message: '备注长度不能超过100个字符'
  }
}

// 快速金额预设
export const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000, 2000]

// 主题配置
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// 语言配置
export const LANGUAGE_CONFIG = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
}

// 货币配置
export const CURRENCY_CONFIG = {
  CNY: { symbol: '¥', name: '人民币' },
  USD: { symbol: '$', name: '美元' },
  EUR: { symbol: '€', name: '欧元' },
  JPY: { symbol: '¥', name: '日元' }
}

// 文件类型
export const FILE_TYPES = {
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV: 'text/csv',
  JSON: 'application/json'
}

// 导出文件扩展名
export const EXPORT_EXTENSIONS = {
  excel: '.xlsx',
  csv: '.csv',
  json: '.json'
}

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  RECORD_CREATED: '记录创建成功',
  RECORD_UPDATED: '记录更新成功',
  RECORD_DELETED: '记录删除成功',
  CATEGORY_CREATED: '分类创建成功',
  CATEGORY_UPDATED: '分类更新成功',
  CATEGORY_DELETED: '分类删除成功',
  ACCOUNT_CREATED: '账户创建成功',
  ACCOUNT_UPDATED: '账户更新成功',
  ACCOUNT_DELETED: '账户删除成功',
  BUDGET_CREATED: '预算创建成功',
  BUDGET_UPDATED: '预算更新成功',
  BUDGET_DELETED: '预算删除成功',
  DATA_EXPORTED: '数据导出成功',
  DATA_IMPORTED: '数据导入成功',
  BACKUP_CREATED: '备份创建成功',
  BACKUP_RESTORED: '备份恢复成功'
}

// 错误消息
export const ERROR_MESSAGES = {
  RECORD_NOT_FOUND: '记录不存在',
  CATEGORY_NOT_FOUND: '分类不存在',
  ACCOUNT_NOT_FOUND: '账户不存在',
  BUDGET_NOT_FOUND: '预算不存在',
  INVALID_AMOUNT: '金额格式不正确',
  INVALID_DATE: '日期格式不正确',
  NETWORK_ERROR: '网络错误，请稍后重试',
  DATABASE_ERROR: '数据库错误，请稍后重试',
  FILE_ERROR: '文件操作失败',
  PERMISSION_DENIED: '权限不足',
  UNKNOWN_ERROR: '未知错误'
}
import { AMOUNT_LIMITS, CURRENCY_CONFIG } from '@/constants'

// 将元转换为分
export const yuanToFen = (yuan: number): number => {
  return Math.round(yuan * 100)
}

// 将分转换为元
export const fenToYuan = (fen: number): number => {
  return fen / 100
}

// 格式化金额显示
export const formatAmount = (amount: number, currency: string = 'CNY', showSymbol: boolean = true): string => {
  const yuan = fenToYuan(amount)
  const formatted = yuan.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  if (showSymbol) {
    const symbol = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG]?.symbol || '¥'
    return `${symbol}${formatted}`
  }

  return formatted
}

// 格式化金额输入
export const formatAmountInput = (value: string): string => {
  // 移除非数字和小数点的字符
  let cleaned = value.replace(/[^\d.]/g, '')

  // 确保只有一个小数点
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  // 限制小数位数
  if (parts.length === 2) {
    cleaned = parts[0] + '.' + parts[1].slice(0, AMOUNT_LIMITS.DECIMAL_PLACES)
  }

  return cleaned
}

// 验证金额格式
export const validateAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(num)) {
    return false
  }

  return num >= AMOUNT_LIMITS.MIN && num <= AMOUNT_LIMITS.MAX
}

// 解析金额字符串
export const parseAmount = (amount: string): number => {
  const cleaned = amount.replace(/[^\d.-]/g, '')
  const num = parseFloat(cleaned)

  if (isNaN(num)) {
    return 0
  }

  return Math.max(0, Math.min(num, AMOUNT_LIMITS.MAX))
}

// 计算百分比
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) {
    return 0
  }

  return Math.round((part / total) * 100)
}

// 格式化百分比
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`
}

// 安全的数字运算（避免浮点数精度问题）
export const safeAdd = (a: number, b: number): number => {
  return Math.round((a + b) * 100) / 100
}

export const safeSubtract = (a: number, b: number): number => {
  return Math.round((a - b) * 100) / 100
}

export const safeMultiply = (a: number, b: number): number => {
  return Math.round(a * b * 100) / 100
}

export const safeDivide = (a: number, b: number): number => {
  if (b === 0) {
    return 0
  }
  return Math.round((a / b) * 100) / 100
}

// 格式化大数字
export const formatLargeNumber = (num: number): string => {
  const absNum = Math.abs(num)

  if (absNum >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`
  } else if (absNum >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  } else if (absNum >= 1000) {
    return `${(num / 1000).toFixed(1)}千`
  } else {
    return num.toString()
  }
}

// 生成随机数
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 四舍五入到指定小数位
export const roundToDecimal = (num: number, decimal: number = 2): number => {
  const factor = Math.pow(10, decimal)
  return Math.round(num * factor) / factor
}

// 检查是否为有效数字
export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

// 获取数字的符号
export const getNumberSign = (num: number): 'positive' | 'negative' | 'zero' => {
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'zero'
}

// 格式化数字为千分位
export const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString('zh-CN')
}

// 格式化金额为货币格式（简化版）
export const formatMoney = (amount: number): string => {
  return amount.toFixed(2)
}

// 限制数字范围
export const clampNumber = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, num))
}

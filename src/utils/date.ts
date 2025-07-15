import dayjs from 'dayjs'
import { DATE_FORMATS } from '@/constants'

// 格式化日期
export const formatDate = (date: string | Date, format: string = DATE_FORMATS.DATE): string => {
  return dayjs(date).format(format)
}

// 格式化时间
export const formatTime = (date: string | Date, format: string = 'HH:mm'): string => {
  return dayjs(date).format(format)
}

// 获取当前日期
export const getCurrentDate = (): string => {
  return dayjs().format(DATE_FORMATS.DATE)
}

// 获取当前时间戳
export const getCurrentTimestamp = (): string => {
  return dayjs().format(DATE_FORMATS.DATETIME)
}

// 获取月份的第一天
export const getMonthStart = (date?: string | Date): string => {
  return dayjs(date).startOf('month').format(DATE_FORMATS.DATE)
}

// 获取月份的最后一天
export const getMonthEnd = (date?: string | Date): string => {
  return dayjs(date).endOf('month').format(DATE_FORMATS.DATE)
}

// 获取年份的第一天
export const getYearStart = (date?: string | Date): string => {
  return dayjs(date).startOf('year').format(DATE_FORMATS.DATE)
}

// 获取年份的最后一天
export const getYearEnd = (date?: string | Date): string => {
  return dayjs(date).endOf('year').format(DATE_FORMATS.DATE)
}

// 获取周的第一天
export const getWeekStart = (date?: string | Date): string => {
  return dayjs(date).startOf('week').format(DATE_FORMATS.DATE)
}

// 获取周的最后一天
export const getWeekEnd = (date?: string | Date): string => {
  return dayjs(date).endOf('week').format(DATE_FORMATS.DATE)
}

// 获取日期范围
export const getDateRange = (type: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
  const today = dayjs()

  switch (type) {
    case 'today':
      return {
        startDate: today.format(DATE_FORMATS.DATE),
        endDate: today.format(DATE_FORMATS.DATE)
      }
    case 'yesterday':
      const yesterday = today.subtract(1, 'day')
      return {
        startDate: yesterday.format(DATE_FORMATS.DATE),
        endDate: yesterday.format(DATE_FORMATS.DATE)
      }
    case 'thisWeek':
      return {
        startDate: today.startOf('week').format(DATE_FORMATS.DATE),
        endDate: today.endOf('week').format(DATE_FORMATS.DATE)
      }
    case 'lastWeek':
      const lastWeek = today.subtract(1, 'week')
      return {
        startDate: lastWeek.startOf('week').format(DATE_FORMATS.DATE),
        endDate: lastWeek.endOf('week').format(DATE_FORMATS.DATE)
      }
    case 'thisMonth':
      return {
        startDate: today.startOf('month').format(DATE_FORMATS.DATE),
        endDate: today.endOf('month').format(DATE_FORMATS.DATE)
      }
    case 'lastMonth':
      const lastMonth = today.subtract(1, 'month')
      return {
        startDate: lastMonth.startOf('month').format(DATE_FORMATS.DATE),
        endDate: lastMonth.endOf('month').format(DATE_FORMATS.DATE)
      }
    case 'thisYear':
      return {
        startDate: today.startOf('year').format(DATE_FORMATS.DATE),
        endDate: today.endOf('year').format(DATE_FORMATS.DATE)
      }
    case 'lastYear':
      const lastYear = today.subtract(1, 'year')
      return {
        startDate: lastYear.startOf('year').format(DATE_FORMATS.DATE),
        endDate: lastYear.endOf('year').format(DATE_FORMATS.DATE)
      }
    default:
      return {
        startDate: today.format(DATE_FORMATS.DATE),
        endDate: today.format(DATE_FORMATS.DATE)
      }
  }
}

// 计算两个日期之间的天数
export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}

// 判断是否为今天
export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

// 判断是否为昨天
export const isYesterday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

// 判断是否为本周
export const isThisWeek = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'week')
}

// 判断是否为本月
export const isThisMonth = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'month')
}

// 判断是否为今年
export const isThisYear = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'year')
}

// 获取相对时间描述
export const getRelativeTime = (date: string | Date): string => {
  const targetDate = dayjs(date)
  const now = dayjs()

  if (isToday(date)) {
    return '今天'
  } else if (isYesterday(date)) {
    return '昨天'
  } else if (targetDate.isSame(now.subtract(2, 'day'), 'day')) {
    return '前天'
  } else if (isThisWeek(date)) {
    return targetDate.format('dddd')
  } else if (isThisYear(date)) {
    return targetDate.format('MM月DD日')
  } else {
    return targetDate.format('YYYY年MM月DD日')
  }
}

// 验证日期格式
export const isValidDate = (date: string): boolean => {
  return dayjs(date).isValid()
}

// 获取月份天数
export const getDaysInMonth = (date?: string | Date): number => {
  return dayjs(date).daysInMonth()
}

// 获取月份列表
export const getMonthsInYear = (year?: number): string[] => {
  const targetYear = year || dayjs().year()
  const months = []

  for (let i = 1; i <= 12; i++) {
    months.push(dayjs(`${targetYear}-${i.toString().padStart(2, '0')}-01`).format('YYYY-MM'))
  }

  return months
}

// 格式化日期字符串
export const formatDateString = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

// 获取年份列表
export const getYearsList = (count: number = 10): number[] => {
  const currentYear = dayjs().year()
  const years = []

  for (let i = 0; i < count; i++) {
    years.push(currentYear - i)
  }

  return years
}

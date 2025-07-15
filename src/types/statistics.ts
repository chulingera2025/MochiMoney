// 统计时间范围
export enum StatsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

// 统计查询参数
export interface StatsQueryParams {
  period: StatsPeriod
  startDate?: string
  endDate?: string
  categoryId?: string
  accountId?: string
}

// 基础统计数据
export interface BasicStats {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  period: string
}

// 趋势统计数据点
export interface TrendDataPoint {
  date: string
  income: number
  expense: number
  balance: number
}

// 趋势统计数据
export interface TrendStats {
  period: StatsPeriod
  dataPoints: TrendDataPoint[]
  totalIncome: number
  totalExpense: number
  averageIncome: number
  averageExpense: number
}

// 分类统计数据
export interface CategoryStatsItem {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  count: number
  percentage: number
}

export interface CategoryStats {
  incomeCategories: CategoryStatsItem[]
  expenseCategories: CategoryStatsItem[]
  totalIncomeAmount: number
  totalExpenseAmount: number
}

// 账户统计数据
export interface AccountStatsItem {
  accountId: string
  accountName: string
  accountIcon: string
  accountColor: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface AccountStats {
  accounts: AccountStatsItem[]
  totalBalance: number
  totalTransactions: number
}

// 月度对比数据
export interface MonthlyComparisonItem {
  month: string
  income: number
  expense: number
  balance: number
  incomeChange: number
  expenseChange: number
}

export interface MonthlyComparison {
  months: MonthlyComparisonItem[]
  averageIncome: number
  averageExpense: number
  bestMonth: string
  worstMonth: string
}

// 图表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  title: string
  data: any
  options: any
}

// 报表数据
export interface ReportData {
  title: string
  period: string
  summary: BasicStats
  trends: TrendStats
  categories: CategoryStats
  accounts: AccountStats
  generatedAt: string
}

// 导出参数
export interface ExportParams {
  format: 'excel' | 'csv' | 'pdf'
  period: StatsPeriod
  startDate?: string
  endDate?: string
  includeCharts?: boolean
  includeDetails?: boolean
}

// 新增统计页面需要的类型定义
export interface StatisticsData {
  totalIncome: number
  totalExpense: number
  balance: number
  expenseCategories: number
  incomeCategories: number
  maxExpense: number
  activeAccounts: number
  totalAssets: number
  totalDebts: number
  totalRecords: number
  avgDailyRecords: number
  avgDailyExpense: number
}

// 趋势图数据
export interface TrendData {
  date: string
  income: number
  expense: number
  balance: number
}

// 分类统计数据
export interface CategoryData {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  count: number
  percentage: number
}

// 账户统计数据
export interface AccountData {
  accountId: string
  accountName: string
  accountIcon: string
  accountColor: string
  balance: number
  percentage: number
}

// 日期范围
export interface DateRange {
  startDate: string
  endDate: string
}
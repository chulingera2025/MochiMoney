import { recordRepository, categoryRepository, accountRepository } from '@/services/database/repositories'
import { formatDate } from '@/utils/date'
import type { 
  StatisticsData, 
  TrendData, 
  CategoryData, 
  AccountData, 
  DateRange 
} from '@/types/statistics'

class StatisticsService {
  // 获取基础统计数据
  async getStatistics(dateRange?: DateRange): Promise<StatisticsData> {
    try {
      // 获取记录数据
      const queryParams: any = {}
      if (dateRange) {
        queryParams.startDate = dateRange.startDate
        queryParams.endDate = dateRange.endDate
      }
      
      const records = await recordRepository.findByQuery(queryParams)
      
      // 计算基础统计
      const totalIncome = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const totalExpense = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const balance = totalIncome - totalExpense
      
      // 获取分类和账户数据
      const [categories, accounts] = await Promise.all([
        categoryRepository.findAll(),
        accountRepository.findAll()
      ])
      
      const expenseCategories = categories.filter(c => c.type === 'expense' && c.isEnabled).length
      const incomeCategories = categories.filter(c => c.type === 'income' && c.isEnabled).length
      
      // 计算最高单笔支出
      const expenseAmounts = records
        .filter(r => r.type === 'expense')
        .map(r => r.amount)
      const maxExpense = expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0
      
      // 计算账户统计
      const activeAccounts = accounts.filter(a => a.isEnabled).length
      const totalAssets = await accountRepository.getTotalAssets()
      const totalDebts = await accountRepository.getTotalDebts()
      
      // 计算日均统计 - 基于全部记录的时间跨度来计算
      let totalDays = 30 // 默认值
      let avgDailyRecords = 0
      let avgDailyExpense = 0
      
      // 获取全部记录来计算日均值（不受dateRange限制）
      const allRecords = await recordRepository.findByQuery({})
      
      if (allRecords.length > 0) {
        // 获取最早和最晚的记录日期
        const dates = allRecords.map(record => new Date(record.date))
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const today = new Date()
        
        // 计算从最早记录到今天的天数
        const diffTime = today.getTime() - earliestDate.getTime()
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        // 确保至少1天
        totalDays = Math.max(totalDays, 1)
        
        // 基于全部记录计算日均值
        const totalExpenseAllTime = allRecords
          .filter(r => r.type === 'expense')
          .reduce((sum, r) => sum + r.amount, 0)
        
        avgDailyRecords = Math.round(allRecords.length / totalDays * 10) / 10
        avgDailyExpense = Math.round(totalExpenseAllTime / totalDays)
      }
      
      return {
        totalIncome,
        totalExpense,
        balance,
        expenseCategories,
        incomeCategories,
        maxExpense,
        activeAccounts,
        totalAssets,
        totalDebts,
        totalRecords: records.length,
        avgDailyRecords,
        avgDailyExpense
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  }
  
  // 获取趋势数据
  async getTrendData(dateRange?: DateRange): Promise<TrendData[]> {
    try {
      const queryParams: any = {}
      if (dateRange) {
        queryParams.startDate = dateRange.startDate
        queryParams.endDate = dateRange.endDate
      }
      
      const records = await recordRepository.findByQuery(queryParams)
      
      // 如果没有记录，返回空数组
      if (!records || records.length === 0) {
        return []
      }
      
      // 按日期分组
      const groupedData: { [date: string]: { income: number; expense: number } } = {}
      
      records.forEach(record => {
        const date = record.date
        if (!date || !record.amount || isNaN(record.amount)) return
        
        if (!groupedData[date]) {
          groupedData[date] = { income: 0, expense: 0 }
        }
        
        if (record.type === 'income') {
          groupedData[date].income += record.amount
        } else if (record.type === 'expense') {
          groupedData[date].expense += record.amount
        }
      })
      
      // 如果没有有效数据，返回空数组
      if (Object.keys(groupedData).length === 0) {
        return []
      }
      
      // 转换为趋势数据
      const trendData: TrendData[] = []
      let cumulativeBalance = 0
      
      Object.entries(groupedData)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .forEach(([date, data]) => {
          const income = data.income || 0
          const expense = data.expense || 0
          const balance = income - expense
          cumulativeBalance += balance
          
          trendData.push({
            date,
            income,
            expense,
            balance: cumulativeBalance
          })
        })
      
      return trendData
    } catch (error) {
      console.error('获取趋势数据失败:', error)
      // 返回空数组而不是抛出错误
      return []
    }
  }
  
  // 获取分类统计数据
  async getCategoryData(dateRange?: DateRange, type: 'income' | 'expense' = 'expense'): Promise<CategoryData[]> {
    try {
      const queryParams: any = { type }
      if (dateRange) {
        queryParams.startDate = dateRange.startDate
        queryParams.endDate = dateRange.endDate
      }
      
      const records = await recordRepository.findByQuery(queryParams)
      const categories = await categoryRepository.findAll()
      
      // 如果没有记录，返回空数组
      if (!records || records.length === 0) {
        return []
      }
      
      // 按分类分组统计
      const categoryStats: { [categoryId: string]: { amount: number; count: number } } = {}
      
      records.forEach(record => {
        if (!record.categoryId || !record.amount || isNaN(record.amount)) return
        
        if (!categoryStats[record.categoryId]) {
          categoryStats[record.categoryId] = { amount: 0, count: 0 }
        }
        categoryStats[record.categoryId].amount += record.amount
        categoryStats[record.categoryId].count += 1
      })
      
      // 计算总金额用于百分比计算
      const totalAmount = Object.values(categoryStats).reduce((sum, stat) => sum + (stat.amount || 0), 0)
      
      // 转换为分类数据
      const categoryData: CategoryData[] = []
      
      Object.entries(categoryStats).forEach(([categoryId, stats]) => {
        const category = categories.find(c => c.id === categoryId)
        if (category && stats.amount > 0) {
          categoryData.push({
            categoryId,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            amount: stats.amount,
            count: stats.count,
            percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
          })
        }
      })
      
      // 按金额排序
      return categoryData.sort((a, b) => b.amount - a.amount)
    } catch (error) {
      console.error('获取分类统计数据失败:', error)
      return []
    }
  }
  
  // 获取账户统计数据
  async getAccountData(dateRange?: DateRange): Promise<AccountData[]> {
    try {
      const accounts = await accountRepository.findAll()
      
      // 如果没有账户，返回空数组
      if (!accounts || accounts.length === 0) {
        return []
      }
      
      const accountStats = await accountRepository.getAccountStats()
      
      // 计算总余额用于百分比计算
      const totalBalance = accounts.reduce((sum, account) => sum + Math.abs(account.balance || 0), 0)
      
      // 转换为账户数据
      const accountData: AccountData[] = accounts.map(account => {
        const stats = accountStats.find(s => s.accountId === account.id)
        const balance = account.balance || 0
        
        return {
          accountId: account.id,
          accountName: account.name,
          accountIcon: account.icon,
          accountColor: account.color,
          balance,
          percentage: totalBalance > 0 ? (Math.abs(balance) / totalBalance) * 100 : 0
        }
      }).filter(account => account.balance !== 0) // 过滤余额为0的账户
      
      // 按余额排序
      return accountData.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    } catch (error) {
      console.error('获取账户统计数据失败:', error)
      return []
    }
  }
  
  // 获取月度对比数据
  async getMonthlyComparison(monthCount: number = 6): Promise<any[]> {
    try {
      const months = []
      const now = new Date()
      
      for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const startDate = formatDate(date, 'YYYY-MM-01')
        const endDate = formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'YYYY-MM-DD')
        
        const records = await recordRepository.findByQuery({
          startDate,
          endDate
        })
        
        const income = records
          .filter(r => r.type === 'income')
          .reduce((sum, r) => sum + r.amount, 0)
        
        const expense = records
          .filter(r => r.type === 'expense')
          .reduce((sum, r) => sum + r.amount, 0)
        
        months.push({
          month: formatDate(date, 'YYYY-MM'),
          income,
          expense,
          balance: income - expense
        })
      }
      
      return months
    } catch (error) {
      console.error('获取月度对比数据失败:', error)
      throw error
    }
  }
  
  // 计算日期间隔天数
  private getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }
}

export const statisticsService = new StatisticsService()
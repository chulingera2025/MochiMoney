import { db, BaseRepository } from '../index'
import type { Record, RecordQueryParams, RecordStats, RecordsByDate } from '@/types/record'
import type { DateRange } from '@/types'

export class RecordRepository extends BaseRepository<Record> {
  constructor() {
    super(db.records)
  }

  // 根据类型查询记录
  async findByType(type: 'income' | 'expense'): Promise<Record[]> {
    return await this.table.where('type').equals(type).and(record => !record.isDeleted).toArray()
  }

  // 根据分类查询记录
  async findByCategory(categoryId: string): Promise<Record[]> {
    return await this.table.where('categoryId').equals(categoryId).and(record => !record.isDeleted).toArray()
  }

  // 根据账户查询记录
  async findByAccount(accountId: string): Promise<Record[]> {
    return await this.table.where('accountId').equals(accountId).and(record => !record.isDeleted).toArray()
  }

  // 根据日期范围查询记录
  async findByDateRange(startDate: string, endDate: string): Promise<Record[]> {
    return await this.table
      .where('date')
      .between(startDate, endDate, true, true)
      .and(record => !record.isDeleted)
      .reverse()
      .sortBy('date')
  }

  // 获取最近的记录
  async findRecent(limit: number = 10): Promise<Record[]> {
    return await this.table
      .toCollection()
      .and(record => !record.isDeleted)
      .reverse()
      .sortBy('createdAt')
      .then(records => records.slice(0, limit))
  }

  // 复合查询
  async findByQuery(params: RecordQueryParams): Promise<Record[]> {
    let collection = this.table.toCollection().and(record => record.isDeleted === false)

    if (params.type) {
      collection = collection.and(record => record.type === params.type)
    }

    if (params.categoryId) {
      collection = collection.and(record => record.categoryId === params.categoryId)
    }

    if (params.accountId) {
      collection = collection.and(record => record.accountId === params.accountId)
    }

    if (params.startDate && params.endDate) {
      collection = collection.and(record =>
        record.date >= params.startDate! && record.date <= params.endDate!
      )
    }

    if (params.keyword) {
      collection = collection.and(record =>
        (record.remark?.includes(params.keyword!) ?? false) ||
        (record.tags?.some(tag => tag.includes(params.keyword!)) ?? false)
      )
    }

    let results = await collection.toArray()

    // 排序
    results.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // 分页
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      results = results.slice(start, end)
    }

    return results
  }

  // 获取统计数据
  async getStats(dateRange?: DateRange): Promise<RecordStats> {
    let collection = this.table.toCollection().and(record => record.isDeleted === false)

    if (dateRange) {
      collection = collection.and(record =>
        record.date >= dateRange.startDate && record.date <= dateRange.endDate
      )
    }

    const records = await collection.toArray()

    const totalIncome = records
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)

    const totalExpense = records
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: records.length
    }
  }

  // 按日期分组获取记录
  async getRecordsByDate(dateRange: DateRange): Promise<RecordsByDate[]> {
    const records = await this.findByDateRange(dateRange.startDate, dateRange.endDate)

    const groupedRecords: { [date: string]: Record[] } = {}

    records.forEach(record => {
      if (!groupedRecords[record.date]) {
        groupedRecords[record.date] = []
      }
      groupedRecords[record.date].push(record)
    })

    const result: RecordsByDate[] = []

    for (const [date, dateRecords] of Object.entries(groupedRecords)) {
      const totalIncome = dateRecords
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0)

      const totalExpense = dateRecords
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0)

      result.push({
        date,
        records: dateRecords,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      })
    }

    // 按日期倒序排序
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return result
  }

  // 获取分类统计
  async getCategoryStats(dateRange?: DateRange): Promise<{ categoryId: string; totalAmount: number; count: number }[]> {
    let collection = this.table.toCollection().and(record => record.isDeleted === false)

    if (dateRange) {
      collection = collection.and(record =>
        record.date >= dateRange.startDate && record.date <= dateRange.endDate
      )
    }

    const records = await collection.toArray()
    const categoryStats: { [categoryId: string]: { totalAmount: number; count: number } } = {}

    records.forEach(record => {
      if (!categoryStats[record.categoryId]) {
        categoryStats[record.categoryId] = { totalAmount: 0, count: 0 }
      }
      categoryStats[record.categoryId].totalAmount += record.amount
      categoryStats[record.categoryId].count += 1
    })

    return Object.entries(categoryStats).map(([categoryId, stats]) => ({
      categoryId,
      totalAmount: stats.totalAmount,
      count: stats.count
    }))
  }

  // 获取账户统计
  async getAccountStats(dateRange?: DateRange): Promise<{ accountId: string; totalAmount: number; count: number }[]> {
    let collection = this.table.toCollection().and(record => record.isDeleted === false)

    if (dateRange) {
      collection = collection.and(record =>
        record.date >= dateRange.startDate && record.date <= dateRange.endDate
      )
    }

    const records = await collection.toArray()
    const accountStats: { [accountId: string]: { totalAmount: number; count: number } } = {}

    records.forEach(record => {
      if (!accountStats[record.accountId]) {
        accountStats[record.accountId] = { totalAmount: 0, count: 0 }
      }
      accountStats[record.accountId].totalAmount += record.amount
      accountStats[record.accountId].count += 1
    })

    return Object.entries(accountStats).map(([accountId, stats]) => ({
      accountId,
      totalAmount: stats.totalAmount,
      count: stats.count
    }))
  }

  // 软删除记录
  async softDelete(id: string): Promise<void> {
    await this.table.update(id, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    })
  }

  // 恢复已删除的记录
  async restore(id: string): Promise<void> {
    await this.table.update(id, {
      isDeleted: false,
      updatedAt: new Date().toISOString()
    })
  }

  // 永久删除记录
  async hardDelete(id: string): Promise<void> {
    await this.table.delete(id)
  }

  // 获取回收站中的记录
  async getDeletedRecords(): Promise<Record[]> {
    return await this.table.toCollection().and(record => record.isDeleted === true).toArray()
  }

  // 清空回收站
  async emptyTrash(): Promise<void> {
    const deletedRecords = await this.getDeletedRecords()
    const ids = deletedRecords.map(record => record.id)
    await this.table.bulkDelete(ids)
  }

  // 批量创建记录
  async bulkCreate(records: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Record[]> {
    const now = new Date().toISOString()
    const recordsWithIds = records.map(record => ({
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    }))

    await this.table.bulkAdd(recordsWithIds)
    return recordsWithIds
  }
}

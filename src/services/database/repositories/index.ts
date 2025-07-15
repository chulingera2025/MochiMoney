// 导入所有数据仓库类
import { RecordRepository } from './RecordRepository'
import { CategoryRepository } from './CategoryRepository'
import { AccountRepository } from './AccountRepository'
import { BudgetRepository } from './BudgetRepository'

// 导出所有数据仓库类
export { RecordRepository, CategoryRepository, AccountRepository, BudgetRepository }

// 创建仓库实例
export const recordRepository = new RecordRepository()
export const categoryRepository = new CategoryRepository()
export const accountRepository = new AccountRepository()
export const budgetRepository = new BudgetRepository()

// 仓库工厂
export const createRepositories = () => {
  return {
    record: new RecordRepository(),
    category: new CategoryRepository(),
    account: new AccountRepository(),
    budget: new BudgetRepository()
  }
}
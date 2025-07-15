import { db, BaseRepository } from '../index'
import type { Category, CategoryQueryParams, CategoryTreeNode } from '@/types/category'
import type { RecordType } from '@/types/record'

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(db.categories)
  }

  // 根据类型查询分类
  async findByType(type: RecordType): Promise<Category[]> {
    return await this.table
      .where('type')
      .equals(type)
      .and(category => category.isEnabled)
      .sortBy('order')
  }

  // 根据父分类查询子分类
  async findByParent(parentId: string): Promise<Category[]> {
    return await this.table
      .where('parentId')
      .equals(parentId)
      .and(category => category.isEnabled)
      .sortBy('order')
  }

  // 获取所有父分类
  async findParentCategories(type?: RecordType): Promise<Category[]> {
    let collection = this.table.filter(category => !category.parentId)

    if (type) {
      collection = collection.filter(category => category.type === type)
    }

    return await collection
      .filter(category => Boolean(category.isEnabled))
      .sortBy('order')
  }

  // 获取所有子分类
  async findSubCategories(type?: RecordType): Promise<Category[]> {
    let collection = this.table.filter(category => !!category.parentId)

    if (type) {
      collection = collection.filter(category => category.type === type)
    }

    return await collection
      .filter(category => Boolean(category.isEnabled))
      .sortBy('order')
  }

  // 获取启用的分类
  async findEnabled(): Promise<Category[]> {
    return await this.table
      .toCollection()
      .and(category => category.isEnabled === true)
      .sortBy('order')
  }

  // 获取系统分类
  async findSystemCategories(): Promise<Category[]> {
    return await this.table
      .toCollection()
      .and(category => category.isSystem === true)
      .sortBy('order')
  }

  // 获取自定义分类
  async findCustomCategories(): Promise<Category[]> {
    return await this.table
      .toCollection()
      .and(category => category.isSystem === false)
      .sortBy('order')
  }

  // 复合查询
  async findByQuery(params: CategoryQueryParams): Promise<Category[]> {
    let collection = this.table.toCollection()

    if (params.type) {
      collection = collection.and(category => category.type === params.type)
    }

    if (params.parentId !== undefined) {
      collection = collection.and(category => category.parentId === params.parentId)
    }

    if (params.isEnabled !== undefined) {
      collection = collection.and(category => category.isEnabled === params.isEnabled)
    }

    if (params.keyword) {
      collection = collection.and(category =>
        category.name.includes(params.keyword!)
      )
    }

    return await collection.sortBy('order')
  }

  // 构建分类树
  async buildCategoryTree(type?: RecordType): Promise<CategoryTreeNode[]> {
    let categories = await this.findEnabled()

    if (type) {
      categories = categories.filter(category => category.type === type)
    }

    const categoryMap = new Map<string, CategoryTreeNode>()
    const rootCategories: CategoryTreeNode[] = []

    // 创建节点映射
    categories.forEach(category => {
      const node: CategoryTreeNode = {
        ...category,
        children: [],
        level: 0
      }
      categoryMap.set(category.id, node)
    })

    // 构建树结构
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children!.push(node)
          node.level = parent.level + 1
        }
      } else {
        rootCategories.push(node)
      }
    })

    return rootCategories
  }

  // 获取分类路径
  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = []
    let currentCategory = await this.findById(categoryId)

    while (currentCategory) {
      path.unshift(currentCategory)

      if (currentCategory.parentId) {
        currentCategory = await this.findById(currentCategory.parentId)
      } else {
        break
      }
    }

    return path
  }

  // 检查分类名称是否重复
  async isNameExists(name: string, type: RecordType, excludeId?: string): Promise<boolean> {
    let collection = this.table
      .toCollection()
      .and(category => category.name === name && category.type === type)

    if (excludeId) {
      collection = collection.and(category => category.id !== excludeId)
    }

    const count = await collection.count()
    return count > 0
  }

  // 检查是否有子分类
  async hasChildren(parentId: string): Promise<boolean> {
    const count = await this.table.where('parentId').equals(parentId).count()
    return count > 0
  }

  // 更新分类排序
  async updateOrder(categoryOrders: { id: string; order: number }[]): Promise<void> {
    const updates = categoryOrders.map(({ id, order }) => ({
      key: id,
      changes: { order, updatedAt: new Date().toISOString() }
    }))

    await this.table.bulkUpdate(updates)
  }

  // 删除分类（检查是否有子分类和关联记录）
  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    // 检查是否有子分类
    const hasChildren = await this.hasChildren(id)
    if (hasChildren) {
      return { success: false, message: '该分类下还有子分类，无法删除' }
    }

    // 检查是否有关联记录
    const recordCount = await db.records.where('categoryId').equals(id).count()
    if (recordCount > 0) {
      return { success: false, message: '该分类下还有记录，无法删除' }
    }

    await this.delete(id)
    return { success: true }
  }

  // 启用/禁用分类
  async toggleEnabled(id: string): Promise<void> {
    const category = await this.findById(id)
    if (!category) {
      throw new Error('分类不存在')
    }

    await this.update(id, {
      isEnabled: !category.isEnabled
    })
  }

  // 移动分类到其他父分类
  async moveToParent(categoryId: string, newParentId?: string): Promise<void> {
    // 验证不能移动到自己的子分类
    if (newParentId) {
      const categoryPath = await this.getCategoryPath(newParentId)
      const isDescendant = categoryPath.some(cat => cat.id === categoryId)
      if (isDescendant) {
        throw new Error('不能移动到自己的子分类')
      }
    }

    await this.update(categoryId, { parentId: newParentId })
  }

  // 批量创建分类
  async bulkCreate(categories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Category[]> {
    const now = new Date().toISOString()
    const categoriesWithIds = categories.map((category, index) => ({
      ...category,
      id: this.generateId(),
      order: category.order || index,
      createdAt: now,
      updatedAt: now
    }))

    await this.table.bulkAdd(categoriesWithIds)
    return categoriesWithIds
  }

  // 获取分类使用统计
  async getCategoryUsageStats(): Promise<{ categoryId: string; categoryName: string; recordCount: number }[]> {
    const categories = await this.findAll()
    const stats = []

    for (const category of categories) {
      const recordCount = await db.records
        .where('categoryId')
        .equals(category.id)
        .and(record => !record.isDeleted)
        .count()

      stats.push({
        categoryId: category.id,
        categoryName: category.name,
        recordCount
      })
    }

    return stats.sort((a, b) => b.recordCount - a.recordCount)
  }
}

<template>
  <div class="category-list-page">
    <AppHeader 
      title="分类管理" 
      show-left-arrow
      @click-left="goBack"
    />
    
    <div class="category-list-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 分类类型切换 -->
      <div class="category-type-tabs">
        <van-tabs v-model:active="activeTab" @change="handleTabChange">
          <van-tab title="支出分类" name="expense" />
          <van-tab title="收入分类" name="income" />
        </van-tabs>
      </div>
      
      <!-- 分类列表 -->
      <div class="category-list">
        <div v-if="categories.length === 0" class="empty-state">
          <van-empty
            description="暂无分类"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          />
        </div>
        
        <div v-else class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            @click="handleCategoryClick(category)"
          >
            <div class="category-icon" :style="{ backgroundColor: category.color + '20', color: category.color }">
              {{ getCategoryIcon(category.icon) }}
            </div>
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-stats">
                <span class="record-count">{{ category.recordCount || 0 }}笔</span>
                <span class="total-amount">{{ formatAmount(category.totalAmount || 0) }}</span>
              </div>
            </div>
            <div class="category-actions">
              <van-icon
                name="edit"
                @click.stop="editCategory(category)"
                class="action-icon"
              />
              <van-icon
                name="delete"
                @click.stop="deleteCategory(category)"
                class="action-icon delete-icon"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加分类按钮 -->
      <div class="add-category-btn">
        <van-button
          type="primary"
          size="large"
          icon="plus"
          @click="addCategory"
          block
        >
          添加{{ activeTab === 'expense' ? '支出' : '收入' }}分类
        </van-button>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'

import { categoryRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { CATEGORY_ICONS } from '@/constants/categories'
import { useAsyncData } from '@/composables/useLazyLoad'

import type { Category } from '@/types/category'

interface CategoryWithStats extends Category {
  recordCount?: number
  totalAmount?: number
}

const router = useRouter()

// 状态
const activeTab = ref<'expense' | 'income'>('expense')

// 使用全局懒加载获取分类数据
const { 
  data: allCategories, 
  isLoading, 
  showContent, 
  fadeIn,
  refresh 
} = useAsyncData<CategoryWithStats[]>(
  async () => {
    const result = await categoryRepository.findAll()
    return result
  },
  {
    errorHandler: (error) => {
      console.error('加载分类失败:', error)
      showToast('加载失败，请重试')
    },
    loadingDelay: 50 // 50ms的加载延迟，避免闪烁
  }
)

// 保存当前选中的标签类型到 sessionStorage
const saveActiveTab = (tab: 'expense' | 'income') => {
  sessionStorage.setItem('category-active-tab', tab)
}

// 从 sessionStorage 恢复选中的标签类型
const restoreActiveTab = () => {
  const savedTab = sessionStorage.getItem('category-active-tab')
  if (savedTab === 'expense' || savedTab === 'income') {
    activeTab.value = savedTab
  }
}

// 当前分类列表
const categories = computed(() => {
  return allCategories.value?.filter(category => category.type === activeTab.value) || []
})

// 获取分类图标
const getCategoryIcon = (iconName: string): string => {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
}

// 处理标签切换
const handleTabChange = (name: string | number) => {
  activeTab.value = name as 'expense' | 'income'
  saveActiveTab(activeTab.value)
}

// 处理分类点击
const handleCategoryClick = (category: CategoryWithStats) => {
  router.push(`/categories/detail/${category.id}`)
}

// 添加分类
const addCategory = () => {
  router.push(`/categories/add?type=${activeTab.value}`)
}

// 编辑分类
const editCategory = (category: CategoryWithStats) => {
  router.push(`/categories/edit/${category.id}`)
}

// 删除分类
const deleteCategory = async (category: CategoryWithStats) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${category.name}"分类吗？删除后该分类下的记录将被标记为"未分类"。`
    })
    
    await categoryRepository.delete(category.id)
    showToast('删除成功')
    
    // 重新加载数据
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      showToast('删除失败，请重试')
    }
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  restoreActiveTab()
})

// 页面激活时恢复状态（用于从其他页面返回）
onActivated(() => {
  restoreActiveTab()
})
</script>

<style scoped>
.category-list-page {
  min-height: 100vh;
  background: var(--color-background);
}

.category-list-content {
  padding-bottom: var(--space-xl);
}

.category-type-tabs {
  background: var(--color-background-card);
  box-shadow: var(--shadow-sm);
}

.category-list {
  padding: var(--space-md);
}

.empty-state {
  padding: var(--space-xl) 0;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

.category-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.category-item:active {
  transform: scale(0.98);
  background: var(--color-background-light);
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
  font-size: 20px;
}


.category-info {
  flex: 1;
}

.category-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.category-stats {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-count {
  
}

.total-amount {
  color: var(--color-primary);
  font-weight: 500;
}

.category-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-background-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.action-icon:active {
  transform: scale(0.9);
}

.action-icon.delete-icon {
  color: var(--color-danger);
}

.add-category-btn {
  padding: var(--space-md);
  margin-top: var(--space-lg);
}

:deep(.van-tabs__wrap) {
  padding: 0 var(--space-md);
  background: var(--color-background-card);
}

:deep(.van-tabs__nav) {
  background: var(--color-background-card);
}

:deep(.van-tabs__content) {
  padding: 0;
}

:deep(.van-tab) {
  flex: 1;
  color: var(--color-text-primary);
}

:deep(.van-tab--active) {
  color: var(--color-primary);
}

:deep(.van-tabs__line) {
  background: var(--color-primary);
}

/* 渐入动画 */
.category-list-content {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.category-list-content.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* 分类项依次渐入 */
.category-grid .category-item {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.fade-in .category-grid .category-item {
  opacity: 1;
  transform: translateY(0);
}

/* 为每个分类项添加延迟动画 */
.fade-in .category-grid .category-item:nth-child(1) { transition-delay: 0.05s; }
.fade-in .category-grid .category-item:nth-child(2) { transition-delay: 0.1s; }
.fade-in .category-grid .category-item:nth-child(3) { transition-delay: 0.15s; }
.fade-in .category-grid .category-item:nth-child(4) { transition-delay: 0.2s; }
.fade-in .category-grid .category-item:nth-child(5) { transition-delay: 0.25s; }
.fade-in .category-grid .category-item:nth-child(6) { transition-delay: 0.3s; }
.fade-in .category-grid .category-item:nth-child(7) { transition-delay: 0.35s; }
.fade-in .category-grid .category-item:nth-child(8) { transition-delay: 0.4s; }
.fade-in .category-grid .category-item:nth-child(9) { transition-delay: 0.45s; }
.fade-in .category-grid .category-item:nth-child(10) { transition-delay: 0.5s; }
</style>
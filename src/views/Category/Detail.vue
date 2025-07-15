<template>
  <div class="category-detail-page">
    <AppHeader 
      :title="category?.name || '分类详情'"
      show-left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="edit" @click="editCategory" />
      </template>
    </AppHeader>
    
    <div class="category-detail-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }" v-if="category">
      <!-- 分类信息 -->
      <div class="category-info-card lazy-card">
        <div class="category-header">
          <div class="category-icon" :style="{ backgroundColor: category.color + '20', color: category.color }">
            {{ getCategoryIcon(category.icon) }}
          </div>
          <div class="category-basic">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-type">
              {{ category.type === 'expense' ? '支出分类' : '收入分类' }}
            </div>
          </div>
        </div>
        
        <div class="category-stats">
          <div class="stats-item">
            <div class="stats-value">{{ recordCount }}</div>
            <div class="stats-label">记录数</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ formatAmount(totalAmount) }}</div>
            <div class="stats-label">总金额</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ formatAmount(avgAmount) }}</div>
            <div class="stats-label">平均金额</div>
          </div>
        </div>
      </div>
      
      <!-- 时间范围选择 -->
      <div class="time-range-card lazy-card">
        <van-dropdown-menu>
          <van-dropdown-item 
            v-model="selectedPeriod" 
            :options="periodOptions"
            @change="handlePeriodChange"
          />
        </van-dropdown-menu>
      </div>
      
      <!-- 记录列表 -->
      <div class="records-section lazy-card">
        <div class="section-header">
          <span>相关记录</span>
          <span class="record-count">{{ records.length }}笔</span>
        </div>
        
        <div class="records-list">
          <Loading v-if="loading" />
          
          <Empty 
            v-else-if="records.length === 0"
            description="暂无相关记录"
          />
          
          <div v-else>
            <RecordItem
              v-for="record in records"
              :key="record.id"
              :record="record"
              @click="goToRecordDetail(record)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'
import RecordItem from '@/components/record/RecordItem.vue'

import { categoryRepository, recordRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { getDateRange } from '@/utils/date'
import { CATEGORY_ICONS } from '@/constants/categories'
import { useAsyncData } from '@/composables/useLazyLoad'

import type { Category } from '@/types/category'
import type { Record } from '@/types/record'

const router = useRouter()
const route = useRoute()

// 状态
const loading = ref(false)
const category = ref<Category | null>(null)
const records = ref<Record[]>([])
const selectedPeriod = ref('thisMonth')

// 使用懒加载
const { isLoading, showContent, fadeIn } = useAsyncData(
  async () => {
    const categoryId = route.params.id as string
    if (!categoryId) {
      showToast('分类ID不存在')
      router.back()
      return
    }
    
    // 加载分类信息
    const categoryResult = await categoryRepository.findById(categoryId)
    if (categoryResult) {
      category.value = categoryResult
    } else {
      showToast('分类不存在')
      router.back()
      return
    }
    
    // 加载记录列表
    await loadRecords(categoryId)
    
    return categoryResult
  },
  {
    errorHandler: (error) => {
      console.error('加载分类失败:', error)
      showToast('加载失败，请重试')
    },
    loadingDelay: 50
  }
)

// 时间范围选项
const periodOptions = [
  { text: '本月', value: 'thisMonth' },
  { text: '上月', value: 'lastMonth' },
  { text: '本年', value: 'thisYear' },
  { text: '全部', value: 'all' }
]

// 计算属性
const recordCount = computed(() => records.value.length)

const totalAmount = computed(() => {
  return records.value.reduce((sum, record) => sum + record.amount, 0)
})

const avgAmount = computed(() => {
  return recordCount.value > 0 ? totalAmount.value / recordCount.value : 0
})

// 获取分类图标
const getCategoryIcon = (iconName: string): string => {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
}

// 加载记录列表
const loadRecords = async (categoryId: string) => {
  loading.value = true
  
  try {
    const queryParams: any = {
      categoryId
    }
    
    // 设置日期范围
    if (selectedPeriod.value !== 'all') {
      const dateRange = getDateRange(selectedPeriod.value as any)
      queryParams.startDate = dateRange.startDate
      queryParams.endDate = dateRange.endDate
    }
    
    const result = await recordRepository.findByQuery(queryParams)
    records.value = result
  } catch (error) {
    console.error('加载记录失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理时间范围变化
const handlePeriodChange = () => {
  if (category.value) {
    loadRecords(category.value.id)
  }
}

// 编辑分类
const editCategory = () => {
  if (category.value) {
    router.push(`/categories/edit/${category.value.id}`)
  }
}

// 跳转到记录详情
const goToRecordDetail = (record: Record) => {
  router.push(`/records/detail/${record.id}`)
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.category-detail-page {
  min-height: 100vh;
  background: var(--color-background);
}

.category-detail-content {
  padding-bottom: var(--space-xl);
}

.category-info-card {
  background: var(--color-background-card);
  margin: var(--space-md);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
  font-size: 30px;
}


.category-basic {
  flex: 1;
}

.category-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.category-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.category-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.stats-item {
  text-align: center;
  flex: 1;
}

.stats-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.stats-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.time-range-card {
  margin: 0 var(--space-md);
  background: var(--color-background);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.records-section {
  margin: var(--space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.record-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: normal;
}

.records-list {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

:deep(.van-dropdown-menu) {
  background: var(--color-background);
  box-shadow: none;
}

:deep(.van-dropdown-item) {
  background: var(--color-background);
}

:deep(.van-dropdown-item__title) {
  color: #ffffff;
}

:deep(.van-dropdown-item__icon) {
  color: #ffffff;
}

:deep(.van-dropdown-item__content) {
  background: var(--color-background);
  border: 1px solid var(--color-border);
}

:deep(.van-dropdown-item__option) {
  color: #ffffff;
  background: var(--color-background);
}

:deep(.van-dropdown-item__option--active) {
  color: var(--color-primary);
  background: var(--color-background-card);
}

:deep(.app-header__right) {
  color: var(--color-primary);
  font-size: 18px;
  cursor: pointer;
}
</style>
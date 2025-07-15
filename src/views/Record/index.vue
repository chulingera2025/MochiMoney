<template>
  <div class="record-list-page">
    <AppHeader title="记录" />
    
    <div class="record-list-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 统计信息 -->
      <div class="record-list__stats lazy-card" v-if="stats">
        <div class="stats-card">
          <div class="stats-item">
            <div class="stats-value income">{{ formatAmount(stats.totalIncome) }}</div>
            <div class="stats-label">收入</div>
          </div>
          <div class="stats-item">
            <div class="stats-value expense">{{ formatAmount(stats.totalExpense) }}</div>
            <div class="stats-label">支出</div>
          </div>
          <div class="stats-item">
            <div class="stats-value balance">{{ formatAmount(stats.balance) }}</div>
            <div class="stats-label">结余</div>
          </div>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="record-list__records lazy-card">
        <Empty 
          v-if="recordsByDate.length === 0"
          description="暂无记录"
          action-text="开始记账"
          @action="goToAdd"
        />
        
        <div v-else class="lazy-list">
          <div 
            v-for="dateGroup in recordsByDate" 
            :key="dateGroup.date"
            class="record-date-group lazy-item"
          >
            <!-- 日期标题 -->
            <div class="record-date-header">
              <div class="record-date-title">
                {{ formatDateTitle(dateGroup.date) }}
              </div>
              <div class="record-date-summary">
                <span v-if="dateGroup.totalIncome > 0" class="income">
                  收入 {{ formatAmount(dateGroup.totalIncome) }}
                </span>
                <span v-if="dateGroup.totalExpense > 0" class="expense">
                  支出 {{ formatAmount(dateGroup.totalExpense) }}
                </span>
              </div>
            </div>
            
            <!-- 记录列表 -->
            <div class="record-date-list">
              <RecordItem
                v-for="record in dateGroup.records"
                :key="record.id"
                :record="record"
                @click="goToDetail(record)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
    
    <!-- 底部导航 -->
    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import AppTabbar from '@/components/common/AppTabbar.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'
import RecordItem from '@/components/record/RecordItem.vue'

import { recordRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { getDateRange, getRelativeTime } from '@/utils/date'
import { useAsyncData } from '@/composables/useLazyLoad'

import type { Record, RecordsByDate, RecordStats } from '@/types/record'

const router = useRouter()

// 状态
const recordsByDate = ref<RecordsByDate[]>([])
const stats = ref<RecordStats | null>(null)

// 使用懒加载
const { isLoading, showContent, fadeIn } = useAsyncData(
  async () => {
    // 加载记录列表 - 获取本月数据
    const dateRange = getDateRange('thisMonth')
    const records = await recordRepository.findByQuery({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
    
    // 按日期分组
    recordsByDate.value = await recordRepository.getRecordsByDate(dateRange)
    
    // 加载统计数据
    stats.value = await recordRepository.getStats(dateRange)
    
    return records
  },
  {
    errorHandler: (error) => {
      console.error('加载记录失败:', error)
      showToast('加载失败，请重试')
    },
    loadingDelay: 50
  }
)

// 格式化日期标题
const formatDateTitle = (date: string): string => {
  return getRelativeTime(date)
}

// 跳转到添加页面
const goToAdd = () => {
  router.push('/records/add')
}

// 跳转到详情页面
const goToDetail = (record: Record) => {
  router.push(`/records/detail/${record.id}`)
}
</script>

<style scoped>
.record-list-page {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 80px; /* 增加底部间距，为 TabBar 留出空间 */
}

.record-list-content {
  padding-bottom: 100px; /* 确保内容不被悬浮按钮遮挡 */
}

.record-list__stats {
  padding: var(--space-md);
}

.stats-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.stats-item {
  text-align: center;
  flex: 1;
}

.stats-value {
  font-size: var(--font-size-lg);
  font-weight: bold;
  margin-bottom: var(--space-xs);
}

.stats-value.income {
  color: var(--color-success);
}

.stats-value.expense {
  color: var(--color-danger);
}

.stats-value.balance {
  color: var(--color-text-primary);
}

.stats-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-list__records {
  position: relative;
}

.record-date-group {
  margin-bottom: var(--space-md);
}

.record-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-background);
  position: sticky;
  top: 44px;
  z-index: 10;
}

.record-date-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.record-date-summary {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.record-date-summary .income {
  color: var(--color-success);
}

.record-date-summary .expense {
  color: var(--color-danger);
}

.record-date-list {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  margin: 0 var(--space-md);
  overflow: hidden;
}
</style>
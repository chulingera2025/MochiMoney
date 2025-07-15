<template>
  <div class="statistics-page">
    <AppHeader title="统计" />
    
    <div class="statistics-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 时间范围选择 -->
      <div class="time-range-selector">
        <div class="period-selector" @click="showPeriodPopup = !showPeriodPopup">
          <span class="period-text">{{ getCurrentPeriodText() }}</span>
          <van-icon name="arrow-down" class="period-arrow" :class="{ 'rotated': showPeriodPopup }" />
        </div>
        
        <!-- 下拉选择器 -->
        <transition name="dropdown">
          <div v-if="showPeriodPopup" class="period-dropdown">
            <div class="period-options">
              <div 
                v-for="option in periodOptions" 
                :key="option.value"
                class="period-option"
                :class="{ active: selectedPeriod === option.value }"
                @click="selectPeriod(option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- 收支概览 -->
      <div class="income-expense-overview">
        <div class="overview-card">
          <div class="overview-item income">
            <div class="overview-icon">
              <van-icon name="plus" />
            </div>
            <div class="overview-info">
              <div class="overview-label">收入</div>
              <div class="overview-amount">{{ formatAmount(statistics.totalIncome) }}</div>
            </div>
          </div>
          
          <div class="overview-item expense">
            <div class="overview-icon">
              <van-icon name="minus" />
            </div>
            <div class="overview-info">
              <div class="overview-label">支出</div>
              <div class="overview-amount">{{ formatAmount(statistics.totalExpense) }}</div>
            </div>
          </div>
          
          <div class="overview-item balance">
            <div class="overview-icon">
              <van-icon name="balance-o" />
            </div>
            <div class="overview-info">
              <div class="overview-label">结余</div>
              <div class="overview-amount" :class="{ negative: statistics.balance < 0 }">
                {{ formatAmount(statistics.balance) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 图表切换 -->
      <div class="chart-tabs">
        <van-tabs v-model:active="activeChart" @change="handleChartChange">
          <van-tab title="趋势图" name="trend" />
          <van-tab title="分类占比" name="category" />
          <van-tab title="账户分布" name="account" />
        </van-tabs>
      </div>
      
      <!-- 图表容器 -->
      <div class="chart-container">
        <Loading v-if="loading" />
        
        <div v-else-if="!hasData" class="no-data">
          <van-empty
            description="暂无数据"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          />
        </div>
        
        <div v-else>
          <!-- 趋势图 -->
          <TrendChart 
            v-if="activeChart === 'trend'"
            :data="trendData"
            :period="selectedPeriod"
          />
          
          <!-- 分类占比图 -->
          <CategoryChart 
            v-else-if="activeChart === 'category'"
            :expense-data="expenseCategoryData"
            :income-data="incomeCategoryData"
            @category-click="handleCategoryClick"
          />
          
          <!-- 账户分布图 -->
          <AccountChart 
            v-else-if="activeChart === 'account'"
            :data="accountData"
          />
        </div>
      </div>
      
      <!-- 详细统计 -->
      <div class="detail-statistics">
        <div class="section-header">
          <span>详细统计</span>
        </div>
        
        <div class="detail-cards">
          <!-- 分类统计 -->
          <div class="detail-card">
            <div class="card-header">
              <span>分类统计</span>
              <span class="card-action" @click="showCategoryDetail">查看详情</span>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span>支出分类</span>
                <span>{{ statistics.expenseCategories }}个</span>
              </div>
              <div class="stat-item">
                <span>收入分类</span>
                <span>{{ statistics.incomeCategories }}个</span>
              </div>
              <div class="stat-item">
                <span>最高支出</span>
                <span>{{ formatAmount(statistics.maxExpense) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 账户统计 -->
          <div class="detail-card">
            <div class="card-header">
              <span>账户统计</span>
              <span class="card-action" @click="showAccountDetail">查看详情</span>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span>活跃账户</span>
                <span>{{ statistics.activeAccounts }}个</span>
              </div>
              <div class="stat-item">
                <span>总资产</span>
                <span>{{ formatAmount(statistics.totalAssets) }}</span>
              </div>
              <div class="stat-item">
                <span>总负债</span>
                <span>{{ formatAmount(statistics.totalDebts) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 交易统计 -->
          <div class="detail-card">
            <div class="card-header">
              <span>交易统计</span>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span>总交易数</span>
                <span>{{ statistics.totalRecords }}笔</span>
              </div>
              <div class="stat-item">
                <span>日均交易</span>
                <span>{{ statistics.avgDailyRecords }}笔</span>
              </div>
              <div class="stat-item">
                <span>日均支出</span>
                <span>{{ formatAmount(statistics.avgDailyExpense) }}</span>
              </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import AppTabbar from '@/components/common/AppTabbar.vue'
import Loading from '@/components/common/Loading.vue'
import TrendChart from '@/components/statistics/TrendChart.vue'
import CategoryChart from '@/components/statistics/CategoryChart.vue'
import AccountChart from '@/components/statistics/AccountChart.vue'

import { statisticsService } from '@/services/statistics'
import { formatAmount } from '@/utils/number'
import { getDateRange } from '@/utils/date'
import { useLazyLoad } from '@/composables/useLazyLoad'

import type { StatisticsData, TrendData, CategoryData, AccountData } from '@/types/statistics'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 状态
const loading = ref(false)
const selectedPeriod = ref('thisMonth')
const activeChart = ref('trend')
const showPeriodPopup = ref(false)

// 统计数据
const statistics = ref<StatisticsData>({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  expenseCategories: 0,
  incomeCategories: 0,
  maxExpense: 0,
  activeAccounts: 0,
  totalAssets: 0,
  totalDebts: 0,
  totalRecords: 0,
  avgDailyRecords: 0,
  avgDailyExpense: 0
})

const trendData = ref<TrendData[]>([])
const expenseCategoryData = ref<CategoryData[]>([])
const incomeCategoryData = ref<CategoryData[]>([])
const accountData = ref<AccountData[]>([])

// 时间范围选项
const periodOptions = [
  { text: '本月', value: 'thisMonth' },
  { text: '上月', value: 'lastMonth' },
  { text: '本年', value: 'thisYear' },
  { text: '最近3个月', value: 'last3Months' },
  { text: '最近6个月', value: 'last6Months' },
  { text: '全部', value: 'all' }
]

// 计算属性
const hasData = computed(() => {
  return statistics.value.totalRecords > 0
})

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true
  
  try {
    const dateRange = selectedPeriod.value === 'all' 
      ? undefined 
      : getDateRange(selectedPeriod.value as any)
    
    // 加载基础统计数据
    const [statsData, trendChart, expenseChart, incomeChart, accountChart] = await Promise.all([
      statisticsService.getStatistics(dateRange),
      statisticsService.getTrendData(dateRange),
      statisticsService.getCategoryData(dateRange, 'expense'),
      statisticsService.getCategoryData(dateRange, 'income'),
      statisticsService.getAccountData(dateRange)
    ])
    
    // 确保数据有效性，提供默认值
    statistics.value = statsData || {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      expenseCategories: 0,
      incomeCategories: 0,
      maxExpense: 0,
      activeAccounts: 0,
      totalAssets: 0,
      totalDebts: 0,
      totalRecords: 0,
      avgDailyRecords: 0,
      avgDailyExpense: 0
    }
    
    trendData.value = Array.isArray(trendChart) ? trendChart : []
    expenseCategoryData.value = Array.isArray(expenseChart) ? expenseChart : []
    incomeCategoryData.value = Array.isArray(incomeChart) ? incomeChart : []
    accountData.value = Array.isArray(accountChart) ? accountChart : []
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    showToast('加载失败，请重试')
    
    // 设置默认值以防止渲染错误
    statistics.value = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      expenseCategories: 0,
      incomeCategories: 0,
      maxExpense: 0,
      activeAccounts: 0,
      totalAssets: 0,
      totalDebts: 0,
      totalRecords: 0,
      avgDailyRecords: 0,
      avgDailyExpense: 0
    }
    
    trendData.value = []
    expenseCategoryData.value = []
    incomeCategoryData.value = []
    accountData.value = []
  } finally {
    loading.value = false
  }
}

// 获取当前时间范围文本
const getCurrentPeriodText = () => {
  const option = periodOptions.find(opt => opt.value === selectedPeriod.value)
  return option?.text || '本月'
}

// 选择时间范围
const selectPeriod = (value: string) => {
  selectedPeriod.value = value
  showPeriodPopup.value = false
  loadStatistics()
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const selector = document.querySelector('.time-range-selector')
  if (selector && !selector.contains(target)) {
    showPeriodPopup.value = false
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 处理时间范围变化
const handlePeriodChange = () => {
  loadStatistics()
}

// 处理图表切换
const handleChartChange = (name: string | number) => {
  activeChart.value = name as string
}

// 处理分类点击
const handleCategoryClick = (categoryData: CategoryData) => {
  console.log('点击分类:', categoryData)
  // 这里可以导航到分类详情页或显示更多信息
}

// 显示分类详情
const showCategoryDetail = () => {
  router.push('/statistics/category')
}

// 显示账户详情
const showAccountDetail = () => {
  router.push('/statistics/account')
}

// 组件挂载时加载数据
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadStatistics()
  showContentWithDelay(50)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 60px;
}

.statistics-content {
  padding-bottom: var(--space-xl);
}

.time-range-selector {
  background: var(--color-background-card);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 10;
}

.period-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  cursor: pointer;
  transition: background-color 0.2s;
}

.period-selector:hover {
  background: var(--color-background-light);
}

.period-text {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  font-weight: 500;
}

.period-arrow {
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

.period-arrow.rotated {
  transform: rotate(180deg);
}

.period-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.period-options {
  padding: var(--space-sm);
}

.period-option {
  padding: var(--space-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--space-xs);
}

.period-option:last-child {
  margin-bottom: 0;
}

.period-option:hover {
  background: var(--color-background-light);
}

.period-option.active {
  background: var(--color-primary);
  color: #ffffff;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

.dropdown-container {
  position: relative;
  overflow: visible;
}

.income-expense-overview {
  padding: var(--space-md);
}

.overview-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.overview-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
}

.overview-item:last-child {
  margin-bottom: 0;
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.overview-item.income .overview-icon {
  background: var(--color-success-light);
}

.overview-item.income .overview-icon .van-icon {
  color: var(--color-success);
  font-size: 24px;
}

.overview-item.expense .overview-icon {
  background: var(--color-danger-light);
}

.overview-item.expense .overview-icon .van-icon {
  color: var(--color-danger);
  font-size: 24px;
}

.overview-item.balance .overview-icon {
  background: var(--color-primary-light);
}

.overview-item.balance .overview-icon .van-icon {
  color: var(--color-primary);
  font-size: 24px;
}

.overview-info {
  flex: 1;
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.overview-amount {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.overview-amount.negative {
  color: var(--color-danger);
}

.chart-tabs {
  background: var(--color-background);
  margin: 0 var(--space-md);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.chart-tabs :deep(.van-tabs__wrap) {
  background: var(--color-background) !important;
}

.chart-tabs :deep(.van-tabs__nav) {
  background: var(--color-background) !important;
}

.chart-tabs :deep(.van-tab) {
  flex: 1;
  color: var(--color-text-light) !important;
  background: var(--color-background) !important;
}

.chart-tabs :deep(.van-tab--active) {
  color: var(--color-text-primary) !important;
  background: var(--color-background) !important;
}

.chart-tabs :deep(.van-tabs__line) {
  background: var(--color-primary) !important;
}

.chart-container {
  margin: var(--space-md);
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  min-height: 300px;
  box-shadow: var(--shadow-sm);
}

.no-data {
  padding: var(--space-xl) 0;
}

.detail-statistics {
  padding: 0 var(--space-md);
}

.section-header {
  padding: var(--space-md) 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-action {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  cursor: pointer;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.stat-item > span:first-child {
  color: var(--color-text-secondary);
}

.stat-item > span:last-child {
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>
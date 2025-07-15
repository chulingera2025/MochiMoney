<template>
  <div class="home-page">
    <AppHeader title="糯米记账" />

    <div class="home-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 汇总卡片 -->
      <div class="summary-card lazy-card">
        <div class="summary-item">
          <div class="amount income">¥{{ formatAmount(summaryData.monthlyIncome) }}</div>
          <div class="label">本月收入</div>
        </div>
        <div class="summary-item">
          <div class="amount expense">¥{{ formatAmount(summaryData.monthlyExpense) }}</div>
          <div class="label">本月支出</div>
        </div>
        <div class="summary-item">
          <div class="amount balance" :class="{ 'negative': summaryData.monthlyBalance < 0 }">
            {{ summaryData.monthlyBalance < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(summaryData.monthlyBalance)) }}
          </div>
          <div class="label">本月结余</div>
        </div>
      </div>

      <!-- 快速记账 -->
      <div class="quick-add-section lazy-card">
        <van-button
          type="primary"
          size="large"
          round
          @click="goToAddRecord"
          class="add-record-btn"
        >
          <van-icon name="plus" />
          记一笔
        </van-button>
      </div>

      <!-- 最近记录 -->
      <div class="recent-records lazy-card">
        <div class="section-title">最近记录</div>
        <div v-if="recentRecords.length > 0" class="records-list">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="record-item"
            @click="goToRecordDetail(record.id)"
          >
            <div class="record-info">
              <div class="record-category">
                {{ getCategoryIcon(record.categoryIcon) }} {{ record.categoryName }}
                <span v-if="record.remark" class="record-remark">· {{ record.remark }}</span>
              </div>
              <div class="record-date">{{ formatDate(record.date) }}</div>
            </div>
            <div class="record-amount" :class="record.type">
              {{ record.type === 'income' ? '+' : '-' }}¥{{ formatAmount(record.amount) }}
            </div>
          </div>
          <div class="view-all" @click="goToRecords">
            查看全部记录 →
          </div>
        </div>
        <Empty
          v-else
          description="暂无记录"
          action-text="开始记账"
          @action="goToAddRecord"
        />
      </div>
    </div>

    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />

    <!-- 备案号 -->
    <div class="footer-info">
      <p class="beian-info">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
          杵凌科技-苏ICP备2025156595号
        </a>
      </p>
    </div>

    <!-- 底部导航 -->
    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppTabbar from '@/components/common/AppTabbar.vue'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'
import { RecordRepository } from '@/services/database/repositories/RecordRepository'
import { CategoryRepository } from '@/services/database/repositories/CategoryRepository'
import { formatMoney } from '@/utils/number'
import { formatDateString } from '@/utils/date'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 数据状态
const recentRecords = ref<any[]>([])
const summaryData = ref({
  monthlyIncome: 0,
  monthlyExpense: 0,
  monthlyBalance: 0
})

// 数据仓库
const recordRepository = new RecordRepository()
const categoryRepository = new CategoryRepository()

// 加载最近记录
const loadRecentRecords = async () => {
  try {
    const records = await recordRepository.findRecent(5)
    const categories = await categoryRepository.findAll()

    recentRecords.value = records.map(record => {
      const category = categories.find(c => c.id === record.categoryId)
      return {
        ...record,
        categoryName: category?.name || '未知分类',
        categoryIcon: category?.icon || 'other'
      }
    })
  } catch (error) {
    console.error('加载最近记录失败:', error)
    recentRecords.value = []
  }
}

// 加载月度汇总
const loadMonthlySummary = async () => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDate = startOfMonth.toISOString().split('T')[0]
    const endDate = endOfMonth.toISOString().split('T')[0]

    const records = await recordRepository.findByDateRange(startDate, endDate)

    let income = 0
    let expense = 0

    records.forEach(record => {
      if (record.type === 'income') {
        income += record.amount
      } else {
        expense += record.amount
      }
    })

    summaryData.value = {
      monthlyIncome: income,
      monthlyExpense: expense,
      monthlyBalance: income - expense
    }
  } catch (error) {
    console.error('加载月度汇总失败:', error)
  }
}

// 格式化金额
const formatAmount = (amount: number) => {
  return formatMoney(amount / 100) // 假设数据库存储的是分
}

// 格式化日期
const formatDate = (dateString: string) => {
  return formatDateString(dateString, 'MM-DD')
}

// 获取分类图标
const getCategoryIcon = (icon: string) => {
  // 这里可以映射图标，暂时返回emoji
  const iconMap: Record<string, string> = {
    food: '🍽️',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎉',
    medical: '💊',
    education: '📚',
    housing: '🏠',
    salary: '💰',
    bonus: '🎁',
    investment: '📈',
    other: '📝'
  }
  return iconMap[icon] || '📝'
}

// 页面初始化
const initHomePage = async () => {
  try {
    // 并行加载数据
    await Promise.all([
      loadRecentRecords(),
      loadMonthlySummary()
    ])

    // 显示内容
    showContentWithDelay(50)
  } catch (error) {
    console.error('首页初始化失败:', error)
    showContentWithDelay(50)
  }
}

// 跳转函数
const goToAddRecord = () => {
  router.push('/records/add')
}

const goToRecords = () => {
  router.push('/records')
}

const goToRecordDetail = (id: string) => {
  router.push(`/records/detail/${id}`)
}

// 页面挂载时初始化
onMounted(() => {
  initHomePage()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 60px;
}

.home-content {
  padding: var(--space-md);
}

.summary-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.summary-item {
  text-align: center;
  flex: 1;
}

.amount {
  font-size: var(--font-size-lg);
  font-weight: bold;
  margin-bottom: var(--space-xs);
}

.amount.income {
  color: var(--color-success);
}

.amount.expense {
  color: var(--color-danger);
}

.amount.balance {
  color: var(--color-text-primary);
}

.amount.balance.negative {
  color: var(--color-danger);
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.quick-add-section {
  margin-bottom: var(--space-lg);
  text-align: center;
}

.add-record-btn {
  width: 200px;
  height: 50px;
  font-size: var(--font-size-lg);
}

.recent-records {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

/* 记录列表样式 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-background-light);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color 0.2s;
}

.record-item:hover,
.record-item:active {
  background: var(--color-background);
}

.record-info {
  flex: 1;
}

.record-category {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.record-remark {
  color: var(--color-text-secondary);
  font-weight: normal;
  margin-left: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-amount {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.record-amount.income {
  color: var(--color-success);
}

.record-amount.expense {
  color: var(--color-danger);
}

.view-all {
  text-align: center;
  padding: var(--space-md);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-sm);
  transition: opacity 0.2s;
}

.view-all:hover,
.view-all:active {
  opacity: 0.7;
}

/* 备案号样式 */
.footer-info {
  padding: var(--space-md) var(--space-lg) var(--space-sm);
  text-align: center;
  background: var(--color-background);
}

.beian-info {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  line-height: 1.4;
}

.beian-info a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.beian-info a:hover {
  color: var(--color-text-secondary);
}
</style>

<template>
  <div class="account-detail-page">
    <AppHeader 
      :title="account?.name || '账户详情'"
      show-left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="edit" @click="editAccount" />
      </template>
    </AppHeader>
    
    <div class="account-detail-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }" v-if="account">
      <!-- 账户信息 -->
      <div class="account-info-card">
        <div class="account-header">
          <div class="account-icon">
            <van-icon :name="account.icon" />
          </div>
          <div class="account-basic">
            <div class="account-name">{{ account.name }}</div>
            <div class="account-type">{{ getAccountTypeName(account.type) }}</div>
          </div>
        </div>
        
        <div class="account-balance">
          <div class="balance-label">账户余额</div>
          <div class="balance-amount" :class="{ negative: account.balance < 0 }">
            {{ formatAmount(account.balance) }}
          </div>
        </div>
        
        <div class="account-stats">
          <div class="stats-item">
            <div class="stats-value">{{ recordCount }}</div>
            <div class="stats-label">记录数</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ formatAmount(totalIncome) }}</div>
            <div class="stats-label">总收入</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ formatAmount(totalExpense) }}</div>
            <div class="stats-label">总支出</div>
          </div>
        </div>
      </div>
      
      <!-- 时间范围选择 -->
      <div class="time-range-card">
        <van-dropdown-menu>
          <van-dropdown-item 
            v-model="selectedPeriod" 
            :options="periodOptions"
            @change="handlePeriodChange"
          />
        </van-dropdown-menu>
      </div>
      
      <!-- 记录列表 -->
      <div class="records-section">
        <div class="section-header">
          <span>相关记录</span>
          <span class="record-count">{{ records.length }}笔</span>
        </div>
        
        <div class="records-list">
          <Loading v-if="isLoading" />
          
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
      
      <!-- 操作按钮 -->
      <div class="account-actions">
        <van-button
          type="primary"
          size="large"
          @click="goToAddRecord"
          icon="plus"
        >
          记一笔
        </van-button>
        
        <van-button
          type="default"
          size="large"
          @click="syncBalance"
          :loading="syncLoading"
        >
          同步余额
        </van-button>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
    
    <Loading v-else overlay />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'
import RecordItem from '@/components/record/RecordItem.vue'

import { accountRepository, recordRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { getDateRange } from '@/utils/date'
import { useAsyncData } from '@/composables/useLazyLoad'

import type { Account, AccountType } from '@/types/account'
import type { Record as RecordType } from '@/types/record'

const router = useRouter()
const route = useRoute()

// 状态
const syncLoading = ref(false)
const account = ref<Account | null>(null)
const records = ref<RecordType[]>([])
const selectedPeriod = ref('thisMonth')

// 使用懒加载
const { isLoading, showContent, fadeIn, refresh } = useAsyncData(
  async () => {
    const accountId = route.params.id as string
    if (!accountId) {
      showToast('账户ID不存在')
      router.back()
      return
    }
    
    // 加载账户信息
    const accountResult = await accountRepository.findById(accountId)
    if (accountResult) {
      account.value = accountResult
    } else {
      showToast('账户不存在')
      router.back()
      return
    }
    
    // 加载记录列表
    await loadRecords(accountId)
    
    return accountResult
  },
  {
    errorHandler: (error) => {
      console.error('加载账户失败:', error)
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

const totalIncome = computed(() => {
  return records.value
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0)
})

const totalExpense = computed(() => {
  return records.value
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0)
})

// 获取账户图标名称（已在上面定义）

// 获取账户类型名称
const getAccountTypeName = (type: AccountType): string => {
  const typeNames: Record<AccountType, string> = {
    cash: '现金',
    bank_card: '银行卡',
    credit_card: '信用卡',
    alipay: '支付宝',
    wechat: '微信',
    investment: '投资',
    other: '其他'
  }
  return typeNames[type] || '未知'
}

// 加载记录列表
const loadRecords = async (accountId: string) => {
  try {
    const queryParams: any = {
      accountId
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
  }
}

// 处理时间范围变化
const handlePeriodChange = () => {
  if (account.value) {
    loadRecords(account.value.id)
  }
}

// 编辑账户
const editAccount = () => {
  if (account.value) {
    router.push(`/accounts/edit/${account.value.id}`)
  }
}

// 同步余额
const syncBalance = async () => {
  if (!account.value) return
  
  try {
    await showConfirmDialog({
      title: '确认同步',
      message: '将根据记录重新计算账户余额，确认操作吗？'
    })
    
    syncLoading.value = true
    
    await accountRepository.syncBalance(account.value.id)
    showToast('同步成功')
    
    // 重新加载账户信息
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步余额失败:', error)
      showToast('同步失败，请重试')
    }
  } finally {
    syncLoading.value = false
  }
}

// 跳转到记录详情
const goToRecordDetail = (record: RecordType) => {
  router.push(`/records/detail/${record.id}`)
}

// 跳转到添加记录
const goToAddRecord = () => {
  router.push(`/records/add?accountId=${account.value?.id}`)
}

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时初始化已通过 useAsyncData 自动处理
</script>

<style scoped>
.account-detail-page {
  min-height: 100vh;
  background: var(--color-background);
}

.account-detail-content {
  padding-bottom: var(--space-xl);
}

.account-info-card {
  background: var(--color-background-card);
  margin: var(--space-md);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.account-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.account-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.account-icon .van-icon {
  font-size: 30px;
  color: var(--color-primary);
}

.account-basic {
  flex: 1;
}

.account-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.account-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.account-balance {
  text-align: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.balance-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.balance-amount {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.balance-amount.negative {
  color: var(--color-danger);
}

.account-stats {
  display: flex;
  justify-content: space-between;
}

.stats-item {
  text-align: center;
  flex: 1;
}

.stats-value {
  font-size: var(--font-size-md);
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
  background: var(--color-background-card);
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

.account-actions {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
}

.account-actions .van-button {
  flex: 1;
}

:deep(.van-dropdown-menu) {
  --van-dropdown-menu-background: var(--color-background-card);
}

:deep(.app-header__right) {
  color: var(--color-primary);
  font-size: 18px;
  cursor: pointer;
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  :deep(.van-dropdown-menu) {
    --van-dropdown-menu-background: var(--color-background-card);
    color: var(--color-text-primary);
  }

  :deep(.van-dropdown-item) {
    background: var(--color-background-card);
    color: var(--color-text-primary);
  }

  :deep(.van-dropdown-item__title) {
    color: var(--color-text-primary);
  }

  :deep(.van-dropdown-item__icon) {
    color: var(--color-text-primary);
  }

  :deep(.van-dropdown-item__content) {
    background: var(--color-background-card);
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }

  :deep(.van-dropdown-item__option) {
    color: var(--color-text-primary);
    background: var(--color-background-card);
  }

  :deep(.van-dropdown-item__option:hover) {
    background: var(--color-background-light);
  }

  :deep(.van-dropdown-item__option--active) {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }
}
</style>
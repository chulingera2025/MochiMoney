<template>
  <div class="account-list-page">
    <AppHeader title="账户管理" show-left-arrow @click-left="goBack" />

    <div class="account-list-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 总览卡片 -->
      <div class="account-overview">
        <div class="overview-card">
          <div class="overview-item">
            <div class="overview-value">{{ formatAmount(totalAssets) }}</div>
            <div class="overview-label">总资产</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ formatAmount(totalDebts) }}</div>
            <div class="overview-label">总负债</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ formatAmount(netAssets) }}</div>
            <div class="overview-label">净资产</div>
          </div>
        </div>
      </div>

      <!-- 账户列表 -->
      <div class="account-list">
        <div class="section-header">
          <span>我的账户</span>
          <span class="account-count">{{ accounts.length }}个</span>
        </div>

        <div class="account-items">
          <Empty
            v-if="accounts.length === 0"
            description="暂无账户"
            action-text="添加账户"
            @action="addAccount"
          />

          <div v-else>
            <div
              v-for="account in accounts"
              :key="account.id"
              class="account-item"
              @click="handleAccountClick(account)"
            >
              <div class="account-icon">
                <van-icon :name="account.icon" />
              </div>
              <div class="account-info">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-type">{{ getAccountTypeName(account.type) }}</div>
              </div>
              <div class="account-balance">
                <div class="balance-amount" :class="{ negative: account.balance < 0 }">
                  {{ formatAmount(account.balance) }}
                </div>
                <div class="balance-status">
                  <span :class="{ disabled: !account.isEnabled }">
                    {{ account.isEnabled ? '启用' : '禁用' }}
                  </span>
                </div>
              </div>
              <div class="account-actions">
                <van-icon
                  name="edit"
                  @click.stop="editAccount(account)"
                  class="action-icon"
                />
                <van-icon
                  name="delete"
                  @click.stop="deleteAccount(account)"
                  class="action-icon delete-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加账户按钮 -->
      <div class="add-account-btn">
        <van-button
          type="primary"
          size="large"
          icon="plus"
          @click="addAccount"
          block
        >
          添加账户
        </van-button>
      </div>
    </div>

    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

import { accountRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { useAsyncData } from '@/composables/useLazyLoad'

import type { Account, AccountType } from '@/types/account'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, refresh } = useAsyncData(
  async () => {
    const result = await accountRepository.findAll()
    accounts.value = result

    // 加载统计数据
    const [totalAssets, totalDebts] = await Promise.all([
      accountRepository.getTotalAssets(),
      accountRepository.getTotalDebts()
    ])

    stats.value = {
      totalAssets,
      totalDebts,
      netAssets: totalAssets - totalDebts
    }

    return result
  },
  {
    errorHandler: (error) => {
      console.error('加载账户失败:', error)
      showToast('加载失败，请重试')
    },
    loadingDelay: 50
  }
)

// 状态
const accounts = ref<Account[]>([])
const stats = ref({
  totalAssets: 0,
  totalDebts: 0,
  netAssets: 0
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 计算属性
const totalAssets = computed(() => stats.value.totalAssets)
const totalDebts = computed(() => stats.value.totalDebts)
const netAssets = computed(() => stats.value.netAssets)

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

// 处理账户点击
const handleAccountClick = (account: Account) => {
  router.push(`/accounts/detail/${account.id}`)
}

// 添加账户
const addAccount = () => {
  router.push('/accounts/add')
}

// 编辑账户
const editAccount = (account: Account) => {
  router.push(`/accounts/edit/${account.id}`)
}

// 删除账户
const deleteAccount = async (account: Account) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${account.name}"账户吗？删除后该账户下的记录将无法使用。`
    })

    const result = await accountRepository.deleteAccount(account.id)
    if (result.success) {
      showToast('删除成功')
      refresh()
    } else {
      showToast(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账户失败:', error)
      showToast('删除失败，请重试')
    }
  }
}

// 组件挂载时加载数据已通过 useAsyncData 自动处理
</script>

<style scoped>
.account-list-page {
  min-height: 100vh;
  background: var(--color-background);
}

.account-list-content {
  padding-bottom: var(--space-xl);
}

.account-overview {
  padding: var(--space-md);
}

.overview-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.overview-item {
  text-align: center;
  flex: 1;
}

.overview-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.account-list {
  padding: 0 var(--space-md);
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

.account-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: normal;
}

.account-items {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.account-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.account-item:last-child {
  border-bottom: none;
}

.account-item:active {
  background-color: var(--color-background-light);
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.account-icon .van-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.account-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.account-balance {
  text-align: right;
  margin-right: var(--space-md);
}

.balance-amount {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.balance-amount.negative {
  color: var(--color-danger);
}

.balance-status {
  font-size: var(--font-size-sm);
  color: var(--color-success);
}

.balance-status .disabled {
  color: var(--color-text-secondary);
}

.account-actions {
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
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:active {
  transform: scale(0.9);
}

.action-icon.delete-icon {
  color: var(--color-danger);
}

.add-account-btn {
  padding: var(--space-md);
  margin-top: var(--space-lg);
}
</style>

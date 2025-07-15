<template>
  <div class="record-detail-page">
    <AppHeader
      title="记录详情"
      :left-arrow="true"
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="edit" @click="goToEdit" />
      </template>
    </AppHeader>

    <div class="record-detail-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <Loading v-if="loading" overlay />

      <div v-else-if="record" class="record-detail">
        <!-- 基本信息卡片 -->
        <div class="detail-card">
          <div class="detail-header">
            <div class="detail-icon">
              <div
                class="category-icon"
                :style="{ backgroundColor: categoryColor }"
              >
                {{ categoryIcon }}
              </div>
            </div>
            <div class="detail-info">
              <div class="detail-title">{{ categoryName }}</div>
              <div class="detail-subtitle">{{ accountName }}</div>
            </div>
            <div class="detail-amount">
              <div
                class="amount-text"
                :class="{
                  'amount-text--income': record.type === 'income',
                  'amount-text--expense': record.type === 'expense'
                }"
              >
                {{ record.type === 'income' ? '+' : '-' }}{{ formatAmount(record.amount) }}
              </div>
              <div class="amount-type">{{ record.type === 'income' ? '收入' : '支出' }}</div>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-card">
          <div class="detail-list">
            <div class="detail-item">
              <div class="item-label">分类</div>
              <div class="item-value">{{ categoryName }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">账户</div>
              <div class="item-value">{{ accountName }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">金额</div>
              <div class="item-value">{{ formatAmount(record.amount) }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">时间</div>
              <div class="item-value">{{ formatDateOnly(record.date) }}</div>
            </div>
            <div class="detail-item" v-if="record.remark">
              <div class="item-label">备注</div>
              <div class="item-value">{{ record.remark }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">创建时间</div>
              <div class="item-value">{{ formatFullDateTime(record.createdAt) }}</div>
            </div>
            <div class="detail-item" v-if="record.updatedAt !== record.createdAt">
              <div class="item-label">修改时间</div>
              <div class="item-value">{{ formatFullDateTime(record.updatedAt) }}</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <van-button
            type="primary"
            size="large"
            round
            @click="goToEdit"
            class="action-button"
          >
            编辑记录
          </van-button>
          <van-button
            type="danger"
            size="large"
            round
            @click="handleDelete"
            class="action-button"
          >
            删除记录
          </van-button>
        </div>
      </div>

      <!-- 记录不存在 -->
      <div v-else class="record-not-found">
        <Empty
          description="记录不存在"
          action-text="返回列表"
          @action="goToRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

import { recordRepository, categoryRepository, accountRepository } from '@/services/database/repositories'
import { formatAmount } from '@/utils/number'
import { formatDate, formatTime } from '@/utils/date'
import { CATEGORY_ICONS } from '@/constants/categories'

import type { Record } from '@/types/record'
import type { Category } from '@/types/category'
import type { Account } from '@/types/account'

const router = useRouter()
const route = useRoute()

// 使用懒加载
const { showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 状态
const loading = ref(true)
const record = ref<Record | null>(null)
const category = ref<Category | null>(null)
const account = ref<Account | null>(null)

// 计算属性
const recordId = computed(() => route.params.id as string)

const categoryName = computed(() => category.value?.name || '未知分类')
const categoryColor = computed(() => category.value?.color || '#E0E0E0')
const categoryIcon = computed(() => {
  const iconName = category.value?.icon || 'other'
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
})

const accountName = computed(() => account.value?.name || '未知账户')

// 加载记录数据
const loadRecord = async () => {
  if (!recordId.value) {
    showToast('记录ID无效')
    goBack()
    return
  }

  try {
    // 加载记录
    const recordData = await recordRepository.findById(recordId.value)
    if (!recordData) {
      record.value = null
      return
    }

    record.value = recordData

    // 加载关联数据
    await Promise.all([
      loadCategory(recordData.categoryId),
      loadAccount(recordData.accountId)
    ])

  } catch (error) {
    console.error('加载记录失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    // 显示内容
    await showContentWithDelay(50)
  }
}

// 加载分类数据
const loadCategory = async (categoryId: string) => {
  try {
    category.value = await categoryRepository.findById(categoryId) || null
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载账户数据
const loadAccount = async (accountId: string) => {
  try {
    account.value = await accountRepository.findById(accountId) || null
  } catch (error) {
    console.error('加载账户失败:', error)
  }
}

// 格式化日期时间
const formatDateTime = (date: string, time: string): string => {
  return `${date} ${time}`
}

// 格式化只显示日期
const formatDateOnly = (date: string): string => {
  return dayjs(date).format('YYYY年MM月DD日')
}

// 格式化完整日期时间
const formatFullDateTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return `${formatDate(date, 'YYYY-MM-DD')} ${formatTime(date, 'HH:mm:ss')}`
}

// 跳转到编辑页面
const goToEdit = () => {
  if (!record.value) return
  router.push(`/records/edit/${record.value.id}`)
}

// 删除记录
const handleDelete = async () => {
  if (!record.value) return

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '删除后无法恢复，确认删除吗？'
    })

    await recordRepository.softDelete(record.value.id)
    showToast('删除成功')

    // 返回记录列表
    goToRecords()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error)
      showToast('删除失败，请重试')
    }
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到记录列表
const goToRecords = () => {
  router.push('/records')
}

// 组件挂载时加载数据
onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.record-detail-page {
  min-height: 100vh;
  background: var(--color-background);
}

.record-detail-content {
  position: relative;
  padding: var(--space-md);
  padding-bottom: 60px;
}

.record-detail {
  max-width: 600px;
  margin: 0 auto;
}

.detail-card {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--space-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.detail-header {
  display: flex;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.detail-icon {
  margin-right: var(--space-md);
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  font-weight: bold;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.detail-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.detail-amount {
  text-align: right;
}

.amount-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.amount-text--income {
  color: var(--color-success);
}

.amount-text--expense {
  color: var(--color-danger);
}

.amount-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail-list {
  padding: 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.detail-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  min-width: 80px;
}

.item-value {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  font-weight: 500;
  flex: 1;
  text-align: right;
  word-break: break-all;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.action-button {
  width: 100%;
  height: 50px;
  font-size: var(--font-size-md);
  font-weight: 600;
}

.record-not-found {
  padding: var(--space-xl) 0;
}

:deep(.van-nav-bar__right) {
  padding-right: var(--space-md);
  color: var(--color-primary);
  font-size: 18px;
  cursor: pointer;
}
</style>

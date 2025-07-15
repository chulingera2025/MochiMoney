<template>
  <div class="record-add-page">
    <AppHeader
      title="记一笔"
      show-left-arrow
      @click-left="handleCancel"
    />

    <div class="record-add-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <van-form @submit="handleSubmit" ref="formRef" class="lazy-form">
        <!-- 类型选择 -->
        <div class="record-add__field">
          <div class="field-label">类型</div>
          <div class="type-selector">
            <button
              type="button"
              class="type-btn"
              :class="{ 'type-btn--active': formData.type === 'expense', 'type-btn--expense': formData.type === 'expense' }"
              @click="formData.type = 'expense'"
            >
              支出
            </button>
            <button
              type="button"
              class="type-btn"
              :class="{ 'type-btn--active': formData.type === 'income', 'type-btn--income': formData.type === 'income' }"
              @click="formData.type = 'income'"
            >
              收入
            </button>
          </div>
        </div>

        <!-- 金额输入 -->
        <div class="record-add__amount-section">
          <AmountInput
            v-model="formData.amount"
            label="金额"
            required
            @change="handleAmountChange"
          />
        </div>

        <!-- 分类选择 -->
        <div class="record-add__field">
          <CategoryPicker
            v-model="formData.categoryId"
            :type="formData.type"
            label="分类"
            required
            @change="handleCategoryChange"
          />
        </div>

        <!-- 账户选择 -->
        <div class="record-add__field">
          <AccountPicker
            v-model="formData.accountId"
            label="账户"
            required
            @change="handleAccountChange"
          />
        </div>

        <!-- 日期选择 -->
        <div class="record-add__field">
          <van-field
            v-model="formData.dateDisplay"
            label="日期"
            placeholder="请选择日期"
            readonly
            is-link
            @click="showDatePicker = true"
          />
        </div>

        <!-- 备注输入 -->
        <div class="record-add__field">
          <van-field
            v-model="formData.remark"
            type="textarea"
            label="备注"
            placeholder="添加备注（可选）"
            rows="3"
            maxlength="100"
            show-word-limit
          />
        </div>

        <!-- 提交按钮 -->
        <div class="record-add__submit lazy-buttons">
          <van-button
            type="primary"
            size="large"
            round
            block
            :loading="submitting"
            native-type="submit"
          >
            保存记录
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

import AppHeader from '@/components/common/AppHeader.vue'
import AmountInput from '@/components/form/AmountInput.vue'
import CategoryPicker from '@/components/form/CategoryPicker.vue'
import AccountPicker from '@/components/form/AccountPicker.vue'
import Loading from '@/components/common/Loading.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

import { recordRepository, accountRepository } from '@/services/database/repositories'
import { UserSettings } from '@/utils'
import { yuanToFen } from '@/utils'
import { getCurrentDate } from '@/utils'

import type { RecordType } from '@/types/record.ts'
import type { Category } from '@/types/category.ts'
import type { Account } from '@/types/account.ts'

const router = useRouter()
const formRef = ref()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 表单数据
const formData = reactive({
  type: 'expense' as RecordType,
  amount: 0,
  categoryId: '',
  accountId: '',
  date: getCurrentDate(),
  dateDisplay: dayjs().format('YYYY年MM月DD日'),
  remark: ''
})

// 状态
const submitting = ref(false)
const showDatePicker = ref(false)
const selectedDate = ref<string[]>(['2024', '01', '01']) // Vant DatePicker期望字符串数组格式

// 日期限制
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

// 加载用户设置
onMounted(async () => {
  // 加载默认账户
  const defaultAccountId = UserSettings.getDefaultAccount()
  if (defaultAccountId) {
    formData.accountId = defaultAccountId
  }

  // 加载默认分类
  const defaultCategories = UserSettings.getDefaultCategory()
  if (defaultCategories[formData.type]) {
    formData.categoryId = defaultCategories[formData.type]
  }

  // 显示内容
  await showContentWithDelay(50)
})

// 监听类型变化，重置分类选择
watch(() => formData.type, (newType) => {
  // 当类型改变时，清空分类选择
  formData.categoryId = ''
})

// 处理取消
const handleCancel = async () => {
  // 检查是否有未保存的更改
  if (formData.amount > 0 || formData.remark) {
    try {
      await showConfirmDialog({
        title: '确认离开',
        message: '当前有未保存的内容，确认离开吗？'
      })
    } catch {
      return
    }
  }

  router.back()
}

// 处理金额变化
const handleAmountChange = (amount: number) => {
  formData.amount = amount
}

// 处理分类变化
const handleCategoryChange = (category: Category | null) => {
  if (category) {
    // 保存为默认分类
    UserSettings.setDefaultCategory(formData.type, category.id)
  }
}

// 处理账户变化
const handleAccountChange = (account: Account | null) => {
  if (account) {
    // 保存为默认账户
    UserSettings.setDefaultAccount(account.id)
  }
}

// 处理日期确认
const handleDateConfirm = () => {
  const [year, month, day] = selectedDate.value
  const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  formData.date = dateStr
  formData.dateDisplay = dayjs(dateStr).format('YYYY年MM月DD日')
  showDatePicker.value = false
}

// 表单验证
const validateForm = (): boolean => {
  if (formData.amount <= 0) {
    showToast('请输入有效金额')
    return false
  }

  if (!formData.categoryId) {
    showToast('请选择分类')
    return false
  }

  if (!formData.accountId) {
    showToast('请选择账户')
    return false
  }

  return true
}

// 处理提交
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    // 创建记录
    const record = await recordRepository.create({
      type: formData.type,
      amount: yuanToFen(formData.amount),
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: formData.date,
      time: new Date().toTimeString().slice(0, 8), // 添加time字段
      remark: formData.remark || undefined,
      tags: [],
      isDeleted: false
    })

    // 更新账户余额
    if (formData.type === 'income') {
      await accountRepository.increaseBalance(formData.accountId, yuanToFen(formData.amount))
    } else {
      await accountRepository.decreaseBalance(formData.accountId, yuanToFen(formData.amount))
    }

    showToast('记录保存成功')

    // 返回上一页
    router.back()
  } catch (error) {
    console.error('保存记录失败:', error)
    showToast('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.record-add-page {
  min-height: 100vh;
  background: var(--color-background);
}

.record-add-content {
  padding: var(--space-md);
  padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom));
}

.record-add__field {
  margin-bottom: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.field-label {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: var(--space-md);
}

.type-selector {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.type-btn {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-background-card);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-btn:hover {
  border-color: var(--color-primary);
}

.type-btn--active {
  color: white;
  border-color: transparent;
  transform: scale(1.02);
}

.type-btn--expense.type-btn--active {
  background: var(--color-danger);
  box-shadow: 0 4px 12px rgba(238, 10, 36, 0.3);
}

.type-btn--income.type-btn--active {
  background: var(--color-success);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.record-add__amount-section {
  margin-bottom: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.record-add__field {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.record-add__submit {
  margin-top: var(--space-xl);
  padding: 0 var(--space-md);
  margin-bottom: var(--space-lg);
}

/* Vant组件样式覆盖 */
:deep(.van-radio-group--horizontal) {
  gap: var(--space-lg);
  width: 100%;
  justify-content: center;
  display: flex;
  flex: 1;
}

:deep(.van-field__label) {
  color: var(--color-text-primary);
  font-weight: 500;
}

:deep(.van-field__control) {
  color: var(--color-text-primary);
  background: transparent !important;
}

:deep(.van-field__control::placeholder) {
  color: var(--color-text-light);
}

:deep(.van-field) {
  background: var(--color-background-card) !important;
  border: none;
}

:deep(.van-field__body) {
  background: var(--color-background-card) !important;
}

:deep(.van-cell) {
  background: var(--color-background-card) !important;
  border: none;
}

:deep(.van-radio) {
  margin: 0;
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  :deep(.van-field__control) {
    background: var(--color-background-card) !important;
    color: var(--color-text-primary) !important;
  }

  :deep(.van-field) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-cell) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-field__body) {
    background: var(--color-background-card) !important;
  }

  .type-btn {
    background: var(--color-background-card);
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }

  .type-btn--expense.type-btn--active {
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  }

  .type-btn--income.type-btn--active {
    box-shadow: 0 4px 12px rgba(57, 198, 109, 0.4);
  }
}
</style>

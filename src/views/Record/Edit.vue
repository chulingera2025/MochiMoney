<template>
  <div class="record-edit-page">
    <AppHeader 
      title="编辑记录" 
      :left-arrow="true"
      @click-left="goBack"
    />
    
    <div class="record-edit-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <Loading v-if="loading" overlay />
      
      <form v-else @submit.prevent="handleSubmit" class="record-edit-form">
        <!-- 类型选择 -->
        <div class="form-section">
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
        <div class="form-section">
          <AmountInput 
            v-model="formData.amount"
            :placeholder="formData.type === 'expense' ? '请输入支出金额' : '请输入收入金额'"
            @blur="validateAmount"
          />
          <div v-if="errors.amount" class="error-text">{{ errors.amount }}</div>
        </div>

        <!-- 分类选择 -->
        <div class="form-section">
          <CategoryPicker
            v-model="formData.categoryId"
            :type="formData.type"
            @select="handleCategorySelect"
          />
          <div v-if="errors.categoryId" class="error-text">{{ errors.categoryId }}</div>
        </div>

        <!-- 账户选择 -->
        <div class="form-section">
          <AccountPicker
            v-model="formData.accountId"
            @select="handleAccountSelect"
          />
          <div v-if="errors.accountId" class="error-text">{{ errors.accountId }}</div>
        </div>

        <!-- 日期选择 -->
        <div class="form-section">
          <van-cell 
            title="记录日期" 
            :value="formatDate(formData.date)"
            is-link
            @click="showDatePicker = true"
          />
          <div v-if="errors.date" class="error-text">{{ errors.date }}</div>
        </div>

        <!-- 备注输入 -->
        <div class="form-section">
          <van-field
            v-model="formData.remark"
            rows="3"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="备注（可选）"
            show-word-limit
          />
        </div>

        <!-- 提交按钮 -->
        <div class="form-section">
          <van-button 
            type="primary" 
            block 
            round 
            size="large"
            :loading="submitting"
            native-type="submit"
          >
            {{ submitting ? '保存中...' : '保存' }}
          </van-button>
        </div>
      </form>
    </div>

    <!-- 日期时间选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="dateTimeValue"
        title="选择日期"
        @confirm="handleDateTimeConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import dayjs from 'dayjs'

import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import AmountInput from '@/components/form/AmountInput.vue'
import CategoryPicker from '@/components/form/CategoryPicker.vue'
import AccountPicker from '@/components/form/AccountPicker.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

import { recordRepository, accountRepository } from '@/services/database/repositories'
import { fenToYuan, yuanToFen } from '@/utils/number'

import type { Record, CreateRecordData } from '@/types/record'

const router = useRouter()
const route = useRoute()

// 使用懒加载
const { showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 状态
const loading = ref(true)
const submitting = ref(false)
const showDatePicker = ref(false)
const originalRecord = ref<Record | null>(null)

// 表单数据
const formData = reactive<CreateRecordData>({
  type: 'expense',
  amount: 0,
  categoryId: '',
  accountId: '',
  date: dayjs().format('YYYY-MM-DD'),
  time: dayjs().format('HH:mm:ss'),
  remark: ''
})

// 表单验证错误
const errors = reactive({
  amount: '',
  categoryId: '',
  accountId: '',
  date: ''
})

// 日期时间值
const dateTimeValue = ref<string[]>(['2024', '01', '01']) // van-date-picker需要字符串数组

// 计算属性
const recordId = computed(() => route.params.id as string)

// 格式化显示日期
const formatDate = (date: string): string => {
  return date ? dayjs(date).format('YYYY年MM月DD日') : '请选择日期'
}

// 加载记录数据
const loadRecord = async () => {
  if (!recordId.value) {
    showToast('记录ID无效')
    goBack()
    return
  }

  try {
    const record = await recordRepository.findById(recordId.value)
    if (!record) {
      showToast('记录不存在')
      goBack()
      return
    }

    originalRecord.value = record
    
    // 填充表单数据
    formData.type = record.type
    formData.amount = fenToYuan(record.amount) // 将分转换为元
    formData.categoryId = record.categoryId
    formData.accountId = record.accountId
    formData.date = record.date
    formData.time = record.time
    formData.remark = record.remark || ''

    // 设置日期时间选择器的值
    if (record.date && record.time) {
      const [year, month, day] = record.date.split('-')
      dateTimeValue.value = [year, month, day]
    } else {
      // 如果没有时间信息，使用当前日期
      const now = new Date()
      const year = now.getFullYear().toString()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      dateTimeValue.value = [year, month, day]
    }

  } catch (error) {
    console.error('加载记录失败:', error)
    showToast('加载失败，请重试')
    goBack()
  } finally {
    loading.value = false
    // 显示内容
    await showContentWithDelay(50)
  }
}

// 验证金额
const validateAmount = () => {
  errors.amount = ''
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = '请输入有效金额'
    return false
  }
  return true
}

// 验证分类
const validateCategory = () => {
  errors.categoryId = ''
  if (!formData.categoryId) {
    errors.categoryId = '请选择分类'
    return false
  }
  return true
}

// 验证账户
const validateAccount = () => {
  errors.accountId = ''
  if (!formData.accountId) {
    errors.accountId = '请选择账户'
    return false
  }
  return true
}

// 验证日期
const validateDate = () => {
  errors.date = ''
  if (!formData.date) {
    errors.date = '请选择记录日期'
    return false
  }
  return true
}

// 验证整个表单
const validateForm = (): boolean => {
  const isAmountValid = validateAmount()
  const isCategoryValid = validateCategory()
  const isAccountValid = validateAccount()
  const isDateValid = validateDate()
  
  return isAmountValid && isCategoryValid && isAccountValid && isDateValid
}

// 处理分类选择
const handleCategorySelect = (categoryId: string) => {
  formData.categoryId = categoryId
  errors.categoryId = ''
}

// 处理账户选择
const handleAccountSelect = (accountId: string) => {
  formData.accountId = accountId
  errors.accountId = ''
}

// 处理日期确认
const handleDateTimeConfirm = () => {
  const [year, month, day] = dateTimeValue.value
  formData.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  showDatePicker.value = false
  errors.date = ''
}

// 处理表单提交
const handleSubmit = async () => {
  if (!validateForm()) {
    showToast('请检查输入内容')
    return
  }

  if (!originalRecord.value) {
    showToast('原始记录数据丢失')
    return
  }

  submitting.value = true

  try {
    // 检查是否有变更
    const hasChanges = 
      originalRecord.value.type !== formData.type ||
      originalRecord.value.amount !== yuanToFen(formData.amount) ||
      originalRecord.value.categoryId !== formData.categoryId ||
      originalRecord.value.accountId !== formData.accountId ||
      originalRecord.value.date !== formData.date ||
      (originalRecord.value.remark || '') !== formData.remark

    if (!hasChanges) {
      showToast('没有修改内容')
      goBack()
      return
    }

    // 更新记录
    await recordRepository.update(recordId.value, {
      type: formData.type,
      amount: yuanToFen(formData.amount), // 将元转换为分
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: formData.date,
      remark: formData.remark
    })

    // 更新账户余额
    await updateAccountBalances(originalRecord.value, {
      type: formData.type,
      amount: yuanToFen(formData.amount),
      accountId: formData.accountId
    })

    showToast('修改成功')
    goBack()

  } catch (error) {
    console.error('更新记录失败:', error)
    showToast('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 更新账户余额
const updateAccountBalances = async (
  originalRecord: Record, 
  newRecord: { type: string; amount: number; accountId: string }
) => {
  // 先撤销原记录对账户余额的影响
  if (originalRecord.type === 'income') {
    await accountRepository.decreaseBalance(originalRecord.accountId, originalRecord.amount)
  } else {
    await accountRepository.increaseBalance(originalRecord.accountId, originalRecord.amount)
  }

  // 再应用新记录对账户余额的影响
  if (newRecord.type === 'income') {
    await accountRepository.increaseBalance(newRecord.accountId, newRecord.amount)
  } else {
    await accountRepository.decreaseBalance(newRecord.accountId, newRecord.amount)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听类型变化，重置分类选择
watch(() => formData.type, (newType) => {
  // 当类型改变时，清空分类选择
  formData.categoryId = ''
  errors.categoryId = ''
})

// 组件挂载时加载数据
onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.record-edit-page {
  min-height: 100vh;
  background: var(--color-background);
}

.record-edit-content {
  position: relative;
  padding: var(--space-md);
  padding-bottom: 60px;
}

.record-edit-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: var(--space-lg);
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

.error-text {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--space-xs);
  margin-left: var(--space-sm);
}

:deep(.van-cell) {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  color: var(--color-text-primary);
}

:deep(.van-cell__title) {
  color: var(--color-text-primary);
}

:deep(.van-cell__value) {
  color: var(--color-text-primary);
}

:deep(.van-field) {
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
}

:deep(.van-field__control) {
  color: var(--color-text-primary);
  background: transparent;
}

:deep(.van-field__control::placeholder) {
  color: var(--color-text-light);
}

:deep(.van-date-picker) {
  background: var(--color-background-card);
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  :deep(.van-cell) {
    background: var(--color-background-card) !important;
    color: var(--color-text-primary) !important;
  }

  :deep(.van-cell__title) {
    color: var(--color-text-primary) !important;
  }

  :deep(.van-cell__value) {
    color: var(--color-text-primary) !important;
  }

  :deep(.van-field) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-field__control) {
    color: var(--color-text-primary) !important;
    background: transparent !important;
  }

  :deep(.van-field__control::placeholder) {
    color: var(--color-text-light) !important;
  }

  :deep(.van-field__body) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-date-picker) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-date-picker__toolbar) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-picker__toolbar) {
    background: var(--color-background-card) !important;
  }

  :deep(.van-picker__confirm) {
    color: var(--color-primary) !important;
  }

  :deep(.van-picker__cancel) {
    color: var(--color-text-secondary) !important;
  }

  :deep(.van-picker-column__item) {
    color: var(--color-text-primary) !important;
  }

  .type-btn {
    background: var(--color-background-card);
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }

  .type-btn--expense.type-btn--active {
    background: var(--color-danger);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  }

  .type-btn--income.type-btn--active {
    background: var(--color-success);
    box-shadow: 0 4px 12px rgba(57, 198, 109, 0.4);
  }
}
</style>
<template>
  <div class="account-add-page">
    <AppHeader 
      :title="isEdit ? '编辑账户' : '添加账户'"
      show-left-arrow
      @click-left="goBack"
    />
    
    <div class="account-form-content">
      <van-form @submit="handleSubmit">
        <!-- 账户名称 -->
        <van-field
          v-model="form.name"
          label="账户名称"
          placeholder="请输入账户名称"
          :rules="[{ required: true, message: '请输入账户名称' }]"
          maxlength="20"
          show-word-limit
        />
        
        <!-- 账户类型 -->
        <van-field
          v-model="form.type"
          label="账户类型"
          placeholder="请选择账户类型"
          readonly
          is-link
          @click="showTypePicker = true"
        >
          <template #input>
            <span>{{ getAccountTypeName(form.type) || '点击选择账户类型' }}</span>
          </template>
        </van-field>
        
        <!-- 账户图标 -->
        <van-field
          label="账户图标"
          readonly
          :value="form.icon"
          placeholder="请选择账户图标"
          is-link
          @click="showIconPicker = true"
        >
          <template #input>
            <div class="icon-display">
              <van-icon v-if="form.icon" :name="form.icon" size="20" />
              <span>{{ form.icon || '点击选择图标' }}</span>
            </div>
          </template>
        </van-field>
        
        <!-- 账户颜色 -->
        <van-field
          label="账户颜色"
          readonly
          placeholder="请选择账户颜色"
          is-link
          @click="showColorPicker = true"
        >
          <template #input>
            <div class="color-display">
              <div 
                class="color-preview"
                :style="{ backgroundColor: form.color }"
              ></div>
              <span>{{ form.color || '点击选择颜色' }}</span>
            </div>
          </template>
        </van-field>
        
        <!-- 初始余额 -->
        <van-field
          v-model="form.balance"
          label="初始余额"
          type="number"
          placeholder="请输入初始余额"
          :formatter="formatBalance"
          :parser="parseBalance"
        />
        
        <!-- 排序权重 -->
        <van-field
          v-model.number="form.order"
          label="排序权重"
          type="number"
          placeholder="数字越大越靠前"
        />
        
        <!-- 备注 -->
        <van-field
          v-model="form.remark"
          label="备注"
          type="textarea"
          placeholder="请输入备注（可选）"
          rows="3"
          maxlength="200"
          show-word-limit
        />
        
        <!-- 提交按钮 -->
        <div class="form-actions">
          <van-button
            type="primary"
            size="large"
            native-type="submit"
            :loading="loading"
            block
          >
            {{ isEdit ? '保存' : '添加' }}
          </van-button>
          
          <van-button
            v-if="isEdit"
            type="danger"
            size="large"
            @click="handleDelete"
            :loading="deleteLoading"
            block
            class="delete-btn"
          >
            删除账户
          </van-button>
        </div>
      </van-form>
    </div>
    
    <!-- 账户类型选择器 -->
    <van-popup
      v-model:show="showTypePicker"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="type-picker">
        <div class="type-picker-header">
          <span>选择账户类型</span>
          <van-icon name="cross" @click="showTypePicker = false" />
        </div>
        
        <div class="type-picker-content">
          <div class="type-grid">
            <div
              v-for="type in accountTypes"
              :key="type.value"
              class="type-option"
              :class="{ active: form.type === type.value }"
              @click="selectType(type)"
            >
              <div class="type-icon">
                <van-icon :name="type.icon" />
              </div>
              <div class="type-name">{{ type.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
    
    <!-- 图标选择器 -->
    <van-popup
      v-model:show="showIconPicker"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="icon-picker">
        <div class="icon-picker-header">
          <span>选择图标</span>
          <van-icon name="cross" @click="showIconPicker = false" />
        </div>
        
        <div class="icon-picker-content">
          <div class="icon-grid">
            <div
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ active: form.icon === icon }"
              @click="selectIcon(icon)"
            >
              <van-icon :name="icon" size="24" />
            </div>
          </div>
        </div>
      </div>
    </van-popup>
    
    <!-- 颜色选择器 -->
    <van-popup
      v-model:show="showColorPicker"
      position="bottom"
      :style="{ height: '40%' }"
    >
      <div class="color-picker">
        <div class="color-picker-header">
          <span>选择颜色</span>
          <van-icon name="cross" @click="showColorPicker = false" />
        </div>
        
        <div class="color-picker-content">
          <div class="color-grid">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ active: form.color === color }"
              :style="{ backgroundColor: color }"
              @click="selectColor(color)"
            ></div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import AppHeader from '@/components/common/AppHeader.vue'

import { accountRepository } from '@/services/database/repositories'
import { generateId } from '@/utils/id'

import type { Account, AccountType } from '@/types/account'

const router = useRouter()
const route = useRoute()

// 状态
const loading = ref(false)
const deleteLoading = ref(false)
const showTypePicker = ref(false)
const showIconPicker = ref(false)
const showColorPicker = ref(false)

// 是否编辑模式
const isEdit = ref(false)
const accountId = ref<string>()

// 表单数据
const form = reactive({
  name: '',
  type: '' as AccountType,
  icon: '',
  color: '#1989fa',
  balance: '',
  order: 0,
  remark: ''
})

// 账户类型选项
const accountTypes = [
  { value: 'cash', name: '现金', icon: 'paid' },
  { value: 'bank_card', name: '银行卡', icon: 'credit-pay' },
  { value: 'credit_card', name: '信用卡', icon: 'credit-pay' },
  { value: 'alipay', name: '支付宝', icon: 'alipay' },
  { value: 'wechat', name: '微信', icon: 'wechat' },
  { value: 'investment', name: '投资', icon: 'gold-coin-o' },
  { value: 'other', name: '其他', icon: 'balance-o' }
]

// 图标选项 - 与账户和支付相关的图标
const iconOptions = [
  'cash-o', 'credit-pay', 'balance-o', 'gold-coin-o', 'coupon-o',
  'alipay', 'wechat', 'chart-trending-o', 'shop-o', 'card',
  'medal-o', 'diamond-o', 'gift-card-o',
  'award-o', 'star-o', 'like-o', 'paid', 'exchange',
  'pending-payment', 'balance-list-o', 'calendar-o', 'clock-o'
]

// 颜色选项
const colorOptions = [
  '#1989fa', '#07c160', '#ff976a', '#ed4014', '#9c26b0',
  '#ff9800', '#2196f3', '#4caf50', '#f44336', '#e91e63',
  '#9e9e9e', '#607d8b', '#795548', '#ff5722', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
]

// 获取账户类型名称
const getAccountTypeName = (type: AccountType): string => {
  const accountType = accountTypes.find(t => t.value === type)
  return accountType ? accountType.name : ''
}

// 格式化余额显示
const formatBalance = (value: string): string => {
  return value
}

// 解析余额输入
const parseBalance = (value: string): string => {
  return value.replace(/[^\d.-]/g, '')
}

// 初始化
const initialize = async () => {
  // 检查是否编辑模式
  accountId.value = route.params.id as string
  if (accountId.value) {
    isEdit.value = true
    await loadAccount()
  }
}

// 加载账户数据
const loadAccount = async () => {
  if (!accountId.value) return
  
  loading.value = true
  
  try {
    const account = await accountRepository.findById(accountId.value)
    if (account) {
      Object.assign(form, {
        ...account,
        balance: (account.balance / 100).toString()
      })
    } else {
      showToast('账户不存在')
      goBack()
    }
  } catch (error) {
    console.error('加载账户失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 选择账户类型
const selectType = (type: any) => {
  form.type = type.value
  form.icon = type.icon
  showTypePicker.value = false
}

// 选择图标
const selectIcon = (icon: string) => {
  form.icon = icon
  showIconPicker.value = false
}

// 选择颜色
const selectColor = (color: string) => {
  form.color = color
  showColorPicker.value = false
}

// 处理提交
const handleSubmit = async () => {
  if (!form.type) {
    showToast('请选择账户类型')
    return
  }
  
  if (!form.icon) {
    showToast('请选择账户图标')
    return
  }
  
  loading.value = true
  
  try {
    const balance = parseFloat(form.balance || '0') * 100
    
    if (isEdit.value && accountId.value) {
      // 更新账户
      await accountRepository.update(accountId.value, {
        ...form,
        balance
      })
      showToast('更新成功')
    } else {
      // 创建账户
      const account: Account = {
        id: generateId(),
        ...form,
        balance,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await accountRepository.create(account)
      showToast('添加成功')
    }
    
    goBack()
  } catch (error) {
    console.error('保存账户失败:', error)
    showToast('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理删除
const handleDelete = async () => {
  if (!accountId.value) return
  
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${form.name}"账户吗？删除后该账户下的记录将无法使用。`
    })
    
    deleteLoading.value = true
    
    const result = await accountRepository.deleteAccount(accountId.value)
    if (result.success) {
      showToast('删除成功')
      goBack()
    } else {
      showToast(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账户失败:', error)
      showToast('删除失败，请重试')
    }
  } finally {
    deleteLoading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时初始化
onMounted(() => {
  initialize()
})
</script>

<style scoped>
.account-add-page {
  min-height: 100vh;
  background: var(--color-background);
}

.account-form-content {
  padding: var(--space-md);
}

.icon-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.color-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
}

.form-actions {
  margin-top: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.delete-btn {
  margin-top: var(--space-md);
}

.type-picker,
.icon-picker,
.color-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.type-picker-header,
.icon-picker-header,
.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.type-picker-content,
.icon-picker-content,
.color-picker-content {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.type-option {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
}

.type-option:active {
  transform: scale(0.98);
}

.type-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.type-icon .van-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.type-name {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-md);
}

.icon-option {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:active {
  transform: scale(0.95);
}

.icon-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:active {
  transform: scale(0.95);
}

.color-option.active {
  border-color: var(--color-text-primary);
  transform: scale(1.1);
}

:deep(.van-field__label) {
  width: 80px;
  color: var(--color-text-primary);
}

:deep(.van-field__control) {
  text-align: left;
  background: var(--color-background-card) !important;
  color: var(--color-text-primary) !important;
}

:deep(.van-field) {
  background: var(--color-background-card) !important;
}

:deep(.van-cell) {
  background: var(--color-background-card) !important;
  border: none;
}

:deep(.van-field__body) {
  background: var(--color-background-card) !important;
}

:deep(.van-field__control::placeholder) {
  color: var(--color-text-light);
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .type-picker,
  .icon-picker,
  .color-picker {
    background: var(--color-background);
    color: var(--color-text-primary);
  }
  
  .type-picker-header,
  .icon-picker-header,
  .color-picker-header {
    background: var(--color-background-card);
    color: var(--color-text-primary);
    border-bottom-color: var(--color-border);
  }
  
  .type-picker-content,
  .icon-picker-content,
  .color-picker-content {
    background: var(--color-background);
  }
  
  .type-option {
    background: var(--color-background-card);
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }
  
  .type-option.active {
    background: var(--color-primary);
    color: white;
  }
  
  .icon-option {
    background: var(--color-background-card);
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }
  
  .icon-option.active {
    background: var(--color-primary);
    color: white;
  }
  
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
}
</style>
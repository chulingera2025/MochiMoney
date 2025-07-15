<template>
  <div class="account-picker">
    <div class="account-picker__label" v-if="label">
      {{ label }}
      <span class="account-picker__required" v-if="required">*</span>
    </div>
    
    <van-field
      :model-value="selectedAccountName"
      :placeholder="placeholder"
      readonly
      is-link
      :error="error"
      :error-message="errorMessage"
      @click="showPicker = true"
      class="account-picker__field"
    >
      <template #left-icon v-if="selectedAccount">
        <div class="account-picker__icon" :style="{ color: selectedAccount.color }">
          <van-icon :name="selectedAccount.icon" />
        </div>
      </template>
      
      <template #right-icon v-if="selectedAccount && showBalance">
        <div class="account-picker__balance">
          {{ formatAmount(selectedAccount.balance) }}
        </div>
      </template>
    </van-field>
    
    <!-- 账户选择弹窗 -->
    <van-popup 
      v-model:show="showPicker" 
      position="bottom" 
      :style="{ height: '60%' }"
      round
      closeable
      class="account-picker__popup"
    >
      <div class="account-picker__header">
        <h3>选择账户</h3>
      </div>
      
      <div class="account-picker__content">
        <van-loading v-if="loading" class="account-picker__loading">
          加载中...
        </van-loading>
        
        <div v-else-if="accounts.length === 0" class="account-picker__empty">
          <van-empty description="暂无账户" />
        </div>
        
        <div v-else class="account-picker__list">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="account-picker__item"
            :class="{ 'account-picker__item--selected': account.id === modelValue }"
            @click="handleAccountSelect(account)"
          >
            <div class="account-picker__item-icon" :style="{ color: account.color }">
              <van-icon :name="account.icon" />
            </div>
            
            <div class="account-picker__item-content">
              <div class="account-picker__item-name">{{ account.name }}</div>
              <div class="account-picker__item-type">{{ getAccountTypeName(account.type) }}</div>
            </div>
            
            <div class="account-picker__item-balance">
              {{ formatAmount(account.balance) }}
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { accountRepository } from '@/services/database/repositories'
import { ACCOUNT_TYPE_CONFIG } from '@/constants/accounts'
import { formatAmount } from '@/utils/number'
import type { Account, AccountType } from '@/types/account'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  showBalance?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '请选择账户',
  showBalance: true,
  required: false,
  error: false,
  errorMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [account: Account | null]
}>()

// 状态
const showPicker = ref(false)
const accounts = ref<Account[]>([])
const loading = ref(false)

// 计算属性
const selectedAccount = computed(() => 
  accounts.value.find(acc => acc.id === props.modelValue) || null
)

const selectedAccountName = computed(() => 
  selectedAccount.value?.name || ''
)

// 获取账户类型名称
const getAccountTypeName = (type: AccountType): string => {
  return ACCOUNT_TYPE_CONFIG[type]?.name || '其他'
}

// 加载账户数据
const loadAccounts = async () => {
  loading.value = true
  try {
    accounts.value = await accountRepository.findEnabled()
  } catch (error) {
    console.error('加载账户失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理账户选择
const handleAccountSelect = (account: Account) => {
  emit('update:modelValue', account.id)
  emit('change', account)
  showPicker.value = false
}

// 组件挂载时加载数据
onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.account-picker {
  width: 100%;
}

.account-picker__label {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.account-picker__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.account-picker__field {
  --van-field-input-text-color: var(--color-text-primary);
}

.account-picker__icon {
  font-size: 20px;
  margin-right: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.account-picker__balance {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.account-picker__popup {
  --van-popup-background: var(--color-background);
}

.account-picker__header {
  padding: var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-card);
}

.account-picker__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.account-picker__content {
  height: calc(100% - 80px);
  overflow-y: auto;
}

.account-picker__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.account-picker__empty {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.account-picker__list {
  padding: var(--space-md);
}

.account-picker__item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-background-card);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-picker__item:hover {
  background: var(--color-border-light);
}

.account-picker__item--selected {
  background: var(--color-primary);
  color: white;
}

.account-picker__item--selected .account-picker__item-icon {
  color: white !important;
}

.account-picker__item--selected .account-picker__item-name,
.account-picker__item--selected .account-picker__item-type,
.account-picker__item--selected .account-picker__item-balance {
  color: white;
}

.account-picker__item-icon {
  font-size: 24px;
  margin-right: var(--space-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.account-picker__item-content {
  flex: 1;
}

.account-picker__item-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.account-picker__item-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.account-picker__item-balance {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
}
</style>
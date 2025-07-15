<template>
  <div class="amount-input">
    <div class="amount-input__label" v-if="label">
      {{ label }}
      <span class="amount-input__required" v-if="required">*</span>
    </div>
    
    <div class="amount-input__field">
      <div class="amount-input__currency" v-if="showCurrency">
        {{ currencySymbol }}
      </div>
      
      <van-field
        :model-value="displayValue"
        @update:model-value="handleInput"
        type="number"
        inputmode="decimal"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :error="error"
        :error-message="errorMessage"
        class="amount-input__input"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    
    <!-- 快速金额选择 -->
    <div class="amount-input__quick" v-if="showQuickAmounts && quickAmounts.length > 0">
      <div class="amount-input__quick-label">快速选择</div>
      <div class="amount-input__quick-buttons">
        <van-button
          v-for="amount in quickAmounts"
          :key="amount"
          size="small"
          :type="modelValue === amount ? 'primary' : 'default'"
          @click="selectQuickAmount(amount)"
          class="amount-input__quick-button"
        >
          {{ formatAmount(amount) }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatAmountInput, parseAmount, validateAmount } from '@/utils/number'
import { CURRENCY_CONFIG } from '@/constants'

interface Props {
  modelValue?: number
  label?: string
  placeholder?: string
  currency?: string
  showCurrency?: boolean
  showQuickAmounts?: boolean
  quickAmounts?: number[]
  min?: number
  max?: number
  precision?: number
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  error?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  label: '',
  placeholder: '请输入金额',
  currency: 'CNY',
  showCurrency: true,
  showQuickAmounts: false,
  quickAmounts: () => [10, 20, 50, 100, 200, 500],
  min: 0,
  max: 9999999999.99,
  precision: 2,
  required: false,
  readonly: false,
  disabled: false,
  error: false,
  errorMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'focus': []
  'blur': []
  'change': [value: number]
}>()

// 内部输入值
const inputValue = ref('')
const isFocused = ref(false)

// 货币符号
const currencySymbol = computed(() => {
  return CURRENCY_CONFIG[props.currency as keyof typeof CURRENCY_CONFIG]?.symbol || '¥'
})

// 显示值
const displayValue = computed(() => {
  if (isFocused.value) {
    return inputValue.value
  }
  
  if (props.modelValue === 0) {
    return ''
  }
  
  return props.modelValue.toFixed(props.precision)
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (!isFocused.value) {
    inputValue.value = newVal > 0 ? newVal.toFixed(props.precision) : ''
  }
}, { immediate: true })

// 处理输入
const handleInput = (value: string) => {
  inputValue.value = formatAmountInput(value)
  
  const numValue = parseAmount(inputValue.value)
  
  // 验证范围
  if (numValue < props.min || numValue > props.max) {
    return
  }
  
  emit('update:modelValue', numValue)
  emit('change', numValue)
}

// 处理聚焦
const handleFocus = () => {
  isFocused.value = true
  inputValue.value = props.modelValue > 0 ? props.modelValue.toString() : ''
  emit('focus')
}

// 处理失焦
const handleBlur = () => {
  isFocused.value = false
  
  // 验证输入值
  const numValue = parseAmount(inputValue.value)
  if (validateAmount(numValue)) {
    emit('update:modelValue', numValue)
    emit('change', numValue)
  }
  
  emit('blur')
}

// 选择快速金额
const selectQuickAmount = (amount: number) => {
  emit('update:modelValue', amount)
  emit('change', amount)
}

// 格式化金额显示
const formatAmount = (amount: number): string => {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`
  }
  return amount.toString()
}
</script>

<style scoped>
.amount-input {
  width: 100%;
}

.amount-input__label {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.amount-input__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.amount-input__field {
  display: flex;
  align-items: center;
  position: relative;
}

.amount-input__currency {
  position: absolute;
  left: var(--space-md);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  font-weight: 600;
  z-index: 1;
  pointer-events: none;
}

.amount-input__input {
  flex: 1;
}

:deep(.van-field__control) {
  padding-left: var(--space-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  text-align: right;
}

:deep(.van-field__control::placeholder) {
  color: var(--color-text-light);
  font-weight: normal;
}

.amount-input__quick {
  margin-top: var(--space-md);
}

.amount-input__quick-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.amount-input__quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.amount-input__quick-button {
  min-width: 60px;
  height: 32px;
  font-size: var(--font-size-sm);
}
</style>
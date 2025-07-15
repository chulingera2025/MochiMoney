<template>
  <div class="record-item" @click="handleClick">
    <div class="record-item__icon">
      <div
        class="record-item__category-icon"
        :style="{ backgroundColor: categoryColor }"
      >
        {{ categoryIcon }}
      </div>
    </div>

    <div class="record-item__content">
      <div class="record-item__title">
        {{ categoryName }}
        <span v-if="record.remark" class="record-item__remark">
          · {{ record.remark }}
        </span>
      </div>
      <div class="record-item__subtitle">
        {{ accountName }} · {{ formatTime(record.createdAt) }}
      </div>
    </div>

    <div class="record-item__amount">
      <div
        class="record-item__amount-text"
        :class="{
          'record-item__amount-text--income': record.type === 'income',
          'record-item__amount-text--expense': record.type === 'expense'
        }"
      >
        {{ record.type === 'income' ? '+' : '-' }}{{ formatAmount(record.amount) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatAmount } from '@/utils/number'
import { formatDate } from '@/utils/date'
import { categoryRepository, accountRepository } from '@/services/database/repositories'
import { CATEGORY_ICONS } from '@/constants/categories'

import type { Record } from '@/types/record'
import type { Category } from '@/types/category'
import type { Account } from '@/types/account'

interface Props {
  record: Record
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [record: Record]
}>()

// 状态
const category = ref<Category | null>(null)
const account = ref<Account | null>(null)

// 计算属性
const categoryName = computed(() => category.value?.name || '未知分类')
const categoryColor = computed(() => category.value?.color || '#E0E0E0')
const categoryIcon = computed(() => {
  const iconName = category.value?.icon || 'other'
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
})

const accountName = computed(() => account.value?.name || '未知账户')

// 格式化时间
const formatTime = (dateTime: string): string => {
  return formatDate(dateTime, 'HH:mm')
}

// 加载关联数据
const loadRelatedData = async () => {
  try {
    // 加载分类信息
    if (props.record.categoryId) {
      category.value = await categoryRepository.findById(props.record.categoryId) || null
    }

    // 加载账户信息
    if (props.record.accountId) {
      account.value = await accountRepository.findById(props.record.accountId) || null
    }
  } catch (error) {
    console.error('加载关联数据失败:', error)
  }
}

// 处理点击
const handleClick = () => {
  emit('click', props.record)
}

// 组件挂载时加载数据
onMounted(() => {
  loadRelatedData()
})
</script>

<style scoped>
.record-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.record-item:hover {
  background-color: var(--color-border-light);
}

.record-item:last-child {
  border-bottom: none;
}

.record-item__icon {
  margin-right: var(--space-md);
}

.record-item__category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  font-weight: bold;
}

.record-item__content {
  flex: 1;
  min-width: 0;
}

.record-item__title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.record-item__remark {
  color: var(--color-text-secondary);
  font-weight: normal;
  margin-left: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-item__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-item__amount {
  margin: 0 var(--space-md);
}

.record-item__amount-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  text-align: right;
}

.record-item__amount-text--income {
  color: var(--color-success);
}

.record-item__amount-text--expense {
  color: var(--color-danger);
}
</style>

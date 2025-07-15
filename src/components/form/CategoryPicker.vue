<template>
  <div class="category-picker">
    <div class="category-picker__label" v-if="label">
      {{ label }}
      <span class="category-picker__required" v-if="required">*</span>
    </div>
    
    <van-field
      :model-value="selectedCategoryName"
      :placeholder="placeholder"
      readonly
      is-link
      :error="error"
      :error-message="errorMessage"
      @click="showPicker = true"
      class="category-picker__field"
    >
      <template #left-icon v-if="selectedCategory">
        <div class="category-picker__icon" :style="{ color: selectedCategory.color }">
          {{ getCategoryIcon(selectedCategory.icon) }}
        </div>
      </template>
    </van-field>
    
    <!-- 分类选择弹窗 -->
    <van-popup 
      v-model:show="showPicker" 
      position="bottom" 
      :style="{ height: '70%' }"
      round
      closeable
      class="category-picker__popup"
    >
      <div class="category-picker__header">
        <h3>选择分类</h3>
      </div>
      
      <div class="category-picker__content">
        <!-- 直接显示对应类型的分类 -->
        <CategoryList 
          :categories="currentCategories"
          :selected-id="modelValue"
          @select="handleCategorySelect"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { categoryRepository } from '@/services/database/repositories'
import { CATEGORY_ICONS } from '@/constants/categories'
import type { Category } from '@/types/category'
import type { RecordType } from '@/types/record'
import CategoryList from './CategoryList.vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: RecordType
  required?: boolean
  error?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '请选择分类',
  type: 'expense',
  required: false,
  error: false,
  errorMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [category: Category | null]
}>()

// 状态
const showPicker = ref(false)
const categories = ref<Category[]>([])
const loading = ref(false)

// 计算属性
const currentCategories = computed(() => 
  categories.value.filter(cat => cat.type === props.type)
)

const selectedCategory = computed(() => 
  categories.value.find(cat => cat.id === props.modelValue) || null
)

const selectedCategoryName = computed(() => 
  selectedCategory.value?.name || ''
)

// 获取分类图标
const getCategoryIcon = (iconName: string): string => {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
}

// 加载分类数据
const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await categoryRepository.findEnabled()
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理分类选择
const handleCategorySelect = (category: Category) => {
  emit('update:modelValue', category.id)
  emit('change', category)
  showPicker.value = false
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-picker {
  width: 100%;
}

.category-picker__label {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.category-picker__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.category-picker__field {
  --van-field-input-text-color: var(--color-text-primary);
}

.category-picker__icon {
  font-size: 20px;
  margin-right: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.category-picker__popup {
  --van-popup-background: var(--color-background);
}

.category-picker__header {
  padding: var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-card);
}

.category-picker__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-picker__content {
  height: calc(100% - 80px);
  overflow-y: auto;
  padding: var(--space-md);
}

</style>
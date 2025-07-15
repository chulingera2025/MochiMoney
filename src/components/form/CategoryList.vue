<template>
  <div class="category-list">
    <van-loading v-if="loading" class="category-list__loading">
      加载中...
    </van-loading>
    
    <div v-else-if="categories.length === 0" class="category-list__empty">
      <van-empty description="暂无分类" />
    </div>
    
    <div v-else class="category-list__content">
      <div class="category-list__grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-list__item"
          :class="{ 'category-list__item--selected': category.id === selectedId }"
          @click="handleSelect(category)"
        >
          <div 
            class="category-list__icon"
            :style="{ backgroundColor: category.color }"
          >
            {{ getCategoryIcon(category.icon) }}
          </div>
          <div class="category-list__name">
            {{ category.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_ICONS } from '../../constants/categories'
import type { Category } from '../../types/category'

interface Props {
  categories: Category[]
  selectedId?: string
  loading?: boolean
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  selectedId: '',
  loading: false,
  columns: 4
})

const emit = defineEmits<{
  select: [category: Category]
}>()

// 获取分类图标
const getCategoryIcon = (iconName: string): string => {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other
}

// 处理分类选择
const handleSelect = (category: Category) => {
  emit('select', category)
}

// 网格样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`
}))
</script>

<style scoped>
.category-list {
  width: 100%;
  height: 100%;
}

.category-list__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.category-list__empty {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-list__content {
  padding: var(--space-md);
}

.category-list__grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(4, 1fr);
}

.category-list__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-background-card);
}

.category-list__item:hover {
  background: var(--color-border-light);
}

.category-list__item--selected {
  background: var(--color-primary);
  color: white;
}

.category-list__item--selected .category-list__icon {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white;
}

.category-list__item--selected .category-list__name {
  color: white;
}

.category-list__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  font-weight: bold;
}

.category-list__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .category-list__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
  }
  
  .category-list__icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .category-list__name {
    font-size: var(--font-size-xs);
  }
}

@media (min-width: 414px) {
  .category-list__grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
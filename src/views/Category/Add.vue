<template>
  <div class="category-add-page">
    <AppHeader 
      :title="isEdit ? '编辑分类' : '添加分类'"
      show-left-arrow
      @click-left="goBack"
    />
    
    <div class="category-form-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <van-form @submit="handleSubmit" class="lazy-form">
        <!-- 分类类型 -->
        <van-field
          v-model="form.type"
          label="分类类型"
          readonly
          :value="form.type === 'expense' ? '支出' : '收入'"
          placeholder="请选择分类类型"
        />
        
        <!-- 分类名称 -->
        <van-field
          v-model="form.name"
          label="分类名称"
          placeholder="请输入分类名称"
          :rules="[{ required: true, message: '请输入分类名称' }]"
          maxlength="20"
          show-word-limit
        />
        
        <!-- 分类图标 -->
        <van-field
          label="分类图标"
          readonly
          :value="form.icon"
          placeholder="请选择分类图标"
          is-link
          @click="showIconPicker = true"
        >
          <template #input>
            <div class="icon-display">
              <span class="icon-emoji">{{ getCategoryIcon(form.icon) }}</span>
              <span>{{ form.icon || '点击选择图标' }}</span>
            </div>
          </template>
        </van-field>
        
        <!-- 分类颜色 -->
        <van-field
          label="分类颜色"
          readonly
          placeholder="请选择分类颜色"
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
        
        <!-- 排序权重 -->
        <van-field
          v-model.number="form.sort"
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
        <div class="form-actions lazy-buttons">
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
            删除分类
          </van-button>
        </div>
      </van-form>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
    
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
              <span class="icon-emoji">{{ getCategoryIcon(icon) }}</span>
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
import Loading from '@/components/common/Loading.vue'

import { categoryRepository } from '@/services/database/repositories'
import { generateId } from '@/utils/id'
import { CATEGORY_ICONS } from '@/constants/categories'
import { useLazyLoad } from '@/composables/useLazyLoad'

import type { Category, CategoryType } from '@/types/category'

const router = useRouter()
const route = useRoute()

// 状态
const loading = ref(false)
const deleteLoading = ref(false)
const showIconPicker = ref(false)
const showColorPicker = ref(false)

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 是否编辑模式
const isEdit = ref(false)
const categoryId = ref<string>()

// 表单数据
const form = reactive({
  name: '',
  type: 'expense' as CategoryType,
  icon: '',
  color: '#1989fa',
  sort: 0,
  remark: ''
})

// 图标选项
const iconOptions = [
  'food', 'transport', 'shopping', 'entertainment', 'medical', 'education',
  'housing', 'communication', 'clothing', 'beauty', 'sports', 'travel',
  'pet', 'gift', 'salary', 'bonus', 'investment', 'parttime',
  'gift-money', 'dividend', 'rent', 'refund', 'other'
]

// 颜色选项
const colorOptions = [
  '#1989fa', '#07c160', '#ff976a', '#ed4014', '#9c26b0',
  '#ff9800', '#2196f3', '#4caf50', '#f44336', '#e91e63',
  '#9e9e9e', '#607d8b', '#795548', '#ff5722', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
]

// 初始化
const initialize = async () => {
  // 从路由参数获取分类类型
  const type = route.query.type as CategoryType
  if (type) {
    form.type = type
  }
  
  // 检查是否编辑模式
  categoryId.value = route.params.id as string
  if (categoryId.value) {
    isEdit.value = true
    await loadCategory()
  }
}

// 加载分类数据
const loadCategory = async () => {
  if (!categoryId.value) return
  
  loading.value = true
  
  try {
    const category = await categoryRepository.findById(categoryId.value)
    if (category) {
      Object.assign(form, category)
    } else {
      showToast('分类不存在')
      goBack()
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
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

// 获取分类图标
const getCategoryIcon = (iconName: string): string => {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || ''
}

// 处理提交
const handleSubmit = async () => {
  loading.value = true
  
  try {
    if (isEdit.value && categoryId.value) {
      // 更新分类
      await categoryRepository.update(categoryId.value, form)
      showToast('更新成功')
    } else {
      // 创建分类
      const category: Category = {
        id: generateId(),
        ...form,
        order: form.sort || 0,
        isSystem: false,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await categoryRepository.create(category)
      showToast('添加成功')
    }
    
    goBack()
  } catch (error) {
    console.error('保存分类失败:', error)
    showToast('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理删除
const handleDelete = async () => {
  if (!categoryId.value) return
  
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${form.name}"分类吗？删除后该分类下的记录将被标记为"未分类"。`
    })
    
    deleteLoading.value = true
    
    await categoryRepository.delete(categoryId.value)
    showToast('删除成功')
    
    goBack()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
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
onMounted(async () => {
  await initialize()
  showContentWithDelay(50)
})
</script>

<style scoped>
.category-add-page {
  min-height: 100vh;
  background: var(--color-background);
}

.category-form-content {
  padding: var(--space-md);
}

.icon-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.icon-emoji {
  font-size: 20px;
  display: inline-block;
  min-width: 24px;
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

.icon-picker, .color-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.icon-picker-header, .color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.icon-picker-content, .color-picker-content {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
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
  .icon-picker, .color-picker {
    background: var(--color-background);
    color: var(--color-text-primary);
  }
  
  .icon-picker-header, .color-picker-header {
    background: var(--color-background-card);
    color: var(--color-text-primary);
    border-bottom-color: var(--color-border);
  }
  
  .icon-picker-content, .color-picker-content {
    background: var(--color-background);
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
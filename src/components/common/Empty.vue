<template>
  <div class="empty-state" :class="{ 'empty-state--small': size === 'small' }">
    <div class="empty-state__image" v-if="showImage">
      <van-empty 
        :image="image"
        :image-size="imageSize"
        :description="description"
      />
    </div>
    
    <div class="empty-state__content" v-else>
      <div class="empty-state__icon" v-if="icon">
        <van-icon :name="icon" :size="iconSize" :color="iconColor" />
      </div>
      
      <div class="empty-state__title" v-if="title">
        {{ title }}
      </div>
      
      <div class="empty-state__description" v-if="description">
        {{ description }}
      </div>
    </div>
    
    <div class="empty-state__action" v-if="$slots.action || actionText">
      <slot name="action">
        <van-button 
          v-if="actionText"
          type="primary" 
          size="small"
          @click="handleAction"
        >
          {{ actionText }}
        </van-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  image?: string
  imageSize?: string | number
  icon?: string
  iconSize?: string | number
  iconColor?: string
  title?: string
  description?: string
  actionText?: string
  size?: 'normal' | 'small'
  showImage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  image: 'default',
  imageSize: '120px',
  icon: 'warning-o',
  iconSize: '48px',
  iconColor: '#dcdee0',
  title: '',
  description: '暂无数据',
  actionText: '',
  size: 'normal',
  showImage: true
})

const emit = defineEmits<{
  action: []
}>()

// 处理操作按钮点击
const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
  min-height: 200px;
}

.empty-state--small {
  min-height: 120px;
  padding: var(--space-lg) var(--space-md);
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.empty-state__icon {
  margin-bottom: var(--space-sm);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.empty-state__description {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-md);
}

.empty-state__action {
  margin-top: var(--space-md);
}

/* 小尺寸样式 */
.empty-state--small .empty-state__title {
  font-size: var(--font-size-md);
}

.empty-state--small .empty-state__description {
  font-size: var(--font-size-sm);
}

.empty-state--small .empty-state__icon {
  margin-bottom: var(--space-xs);
}

:deep(.van-empty__description) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}
</style>
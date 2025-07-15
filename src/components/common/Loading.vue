<template>
  <div class="loading-container" v-if="show">
    <div class="loading-overlay" v-if="overlay" @click="handleOverlayClick" />
    <div class="loading-content" :class="{ 'loading-content--overlay': overlay }">
      <van-loading 
        :type="type"
        :size="size"
        :color="color"
        :text-color="textColor"
        class="loading-spinner"
      >
        {{ text }}
      </van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  type?: 'circular' | 'spinner'
  size?: string | number
  color?: string
  textColor?: string
  text?: string
  overlay?: boolean
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'circular',
  size: '24px',
  color: '#1989fa',
  textColor: '#969799',
  text: '加载中...',
  overlay: false,
  closeOnClickOverlay: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false)
    emit('close')
  }
}
</script>

<style scoped>
.loading-container {
  position: relative;
  display: inline-block;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content--overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: var(--color-background-card);
  padding: var(--space-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

:deep(.van-loading__text) {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}
</style>
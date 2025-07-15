<template>
  <van-nav-bar
    :title="title"
    :left-text="leftText"
    :left-arrow="showLeftArrow"
    :right-text="rightText"
    :fixed="fixed"
    :placeholder="placeholder"
    :z-index="zIndex"
    @click-left="handleLeftClick"
    @click-right="handleRightClick"
    class="app-header"
  >
    <!-- 左侧内容插槽 -->
    <template #left v-if="$slots.left">
      <slot name="left" />
    </template>

    <!-- 标题插槽 -->
    <template #title v-if="$slots.title">
      <slot name="title" />
    </template>

    <!-- 右侧内容插槽 -->
    <template #right v-if="$slots.right || showInstallGuide">
      <slot name="right" />
      <!-- 安装教程按钮 -->
      <van-button 
        v-if="showInstallGuide" 
        type="primary" 
        size="mini" 
        round
        @click="openInstallGuide"
        class="install-guide-btn"
      >
        安装教程
      </van-button>
    </template>
  </van-nav-bar>
  
  <!-- 安装教程组件 -->
  <InstallGuide ref="installGuideRef" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InstallGuide from './InstallGuide.vue'

interface Props {
  title?: string
  leftText?: string
  rightText?: string
  showLeftArrow?: boolean
  fixed?: boolean
  placeholder?: boolean
  zIndex?: number
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  leftText: '',
  rightText: '',
  showLeftArrow: false,
  fixed: true,
  placeholder: true,
  zIndex: 1,
  showBack: true
})

const emit = defineEmits<{
  clickLeft: []
  clickRight: []
}>()

const router = useRouter()
const installGuideRef = ref<InstanceType<typeof InstallGuide>>()

// 检查是否为PWA环境
const isPWA = ref(false)

// 计算是否显示安装教程按钮
const showInstallGuide = computed(() => {
  return !isPWA.value
})

// 检查PWA环境
const checkPWAEnvironment = () => {
  // 检查是否为PWA模式
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    isPWA.value = true
    return
  }
  
  // 检查是否为iOS Safari PWA应用
  if ('serviceWorker' in navigator && (window.navigator as any).standalone) {
    isPWA.value = true
    return
  }
  
  isPWA.value = false
}

// 打开安装教程
const openInstallGuide = () => {
  installGuideRef.value?.openGuide()
}

// 处理左侧点击
const handleLeftClick = () => {
  emit('clickLeft')
}

// 处理右侧点击
const handleRightClick = () => {
  emit('clickRight')
}

onMounted(() => {
  checkPWAEnvironment()
})
</script>

<style scoped>
.app-header {
  --van-nav-bar-background: var(--color-background-card);
  --van-nav-bar-title-color: var(--color-text-primary);
  --van-nav-bar-text-color: var(--color-primary);
}

:deep(.van-nav-bar__title) {
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary) !important;
}

:deep(.van-nav-bar__left) {
  color: var(--color-primary);
}

:deep(.van-nav-bar__right) {
  color: var(--color-primary);
}

/* 安装教程按钮 */
.install-guide-btn {
  margin-left: var(--space-sm);
  --van-button-mini-height: 28px;
  --van-button-mini-font-size: 12px;
  --van-button-mini-padding: 0 8px;
}

.install-guide-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* 深色模式适配 - 跟随系统 */
@media (prefers-color-scheme: dark) {
  .app-header {
    --van-nav-bar-background: var(--color-background-card);
    --van-nav-bar-title-color: var(--color-text-primary);
  }
  
  :deep(.van-nav-bar__title) {
    color: var(--color-text-primary) !important;
  }
}

/* 强制深色模式 */
[data-theme="dark"] .app-header {
  --van-nav-bar-background: var(--color-background-card);
  --van-nav-bar-title-color: var(--color-text-primary);
}

[data-theme="dark"] .app-header :deep(.van-nav-bar__title) {
  color: var(--color-text-primary) !important;
}

/* 强制浅色模式 */
[data-theme="light"] .app-header {
  --van-nav-bar-background: var(--color-background-card);
  --van-nav-bar-title-color: var(--color-text-primary);
}

[data-theme="light"] .app-header :deep(.van-nav-bar__title) {
  color: var(--color-text-primary) !important;
}
</style>
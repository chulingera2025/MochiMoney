<template>
  <van-tabbar 
    v-model="activeTab" 
    fixed 
    placeholder
    class="app-tabbar"
  >
    <van-tabbar-item 
      v-for="item in tabItems" 
      :key="item.name"
      :name="item.name"
      :icon="item.icon"
      :badge="item.badge"
      :dot="item.dot"
      @click="handleTabClick(item)"
    >
      {{ item.label }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface TabItem {
  name: string
  label: string
  icon: string
  route: string
  badge?: string | number
  dot?: boolean
}

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'home'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-change': [item: TabItem]
}>()

const router = useRouter()
const route = useRoute()

// 当前激活的标签
const activeTab = ref(props.modelValue)

// 标签项配置
const tabItems: TabItem[] = [
  {
    name: 'home',
    label: '首页',
    icon: 'home-o',
    route: '/'
  },
  {
    name: 'records',
    label: '记录',
    icon: 'orders-o',
    route: '/records'
  },
  {
    name: 'statistics',
    label: '统计',
    icon: 'chart-trending-o',
    route: '/statistics'
  },
  {
    name: 'settings',
    label: '设置',
    icon: 'setting-o',
    route: '/settings'
  }
]

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  activeTab.value = newVal
})

// 监听activeTab变化
watch(activeTab, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听路由变化，更新activeTab
watch(() => route.path, (newPath) => {
  const matchedTab = tabItems.find(item => item.route === newPath)
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
}, { immediate: true })

// 处理标签点击
const handleTabClick = (item: TabItem) => {
  if (route.path !== item.route) {
    router.push(item.route)
  }
  emit('tab-change', item)
}
</script>

<style scoped>
.app-tabbar {
  --van-tabbar-background: var(--color-background-card);
  --van-tabbar-item-text-color: var(--color-text-secondary);
  --van-tabbar-item-active-color: var(--color-primary);
  --van-tabbar-item-active-background: transparent;
  --van-tabbar-height: 60px;
}

:deep(.van-tabbar-item) {
  font-size: var(--font-size-xs);
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
  margin-bottom: 4px;
}

:deep(.van-tabbar-item--active) {
  font-weight: 600;
}
</style>
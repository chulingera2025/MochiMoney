import { ref, computed, watch } from 'vue'

export type ThemeMode = 'auto' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

// 当前主题模式
const currentTheme = ref<ThemeMode>('auto')

// 是否为深色模式
const isDarkMode = computed(() => {
  if (currentTheme.value === 'dark') return true
  if (currentTheme.value === 'light') return false
  
  // auto 模式：跟随系统
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
})

// 应用主题到HTML元素
const applyTheme = (theme: ThemeMode) => {
  const html = document.documentElement
  
  // 移除之前的主题属性
  html.removeAttribute('data-theme')
  
  if (theme === 'light') {
    html.setAttribute('data-theme', 'light')
  } else if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark')
  }
  // auto 模式不设置 data-theme，让 CSS 媒体查询自动处理
}

// 设置主题
const setTheme = (theme: ThemeMode) => {
  currentTheme.value = theme
  applyTheme(theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

// 从本地存储加载主题
const loadTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode
  if (savedTheme && ['auto', 'light', 'dark'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  }
  applyTheme(currentTheme.value)
}

// 监听系统主题变化（仅在 auto 模式下生效）
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = () => {
    if (currentTheme.value === 'auto') {
      applyTheme('auto')
    }
  }
  
  mediaQuery?.addEventListener('change', handleSystemThemeChange)
  
  return () => {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
  }
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  applyTheme(newTheme)
})

export const useTheme = () => {
  return {
    currentTheme: computed(() => currentTheme.value),
    isDarkMode,
    setTheme,
    loadTheme,
    setupSystemThemeListener
  }
}

// 自动初始化主题
if (typeof window !== 'undefined') {
  loadTheme()
  setupSystemThemeListener()
}
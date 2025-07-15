<template>
  <div class="general-settings-page">
    <AppHeader 
      title="通用设置" 
      show-left-arrow
      @click-left="goBack"
    />
    
    <div class="settings-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 主题设置 -->
      <div class="settings-section lazy-card">
        <div class="section-title">主题设置</div>
        <div class="settings-list">
          <div class="settings-item" @click="showThemeSelector = true">
            <div class="item-content">
              <div class="item-title">主题模式</div>
              <div class="item-desc">{{ currentThemeText }}</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
      
      <!-- 语言设置 -->
      <div class="settings-section lazy-card">
        <div class="section-title">语言设置</div>
        <div class="settings-list">
          <div class="settings-item" @click="showLanguageSelector = true">
            <div class="item-content">
              <div class="item-title">界面语言</div>
              <div class="item-desc">{{ currentLanguageText }}</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
      
      <!-- 数据设置 -->
      <div class="settings-section lazy-card">
        <div class="section-title">数据设置</div>
        <div class="settings-list">
          <div class="settings-item" @click="clearCache">
            <div class="item-content">
              <div class="item-title">清除缓存</div>
              <div class="item-desc">清理应用缓存数据</div>
            </div>
            <van-icon name="delete-o" color="#ee0a24" />
          </div>
          
          <div class="settings-item" @click="clearAllData">
            <div class="item-content">
              <div class="item-title">清除所有数据</div>
              <div class="item-desc">删除所有记账数据，谨慎操作</div>
            </div>
            <van-icon name="warning-o" color="#ee0a24" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
    
    <!-- 主题选择器 -->
    <van-action-sheet
      v-model:show="showThemeSelector"
      title="选择主题模式"
      :actions="themeOptions"
      @select="onThemeSelect"
      cancel-text="取消"
    />
    
    <!-- 语言选择器 -->
    <van-action-sheet
      v-model:show="showLanguageSelector"
      title="选择界面语言"
      :actions="languageOptions"
      @select="onLanguageSelect"
      cancel-text="取消"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import { useLazyLoad } from '@/composables/useLazyLoad'

const router = useRouter()
const { currentTheme, setTheme } = useTheme()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 语言状态
const currentLanguage = ref('zh-CN')

// 选择器显示状态
const showThemeSelector = ref(false)
const showLanguageSelector = ref(false)

// 主题选项
const themeOptions = [
  { name: '自动（跟随系统）', value: 'auto' },
  { name: '浅色模式', value: 'light' },
  { name: '深色模式', value: 'dark' }
]

// 语言选项 - 目前只支持简体中文
const languageOptions = [
  { name: '简体中文', value: 'zh-CN' },
  { name: '繁體中文 (开发中)', value: 'zh-TW', disabled: true },
  { name: 'English (开发中)', value: 'en-US', disabled: true }
]

// 计算属性
const currentThemeText = computed(() => {
  const theme = themeOptions.find(t => t.value === currentTheme.value)
  return theme?.name || '自动（跟随系统）'
})

const currentLanguageText = computed(() => {
  const language = languageOptions.find(l => l.value === currentLanguage.value)
  return language?.name || '简体中文'
})

// 事件处理
const goBack = () => {
  router.back()
}

const onThemeSelect = (action: any) => {
  const theme = action.value as ThemeMode
  setTheme(theme)
  showThemeSelector.value = false
  
  if (theme === 'auto') {
    showToast('已设置为自动跟随系统主题')
  } else if (theme === 'light') {
    showToast('已切换到浅色模式')
  } else if (theme === 'dark') {
    showToast('已切换到深色模式')
  }
}

const onLanguageSelect = (action: any) => {
  showLanguageSelector.value = false
  
  if (action.value === 'zh-CN') {
    currentLanguage.value = action.value
    showToast('界面语言已设置为简体中文')
    // 保存到本地存储
    localStorage.setItem('language', action.value)
  } else {
    // 其他语言显示开发中提示
    showDialog({
      title: '功能开发中',
      message: `${action.name.replace(' (开发中)', '')} 多语言功能正在适配开发中，敬请期待！\n\n即将支持：\n• 繁體中文界面\n• English界面\n• 多语言数据同步\n• 本地化格式设置`,
      confirmButtonText: '知道了',
      showCancelButton: false
    })
  }
}

const clearCache = async () => {
  try {
    await showConfirmDialog({
      title: '清除缓存',
      message: '确定要清除应用缓存吗？这不会影响您的记账数据。',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    // 清除缓存逻辑
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    // 清除一些非关键的localStorage数据（保留主题设置）
    const keysToRemove = ['language', 'ui-preferences']
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    showToast('缓存清除成功')
  } catch {
    // 用户取消
  }
}

const clearAllData = async () => {
  try {
    await showConfirmDialog({
      title: '⚠️ 危险操作',
      message: '此操作将删除所有记账数据，包括：\n• 所有收支记录\n• 自定义分类\n• 账户信息\n• 统计数据\n\n删除后无法恢复，请谨慎操作！',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    // 二次确认
    await showConfirmDialog({
      title: '最后确认',
      message: '您真的要删除所有数据吗？\n这个操作无法撤销！',
      confirmButtonText: '确定删除',
      cancelButtonText: '我再想想',
      confirmButtonColor: '#ee0a24'
    })
    
    // 执行清除所有数据
    await performClearAllData()
    
    showToast('所有数据已清除')
    
    // 延迟后刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 1500)
    
  } catch {
    // 用户取消
  }
}

// 执行清除所有数据的函数
const performClearAllData = async () => {
  try {
    // 清除IndexedDB
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases?.() || []
      await Promise.all(
        databases.map(db => {
          if (db.name === 'MochiMoney') {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!)
              deleteReq.onsuccess = () => resolve(void 0)
              deleteReq.onerror = () => reject(deleteReq.error)
            })
          }
        })
      )
    }
    
    // 清除localStorage
    localStorage.clear()
    
    // 清除sessionStorage
    sessionStorage.clear()
    
    // 清除缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
  } catch (error) {
    console.error('清除数据时出错:', error)
    throw error
  }
}

// 页面加载时恢复语言设置
const loadSettings = () => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage && languageOptions.find(l => l.value === savedLanguage)) {
    currentLanguage.value = savedLanguage
  }
}

// 页面初始化
const initPage = async () => {
  loadSettings()
  await new Promise(resolve => setTimeout(resolve, 50))
  showContentWithDelay(50)
}

// 初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped>
.general-settings-page {
  min-height: 100vh;
  background: var(--color-background);
}

.settings-content {
  padding: var(--space-md);
  padding-bottom: var(--space-xl);
}

/* 设置区块 */
.settings-section {
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  padding-left: var(--space-xs);
}

.settings-list {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* 设置项目 */
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background-color: var(--color-background-light);
}

.item-content {
  flex: 1;
  margin-right: var(--space-md);
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.item-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* 控件样式 */
.settings-item .van-icon[name="delete-o"],
.settings-item .van-icon[name="warning-o"] {
  font-size: 18px;
}

/* 选择器样式调整 */
:deep(.van-action-sheet__header) {
  font-weight: 600;
}

:deep(.van-action-sheet__item) {
  font-size: var(--font-size-md);
}

:deep(.van-action-sheet__cancel) {
  color: var(--color-text-secondary);
}
</style>
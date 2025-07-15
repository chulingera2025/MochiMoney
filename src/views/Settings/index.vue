<template>
  <div class="settings-page">
    <AppHeader 
      title="设置" 
      :show-back="false"
    />
    
    <div class="settings-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 数据管理 -->
      <div class="settings-section lazy-card">
        <div class="section-title">数据管理</div>
        <div class="settings-list">
          <div class="settings-item" @click="goToCategories">
            <div class="item-icon">
              <van-icon name="apps-o" />
            </div>
            <div class="item-content">
              <div class="item-title">分类管理</div>
              <div class="item-desc">管理收支分类</div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="settings-item" @click="goToAccounts">
            <div class="item-icon">
              <van-icon name="balance-o" />
            </div>
            <div class="item-content">
              <div class="item-title">账户管理</div>
              <div class="item-desc">管理账户信息</div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="settings-item" @click="handleDataBackup">
            <div class="item-icon">
              <van-icon name="records" />
            </div>
            <div class="item-content">
              <div class="item-title">数据备份</div>
              <div class="item-desc">备份恢复数据</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
      
      <!-- 应用设置 -->
      <div class="settings-section lazy-card">
        <div class="section-title">应用设置</div>
        <div class="settings-list">
          <div class="settings-item" @click="handleGeneralSettings">
            <div class="item-icon">
              <van-icon name="setting-o" />
            </div>
            <div class="item-content">
              <div class="item-title">通用设置</div>
              <div class="item-desc">主题、语言等</div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="settings-item" @click="handleNotificationSettings">
            <div class="item-icon">
              <van-icon name="bell-o" />
            </div>
            <div class="item-content">
              <div class="item-title">通知设置</div>
              <div class="item-desc">推送通知管理</div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="settings-item" @click="handleInstallApp">
            <div class="item-icon">
              <van-icon name="apps-o" />
            </div>
            <div class="item-content">
              <div class="item-title">安装应用</div>
              <div class="item-desc">安装到桌面使用</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
      
      <!-- 关于 -->
      <div class="settings-section lazy-card">
        <div class="section-title">关于</div>
        <div class="settings-list">
          <div class="settings-item" @click="showAboutDialog">
            <div class="item-icon">
              <van-icon name="info-o" />
            </div>
            <div class="item-content">
              <div class="item-title">关于应用</div>
              <div class="item-desc">版本 v1.0.0</div>
            </div>
            <van-icon name="arrow" />
          </div>
          
          <div class="settings-item" @click="showHelpDialog">
            <div class="item-icon">
              <van-icon name="service-o" />
            </div>
            <div class="item-content">
              <div class="item-title">帮助反馈</div>
              <div class="item-desc">使用帮助和反馈</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
    
    <!-- 底部导航 -->
    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import AppTabbar from '@/components/common/AppTabbar.vue'
import Loading from '@/components/common/Loading.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 页面初始化
const initPage = async () => {
  await new Promise(resolve => setTimeout(resolve, 50))
  showContentWithDelay(50)
}

// 启动初始化
initPage()

// 跳转到分类管理
const goToCategories = () => {
  router.push('/categories')
}

// 跳转到账户管理
const goToAccounts = () => {
  router.push('/accounts')
}

// 数据备份处理
const handleDataBackup = () => {
  showDialog({
    title: '功能开发中',
    message: '数据备份功能正在开发中，敬请期待！\n\n即将支持：\n• 本地数据备份\n• 云端数据备份\n• 定时自动备份\n• 数据恢复功能',
    confirmButtonText: '知道了',
    showCancelButton: false
  })
}

// 通用设置处理
const handleGeneralSettings = () => {
  router.push('/settings/general')
}

// 通知设置处理
const handleNotificationSettings = () => {
  showDialog({
    title: '功能开发中',
    message: '通知设置功能正在开发中，敬请期待！\n\n即将支持：\n• 记账提醒设置\n• 预算超支提醒\n• 账单到期提醒\n• 推送通知管理',
    confirmButtonText: '知道了',
    showCancelButton: false
  })
}

// 安装应用处理
const handleInstallApp = () => {
  // 检查是否已经是PWA模式
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    showToast('应用已安装')
    return
  }

  // 检查是否支持PWA
  if (!('serviceWorker' in navigator)) {
    showDialog({
      title: '不支持安装',
      message: '当前浏览器不支持PWA安装功能。\n\n建议使用以下浏览器：\n• Chrome / Edge\n• Firefox\n• Safari (iOS)',
      confirmButtonText: '知道了',
      showCancelButton: false
    })
    return
  }

  // 检查iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)

  if (isIOS && isSafari) {
    showDialog({
      title: '安装到主屏幕',
      message: 'iOS设备安装步骤：\n\n1. 点击底部分享按钮 📤\n2. 选择"添加到主屏幕"\n3. 点击"添加"完成安装\n\n安装后可在桌面找到应用图标',
      confirmButtonText: '知道了',
      showCancelButton: false
    })
    return
  }

  // 其他浏览器的安装说明
  showDialog({
    title: '安装应用',
    message: '请按以下步骤安装：\n\n1. 在地址栏右侧查看安装图标\n2. 点击安装图标或菜单中的"安装"\n3. 确认安装到桌面\n\n如果没有看到安装选项，请尝试刷新页面',
    confirmButtonText: '知道了',
    showCancelButton: false
  })
}

// 显示关于应用对话框
const showAboutDialog = () => {
  router.push('/settings/about')
}

// 显示帮助对话框
const showHelpDialog = () => {
  router.push('/settings/help')
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 60px;
}

.settings-content {
  padding: var(--space-md);
}

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
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.settings-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
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

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-md);
}

.item-icon .van-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.item-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.settings-item > .van-icon {
  color: var(--color-text-secondary);
}
</style>
<template>
  <!-- 全屏遮罩安装提示 -->
  <div v-if="showInstallPrompt" class="install-overlay">
    <div class="install-modal">
      <div class="install-content">
        <!-- 关闭按钮 -->
        <div class="install-close" @click="handleCancel">
          <van-icon name="cross" size="20" />
        </div>
        
        <!-- 应用图标 -->
        <div class="install-icon">
          <img src="/icons/icon-128x128.png" alt="MochiMoney" class="app-icon" />
        </div>
        
        <!-- 安装信息 -->
        <div class="install-info">
          <h3 class="install-title">安装 MochiMoney</h3>
          <p class="install-subtitle">获得更好的使用体验</p>
          
          <div class="install-features">
            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <div class="feature-text">添加到桌面，快速访问</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">离线使用，随时记账</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <div class="feature-text">原生体验，流畅操作</div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="install-actions">
          <button class="install-btn install-btn--primary" @click="handleInstall">
            立即安装
          </button>
          <button class="install-btn install-btn--secondary" @click="handleCancel">
            暂不安装
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'

// PWA安装相关
const showInstallPrompt = ref(false)
let deferredPrompt: any = null

// 检查是否支持PWA安装
const checkPWAInstallable = () => {
  // 检查是否已经安装
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return false // 已经是PWA模式，不显示安装提示
  }

  // 检查是否支持安装
  if ('serviceWorker' in navigator && 'beforeinstallprompt' in window) {
    return true
  }

  return false
}

// 监听PWA安装事件
const setupPWAInstallListener = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault()
    deferredPrompt = e
    
    // 检查是否应该显示安装提示
    const installDismissed = localStorage.getItem('pwa-install-dismissed')
    const installCount = parseInt(localStorage.getItem('pwa-install-count') || '0')
    
    // 如果用户没有永久拒绝，且提示次数少于3次，则显示提示
    if (!installDismissed && installCount < 3) {
      // 立即显示安装提示
      showInstallPrompt.value = true
    }
  })

  // 监听安装成功事件
  window.addEventListener('appinstalled', () => {
    showToast('应用安装成功！')
    deferredPrompt = null
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-count')
  })
}

// 处理安装
const handleInstall = async () => {
  if (!deferredPrompt) {
    showToast('当前环境不支持安装')
    return
  }

  try {
    // 显示安装提示
    deferredPrompt.prompt()
    
    // 等待用户选择
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      showToast('正在安装应用...')
    } else {
      showToast('安装已取消')
    }
    
    deferredPrompt = null
  } catch (error) {
    console.error('安装失败:', error)
    showToast('安装失败，请稍后重试')
  }
  
  showInstallPrompt.value = false
}

// 处理取消
const handleCancel = () => {
  showInstallPrompt.value = false
  
  // 增加提示计数
  const installCount = parseInt(localStorage.getItem('pwa-install-count') || '0')
  localStorage.setItem('pwa-install-count', (installCount + 1).toString())
  
  // 如果用户拒绝3次，标记为永久拒绝
  if (installCount >= 2) {
    localStorage.setItem('pwa-install-dismissed', 'true')
  }
}

// 手动触发安装提示（供外部调用）
const showInstallDialog = () => {
  if (deferredPrompt) {
    showInstallPrompt.value = true
  } else if (checkPWAInstallable()) {
    showToast('请在支持PWA的浏览器中安装')
  } else {
    showToast('当前环境不支持安装或已安装')
  }
}

// 检查iOS Safari手动安装提示
const showIOSInstallTip = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  
  if (isIOS && isSafari && !window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  return false
}

// 显示iOS安装提示
const showIOSInstallPrompt = () => {
  showToast({
    message: '点击分享按钮 → 添加到主屏幕',
    duration: 3000,
    position: 'bottom'
  })
}

onMounted(() => {
  if (checkPWAInstallable()) {
    setupPWAInstallListener()
  }
  
  // 对于iOS用户，显示手动安装提示
  if (showIOSInstallTip()) {
    setTimeout(() => {
      const iosInstallDismissed = localStorage.getItem('ios-install-dismissed')
      if (!iosInstallDismissed) {
        showIOSInstallPrompt()
        localStorage.setItem('ios-install-dismissed', 'true')
      }
    }, 3000) // 3秒后显示iOS安装提示
  }
})

// 暴露方法供外部调用
defineExpose({
  showInstallDialog
})
</script>

<style scoped>
/* 全屏遮罩 */
.install-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  animation: fadeIn 0.3s ease-out;
}

/* 模态框 */
.install-modal {
  background: var(--color-background-card);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 360px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

/* 内容区域 */
.install-content {
  position: relative;
  padding: var(--space-xl);
  text-align: center;
}

/* 关闭按钮 */
.install-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.install-close:hover {
  background: var(--color-border-light);
  color: var(--color-text-primary);
}

/* 应用图标 */
.install-icon {
  margin-bottom: var(--space-lg);
}

.app-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 安装信息 */
.install-info {
  margin-bottom: var(--space-xl);
}

.install-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.install-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

/* 功能特性 */
.install-features {
  text-align: left;
  margin-bottom: var(--space-lg);
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
  padding: var(--space-sm);
  background: var(--color-background);
  border-radius: var(--border-radius-md);
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 20px;
  margin-right: var(--space-md);
  flex-shrink: 0;
}

.feature-text {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  font-weight: 500;
}

/* 操作按钮 */
.install-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.install-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.install-btn--primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
}

.install-btn--primary:hover {
  background: #1976d2;
  box-shadow: 0 6px 16px rgba(25, 137, 250, 0.4);
  transform: translateY(-1px);
}

.install-btn--secondary {
  background: var(--color-background);
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
}

.install-btn--secondary:hover {
  background: var(--color-border-light);
  color: var(--color-text-primary);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .install-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .install-modal {
    background: var(--color-background-card);
  }
  
  .app-icon {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  .install-btn--primary {
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.2);
  }
  
  .install-btn--primary:hover {
    box-shadow: 0 6px 16px rgba(25, 137, 250, 0.3);
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .install-overlay {
    padding: var(--space-md);
  }
  
  .install-content {
    padding: var(--space-lg);
  }
  
  .app-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }
  
  .install-title {
    font-size: var(--font-size-lg);
  }
  
  .feature-text {
    font-size: var(--font-size-sm);
  }
}
</style>
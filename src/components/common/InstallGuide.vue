<template>
  <!-- 全屏遮罩安装教程 -->
  <div v-if="showGuide" class="guide-overlay lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
    <div class="guide-modal">
      <div class="guide-content">
        <!-- 关闭按钮 -->
        <div class="guide-close" @click="closeGuide">
          <van-icon name="cross" size="20" />
        </div>
        
        <!-- 标题 -->
        <div class="guide-header">
          <h3 class="guide-title">PWA 安装教程</h3>
          <p class="guide-subtitle">选择您的设备类型查看安装步骤</p>
        </div>
        
        <!-- 设备类型切换 -->
        <div class="device-tabs">
          <button 
            class="device-tab" 
            :class="{ 'device-tab--active': activeTab === 'android' }"
            @click="activeTab = 'android'"
          >
            📱 Android
          </button>
          <button 
            class="device-tab" 
            :class="{ 'device-tab--active': activeTab === 'ios' }"
            @click="activeTab = 'ios'"
          >
            🍎 iOS
          </button>
        </div>
        
        <!-- 安装步骤 -->
        <div class="guide-steps">
          <!-- Android 步骤 -->
          <div v-if="activeTab === 'android'" class="steps-content">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4 class="step-title">打开 Chrome 浏览器</h4>
                <p class="step-desc">使用 Chrome、Edge 或其他支持 PWA 的浏览器访问本网站</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4 class="step-title">点击菜单按钮</h4>
                <p class="step-desc">点击浏览器地址栏右侧的 "⋮" 菜单按钮</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4 class="step-title">选择"安装应用"</h4>
                <p class="step-desc">在弹出的菜单中找到并点击 "安装应用" 或 "添加到主屏幕"</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4 class="step-title">确认安装</h4>
                <p class="step-desc">在弹出的确认对话框中点击 "安装" 按钮</p>
              </div>
            </div>
          </div>
          
          <!-- iOS 步骤 -->
          <div v-if="activeTab === 'ios'" class="steps-content">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4 class="step-title">打开 Safari 浏览器</h4>
                <p class="step-desc">使用 Safari 浏览器访问本网站（其他浏览器不支持）</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4 class="step-title">点击分享按钮</h4>
                <p class="step-desc">点击底部工具栏中的分享按钮 📤</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4 class="step-title">选择"添加到主屏幕"</h4>
                <p class="step-desc">在分享菜单中向下滑动，找到并点击 "添加到主屏幕" 📱</p>
              </div>
            </div>
            
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4 class="step-title">确认添加</h4>
                <p class="step-desc">编辑应用名称（可选），然后点击右上角的 "添加" 按钮</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部提示 -->
        <div class="guide-footer">
          <div class="guide-tip">
            <van-icon name="info-o" size="16" />
            <span>安装后可以像原生应用一样使用，支持离线功能</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

// 使用懒加载
const { showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 状态
const showGuide = ref(false)
const activeTab = ref<'android' | 'ios'>('android')

// 打开教程
const openGuide = async () => {
  // 根据设备类型设置默认tab
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  activeTab.value = isIOS ? 'ios' : 'android'
  
  showGuide.value = true
  await showContentWithDelay(50)
}

// 关闭教程
const closeGuide = () => {
  showGuide.value = false
}

// 暴露方法供外部调用
defineExpose({
  openGuide
})
</script>

<style scoped>
/* 全屏遮罩 */
.guide-overlay {
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
.guide-modal {
  background: var(--color-background-card);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

/* 内容区域 */
.guide-content {
  position: relative;
  padding: var(--space-xl);
  max-height: 80vh;
  overflow-y: auto;
}

/* 关闭按钮 */
.guide-close {
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
  z-index: 1;
}

.guide-close:hover {
  background: var(--color-border-light);
  color: var(--color-text-primary);
}

/* 标题区域 */
.guide-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.guide-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.guide-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 设备类型切换 */
.device-tabs {
  display: flex;
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  padding: 4px;
  margin-bottom: var(--space-xl);
}

.device-tab {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-tab--active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

/* 步骤内容 */
.steps-content {
  margin-bottom: var(--space-lg);
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--border-radius-md);
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
  font-weight: 600;
  flex-shrink: 0;
  margin-right: var(--space-md);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.step-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 底部提示 */
.guide-footer {
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.guide-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
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
  .guide-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .guide-modal {
    background: var(--color-background-card);
  }
  
  .device-tab--active {
    box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .guide-overlay {
    padding: var(--space-md);
  }
  
  .guide-content {
    padding: var(--space-lg);
  }
  
  .guide-title {
    font-size: var(--font-size-lg);
  }
  
  .device-tab {
    font-size: var(--font-size-sm);
    padding: var(--space-sm) var(--space-md);
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-sm);
  }
}
</style>
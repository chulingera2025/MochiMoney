<template>
  <div class="about-page">
    <AppHeader 
      title="关于应用" 
      show-left-arrow
      @click-left="goBack"
    />
    
    <div class="about-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 应用Logo和名称 -->
      <div class="app-info lazy-card">
        <div class="app-logo">
          <van-icon name="service" size="60" color="#1989fa" />
        </div>
        <div class="app-name">MochiMoney</div>
        <div class="app-subtitle">糯米记账</div>
        <div class="app-version">版本 v1.0.0</div>
      </div>
      
      <!-- 应用介绍 -->
      <div class="info-section lazy-card">
        <div class="section-title">应用介绍</div>
        <div class="section-content">
          <p class="intro-text">
            MochiMoney 是一款专注于个人记账的移动端应用，旨在帮助用户轻松管理个人财务，培养良好的记账习惯。
          </p>
        </div>
      </div>
      
      <!-- 应用特点 -->
      <div class="info-section lazy-card">
        <div class="section-title">应用特点</div>
        <div class="section-content">
          <div class="feature-list">
            <div class="feature-item">
              <van-icon name="shield-o" />
              <div class="feature-text">
                <div class="feature-title">数据安全</div>
                <div class="feature-desc">纯前端应用，数据完全本地存储，保护隐私</div>
              </div>
            </div>
            
            <div class="feature-item">
              <van-icon name="apps-o" />
              <div class="feature-text">
                <div class="feature-title">PWA支持</div>
                <div class="feature-desc">支持离线使用，可安装到手机桌面</div>
              </div>
            </div>
            
            <div class="feature-item">
              <van-icon name="phone-o" />
              <div class="feature-text">
                <div class="feature-title">移动优先</div>
                <div class="feature-desc">专为移动设备设计，响应式布局</div>
              </div>
            </div>
            
            <div class="feature-item">
              <van-icon name="like-o" />
              <div class="feature-text">
                <div class="feature-title">简洁易用</div>
                <div class="feature-desc">界面简洁明了，操作流程简化</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 技术信息 -->
      <div class="info-section lazy-card">
        <div class="section-title">技术栈</div>
        <div class="section-content">
          <div class="tech-list">
            <div class="tech-item">Vue 3 + TypeScript</div>
            <div class="tech-item">Vant 4 UI组件库</div>
            <div class="tech-item">Pinia 状态管理</div>
            <div class="tech-item">IndexedDB 本地存储</div>
            <div class="tech-item">PWA 渐进式应用</div>
            <div class="tech-item">Vite 构建工具</div>
          </div>
        </div>
      </div>
      
      <!-- 开发信息 -->
      <div class="info-section lazy-card">
        <div class="section-title">开发信息</div>
        <div class="section-content">
          <div class="dev-info">
            <div class="info-row">
              <span class="info-label">开发时间：</span>
              <span class="info-value">2025年1月</span>
            </div>
            <div class="info-row">
              <span class="info-label">当前版本：</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-row">
              <span class="info-label">许可证：</span>
              <span class="info-value">MIT License</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 版权信息 -->
      <div class="copyright">
        <p>© 2025 MochiMoney</p>
        <p>感谢您的使用</p>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

const goBack = () => {
  router.back()
}

// 页面初始化
const initPage = async () => {
  await new Promise(resolve => setTimeout(resolve, 50))
  showContentWithDelay(50)
}

// 初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--color-background);
}

.about-content {
  padding: var(--space-lg);
  padding-bottom: var(--space-xl);
}

/* 应用信息 */
.app-info {
  text-align: center;
  margin-bottom: var(--space-xl);
  padding: var(--space-xl) var(--space-lg);
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.app-logo {
  margin-bottom: var(--space-md);
}

.app-name {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.app-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.app-version {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  background: var(--color-background-light);
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

/* 信息区块 */
.info-section {
  margin-bottom: var(--space-lg);
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.section-content {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

/* 介绍文本 */
.intro-text {
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 特点列表 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.feature-item .van-icon {
  margin-top: 2px;
  color: var(--color-primary);
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.feature-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* 技术列表 */
.tech-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-sm);
}

.tech-item {
  background: var(--color-background-light);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

/* 开发信息 */
.dev-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.info-value {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* 版权信息 */
.copyright {
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.copyright p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  line-height: 1.6;
}
</style>
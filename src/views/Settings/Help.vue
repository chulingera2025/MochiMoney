<template>
  <div class="help-page">
    <AppHeader
      title="帮助反馈"
      show-left-arrow
      @click-left="goBack"
    />

    <div class="help-content lazy-content" v-show="showContent" :class="{ 'fade-in': fadeIn }">
      <!-- 使用帮助 -->
      <div class="help-section lazy-card">
        <div class="section-title">
          <van-icon name="question-o" />
          使用帮助
        </div>

        <div class="help-items">
          <div class="help-item">
            <div class="help-icon">📝</div>
            <div class="help-text">
              <div class="help-title">如何记账？</div>
              <div class="help-desc">
                点击首页右下角的"+"按钮，选择收入或支出，填写金额、分类、账户等信息，点击保存即可完成记账。
              </div>
            </div>
          </div>

          <div class="help-item">
            <div class="help-icon">📊</div>
            <div class="help-text">
              <div class="help-title">如何查看统计？</div>
              <div class="help-desc">
                点击底部导航的"统计"，可以查看收支趋势图、分类占比、账户统计等多维度数据分析。
              </div>
            </div>
          </div>

          <div class="help-item">
            <div class="help-icon">🏷️</div>
            <div class="help-text">
              <div class="help-title">如何管理分类？</div>
              <div class="help-desc">
                进入设置 → 分类管理，可以添加、编辑、删除自定义分类，设置分类图标和颜色。
              </div>
            </div>
          </div>

          <div class="help-item">
            <div class="help-icon">💳</div>
            <div class="help-text">
              <div class="help-title">如何管理账户？</div>
              <div class="help-desc">
                进入设置 → 账户管理，可以添加银行卡、支付宝、微信等不同类型的账户，查看余额变化。
              </div>
            </div>
          </div>

          <div class="help-item">
            <div class="help-icon">🔍</div>
            <div class="help-text">
              <div class="help-title">如何搜索记录？</div>
              <div class="help-desc">
                在记录列表页面点击搜索按钮，可以按关键词、分类、账户、时间范围等条件搜索记录。
              </div>
            </div>
          </div>

          <div class="help-item">
            <div class="help-icon">✏️</div>
            <div class="help-text">
              <div class="help-title">如何修改记录？</div>
              <div class="help-desc">
                在记录列表中点击任意记录，进入详情页面，点击编辑按钮即可修改记录信息。
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="help-section lazy-card">
        <div class="section-title">
          <van-icon name="chat-o" />
          常见问题
        </div>

        <van-collapse v-model="activeNames">
          <van-collapse-item title="数据会丢失吗？" name="1">
            <div class="faq-answer">
              本应用采用纯前端架构，所有数据都存储在您的设备本地，不会上传到服务器。只要不清除浏览器数据，记录就不会丢失。建议定期使用数据备份功能。
            </div>
          </van-collapse-item>

          <van-collapse-item title="可以离线使用吗？" name="2">
            <div class="faq-answer">
              是的，本应用支持PWA技术，可以离线使用。您可以将应用添加到手机桌面，像原生应用一样使用。
            </div>
          </van-collapse-item>

          <van-collapse-item title="如何备份数据？" name="3">
            <div class="faq-answer">
              目前数据备份功能正在开发中，即将支持本地备份和云端备份。您可以通过浏览器的导出功能临时备份数据。
            </div>
          </van-collapse-item>

          <van-collapse-item title="支持多设备同步吗？" name="4">
            <div class="faq-answer">
              当前版本暂不支持多设备同步，数据仅存储在本地。未来版本将考虑添加云端同步功能。
            </div>
          </van-collapse-item>

          <van-collapse-item title="如何删除所有数据？" name="5">
            <div class="faq-answer">
              您可以通过浏览器设置清除本网站的所有数据，或者等待数据清理功能上线。请注意，清除后数据无法恢复。
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 功能建议 -->
      <div class="help-section lazy-card">
        <div class="section-title">
          <van-icon name="bulb-o" />
          功能建议
        </div>

        <div class="suggestion-content">
          <p class="suggestion-text">
            如果您有任何功能建议或改进意见，我们非常欢迎您的反馈！您的建议将帮助我们打造更好的记账体验。
          </p>

          <div class="suggestion-items">
            <div class="suggestion-item">
              <van-icon name="star-o" />
              <span>预算管理功能</span>
            </div>
            <div class="suggestion-item">
              <van-icon name="star-o" />
              <span>数据导入导出</span>
            </div>
            <div class="suggestion-item">
              <van-icon name="star-o" />
              <span>智能分类识别</span>
            </div>
            <div class="suggestion-item">
              <van-icon name="star-o" />
              <span>多币种支持</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="help-section lazy-card">
        <div class="section-title">
          <van-icon name="service-o" />
          联系我们
        </div>

        <div class="contact-content">
          <div class="contact-item" @click="copyToClipboard('chulingera2025@gmail.com')">
            <van-icon name="envelop-o" />
            <div class="contact-text">
              <div class="contact-label">邮箱反馈</div>
              <div class="contact-value">chulingera2025@gmail.com</div>
            </div>
            <van-icon name="arrow" class="copy-icon" />
          </div>

          <div class="contact-item" @click="copyToClipboard('https://github.com/chulingera2025/MochiMoney')">
            <van-icon name="link-o" />
            <div class="contact-text">
              <div class="contact-label">Github地址</div>
              <div class="contact-value">https://github.com/chulingera2025/MochiMoney</div>
            </div>
            <van-icon name="arrow" class="copy-icon" />
          </div>

          <div class="contact-item">
            <van-icon name="wechat" />
            <div class="contact-text">
              <div class="contact-label">微信群</div>
              <div class="contact-value">暂无链接</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 感谢语 -->
      <div class="thanks-section">
        <div class="thanks-text">
          <p>感谢您使用 MochiMoney！</p>
          <p>您的支持是我们不断改进的动力</p>
        </div>
      </div>
    </div>

    <!-- 全局加载状态 -->
    <Loading v-if="isLoading" overlay />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import Loading from '@/components/common/Loading.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

const router = useRouter()

// 使用懒加载
const { isLoading, showContent, fadeIn, showContentWithDelay } = useLazyLoad()

// 折叠面板激活的项目
const activeNames = ref(['1'])

const goBack = () => {
  router.back()
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败，请手动复制')
  }
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
.help-page {
  min-height: 100vh;
  background: var(--color-background);
}

.help-content {
  padding: var(--space-md);
  padding-bottom: var(--space-xl);
}

/* 帮助区块 */
.help-section {
  margin-bottom: var(--space-lg);
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-light);
}

.section-title .van-icon {
  color: var(--color-primary);
}

/* 帮助项目 */
.help-items {
  padding: var(--space-md);
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.help-item:last-child {
  border-bottom: none;
}

.help-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
  margin-top: 2px;
}

.help-text {
  flex: 1;
}

.help-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.help-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 常见问题 */
.faq-answer {
  padding: var(--space-md);
  background: var(--color-background-light);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 功能建议 */
.suggestion-content {
  padding: var(--space-lg);
}

.suggestion-text {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--space-lg) 0;
}

.suggestion-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-sm);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background-light);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.suggestion-item .van-icon {
  color: var(--color-warning);
}

/* 联系我们 */
.contact-content {
  padding: var(--space-lg);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .van-icon {
  color: var(--color-primary);
  font-size: 20px;
}

.contact-text {
  flex: 1;
}

.contact-label {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.contact-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 感谢语 */
.thanks-section {
  text-align: center;
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-success-light));
  border-radius: var(--border-radius-lg);
}

.thanks-text p {
  margin: 0;
  color: var(--color-text-primary);
  font-weight: 500;
  line-height: 1.6;
}

.thanks-text p:first-child {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-xs);
}

.thanks-text p:last-child {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 折叠面板样式调整 */
:deep(.van-collapse-item__title) {
  font-weight: 500;
  color: var(--color-text-primary);
  background: var(--color-background-card);
}

:deep(.van-collapse-item__content) {
  background: var(--color-background);
}

:deep(.van-collapse-item__wrapper) {
  background: var(--color-background-card);
}

:deep(.van-collapse-item) {
  background: var(--color-background-card);
}
</style>

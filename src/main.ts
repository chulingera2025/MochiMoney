import './assets/main.css'
import './styles/lazy-load.css'
import './styles/theme-fix.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 导入Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

import App from './App.vue'
import router from './router'

// 导入数据初始化服务
import { dataInitService } from './services/dataInit'
import { dataMigrationService } from './services/dataMigration'

// 导入主题管理
import './composables/useTheme'

// 初始化应用
const initApp = async () => {
  try {
    // 数据库迁移
    if (dataMigrationService.needsMigration()) {
      await dataMigrationService.migrate()
    }
    
    // 数据初始化
    await dataInitService.initializeApp()
    
    // 创建Vue应用
    const app = createApp(App)
    
    app.use(createPinia())
    app.use(router)
    app.use(Vant)
    
    app.mount('#app')
    
    console.log('应用启动成功')
  } catch (error) {
    console.error('应用启动失败:', error)
    
    // 显示错误信息
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #ee0a24;">
        <h2>应用启动失败</h2>
        <p>请刷新页面重试，或联系技术支持</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">
          ${error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    `
  }
}

// 启动应用
initApp()

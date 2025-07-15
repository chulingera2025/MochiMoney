import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

// 全局路由懒加载函数
const lazyLoad = (componentImport: () => Promise<any>) => {
  return async () => {
    // 添加最小延迟，防止闪烁
    const [component] = await Promise.all([
      componentImport(),
      new Promise(resolve => setTimeout(resolve, 50))
    ])
    
    // 确保DOM更新完成
    await nextTick()
    
    return component
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: lazyLoad(() => import('../views/Home/index.vue')),
      meta: { title: '首页' }
    },
    {
      path: '/records',
      name: 'records',
      component: lazyLoad(() => import('../views/Record/index.vue')),
      meta: { title: '记录' }
    },
    {
      path: '/records/add',
      name: 'record-add',
      component: lazyLoad(() => import('../views/Record/Add.vue')),
      meta: { title: '记一笔' }
    },
    {
      path: '/records/edit/:id',
      name: 'record-edit',
      component: lazyLoad(() => import('../views/Record/Edit.vue')),
      meta: { title: '编辑记录' }
    },
    {
      path: '/records/detail/:id',
      name: 'record-detail',
      component: lazyLoad(() => import('../views/Record/Detail.vue')),
      meta: { title: '记录详情' }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: lazyLoad(() => import('../views/Statistics/index.vue')),
      meta: { title: '统计' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: lazyLoad(() => import('../views/Settings/index.vue')),
      meta: { title: '设置' }
    },
    {
      path: '/categories',
      name: 'categories',
      component: lazyLoad(() => import('../views/Category/index.vue')),
      meta: { title: '分类管理' }
    },
    {
      path: '/categories/add',
      name: 'category-add',
      component: lazyLoad(() => import('../views/Category/Add.vue')),
      meta: { title: '添加分类' }
    },
    {
      path: '/categories/edit/:id',
      name: 'category-edit',
      component: lazyLoad(() => import('../views/Category/Add.vue')),
      meta: { title: '编辑分类' }
    },
    {
      path: '/categories/detail/:id',
      name: 'category-detail',
      component: lazyLoad(() => import('../views/Category/Detail.vue')),
      meta: { title: '分类详情' }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: lazyLoad(() => import('../views/Account/index.vue')),
      meta: { title: '账户管理' }
    },
    {
      path: '/accounts/add',
      name: 'account-add',
      component: lazyLoad(() => import('../views/Account/Add.vue')),
      meta: { title: '添加账户' }
    },
    {
      path: '/accounts/edit/:id',
      name: 'account-edit',
      component: lazyLoad(() => import('../views/Account/Add.vue')),
      meta: { title: '编辑账户' }
    },
    {
      path: '/accounts/detail/:id',
      name: 'account-detail',
      component: lazyLoad(() => import('../views/Account/Detail.vue')),
      meta: { title: '账户详情' }
    },
    {
      path: '/settings/about',
      name: 'settings-about',
      component: lazyLoad(() => import('../views/Settings/About.vue')),
      meta: { title: '关于应用' }
    },
    {
      path: '/settings/help',
      name: 'settings-help',
      component: lazyLoad(() => import('../views/Settings/Help.vue')),
      meta: { title: '帮助反馈' }
    },
    {
      path: '/settings/general',
      name: 'settings-general',
      component: lazyLoad(() => import('../views/Settings/General.vue')),
      meta: { title: '通用设置' }
    },
    // 其他路由将在后续开发中添加
  ],
})

// 全局路由守卫，添加页面切换动画
router.beforeEach((to, from, next) => {
  // 可以在这里添加全局loading状态
  next()
})

router.afterEach(() => {
  // 路由切换完成后的处理
  nextTick(() => {
    // 确保页面渲染完成
  })
})

export default router

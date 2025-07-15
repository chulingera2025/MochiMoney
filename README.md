<div align="center">
  <img src="https://img.shields.io/badge/MochiMoney-💰-orange?style=for-the-badge" alt="MochiMoney">
  
  # 🍡 MochiMoney
  
  **现代化的个人记账 PWA 应用**
  
  一个功能完整、界面美观的记账应用，支持多账户管理、分类统计、离线使用
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Vue](https://img.shields.io/badge/Vue-3.5.17-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  
  [在线演示](https://mochimoney.zclkj.ltd/) | [功能特性](#-功能特性) | [快速开始](#-快速开始) | [技术栈](#-技术栈)
  
</div>

---

## 📸 预览

## ✨ 功能特性

### 💰 核心功能
- **📊 智能记账** - 快速添加收入/支出记录
- **🏦 多账户管理** - 支持现金、银行卡、信用卡等多种账户
- **📝 分类管理** - 自定义收支分类，支持图标和颜色
- **📈 数据统计** - 直观的图表展示消费趋势和分类占比
- **🔍 记录管理** - 查看、编辑、删除历史记录

### 🚀 技术特性
- **📱 PWA 支持** - 可安装到桌面，支持离线使用
- **🎨 响应式设计** - 完美适配手机、平板、桌面
- **⚡ 性能优化** - 懒加载、虚拟滚动、数据缓存
- **🔒 本地存储** - 数据完全本地化，保护隐私安全
- **🌙 主题切换** - 支持明暗主题切换

## 🛠️ 技术栈

<div align="center">

| 分类 | 技术 | 描述 |
|------|------|------|
| **前端框架** | ![Vue.js](https://img.shields.io/badge/Vue.js-3.5.17-4FC08D?logo=vue.js&logoColor=white) | 渐进式 JavaScript 框架 |
| **开发语言** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white) | 类型安全的 JavaScript 超集 |
| **构建工具** | ![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white) | 下一代前端构建工具 |
| **状态管理** | ![Pinia](https://img.shields.io/badge/Pinia-3.0.3-42B883?logo=pinia&logoColor=white) | Vue 3 官方状态管理库 |
| **UI 组件** | ![Vant](https://img.shields.io/badge/Vant-4.9.20-07C160?logo=vant&logoColor=white) | 轻量级移动端组件库 |
| **数据库** | ![Dexie](https://img.shields.io/badge/Dexie-4.0.11-FF6B6B?logo=database&logoColor=white) | IndexedDB 封装库 |
| **图表库** | ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.0-FF6384?logo=chart.js&logoColor=white) | 简单而灵活的图表库 |
| **工具库** | ![Day.js](https://img.shields.io/badge/Day.js-1.11.13-FF5F5F?logo=dayjs&logoColor=white) | 轻量级日期处理库 |
| **测试框架** | ![Vitest](https://img.shields.io/badge/Vitest-3.2.4-6E9F18?logo=vitest&logoColor=white) | 基于 Vite 的单元测试框架 |

</div>

## 🚀 快速开始

### 📋 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 🔧 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/MochiMoney.git
   cd MochiMoney
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

5. **预览生产版本**
   ```bash
   npm run preview
   ```

## 📜 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run test:unit` | 运行单元测试 |
| `npm run lint` | 代码格式检查和修复 |
| `npm run format` | 格式化代码 |
| `npm run type-check` | TypeScript 类型检查 |

## 📱 PWA 安装

MochiMoney 支持 PWA（Progressive Web App）功能：

1. **在浏览器中访问应用**
2. **点击地址栏的"安装"按钮**
3. **或在设置中选择"添加到主屏幕"**
4. **即可像原生应用一样使用**

## 🏗️ 项目结构

```
MochiMoney/
├── public/                 # 静态资源
│   ├── icons/             # PWA 图标
│   └── favicon.ico        # 网站图标
├── src/
│   ├── assets/            # 样式资源
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   ├── form/          # 表单组件
│   │   ├── record/        # 记录组件
│   │   └── statistics/    # 统计组件
│   ├── composables/       # 组合式函数
│   ├── constants/         # 常量定义
│   ├── router/            # 路由配置
│   ├── services/          # 业务服务
│   │   └── database/      # 数据库相关
│   ├── styles/            # 全局样式
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── main.ts            # 入口文件
├── tests/                 # 测试文件
└── ...配置文件
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 本仓库**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 📝 提交规范

请使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vant](https://vant-ui.github.io/) - 轻量级移动端组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Dexie](https://dexie.org/) - IndexedDB 封装库
- [Chart.js](https://www.chartjs.org/) - 图表库

---

<div align="center">
  
  **如果这个项目对你有帮助，请给一个 ⭐️ 支持一下！**
  
  [![GitHub stars](https://img.shields.io/github/stars/chulingera2025/MochiMoney.svg?style=social&label=Star)](https://github.com/chulingera2025/MochiMoney)
  [![GitHub forks](https://img.shields.io/github/forks/chulingera2025/MochiMoney.svg?style=social&label=Fork)](https://github.com/chulingera2025/MochiMoney)
  
</div>
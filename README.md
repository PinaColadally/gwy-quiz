# 🏛 公考常识每日刷题

公务员国考/省考行测 **常识判断** 每日刷题系统。

## ✨ 功能特点

- **每日刷题**：每日自动出题，10道必选真题 + 剩余由AI/静态题库补充
- **海量题库**：1500+道预置题目，覆盖国考省考常识全考点
- **全分类覆盖**：政治理论、党史近代史、经济思想、文化思想、政策规划、科技成就、重大项目、法律法规、重要讲话、自然常识、理化生
- **AI出题**：支持配置 DeepSeek API，基于最新时事动态生成新题
- **历年真题**：收录历年国考省考常识真题，标注来源和年份
- **答题模式**：练习模式（逐题查看解析）和考试模式（限时模拟）
- **错题本**：自动收集错题，支持错题重做
- **学习统计**：正确率趋势、分类统计、连续打卡天数
- **题库浏览**：按分类/关键词搜索浏览全部题目
- **收藏夹**：收藏重点题目反复复习
- **暗色模式**：支持亮色/暗色主题切换
- **移动端适配**：PWA支持，可安装到手机桌面
- **数据管理**：支持做题数据导入导出备份

## 📖 知识点分类

| 分类 | 内容 |
|------|------|
| 🏛 政治理论 | 习近平新时代中国特色社会主义思想、马克思主义基本原理 |
| 📜 党史近代史 | 中共党史、中国近代史、重要会议（二十大~二十届四中全会） |
| 💰 经济思想 | 习近平经济思想、新发展理念、宏观经济政策 |
| 🎭 文化思想 | 习近平文化思想、文化自信 |
| 📋 政策规划 | 政府工作报告、十五五规划、乡村振兴 |
| 🚀 科技成就 | 航天成就、深海探测、量子科技 |
| 🏗 重大项目 | 港珠澳大桥、南水北调、白鹤滩 |
| ⚖ 法律法规 | 宪法、民法典、党章党规 |
| 🎤 重要讲话 | 新年致辞、外交讲话、考察讲话 |
| 🌿 自然常识 | 二十四节气、天文地理 |
| 🔬 理化生 | 物理/化学/生物初高中基础 |

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 部署到 GitHub Pages

1. 在 GitHub 上创建仓库 `gwy-quiz`
2. 推送代码：

```bash
git remote add origin https://github.com/你的用户名/gwy-quiz.git
git branch -M main
git push -u origin main
```

3. 在仓库 Settings → Pages 中设置 Source 为 **GitHub Actions**
4. 之后每次推送到 main 分支都自动部署
5. 访问 `https://你的用户名.github.io/gwy-quiz/`

### 配置 AI 出题（可选）

在设置页面填入：
- **API Key**: 你的 DeepSeek / OpenAI 兼容 API Key
- **API 地址**: `https://api.deepseek.com`
- **模型**: `deepseek-chat`（或其他兼容模型）

不配置 AI 时，系统会自动使用题库中的静态题目补充。

## 🛠 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 8
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **数据存储**: IndexedDB (Dexie.js)
- **图表**: Recharts
- **图标**: Lucide React
- **AI**: DeepSeek API / OpenAI 兼容 API

## 📦 项目结构

```
src/
├── types/          # 类型定义
├── data/           # 题库数据 (1500+题)
├── store/          # 状态管理
├── db/             # IndexedDB 封装
├── utils/          # 工具函数 + AI生成器
├── components/     # 通用组件
│   ├── Layout.tsx
│   ├── QuestionCard.tsx
│   ├── AnswerSheet.tsx
│   └── Timer.tsx
└── pages/          # 页面组件
    ├── HomePage.tsx
    ├── QuizPage.tsx
    ├── WrongBookPage.tsx
    ├── FavoritesPage.tsx
    ├── StatsPage.tsx
    ├── QuestionBankPage.tsx
    └── SettingsPage.tsx
```

## 📄 许可

MIT License

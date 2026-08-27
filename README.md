# Vesta｜迹与寻

> **AI-powered human discovery platform.**
> 一个通过数字痕迹发现创造者、通过智能探索连接机会的平台。

**迹** —— 发现创造者。Vesta 读取开发者在 GitHub 上留下的数字足迹（提交、仓库、贡献、协作），用 AI 生成比简历更真实的能力画像。
**寻** —— 寻找机会。理解创造者的能力轨迹与成长路径，帮其发现真正适合的未来。

本仓库当前落地的是双引擎中的 **迹 · Trace（GitHub 开发者发现）**：输入任意 GitHub 用户名，AI 生成多维能力画像、代码指纹与可打印简历。

**[→ 立即体验](https://milab-bit.github.io/GitHub-Headhunter/)**

---

## ✨ 核心功能（迹 · Trace）

- ⚡ **零部署** — 纯前端单页应用，无需服务器，开箱即用
- 🧬 **五维能力画像** — 基于真实数据（Stars、Followers、语言分布）动态计算
- 🕵️ **代码指纹提取** — 主力语言栈、原创比例、开源协议意识
- 📄 **一页纸简历** — 可直接打印或导出 PDF
- 🔄 **智能降级** — 无 API Key 时使用启发式规则，仍能生成分析
- 🌙 **响应式设计** — 完美适配桌面端和移动端

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS 3（Vesta 主题：深蓝 / 暖金 / 珊瑚红） |
| 图表 | Chart.js + react-chartjs-2 |
| 数据源 | GitHub REST API v3 |
| AI 分析 | Gemini API v1beta（可选） / 启发式降级 |
| 部署 | GitHub Pages |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📁 项目结构

```
src/
├── main.tsx                     # 入口
├── App.tsx                      # 主应用（状态管理 + 布局 + 品牌导航）
├── index.css                    # 全局样式（Vesta 主题）
├── types/
│   └── index.ts                 # TypeScript 类型定义
├── services/
│   ├── github.ts               # GitHub API 封装（含缓存 + 降级）
│   └── gemini.ts               # Gemini API 调用（含 5 次重试 + 启发式降级）
├── hooks/
│   └── useHunterData.ts        # 数据获取 hook（搜索 + 状态）
├── components/
│   ├── UserCard.tsx            # 用户信息卡片
│   ├── AnalyticsCharts.tsx      # 雷达图 + 环形图 + 技能标签
│   ├── AnalysisPanel.tsx        # AI 分析结论面板
│   ├── ResumeView.tsx           # 一页纸简历
│   ├── LoadingOverlay.tsx        # 加载动画
│   └── RepoList.tsx            # 仓库列表
└── utils/
    ├── helpers.ts               # 通用工具（cn, debounce, etc.）
    └── formatters.ts            # 格式化工具
```

---

## 🔧 环境变量（可选）

创建 `.env.local`（**切勿提交，已加入 `.gitignore`**）：

```env
# GitHub Token —— 使用 fine-grained PAT，最小权限即可（无需 full scope）
# 将 API 限速从 60 次/小时 提升到 5000 次/小时
VITE_GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxx

# Gemini API Key（不填则使用启发式分析）
VITE_GEMINI_API_KEY=your_gemini_api_key

# Gemini 模型（默认 gemini-2.0-flash）
VITE_GEMINI_MODEL=gemini-2.0-flash
```

> ⚠️ **安全提示**：永远不要把 token 粘贴进聊天、Issue 或提交到仓库。一旦明文暴露，立即到
> https://github.com/settings/tokens 吊销并重新生成。详见 [SECURITY.md](./SECURITY.md)。

---

## ⚠️ GitHub API 限制

未授权 API 有 **60 次/小时** 的限速。建议：

1. **添加 fine-grained GitHub Token**（最小权限，免费）
2. 使用 **localStorage 缓存**（5 分钟内重复查询不消耗配额）

---

## 🧭 品牌与愿景

- 品牌故事与命名逻辑见 [BRAND.md](./BRAND.md)
- 视觉规范（Logo / 配色 / 结构图）见 [VISUAL.md](./VISUAL.md)
- 双引擎技术架构见 [docs/architecture.md](./docs/architecture.md)

Vesta 不做"招聘"，而是**保护、发现、连接下一代创造者**。

---

## 📝 开发说明

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

---

## 📄 文档

- [SPEC.md](./SPEC.md) — 功能规格文档
- [ROADMAP.md](./ROADMAP.md) — 版本路线图
- [SECURITY.md](./SECURITY.md) — Token 安全接入

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

# Vesta 项目交接文档（Agent Handoff）

> 本文档供接手工的 agent / 后续会话直接阅读，无需回溯聊天记录即可继续。

---

## 0. 一句话现状

GitHub-Headhunter 仓库已**品牌化为 Vesta｜迹与寻**（AI 人才发现平台），代码入口改动已在本地提交（`4c4af7f`），。产品侧功能（寻 · Seek 引擎、Creator Network）尚未启动。

---

## 1. 项目背景与目标

- **原项目**：`MiLab-Bit/GitHub-Headhunter`，纯前端 React+TS 网页应用，输入 GitHub 用户名生成开发者能力画像/代码指纹/可打印简历（对应 Vesta 双引擎中的 **迹 · Trace**）。
- **新品牌**：**Vesta｜迹与寻** —— "AI-powered human discovery platform"。
  - **迹 Trace**：发现创造者（GitHub 开发者发现，当前已落地）。
  - **寻 Seek**：寻找机会（岗位/职业匹配，未做）。
  - 双引擎汇聚为 **Creator Network**。
- **母题**：「发现隐藏价值」（与用户此前城市数据/文明数据路线一致）。

---

## 2. 已完成工作

### 2.1 品牌包 `vesta-brand/`（独立目录，未并入仓库）

| 文件 | 用途 |
|------|------|
| `vesta-brand/README.md` | Vesta 品牌落地版 README |
| `vesta-brand/BRAND.md` | 品牌故事（中/英）+ 命名逻辑 + Vesta 灶神含义 |
| `vesta-brand/VISUAL.md` | Logo 概念、配色、Mermaid 结构图、字体规范 |
| `vesta-brand/SECURITY.md` | Token 安全接入、最小权限、轮换、隐私合规 |
| `vesta-brand/.env.example` | 环境变量模板 |
| `vesta-brand/src/vesta_config.example.js` | 安全读 token 示例 |
| `vesta-brand/src/github_client.example.js` | Bearer 鉴权 + 速率限制客户端示例 |
| `vesta-brand/docs/architecture.md` | 双引擎技术架构 |

### 2.2 代码入口品牌化（已提交 `4c4af7f`，位于 `repo-tmp/`）

| 文件 | 改动 |
|------|------|
| `index.html` | title/description/og/theme-color → Vesta｜迹与寻（深蓝 `#1B2A4A`） |
| `package.json` | description → Vesta 迹与寻 · AI 人才发现引擎 |
| `src/App.tsx` | 导航 `Vesta 迹与寻`、按钮 `发现创造者`、空状态文案/图标 |
| `public/favicon.svg` | 新 Logo：深蓝底 + 暖金火种环 + 珊瑚红网络节点 |
| `tailwind.config.js` | `brand` 改深蓝，新增 `gold`/`coral` 色板 |
| `src/index.css` | 选中态/焦点环改暖金·深蓝 |
| `src/components/AnalyticsCharts.tsx` | 雷达图 teal → 暖金 `#C9A24B` |
| `README.md` | Vesta 品牌版，token 示例改 fine-grained 最小权限 |

提交信息：`brand: rebrand GitHunter -> Vesta 迹与寻 (entry points + theme)`

---

## 4. 文件地图（接手工看这里）

```
workspace/
├── vesta-brand/            # 品牌资产包（独立，未并入仓库）
│   ├── README.md  BRAND.md  VISUAL.md  SECURITY.md
│   ├── .env.example
│   ├── src/                 # 安全接入示例代码（参考用，非运行必需）
│   └── docs/architecture.md
└── repo-tmp/               # GitHub-Headhunter 克隆（含本地提交 4c4af7f）
    ├── HANDOFF.md          # 本文件
    ├── index.html  package.json  README.md
    ├── public/favicon.svg
    ├── tailwind.config.js  src/index.css
    ├── src/App.tsx  src/components/AnalyticsCharts.tsx
    └── （SPEC.md / ROADMAP.md 仍写 GitHunter，待产品阶段改写）
```

---

## 5. 阻塞项

- 
- **产品阶段未启动**：寻 · Seek、Creator Network 仅存在于品牌文档，无代码。

---

## 6. 下一步可接任务（按优先级）


### P1 — 产品文档品牌化（本地可做的代码改动）
- 改写 `SPEC.md`、`ROADMAP.md` 为 Vesta 叙事（当前仍写 GitHunter）。
- 完成后 `git commit` 并入当前分支（仍不推送）。

### P2 — 产品功能（需用户明确范围后再做）
- **寻 · Seek 引擎**：岗位/职业匹配模块（输入开发者画像 → 机会推荐）。
- **Creator Network**：迹/寻闭环与反馈回流。
- 视觉统一：结果页、简历页进一步贴合 Vesta 主题。
- 安全接入落地：把 `vesta-brand/src/*.example.js` 的逻辑并入真实 `services/github.ts`（从 `VITE_GITHUB_TOKEN` 读，fine-grained 最小权限）。

---

## 7. 环境与命令

```bash
cd repo-tmp
npm install
npm run dev        # 本地开发 http://localhost:3001
npm run build      # 产物到 dist/，可 npm run preview 预览
npm run lint       # 代码检查
```
当前改动仅涉及文案/类名/颜色，TS 类型不受影响；提交前建议 `npm run build` 验证。

--
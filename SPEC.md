# Vesta 功能规格 (SPEC)

> Vesta｜迹与寻 · AI 人才发现平台（AI-powered human discovery platform）
> 母题：**发现隐藏价值** —— 从开发者的代码指纹，到创造者的机会网络。

---

## 1. 产品定位

**Vesta｜迹与寻** 是一款面向技术猎头、HR、技术管理者与开源社区观察者的"人才发现"平台。它以 GitHub 公开数据为底，自动：

1. 获取任意开发者的公开数据
2. 生成五维能力画像与代码指纹
3. 渲染可打印的"一页纸简历"

平台由**双引擎**构成，当前已落地第一引擎：

| 引擎 | 名称 | 状态 | 说明 |
|------|------|------|------|
| **迹 · Trace** | 发现创造者 | ✅ 已落地 | GitHub 开发者画像 / 代码指纹 / 可打印简历（本仓库现有功能） |
| **寻 · Seek** | 寻找机会 | 📋 规划中 | 将开发者画像与岗位 / 职业机会匹配（见 ROADMAP v2.0） |
| **Creator Network** | 创造者网络 | 📋 规划中 | 迹 / 寻闭环与反馈回流，沉淀创造者关系网络 |

**目标用户：** 技术猎头、HR、技术管理者、开源社区观察者、创造者本人。

> 历史说明：本仓库前身为 `GitHunter`（开发者能力画像工具）。品牌升级为 Vesta 后，其全部能力归入 **迹 · Trace** 引擎，作为平台的第一块基石。

---

## 2. 用户流程（迹 · Trace 引擎）

```
[搜索框输入用户名] → [点击"发现创造者"]
  → [Loading: 获取 GitHub 公开数据]
  → [Loading: AI 能力评估（可选 LLM，无 Key 时走启发式）]
  → [结果页面: 用户卡片 + 三个 Tab]
  → [Tab: AI 洞察画像 / 统计指纹 / 可打印简历]
  → [打印 / PDF 导出]
```

---

## 3. 功能列表

### P0 - MVP 必须（迹 · Trace 已落地）

- [x] GitHub 用户名搜索
- [x] GitHub REST API 数据获取（用户 + 100 个仓库）
- [x] 用户侧边栏卡片（头像 / 统计 / 社交链接）
- [x] 五维雷达图（底层架构 / 业务工程 / 算法 / 影响力 / 协作）
- [x] 语言环形图
- [x] 技术栈标签云
- [x] 客观统计指标（Forks / License 意识 / Issues / 原创比例）
- [x] AI 洞察文字结论（影响力 / 技术特征 / 人才推荐）
- [x] 可打印简历（简历 Tab）
- [x] PDF 打印导出（`window.print()`）
- [x] GitHub API 限速友好处理
- [x] localStorage 5 分钟缓存
- [x] 启发式分析降级（无 LLM Key 时）

### P1 - 增强版

- [ ] 暗黑模式
- [ ] 历史搜索记录
- [ ] 搜索结果 URL 参数化（`?user=xxx`）
- [ ] 批量分析（粘贴多个用户名）
- [ ] 团队对比视图（多人并排比较）
- [ ] 搜索结果保存 / 分享链接

### P2 - AI 增强

- [ ] 接真实 DeepSeek / OpenAI API 替代启发式
- [ ] 基于 README 的深度内容分析
- [ ] AI 生成项目描述（无描述的仓库）
- [ ] 公司 / 组织维度分析
- [ ] **寻 · Seek 雏形**：将画像向量化并与岗位库做匹配（见 ROADMAP v2.0）

---

## 4. 统计指标说明

| 指标 | 计算方式 | 含义 |
|------|---------|------|
| Total Stars | 所有原创仓库 stars 之和 | 社区认可度 |
| Followers | GitHub 直接数据 | 社交影响力 |
| Acct Age | `(now - created_at) / 365.25` | 账号年龄 |
| 总计被 Fork | 所有原创仓库 forks 之和 | 代码传播度 |
| 开源协议意识 | 有 License 的仓库 / 原创仓库总数 | 工程规范度 |
| 原创项目比重 | 原创仓库 / 总仓库数 | 独立开发能力 |
| 未解决 Issue | 所有仓库 open_issues 之和 | 维护压力 |

---

## 5. 五维雷达图定义（迹 · Trace 能力维度）

| 维度 | 权重因素 | 高分语言 |
|------|---------|---------|
| 底层架构能力 | C/C++/Rust/Go/Assembly 仓库占比 | Rust, C, Zig, Go |
| 业务工程化 | JS/TS/Java/Web 仓库占比 | TypeScript, Java |
| 算法与数据科学 | Python/Jupyter/R 仓库占比 | Python, Julia |
| 社区影响力 | Followers + Stars 综合得分 | 不限语言 |
| 团队协作规范 | License 覆盖率 + Issue 活跃度 | 不限语言 |

---

## 6. 错误处理

| 场景 | 处理 |
|------|------|
| 用户不存在 | 显示红色错误 banner，留在空状态 |
| API 限速 | Banner 提示，保留已缓存数据 |
| 网络错误 | Banner 提示，建议检查网络 |
| LLM API 失败 | 自动降级到启发式分析，不阻塞显示 |
| localStorage 满 | 静默失败，不影响功能 |

---

## 7. 环境变量

```env
# GitHub Token（可选，提升 API 限速 60次/小时 → 5000次/小时）
# 推荐：fine-grained PAT，仅授予 public repo 只读（Contents: Read-only）
# 切勿将真实 Token 提交进仓库；使用 .env.local 并在 .gitignore 中忽略
VITE_GITHUB_TOKEN=ghp_xxxx

# LLM API Key（可选，不填则使用启发式分析）
VITE_GEMINI_API_KEY=xxxx

# LLM 模型（默认: gemini-2.0-flash）
VITE_GEMINI_MODEL=gemini-2.0-flash
```

---

## 8. 验收标准

1. `npm install && npm run dev` 成功启动（端口 3001）
2. 输入任意真实 GitHub 用户名，正确显示数据
3. 雷达图和环形图正确渲染
4. 简历 Tab 可正确打印（`Ctrl+P` 输出 PDF）
5. 无 LLM Key 时，启发式分析生成合理结论
6. API 限速时显示友好提示，不崩溃

---

## 9. 安全与隐私（来自 Vesta 品牌红线）

- 仅分析**公开** GitHub 数据，不碰私有仓库 / 私人邮箱；尊重 GitHub ToS 与速率限制。
- 开发者应可查询自身画像并 opt-out（产品层待实现）。
- Token 采用最小权限、可轮换；禁止将明文 Token 写入仓库或聊天记录。

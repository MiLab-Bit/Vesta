# Vesta｜迹与寻

> **AI-powered human discovery platform.**
> 一个通过数字痕迹发现创造者、通过智能探索连接机会的平台。

**迹** —— 发现创造者。Vesta 读取开发者在 GitHub 上留下的数字足迹（提交、仓库、贡献、协作），用 AI 生成比简历更真实的能力画像。

**寻** —— 寻找机会。理解创造者的能力轨迹与成长路径，帮其发现真正适合的未来。

**▶ 立即体验：[https://vesta.sy-realm.ltd](https://vesta.sy-realm.ltd)**

---

## 使用方式

1. 打开 **[vesta.sy-realm.ltd](https://vesta.sy-realm.ltd)**
2. 输入任意 **GitHub 用户名**
3. 得到一份**五维能力画像**：基于真实数据（Stars、Followers、语言分布）动态计算
4. 查看**代码指纹**：主力语言栈、原创比例、开源协议意识
5. 生成**一页纸简历**：可直接打印或导出 PDF

> 无需注册、无需部署——纯前端单页应用，开箱即用。不配置 API Key 也能跑：自动降级为启发式规则分析。

---

## 品牌与产品能力

本仓库当前落地的是双引擎中的 **迹 · Trace（GitHub 开发者发现）**：

| 能力 | 说明 |
| --- | --- |
| 🧬 **五维能力画像** | 基于真实数据（Stars、Followers、语言分布）动态计算，不靠感觉 |
| 🕵️ **代码指纹提取** | 主力语言栈、原创比例、开源协议意识——从足迹里读出的「作案风格」 |
| 📄 **一页纸简历** | 可直接打印或导出 PDF，比自我介绍多一份证据 |
| ⚡ **零部署** | 纯前端单页应用，无需服务器，开箱即用 |
| 🔄 **智能降级** | 无 API Key 时使用启发式规则，仍能生成分析 |
| 🌙 **响应式设计** | 桌面端和移动端自适应 |

**寻 · Seek（机会匹配）**为规划中的第二引擎。

---

## 技术与特色

| 层 | 选型 |
| --- | --- |
| 前端 | React 19 · Vite 8 · TypeScript 5.9 · Tailwind CSS 4 · React Router 7 |
| 图表 | Chart.js 4 + react-chartjs-2 |
| 数据源 | GitHub REST API v3 |
| AI 分析 | Gemini API（可选）/ 启发式降级 |
| 测试 | Vitest 4 · 黄金测试 |
| 部署 | 静态托管（ECS + Nginx） |

**工程特色**：

- **图表库的够用主义**：画像展示是固定几种图表（贡献热力图/语言占比/成长曲线），40KB 级的 Chart.js 够用，上 ECharts 是过度设计
- **数据全部可溯源**：画像每一维都来自 GitHub 公开数据计算，不编造
- **优雅降级**：AI 不可用时启发式规则顶上，功能不瘫
- **Vite 主题**：深蓝 / 暖金 / 珊瑚红的 Vesta 主题色系

---

## 业务建模：以可观察证据构造开发者能力画像

Vesta 的 Trace 引擎将 GitHub 公开资料映射为 `GitHubUser`、`GitHubRepo`、`ContributionSignals`、`ActivityHeat`、`CodeCapability`、`RadarScores` 和 `AiAnalysisResult`。将“事实指标”与“能力解读”分离：仓库、语言、贡献等是观察值；能力等级、适配岗位与简历叙事是模型或启发式规则产生的推断。

**为什么这样设计：** 画像若只输出一段生成文字，很难指出判断来源；结构化信号既能复用在雷达图与简历中，也能在 LLM 不可用时进入确定性启发式路径。`validateNarrative()` 对模型输出字段做结构校验，`analyzeWithKey()` 失败时以 `degraded: true` 标识降级，避免将启发式输出伪装成模型推理。

**源码入口：** [类型与领域数据](src/types/index.ts) · [启发式分析](src/services/ai/heuristic.ts) · [AI 输出契约](src/services/ai/schema.ts) · [降级入口](src/services/ai/narrative.ts)。

## 工程完成度与验证边界

- **已在仓库中实现：** 前端 TypeScript 类型、GitHub 数据访问、画像指标、AI 与启发式两条分析路径、图表与页面；`src/services/` 包含启发式、Gemini、限额及浏览器服务测试。
- **可复核的工程配置：** Vitest 测试及 [部署工作流](.github/workflows/deploy.yml)。存在自动化测试不等于模型评价或招聘匹配能力获得真实世界验证。
- **产品边界：** Trace 是当前实现；Seek 机会匹配仍是规划。Star、提交数与语言分布是公开活动线索，**不是个人技术水平、学术能力或求职适配性的充分证明**。评估应保留推断性质与误差风险。


---

© Vesta 迹与寻 · MiLab-Bit

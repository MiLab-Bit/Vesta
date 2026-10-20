// ==================== GitHub Data Types ====================

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  twitter_username: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
}

// ==================== Analysis Types ====================

export interface RepoStats {
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  originalRatio: number;   // % of non-fork repos
  licenseRatio: number;    // % of repos with a license
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
}

// 五维统一采用 CHAOSS / SPACE 框架命名，确定性算分与 LLM 推理共用同一套键。
// 注意：influence 表示「影响力 / 触达」（SPACE 的 Performance 结果信号），
// 不计入能力综合分 overall —— 遵循 SPACE：产出结果 ≠ 个人能力。
export interface RadarScores {
  depth: number;           // 代码深度：实质代码产出（commit / 合并 PR / 实质仓库）
  breadth: number;         // 技术广度：语言与生态多样性
  influence: number;       // 影响力 / 触达：Star + 关注者（结果信号，不计入 overall）
  collaboration: number;   // 协作：PR / Issue / 评论 / Review / 组织归属
  sustainability: number;  // 持续度：近期活跃 + 账号稳健
}

export interface AiAnalysisResult {
  radarScores: RadarScores;
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
  // 深度分析扩展（迹 Trace）
  directions: string[];             // 技术方向 / 领域（Top）
  codeCapabilityScore: number;      // 综合代码能力 0-100
  heatScore: number;                // 活跃热度 0-100
  aiCodeCapabilityNote: string;     // 代码能力深度点评
  aiHeatNote: string;               // 活跃热度点评
  aiAcademicNote: string;           // 学术背景点评
  aiStarNote: string;               // Star 评估点评
  aiOrgNote: string;                // 组织归属点评
  aiHealthNote: string;            // 协作 / 组织健康点评（Bus / Elephant Factor）
  degraded?: boolean;
  byok?: boolean;                  // 是否使用用户自带 Key 完成分析（false=未配置 Key 启发式兜底）
}

// ==================== 深度分析类型（迹 Trace） ====================

export interface OrgInfo {
  login: string;
  description: string | null;
  avatar_url: string;
  html_url: string;
}

export interface ActivityHeat {
  lastActiveAt: string | null;       // 最近一次 push 事件时间（ISO）
  commits90d: number;                // 近 90 天 commit 数
  pushes90d: number;                 // 近 90 天 push 事件数
  recentLangBytes: Record<string, number>; // 近期 push 涉及的字节数（按语言）
  recencyDays: number | null;        // 距今天数
  heatScore: number;                 // 0-100
  heatLevel: string;                 // 沉寂 / 低频 / 活跃 / 高频 / 顶级活跃
}

export interface AcademicProfile {
  orcid: string | null;
  scholar: string | null;            // Google Scholar 主页
  semanticScholar: string | null;    // Semantic Scholar 主页
  eduEmail: string | null;
  institution: string | null;        // 推断的学术机构
  isAcademic: boolean;
  links: { label: string; url: string }[];
}

export interface StarAnalysis {
  totalStars: number;
  maxStars: number;
  medianStars: number;
  velocityPerYear: number;           // totalStars / 账号年龄（年）
  topRepoShare: number;              // 头部仓库 Star 占比 0-1
  tier: string;                      // Star 量级定级
}

export interface DomainCluster {
  name: string;                      // 方向 / 领域
  weight: number;                    // 加权命中数
  repos: number;                     // 命中仓库数
}

export interface CodeCapability {
  depth: number;            // 代码深度
  breadth: number;         // 技术广度
  influence: number;       // 影响力 / 触达（不计入 overall）
  collaboration: number;   // 协作
  sustainability: number;  // 持续度
  overall: number;         // 能力综合分（depth+breadth+collaboration+sustainability 均值，不含 influence）
}

// 来自公开事件的真实贡献信号（近 100 条公开事件窗口），用于协作 / 深度维度。
export interface ContributionSignals {
  commits: number;         // PushEvent 提交数
  prsAuthored: number;     // 发起的 PR
  prsMerged: number;       // 被合并的 PR
  issuesAuthored: number;  // 发起的 Issue
  comments: number;        // Issue / PR / Commit 评论
  reviews: number;         // PR Review 事件
  orgMemberships: number;  // 所属公开组织数
  window: string;          // 数据窗口说明
}

// 来自 GitHub GraphQL contributionsCollection 的精确贡献信号（近 1 年滚动窗口）。
// 相比公开事件（90 天 / 100 条），这是全量精确计数，用于把「事件估计」升级为「真实贡献分布」。
export interface GraphContributions {
  totalCommits: number;       // 公开 commit 总数（窗口内，精确）
  totalPRs: number;           // 发起的 PR 数
  totalReviews: number;       // 完成的 PR Review 数
  totalIssues: number;        // 发起的 Issue 数
  restrictedContributions: number; // 不可见的私有 / 归一化贡献（仅供参考，不计入）
  perRepoCommits: { name: string; commits: number; stars: number; isFork: boolean }[];
  from: string;               // 窗口起点
  to: string;                 // 窗口终点
  available: boolean;         // 是否成功取到（需配置 VITE_GITHUB_TOKEN）
}

// 协作 / 组织健康（CHAOSS Bus Factor / Elephant Factor 思路）。
export interface ContributionHealth {
  elephantFactor: number;     // 提交量达 50% 所需的仓库数（越大越分散，越小越集中于少数仓库）
  concentration: number;      // 0-1，提交集中度（Gini 思路，越高越集中）
  busFactor: number;          // 头部仓库贡献者中位数（团队化 => 高，1 = 纯单人维护）
  soloRatio: number;          // 0-1，头部仓库中「仅作者一人」占比
  repoContributors: { name: string; contributors: number; isFork: boolean; stars: number }[];
  concentrated: boolean;      // elephantFactor <= 2 视为高度集中
  note: string;               // 一句话解读
  available: boolean;         // 是否成功计算（需 token）
}

export interface HunterData {
  user: GitHubUser;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  bestRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  // 深度分析扩展
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];         // Top 仓库按字节统计的语言分布
  codeCapability: CodeCapability;
  graph: GraphContributions;         // 精确贡献（GraphQL，近 1 年）
  contributionHealth: ContributionHealth; // 协作 / 组织健康（Bus / Elephant Factor）
  apiStatus: ApiStatus;
}

// ==================== App State Types ====================

export type ApiStatus = 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'rate_limited' | 'not_found';

export type ActiveTab = 'overview' | 'tech' | 'resume';

export interface LoadingProgress {
  stage: 'fetching' | 'extracting' | 'analyzing';
  text: string;
  percent: number;
}

// ==================== Component Props Types ====================

export interface RadarChartProps {
  scores: RadarScores;
}

export interface LanguageChartProps {
  langs: LanguageStat[];
}

export interface UserCardProps {
  user: GitHubUser;
  stats: RepoStats;
  ageYears: number;
}

export interface RepoListProps {
  repos: GitHubRepo[];
  variant: 'overview' | 'resume';
  limit?: number;
}

export interface SkillTagsProps {
  langs: LanguageStat[];
}

export interface LoadingOverlayProps {
  progress: LoadingProgress;
}

// ==================== Service Types ====================

export interface FetchUserResult {
  user: GitHubUser | null;
  status: ApiStatus;
  error?: string;
}

export interface FetchReposResult {
  repos: GitHubRepo[];
  status: ApiStatus;
  error?: string;
}

export interface GeminiAnalysisPayload {
  user: GitHubUser;
  topRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];
  codeCapability: CodeCapability;
  graph: GraphContributions;
  contributionHealth: ContributionHealth;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
}
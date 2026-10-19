import type {
  RadarScores, AiAnalysisResult, GeminiAnalysisPayload, ContributionHealth,
} from '../types';
import { computeAccountAge } from '../utils/formatters';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiResponse {
  radarScores: number[];
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
  directions: string[];
  codeCapabilityScore: number;
  heatScore: number;
  aiCodeCapabilityNote: string;
  aiHeatNote: string;
  aiAcademicNote: string;
  aiStarNote: string;
  aiOrgNote: string;
  aiHealthNote: string;
}

// ⚠️ 浏览器端直调 Gemini: VITE_GEMINI_API_KEY 经 import.meta.env 打进
// 前端 bundle, 且以 ?key= 查询串出现在网络请求里——任何访客在 DevTools
// 可见。纯静态站无服务端代理前的缓解措施(运营侧必做):
//   1. Google AI Studio 对该 key 设置 HTTP referrer 限制(仅 vesta.sy-realm.ltd);
//   2. 设置配额/告警, 泄漏可即时发现;
//   3. 中长期: 迁服务端代理(见 ROADMAP)。
// 不配置 key 时走确定性启发式兜底(buildHeuristicAnalysis), 功能不瘫。
async function geminiFetch(prompt: string, apiKey: string, model: string, maxRetries = 5): Promise<GeminiResponse> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
  let delay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errBody}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned empty text');

      return JSON.parse(text);
    } catch (e) {
      console.warn(`Gemini attempt ${attempt + 1}/${maxRetries} failed:`, e);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw e;
      }
    }
  }
  throw new Error('Gemini analysis failed after all retries');
}

function buildPrompt(d: GeminiAnalysisPayload): string {
  const { user, topRepos, langs, orgs, academic, activity, starAnalysis, domains, langBytes, codeCapability, graph, contributionHealth } = d;

  const repoContext = topRepos
    .map(r => `- [${r.language || '未知'}] ${r.name}: ${r.description || '无描述'} (⭐️${r.stargazers_count})`)
    .join('\n');

  const langContext = langs
    .slice(0, 6)
    .map(l => `${l.name}(${l.count}个项目, 占比${l.percentage}%)`)
    .join(', ');

  const langByteContext = langBytes.length
    ? langBytes.slice(0, 8).map(l => `${l.name}(字节占比${l.percentage}%)`).join(', ')
    : '无';

  const orgContext = orgs.length
    ? orgs.map(o => `${o.login}（${o.description || '无简介'}）`).join('；')
    : '无显著组织归属';

  const academicContext = academic.isAcademic
    ? `学术归属：${academic.institution || '未标注机构'}${academic.orcid ? `；ORCID ${academic.orcid}` : ''}${academic.scholar ? `；Scholar ${academic.scholar}` : ''}${academic.semanticScholar ? `；Semantic Scholar ${academic.semanticScholar}` : ''}${academic.eduEmail ? `；学术邮箱 ${academic.eduEmail}` : ''}`
    : '未检测到明确学术背景（无 ORCID / Scholar / .edu）';

  const activityContext = `最近活跃：${activity.lastActiveAt ? activity.lastActiveAt.slice(0, 10) : '未知'}（${activity.recencyDays ?? '?'} 天前）；近 90 天 commit ${activity.commits90d} 次 / push ${activity.pushes90d} 次；热度评级：${activity.heatLevel}（${activity.heatScore}/100）`;

  const starContext = `Star 总量 ${starAnalysis.totalStars}，头部仓库 ${starAnalysis.maxStars}，中位数 ${starAnalysis.medianStars}，年均增速 ${starAnalysis.velocityPerYear}/年，头部集中度 ${Math.round(starAnalysis.topRepoShare * 100)}%，量级：${starAnalysis.tier}`;

  const domainContext = domains.length
    ? domains.map(dm => `${dm.name}(权重${dm.weight})`).join('，')
    : '无明确方向聚类';

  const capContext = `代码能力五维（CHAOSS / SPACE）：代码深度 ${codeCapability.depth} / 技术广度 ${codeCapability.breadth} / 影响力·触达 ${codeCapability.influence} / 协作 ${codeCapability.collaboration} / 持续度 ${codeCapability.sustainability}；能力综合 ${codeCapability.overall}/100（不含影响力）`;

  const graphContext = graph.available
    ? `精确贡献（GitHub GraphQL 近1年）：commit ${graph.totalCommits} / 发起PR ${graph.totalPRs} / Review ${graph.totalReviews} / Issue ${graph.totalIssues}；逐仓提交分布覆盖 ${graph.perRepoCommits.length} 个仓库。`
    : '精确贡献（需配置 VITE_GITHUB_TOKEN 启用 GraphQL）暂不可用，以下为公开事件估计。';

  const healthContext = contributionHealth.available
    ? `组织健康：Elephant Factor ${contributionHealth.elephantFactor}（提交达50%所需仓库数，越大越分散）；集中度 ${Math.round(contributionHealth.concentration * 100)}%；Bus Factor ${contributionHealth.busFactor}（头部仓库贡献者中位数，越高越团队化）；纯单人仓库占比 ${Math.round(contributionHealth.soloRatio * 100)}%。${contributionHealth.note}`
    : '组织健康指标（Bus / Elephant Factor）需配置 VITE_GITHUB_TOKEN 后启用。';

  return `
你是一个专业的 IT 行业资深猎头兼系统架构专家。请基于以下来自 GitHub 的真实开发者多维度数据，给出客观、深刻、结构化的专业评价。

【基础数据】
- 用户名: ${user.login} / 姓名: ${user.name || '未填'}
- Bio: ${user.bio || '无'}
- 公司: ${user.company || '无'} / 位置: ${user.location || '无'}
- Followers: ${user.followers} / 公开仓库: ${user.public_repos} / 账号年龄: ${computeAccountAge(user.created_at).toFixed(1)} 年

【代码能力量化】
- ${capContext}
- ${graphContext}
- ${healthContext}
- 按字节的语言分布: ${langByteContext}
- 按仓库数的语言分布: ${langContext}

【方向 / 领域聚类】
${domainContext}

【活跃热度】
${activityContext}

【Star 评估】
${starContext}

【组织归属】
${orgContext}

【学术背景】
${academicContext}

【代表性原创项目 Top 20】
${repoContext || '无原创公开项目'}

请严格返回纯 JSON（不要任何 \`\`\`json 标记），格式如下：
{
  "radarScores": [代码深度分, 技术广度分, 影响力·触达分, 协作分, 持续度分],
  "aiInfluenceLevel": "一句话影响力定级",
  "aiInfluenceDesc": "具体分析（50字内）",
  "aiTechLevel": "核心技术栈侧写",
  "aiTechDesc": "推断其代码风格和擅长领域（80字内）",
  "aiRecommendation": "猎头推荐去哪类公司、什么岗位（80字内）",
  "resumeSummary": "简历顶部高管评语（40字内）",
  "directions": ["技术方向1", "技术方向2", "技术方向3"],
  "codeCapabilityScore": 综合代码能力0-100,
  "heatScore": 活跃热度0-100,
  "aiCodeCapabilityNote": "对代码能力深度点评（含架构/工程/算法侧重，120字内）",
  "aiHeatNote": "对活跃度与持续产出点评（100字内）",
  "aiAcademicNote": "对学术背景点评（60字内）",
  "aiStarNote": "对 Star 影响力点评（含增速与集中度，100字内）",
  "aiOrgNote": "对组织归属与协作网络点评（80字内）"
}
  `.trim();
}

function mapRadarScores(scores: number[]): RadarScores {  return {
    depth: scores[0] ?? 50,
    breadth: scores[1] ?? 50,
    influence: scores[2] ?? 50,
    collaboration: scores[3] ?? 50,
    sustainability: scores[4] ?? 50,
  };
}

function contributionHealthNote(h: ContributionHealth): string {
  if (!h.available) return '组织健康指标（Bus / Elephant Factor）需配置 VITE_GITHUB_TOKEN 后启用。';
  return `组织健康：Elephant Factor ${h.elephantFactor}，Bus Factor ${h.busFactor}，纯单人仓库占比 ${Math.round(h.soloRatio * 100)}%。${h.note}`;
}

export async function analyzeWithGemini(
  payload: GeminiAnalysisPayload,
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

  // If no API key, use deterministic heuristic analysis as fallback
  if (!apiKey) {
    console.warn('[Vesta] No VITE_GEMINI_API_KEY found. Using deterministic heuristic analysis.');
    return buildHeuristicAnalysis(payload);
  }
  // 配置了 key = 接受浏览器暴露模型; 见 geminiFetch 上方缓解清单。
  console.warn('[Vesta] VITE_GEMINI_API_KEY is browser-visible. Ensure referrer restriction is set in Google AI Studio.');

  try {
    const prompt = buildPrompt(payload);
    const raw = await geminiFetch(prompt, apiKey, model);

    return {
      radarScores: mapRadarScores(raw.radarScores ?? [50, 50, 50, 50, 50]),
      aiInfluenceLevel: raw.aiInfluenceLevel ?? '社区贡献者',
      aiInfluenceDesc: raw.aiInfluenceDesc ?? '活跃的开源社区成员。',
      aiTechLevel: raw.aiTechLevel ?? '软件开发者',
      aiTechDesc: raw.aiTechDesc ?? '具备扎实的工程能力。',
      aiRecommendation: raw.aiRecommendation ?? '适合技术驱动型公司。',
      resumeSummary: raw.resumeSummary ?? '优秀的开源社区贡献者。',
      directions: Array.isArray(raw.directions) ? raw.directions.slice(0, 5) : [],
      codeCapabilityScore: raw.codeCapabilityScore ?? payload.codeCapability.overall,
      heatScore: raw.heatScore ?? payload.activity.heatScore,
      aiCodeCapabilityNote: raw.aiCodeCapabilityNote ?? '',
      aiHeatNote: raw.aiHeatNote ?? '',
      aiAcademicNote: raw.aiAcademicNote ?? '',
      aiStarNote: raw.aiStarNote ?? '',
      aiOrgNote: raw.aiOrgNote ?? '',
      aiHealthNote: raw.aiHealthNote ?? contributionHealthNote(payload.contributionHealth),
    };
  } catch (e) {
    const msg = `Gemini 推理失败: ${e instanceof Error ? e.message : String(e)}`;
    console.error(msg);
    onError?.(msg);
    return buildHeuristicAnalysis(payload);
  }
}

function buildHeuristicAnalysis(d: GeminiAnalysisPayload): AiAnalysisResult {
  const { user, topRepos, stats, langs, orgs, academic, activity, starAnalysis, domains, codeCapability, contributionHealth } = d;
  const topLangs = langs.slice(0, 5).map(l => l.name);

  // Influence tier (deterministic)
  let aiInfluenceLevel = 'B级 · 社区活跃贡献者';
  if (user.followers > 5000 || stats.totalStars > 10000) aiInfluenceLevel = 'S级 · 顶级开源架构师';
  else if (user.followers > 500 || stats.totalStars > 1000) aiInfluenceLevel = 'A级 · 资深开源贡献者';
  else if (user.followers < 10 && stats.totalStars < 50) aiInfluenceLevel = 'D级 · 新晋开发者';

  // Tech level (deterministic)
  let aiTechLevel = '全栈工程师';
  if (topLangs.includes('Rust') || topLangs.includes('C') || topLangs.includes('C++')) aiTechLevel = '系统级开发工程师';
  else if (topLangs.includes('Python') && stats.totalStars > 500) aiTechLevel = '算法 / AI 研究者';
  else if (user.followers > 1000 && stats.totalStars > 5000) aiTechLevel = '顶级开源领袖';

  const langStr = topLangs.slice(0, 3).join(' / ') || '多语言';
  const ageYears = computeAccountAge(user.created_at);

  const directions = domains.length
    ? domains.slice(0, 3).map(dm => dm.name)
    : topLangs.slice(0, 3);

  const aiCodeCapabilityNote =
    `五维（CHAOSS/SPACE）：代码深度 ${codeCapability.depth} / 技术广度 ${codeCapability.breadth} / 影响力·触达 ${codeCapability.influence} / 协作 ${codeCapability.collaboration} / 持续度 ${codeCapability.sustainability}。能力综合 ${codeCapability.overall}/100（不含影响力），主力语言 ${langStr}。`;

  const aiHeatNote = activity.recencyDays === null
    ? '近期活跃数据不足，无法评估持续产出。'
    : `最近活跃于 ${activity.lastActiveAt?.slice(0, 10)}（${activity.recencyDays} 天前），近 90 天 ${activity.commits90d} 次 commit，热度评级 ${activity.heatLevel}。`;

  const aiAcademicNote = academic.isAcademic
    ? `检测到学术背景${academic.institution ? `（${academic.institution}）` : ''}${academic.orcid || academic.scholar || academic.semanticScholar ? '，含 ORCID / Scholar 等学术 ID' : ''}。`
    : '未检测到明确学术归属（无 ORCID / Scholar / .edu 邮箱）。';

  const aiStarNote =
    `Star 总量 ${starAnalysis.totalStars}（${starAnalysis.tier}），年均增速约 ${starAnalysis.velocityPerYear}/年，头部仓库占比 ${Math.round(starAnalysis.topRepoShare * 100)}%。`;

  const aiOrgNote = orgs.length
    ? `归属 ${orgs.length} 个组织：${orgs.slice(0, 3).map(o => o.login).join('、')}。`
    : '未检测到显著组织归属，倾向独立 / 个人开发者。';

  const aiHealthNote = contributionHealthNote(contributionHealth);

  return {
    radarScores: {
      depth: codeCapability.depth,
      breadth: codeCapability.breadth,
      influence: codeCapability.influence,
      collaboration: codeCapability.collaboration,
      sustainability: codeCapability.sustainability,
    },
    aiInfluenceLevel,
    aiInfluenceDesc: `累计获得 ${stats.totalStars} Stars，${user.followers} 关注者，账号年龄 ${ageYears.toFixed(1)} 年。`,
    aiTechLevel,
    aiTechDesc: `主力语言：${langStr}。代码风格偏工程化，擅长 ${topRepos[0]?.language || '多语言'} 相关领域。`,
    aiRecommendation: `适合技术驱动型公司，担任核心开发或技术 Lead 角色。`,
    resumeSummary: `${aiInfluenceLevel}，以 ${langStr} 为核心技术的开源贡献者。`,
    directions,
    codeCapabilityScore: codeCapability.overall,
    heatScore: activity.heatScore,
    aiCodeCapabilityNote,
    aiHeatNote,
    aiAcademicNote,
    aiStarNote,
    aiOrgNote,
    aiHealthNote,
  };
}

import type { GeminiAnalysisPayload } from '../../types';
import { computeAccountAge } from '../../utils/formatters';
import { PROMPT_JSON_SCHEMA } from './schema';

export function buildPrompt(d: GeminiAnalysisPayload): string {
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

注意：雷达五维分数、综合能力分、热度分、技术方向列表已由上游确定性模型算出，无需你估算，只需基于以上真实数据撰写下列叙述性字段。

请严格返回纯 JSON（不要任何 \`\`\`json 标记），格式如下：
${PROMPT_JSON_SCHEMA}
  `.trim();
}

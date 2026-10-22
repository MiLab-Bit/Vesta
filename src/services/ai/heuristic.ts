import type { GeminiAnalysisPayload, AiAnalysisResult } from '../../types';
import { computeAccountAge } from '../../utils/formatters';
import { classifyInfluence, classifyTech } from './rules';
import { toRadar, toDirections, contributionHealthNote } from './schema';

export function buildHeuristicAnalysis(d: GeminiAnalysisPayload): AiAnalysisResult {
  const { user, topRepos, stats, langs, orgs, academic, activity, starAnalysis, domains, codeCapability, contributionHealth } = d;
  const topLangs = langs.slice(0, 5).map(l => l.name);

  const aiInfluenceLevel = classifyInfluence(user, stats);
  const aiTechLevel = classifyTech(topLangs, user, stats);

  const langStr = topLangs.slice(0, 3).join(' / ') || '多语言';
  const ageYears = computeAccountAge(user.created_at);

  const directions = toDirections(domains, langs);

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
    radarScores: toRadar(codeCapability),
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

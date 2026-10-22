import type {
  CodeCapability, ContributionHealth, DomainCluster, LanguageStat, RadarScores,
} from '../../types';

export interface NarrativeResult {
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
  aiCodeCapabilityNote: string;
  aiHeatNote: string;
  aiAcademicNote: string;
  aiStarNote: string;
  aiOrgNote: string;
}

const NARRATIVE_FIELDS: (keyof NarrativeResult)[] = [
  'aiInfluenceLevel', 'aiInfluenceDesc', 'aiTechLevel', 'aiTechDesc',
  'aiRecommendation', 'resumeSummary', 'aiCodeCapabilityNote', 'aiHeatNote',
  'aiAcademicNote', 'aiStarNote', 'aiOrgNote',
];

const MAX_LEN: Record<keyof NarrativeResult, number> = {
  aiInfluenceLevel: 40,
  aiInfluenceDesc: 60,
  aiTechLevel: 40,
  aiTechDesc: 100,
  aiRecommendation: 100,
  resumeSummary: 60,
  aiCodeCapabilityNote: 140,
  aiHeatNote: 120,
  aiAcademicNote: 80,
  aiStarNote: 120,
  aiOrgNote: 100,
};

export function validateNarrative(raw: unknown): NarrativeResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const out = {} as NarrativeResult;
  for (const f of NARRATIVE_FIELDS) {
    const v = o[f];
    if (typeof v !== 'string') return null;
    out[f] = v.slice(0, MAX_LEN[f]);
  }
  return out;
}

export function toRadar(c: CodeCapability): RadarScores {
  return {
    depth: c.depth,
    breadth: c.breadth,
    influence: c.influence,
    collaboration: c.collaboration,
    sustainability: c.sustainability,
  };
}

export function toDirections(domains: DomainCluster[], langs: LanguageStat[]): string[] {
  if (domains.length) return domains.slice(0, 3).map(d => d.name);
  return langs.slice(0, 3).map(l => l.name);
}

export function contributionHealthNote(h: ContributionHealth): string {
  if (!h.available) return '组织健康指标（Bus / Elephant Factor）需配置 VITE_GITHUB_TOKEN 后启用。';
  return `组织健康：Elephant Factor ${h.elephantFactor}，Bus Factor ${h.busFactor}，纯单人仓库占比 ${Math.round(h.soloRatio * 100)}%。${h.note}`;
}

export const PROMPT_JSON_SCHEMA = `{
  "aiInfluenceLevel": "一句话影响力定级",
  "aiInfluenceDesc": "具体分析（50字内）",
  "aiTechLevel": "核心技术栈侧写",
  "aiTechDesc": "推断其代码风格和擅长领域（80字内）",
  "aiRecommendation": "猎头推荐去哪类公司、什么岗位（80字内）",
  "resumeSummary": "简历顶部高管评语（40字内）",
  "aiCodeCapabilityNote": "对代码能力深度点评（含架构/工程/算法侧重，120字内）",
  "aiHeatNote": "对活跃度与持续产出点评（100字内）",
  "aiAcademicNote": "对学术背景点评（60字内）",
  "aiStarNote": "对 Star 影响力点评（含增速与集中度，100字内）",
  "aiOrgNote": "对组织归属与协作网络点评（80字内）"
}`;

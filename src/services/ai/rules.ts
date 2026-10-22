import type { GitHubUser, RepoStats } from '../../types';

export interface InfluenceRule {
  when: (user: GitHubUser, stats: RepoStats) => boolean;
  label: string;
}

export interface TechRule {
  when: (topLangs: string[], user: GitHubUser, stats: RepoStats) => boolean;
  label: string;
}

export const INFLUENCE_RULES: InfluenceRule[] = [
  { when: (u, s) => u.followers > 5000 || s.totalStars > 10000, label: 'S级 · 顶级开源架构师' },
  { when: (u, s) => u.followers > 500 || s.totalStars > 1000, label: 'A级 · 资深开源贡献者' },
  { when: (u, s) => u.followers < 10 && s.totalStars < 50, label: 'D级 · 新晋开发者' },
  { when: () => true, label: 'B级 · 社区活跃贡献者' },
];

export const TECH_RULES: TechRule[] = [
  { when: (l) => l.includes('Rust') || l.includes('C') || l.includes('C++'), label: '系统级开发工程师' },
  { when: (l, _u, s) => l.includes('Python') && s.totalStars > 500, label: '算法 / AI 研究者' },
  { when: (_l, u, s) => u.followers > 1000 && s.totalStars > 5000, label: '顶级开源领袖' },
  { when: () => true, label: '全栈工程师' },
];

export const pick = <T,>(rows: [() => boolean, T][]): T => rows.find(([m]) => m())![1];

export function classifyInfluence(user: GitHubUser, stats: RepoStats): string {
  return pick(INFLUENCE_RULES.map(r => [() => r.when(user, stats), r.label] as [() => boolean, string]));
}

export function classifyTech(topLangs: string[], user: GitHubUser, stats: RepoStats): string {
  return pick(TECH_RULES.map(r => [() => r.when(topLangs, user, stats), r.label] as [() => boolean, string]));
}

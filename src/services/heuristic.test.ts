import { describe, it, expect } from 'vitest';
import { buildHeuristicAnalysis } from './ai';
import type { GeminiAnalysisPayload } from '../types';

function base(over: Partial<GeminiAnalysisPayload> = {}): GeminiAnalysisPayload {
  return {
    user: { login: 'a', name: 'A', avatar_url: '', bio: null, company: null, blog: '', location: null, email: null, public_repos: 1, followers: 10, following: 0, html_url: '', created_at: '2015-01-01T00:00:00Z', twitter_username: null, hireable: null },
    topRepos: [{ name: 'r', description: null, html_url: '', stargazers_count: 1, forks_count: 0, open_issues_count: 0, language: 'TypeScript', fork: false, pushed_at: '', topics: [], license: null }],
    stats: { totalStars: 100, totalForks: 0, totalIssues: 0, originalRatio: 1, licenseRatio: 1 },
    langs: [{ name: 'TypeScript', count: 1, percentage: 100 }],
    orgs: [],
    academic: { orcid: null, scholar: null, semanticScholar: null, eduEmail: null, institution: null, isAcademic: false, links: [] },
    activity: { lastActiveAt: '2026-01-01T00:00:00Z', commits90d: 10, pushes90d: 5, recentLangBytes: {}, recencyDays: 10, heatScore: 50, heatLevel: '活跃' },
    starAnalysis: { totalStars: 100, maxStars: 100, medianStars: 100, velocityPerYear: 10, topRepoShare: 1, tier: 'C' },
    domains: [],
    langBytes: [],
    codeCapability: { depth: 60, breadth: 50, influence: 40, collaboration: 55, sustainability: 70, overall: 58 },
    graph: { totalCommits: 0, totalPRs: 0, totalReviews: 0, totalIssues: 0, restrictedContributions: 0, perRepoCommits: [], from: '', to: '', available: false },
    contributionHealth: { elephantFactor: 1, concentration: 1, busFactor: 1, soloRatio: 1, repoContributors: [], concentrated: true, note: '', available: false },
    ...over,
  } as GeminiAnalysisPayload;
}

describe('buildHeuristicAnalysis golden', () => {
  it('deterministic for same input', () => {
    const a = buildHeuristicAnalysis(base());
    const b = buildHeuristicAnalysis(base());
    expect(a).toEqual(b);
  });

  it('S-tier for top open-source architect', () => {
    const r = buildHeuristicAnalysis(base({ user: { ...base().user, followers: 9000, login: 'x', name: 'X', avatar_url: '', bio: null, company: null, blog: '', location: null, email: null, public_repos: 1, following: 0, html_url: '', created_at: '2010-01-01T00:00:00Z', twitter_username: null, hireable: null }, stats: { ...base().stats, totalStars: 20000 } }));
    expect(r.aiInfluenceLevel).toContain('S级');
  });

  it('D-tier for new developer', () => {
    const r = buildHeuristicAnalysis(base({ user: { ...base().user, followers: 2, login: 'n', name: 'N', avatar_url: '', bio: null, company: null, blog: '', location: null, email: null, public_repos: 1, following: 0, html_url: '', created_at: '2025-01-01T00:00:00Z', twitter_username: null, hireable: null }, stats: { ...base().stats, totalStars: 5 } }));
    expect(r.aiInfluenceLevel).toContain('D级');
  });

  it('radar scores copied from codeCapability', () => {
    const r = buildHeuristicAnalysis(base());
    expect(r.radarScores).toEqual({ depth: 60, breadth: 50, influence: 40, collaboration: 55, sustainability: 70 });
  });

  it('system-level tech for Rust/C/C++', () => {
    const r = buildHeuristicAnalysis(base({ langs: [{ name: 'Rust', count: 3, percentage: 80 }, { name: 'TypeScript', count: 1, percentage: 20 }] }));
    expect(r.aiTechLevel).toBe('系统级开发工程师');
  });
});

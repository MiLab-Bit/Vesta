import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeWithKey, buildHeuristicAnalysis } from './gemini';
import type { GeminiAnalysisPayload } from '../types';

function payload(): GeminiAnalysisPayload {
  return {
    user: { login: 'a', name: 'A', avatar_url: '', bio: null, company: null, blog: '', location: null, email: null, public_repos: 1, followers: 10, following: 0, html_url: '', created_at: '2015-01-01T00:00:00Z', twitter_username: null, hireable: null },
    topRepos: [{ name: 'r', description: null, html_url: '', stargazers_count: 1, forks_count: 0, open_issues_count: 0, language: 'TS', fork: false, pushed_at: '', topics: [], license: null }],
    stats: { totalStars: 100, totalForks: 0, totalIssues: 0, originalRatio: 1, licenseRatio: 1 },
    langs: [{ name: 'TS', count: 1, percentage: 100 }],
    orgs: [],
    academic: { orcid: null, scholar: null, semanticScholar: null, eduEmail: null, institution: null, isAcademic: false, links: [] },
    activity: { lastActiveAt: '2026-01-01T00:00:00Z', commits90d: 10, pushes90d: 5, recentLangBytes: {}, recencyDays: 10, heatScore: 50, heatLevel: '活跃' },
    starAnalysis: { totalStars: 100, maxStars: 100, medianStars: 100, velocityPerYear: 10, topRepoShare: 1, tier: 'C' },
    domains: [],
    langBytes: [],
    codeCapability: { depth: 60, breadth: 50, influence: 40, collaboration: 55, sustainability: 70, overall: 58 },
    graph: { totalCommits: 0, totalPRs: 0, totalReviews: 0, totalIssues: 0, restrictedContributions: 0, perRepoCommits: [], from: '', to: '', available: false },
    contributionHealth: { elephantFactor: 1, concentration: 1, busFactor: 1, soloRatio: 1, repoContributors: [], concentrated: true, note: '', available: false },
  };
}

function geminiText(): string {
  return JSON.stringify({
    radarScores: [1, 2, 3, 4, 5],
    aiInfluenceLevel: 'X',
    aiInfluenceDesc: 'd',
    aiTechLevel: 'T',
    aiTechDesc: 't',
    aiRecommendation: 'r',
    resumeSummary: 's',
    directions: ['a'],
    codeCapabilityScore: 77,
    heatScore: 88,
    aiCodeCapabilityNote: 'c',
    aiHeatNote: 'h',
    aiAcademicNote: 'ac',
    aiStarNote: 'st',
    aiOrgNote: 'o',
    aiHealthNote: 'he',
  });
}

beforeEach(() => { vi.restoreAllMocks(); });

describe('analyzeWithKey', () => {
  it('maps gemini response to AiAnalysisResult', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: geminiText() }] } }] }),
    }) as any;
    const r = await analyzeWithKey(payload(), 'key');
    expect(r.radarScores.depth).toBe(1);
    expect(r.aiInfluenceLevel).toBe('X');
    expect(r.codeCapabilityScore).toBe(77);
  });

  it('falls back to heuristic on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('net'));
    const r = await analyzeWithKey(payload(), 'key');
    expect(r.aiInfluenceLevel).toContain('级');
    expect(r.codeCapabilityScore).toBe(58);
  }, 20000);
});

describe('buildHeuristicAnalysis exported', () => {
  it('returns object', () => {
    const r = buildHeuristicAnalysis(payload());
    expect(r.radarScores.influence).toBe(40);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyze } from './browser';
import { setGeminiKey, clearGeminiKey, getGeminiKey } from './byok';
import { consume, remaining, QUOTA_LIMIT } from './quota';
import type { GeminiAnalysisPayload } from '../types';

function memStore(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => m.delete(k),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
  } as Storage;
}

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
    aiInfluenceLevel: 'X', aiInfluenceDesc: 'd', aiTechLevel: 'T', aiTechDesc: 't',
    aiRecommendation: 'r', resumeSummary: 's', directions: ['a'],
    codeCapabilityScore: 77, heatScore: 88,
    aiCodeCapabilityNote: 'c', aiHeatNote: 'h', aiAcademicNote: 'ac', aiStarNote: 'st', aiOrgNote: 'o', aiHealthNote: 'he',
  });
}

describe('analyze (browser BYOK)', () => {
  let store: Storage;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = memStore();
    fetchMock = vi.fn();
    Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true });
    clearGeminiKey(store);
    vi.restoreAllMocks();
    (globalThis as any).fetch = fetchMock;
  });

  it('无 Key -> 启发式兜底（degraded, byok=false），不调 Gemini', async () => {
    const r = await analyze(payload());
    expect(r.degraded).toBe(true);
    expect(r.byok).toBe(false);
    expect(r.aiInfluenceLevel).toContain('级');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('有 Key 且配额充足 -> 调 Gemini（byok=true）', async () => {
    setGeminiKey('user-key', store);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: geminiText() }] } }] }),
    } as any);
    const r = await analyze(payload());
    expect(r.degraded).toBeFalsy();
    expect(r.byok).toBe(true);
    expect(r.codeCapabilityScore).toBe(77);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('user-key');
  });

  it('配额耗尽 -> 启发式兜底（degraded, byok=true），不调 Gemini', async () => {
    setGeminiKey('user-key', store);
    for (let i = 0; i < QUOTA_LIMIT; i++) consume(store);
    expect(remaining(store)).toBe(0);
    const r = await analyze(payload());
    expect(r.degraded).toBe(true);
    expect(r.byok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Gemini 调用失败 -> 启发式兜底（degraded, byok=true）', async () => {
    setGeminiKey('user-key', store);
    fetchMock.mockRejectedValue(new Error('net'));
    const r = await analyze(payload());
    expect(r.degraded).toBe(true);
    expect(r.byok).toBe(true);
    expect(r.codeCapabilityScore).toBe(58);
  }, 20000);

  it('getGeminiKey 读取 localStorage', () => {
    setGeminiKey('abc', store);
    expect(getGeminiKey(store)).toBe('abc');
  });
});

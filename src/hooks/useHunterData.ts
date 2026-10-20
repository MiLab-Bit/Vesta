import { useState, useCallback } from 'react';
import type {
  GitHubUser, GitHubRepo, RepoStats, LanguageStat, AiAnalysisResult,
  OrgInfo, ActivityHeat, AcademicProfile, StarAnalysis, DomainCluster, CodeCapability, ContributionSignals,
  GraphContributions, ContributionHealth,
} from '../types';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  computeRepoStats,
  computeLanguageStats,
  computeTopRepos,
  computeBestRepos,
  fetchUserEvents,
  fetchUserOrgs,
  fetchUserStarred,
  fetchTopRepoLanguages,
  computeActivityHeat,
  detectAcademicProfile,
  computeStarAnalysis,
  computeDomainClusters,
  computeCodeCapability,
  computeContributionSignals,
  fetchGraphContributions,
  fetchTopRepoContributorCounts,
  computeContributionHealth,
} from '../services/github';
import { analyze } from '../services/browser';
import { computeAccountAge } from '../utils/formatters';

interface UseHunterDataResult {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  bestRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];
  codeCapability: CodeCapability;
  signals: ContributionSignals;
  graph: GraphContributions;
  contributionHealth: ContributionHealth;
  status: 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'rate_limited' | 'not_found';
  errorMessage: string | null;
}

const EMPTY_ACADEMIC: AcademicProfile = {
  orcid: null, scholar: null, semanticScholar: null, eduEmail: null, institution: null, isAcademic: false, links: [],
};
const EMPTY_ACTIVITY: ActivityHeat = {
  lastActiveAt: null, commits90d: 0, pushes90d: 0, recentLangBytes: {}, recencyDays: null, heatScore: 0, heatLevel: '沉寂',
};
const EMPTY_STAR: StarAnalysis = {
  totalStars: 0, maxStars: 0, medianStars: 0, velocityPerYear: 0, topRepoShare: 0, tier: '未积累 Star',
};
const EMPTY_CAP: CodeCapability = {
  depth: 0, breadth: 0, influence: 0, collaboration: 0, sustainability: 0, overall: 0,
};
const EMPTY_SIGNALS: ContributionSignals = {
  commits: 0, prsAuthored: 0, prsMerged: 0, issuesAuthored: 0, comments: 0, reviews: 0, orgMemberships: 0, window: '近 100 条公开事件',
};
const EMPTY_GRAPH: GraphContributions = {
  totalCommits: 0, totalPRs: 0, totalReviews: 0, totalIssues: 0, restrictedContributions: 0,
  perRepoCommits: [], from: '', to: '', available: false,
};
const EMPTY_HEALTH: ContributionHealth = {
  elephantFactor: 0, concentration: 0, busFactor: 0, soloRatio: 0, repoContributors: [],
  concentrated: false, note: '需配置 VITE_GITHUB_TOKEN 启用精确贡献分析', available: false,
};

export function useHunterData() {
  const [state, setState] = useState<UseHunterDataResult>({
    user: null, repos: [], topRepos: [], bestRepos: [],
    stats: { totalStars: 0, totalForks: 0, totalIssues: 0, originalRatio: 0, licenseRatio: 0 },
    langs: [], aiResult: null,
    orgs: [], academic: EMPTY_ACADEMIC, activity: EMPTY_ACTIVITY, starAnalysis: EMPTY_STAR,
    domains: [], langBytes: [], codeCapability: EMPTY_CAP, signals: EMPTY_SIGNALS,
    graph: EMPTY_GRAPH, contributionHealth: EMPTY_HEALTH,
    status: 'idle', errorMessage: null,
  });

  const search = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, status: 'loading', errorMessage: null, aiResult: null }));

    const [userResult, reposResult, eventsResult, orgsResult, starredResult] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
      fetchUserEvents(username),
      fetchUserOrgs(username),
      fetchUserStarred(username),
    ]);

    if (userResult.status === 'not_found') {
      setState(prev => ({ ...prev, status: 'not_found', errorMessage: userResult.error || 'User not found' }));
      return;
    }

    if (userResult.status === 'error' || userResult.status === 'rate_limited') {
      setState(prev => ({
        ...prev,
        status: userResult.status,
        errorMessage: userResult.error || 'Failed to fetch data',
      }));
      return;
    }

    const user = userResult.user!;
    const repos = reposResult.repos;
    const ownRepos = repos.filter(r => !r.fork);
    const stats = computeRepoStats(repos);
    const langs = computeLanguageStats(ownRepos);
    const topRepos = computeTopRepos(ownRepos, 20);
    const bestRepos = computeBestRepos(ownRepos, 4);
    const ageYears = computeAccountAge(user.created_at);

    // 深度分析信号
    const events = eventsResult;
    const orgs = orgsResult;
    const starred = starredResult;
    const activity = computeActivityHeat(events);
    const academic = detectAcademicProfile(user, orgs);
    const starAnalysis = computeStarAnalysis(repos, ageYears);
    const domains = computeDomainClusters(repos, starred);

    // 逐仓字节级语言（最多 8 个仓库的额外请求，带缓存与降级）
    const langBytes = await fetchTopRepoLanguages(username, repos);
    // 用近期主力语言字节分布补全活跃热度
    const recentLangBytes: Record<string, number> = {};
    langBytes.forEach(l => { recentLangBytes[l.name] = l.count; });
    activity.recentLangBytes = recentLangBytes;

    // 真实贡献信号（来自公开事件，作为 GraphQL 缺失时的回退）
    const signals = computeContributionSignals(events, orgs);

    // 精确贡献（GraphQL，需 token）+ 头部仓库贡献者数（Bus Factor）
    const [graph, repoContributors] = await Promise.all([
      fetchGraphContributions(username),
      fetchTopRepoContributorCounts(ownRepos, username),
    ]);
    const contributionHealth = computeContributionHealth(graph, repoContributors);

    const codeCapability = computeCodeCapability(
      repos, langBytes, activity, stats, user, ageYears, signals, graph, contributionHealth
    );

    setState(prev => ({
      ...prev,
      user, repos, topRepos, bestRepos, stats, langs,
      orgs, academic, activity, starAnalysis, domains, langBytes, codeCapability, signals,
      graph, contributionHealth,
      status: 'analyzing',
    }));

    // 组装 LLM / 启发式输入
    const aiResult = await analyze({
      user, topRepos, stats, langs,
      orgs, academic, activity, starAnalysis, domains, langBytes, codeCapability,
      graph, contributionHealth,
    });

    setState(prev => ({ ...prev, aiResult, status: 'success' }));
  }, []);

  const reset = useCallback(() => {
    setState({
      user: null, repos: [], topRepos: [], bestRepos: [],
      stats: { totalStars: 0, totalForks: 0, totalIssues: 0, originalRatio: 0, licenseRatio: 0 },
      langs: [], aiResult: null,
      orgs: [], academic: EMPTY_ACADEMIC, activity: EMPTY_ACTIVITY, starAnalysis: EMPTY_STAR,
      domains: [], langBytes: [], codeCapability: EMPTY_CAP, signals: EMPTY_SIGNALS,
      graph: EMPTY_GRAPH, contributionHealth: EMPTY_HEALTH,
      status: 'idle', errorMessage: null,
    });
  }, []);

  return { ...state, search, reset };
}

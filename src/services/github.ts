import type {
  GitHubUser, GitHubRepo, RepoStats, LanguageStat, FetchUserResult, FetchReposResult,
  OrgInfo, ActivityHeat, AcademicProfile, StarAnalysis, DomainCluster, CodeCapability, ContributionSignals,
  GraphContributions, ContributionHealth,
} from '../types';

const BASE_URL = 'https://api.github.com';
const CACHE_PREFIX = 'hh_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ==================== Cache ====================

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage unavailable
  }
}

// ==================== Core Fetch ====================

async function githubFetch<T>(path: string, cacheKey: string): Promise<{ data: T | null; status: 'success' | 'error' | 'rate_limited' | 'not_found' }> {
  const cached = getCache<T>(cacheKey);
  if (cached) return { data: cached, status: 'success' };

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHunter-v1',
  };

  // Allow user-provided token for higher rate limits
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE_URL}${path}`, { headers });

    if (response.status === 404) return { data: null, status: 'not_found' };
    if (response.status === 403) return { data: null, status: 'rate_limited' };
    if (!response.ok) return { data: null, status: 'error' };

    const data = await response.json();
    setCache(cacheKey, data);
    return { data, status: 'success' };
  } catch {
    return { data: null, status: 'error' };
  }
}

// ==================== Public API ====================

export async function fetchGitHubUser(username: string): Promise<FetchUserResult> {
  const result = await githubFetch<GitHubUser>(`/users/${username}`, `user_${username}`);

  if (result.status === 'not_found') {
    return { user: null, status: 'not_found', error: `User "${username}" not found on GitHub` };
  }

  if (result.status === 'error' || result.status === 'rate_limited') {
    return {
      user: null,
      status: result.status === 'rate_limited' ? 'rate_limited' : 'error',
      error: result.status === 'rate_limited'
        ? 'GitHub API rate limit reached (60 req/hr). Add VITE_GITHUB_TOKEN to raise it.'
        : 'Failed to fetch GitHub user data.',
    };
  }

  return { user: result.data!, status: 'success' };
}

export async function fetchGitHubRepos(username: string): Promise<FetchReposResult> {
  const result = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
    `repos_${username}`
  );

  if (result.status !== 'success') {
    return { repos: [], status: result.status };
  }

  return { repos: result.data || [], status: 'success' };
}

// ==================== Stats Computation ====================

export function computeRepoStats(repos: GitHubRepo[]): RepoStats {
  const ownRepos = repos.filter(r => !r.fork);
  let totalStars = 0, totalForks = 0, totalIssues = 0;
  let licensedCount = 0;

  ownRepos.forEach(repo => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
    totalIssues += repo.open_issues_count;
    if (repo.license) licensedCount++;
  });

  return {
    totalStars,
    totalForks,
    totalIssues,
    originalRatio: repos.length ? Math.round((ownRepos.length / repos.length) * 100) : 0,
    licenseRatio: ownRepos.length ? Math.round((licensedCount / ownRepos.length) * 100) : 0,
  };
}

export function computeLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const langMap: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(langMap).reduce((sum, c) => sum + c, 0);
  return Object.entries(langMap)
    .map(([name, count]) => ({ name, count, percentage: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function computeTopRepos(repos: GitHubRepo[], limit = 20): GitHubRepo[] {
  return repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}

export function computeBestRepos(repos: GitHubRepo[], limit = 4): GitHubRepo[] {
  return computeTopRepos(repos, limit);
}

// ==================== New Endpoints (迹 Trace depth) ====================

interface GitHubEventPayload {
  size?: number;
  commits?: unknown[];
  ref?: string;
  action?: string;
  pull_request?: { merged?: boolean };
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: GitHubEventPayload;
}

interface OrgApi {
  login: string;
  description: string | null;
  avatar_url: string;
  html_url: string;
}

// 用户公开事件（活跃热度）
export async function fetchUserEvents(username: string): Promise<GitHubEvent[]> {
  const result = await githubFetch<GitHubEvent[]>(
    `/users/${username}/events/public?per_page=100`,
    `events_${username}`
  );
  return result.status === 'success' && result.data ? result.data : [];
}

// 用户所属组织
export async function fetchUserOrgs(username: string): Promise<OrgInfo[]> {
  const result = await githubFetch<OrgApi[]>(`/users/${username}/orgs?per_page=100`, `orgs_${username}`);
  if (result.status !== 'success' || !result.data) return [];
  return result.data.map(o => ({
    login: o.login,
    description: o.description,
    avatar_url: o.avatar_url,
    html_url: o.html_url,
  }));
}

// 用户 star 过的仓库（技术品味 / 方向）
export async function fetchUserStarred(username: string): Promise<GitHubRepo[]> {
  const result = await githubFetch<GitHubRepo[]>(
    `/users/${username}/starred?per_page=100&sort=updated`,
    `starred_${username}`
  );
  return result.status === 'success' && result.data ? result.data : [];
}

// 单个仓库的字节级语言分布
async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  const result = await githubFetch<Record<string, number>>(
    `/repos/${owner}/${repo}/languages`,
    `lang_${owner}_${repo}`
  );
  return result.status === 'success' && result.data ? result.data : {};
}

// Top 仓库按字节聚合的语言分布（比 repo 单一 language 字段更深）
export async function fetchTopRepoLanguages(username: string, repos: GitHubRepo[]): Promise<LanguageStat[]> {
  const top = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
  const map: Record<string, number> = {};
  await Promise.all(top.map(async r => {
    const langs = await fetchRepoLanguages(username, r.name);
    for (const [k, v] of Object.entries(langs)) map[k] = (map[k] || 0) + v;
  }));
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(map)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// ==================== GraphQL（精确贡献分布） ====================
// GitHub GraphQL 需要鉴权，统一读 VITE_GITHUB_TOKEN。无 token 时优雅降级（返回 null），
// 上层据此回退到公开事件估计，保证未配置 token 的应用仍可运行。

const GQL_URL = 'https://api.github.com/graphql';

interface GraphQLError { message: string; type?: string; path?: string[] }

async function postGraphQL<T>(query: string, variables: Record<string, unknown>, cacheKey: string): Promise<T | null> {
  const cached = getCache<T>(cacheKey);
  if (cached) return cached;

  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  if (!token) return null;

  try {
    const response = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    // 401 无 token / 403 速率限制 → 降级
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) return null;

    const json = await response.json();
    if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      console.warn('[Vesta] GraphQL errors:', (json.errors as GraphQLError[]).map(e => e.message).join('; '));
      return null;
    }
    setCache(cacheKey, json.data as T);
    return json.data as T;
  } catch {
    return null;
  }
}

interface GraphQLContribResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      restrictedContributionsCount: number;
      commitContributionsByRepository: {
        contributions: { totalCount: number };
        repository: { nameWithOwner: string; stargazers: { totalCount: number }; isFork: boolean };
      }[];
    } | null;
  } | null;
}

// 精确贡献（近 1 年滚动窗口）。窗口上限为 1 年（GitHub 限制）。
export async function fetchGraphContributions(login: string): Promise<GraphContributions> {
  const to = new Date();
  const from = new Date(to.getTime() - 365 * DAY_MS);
  const iso = (d: Date) => d.toISOString().slice(0, 19) + 'Z';

  const query = [
    'query($login:String!,$from:DateTime!,$to:DateTime!){',
    'user(login:$login){',
    'contributionsCollection(from:$from,to:$to){',
    'totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions ',
    'totalIssueContributions restrictedContributionsCount ',
    'commitContributionsByRepository(maxRepositories:100){contributions{totalCount}',
    'repository{nameWithOwner stargazers{totalCount}isFork}',
    '}'.repeat(4),
  ].join('');

  const data = await postGraphQL<GraphQLContribResponse>(
    query,
    { login, from: iso(from), to: iso(to) },
    `gql_${login}`
  );

  if (!data || !data.user || !data.user.contributionsCollection) {
    return {
      totalCommits: 0, totalPRs: 0, totalReviews: 0, totalIssues: 0,
      restrictedContributions: 0, perRepoCommits: [],
      from: iso(from), to: iso(to), available: false,
    };
  }

  const c = data.user.contributionsCollection;
  const perRepoCommits = (c.commitContributionsByRepository || []).map(r => ({
    name: r.repository.nameWithOwner,
    commits: r.contributions.totalCount,
    stars: r.repository.stargazers.totalCount,
    isFork: r.repository.isFork,
  }));

  return {
    totalCommits: c.totalCommitContributions || 0,
    totalPRs: c.totalPullRequestContributions || 0,
    totalReviews: c.totalPullRequestReviewContributions || 0,
    totalIssues: c.totalIssueContributions || 0,
    restrictedContributions: c.restrictedContributionsCount || 0,
    perRepoCommits,
    from: iso(from),
    to: iso(to),
    available: true,
  };
}

// 单个仓库贡献者总数（通过 Link 头 last 页码读取，避免拉全量）。
async function fetchRepoContributorCount(owner: string, repo: string): Promise<number | null> {
  const cacheKey = `contrib_${owner}_${repo}`;
  const cached = getCache<number>(cacheKey);
  if (cached !== null) return cached;

  const url = `${BASE_URL}/repos/${owner}/${repo}/contributors?per_page=1&anon=false`;
  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers });
    if (res.status === 404 || res.status === 403) return null;
    if (!res.ok) return null;

    const link = res.headers.get('Link');
    if (link) {
      const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
      if (m) {
        const total = parseInt(m[1], 10);
        setCache(cacheKey, total);
        return total;
      }
    }
    // 无 Link 头：返回条数（≤1）
    const arr = (await res.json()) as unknown[];
    const total = Array.isArray(arr) ? arr.length : 0;
    setCache(cacheKey, total);
    return total;
  } catch {
    return null;
  }
}

// 头部非 fork 仓库的贡献者数（用于 Bus Factor）。
export async function fetchTopRepoContributorCounts(
  repos: GitHubRepo[],
  ownerLogin: string
): Promise<{ name: string; contributors: number; isFork: boolean; stars: number }[]> {
  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  if (!token) return [];

  const top = repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const results = await Promise.all(
    top.map(async r => {
      const contributors = await fetchRepoContributorCount(ownerLogin, r.name);
      return { name: r.name, contributors: contributors ?? 0, isFork: r.fork, stars: r.stargazers_count };
    })
  );
  return results;
}

// 协作 / 组织健康（CHAOSS Bus Factor / Elephant Factor）。
//  - Elephant Factor：提交量累计达 50% 所需仓库数（越小越集中于少数仓库）。
//  - Concentration：提交分布的 Gini 系数化指标（0 均匀，1 全集中一处）。
//  - Bus Factor：头部仓库贡献者中位数（高=团队维护、抗关键人风险；1=纯单人）。
//  - soloRatio：头部仓库中仅作者一人的占比。
export function computeContributionHealth(
  graph: GraphContributions,
  repoContributors: { name: string; contributors: number; isFork: boolean; stars: number }[]
): ContributionHealth {
  const empty: ContributionHealth = {
    elephantFactor: 0, concentration: 0, busFactor: 0, soloRatio: 0,
    repoContributors: [], concentrated: false, note: '需配置 VITE_GITHUB_TOKEN 启用精确贡献分析', available: false,
  };
  if (!graph.available) return empty;

  // Elephant Factor + Concentration（基于逐仓 commit 分布）
  const dist = graph.perRepoCommits.filter(r => !r.isFork).map(r => r.commits).sort((a, b) => b - a);
  const total = dist.reduce((s, v) => s + v, 0);
  let elephantFactor = 0;
  if (total > 0) {
    let acc = 0;
    for (const v of dist) {
      acc += v;
      elephantFactor++;
      if (acc >= total / 2) break;
    }
  }

  let concentration = 0;
  if (dist.length > 1 && total > 0) {
    const n = dist.length;
    const mean = total / n;
    let sumDiff = 0;
    for (const v of dist) sumDiff += Math.abs(v - mean);
    concentration = sumDiff / (2 * n * mean);
  }

  // Bus Factor（基于头部仓库贡献者数）
  const withData = repoContributors.filter(r => r.contributors > 0);
  let busFactor = 0;
  let soloRatio = 0;
  if (withData.length > 0) {
    const counts = withData.map(r => r.contributors).sort((a, b) => a - b);
    const mid = Math.floor(counts.length / 2);
    busFactor = counts.length % 2 ? counts[mid] : Math.round((counts[mid - 1] + counts[mid]) / 2);
    soloRatio = withData.filter(r => r.contributors <= 1).length / withData.length;
  }

  const concentrated = elephantFactor > 0 && elephantFactor <= 2;
  let note: string;
  if (concentrated) {
    note = `贡献高度集中于 ${elephantFactor} 个仓库${busFactor <= 1 ? '，且头部仓库为单人维护（关键人风险高）' : ''}。`;
  } else if (elephantFactor >= 5) {
    note = `贡献分散在 ${elephantFactor}+ 个仓库，技术涉猎广、协作网络多元。`;
  } else {
    note = `贡献分布在 ${elephantFactor} 个仓库，集中度中等。`;
  }

  return {
    elephantFactor,
    concentration: Math.round(concentration * 100) / 100,
    busFactor,
    soloRatio: Math.round(soloRatio * 100) / 100,
    repoContributors,
    concentrated,
    note,
    available: true,
  };
}

// ==================== New Computations ====================

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeActivityHeat(events: GitHubEvent[]): ActivityHeat {
  const now = Date.now();
  const cutoff = now - 90 * DAY_MS;
  let commits90d = 0;
  let pushes90d = 0;
  let lastActiveAt: string | null = null;

  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    if (!lastActiveAt || e.created_at > lastActiveAt) lastActiveAt = e.created_at;
    if (e.type === 'PushEvent' && t >= cutoff) {
      pushes90d++;
      commits90d += e.payload?.size ?? e.payload?.commits?.length ?? 1;
    }
  }

  const recencyDays = lastActiveAt ? Math.round((now - new Date(lastActiveAt).getTime()) / DAY_MS) : null;
  let heatScore = 0;
  if (recencyDays !== null) {
    const recencyScore = recencyDays <= 7 ? 100 : recencyDays <= 30 ? 82 : recencyDays <= 90 ? 58 : recencyDays <= 365 ? 32 : 12;
    const volumeScore = Math.min(100, commits90d);
    heatScore = Math.round(recencyScore * 0.6 + volumeScore * 0.4);
  }
  const heatLevel = heatScore >= 80 ? '顶级活跃' : heatScore >= 60 ? '高频' : heatScore >= 40 ? '活跃' : heatScore >= 20 ? '低频' : '沉寂';

  return { lastActiveAt, commits90d, pushes90d, recentLangBytes: {}, recencyDays, heatScore, heatLevel };
}

export function detectAcademicProfile(
  user: GitHubUser,
  orgs: OrgInfo[]
): AcademicProfile {
  const textSources = [user.bio, user.company, user.blog, user.email].filter(Boolean).join(' ');
  const text = textSources;

  const orcidMatch = text.match(/(?:orcid\.org\/)?(0000-?\d{4}-?\d{4}-?\d{3}[\dX])/i);
  const orcid = orcidMatch ? `https://orcid.org/${orcidMatch[1]}` : null;

  const scholarMatch = text.match(/scholar\.google\.com\/citations\?user=([A-Za-z0-9_-]+)/i)
    || text.match(/(https?:\/\/[^\s)]*scholar\.google\.com\/citations\?[^\s)]*)/i);
  const scholar = scholarMatch
    ? (scholarMatch[0].startsWith('http') ? scholarMatch[0] : `https://${scholarMatch[0]}`)
    : null;

  const ssMatch = text.match(/semanticscholar\.org\/author\/([^\s)]+)/i)
    || text.match(/authorId=([A-Za-z0-9-]+)/i);
  const semanticScholar = ssMatch ? `https://www.semanticscholar.org/author/${ssMatch[1]}` : null;

  const eduEmail = user.email && /edu(\.|$)/i.test(user.email) ? user.email : null;

  const academicKeywords = ['univ', '学院', '大学', 'institute', 'laboratory', 'lab', 'research', 'school of', 'academ', '系'];
  const institutionSources = [user.company, ...orgs.map(o => `${o.login} ${o.description || ''}`)];
  let institution: string | null = null;
  for (const src of institutionSources) {
    if (!src) continue;
    const lower = src.toLowerCase();
    if (academicKeywords.some(k => lower.includes(k))) {
      institution = src.trim();
      break;
    }
  }

  const isAcademic = Boolean(orcid || scholar || semanticScholar || eduEmail || institution);

  const links: { label: string; url: string }[] = [];
  if (orcid) links.push({ label: 'ORCID', url: orcid });
  if (scholar) links.push({ label: 'Google Scholar', url: scholar });
  if (semanticScholar) links.push({ label: 'Semantic Scholar', url: semanticScholar });

  return { orcid, scholar, semanticScholar, eduEmail, institution, isAcademic, links };
}

export function computeStarAnalysis(repos: GitHubRepo[], accountAgeYears: number): StarAnalysis {
  const own = repos.filter(r => !r.fork);
  const stars = own.map(r => r.stargazers_count);
  const total = stars.reduce((a, b) => a + b, 0);
  const max = stars.length ? Math.max(...stars) : 0;
  const sorted = [...stars].sort((a, b) => a - b);
  const median = sorted.length
    ? sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : 0;
  const velocity = accountAgeYears > 0 ? total / accountAgeYears : total;
  const topRepoShare = total > 0 ? max / total : 0;

  let tier = '未积累 Star';
  if (total >= 10000) tier = 'S 级 · 顶流开源';
  else if (total >= 1000) tier = 'A 级 · 高影响力';
  else if (total >= 100) tier = 'B 级 · 有影响力';
  else if (total >= 10) tier = 'C 级 · 起步积累';
  else if (total > 0) tier = 'D 级 · 新晋';

  return { totalStars: total, maxStars: max, medianStars: median, velocityPerYear: Math.round(velocity), topRepoShare, tier };
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Web / 前端': ['react', 'vue', 'frontend', 'web', 'css', 'html', 'next', 'svelte', 'angular'],
  '后端 / 分布式': ['api', 'server', 'backend', 'microservice', 'distributed', 'grpc', 'node', 'django', 'fastapi', 'spring'],
  'AI / 机器学习': ['machine-learning', 'deep-learning', 'ai', 'nlp', 'llm', 'pytorch', 'tensorflow', 'transformer', 'neural', 'gpt'],
  '数据 / 大数据': ['data', 'spark', 'kafka', 'etl', 'database', 'sql', 'bigdata', 'warehouse'],
  '系统 / 底层': ['compiler', 'kernel', 'operating-system', 'embedded', 'systems', 'os', 'driver'],
  '区块链 / Web3': ['blockchain', 'solidity', 'web3', 'ethereum', 'crypto-token'],
  '移动端': ['android', 'ios', 'flutter', 'react-native', 'mobile'],
  '安全': ['security', 'crypto', 'ctf', 'pentest', 'vulnerability'],
  'DevOps / 云': ['kubernetes', 'docker', 'devops', 'cloud', 'terraform', 'ci', 'infrastructure'],
  '游戏': ['game', 'unity', 'godot', 'opengl', 'game-engine'],
  '测试 / 质量': ['testing', 'test', 'jest', 'pytest', 'e2e'],
};

export function computeDomainClusters(repos: GitHubRepo[], starred: GitHubRepo[] = []): DomainCluster[] {
  const weights: Record<string, { weight: number; repos: number }> = {};

  const process = (repo: GitHubRepo, factor: number) => {
    const tokens = [
      ...(repo.topics || []).map(t => t.toLowerCase()),
      (repo.description || '').toLowerCase(),
      (repo.language || '').toLowerCase(),
    ].join(' ');
    for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
      let hits = 0;
      for (const kw of kws) if (tokens.includes(kw)) hits++;
      if (hits > 0) {
        const cur = weights[domain] || { weight: 0, repos: 0 };
        cur.weight += hits * factor;
        cur.repos += factor; // 计数按仓库数（factor=1 或 0.5）
        weights[domain] = cur;
      }
    }
  };

  repos.filter(r => !r.fork).forEach(r => process(r, 1));
  starred.forEach(r => process(r, 0.5));

  return Object.entries(weights)
    .map(([name, v]) => ({ name, weight: Math.round(v.weight * 10) / 10, repos: Math.round(v.repos) }))
    .filter(d => d.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);
}

// 从公开事件中提取真实贡献信号（CHAOSS Contribution 度量）
export function computeContributionSignals(events: GitHubEvent[], orgs: OrgInfo[]): ContributionSignals {
  let commits = 0;
  let prsAuthored = 0;
  let prsMerged = 0;
  let issuesAuthored = 0;
  let comments = 0;
  let reviews = 0;

  for (const e of events) {
    const p = e.payload;
    switch (e.type) {
      case 'PushEvent':
        commits += p?.size ?? p?.commits?.length ?? 1;
        break;
      case 'PullRequestEvent':
        if (p?.action === 'opened') prsAuthored++;
        else if (p?.action === 'closed' && p.pull_request?.merged) prsMerged++;
        break;
      case 'IssuesEvent':
        if (p?.action === 'opened') issuesAuthored++;
        break;
      case 'IssueCommentEvent':
      case 'CommitCommentEvent':
      case 'PullRequestReviewCommentEvent':
        comments++;
        break;
      case 'PullRequestReviewEvent':
        reviews++;
        break;
    }
  }

  return {
    commits,
    prsAuthored,
    prsMerged,
    issuesAuthored,
    comments,
    reviews,
    orgMemberships: orgs.length,
    window: '近 100 条公开事件',
  };
}

// 代码能力五维（CHAOSS / SPACE 框架）。
// 关键方法学修正：
//  - 废弃「语言占比 ≈ 能力」的刻板代理，改为基于真实贡献信号（commit / PR / 评论 / Review）。
//  - 优先采用 GitHub GraphQL 的精确贡献计数（近 1 年全量），缺失时回退公开事件估计。
//  - Bus Factor（头部仓库团队化程度）并入协作维度。
//  - influence（Star + 关注者）仅作为「触达 / 结果」信号，不计入能力综合分 overall，
//    遵循 SPACE：产出结果 ≠ 个人能力（避免病毒式玩具仓库虚高）。
export function computeCodeCapability(
  repos: GitHubRepo[],
  langBytes: LanguageStat[],
  activity: ActivityHeat,
  stats: RepoStats,
  user: GitHubUser,
  accountAgeYears: number,
  signals: ContributionSignals,
  graph?: GraphContributions,
  contributionHealth?: ContributionHealth
): CodeCapability {
  const own = repos.filter(r => !r.fork);
  const substantial = own.filter(r => r.stargazers_count >= 5 || r.forks_count >= 3).length;
  const distinctLangs = langBytes.length;

  // 精确信号优先：GraphQL 全量计数 > 公开事件估计
  const commits = graph?.available ? graph.totalCommits : signals.commits;
  const prs = graph?.available ? graph.totalPRs : signals.prsAuthored;
  const reviews = graph?.available ? graph.totalReviews : signals.reviews;
  const issues = graph?.available ? graph.totalIssues : signals.issuesAuthored;

  // 代码深度：实质产出 = 精确 commit 量 + 发起 PR + 有影响力自有仓库 + 近期活跃
  const depth = clamp(
    18
    + Math.min(commits / 200, 1) * 42
    + Math.min(prs / 10, 1) * 16
    + Math.min(substantial, 8) * 1.6
    + (activity.heatScore >= 60 ? 8 : 0),
    0, 100
  );

  // 技术广度：语言 / 生态多样性 + 作品组合规模
  const breadth = clamp(
    Math.min(distinctLangs / 10, 1) * 60 + Math.min(own.length / 15, 1) * 40,
    0, 100
  );

  // 影响力 / 触达：Star + 关注者（结果信号，仅展示，不进 overall）
  const influence = clamp(
    Math.log10(stats.totalStars + 1) * 22
    + Math.log10(user.followers + 1) * 18
    + Math.min(stats.totalStars / Math.max(accountAgeYears, 1), 30),
    0, 100
  );

  // 协作 / 沟通（SPACE C + CHAOSS Contribution）：
  //  Review、评论、PR/Issue、组织归属，以及头部仓库的 Bus Factor（团队化）
  const bus = contributionHealth?.available ? contributionHealth.busFactor : 1;
  const collaboration = clamp(
    20
    + Math.min(reviews / 10, 1) * 18
    + Math.min(signals.comments / 25, 1) * 14
    + Math.min((prs + issues) / 12, 1) * 18
    + Math.min(signals.orgMemberships / 3, 1) * 12
    + Math.min(bus / 8, 1) * 18,
    0, 100
  );

  // 持续度（SPACE Activity + CHAOSS Release Frequency 思路）：近期热度 + 账号稳健
  const sustainability = clamp(
    activity.heatScore * 0.62 + Math.min(accountAgeYears / 5, 1) * 38,
    0, 100
  );

  // 能力综合分不含 influence（SPACE：结果 ≠ 能力）
  const overall = Math.round((depth + breadth + collaboration + sustainability) / 4);

  return {
    depth: Math.round(depth),
    breadth: Math.round(breadth),
    influence: Math.round(influence),
    collaboration: Math.round(collaboration),
    sustainability: Math.round(sustainability),
    overall,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
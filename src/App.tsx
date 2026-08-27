import { useState } from 'react';
import type { ActiveTab, LoadingProgress } from './types';
import { useHunterData } from './hooks/useHunterData';
import { isValidGitHubUsername, cn, formatNumber } from './utils/helpers';
import { UserCard } from './components/UserCard';
import { AbilityRadar, LanguageDoughnut, SkillTags, ScoreRing, LanguageBytesBar } from './components/AnalyticsCharts';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ResumeView } from './components/ResumeView';
import { LoadingOverlay } from './components/LoadingOverlay';

function Dim({ label, v }: { label: string; v: number }) {
  const color = v >= 70 ? '#16a34a' : v >= 40 ? '#C9A24B' : '#94a3b8';
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold" style={{ color }}>{v}</span>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState('yyx990803');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const hunter = useHunterData();

  const loadingProgress: LoadingProgress = (() => {
    switch (hunter.status) {
      case 'loading': return { stage: 'fetching', text: '1/3 正在从 GitHub API 拉取公开档案...', percent: 33 };
      case 'analyzing': return { stage: 'extracting', text: '2/3 正在清洗提取核心代码特征...', percent: 66 };
      default: return { stage: 'fetching', text: '初始化中...', percent: 10 };
    }
  })();

  const handleSearch = () => {
    const trimmed = username.trim();
    if (!trimmed || !isValidGitHubUsername(trimmed)) return;
    hunter.search(trimmed);
  };

  const showResult = hunter.status === 'success' || hunter.status === 'analyzing';
  const showError = hunter.errorMessage && hunter.status !== 'idle';

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      {/* Loading overlay */}
      <LoadingOverlay
        visible={hunter.status === 'loading' || hunter.status === 'analyzing'}
        progress={loadingProgress}
      />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <i className="fa-solid fa-fire text-gold-500 text-2xl mr-3" />
              <span className="font-bold text-xl text-neutral-800 tracking-tight">
                Vesta <span className="font-light text-neutral-500">迹与寻</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search GitHub Username..."
                  className="bg-neutral-100 border border-neutral-200 text-sm rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-brand-500 outline-none w-64 transition-all"
                />
                <i className="fa-solid fa-search absolute left-4 top-2.5 text-neutral-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={hunter.status === 'loading' || hunter.status === 'analyzing'}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                {hunter.status === 'loading' || hunter.status === 'analyzing' ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                    分析中
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    发现创造者
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error banner */}
      {showError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700 text-sm flex items-center justify-between">
          <span><i className="fa-solid fa-circle-exclamation mr-2" />{hunter.errorMessage}</span>
          <button onClick={() => hunter.reset()} className="text-red-500 hover:text-red-700 ml-4">✕</button>
        </div>
      )}

      {/* Main content */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
        style={{ display: showResult ? 'grid' : 'none' }}
      >
        {/* Left sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          {hunter.user && (
            <UserCard user={hunter.user} stats={hunter.stats} academic={hunter.academic} orgs={hunter.orgs} />
          )}
        </aside>

        {/* Main panel */}
        <div className="lg:col-span-9 flex flex-col main-panel">
          {/* Tabs */}
          <div className="border-b border-neutral-200 mb-6 no-print">
            <nav className="-mb-px flex space-x-8">
              {(['overview', 'tech', 'resume'] as ActiveTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  {tab === 'overview' && <><i className="fa-solid fa-brain mr-2 text-blue-500" />AI 洞察画像</>}
                  {tab === 'tech' && <><i className="fa-solid fa-chart-bar mr-2 text-brand-500" />统计指纹</>}
                  {tab === 'resume' && <><i className="fa-regular fa-file-pdf mr-2 text-red-500" />大模型总结简历</>}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab: AI 画像 */}
          {activeTab === 'overview' && hunter.aiResult && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">能力五维评测</h3>
                  <div style={{ height: 320 }}>
                    <AbilityRadar scores={hunter.aiResult.radarScores} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">综合评分</h3>
                  <div className="flex-1 flex gap-4 flex-wrap items-center justify-center">
                    <ScoreRing
                      label="能力综合"
                      score={hunter.codeCapability.overall}
                      color="#1B2A4A"
                      sub="不含影响力"
                    />
                    <ScoreRing
                      label="影响力·触达"
                      score={hunter.codeCapability.influence}
                      color="#C9A24B"
                      sub="Star + 关注者"
                    />
                    <ScoreRing
                      label="活跃热度"
                      score={hunter.activity.heatScore}
                      color="#3b82f6"
                      sub={hunter.activity.heatLevel}
                    />
                  </div>
                  <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <Dim label="代码深度" v={hunter.codeCapability.depth} />
                    <Dim label="技术广度" v={hunter.codeCapability.breadth} />
                    <Dim label="协作" v={hunter.codeCapability.collaboration} />
                    <Dim label="持续度" v={hunter.codeCapability.sustainability} />
                  </div>
                </div>
              </div>
              <AnalysisPanel aiResult={hunter.aiResult} />
            </div>
          )}

          {/* Tab: 统计指纹 */}
          {activeTab === 'tech' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">代码量 Top 语言</h3>
                  <LanguageDoughnut langs={hunter.langs} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:col-span-2">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">最近仓库客观指标</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      title="总计被 Fork"
                      value={formatNumber(hunter.stats.totalForks)}
                      description="代码被他人复制并二次开发的量"
                      icon={<i className="fa-solid fa-code-fork text-blue-500" />}
                    />
                    <StatCard
                      title="开源协议意识"
                      value={`${hunter.stats.licenseRatio}%`}
                      description="为自己的原创项目配置 License 的比例"
                      icon={<i className="fa-solid fa-scale-balanced text-green-500" />}
                    />
                    <StatCard
                      title="未解决的 Issue"
                      value={formatNumber(hunter.stats.totalIssues)}
                      description="当前面临的外部待处理任务量"
                      icon={<i className="fa-solid fa-triangle-exclamation text-orange-500" />}
                    />
                    <StatCard
                      title="原创项目比重"
                      value={`${hunter.stats.originalRatio}%`}
                      description="排除纯粹 Fork 他人代码的仓库比例"
                      icon={<i className="fa-solid fa-file-code text-purple-500" />}
                    />
                  </div>
                </div>
              </div>

              {/* Star 深度评估 */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-4">
                  <i className="fa-solid fa-star text-yellow-400 mr-2" />
                  Star 深度评估
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Star 总量"
                    value={formatNumber(hunter.starAnalysis.totalStars)}
                    description="全部原创仓库 Stars 之和"
                    icon={<i className="fa-solid fa-star text-yellow-400" />}
                  />
                  <StatCard
                    title="头部仓库"
                    value={formatNumber(hunter.starAnalysis.maxStars)}
                    description="单个最高 Star 仓库"
                    icon={<i className="fa-solid fa-trophy text-amber-500" />}
                  />
                  <StatCard
                    title="年均增速"
                    value={hunter.starAnalysis.velocityPerYear}
                    description="Star / 账号年龄（年）"
                    icon={<i className="fa-solid fa-chart-line text-green-500" />}
                  />
                  <StatCard
                    title="头部集中度"
                    value={`${Math.round(hunter.starAnalysis.topRepoShare * 100)}%`}
                    description="头部仓库占 Star 总量比例"
                    icon={<i className="fa-solid fa-layer-group text-indigo-500" />}
                  />
                </div>
                <p className="text-sm text-neutral-500 mt-3">
                  {hunter.starAnalysis.tier} · Star 中位数 {hunter.starAnalysis.medianStars}
                </p>
              </div>

              {/* 字节级语言分布 */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-4">
                  <i className="fa-solid fa-code text-brand-500 mr-2" />
                  字节级语言分布（Top 仓库）
                </h3>
                <LanguageBytesBar langs={hunter.langBytes} />
              </div>

              {/* 方向 / 领域聚类 */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-4">
                  <i className="fa-solid fa-compass text-gold-500 mr-2" />
                  方向 / 领域聚类
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hunter.domains.length > 0 ? (
                    hunter.domains.map(d => (
                      <span
                        key={d.name}
                        className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-sm font-medium"
                      >
                        {d.name}
                        <span className="text-xs opacity-70 ml-1">权重 {d.weight}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-400">暂无明确方向聚类</span>
                  )}
                </div>
              </div>

              {/* 学术 + 组织 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">
                    <i className="fa-solid fa-graduation-cap text-gold-600 mr-2" />
                    学术背景
                  </h3>
                  {hunter.academic.isAcademic ? (
                    <div className="space-y-2 text-sm text-neutral-600">
                      {hunter.academic.institution && <p>机构：{hunter.academic.institution}</p>}
                      {hunter.academic.links.map(l => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-brand-600 hover:underline break-all"
                        >
                          {l.label}：{l.url}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">未检测到明确学术背景（ORCID / Scholar / .edu）</p>
                  )}
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-md font-bold text-neutral-800 mb-4">
                    <i className="fa-solid fa-people-group text-indigo-500 mr-2" />
                    组织归属
                  </h3>
                  {hunter.orgs.length > 0 ? (
                    <div className="space-y-2">
                      {hunter.orgs.slice(0, 6).map(o => (
                        <a
                          key={o.login}
                          href={o.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-neutral-700 hover:text-brand-600"
                        >
                          <img src={o.avatar_url} alt="" className="w-6 h-6 rounded" />
                          <span className="font-medium">{o.login}</span>
                          <span className="text-neutral-400 truncate">{o.description}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">未检测到显著组织归属</p>
                  )}
                </div>
              </div>

              {/* 协作健康 / 组织健康（Bus / Elephant Factor） */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-1 flex items-center">
                  <i className="fa-solid fa-sitemap text-indigo-500 mr-2" />
                  协作健康 / 组织健康
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  {hunter.contributionHealth.available
                    ? `基于 GitHub GraphQL 精确贡献（近 1 年）+ 头部仓库贡献者分布`
                    : '当前未鉴权：仅能基于公开事件粗略估计。配置 VITE_GITHUB_TOKEN 解锁精确分析'}
                </p>

                {hunter.contributionHealth.available ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <HealthStat
                        title="Elephant Factor"
                        value={hunter.contributionHealth.elephantFactor}
                        desc="提交达 50% 所需仓库数（越大越分散）"
                      />
                      <HealthStat
                        title="Bus Factor"
                        value={hunter.contributionHealth.busFactor}
                        desc="头部仓库贡献者中位数（越高越团队化）"
                      />
                      <HealthStat
                        title="纯单人仓库"
                        value={`${Math.round(hunter.contributionHealth.soloRatio * 100)}%`}
                        desc="头部仓库仅作者一人占比"
                      />
                      <HealthStat
                        title="集中度"
                        value={`${Math.round(hunter.contributionHealth.concentration * 100)}%`}
                        desc="提交分布 Gini 集中度"
                      />
                    </div>

                    <div className="mb-2 text-xs text-neutral-500">
                      近 1 年精确贡献：commit {hunter.graph.totalCommits} · 发起 PR {hunter.graph.totalPRs} · Review {hunter.graph.totalReviews} · Issue {hunter.graph.totalIssues}
                    </div>

                    {/* 集中度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>提交集中度</span>
                        <span>均匀 ←→ 集中</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${hunter.contributionHealth.concentration * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 逐仓贡献者条 */}
                    <div>
                      <p className="text-xs font-bold text-neutral-500 mb-2">头部仓库贡献者分布</p>
                      <RepoContributorBars items={hunter.contributionHealth.repoContributors} />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-neutral-400 space-y-2">
                    <p>配置 <code className="bg-neutral-100 px-1 rounded">VITE_GITHUB_TOKEN</code> 后将解锁：</p>
                    <ul className="list-disc list-inside text-neutral-500 space-y-1">
                      <li>精确 commit / PR / Review / Issue 全量计数（近 1 年，替代事件估计）</li>
                      <li>逐仓提交分布 → Elephant Factor 与集中度</li>
                      <li>头部仓库贡献者数 → Bus Factor（抗关键人风险）</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-md font-bold text-neutral-800 mb-4">技术活跃词云</h3>
                <SkillTags langs={hunter.langs} />
              </div>
            </div>
          )}

          {/* Tab: 简历 */}
          {activeTab === 'resume' && hunter.user && hunter.aiResult && (
            <div className="animate-fade-in-up">
              {/* Print button */}
              <div className="flex justify-end mb-4 no-print">
                <button
                  onClick={() => window.print()}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded transition-colors flex items-center"
                >
                  <i className="fa-solid fa-print mr-2" />
                  打印 / 导出 PDF
                </button>
              </div>
              <ResumeView
                user={hunter.user}
                bestRepos={hunter.bestRepos}
                langs={hunter.langs}
                aiResult={hunter.aiResult}
                academic={hunter.academic}
                orgs={hunter.orgs}
                starAnalysis={hunter.starAnalysis}
                domains={hunter.domains}
                contributionHealth={hunter.contributionHealth}
              />
            </div>
          )}
        </div>
      </main>

      {/* Empty state */}
      {!showResult && hunter.status === 'idle' && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <i className="fa-solid fa-magnifying-glass text-6xl text-neutral-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-700 mb-2">Vesta｜迹与寻</h2>
          <p className="text-neutral-400">输入任意 GitHub 用户名，发现代码背后的创造者</p>
          <div className="mt-8 flex justify-center gap-4 text-sm text-neutral-400">
            <span><i className="fa-solid fa-fire text-gold-500 mr-1" />迹 · 开发者发现</span>
            <span><i className="fa-solid fa-robot text-blue-400 mr-1" />AI 能力画像</span>
            <span><i className="fa-regular fa-file-pdf text-coral-400 mr-1" />可打印简历</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon }: {
  title: string; value: string | number; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <h4 className="font-bold text-sm text-neutral-800 mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <p className="text-2xl font-bold text-neutral-700">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
  );
}

function HealthStat({ title, value, desc }: { title: string; value: number | string; desc: string }) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <h4 className="font-bold text-sm text-neutral-800 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{desc}</p>
    </div>
  );
}

function RepoContributorBars({ items }: { items: { name: string; contributors: number; isFork: boolean; stars: number }[] }) {
  const data = items.filter(r => r.contributors > 0);
  if (data.length === 0) return <p className="text-sm text-neutral-400">头部仓库贡献者数据不足</p>;
  const max = Math.max(1, ...data.map(r => r.contributors));
  return (
    <div className="space-y-2">
      {data.map(r => (
        <div key={r.name} className="flex items-center gap-2 text-xs">
          <span className="w-36 truncate text-neutral-600" title={r.name}>{r.name}</span>
          <div className="flex-1 h-3 bg-neutral-100 rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded"
              style={{ width: `${(r.contributors / max) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-neutral-500">{r.contributors}</span>
        </div>
      ))}
    </div>
  );
}
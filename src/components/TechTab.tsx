import { LanguageDoughnut, LanguageBytesBar, SkillTags } from './AnalyticsCharts';
import { StatCard, HealthStat, RepoContributorBars } from './StatCards';
import { formatNumber } from '../utils/helpers';
import type { HunterState } from '../types';

export function TechTab({ hunter }: { hunter: HunterState }) {
  const { stats, starAnalysis, langBytes, domains, academic, orgs, contributionHealth, graph, langs } = hunter;
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-md font-bold text-neutral-800 mb-4">代码量 Top 语言</h3>
          <LanguageDoughnut langs={langs} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:col-span-2">
          <h3 className="text-md font-bold text-neutral-800 mb-4">最近仓库客观指标</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="总计被 Fork"
              value={formatNumber(stats.totalForks)}
              description="代码被他人复制并二次开发的量"
              icon={<i className="fa-solid fa-code-fork text-blue-500" />}
            />
            <StatCard
              title="开源协议意识"
              value={`${stats.licenseRatio}%`}
              description="为自己的原创项目配置 License 的比例"
              icon={<i className="fa-solid fa-scale-balanced text-green-500" />}
            />
            <StatCard
              title="未解决的 Issue"
              value={formatNumber(stats.totalIssues)}
              description="当前面临的外部待处理任务量"
              icon={<i className="fa-solid fa-triangle-exclamation text-orange-500" />}
            />
            <StatCard
              title="原创项目比重"
              value={`${stats.originalRatio}%`}
              description="排除纯粹 Fork 他人代码的仓库比例"
              icon={<i className="fa-solid fa-file-code text-purple-500" />}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-md font-bold text-neutral-800 mb-4">
          <i className="fa-solid fa-star text-yellow-400 mr-2" />
          Star 深度评估
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Star 总量"
            value={formatNumber(starAnalysis.totalStars)}
            description="全部原创仓库 Stars 之和"
            icon={<i className="fa-solid fa-star text-yellow-400" />}
          />
          <StatCard
            title="头部仓库"
            value={formatNumber(starAnalysis.maxStars)}
            description="单个最高 Star 仓库"
            icon={<i className="fa-solid fa-trophy text-amber-500" />}
          />
          <StatCard
            title="年均增速"
            value={starAnalysis.velocityPerYear}
            description="Star / 账号年龄（年）"
            icon={<i className="fa-solid fa-chart-line text-green-500" />}
          />
          <StatCard
            title="头部集中度"
            value={`${Math.round(starAnalysis.topRepoShare * 100)}%`}
            description="头部仓库占 Star 总量比例"
            icon={<i className="fa-solid fa-layer-group text-indigo-500" />}
          />
        </div>
        <p className="text-sm text-neutral-500 mt-3">
          {starAnalysis.tier} · Star 中位数 {starAnalysis.medianStars}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-md font-bold text-neutral-800 mb-4">
          <i className="fa-solid fa-code text-brand-500 mr-2" />
          字节级语言分布（Top 仓库）
        </h3>
        <LanguageBytesBar langs={langBytes} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-md font-bold text-neutral-800 mb-4">
          <i className="fa-solid fa-compass text-gold-500 mr-2" />
          方向 / 领域聚类
        </h3>
        <div className="flex flex-wrap gap-2">
          {domains.length > 0 ? (
            domains.map(d => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-md font-bold text-neutral-800 mb-4">
            <i className="fa-solid fa-graduation-cap text-gold-600 mr-2" />
            学术背景
          </h3>
          {academic.isAcademic ? (
            <div className="space-y-2 text-sm text-neutral-600">
              {academic.institution && <p>机构：{academic.institution}</p>}
              {academic.links.map(l => (
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
          {orgs.length > 0 ? (
            <div className="space-y-2">
              {orgs.slice(0, 6).map(o => (
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

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-md font-bold text-neutral-800 mb-1 flex items-center">
          <i className="fa-solid fa-sitemap text-indigo-500 mr-2" />
          协作健康 / 组织健康
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          {contributionHealth.available
            ? `基于 GitHub GraphQL 精确贡献（近 1 年）+ 头部仓库贡献者分布`
            : '当前未鉴权：仅能基于公开事件粗略估计。配置 VITE_GITHUB_TOKEN 解锁精确分析'}
        </p>

        {contributionHealth.available ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <HealthStat
                title="Elephant Factor"
                value={contributionHealth.elephantFactor}
                desc="提交达 50% 所需仓库数（越大越分散）"
              />
              <HealthStat
                title="Bus Factor"
                value={contributionHealth.busFactor}
                desc="头部仓库贡献者中位数（越高越团队化）"
              />
              <HealthStat
                title="纯单人仓库"
                value={`${Math.round(contributionHealth.soloRatio * 100)}%`}
                desc="头部仓库仅作者一人占比"
              />
              <HealthStat
                title="集中度"
                value={`${Math.round(contributionHealth.concentration * 100)}%`}
                desc="提交分布 Gini 集中度"
              />
            </div>

            <div className="mb-2 text-xs text-neutral-500">
              近 1 年精确贡献：commit {graph.totalCommits} · 发起 PR {graph.totalPRs} · Review {graph.totalReviews} · Issue {graph.totalIssues}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>提交集中度</span>
                <span>均匀 ←→ 集中</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${contributionHealth.concentration * 100}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-neutral-500 mb-2">头部仓库贡献者分布</p>
              <RepoContributorBars items={contributionHealth.repoContributors} />
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
        <SkillTags langs={langs} />
      </div>
    </div>
  );
}

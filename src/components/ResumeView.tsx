import type { GitHubUser, GitHubRepo, LanguageStat, AiAnalysisResult, AcademicProfile, OrgInfo, StarAnalysis, DomainCluster, ContributionHealth } from '../types';

interface ResumeViewProps {
  user: GitHubUser;
  bestRepos: GitHubRepo[];
  langs: LanguageStat[];
  aiResult: AiAnalysisResult;
  academic?: AcademicProfile;
  orgs?: OrgInfo[];
  starAnalysis?: StarAnalysis;
  domains?: DomainCluster[];
  contributionHealth?: ContributionHealth;
}

export function ResumeView({ user, bestRepos, langs, aiResult, academic, orgs = [], starAnalysis, domains = [], contributionHealth }: ResumeViewProps) {
  const langStr = langs.slice(0, 6).map(l => l.name).join(' / ');

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
      <header className="border-b-2 border-neutral-800 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">
              {user.name || user.login}
            </h1>
            <p className="text-lg font-medium text-brand-700">{aiResult.aiTechLevel}</p>
          </div>
          <div className="text-right text-sm text-neutral-500 space-y-1">
            <p>
              <i className="fa-solid fa-location-dot mr-1"></i>
              {user.location || 'Remote'}
            </p>
            <p>
              <i className="fa-brands fa-github mr-1"></i>
              github.com/{user.login}
            </p>
            {user.blog && (
              <p>
                <i className="fa-solid fa-globe mr-1"></i>
                {user.blog.replace(/^https?:\/\//, '')}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide mb-4 flex items-center">
              <i className="fa-solid fa-trophy text-yellow-500 mr-2" />
              核心开源贡献
            </h2>
            <div className="space-y-5">
              {bestRepos.map((repo, index) => (
                <div key={repo.name} className="relative pl-5 border-l-2 border-neutral-200">
                  <div className={`absolute w-3 h-3 ${index === 0 ? 'bg-brand-500' : 'bg-neutral-400'} rounded-full -left-[7px] top-1`} />
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-md font-bold text-neutral-800">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                        {repo.name}
                      </a>
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    {repo.language && (
                      <span className="px-1.5 py-0.5 bg-neutral-100 text-xs rounded mr-2 border border-neutral-200">{repo.language}</span>
                    )}
                    <span className="text-yellow-600 text-xs">
                      <i className="fa-solid fa-star"></i> {repo.stargazers_count}
                    </span>
                    <span className="text-neutral-400 text-xs ml-2">
                      <i className="fa-solid fa-code-fork"></i> {repo.forks_count}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-600 leading-snug">{repo.description || '无具体项目描述。'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <section className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
            <h2 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center border-b border-indigo-200 pb-2">
              <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
              Gemini 极简评语
            </h2>
            <p className="text-sm text-indigo-900 leading-relaxed font-serif italic">
              "{aiResult.resumeSummary}"
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide mb-3 flex items-center border-b border-neutral-200 pb-2">
              <i className="fa-solid fa-code mr-2"></i>
              技术栈侧写
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-1">主力编程语言</p>
                <p className="text-sm font-medium text-neutral-800">{langStr}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-1">影响力评级</p>
                <p className="text-sm font-medium text-neutral-800">{aiResult.aiInfluenceLevel}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-1">猎头推荐</p>
                <p className="text-sm text-neutral-600">{aiResult.aiRecommendation}</p>
              </div>
              {(aiResult.directions.length > 0 || domains.length > 0) && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">技术方向</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {[...aiResult.directions, ...domains.map(d => d.name)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              )}
              {starAnalysis && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">Star 评估</p>
                  <p className="text-sm text-neutral-600">
                    {starAnalysis.tier} · 总量 {starAnalysis.totalStars} · 年均 {starAnalysis.velocityPerYear}/年
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-4">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">学术 / 组织</h2>
            <div className="space-y-3">
              {academic?.isAcademic && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">学术背景</p>
                  <p className="text-sm text-neutral-600">
                    {academic.institution || '学术归属'}
                    {academic.links.length > 0 && (
                      <span className="ml-1">
                        {academic.links.map(l => (
                          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline mr-2">
                            {l.label}
                          </a>
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {orgs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">组织归属</p>
                  <p className="text-sm text-neutral-600">{orgs.map(o => o.login).join(' · ')}</p>
                </div>
              )}

              {contributionHealth?.available && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">协作 / 组织健康</p>
                  <p className="text-sm text-neutral-600">
                    Elephant Factor {contributionHealth.elephantFactor} · Bus Factor {contributionHealth.busFactor} · 纯单人仓库 {Math.round(contributionHealth.soloRatio * 100)}%
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
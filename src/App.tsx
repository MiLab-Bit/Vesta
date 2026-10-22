import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router';
import type { ActiveTab, LoadingProgress } from './types';
import { useHunterData } from './hooks/useHunterData';
import { isValidGitHubUsername, cn } from './utils/helpers';
import { UserCard } from './components/UserCard';
import { ResumeView } from './components/ResumeView';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ApiKeySettings } from './components/ApiKeySettings';
import { OverviewTab } from './components/OverviewTab';
import { TechTab } from './components/TechTab';

const SEG_TO_TAB: Record<string, ActiveTab> = { analysis: 'overview', repos: 'tech', resume: 'resume' };
const TAB_TO_SEG: Record<ActiveTab, string> = { overview: 'analysis', tech: 'repos', resume: 'resume' };

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hunter = useHunterData();
  const [username, setUsername] = useState('yyx990803');
  const searchedRef = useRef<string | null>(null);

  const userMatch = location.pathname.match(/^\/u\/([^/]+)(?:\/([^/]+))?/);
  const rawUser = userMatch?.[1];
  const tabSeg = userMatch?.[2];
  let routeUser: string | undefined;
  if (rawUser) {
    try { routeUser = decodeURIComponent(rawUser); } catch { routeUser = rawUser; }
  }
  const activeTab: ActiveTab = (tabSeg && SEG_TO_TAB[tabSeg]) || 'overview';
  const onSettings = location.pathname === '/settings';

  useEffect(() => {
    if (!userMatch || !rawUser) return;
    if (!tabSeg || !SEG_TO_TAB[tabSeg]) {
      navigate(`/u/${encodeURIComponent(rawUser)}/analysis`, { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    if (routeUser) setUsername(routeUser);
  }, [routeUser]);

  useEffect(() => {
    if (!routeUser) return;
    const key = routeUser.toLowerCase();
    if (searchedRef.current === key) return;
    if (hunter.status === 'loading' || hunter.status === 'analyzing') return;
    searchedRef.current = key;
    hunter.search(routeUser);
  }, [routeUser, hunter.status]);

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
    navigate(`/u/${encodeURIComponent(trimmed)}/analysis`);
  };

  const showResult = hunter.status === 'success' || hunter.status === 'analyzing';
  const showError = hunter.errorMessage && hunter.status !== 'idle';

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <LoadingOverlay
        visible={hunter.status === 'loading' || hunter.status === 'analyzing'}
        progress={loadingProgress}
      />

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
              <NavLink
                to="/settings"
                title="配置 Gemini Key (BYOK)"
                className={({ isActive }) => cn(
                  'flex items-center gap-2 text-sm',
                  isActive ? 'text-brand-600' : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <i className="fa-solid fa-key" />
                <span className="hidden sm:inline">AI Key</span>
              </NavLink>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search GitHub Username..."
                  className="bg-neutral-100 border border-neutral-200 text-sm rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-brand-500 outline-none w-64 transition-all placeholder:text-neutral-400"
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

      {showError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700 text-sm flex items-center justify-between">
          <span><i className="fa-solid fa-circle-exclamation mr-2" />{hunter.errorMessage}</span>
          <button onClick={() => hunter.reset()} className="text-red-500 hover:text-red-700 ml-4">✕</button>
        </div>
      )}

      {onSettings ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApiKeySettings />
        </main>
      ) : (
        <>
          <main
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
            style={{ display: showResult ? 'grid' : 'none' }}
          >
            <aside className="lg:col-span-3 space-y-6">
              {hunter.user && (
                <UserCard user={hunter.user} stats={hunter.stats} academic={hunter.academic} orgs={hunter.orgs} />
              )}
            </aside>

            <div className="lg:col-span-9 flex flex-col main-panel">
              {routeUser && (
                <div className="border-b border-neutral-200 mb-6 no-print">
                  <nav className="-mb-px flex space-x-8">
                    {(['overview', 'tech', 'resume'] as ActiveTab[]).map(tab => (
                      <NavLink
                        key={tab}
                        to={`/u/${routeUser}/${TAB_TO_SEG[tab]}`}
                        className={({ isActive }) => cn(
                          'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                          isActive
                            ? 'border-brand-500 text-brand-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                        )}
                      >
                        {tab === 'overview' && <><i className="fa-solid fa-brain mr-2 text-blue-500" />AI 洞察画像</>}
                        {tab === 'tech' && <><i className="fa-solid fa-chart-bar mr-2 text-brand-500" />统计指纹</>}
                        {tab === 'resume' && <><i className="fa-regular fa-file-pdf mr-2 text-red-500" />大模型总结简历</>}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              )}

              {activeTab === 'overview' && hunter.aiResult && (
                <OverviewTab hunter={hunter} />
              )}

              {activeTab === 'tech' && (
                <TechTab hunter={hunter} />
              )}

              {activeTab === 'resume' && hunter.user && hunter.aiResult && (
                <div className="animate-fade-in-up">
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
        </>
      )}
    </div>
  );
}

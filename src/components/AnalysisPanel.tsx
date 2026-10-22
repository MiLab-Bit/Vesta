import type { AiAnalysisResult } from '../types';

interface AnalysisPanelProps {
  aiResult: AiAnalysisResult;
}

function NoteCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <i className={`${icon} text-brand-500`} />
        <span className="text-sm font-semibold text-neutral-700">{title}</span>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{body || '—'}</p>
    </div>
  );
}

export function AnalysisPanel({ aiResult }: AnalysisPanelProps) {
  const {
    aiInfluenceLevel, aiInfluenceDesc, aiTechLevel, aiTechDesc, aiRecommendation,
    directions, aiCodeCapabilityNote, aiHeatNote, aiAcademicNote, aiStarNote, aiOrgNote, aiHealthNote,
  } = aiResult;

  return (
    <div className="space-y-6">
      {aiResult.degraded && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          今日 AI 额度已用完（每浏览器每日 3 次），已用本地启发式分析。
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-4">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          <i className="fa-solid fa-robot text-blue-500 mr-2" />
          大模型洞察结论
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">开源影响力分析</span>
              <span className="text-sm font-bold text-brand-600">{aiInfluenceLevel}</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic border-l-2 border-blue-200 pl-3 mt-2">
              {aiInfluenceDesc}
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">技术特征提取</span>
              <span className="text-sm font-bold text-brand-600">{aiTechLevel}</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic border-l-2 border-brand-200 pl-3 mt-2">
              {aiTechDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-md font-bold text-neutral-800 mb-3">
          <i className="fa-solid fa-compass text-gold-500 mr-2" />
          技术方向 / 领域
        </h3>
        <div className="flex flex-wrap gap-2">
          {directions.length > 0 ? (
            directions.map((d, i) => (
              <span
                key={d}
                className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                  i === 0 ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 border border-brand-200'
                }`}
              >
                {d}
              </span>
            ))
          ) : (
            <span className="text-sm text-neutral-400">暂无明确方向聚类</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NoteCard icon="fa-solid fa-microchip" title="代码能力" body={aiCodeCapabilityNote} />
        <NoteCard icon="fa-solid fa-fire" title="活跃热度" body={aiHeatNote} />
        <NoteCard icon="fa-solid fa-star" title="Star 评估" body={aiStarNote} />
        <NoteCard icon="fa-solid fa-building-columns" title="组织归属" body={aiOrgNote} />
        <NoteCard icon="fa-solid fa-sitemap" title="协作 / 组织健康" body={aiHealthNote} />
        <NoteCard icon="fa-solid fa-graduation-cap" title="学术背景" body={aiAcademicNote} />
        <NoteCard
          icon="fa-solid fa-crosshairs"
          title="猎头定调"
          body={aiRecommendation}
        />
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-neutral-900 rounded-2xl shadow-sm border border-neutral-700 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10 text-9xl">
          <i className="fa-solid fa-user-astronaut" />
        </div>
        <h3 className="text-lg font-bold mb-3 relative z-10">
          <i className="fa-solid fa-crosshairs text-green-400 mr-2" />
          猎头定调与职业推荐
        </h3>
        <p className="text-sm text-neutral-200 leading-relaxed mb-2 relative z-10">
          {aiRecommendation}
        </p>
      </div>
    </div>
  );
}

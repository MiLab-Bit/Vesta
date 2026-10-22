import { AbilityRadar, ScoreRing } from './AnalyticsCharts';
import { AnalysisPanel } from './AnalysisPanel';
import { Dim } from './StatCards';
import type { HunterState } from '../types';

export function OverviewTab({ hunter }: { hunter: HunterState }) {
  const aiResult = hunter.aiResult;
  if (!aiResult) return null;
  const { codeCapability, activity } = hunter;
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">能力五维评测</h3>
          <div style={{ height: 320 }}>
            <AbilityRadar scores={aiResult.radarScores} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">综合评分</h3>
          <div className="flex-1 flex gap-4 flex-wrap items-center justify-center">
            <ScoreRing
              label="能力综合"
              score={codeCapability.overall}
              color="#1B2A4A"
              sub="不含影响力"
            />
            <ScoreRing
              label="影响力·触达"
              score={codeCapability.influence}
              color="#C9A24B"
              sub="Star + 关注者"
            />
            <ScoreRing
              label="活跃热度"
              score={activity.heatScore}
              color="#3b82f6"
              sub={activity.heatLevel}
            />
          </div>
          <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Dim label="代码深度" v={codeCapability.depth} />
            <Dim label="技术广度" v={codeCapability.breadth} />
            <Dim label="协作" v={codeCapability.collaboration} />
            <Dim label="持续度" v={codeCapability.sustainability} />
          </div>
        </div>
      </div>
      <AnalysisPanel aiResult={aiResult} />
    </div>
  );
}

import { analyzeWithKey, buildHeuristicAnalysis } from './ai';
import { consume } from './quota';
import { getGeminiKey, getGeminiModel } from './byok';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '../types';

export async function analyze(
  payload: GeminiAnalysisPayload,
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.info('[Vesta] 未配置 Gemini Key，使用确定性启发式分析兜底。');
    return { ...buildHeuristicAnalysis(payload), degraded: true, byok: false };
  }
  if (!consume()) {
    console.warn('[Vesta] 今日 AI 配额已用完（每浏览器每日 3 次），使用启发式兜底。');
    return { ...buildHeuristicAnalysis(payload), degraded: true, byok: true };
  }
  return { ...(await analyzeWithKey(payload, apiKey, getGeminiModel(), onError)), byok: true };
}

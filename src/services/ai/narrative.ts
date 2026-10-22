import type { GeminiAnalysisPayload, AiAnalysisResult } from '../../types';
import { geminiFetch, DEFAULT_MODEL } from './client';
import { buildPrompt } from './prompt';
import { buildHeuristicAnalysis } from './heuristic';
import { validateNarrative, toRadar, toDirections, contributionHealthNote } from './schema';

export async function analyzeWithKey(
  payload: GeminiAnalysisPayload,
  apiKey: string,
  model: string = DEFAULT_MODEL,
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  try {
    const prompt = buildPrompt(payload);
    const raw = await geminiFetch(prompt, apiKey, model);
    const narrative = validateNarrative(raw);
    if (!narrative) {
      const msg = 'Gemini 输出缺少必需叙述字段，回退启发式分析。';
      console.warn(msg);
      onError?.(msg);
      return { ...buildHeuristicAnalysis(payload), degraded: true };
    }
    return {
      radarScores: toRadar(payload.codeCapability),
      ...narrative,
      directions: toDirections(payload.domains, payload.langs),
      codeCapabilityScore: payload.codeCapability.overall,
      heatScore: payload.activity.heatScore,
      aiHealthNote: contributionHealthNote(payload.contributionHealth),
      degraded: false,
    };
  } catch (e) {
    const msg = `Gemini 推理失败: ${e instanceof Error ? e.message : String(e)}`;
    console.error(msg);
    onError?.(msg);
    return { ...buildHeuristicAnalysis(payload), degraded: true };
  }
}

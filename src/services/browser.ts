import { analyzeWithKey, buildHeuristicAnalysis } from './gemini';
import { consume } from './quota';
import { getGeminiKey, getGeminiModel } from './byok';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '../types';

/**
 * 浏览器端 BYOK 分析：读取用户 localStorage 中的 Gemini Key，浏览器直连 Gemini。
 * 不再有任何服务端代理（无 /api/analyze BFF），平台零 LLM key 暴露面。
 *
 * 降级策略：
 * - 未配置 Key          -> 确定性启发式兜底（degraded, byok=false）
 * - 当日配额(3次)已耗尽 -> 确定性启发式兜底（degraded, byok=true）
 * - Key 有效且配额充足  -> 调用 Gemini
 */
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
  // 已使用用户自带 Key 调 Gemini；失败时 analyzeWithKey 内部回退启发式（degraded 已置位）
  return { ...(await analyzeWithKey(payload, apiKey, getGeminiModel(), onError)), byok: true };
}

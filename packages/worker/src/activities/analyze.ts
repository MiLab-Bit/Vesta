import { analyzeWithKey, buildHeuristicAnalysis } from '@web/services/gemini';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '@web/types';

export async function doAnalyze(payload: GeminiAnalysisPayload): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return buildHeuristicAnalysis(payload);
  return analyzeWithKey(payload, apiKey, process.env.GEMINI_MODEL || 'gemini-2.0-flash');
}

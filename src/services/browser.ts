import { analyzeWithKey, buildHeuristicAnalysis, DEFAULT_MODEL } from './gemini';
import { consume } from './quota';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '../types';

export async function analyzeInBrowser(
  payload: GeminiAnalysisPayload,
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('[Vesta] No VITE_GEMINI_API_KEY found. Using deterministic heuristic analysis.');
    return buildHeuristicAnalysis(payload);
  }
  console.warn('[Vesta] VITE_GEMINI_API_KEY is browser-visible. Ensure referrer restriction is set in Google AI Studio.');
  if (!consume()) {
    return { ...buildHeuristicAnalysis(payload), degraded: true };
  }
  return analyzeWithKey(payload, apiKey, import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL, onError);
}

export async function analyzeRemote(
  payload: GeminiAnalysisPayload,
  onError?: (msg: string) => void
): Promise<AiAnalysisResult> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok || res.status === 429) {
      const data = await res.json();
      if (data && typeof data === 'object' && typeof (data as AiAnalysisResult).radarScores === 'object') {
        return data as AiAnalysisResult;
      }
      return { ...buildHeuristicAnalysis(payload), degraded: true };
    }
    throw new Error('analyze api ' + res.status);
  } catch (e) {
    console.warn('[Vesta] /api/analyze unavailable, falling back to browser analysis:', e);
    return analyzeInBrowser(payload, onError);
  }
}

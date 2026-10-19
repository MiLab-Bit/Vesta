import { proxyActivities } from '@temporalio/workflow';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '@web/types';

const acts = proxyActivities<typeof import('../activities/analyze')>({ startToCloseTimeout: '60s' });

export async function analyzeWorkflow(payload: GeminiAnalysisPayload): Promise<AiAnalysisResult> {
  return acts.doAnalyze(payload);
}

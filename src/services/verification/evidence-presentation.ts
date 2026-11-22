import type { EvidenceClaim, SourceObservation } from '../../types/verification-evidence';

/**
 * Fail-closed presentation of public GitHub evidence.
 * A rate limit, missing sample, or disputed attribution never becomes a zero
 * ability score or an affirmative claim about the developer.
 *
 * Adapted for the existing Vesta repository after reviewing Ark 37700.
 */
export function isUsableObservation(observation: SourceObservation): boolean {
  return observation.status === 'ok'
    && observation.sourceUrl.trim().length > 0
    && observation.observedAt.trim().length > 0;
}

export function describeEvidence(claim: EvidenceClaim): string {
  if (claim.state === 'withdrawn') return '该证据已撤回，不应继续展示。';
  if (claim.state === 'conflict') return '证据存在冲突，尚不能得出确定结论。';
  if (claim.state === 'missing') return '数据缺失或不可用，不能按零贡献或零能力解释。';

  if (!claim.observations.some(isUsableObservation)) {
    return '当前没有可核验的有效来源，暂不展示确定性结论。';
  }
  if (claim.state === 'inference') {
    return '有限推断：' + claim.statement + '。此判断不等于能力评级。';
  }
  return '公开事实：' + claim.statement;
}

import { describe, expect, it } from 'vitest';
import { describeEvidence, isUsableObservation } from './evidence-presentation';
import type { EvidenceClaim, SourceObservation } from '../../types/verification-evidence';

const valid: SourceObservation = {
  sourceUrl: 'https://github.com/example/repo',
  observedAt: '2026-11-22T00:00:00Z',
  status: 'ok',
  limitations: [],
};

const claim = (state: EvidenceClaim['state'], observations: SourceObservation[] = [valid]): EvidenceClaim => ({
  id: 'example',
  statement: '公开仓库存在一次提交',
  state,
  attribution: 'account',
  observations,
});

describe('evidence presentation: fail closed', () => {
  it('does not interpret missing data as zero ability', () => {
    expect(describeEvidence(claim('missing'))).toContain('不能按零贡献或零能力解释');
  });
  it('blocks withdrawn and conflicting evidence', () => {
    expect(describeEvidence(claim('withdrawn'))).toContain('已撤回');
    expect(describeEvidence(claim('conflict'))).toContain('尚不能得出确定结论');
  });
  it('requires a valid source for factual claims', () => {
    expect(isUsableObservation({ ...valid, status: 'rate_limited' })).toBe(false);
    expect(describeEvidence(claim('fact', [{ ...valid, status: 'rate_limited' }]))).toContain('没有可核验');
  });
  it('labels inference rather than claiming ability scores', () => {
    expect(describeEvidence(claim('inference'))).toContain('有限推断');
    expect(describeEvidence(claim('fact'))).toContain('公开事实');
  });
});

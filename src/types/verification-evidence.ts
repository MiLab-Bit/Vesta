/** Ark task 37700 / xyst 90671: standalone evidence contract.
 * No score or professional seniority can be inferred from these types.
 * This is not an identity, consent, dispute or revocation implementation.
 */
export type EvidenceState = 'fact' | 'inference' | 'missing' | 'conflict' | 'withdrawn';
export type SourceState = 'ok' | 'partial' | 'failed' | 'rate_limited' | 'forbidden' | 'not_configured';
export type Attribution = 'account' | 'co_authored' | 'team' | 'automation' | 'unknown';

export interface SourceObservation {
  sourceUrl: string;
  observedAt: string;
  window?: string;
  sampleSize?: number;
  status: SourceState;
  limitations: string[];
}

export interface EvidenceClaim {
  id: string;
  statement: string;
  state: EvidenceState;
  attribution: Attribution;
  observations: SourceObservation[];
  /** A missing observation must not be converted into a zero-value score. */
  missingReason?: string;
  /** A conflict must remain visible until an authorized resolution exists. */
  conflictExplanation?: string;
}

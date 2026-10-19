import { describe, it, expect } from 'vitest';
import { consume, remaining, QUOTA_LIMIT } from './quota';

function memStore(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => m.delete(k),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
  } as Storage;
}

const day = (iso: string) => new Date(iso + 'T12:00:00Z');

describe('vesta llm quota', () => {
  it('allows up to limit then blocks', () => {
    const s = memStore();
    const now = day('2026-10-20');
    for (let i = 0; i < QUOTA_LIMIT; i++) {
      expect(consume(s, now)).toBe(true);
    }
    expect(consume(s, now)).toBe(false);
    expect(remaining(s, now)).toBe(0);
  });

  it('rolls over to a new day', () => {
    const s = memStore();
    const d1 = day('2026-10-20');
    for (let i = 0; i < QUOTA_LIMIT; i++) expect(consume(s, d1)).toBe(true);
    expect(consume(s, d1)).toBe(false);
    const d2 = day('2026-10-21');
    expect(remaining(s, d2)).toBe(QUOTA_LIMIT);
    expect(consume(s, d2)).toBe(true);
  });

  it('tolerates corrupt storage', () => {
    const s = memStore();
    s.setItem('vesta_llm_quota', '{not json');
    expect(consume(s, day('2026-10-20'))).toBe(true);
    expect(remaining(s, day('2026-10-20'))).toBe(QUOTA_LIMIT - 1);
  });

  it('tolerates stale date', () => {
    const s = memStore();
    s.setItem('vesta_llm_quota', JSON.stringify({ date: '2026-01-01', n: 99 }));
    const now = day('2026-10-20');
    expect(remaining(s, now)).toBe(QUOTA_LIMIT);
    expect(consume(s, now)).toBe(true);
  });

  it('remaining reflects partial consumption', () => {
    const s = memStore();
    const now = day('2026-10-20');
    expect(remaining(s, now)).toBe(QUOTA_LIMIT);
    consume(s, now);
    expect(remaining(s, now)).toBe(QUOTA_LIMIT - 1);
    consume(s, now);
    expect(remaining(s, now)).toBe(QUOTA_LIMIT - 2);
  });
});

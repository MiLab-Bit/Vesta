const KEY = 'vesta_llm_quota';
export const QUOTA_LIMIT = 3;

function dayStr(now: Date): string {
  return now.toISOString().slice(0, 10);
}

type Rec = { date: string; n: number };

function read(store: Storage, now: Date): Rec {
  const date = dayStr(now);
  try {
    const raw = store.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<Rec>;
      if (typeof v.n === 'number' && typeof v.date === 'string' && v.date === date) {
        return { date, n: Math.max(0, Math.floor(v.n)) };
      }
    }
  } catch { /* corrupt -> reset */ }
  return { date, n: 0 };
}

export function remaining(store: Storage = localStorage, now: Date = new Date()): number {
  return Math.max(0, QUOTA_LIMIT - read(store, now).n);
}

export function consume(store: Storage = localStorage, now: Date = new Date()): boolean {
  const v = read(store, now);
  if (v.n >= QUOTA_LIMIT) return false;
  try { store.setItem(KEY, JSON.stringify({ date: v.date, n: v.n + 1 })); } catch { /* ignore */ }
  return true;
}

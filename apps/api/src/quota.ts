import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const LIMIT = 3;

function dbPath(): string {
  return process.env.VESTA_QUOTA_DB || '/opt/vesta/data/llm_quota.json';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(readFileSync(dbPath(), 'utf8'));
  } catch {
    return {};
  }
}

export function remaining(ip: string): number {
  const d = today();
  return Math.max(0, LIMIT - (load()[d]?.[ip] ?? 0));
}

export function consume(ip: string): boolean {
  const data = load();
  const d = today();
  const used = data[d]?.[ip] ?? 0;
  if (used >= LIMIT) return false;
  data[d] = data[d] || {};
  data[d][ip] = used + 1;
  const db = dbPath();
  mkdirSync(dirname(db), { recursive: true });
  const tmp = db + '.tmp';
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, db);
  return true;
}

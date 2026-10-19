import { describe, it, expect, beforeEach } from 'vitest';
import { consume, remaining } from './quota';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

beforeEach(() => {
  process.env.VESTA_QUOTA_DB = join(mkdtempSync(join(tmpdir(), 'vq')), 'q.json');
});

describe('server quota', () => {
  it('allows up to 3 then blocks', () => {
    for (let i = 0; i < 3; i++) expect(consume('1.2.3.4')).toBe(true);
    expect(consume('1.2.3.4')).toBe(false);
    expect(remaining('1.2.3.4')).toBe(0);
  });
  it('scopes per ip', () => {
    expect(consume('a')).toBe(true);
    expect(consume('b')).toBe(true);
    expect(remaining('a')).toBe(2);
  });
});

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const r = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  resolve: { alias: { '@web': resolve(r, '../../src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});

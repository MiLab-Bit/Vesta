import { Worker } from '@temporalio/worker';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as activities from './activities/analyze';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'vesta-analysis',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });
  await worker.run();
}

run().catch((e) => { console.error(e); process.exit(1); });

import { createServer } from 'node:http';
import { Connection, WorkflowClient } from '@temporalio/client';
import { analyzeWorkflow } from '@vesta/worker/src/workflows/analyze';
import { consume, remaining } from './quota';
import { buildHeuristicAnalysis } from '@web/services/gemini';
import type { GeminiAnalysisPayload, AiAnalysisResult } from '@web/types';

const PORT = Number(process.env.PORT || 8787);
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'vesta-analysis';
const NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const ADDRESS = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233';

const conn = await Connection.connect({ address: ADDRESS });
const client = new WorkflowClient({ connection: conn, namespace: NAMESPACE });

function clientIp(req: import('node:http').IncomingMessage): string {
  return (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'anon').trim();
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/analyze') {
    const ip = clientIp(req);
    let body = '';
    for await (const c of req) body += c;
    let payload: GeminiAnalysisPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'bad json' }));
      return;
    }
    if (!consume(ip)) {
      res.writeHead(429, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ...buildHeuristicAnalysis(payload), degraded: true }));
      return;
    }
    try {
      const handle = await client.start(analyzeWorkflow, {
        args: [payload],
        taskQueue: TASK_QUEUE,
        workflowId: `vesta-${ip}-${Date.now()}`,
      });
      const result = await handle.result();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      console.error('[vesta-api] workflow failed:', e);
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ...buildHeuristicAnalysis(payload), degraded: true }));
    }
    return;
  }
  if (req.method === 'GET' && req.url === '/api/quota') {
    const ip = clientIp(req);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ remaining: remaining(ip), limit: 3 }));
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => console.log(`[vesta-api] listening on :${PORT} (temporal ${ADDRESS}/${NAMESPACE}/${TASK_QUEUE})`));

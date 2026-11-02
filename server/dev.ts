import { createServer } from 'node:http';
import handler from '../api/analyze.ts';
import branding from '../api/branding.ts';

createServer((req, res) => {
  const route = req.url?.split('?')[0];
  const endpoint = route === '/api/analyze' ? handler : route === '/api/branding' ? branding : null;
  if (!endpoint) { res.statusCode = 404; res.end('Not found'); return; }
  void endpoint(req, res).catch(() => { if (!res.writableEnded) { res.statusCode = 500; res.end(JSON.stringify({ error: 'AI generation is unavailable.' })); } });
}).listen(8787, '127.0.0.1', () => console.log('Farmily photo analysis: http://127.0.0.1:8787'));

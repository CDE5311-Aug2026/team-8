import type { IncomingMessage, ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { analysisSchema, instructions, validateAnalysis } from '../shared/analysis.ts';

const maxBytes = 3 * 1024 * 1024; // 2 MB image plus base64 overhead.
export function validateImage(value: unknown): string {
  if (typeof value !== 'string' || value.length > maxBytes) throw new Error('Choose a JPG, PNG or WebP photo smaller than 2 MB.');
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) throw new Error('Choose a JPG, PNG or WebP photo.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 2 * 1024 * 1024) throw new Error('Choose a photo smaller than 2 MB.');
  const valid = match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) throw new Error('The photo format could not be read. Please upload another image.');
  return value;
}
export async function bodyOf(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) {
    const text = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(text) > maxBytes) throw new Error('Photo request is too large.');
    return JSON.parse(text);
  }
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) { const b = Buffer.from(chunk); size += b.length; if (size > maxBytes) throw new Error('Photo request is too large.'); chunks.push(b); }
  return JSON.parse(Buffer.concat(chunks).toString());
}
export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
  const send = (status: number, data: unknown) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'Use POST to analyze a photo.' }); }
  if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'Send the photo as JSON.' });
  const token = process.env.AI_SCAN_TOKEN;
  // An explicit passcode protects the paid demo endpoint until farmer authentication exists.
  if (process.env.VERCEL_GIT_COMMIT_REF !== 'dev' && process.env.VERCEL && !token) return send(503, { error: '[DEV] Photo analysis has not been enabled by the app owner.' });
  if (process.env.VERCEL_GIT_COMMIT_REF !== 'dev' && token) {
    const supplied = Buffer.from(String(req.headers['x-scan-token'] || '')); const expected = Buffer.from(token);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return send(401, { error: '[DEV] Enter the photo scan access code provided by the app owner.' });
  }
  let image: string;
  try { const body = await bodyOf(req) as { image?: unknown }; image = validateImage(body?.image); }
  catch (error) { return send(400, { error: error instanceof SyntaxError ? 'The photo request could not be read.' : (error as Error).message }); }
  if (!process.env.OPENAI_API_KEY) return send(503, { error: '[DEV] Photo analysis is not configured yet. You can still enter the product details manually.' });
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, instructions,
        input: [{ role: 'user', content: [{ type: 'input_text', text: 'Analyze this product photo for a farmer listing.' }, { type: 'input_image', image_url: image, detail: 'high' }] }],
        max_output_tokens: 3500, text: { format: { type: 'json_schema', name: 'product_analysis', strict: true, schema: analysisSchema } },
      }),
    });
    if (!response.ok) return send(response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'Photo analysis is busy. Please try again shortly.' : 'The photo analysis service is unavailable. Please try again or enter details manually.' });
    const result = await response.json();
    if (result.status !== 'completed') return send(502, { error: 'The analysis was incomplete. Try a clearer photo or enter details manually.' });
    const content = result.output?.flatMap((item: { content?: { type: string; text?: string }[] }) => item.content || []) || [];
    if (content.some((part: { type: string }) => part.type === 'refusal')) return send(422, { error: 'This photo could not be analyzed. Try a product or label photo.' });
    const text = content.filter((part: { type: string }) => part.type === 'output_text').map((part: { text: string }) => part.text).join('');
    return send(200, { analysis: validateAnalysis(JSON.parse(text)) });
  } catch (error) {
    return send(502, { error: error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'Analysis took too long. Please try again.' : 'We could not read the analysis. Please retry or enter details manually.' });
  }
}

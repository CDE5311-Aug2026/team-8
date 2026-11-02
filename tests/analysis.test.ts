import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import handler, { validateImage } from '../api/analyze.ts';
import { fieldNames, validateAnalysis, type Analysis } from '../shared/analysis.ts';

function fixture(mode: Analysis['mode'] = 'visual'): Analysis {
  const fields = Object.fromEntries(fieldNames.map(key => [key, { value: null, source: 'unknown', evidence: null }])) as Analysis['fields'];
  fields.name = { value: 'Tomatoes', source: 'visual', evidence: null };
  return { mode, confidence: 'medium', fields, questions: [], warnings: [] };
}
test('visual identification cannot populate label-only facts, including invented no-allergen claims', () => {
  const data = fixture();
  for (const key of ['allergens','ingredients','quantity','origin','expiry','nutrition','storage','producer','brand'] as const) data.fields[key] = { value: 'Invented', source: 'visual', evidence: 'Looks likely' };
  const result = validateAnalysis(data);
  assert.equal(result.fields.name.value, 'Tomatoes');
  for (const key of ['allergens','ingredients','quantity','origin','expiry','nutrition','storage','producer','brand'] as const) assert.equal(result.fields[key].value, null);
});
test('label extraction preserves exact allergen qualifiers and rejects unsupported label facts', () => {
  const data = fixture('label'); data.fields.allergens = { value: 'May contain peanuts', source: 'label', evidence: 'May contain peanuts' };
  data.fields.quantity = { value: '500 g', source: 'label', evidence: null };
  assert.equal(validateAnalysis(data).fields.allergens.value, 'May contain peanuts');
  assert.equal(validateAnalysis(data).fields.quantity.value, null);
});
test('unrelated photos clear all suggestions and malformed responses are rejected', () => {
  assert.equal(validateAnalysis(fixture('unclear')).fields.name.value, null);
  assert.throws(() => validateAnalysis({}));
  const data = fixture(); delete (data.fields as Partial<Analysis['fields']>).allergens; assert.throws(() => validateAnalysis(data));
});
test('upload validation rejects remote URLs, fake image MIME types and oversized photos', () => {
  assert.throws(() => validateImage('https://example.com/product.jpg'));
  assert.throws(() => validateImage('data:image/png;base64,' + Buffer.from('not a PNG').toString('base64')));
  assert.throws(() => validateImage('x'.repeat(3 * 1024 * 1024 + 1)));
});
test('HTTP integration covers provider payload, label/visual results, access control and failure paths', async t => {
  const oldKey = process.env.OPENAI_API_KEY, oldToken = process.env.AI_SCAN_TOKEN, oldVercel = process.env.VERCEL;
  delete process.env.OPENAI_API_KEY; delete process.env.AI_SCAN_TOKEN; delete process.env.VERCEL;
  const originalFetch = globalThis.fetch;
  let upstream: (body: Record<string, unknown>) => Response = () => new Response('{}');
  globalThis.fetch = async (input, init) => String(input) === 'https://api.openai.com/v1/responses' ? upstream(JSON.parse(String(init?.body))) : originalFetch(input, init);
  const server = createServer((req,res) => void handler(req,res));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Missing address');
  const url = `http://127.0.0.1:${address.port}`;
  const image = 'data:image/png;base64,' + Buffer.from([137,80,78,71,13,10,26,10]).toString('base64');
  const post = (extra = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify({ image }) });
  try {
    await t.test('method and missing configuration', async () => { assert.equal((await fetch(url)).status,405); const r = await post(); assert.equal(r.status,503); assert.match((await r.json()).error,/not configured/); });
    process.env.OPENAI_API_KEY = 'test-key-never-sent';
    await t.test('label and visual responses are wired to the real handler', async () => {
      for (const mode of ['visual','label'] as const) {
        const data = fixture(mode);
        if (mode === 'label') data.fields.ingredients = { value: 'Tomatoes, salt', source: 'label', evidence: 'Tomatoes, salt' };
        upstream = body => { assert.equal(body.store,false); assert.equal((body.text as {format:{strict:boolean}}).format.strict,true); assert.ok(JSON.stringify(body.input).includes(image)); return Response.json({ status:'completed', output:[{content:[{type:'output_text',text:JSON.stringify(data)}]}] }); };
        const r = await post(); assert.equal(r.status,200); const result=await r.json(); assert.equal(result.analysis.mode,mode); assert.equal(result.analysis.fields.ingredients.value,mode==='label'?'Tomatoes, salt':null);
      }
    });
    await t.test('provider throttling, refusal, incomplete and malformed output', async () => {
      upstream = () => new Response('{}',{status:429}); assert.equal((await post()).status,429);
      upstream = () => Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]}); assert.equal((await post()).status,422);
      upstream = () => Response.json({status:'incomplete'}); assert.equal((await post()).status,502);
      upstream = () => Response.json({status:'completed',output:[{content:[{type:'output_text',text:'not json'}]}]}); assert.equal((await post()).status,502);
    });
    await t.test('production endpoint fails closed and never exposes credentials', async () => {
      process.env.VERCEL='1'; assert.equal((await post()).status,503);
      process.env.AI_SCAN_TOKEN='demo-passcode'; const r=await post(); assert.equal(r.status,401); assert.ok(!(await r.text()).includes('test-key-never-sent'));
      upstream=()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(fixture())}]}]});
      assert.equal((await post({'X-Scan-Token':'demo-passcode'})).status,200);
    });
  } finally {
    globalThis.fetch=originalFetch; await new Promise<void>(resolve=>server.close(()=>resolve()));
    for (const [key,value] of Object.entries({OPENAI_API_KEY:oldKey,AI_SCAN_TOKEN:oldToken,VERCEL:oldVercel})) { if(value===undefined)delete process.env[key];else process.env[key]=value; }
  }
});

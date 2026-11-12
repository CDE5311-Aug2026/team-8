import type { IncomingMessage, ServerResponse } from 'node:http';

// "Hear the farmer" on product pages: a natural-sounding voice reading the farmer's own story.
// Only these fixed scripts can be spoken, and each clip is cached by the CDN, so it is
// generated once and costs almost nothing to replay.
const farms: Record<string, { name: string; who: string; voice: string }> = {
  gv: { name: 'Green Valley Farm', who: 'Alex', voice: 'ash' },
  bg: { name: 'Bee Good Apiary', who: 'Nadia', voice: 'coral' },
  hh: { name: 'Happy Hill Farm', who: 'Raj', voice: 'verse' },
  rb: { name: 'Riverbend Farm', who: 'Wei Ling', voice: 'shimmer' },
  ff: { name: 'Field and Flour', who: 'Farah', voice: 'sage' },
  kp: { name: 'Kampung Pantry', who: 'Rosnah', voice: 'coral' },
  sg: { name: 'Sunrise Greens', who: 'Jun Hao', voice: 'ash' },
};
const stories: Record<string, { farm: string; story: string }> = {
  tea: { farm: 'gv', story: 'A light, citrusy lemongrass infusion in 20 individually wrapped tea bags. Presented in a compact paperboard carton.' },
  'gv-honey': { farm: 'gv', story: 'Raw honey from our hives, harvested by hand each season.' },
  honey: { farm: 'bg', story: 'Unheated honey from our Kranji hives. We only take what the bees can spare.' },
  spinach: { farm: 'rb', story: 'Picked the morning it ships and washed once. Leaves we cannot sell go to compost.' },
  milk: { farm: 'hh', story: 'Milked every morning and bottled the same day. Our goats graze outdoors.' },
  sourdough: { farm: 'ff', story: 'Slow proved for 24 hours and baked before sunrise on the day it ships.' },
  cheese: { farm: 'hh', story: 'Soft cheese made in small batches from our own goat milk.' },
  jam: { farm: 'bg', story: 'Cooked in small pots with our own honey and ripe apricots.' },
  kaya: { farm: 'kp', story: 'Stirred by hand for two hours over a low flame, the way my grandmother made it.' },
  sambal: { farm: 'kp', story: 'Pounded by hand in a stone mortar, then fried slowly until dark and fragrant.' },
  microgreens: { farm: 'sg', story: 'Grown on shelves under soft lights and cut the morning they ship.' },
  lettuce: { farm: 'sg', story: 'Grown in water channels in our greenhouse and sold with the roots on so it stays fresh.' },
};
export function scriptFor(id: string): { text: string; voice: string } | null {
  const s = stories[id]; const f = s && farms[s.farm];
  if (!s || !f) return null;
  return { text: `Hi, I'm ${f.who} from ${f.name}. ${s.story}`, voice: f.voice };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const fail = (status: number, error: string) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify({ error })); };
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return fail(405, 'Use GET.'); }
  const id = new URL(req.url || '', 'http://x').searchParams.get('id') || '';
  const script = scriptFor(id);
  if (!script) return fail(404, 'No story for this product.');
  if (!process.env.OPENAI_API_KEY) return fail(503, 'Voice is not configured.');
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: script.voice, input: script.text, response_format: 'mp3',
        instructions: 'You are a small-scale farmer in Singapore talking warmly and casually to a neighbour about something you made. Natural pace, friendly, a little proud, not salesy.',
      }),
    });
    if (!r.ok) return fail(502, 'Voice could not be generated.');
    const audio = Buffer.from(await r.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    res.end(audio);
  } catch {
    return fail(502, 'Voice could not be generated.');
  }
}

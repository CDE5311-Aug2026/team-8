export type FarmPhoto = { id: string; kind: 'farm' | 'products' | 'process'; url: string; name: string };
export type FarmerProfile = { farmerName: string; farmName: string; location: string; address?:string; story: string; products: string; philosophy: string; photos: FarmPhoto[] };
export type BrandConcept = { id: string; name: string; tagline: string; rationale: string; colors: string[]; typography: 'serif' | 'sans'; packaging: string; imagePrompt: string };
export type BrandKit = { concept: BrandConcept; origin: 'ai' | 'sample' | 'existing'; image: string | null; imageSource: 'ai' | 'uploaded' | 'none'; profileSignature: string; designStyle?:'Minimal'|'Rustic'|'Playful'; handwritten?:boolean };
export const blankProfile: FarmerProfile = { farmerName:'',farmName:'',location:'',story:'',products:'',philosophy:'',photos:[] };
export const sampleProfile: FarmerProfile = { farmerName:'Alex',farmName:'Green Valley Farm',location:'Singapore',story:'We started growing vegetables as a family and now share our seasonal harvest with our neighbours.',products:'Tomatoes, leafy greens and fresh herbs',philosophy:'Care for the soil, grow with the seasons, and keep good food close to home.',photos:[] };
// Photo IDs change on replacement; do not duplicate base64 files in every saved signature.
export const signature = (p: FarmerProfile) => JSON.stringify([p.farmName,p.products,p.story,p.philosophy,p.photos.map(photo=>[photo.id,photo.kind])]);
export const canAddProduct = (profile: FarmerProfile | null, brand: BrandKit | null) => !!profile && !!brand && brand.profileSignature === signature(profile);
export const onboardingCount = (profile: FarmerProfile | null, brand: BrandKit | null, hasProduct: boolean) => Number(!!profile) + Number(!!profile && !!brand && brand.profileSignature === signature(profile)) + Number(hasProduct);
export const imageDisclosure = (source: BrandKit['imageSource']) => source === 'ai' ? 'AI-generated image based on your written farm profile. This is an illustration, not a photograph of your farm.' : source === 'uploaded' ? 'Original photo provided by you.' : 'Typography and colour layout — no farm photo used.';
export function validProfile(value: unknown): FarmerProfile {
  if (!value || typeof value !== 'object') throw new Error('Please complete your farm profile first.');
  const p = value as FarmerProfile;
  if(p.address!==undefined&&(typeof p.address!=='string'||p.address.length>2500))throw new Error('Keep your address under 2,500 characters.');
  for (const key of ['farmerName','farmName','location','story','products','philosophy'] as const) if (typeof p[key] !== 'string' || p[key].length > 2500) throw new Error('Check your farm profile. Keep each answer under 2,500 characters.');
  if (!p.farmerName.trim() || !p.farmName.trim() || !p.products.trim()) throw new Error('Add your name, farm name and products first.');
  if (!Array.isArray(p.photos) || p.photos.length>3 || p.photos.some(photo=>!photo || typeof photo.url!=='string' || typeof photo.id!=='string' || typeof photo.name!=='string' || !['farm','products','process'].includes(photo.kind))) throw new Error('Choose up to three farm, product or process photos.');
  return p;
}
export function validConcept(value: unknown): BrandConcept {
  if (!value || typeof value!=='object') throw new Error('The branding ideas could not be read. Please try again.');
  const c=value as BrandConcept;
  for(const key of ['id','name','tagline','rationale','packaging','imagePrompt'] as const) if(typeof c[key]!=='string'||!c[key].trim()||c[key].length>2000) throw new Error('Incomplete branding idea. Please try again.');
  if(!['serif','sans'].includes(c.typography)||!Array.isArray(c.colors)||c.colors.length!==3||c.colors.some(color=>!/^#[0-9a-f]{6}$/i.test(color))) throw new Error('Invalid branding colours. Please try again.');
  return c;
}
export const conceptSchema = {type:'object',additionalProperties:false,required:['id','name','tagline','rationale','colors','typography','packaging','imagePrompt'],properties:{
  ...Object.fromEntries(['id','name','tagline','rationale','packaging','imagePrompt'].map(key=>[key,{type:'string'}])),colors:{type:'array',items:{type:'string'},minItems:3,maxItems:3},typography:{type:'string',enum:['serif','sans']},
}};
export const brandingSchema={type:'object',additionalProperties:false,required:['concepts'],properties:{concepts:{type:'array',minItems:3,maxItems:3,items:conceptSchema}}};
// Explicit sample concepts allow exploration without pretending a model has run.
export const sampleConcepts: BrandConcept[] = [
  {id:'sample-earth',name:'Rooted in care',tagline:'Grown close. Shared with care.',rationale:'A warm, grounded direction that puts the farmer’s story first.',colors:['#415c50','#fff6de','#cfa255'],typography:'serif',packaging:'Cream paper labels with a deep green wordmark, a botanical accent and space for product information.',imagePrompt:'A flat botanical illustration of seasonal vegetables, warm cream paper and muted green leaves. No people, buildings, words or certification symbols.'},
  {id:'sample-harvest',name:'Everyday harvest',tagline:'A little closer to the harvest.',rationale:'An approachable direction for a colourful, varied seasonal catalogue.',colors:['#9d4d36','#fff8e9','#73805b'],typography:'sans',packaging:'Warm terracotta product bands, simple typography and small illustrated produce accents.',imagePrompt:'An editorial illustration of a colourful seasonal vegetable harvest, terracotta, olive and cream, hand-cut paper texture. No text, logos, people or buildings.'},
  {id:'sample-field',name:'Quiet fields',tagline:'Simple food. A thoughtful touch.',rationale:'A restrained direction with generous white space and a calm palette.',colors:['#344e55','#f5f2e9','#bda77a'],typography:'serif',packaging:'Minimal cream sleeves, fine linework and a consistent placement for the farm name and product label.',imagePrompt:'An abstract botanical line illustration with leafy forms, deep blue green and soft cream, subtle golden accents. No text, real farm scenes or certification claims.'},
];

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import handler from '../api/branding.ts';
import {sampleProfile,sampleConcepts,onboardingCount,signature,imageDisclosure,validConcept,validProfile,canAddProduct,type BrandKit} from '../shared/branding.ts';

test('product creation requires a saved brand matching the current farm profile',()=>{
 const brand:BrandKit={concept:sampleConcepts[0],origin:'sample',image:null,imageSource:'none',profileSignature:signature(sampleProfile)};
 assert.equal(canAddProduct(sampleProfile,null),false);
 assert.equal(canAddProduct(null,brand),false);
 assert.equal(canAddProduct(sampleProfile,brand),true);
 assert.equal(canAddProduct({...sampleProfile,products:'A new product range'},brand),false);
});

test('onboarding counts a created profile, reviewed identity and saved product separately',()=>{
 const brand:BrandKit={concept:sampleConcepts[0],origin:'sample',image:null,imageSource:'none',profileSignature:signature(sampleProfile)};
 assert.equal(onboardingCount(null,null,false),0);assert.equal(onboardingCount(sampleProfile,null,false),1);
 assert.equal(onboardingCount(sampleProfile,brand,false),2);assert.equal(onboardingCount(sampleProfile,brand,true),3);
 assert.equal(onboardingCount({...sampleProfile,philosophy:'A revised philosophy'},brand,true),2);
});
test('photos are optional and image provenance cannot be confused with farm photography',()=>{
 assert.equal(validProfile(sampleProfile).photos.length,0);
 assert.match(imageDisclosure('ai'),/AI-generated.*written farm profile/);assert.match(imageDisclosure('ai'),/not a photograph/);
 assert.match(imageDisclosure('uploaded'),/Original photo/);assert.match(imageDisclosure('none'),/no farm photo/);
 assert.throws(()=>validProfile({...sampleProfile,farmName:''}));
 assert.throws(()=>validConcept({...sampleConcepts[0],colors:['red','white','blue']}));
});
test('branding endpoint uses profile and optional photos, gates credentials, and marks generated images',async t=>{
 const previous={OPENAI_API_KEY:process.env.OPENAI_API_KEY,AI_SCAN_TOKEN:process.env.AI_SCAN_TOKEN,VERCEL:process.env.VERCEL,SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY};
 delete process.env.OPENAI_API_KEY;delete process.env.AI_SCAN_TOKEN;delete process.env.VERCEL;process.env.SUPABASE_URL='https://farmily-test.supabase.co';process.env.SUPABASE_PUBLISHABLE_KEY='public-test-key';
 const original=globalThis.fetch;let payload:any;let destination='';
 let provider=()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({concepts:sampleConcepts})}]}]});
 globalThis.fetch=async(input,init)=>{if(String(input).startsWith('https://farmily-test.supabase.co/'))return Response.json({id:'verified-test-user',email:'test@example.com',is_anonymous:false});if(String(input).startsWith('https://api.openai.com/')){destination=String(input);payload=JSON.parse(String(init?.body));return provider();}return original(input,init);};
 const server=createServer((req,res)=>void handler(req,res));await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();if(!address||typeof address==='string')throw new Error('Missing address');const url=`http://127.0.0.1:${address.port}`;
 const post=(body:unknown,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test-session',...headers},body:JSON.stringify(body)});
 try{
  await t.test('missing API key and malformed profiles return useful errors',async()=>{assert.equal((await post({action:'concepts',profile:sampleProfile})).status,503);assert.equal((await post({action:'concepts',profile:{}})).status,400);});
  process.env.OPENAI_API_KEY='test-only-key';
  await t.test('written information is used without photos or invented farm data',async()=>{
   const response=await post({action:'concepts',profile:sampleProfile});assert.equal(response.status,200);const result=await response.json();assert.equal(result.source,'ai');assert.equal(result.concepts.length,3);assert.equal(payload.store,false);
   const text=JSON.stringify(payload.input);assert.ok(text.includes(sampleProfile.story));assert.ok(text.includes(sampleProfile.philosophy));assert.ok(text.includes(sampleProfile.products));assert.ok(!text.includes('farmerName'));assert.ok(!text.includes('location'));assert.ok(!text.includes('input_image'));
  });
  await t.test('uploaded references are sent as images, not generated images',async()=>{
   const photo={id:'one',name:'farm.png',kind:'farm',url:'data:image/png;base64,iVBORw0KGgo='};
   assert.equal((await post({action:'concepts',profile:{...sampleProfile,photos:[photo]}})).status,200);assert.ok(JSON.stringify(payload.input).includes(photo.url));assert.ok(JSON.stringify(payload.input).includes('User-provided farm reference'));
  });
  await t.test('image response is explicitly AI-origin and based on the written brief',async()=>{
   provider=()=>Response.json({data:[{b64_json:'iVBORw0KGgo='}]});const result=await(await post({action:'image',profile:sampleProfile,concept:sampleConcepts[0]})).json();
   assert.equal(result.source,'ai');assert.ok(result.image.startsWith('data:image/png;base64,'));assert.ok(destination.endsWith('/images/generations'));assert.ok(payload.prompt.includes(sampleProfile.philosophy));assert.ok(payload.prompt.includes('not portray a real farm'));
  });
  await t.test('malformed provider output and production access fail safely',async()=>{
   provider=()=>Response.json({status:'incomplete'});assert.equal((await post({action:'concepts',profile:sampleProfile})).status,502);
   assert.equal((await post({action:'concepts',profile:sampleProfile},{Authorization:''})).status,401);
   process.env.SUPABASE_URL='';process.env.SUPABASE_PUBLISHABLE_KEY='';assert.equal((await post({action:'concepts',profile:sampleProfile})).status,503);
  });
 }finally{globalThis.fetch=original;await new Promise<void>(resolve=>server.close(()=>resolve()));for(const[key,value]of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

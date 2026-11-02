import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleProfile,signature} from '../shared/branding.ts';
import {brandV2Key,makeV2Brand,newV2BrandWork,restoreV2BrandWork,v2Palettes} from '../shared/brandV2.ts';
import {workspaceKeys} from '../shared/access.ts';

test('V2 brand drafts restore the fourth palette and preserve preferences',()=>{
 const work={...newV2BrandWork(sampleProfile),stage:'style' as const,palette:3,category:'Honey',include:'Our red tractor',refinement:'Handwritten',handwritten:true};
 assert.deepEqual(restoreV2BrandWork(JSON.parse(JSON.stringify(work)),sampleProfile),work);
 const kit=makeV2Brand(work);assert.deepEqual(kit.concept.colors,v2Palettes[3]);assert.equal(kit.origin,'sample');assert.equal(kit.imageSource,'none');assert.equal(kit.handwritten,true);assert.match(kit.preferences||'',/Our red tractor/);assert.equal(kit.profileSignature,signature(sampleProfile));assert.ok(workspaceKeys.includes(brandV2Key));
});
test('interrupted V2 creation restores editing and stale or malformed drafts are rejected',()=>{
 const work={...newV2BrandWork(sampleProfile),stage:'creating' as const};assert.equal(restoreV2BrandWork(work,sampleProfile)?.stage,'farm');
 assert.equal(restoreV2BrandWork(work,{...sampleProfile,farmName:'Changed Farm'}),null);
 for(const bad of [null,{}, {...work,palette:4},{...work,style:-1},{...work,category:'unknown'},{...work,include:3},{...work,profile:{...sampleProfile,photos:null}}])assert.equal(restoreV2BrandWork(bad,sampleProfile),null);
});
test('existing brand confirmation does not fabricate artwork or make an AI claim',()=>{
 const kit=makeV2Brand({...newV2BrandWork(sampleProfile),choice:'existing'});assert.equal(kit.origin,'existing');assert.equal(kit.image,null);assert.equal(kit.imageSource,'none');assert.equal(kit.profileSignature,signature(sampleProfile));
});

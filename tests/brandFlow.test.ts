import {test} from 'node:test';
import assert from 'node:assert/strict';
import {brandPalettes,buildBrand,demoConcepts,existingBrand,restoreBrandWork,type BrandWork} from '../shared/brandFlow.ts';
import {canAddProduct,onboardingCount,sampleProfile,signature} from '../shared/branding.ts';
const work:BrandWork={version:2,stage:'preview',choice:'create',profile:sampleProfile,concepts:demoConcepts,selected:0,palette:0,style:0,handwritten:false,image:null,origin:'sample',basis:signature(sampleProfile),refinement:''};

test('an existing brand completes the identity requirement without claiming AI or uploaded artwork',()=>{
 const brand=existingBrand(sampleProfile);
 assert.equal(brand.origin,'existing');assert.equal(brand.image,null);assert.equal(brand.imageSource,'none');
 assert.equal(canAddProduct(sampleProfile,brand),true);assert.equal(onboardingCount(sampleProfile,brand,false),2);
 assert.equal(canAddProduct({...sampleProfile,farmName:'Updated farm'},brand),false);
});
test('a saved identity carries selected palette, style, handwriting and image provenance into packaging',()=>{
 const brand=buildBrand({...work,style:2,palette:1,handwritten:true});assert.ok(brand);
 assert.deepEqual(brand.concept.colors,brandPalettes[1]);assert.equal(brand.designStyle,'Playful');assert.equal(brand.handwritten,true);assert.equal(brand.origin,'sample');assert.equal(brand.imageSource,'none');
 const ai=buildBrand({...work,origin:'ai',image:'data:image/png;base64,iVBORw0KGgo='});assert.equal(ai?.imageSource,'ai');
 const photo={id:'farm-one',kind:'farm' as const,name:'my farm',url:'data:image/png;base64,iVBORw0KGgo='};
 assert.equal(buildBrand({...work,profile:{...sampleProfile,photos:[photo]}})?.imageSource,'uploaded');
});
test('interrupted generation restores a usable screen and preserves refinements without restarting AI',()=>{
 const restored=restoreBrandWork({...work,stage:'generating',refinement:'Softer colors'},sampleProfile);
 assert.equal(restored?.stage,'preview');assert.equal(restored?.refinement,'Softer colors');
 assert.equal(restoreBrandWork({...work,stage:'generating',concepts:[],selected:0},sampleProfile)?.stage,'review');
 assert.equal(restoreBrandWork({...work,selected:99},sampleProfile),null);
 assert.equal(restoreBrandWork({...work,concepts:[{...demoConcepts[0],colors:['red']}]},sampleProfile),null);
});
test('older paused branding drafts still open with their selected direction',()=>{
 const old={concepts:demoConcepts,selected:1,origin:'sample',image:null,basis:signature(sampleProfile)};
 assert.equal(restoreBrandWork(old,sampleProfile)?.selected,1);assert.equal(restoreBrandWork(old,sampleProfile)?.stage,'preview');
});
test('changes to the saved farm profile are not overwritten by a completed old design draft',()=>{
 const changed={...sampleProfile,farmName:'Updated Farm'};
 const restored=restoreBrandWork({...work,stage:'saved'},changed);
 assert.equal(restored?.stage,'review');assert.equal(restored?.profile.farmName,'Updated Farm');
 assert.equal(canAddProduct(changed,buildBrand(work)),false);
});

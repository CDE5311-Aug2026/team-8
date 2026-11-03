import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoProducts} from '../shared/demoDashboard.ts';
import {onboardingSampleWorkspace,onboardingSampleReturnKey} from '../shared/onboardingSamples.ts';
test('onboarding samples preserve the published product and farm while populating both catalogues',()=>{
 const product={...demoProducts[0],id:'my-harvest',catalogueId:'my-harvest',name:'My first harvest',photo:'/my-photo.png',description:'My description'};
 const current={'farmily-profile':'custom farm','farmily-brand':'custom brand','farmily-draft':JSON.stringify(product),'farmily-catalogue-v2':JSON.stringify([{id:product.id,product,draft:false}]),'farmily-publish-v2-work':'published success'};
 const next=onboardingSampleWorkspace(current);
 for(const key of ['farmily-profile','farmily-brand','farmily-draft','farmily-publish-v2-work'] as const)assert.equal(next[key],current[key]);
 const legacy=JSON.parse(next['farmily-products']),catalogue=JSON.parse(next['farmily-catalogue-v2']);
 assert.equal(legacy.length,5);assert.equal(catalogue.length,5);
 assert.deepEqual(catalogue.find((item:{id:string})=>item.id===product.id).product,product);
 assert.equal(next['farmily-setup-complete'],'true');assert.equal(next[onboardingSampleReturnKey],'true');
 const repeated=onboardingSampleWorkspace(next);assert.equal(JSON.parse(repeated['farmily-catalogue-v2']).length,5);
});

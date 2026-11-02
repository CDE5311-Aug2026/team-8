import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleProfile} from '../shared/branding.ts';
import {existingBrand} from '../shared/brandFlow.ts';
import {fieldNames} from '../shared/analysis.ts';
import type {ProductDraft} from '../shared/productFlow.ts';
import {newPublishWork,restorePublishWork,publishSource,localPublication,polishDescription,publishV2Key} from '../shared/publishV2.ts';
import {workspaceKeys} from '../shared/access.ts';
const product:ProductDraft={...Object.fromEntries(fieldNames.map(key=>[key,''])),name:'Tomatoes',category:'Vegetables',ingredients:'Tomatoes',allergens:'May contain: Peanuts.',quantity:'1 kg',price:'4.50',photo:'',story:'',description:'Picked by hand.',live:false,brandIdentity:existingBrand(sampleProfile)} as ProductDraft;
test('publishing drafts preserve edits and description versions, while changed source products invalidate them',()=>{
 const work={...newPublishWork(product),stage:'story' as const,original:'We grow tomatoes.',polished:'We grow tomatoes.',descriptionMode:'polished' as const};work.product={...product,price:'5.00'};
 assert.deepEqual(restorePublishWork(JSON.parse(JSON.stringify(work)),product),work);
 assert.equal(restorePublishWork(work,{...product,quantity:'2 kg'}),null);
 for(const bad of [{...work,photos:[]},{...work,polished:7},{...work,descriptionMode:'other'},{...work,photos:[{url:'javascript:alert(1)',name:'bad'},null,null]}])assert.equal(restorePublishWork(bad,product),null);
 assert.ok(workspaceKeys.includes(publishV2Key));
});
test('local publication preserves allergen qualifiers and does not grant actual marketplace access',()=>{
 const work=newPublishWork(product);work.original='Hand picked tomatoes.';work.photos[0]={url:'/publish-v2/example.png',name:'Cover'};
 const listing=localPublication(work,sampleProfile);assert.equal(listing.live,true);assert.equal(listing.publication,'local-demo');assert.equal(listing.allergens,'May contain: Peanuts.');assert.equal(listing.description,work.original);assert.equal(listing.photo,'/publish-v2/example.png');assert.equal(product.live,false);
 const saved={...work,product:listing,stage:'live' as const,source:publishSource(listing)};assert.ok(restorePublishWork(saved,listing));assert.equal(restorePublishWork({...saved,product:{...listing,publication:undefined}},listing),null);
 assert.throws(()=>localPublication({...work,product:{...product,allergens:''}},sampleProfile));assert.throws(()=>localPublication(work,{...sampleProfile,farmName:'Different farm'}));
});
test('local wording assistance preserves supplied facts and does not invent growing claims',()=>{
 assert.equal(polishDescription('  grown in clay soil  ','Tomatoes','Example Farm'),'Grown in clay soil.');assert.equal(polishDescription('','Tomatoes','Example Farm'),'Tomatoes from Example Farm.');assert.equal(polishDescription('Picked by hand. Packed today.','Tomatoes','Example Farm','Shorter'),'Picked by hand.');
 const work=newPublishWork({...product,listingPhotos:[{url:'/cover.png',name:'Cover'}],processPhotos:[]});assert.equal(work.photos.length,3);assert.equal(work.behind.length,2);
});

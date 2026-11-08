import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoProducts,demoProfile,demoBrand} from '../shared/demoDashboard.ts';
import {samplePackagingFor,upgradeSampleProduct} from '../shared/samplePackaging.ts';
import {labelSvg,validProduct} from '../shared/productFlow.ts';
test('every demo product has a suitable package and complete, product-specific details',()=>{
 assert.equal(demoProducts.length,4);for(const product of demoProducts){const spec=samplePackagingFor(product)!;assert.ok(spec);assert.equal(spec.kind,product.id==='demo-tea'?'carton':'jar');assert.ok(validProduct(product));for(const field of ['description','ingredients','allergens','storage','expiry','producer','origin'] as const)assert.ok(product[field].trim());assert.equal(product.photo,spec.image);assert.ok(!/pouch|zipbag/i.test(spec.material));assert.match(labelSvg(product,demoProfile,demoBrand),new RegExp(`width="${spec.labelWidthMm}mm" height="${spec.labelHeightMm}mm"`));}
 assert.match(demoProducts.find(p=>p.id==='demo-kaya')!.allergens,/eggs/);assert.match(demoProducts.find(p=>p.id==='demo-tea')!.ingredients,/lemongrass/);
});
test('existing demo records gain packaging and missing details without losing edits or status',()=>{
 const old={id:'demo-kaya',name:'Pandan Kaya',description:'',ingredients:'See product label',allergens:'None declared',photo:'/images/farmer-pages/product-image2.png',live:true,packagingComplete:true,price:'12.00'};
 const upgraded=upgradeSampleProduct(old);assert.match(upgraded.allergens,/eggs/);assert.match(upgraded.ingredients,/Coconut/);assert.equal(upgraded.live,true);assert.equal(upgraded.price,'12.00');assert.equal(upgraded.photo,'/sample-packaging/kaya.png');
 const customized={...old,description:'My own wording',ingredients:'Custom recipe',allergens:'Contains milk',photo:'data:image/png;base64,AAAA'};const kept=upgradeSampleProduct(customized);for(const key of ['description','ingredients','allergens','photo'] as const)assert.equal(kept[key],customized[key]);
 const real={...old,id:'my-real-product'};assert.equal(upgradeSampleProduct(real),real);
 const selection=upgradeSampleProduct({...demoProducts[2],allergens:'None declared',allergenDetails:{status:'none' as const,original:'',contains:[],mayContain:[]}});assert.ok(validProduct(selection));
});

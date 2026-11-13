import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {showcaseProductInfo,showcaseProductPrice,showcasePackaging,showcaseTheme,showcaseGallery} from '../shared/showcaseProduct.ts';
import {sampleProfile,signature} from '../shared/branding.ts';
import {existingBrand} from '../shared/brandFlow.ts';
import {samplePackagingFor} from '../shared/samplePackaging.ts';
import {coverPhoto,themedListingPhotos,migrateLegacySamplePhotos} from '../shared/presetProduct.ts';
import {newPublishWork,localPublication,restorePublishWork,publishSource} from '../shared/publishV2.ts';
import {restoreProductWork,validProduct,type ProductDraft} from '../shared/productFlow.ts';
const photo='data:image/jpeg;base64,'+'A'.repeat(1500);
const product:ProductDraft={...showcaseProductInfo,price:showcaseProductPrice,photo,story:'',live:false,sample:true,showcase:'pomegranate',brandIdentity:existingBrand(sampleProfile)};

test('showcase scan details form a valid editable product with box packaging',()=>{
 assert.ok(validProduct(product));assert.equal(product.name,'Pomegranate');assert.equal(product.quantity,'1 fruit');
 assert.equal(samplePackagingFor(product)?.kind,'carton');
 assert.ok(existsSync(new URL('../public'+showcasePackaging.image,import.meta.url)));
 const restored=restoreProductWork({product:{...product,price:'6.00'},screen:'packaging',reviewed:true,profileSignature:signature(sampleProfile)},sampleProfile);
 assert.equal(restored?.product.showcase,'pomegranate');assert.equal(restored?.product.price,'6.00');assert.equal(restored?.product.photo,photo);
});
test('publishing uses static packaging as cover and retains the captured fruit photo',()=>{
 const work=newPublishWork(product);
 assert.equal(work.photos[0]?.url,showcasePackaging.image);assert.equal(work.photos[1]?.url,photo);
 const live=localPublication(work,sampleProfile);
 assert.equal(live.photo,showcasePackaging.image);assert.equal(coverPhoto(live),showcasePackaging.image);
 assert.equal(themedListingPhotos(live)[1].url,photo);assert.equal(samplePackagingFor(live),showcasePackaging);
 assert.ok(restorePublishWork({...work,product:live,stage:'live',source:publishSource(live)},live));
 assert.ok(!JSON.stringify(live).includes('/preset/jam-'));
});
test('legacy migration preserves showcase uploads across draft and published reloads',()=>{
 const live=localPublication(newPublishWork(product),sampleProfile);
 const records:Record<string,string>={'farmily-product-work':JSON.stringify({product}),'farmily-products':JSON.stringify([live]),'farmily-publish-v2-work':JSON.stringify(newPublishWork(product))};
 const before={...records};const keys=Object.keys(records);
 migrateLegacySamplePhotos({length:keys.length,key:i=>keys[i],getItem:key=>records[key],setItem:(key,value)=>{records[key]=value;}});
 assert.deepEqual(records,before);
});

for(const template of ['botanical','minimal','market'] as const){
 test(`${template} packaging survives saving, publication and later theme changes`,()=>{
  const selected={...product,labelTemplate:template};
  const restored=restoreProductWork({product:selected,screen:'packaging',reviewed:true,profileSignature:signature(sampleProfile)},sampleProfile)!;
  assert.equal(restored.product.labelTemplate,template);
  const work=newPublishWork(restored.product);
  work.photos[2]={url:showcaseTheme(template).studio,name:'Packed'};
  const listing=localPublication(work,sampleProfile);
  assert.equal(listing.photo,showcaseTheme(template).photo);
  assert.equal(coverPhoto(listing),showcaseTheme(template).photo);
  assert.equal(samplePackagingFor(listing)?.image,showcaseTheme(template).photo);
  assert.equal(listing.listingPhotos?.at(-1)?.url,showcaseTheme(template).studio);
  assert.equal(listing.listingPhotos?.[1].url,photo);
  const changed:typeof listing={...listing,labelTemplate:template==='market'?'minimal':'market'};
  const gallery=showcaseGallery(changed);
  assert.equal(gallery[0].url,showcaseTheme(changed.labelTemplate).photo);
  assert.equal(gallery.at(-1)?.url,showcaseTheme(changed.labelTemplate).studio);
  assert.equal(gallery.length,3);
  assert.equal(restorePublishWork(work,changed),null);
 });
}

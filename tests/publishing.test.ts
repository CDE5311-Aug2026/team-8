import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listingFor,layoutOrder,moveListingSection,publishListing,restoreListing,validOrder,publishingEntry,demoDescription} from '../shared/publishing.ts';
import {demoProducts,demoProfile,productStats} from '../shared/demoDashboard.ts';
import {restoreCatalogue,productStatus} from '../shared/catalogue.ts';

test('publishing uses saved product and farm content without inventing missing stories or photos',()=>{
 const product={...demoProducts[2],story:''},profile={...demoProfile,story:'',photos:[]};const listing=listingFor(product,profile);
 assert.equal(listing.story,'');assert.equal(listing.storyPhoto,null);assert.equal(listing.process,'');assert.deepEqual(listing.processPhotos,[]);
 assert.equal(listing.layout,'Product First');assert.equal(productStatus(product),'Unpublished');
});
test('presets and custom ordering retain every section exactly once and reject invalid saved orders',()=>{
 const original=listingFor(demoProducts[0],demoProfile);assert.equal(layoutOrder('Story First')[0],'story');assert.equal(layoutOrder('Process First')[0],'process');
 const moved=moveListingSection(original,'story',-1);assert.equal(moved.layout,'Custom');assert.deepEqual(moved.order,['product','story','information','process','farmer']);assert.deepEqual(original.order,layoutOrder('Product First'));
 assert.equal(moveListingSection(original,'product',-1),original);assert.equal(validOrder(['story','story','product','information','farmer']),false);assert.equal(restoreListing({...original,order:['story']}),null);
});
test('publishing persists per-product listing edits, preserves product facts and unlocks analytics',()=>{
 const original=demoProducts[2],listing={...listingFor(original,demoProfile),story:'A story for this product only',process:'Harvested by hand',layout:'Story First' as const,order:layoutOrder('Story First')};
 const before=JSON.stringify(demoProfile);const published=publishListing(original,listing);
 assert.equal(original.live,false);assert.equal(productStats(original).views,0);assert.equal(productStatus(published),'Published');assert.ok(productStats(published).views>0);
 assert.equal(published.id,original.id);assert.equal(published.price,original.price);assert.equal(published.brandIdentity,original.brandIdentity);assert.equal(JSON.stringify(demoProfile),before);
 listing.story='Changed after saving';assert.equal(published.listing?.story,'A story for this product only');
 const restored=restoreCatalogue(JSON.parse(JSON.stringify([published])))[0];assert.deepEqual(listingFor(restored,demoProfile),published.listing);
 assert.notEqual(listingFor(demoProducts[1],demoProfile).story,published.listing?.story);
});
test('an unfinished packaging draft or invalid product cannot be published through the listing flow',()=>{
 for(const product of [{...demoProducts[0],packagingComplete:false},{...demoProducts[0],price:''}])assert.throws(()=>publishListing(product,listingFor(product,demoProfile)),/Complete product details/);
});

test('direct preview needs details, description, extra product photos and behind-the-product photos; editing always opens the stepper',()=>{
 const base=demoProducts[2],listing={...listingFor(base,demoProfile),behindPhotos:[{url:'/process.jpg',caption:''}]};
 const complete={...base,description:'Small-batch kaya.',photos:['/extra.jpg'],listing};
 assert.equal(publishingEntry(complete,demoProfile),'preview');assert.equal(publishingEntry(complete,demoProfile,true),'details');
 for(const incomplete of [{...complete,description:''},{...complete,photos:[]},{...complete,listing:{...listing,behindPhotos:[]}},{...complete,price:''}])assert.equal(publishingEntry(incomplete,demoProfile),'details');
});

test('the final photo galleries preserve every image without a count limit on save and reload',()=>{
 const photos=Array.from({length:25},(_,i)=>({url:'/photo-'+i+'.jpg',caption:'Photo '+i}));
 const product={...demoProducts[2],photos:photos.map(p=>p.url)};const listing={...listingFor(product,demoProfile),behindPhotos:photos};
 assert.ok(restoreListing(listing));const saved=publishListing(product,listing);const restored=restoreCatalogue(JSON.parse(JSON.stringify([saved])))[0];
 assert.equal(restored.photos?.length,25);assert.deepEqual(listingFor(restored,demoProfile).behindPhotos,photos);
});

test('legacy story and process imagery migrates into the final behind-the-product section without deleting the source',()=>{
 const original=listingFor(demoProducts[2],demoProfile),legacy={...original,version:undefined,behindPhotos:undefined,storyPhoto:{url:'/farm.jpg',caption:'Farm'},processPhotos:[{url:'/packing.jpg',caption:'Packing'}]};
 const converted=listingFor({...demoProducts[2],listing:legacy},demoProfile);assert.equal(converted.version,2);assert.equal(converted.behindPhotos?.length,2);assert.deepEqual(converted.storyPhoto,legacy.storyPhoto);assert.deepEqual(converted.processPhotos,legacy.processPhotos);
});

test('local writing tools use supplied facts, support tone refinements and preserve saved original/polished versions',()=>{
 const source='Made in small batches. Packed in glass jars.';assert.equal(demoDescription(demoProducts[2],demoProfile,source,'Shorter'),'Made in small batches.');
 const generated=demoDescription(demoProducts[2],demoProfile,'');assert.ok(generated.includes(demoProducts[2].name));assert.ok(generated.includes(demoProfile.farmName));assert.ok(!/organic|certified|freshly|harvested|allergen-free/i.test(generated));
 const listing={...listingFor(demoProducts[2],demoProfile),descriptionOriginal:source,descriptionPolished:demoDescription(demoProducts[2],demoProfile,source,'Warmer'),descriptionVersion:'polished' as const};
 assert.deepEqual(restoreListing(JSON.parse(JSON.stringify(listing))),listing);assert.equal(listing.descriptionOriginal,source);
});

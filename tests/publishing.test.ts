import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listingFor,layoutOrder,moveListingSection,publishListing,restoreListing,validOrder} from '../shared/publishing.ts';
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

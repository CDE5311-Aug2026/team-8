import {test} from 'node:test';
import assert from 'node:assert/strict';
import {currentCatalogueItem,catalogueStatus,restoreCatalogue,upsertCatalogue,sampleOrders,changeSampleOrder,catalogueKey,dailyOrdersKey,type CatalogueItem} from '../shared/dailyV2.ts';
import {workspaceKeys} from '../shared/access.ts';
const item={id:'one',draft:false,product:{name:'Honey',photo:'',live:true}} as CatalogueItem;

test('opening a saved unpublished product preserves its information, packaging and identity',()=>{
 const saved={id:'saved-honey',draft:false,product:{name:'Honey',photo:'/honey.png',live:false,quantity:'250 g',ingredients:'Honey',allergens:'None declared',packagingComplete:true,packagingMode:'3d',brandIdentity:{concept:{name:'My saved design'}}}} as CatalogueItem;
 const current={name:'Honey',photo:'/honey.png',live:false,quantity:undefined,catalogueId:saved.id} as unknown as Parameters<typeof currentCatalogueItem>[0];
 const opened=currentCatalogueItem(current,[saved]);
 assert.equal(opened.id,saved.id);assert.equal(catalogueStatus(opened),'Unpublished');
 assert.equal(opened.product.quantity,'250 g');assert.equal(opened.product.ingredients,'Honey');
 assert.deepEqual(opened.product.brandIdentity,saved.product.brandIdentity);assert.equal(opened.product.packagingMode,'3d');
 assert.equal(catalogueStatus(currentCatalogueItem({...current,packagingComplete:false},[saved])),'Draft');
});
test('catalogue restores valid entries and replaces by identity without overwriting other products',()=>{
 assert.deepEqual(restoreCatalogue([null,{},item]),[item]);
 const second={...item,id:'two'};const changed={...item,product:{...item.product,live:false}};
 assert.deepEqual(upsertCatalogue([item,second],changed),[second,changed]);
 assert.equal(catalogueStatus(item),'Published');assert.equal(catalogueStatus(changed),'Unpublished');assert.equal(catalogueStatus({...item,draft:true}),'Draft');
 assert.ok(workspaceKeys.includes(catalogueKey));assert.ok(!(workspaceKeys as readonly string[]).includes(dailyOrdersKey));
});
test('sample order actions enforce lifecycle transitions and preserve fixtures',()=>{
 const accepted=changeSampleOrder(sampleOrders,'#1042','Preparing');assert.equal(accepted[0].status,'Preparing');assert.equal(sampleOrders[0].status,'New');
 assert.deepEqual(changeSampleOrder(sampleOrders,'#1042','Delivered'),sampleOrders);
 const delivered=changeSampleOrder(changeSampleOrder(accepted,'#1042','Ready'),'#1042','Delivered');assert.equal(delivered[0].status,'Delivered');assert.deepEqual(changeSampleOrder(delivered,'#1042','New'),delivered);
 assert.equal(changeSampleOrder(sampleOrders,'#1041','Cancelled')[1].status,'Cancelled');
});

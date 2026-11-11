import {test} from 'node:test';
import assert from 'node:assert/strict';
import {currentCatalogueItem,catalogueStatus,restoreCatalogue,upsertCatalogue,migrateCatalogue,findDraftTwin,sampleOrders,changeSampleOrder,catalogueKey,dailyOrdersKey,type CatalogueItem} from '../shared/dailyV2.ts';
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
 // An edited product keeps its place (opening or saving it must not reorder Home and Products); a new one goes last.
 assert.deepEqual(upsertCatalogue([item,second],changed),[changed,second]);
 const third={...item,id:'three'};assert.deepEqual(upsertCatalogue([item,second],third),[item,second,third]);
 assert.equal(catalogueStatus(item),'Published');assert.equal(catalogueStatus(changed),'Unpublished');assert.equal(catalogueStatus({...item,draft:true}),'Draft');
 assert.ok(workspaceKeys.includes(catalogueKey));assert.ok(!(workspaceKeys as readonly string[]).includes(dailyOrdersKey));
});
test('sample order actions enforce lifecycle transitions and preserve fixtures',()=>{
 const accepted=changeSampleOrder(sampleOrders,'#1042','Preparing');assert.equal(accepted[0].status,'Preparing');assert.equal(sampleOrders[0].status,'New');
 assert.deepEqual(changeSampleOrder(sampleOrders,'#1042','Delivered'),sampleOrders);
 const delivered=changeSampleOrder(changeSampleOrder(accepted,'#1042','Ready'),'#1042','Delivered');assert.equal(delivered[0].status,'Delivered');assert.deepEqual(changeSampleOrder(delivered,'#1042','New'),delivered);
 assert.equal(changeSampleOrder(sampleOrders,'#1041','Cancelled')[1].status,'Cancelled');
});
test('the first read of the catalogue brings over every saved product, not only the one being edited',()=>{
 const legacy=[{id:'demo-honey',name:'Honey',photo:'',live:true},{id:'demo-jam',name:'Jam',photo:'',live:false,packagingComplete:false}] as unknown as Parameters<typeof migrateCatalogue>[1];
 const first=migrateCatalogue(null,legacy);
 assert.deepEqual(first.items.map(i=>[i.id,i.draft]),[['demo-honey',false],['demo-jam',true]]);assert.equal(first.migrated,true);
 const later=migrateCatalogue([item],legacy);
 assert.deepEqual(later.items,[item]);assert.equal(later.migrated,false);
});
test('adding a product named like a draft finishes that draft',()=>{
 const draft={id:'demo-jam',draft:true,product:{name:'Mango Jam',photo:'',live:false}} as CatalogueItem;
 assert.equal(findDraftTwin([item,draft],' mango jam ')?.id,'demo-jam');
 assert.equal(findDraftTwin([item,draft],'Honey'),undefined);assert.equal(findDraftTwin([draft],''),undefined);
});

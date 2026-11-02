import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogueStatus,restoreCatalogue,upsertCatalogue,sampleOrders,changeSampleOrder,catalogueKey,dailyOrdersKey,type CatalogueItem} from '../shared/dailyV2.ts';
import {workspaceKeys} from '../shared/access.ts';
const item={id:'one',draft:false,product:{name:'Honey',photo:'',live:true}} as CatalogueItem;
test('catalogue restores valid entries and replaces by identity without overwriting other products',()=>{
 assert.deepEqual(restoreCatalogue([null,{},item]),[item]);
 const second={...item,id:'two'};const changed={...item,product:{...item.product,live:false}};
 assert.deepEqual(upsertCatalogue([item,second],changed),[second,changed]);
 assert.equal(catalogueStatus(item),'Published');assert.equal(catalogueStatus(changed),'Unpublished');assert.equal(catalogueStatus({...item,draft:true}),'Draft');
 assert.ok(workspaceKeys.includes(catalogueKey));assert.ok(!(workspaceKeys as readonly string[]).includes(dailyOrdersKey));
});
test('sample order actions enforce lifecycle transitions and preserve fixtures',()=>{
 const accepted=changeSampleOrder(sampleOrders,'#1042','Preparing');assert.equal(accepted[0].status,'Preparing');assert.equal(sampleOrders[0].status,'New');
 assert.deepEqual(changeSampleOrder(sampleOrders,'#1042','Completed'),sampleOrders);
 const delivered=changeSampleOrder(changeSampleOrder(accepted,'#1042','On the way'),'#1042','Completed');assert.equal(delivered[0].status,'Completed');assert.deepEqual(changeSampleOrder(delivered,'#1042','New'),delivered);
 assert.equal(changeSampleOrder(sampleOrders,'#1041','Cancelled')[1].status,'Cancelled');
});

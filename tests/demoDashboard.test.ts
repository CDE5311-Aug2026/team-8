import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoProducts,demoProfile,demoWorkspace,dashboardStats,nextActions} from '../shared/demoDashboard.ts';
import {restoreCatalogue,upsertProduct,type CatalogueProduct} from '../shared/catalogue.ts';
import {canAddProduct} from '../shared/branding.ts';
import {workspaceKeys,workspaceKey} from '../shared/access.ts';
test('empty guests have no products, sales, customers, reviews or fabricated insights',()=>{
 const products=restoreCatalogue(null),d=dashboardStats(products);
 assert.equal(products.length,0);for(const key of ['orders','sales','customers','reviews','followers','views','lifetime'] as const)assert.equal(d[key],0);
 assert.equal(d.strongest,undefined);assert.equal(nextActions([],false,false,false).some(a=>a.source==='insight'),false);
});
test('explicit demo fixture supplies four valid products and the Figma dashboard totals',()=>{
 const workspace=demoWorkspace(),products=restoreCatalogue(JSON.parse(workspace['farmily-products']));
 assert.equal(products.length,4);assert.ok(products.every(p=>canAddProduct(demoProfile,p.brandIdentity||null)));
 const d=dashboardStats(products);assert.equal(d.sales,1860);assert.equal(d.orders,72);assert.equal(d.lifetime,12480);assert.equal(d.customers,64);assert.equal(d.reviews,48);
 assert.notEqual(workspaceKey('farmily-products','demo-farmer'),workspaceKey('farmily-products',null));
 assert.ok(workspaceKeys.includes('farmily-products'));assert.ok(workspaceKeys.includes('farmily-demo-promotions'));
});
test('catalogue preserves multiple products, edits and legacy single-product workspaces',()=>{
 const legacy=restoreCatalogue(null,demoProducts[0]);assert.equal(legacy.length,1);
 const second={...demoProducts[1],id:'new-product'};
 const list=upsertProduct(legacy,second);assert.equal(list.length,2);
 const edited=upsertProduct(list,{...second,name:'Updated tea',live:false});assert.equal(edited.length,2);assert.equal(edited[1].name,'Updated tea');
 assert.deepEqual(restoreCatalogue(JSON.parse(JSON.stringify(edited))),edited);
 assert.deepEqual(restoreCatalogue([],{...demoProducts[0]}),[]);
 assert.equal(restoreCatalogue([demoProducts[0],demoProducts[0],{name:'Broken'}]).length,1);
});
test('a published product gets stable simulated analytics across reloads and periods',()=>{
 const product:CatalogueProduct={...demoProducts[0],id:'new-farm-tomatoes',name:'Fresh tomatoes'};
 const before=dashboardStats([]),after=dashboardStats([product]);assert.ok(after.sales>before.sales);assert.ok(after.customers>0);assert.ok(after.reviews>0);
 assert.deepEqual(dashboardStats(restoreCatalogue(JSON.parse(JSON.stringify([product])))),after);
 assert.ok(dashboardStats([product],7).sales<after.sales);assert.ok(dashboardStats([product],90).sales>after.sales);
 assert.equal(dashboardStats([product],7).lifetime,after.lifetime);
 const promoted=dashboardStats([product],30,[product.id]);assert.ok(promoted.views>after.views);assert.ok(promoted.sales>after.sales);
});
test('next steps track publishing, branding, photos and already applied promotions',()=>{
 const actions=nextActions(demoProducts,true,true,false);assert.equal(actions.length,5);assert.equal(actions.find(a=>a.id==='finish')?.productId,'demo-jam');
 const published=demoProducts.map(p=>({...p,live:true,packagingComplete:true}));const next=nextActions(published,true,true,true,['demo-tea']);
 assert.equal(next.some(a=>a.kind==='publish'||a.kind==='profile'||a.kind==='promote'),false);
 assert.ok(nextActions([],true,true,false).some(a=>a.kind==='add'));
});

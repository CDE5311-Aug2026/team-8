import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productStatus} from '../shared/catalogue.ts';
import {demoProducts,dashboardStats,nextActions,simulatedReviews} from '../shared/demoDashboard.ts';
import {initialOrders,changeOrderStatus,canTransitionOrder,restoreOrders} from '../shared/orders.ts';
import {jpegPdf,storedZip} from '../shared/demoExports.ts';
import {saveLocalCredentials,authenticateLocal,removeLocalAccount,localAccounts} from '../src/localAccounts.ts';
import {editDesign,rebrandProducts,type BrandDesign} from '../shared/brandLibrary.ts';
import {demoProfile} from '../shared/demoDashboard.ts';

test('product lifecycle distinguishes unfinished packaging, unpublished and published products',()=>{
 const p=demoProducts[0];assert.equal(productStatus({...p,live:false,packagingComplete:false}),'Draft');assert.equal(productStatus({...p,live:false,packagingComplete:true}),'Unpublished');assert.equal(productStatus({...p,live:true,packagingComplete:true}),'Published');
 assert.equal(productStatus({...p,live:true,packagingComplete:false}),'Draft');
});
test('only published products supply analytics, customer reviews and AI performance recommendations',()=>{
 const unpublished={...demoProducts[0],live:false};for(const packagingComplete of [false,true]){const products=[{...unpublished,packagingComplete}],d=dashboardStats(products);assert.equal(d.sales,0);assert.equal(d.views,0);assert.equal(d.customers,0);assert.equal(d.reviews,0);assert.equal(d.populated,false);assert.equal(nextActions(products,true,true,true).some(a=>a.source==='insight'),false);}
 const published=dashboardStats([{...unpublished,live:true}]);assert.ok(published.sales>0);assert.ok(published.reviews>0);
 const detailed=dashboardStats([demoProducts[0]],30,[],true);assert.equal(detailed.orders,38);assert.equal(detailed.sales,532);assert.equal(detailed.lifetime,3640);assert.equal(detailed.rating,4.8);assert.equal(detailed.positive,96);
 const feedback=simulatedReviews([demoProducts[0]],detailed.reviews,true);assert.equal(Math.round(feedback.reduce((n,r)=>n+r.rating,0)/feedback.length*10)/10,detailed.rating);
});
test('orders accept, decline and progress through fulfilment without reopening terminal states',()=>{
 const orders=initialOrders(demoProducts);assert.equal(orders.length,7);const fresh=orders.find(o=>o.status==='New Order')!;
 const accepted=changeOrderStatus(fresh,'Preparing');const dispatched=changeOrderStatus(accepted,'On the Way');const completed=changeOrderStatus(dispatched,'Completed');assert.equal(completed.status,'Completed');assert.equal(changeOrderStatus(fresh,'Cancelled').status,'Cancelled');
 assert.throws(()=>changeOrderStatus(fresh,'Completed'));assert.equal(canTransitionOrder('Cancelled','Preparing'),false);assert.equal(canTransitionOrder('Completed','New Order'),false);
 assert.deepEqual(restoreOrders(JSON.parse(JSON.stringify(orders))),orders);assert.deepEqual(restoreOrders([{id:'broken',status:'paid'}]),[]);assert.deepEqual(initialOrders([]),[]);
});
test('editing a brand preserves the saved design ID and updates only its linked product packaging',()=>{
 const previous=demoProducts[0].brandIdentity!,next={...previous,concept:{...previous.concept,colors:['#123456','#fffdf0','#cfa255']}};
 const saved:BrandDesign={id:'saved-brand',savedAt:null,brand:previous,profile:demoProfile};const designs=editDesign([saved],previous,next,demoProfile);assert.equal(designs.length,1);assert.equal(designs[0].id,'saved-brand');assert.deepEqual(designs[0].brand,next);
 const unrelated={...demoProducts[1],id:'other-design',brandIdentity:{...previous,concept:{...previous.concept,id:'another-brand'}}};const products=[demoProducts[0],unrelated];const changed=rebrandProducts(products,previous,next);assert.deepEqual(changed[0].brandIdentity,next);assert.equal(changed[0].live,products[0].live);assert.equal(changed[0].price,products[0].price);assert.equal(changed[1],unrelated);assert.deepEqual(products[0].brandIdentity,previous);
});
test('demo packaging exports contain a valid PDF object table and a three-file ZIP directory',()=>{
 const pdf=jpegPdf(new Uint8Array([255,216,255,217]),960,720);const text=new TextDecoder().decode(pdf);assert.ok(text.startsWith('%PDF-1.4'));assert.ok(text.includes('/Subtype /Image'));assert.ok(text.endsWith('%%EOF'));const xref=Number(text.match(/startxref\n(\d+)/)?.[1]);assert.equal(new TextDecoder().decode(pdf.slice(xref,xref+4)),'xref');
 const zip=storedZip([{name:'demo.pdf',bytes:pdf},{name:'demo.svg',bytes:new TextEncoder().encode('<svg/>')},{name:'demo.png',bytes:new Uint8Array([137,80,78,71])}]);const view=new DataView(zip.buffer);assert.equal(view.getUint32(0,true),0x04034b50);assert.equal(view.getUint32(zip.length-22,true),0x06054b50);assert.equal(view.getUint16(zip.length-12,true),3);const central=view.getUint32(zip.length-6,true);assert.equal(view.getUint32(central,true),0x02014b50);
});
test('local demo account edits change subsequent sign-in without storing clear-text passwords',async()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),storage=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>storage.get(key)||null,setItem:(key:string,value:string)=>storage.set(key,value)}});
 try{await saveLocalCredentials('demo-test-account','one@example.com','secret123');assert.ok(await authenticateLocal('one@example.com','secret123'));await saveLocalCredentials('demo-test-account','two@example.com','changed123');assert.equal(await authenticateLocal('one@example.com','secret123'),null);assert.equal(await authenticateLocal('two@example.com','secret123'),null);assert.equal((await authenticateLocal('two@example.com','changed123'))?.id,'demo-test-account');assert.equal(JSON.stringify(localAccounts()).includes('changed123'),false);await assert.rejects(saveLocalCredentials('demo-other','two@example.com','another123'));removeLocalAccount('demo-test-account');assert.equal(await authenticateLocal('two@example.com','changed123'),null);}finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');}
});

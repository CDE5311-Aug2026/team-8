import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleOrders,restoreSampleOrders,changeSampleOrder} from '../shared/dailyV2.ts';
import {certificateExpiry,certificateNotices,certificateNoticesKey,certificateStatus,orderDetails,profileCertificates,restoreRestockMessages,restockMessagesKey,restockText,shopperCertificates,validCertificateEntry,type CertificateEntry} from '../shared/dailyRefined.ts';
import {sampleProfile,validProfile} from '../shared/branding.ts';
import {newFarmCertificate} from '../shared/farmCredentials.ts';
import {workspaceKey,workspaceKeys} from '../shared/access.ts';
const certificate={...newFarmCertificate('organic',{name:'certificate.pdf',type:'application/pdf',size:14,dataUrl:'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y='}),issuedBy:'Demo issuer',number:'DEMO-1',validUntil:'2027-03-14'};
const approved:CertificateEntry={id:'one',title:'Organic',certificate,review:'approved',sample:true};
test('new order lifecycle migrates older statuses and retains every saved transition',()=>{
 const restored=restoreSampleOrders([{id:'#1042',status:'On the way'},{id:'#1041',status:'Completed'}]);assert.equal(restored[0].status,'Ready');assert.equal(restored[1].status,'Delivered');assert.equal(restored.length,sampleOrders.length);assert.equal(restored[0].customer,'Minh T.');
 assert.equal(restoreSampleOrders([{id:'#1042',status:'invalid'}])[0].status,'New');
 const prepared=changeSampleOrder(sampleOrders,'#1042','Preparing');assert.equal(changeSampleOrder(prepared,'#1042','Delivered')[0].status,'Preparing');const ready=changeSampleOrder(prepared,'#1042','Ready');const delivered=changeSampleOrder(ready,'#1042','Delivered');assert.equal(delivered[0].status,'Delivered');assert.equal(restoreSampleOrders(delivered)[0].status,'Delivered');
});
test('order details reconcile line items, welcome discount and farmer proceeds',()=>{
 const order=sampleOrders[0],detail=orderDetails(order);assert.equal(detail.items.length,2);assert.equal(detail.address,'Toa Payoh');assert.equal(detail.shopping,'First order');
 const total=detail.items.reduce((sum,item)=>sum+Math.round(Number(item.price)*100),0);assert.equal(total,2150);assert.equal(total-Math.round(Number(detail.discount)*100),Math.round(Number(order.total)*100));
 const other=orderDetails(sampleOrders[1]);assert.equal(other.address,'Jurong');assert.equal(other.shopping,'Not provided');assert.equal(other.subtotal,sampleOrders[1].total);
});
test('certificate migration keeps onboarding uploads and multiple local entries without claiming real verification',()=>{
 const legacy={...sampleProfile,certificate};assert.equal(profileCertificates(legacy)[0].certificate,certificate);
 assert.ok(validCertificateEntry({...approved,review:'pending',sample:false}));assert.ok(!validCertificateEntry({...approved,sample:false}));
 assert.doesNotThrow(()=>validProfile({...sampleProfile,certificates:[approved]}));assert.throws(()=>validProfile({...sampleProfile,certificates:[approved,approved]}));
 const pending:CertificateEntry={...approved,review:'pending',sample:false};assert.equal(certificateStatus(pending),'In review');assert.deepEqual(shopperCertificates([approved,pending]),[]);
});
test('certificate expiry and thirty-day reminders use the Singapore end of day and hide expired proof immediately',()=>{
 const expires=certificateExpiry(certificate.validUntil)!;assert.equal(new Date(expires).toISOString(),'2027-03-14T15:59:59.999Z');assert.equal(certificateExpiry('14 March 2027'),expires);assert.equal(certificateExpiry('14 Mar 2027'),expires);assert.equal(certificateExpiry('2027-02-31'),null);assert.equal(certificateExpiry('Not readable'),null);
 assert.equal(certificateStatus(approved,expires-31*86400000),'Verified');assert.equal(certificateStatus(approved,expires-30*86400000),'Expires soon');assert.equal(certificateStatus(approved,expires),'Expired');
 assert.equal(shopperCertificates([approved],expires-1,true).length,1);assert.equal(shopperCertificates([approved],expires,true).length,0);
 const reminder=certificateNotices([approved],expires-30*86400000)[0];assert.match(reminder.title,/expires soon/);assert.match(certificateNotices([approved],expires)[0].message,/hidden from shoppers/);
 const rejected={...approved,review:'not-approved' as const,reason:'Upload a clearer photo.'};assert.match(certificateNotices([rejected],expires-60*86400000)[0].message,/clearer photo/);assert.deepEqual(shopperCertificates([rejected],expires-60*86400000,true),[]);
});
test('message drafts and certificate read state are account scoped and malformed records do not restore',()=>{
 for(const key of [restockMessagesKey,certificateNoticesKey]){assert.ok((workspaceKeys as readonly string[]).includes(key));assert.notEqual(workspaceKey(key,'farmer-a'),workspaceKey(key,'farmer-b'));}
 const draft={productId:'product-1',text:'My editable message',sentAt:'2026-11-03T09:00:00Z'};assert.deepEqual(restoreRestockMessages([null,{},draft,{...draft,sentAt:'bad'},{...draft,text:3}]),[draft]);
 const message=restockText('My honey','Raw honey from our hives.');assert.match(message,/My honey/);assert.ok(!/8 jars|18 people|this week/.test(message));
});

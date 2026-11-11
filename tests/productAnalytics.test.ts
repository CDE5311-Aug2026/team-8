import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productAnalytics} from '../shared/productAnalytics.ts';
import {salesSummaries} from '../shared/salesSummary.ts';
test('each preset product has its own analytics that agree with Your sales',()=>{
 const honey=productAnalytics('demo-honey')!,tea=productAnalytics('demo-tea')!;
 assert.notDeepEqual(honey,tea);
 for(const [id,a] of [['demo-honey',honey],['demo-tea',tea]] as const){
  const month=salesSummaries['30d'].products.find(p=>p.id===id)!;
  assert.equal(a.sold,month.sold);assert.equal(a.amount,month.amount);
  assert.ok(a.lifetime>=salesSummaries['3m'].products.find(p=>p.id===id)!.amount,'lifetime covers the shorter periods');
  assert.ok(a.orders<=a.sold&&a.buyers<=a.orders&&a.newBuyers+a.repeat===a.buyers);
  assert.equal(a.regions.reduce((s,[,n])=>s+n,0),100);
 }
 assert.equal(honey.reviews,21);assert.equal(tea.reviews,109);
});
test('products without sales history show no invented numbers',()=>{
 assert.equal(productAnalytics('demo-kaya'),null);assert.equal(productAnalytics('a-new-product'),null);assert.equal(productAnalytics(undefined),null);
});

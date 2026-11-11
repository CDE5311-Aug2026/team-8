import {test} from 'node:test';
import assert from 'node:assert/strict';
import {offerSalesScenario} from '../shared/opportunityBenefit.ts';
import {newTrial} from '../shared/briefV2.ts';

test('taster controls change sales capacity and stock without inventing demand',()=>{
 const trial=newTrial('taster'),initial=offerSalesScenario(trial);
 assert.equal(initial.totalSales,50);assert.equal(initial.gap,9);
 assert.deepEqual(initial.stockNeeded,{amount:1000,unit:'g'});
 const smaller=offerSalesScenario({...trial,size:'50 g'});
 assert.equal(smaller.totalSales,50);assert.deepEqual(smaller.stockNeeded,{amount:500,unit:'g'});
 const changed=offerSalesScenario({...trial,price:4,jars:12});
 assert.equal(changed.totalSales,48);assert.equal(changed.gap,10);
 assert.deepEqual(changed.stockNeeded,{amount:1200,unit:'g'});
});
test('bundle quantity, price and selected products show the sale and discount tradeoff',()=>{
 const trial=newTrial('bundle'),initial=offerSalesScenario(trial);
 assert.equal(initial.totalSales,179);assert.equal(initial.separate,20);assert.equal(initial.gap,2.1);assert.equal(initial.discountGiven,21);
 const changed=offerSalesScenario({...trial,price:16,jars:20});
 assert.equal(changed.totalSales,320);assert.equal(changed.discountGiven,80);
 assert.equal(offerSalesScenario({...trial,products:['tea','honey','kaya']}).separate,29.5);
});
test('delivery controls show minimum qualifying sales and foregone delivery fees',()=>{
 const trial=newTrial('delivery'),initial=offerSalesScenario(trial);
 assert.equal(initial.orders,20);assert.equal(initial.totalSales,400);assert.equal(initial.feesWaived,80);
 const changed=offerSalesScenario({...trial,price:25,weeks:4});
 assert.equal(changed.orders,40);assert.equal(changed.totalSales,1000);assert.equal(changed.feesWaived,160);
 assert.equal(offerSalesScenario({...trial,price:25,weeks:4,jars:6}).totalSales,600);
});
test('incomplete inputs show an empty result instead of invalid sales figures',()=>{
 assert.equal(offerSalesScenario({...newTrial('taster'),price:NaN}).totalSales,null);
 assert.equal(offerSalesScenario({...newTrial('taster'),jars:0}).totalSales,null);
 assert.equal(offerSalesScenario({...newTrial('delivery'),weeks:0}).totalSales,null);
 assert.equal(offerSalesScenario({...newTrial('taster'),size:'custom'}).stockNeeded,null);
});

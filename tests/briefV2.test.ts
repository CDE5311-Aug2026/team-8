import {test} from 'node:test';
import assert from 'node:assert/strict';
import {briefKey,newBrief,newTrial,restoreBrief,saveBriefTrial,nextBrief} from '../shared/briefV2.ts';
import {workspaceKeys} from '../shared/access.ts';
test('Brief workflows preserve drafts, independent offers and lifecycle status through restoration',()=>{
 const initial=newBrief();const bundle=newTrial('bundle');const saved=saveBriefTrial(initial,bundle);assert.equal(initial.trials.length,0);assert.equal(saved.trials[0].status,'draft');
 const live=saveBriefTrial(saved,{...bundle,status:'live',startedAt:100});const taster=saveBriefTrial(live,{...newTrial('taster'),size:'80 g',jars:12});const paused=saveBriefTrial(taster,{...bundle,status:'paused',startedAt:100});assert.equal(paused.trials.length,2);assert.equal(paused.trials.find(t=>t.kind==='taster')?.jars,12);assert.deepEqual(restoreBrief(JSON.parse(JSON.stringify(paused))),paused);assert.ok(workspaceKeys.includes(briefKey));
});
test('Brief rejects invalid products, quantities and prices without mutating the saved state',()=>{
 const original=newBrief();for(const bad of [{price:0},{price:NaN},{products:['honey']},{products:['honey','honey']},{jars:-1},{weeks:0}])assert.throws(()=>saveBriefTrial(original,{...newTrial('bundle'),...bad}));assert.equal(original.trials.length,0);assert.deepEqual(restoreBrief({version:1,index:99,skipped:[],trials:[]}),newBrief());assert.deepEqual(restoreBrief({...newBrief(),trials:[null]}),newBrief());
});
test('Brief advances past skipped or active experiments and reaches completion',()=>{
 assert.equal(nextBrief({...newBrief(),skipped:['taster']}),2);assert.equal(nextBrief({...newBrief(),index:2}),3);assert.equal(nextBrief(saveBriefTrial(newBrief(),{...newTrial('taster'),status:'live'})),2);
});

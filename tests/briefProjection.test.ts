import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultProjectionPlan,restoreProjectionPlan,salesProjection,projectionKey} from '../shared/briefProjection.ts';
import {workspaceKeys} from '../shared/access.ts';
test('sales scenarios separate observed sales, baseline and projected uplift',()=>{
 const plan=defaultProjectionPlan(),result=salesProjection(plan,true);
 assert.equal(result.observed,1860);assert.equal(result.baselineTotal,2160);
 assert.equal(result.projectedTotal,2527.2);assert.equal(result.improvement,367.2);
 const withoutBundle=salesProjection({...plan,selected:['taster','delivery']},true);
 assert.equal(withoutBundle.projectedTotal,2354.4);
 assert.equal(salesProjection({...plan,selected:[]},true).improvement,0);
 assert.equal(salesProjection({...plan,uplifts:{...plan.uplifts,bundle:10}},true).projectedTotal,2570.4);
 assert.deepEqual(result.history,withoutBundle.history);
});
test('scenario settings restore safely and never duplicate an opportunity',()=>{
 const plan=defaultProjectionPlan();
 for(const invalid of [null,{}, {...plan,selected:['unknown']},{...plan,uplifts:{...plan.uplifts,bundle:Infinity}},{...plan,uplifts:{...plan.uplifts,taster:-1}},{...plan,uplifts:{...plan.uplifts,delivery:31}}])assert.deepEqual(restoreProjectionPlan(invalid),plan);
 const restored=restoreProjectionPlan({...plan,selected:['bundle','bundle']});
 assert.deepEqual(restored.selected,['bundle']);assert.equal(salesProjection(restored,true).improvement,172.8);
 assert.ok((workspaceKeys as readonly string[]).includes(projectionKey));
});
test('an empty workspace does not fabricate sales or a projected uplift',()=>{
 const result=salesProjection(defaultProjectionPlan(),false);
 assert.equal(result.observed,0);assert.equal(result.baselineTotal,0);assert.equal(result.projectedTotal,0);assert.equal(result.improvement,0);assert.equal(result.lift,0);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newShorts,restoreShorts,nextShort,shortsKey} from '../shared/shortsV2.ts';
import {workspaceKeys} from '../shared/access.ts';
test('Shorts navigation skips dismissed ideas and reaches completion without revisiting dismissed ideas',()=>{
 assert.equal(nextShort(0,1,[1]),2);assert.equal(nextShort(2,1,[]),3);assert.equal(nextShort(3,-1,[2]),1);assert.equal(nextShort(1,-1,[0]),1);assert.equal(nextShort(3,-1,[0,1,2]),3);
});
test('Shorts restores position, dismissal undo and editable drafts within the account workspace',()=>{
 const saved={...newShorts(),index:2,dismissed:[0],lastDismissed:0,drafts:{1:{name:'Photo plan',detail:'Use daylight.',price:''}}};assert.deepEqual(restoreShorts(JSON.parse(JSON.stringify(saved))),saved);assert.deepEqual(restoreShorts({index:77}),newShorts());assert.deepEqual(restoreShorts({...saved,drafts:{1:{name:42}}}).drafts,{});assert.ok(workspaceKeys.includes(shortsKey));
});

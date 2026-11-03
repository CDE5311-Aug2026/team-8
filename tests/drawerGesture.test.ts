import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawerDragIntent,dismissDrawerDrag} from '../shared/drawerGesture.ts';
test('drawer dismissal ignores taps, horizontal gestures and upward scrolling',()=>{
 assert.equal(drawerDragIntent(2,3),'pending');assert.equal(drawerDragIntent(70,12),'ignore');assert.equal(drawerDragIntent(0,-80),'ignore');assert.equal(drawerDragIntent(4,80),'down');
 assert.ok(!dismissDrawerDrag(12,10,320));assert.ok(!dismissDrawerDrag(50,500,700));assert.ok(dismissDrawerDrag(170,500,700));assert.ok(dismissDrawerDrag(50,50,700));
});

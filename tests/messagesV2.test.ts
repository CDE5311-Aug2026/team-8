import {test} from 'node:test';
import assert from 'node:assert/strict';
import {restoreMessages,messagesKey} from '../shared/messagesV2.ts';
import {workspaceKeys,workspaceKey} from '../shared/access.ts';
test('message replies and explicitly taught guidelines restore within the account workspace',()=>{const saved={replies:{Minh:["Yes, I'll set 5 kg aside for Saturday"]},rules:{Minh:'Bulk orders up to 5 kg'}};assert.deepEqual(restoreMessages(JSON.parse(JSON.stringify(saved))),saved);assert.ok(workspaceKeys.includes(messagesKey));assert.notEqual(workspaceKey(messagesKey,'one'),workspaceKey(messagesKey,'two'));});
test('message restoration excludes malformed messages and unknown contacts',()=>{assert.deepEqual(restoreMessages(null),{replies:{},rules:{}});assert.deepEqual(restoreMessages({replies:{Minh:[42],Unknown:['hello']},rules:{Minh:99}}),{replies:{},rules:{}});});

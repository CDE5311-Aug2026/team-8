import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canGenerateBranding,canPublish,workspaceKey} from '../shared/access.ts';

test('a guest or a local profile never grants publishing permission',()=>{
 assert.equal(canPublish(null),false);assert.equal(canPublish({id:'',email:'someone@example.com'}),false);
 assert.equal(canPublish({id:'verified-user',email:'someone@example.com'}),true);
 assert.equal(canGenerateBranding(null),false);assert.equal(canGenerateBranding({id:'verified-user',email:'someone@example.com'}),true);
});
test('guest workspace and different signed-in accounts use separate storage keys',()=>{
 const guest=workspaceKey('farmily-profile',null),a=workspaceKey('farmily-profile','account-a'),b=workspaceKey('farmily-profile','account-b');
 assert.equal(guest,'farmily-profile');assert.notEqual(a,guest);assert.notEqual(a,b);
});

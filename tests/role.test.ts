import {test} from 'node:test';
import assert from 'node:assert/strict';
import {entryStep,initialRole,parseRole} from '../shared/role.ts';

test('first-time or invalid role values require a choice; saved choices preserve farmer or customer intent',()=>{
 assert.equal(parseRole(null),null);assert.equal(parseRole(''),null);assert.equal(parseRole('admin'),null);
 assert.equal(parseRole('farmer'),'farmer');assert.equal(parseRole('customer'),'customer');
});
test('new visitors can explore from welcome without an account; returning users resume their activity',()=>{
 assert.equal(entryStep(false,false,null),'welcome');
 assert.equal(entryStep(false,false,'farmer'),'welcome');
 assert.equal(entryStep(false,true,null),'welcome');
 assert.equal(entryStep(true,false,'farmer'),'farmer');
 assert.equal(entryStep(true,false,'customer'),'customer');
 assert.equal(entryStep(true,false,null),'welcome');
});
test('returning farmers resume their existing profile; new visitors must choose first',()=>{
 assert.equal(initialRole(null,false),null);
 assert.equal(initialRole(null,true),'farmer');
 assert.equal(initialRole('farmer',false),'farmer');
 assert.equal(initialRole('customer',true),'customer');
});

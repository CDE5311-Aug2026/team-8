import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoAccount,matchesDemoAccount} from '../shared/demoAccount.ts';
import {canPublish,canGenerateBranding,workspaceKey} from '../shared/access.ts';
test('demo sign-in accepts only the public prototype credentials',()=>{assert.equal(matchesDemoAccount(' FARMER@example.com ','123456'),true);assert.equal(matchesDemoAccount('farmer@example.com','wrong'),false);assert.equal(matchesDemoAccount('other@example.com','123456'),false);});
test('demo identity never grants real service access and has its own workspace',()=>{assert.equal(canPublish(demoAccount),false);assert.equal(canGenerateBranding(demoAccount),false);assert.notEqual(workspaceKey('farmily-profile',demoAccount.id),workspaceKey('farmily-profile',null));});

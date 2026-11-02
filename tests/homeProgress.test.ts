import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupWasCompleted,setupCompleteKey} from '../shared/homeProgress.ts';
import {workspaceKeys} from '../shared/access.ts';
import type {CatalogueItem} from '../shared/dailyV2.ts';

test('completed Home follows the workspace even when an unpublished product is opened',()=>{
 const published={id:'published',draft:false,product:{live:true}} as CatalogueItem;
 assert.equal(setupWasCompleted(false,{live:false},[published]),true);
 assert.equal(setupWasCompleted(false,{live:false},[],[{live:true}]),true);
 assert.equal(setupWasCompleted(false,{live:true},[]),true);
 assert.equal(setupWasCompleted(false,{live:false},[]),false);
 assert.equal(setupWasCompleted(false,null,[{...published,draft:true}]),false);
 assert.equal(setupWasCompleted(true,{live:false},[]),true);
 assert.equal(setupWasCompleted(true,null,[]),true);
 assert.ok((workspaceKeys as readonly string[]).includes(setupCompleteKey));
});

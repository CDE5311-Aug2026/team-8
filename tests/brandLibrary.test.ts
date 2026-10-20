import test from 'node:test';
import assert from 'node:assert/strict';
import {keepDesign,restoreDesigns,brandLibraryKey} from '../shared/brandLibrary.ts';
import {existingBrand} from '../shared/brandFlow.ts';
import {sampleProfile} from '../shared/branding.ts';
import {workspaceKeys,workspaceKey} from '../shared/access.ts';

test('saving another identity preserves previous designs and their original farm details',()=>{
 const profile=structuredClone(sampleProfile);
 const first=existingBrand(profile);
 const migrated=keepDesign([],first,profile,null);
 const updated={...profile,farmName:'New farm name'};
 const next=existingBrand(updated);
 const library=keepDesign(migrated,next,updated,'2026-10-21T00:00:00.000Z');
 profile.farmName='Changed after saving';
 assert.equal(library.length,2);
 assert.equal(library[0].profile.farmName,'New farm name');
 assert.equal(library[1].profile.farmName,sampleProfile.farmName);
 assert.deepEqual(library[1].brand,first);
 assert.equal(library[1].savedAt,null);
 assert.equal(keepDesign(library,next,updated),library);
 assert.deepEqual(restoreDesigns(JSON.parse(JSON.stringify(library))),library);
});

test('invalid entries are excluded and saved designs participate in account workspace isolation',()=>{
 const valid=keepDesign([],existingBrand(sampleProfile),sampleProfile)[0];
 assert.deepEqual(restoreDesigns([null,{},valid,{...valid,brand:{}},{...valid,savedAt:'invalid'}]),[valid]);
 assert.ok(workspaceKeys.includes(brandLibraryKey));
 assert.notEqual(workspaceKey(brandLibraryKey,null),workspaceKey(brandLibraryKey,'account-one'));
 assert.notEqual(workspaceKey(brandLibraryKey,'account-one'),workspaceKey(brandLibraryKey,'account-two'));
});

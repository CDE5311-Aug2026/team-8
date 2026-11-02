import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guestTransferAction,hasProgress} from '../shared/workspace.ts';

test('choosing a role alone is not guest progress to transfer',()=>{
 assert.equal(hasProgress({'farmily-role':'farmer','farmily-onboarding-skipped':'true'}),false);
 assert.equal(guestTransferAction({'farmily-profile':'saved'},{'farmily-role':'farmer'}),'account');
});
test('a new or empty account automatically receives guest profile and drafts',()=>{
 const guest={'farmily-profile':'new farm','farmily-draft':'new product'};
 assert.equal(guestTransferAction({},guest),'guest');
 assert.equal(guestTransferAction({'farmily-role':'customer'},guest),'guest');
 assert.equal(guestTransferAction({},{}),'account');
});
test('different existing progress requires a choice without changing either version',()=>{
 const account=Object.freeze({'farmily-profile':'existing farm','farmily-brand':'saved brand'});
 const guest=Object.freeze({'farmily-profile':'guest farm'});
 assert.equal(guestTransferAction(account,guest),'conflict');
 assert.equal(account['farmily-profile'],'existing farm');
 assert.equal(guest['farmily-profile'],'guest farm');
});
test('identical data does not prompt, while differing product or brand drafts do',()=>{
 const account={'farmily-profile':'same farm','farmily-role':'farmer'};
 assert.equal(guestTransferAction(account,{'farmily-profile':'same farm','farmily-role':'customer'}),'account');
 assert.equal(guestTransferAction(account,{'farmily-profile':'same farm','farmily-brand-work':'new branding'}),'conflict');
 assert.equal(guestTransferAction(account,{'farmily-profile':'same farm','farmily-draft':'new product'}),'conflict');
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,sampleProfile} from '../shared/branding.ts';
import {onboardingDraftKey,optionalStepStatus,parseOnboardingDraft} from '../shared/onboarding.ts';
import {guestTransferAction,hasProgress} from '../shared/workspace.ts';
import {workspaceKeys,workspaceKey} from '../shared/access.ts';

test('incomplete basics and unsubmitted product text survive draft restoration',()=>{
 const draft={profile:{...blankProfile,farmerName:'Sam'},step:0,pendingProducts:'Tomatoes'};
 assert.deepEqual(parseOnboardingDraft(JSON.parse(JSON.stringify(draft))),draft);
});
test('valid basics restore later steps; invalid basics return to the first step',()=>{
 assert.equal(parseOnboardingDraft({profile:sampleProfile,step:2,pendingProducts:''})?.step,2);
 assert.equal(parseOnboardingDraft({profile:blankProfile,step:2,pendingProducts:''})?.step,0);
 for(const value of [null,{}, {profile:sampleProfile,step:4,pendingProducts:''},{profile:{...sampleProfile,photos:'invalid'},step:0,pendingProducts:''}])assert.equal(parseOnboardingDraft(value),null);
});
test('empty optional steps are skipped, not reported as completed work',()=>{
 assert.equal(optionalStepStatus(blankProfile,1),'Skipped');
 assert.equal(optionalStepStatus({...blankProfile,story:'  '},1),'Skipped');
 assert.equal(optionalStepStatus({...blankProfile,philosophy:'Grow locally'},1),'Complete');
 assert.equal(optionalStepStatus(blankProfile,2),'Skipped');
 assert.equal(optionalStepStatus({...blankProfile,photos:[{id:'a',kind:'farm',url:'photo',name:'farm.jpg'}]},2),'Complete');
});
test('onboarding drafts transfer with the workspace; dismissing signup alone is not progress',()=>{
 assert.ok(workspaceKeys.includes(onboardingDraftKey));
 assert.notEqual(workspaceKey(onboardingDraftKey,null),workspaceKey(onboardingDraftKey,'user'));
 assert.equal(guestTransferAction({},{[onboardingDraftKey]:'unfinished'}),'guest');
 assert.equal(hasProgress({'farmily-account-dismissed':'true'}),false);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleProfile,validProfile} from '../shared/branding.ts';
import {certificateFileError,localCertificateReview,maxFarmUploadBytes,newFarmCertificate,suggestedGrowingPractices,validFarmCertificate,validFarmerPortrait,validGrowingPractices} from '../shared/farmCredentials.ts';
import {farmOnboardingStep,previousFarmOnboardingScreen,restoreFarmOnboardingDraft} from '../shared/onboardingExpanded.ts';

const file={name:'farm-certificate.pdf',type:'application/pdf',size:24,dataUrl:'data:application/pdf;base64,JVBERi0xLjQ='};
test('growing practice suggestions use explicit wording and respect a negative organic claim',()=>{
 assert.deepEqual(suggestedGrowingPractices('Harvested by hand. Grown without chemicals.'),[]);
 assert.deepEqual(suggestedGrowingPractices('Organic vegetables, less waste and seasonal harvests.'),['Organic','Low waste','Fresh and seasonal']);
 assert.deepEqual(suggestedGrowingPractices('We are not organic.'),[]);
 assert.ok(validGrowingPractices([]));assert.ok(validGrowingPractices(['Traditional','Low waste']));
 for(const value of [['Organic','Organic'],['Certified organic'],null,'Organic'])assert.ok(!validGrowingPractices(value));
});
test('onboarding has five stages and photo back navigation follows the path actually taken',()=>{
 assert.deepEqual(['basics','story','photos','practices','certificate'].map(step=>farmOnboardingStep(step as 'basics')),[0,1,2,3,4]);
 assert.equal(farmOnboardingStep('certificate-upload'),4);
 assert.equal(previousFarmOnboardingScreen('practices'),'photos');assert.equal(previousFarmOnboardingScreen('photos'),'story');assert.equal(previousFarmOnboardingScreen('certificate'),'practices');
 assert.equal(previousFarmOnboardingScreen('certificate-upload'),'certificate');
});
test('old onboarding drafts keep progress while new drafts retain deselections and local certificate details',()=>{
 const old={profile:sampleProfile,life:'Small batches.',step:'photos'};
 const restored=restoreFarmOnboardingDraft(old)!;assert.equal(restored.step,'photos');assert.deepEqual(restored.profile,sampleProfile);
 const next={...restored,step:'certificate-upload',profile:{...sampleProfile,growingPractices:[],certificate:newFarmCertificate('organic',file)},practicesReviewed:true,photoReturn:'certificate-upload'};
 const roundtrip=restoreFarmOnboardingDraft(JSON.parse(JSON.stringify(next)))!;
 assert.deepEqual(roundtrip.profile.growingPractices,[]);assert.equal(roundtrip.practicesReviewed,true);assert.equal(roundtrip.photoReturn,'certificate-upload');assert.deepEqual(roundtrip.profile.certificate,next.profile.certificate);
 assert.equal(restoreFarmOnboardingDraft({...old,profile:{...sampleProfile,growingPractices:['invented']}}),null);
});
test('certificate upload types and local review never imply verified status or invented extraction',()=>{
 const blank=newFarmCertificate('organic',file);assert.ok(validFarmCertificate(blank));assert.equal(blank.issuedBy,'');assert.equal(blank.number,'');assert.equal(blank.validUntil,'');assert.equal(blank.status,'draft');
 assert.throws(()=>localCertificateReview(blank),/Add the issuer/);
 const pending=localCertificateReview({...blank,issuedBy:'Demo issuer',number:'TEST-1',validUntil:'14 March 2027'});
 assert.equal(pending.status,'local-pending');assert.ok(pending.localReviewAt);assert.ok(validFarmCertificate(pending));
 assert.ok(!validFarmCertificate({...pending,status:'verified'}));
 for(const malformed of [{...file,type:'text/html'},{...file,size:maxFarmUploadBytes+1},{...file,dataUrl:'https://example.com/cert.pdf'},{...file,dataUrl:'data:text/html;base64,AAAA'}])assert.ok(!validFarmCertificate({...blank,file:malformed}));
 assert.ok(certificateFileError({type:'text/html',size:20}));assert.ok(certificateFileError({type:'application/pdf',size:0}));assert.ok(certificateFileError({type:'application/pdf',size:maxFarmUploadBytes+1}));assert.equal(certificateFileError(file),'');
});
test('portrait and certificates persist on valid profiles without consuming a farm photo slot',()=>{
 const portrait={id:'portrait',name:'farmer.png',url:'data:image/png;base64,iVBORw0KGgo='};assert.ok(validFarmerPortrait(portrait));assert.ok(!validFarmerPortrait({...portrait,url:'javascript:alert(1)'}));
 const profile=validProfile({...sampleProfile,growingPractices:['Traditional'],portrait,certificate:newFarmCertificate('other',file)});
 assert.deepEqual(profile.portrait,portrait);assert.equal(profile.photos.length,sampleProfile.photos.length);assert.equal(profile.certificate?.kind,'other');
 assert.throws(()=>validProfile({...profile,certificate:{...profile.certificate,status:'verified'}}));assert.doesNotThrow(()=>validProfile(sampleProfile));
});

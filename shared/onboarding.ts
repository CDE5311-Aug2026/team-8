import {blankProfile,validProfile,type FarmerProfile} from './branding.ts';

export const onboardingDraftKey='farmily-profile-draft';
export type OnboardingDraft={profile:FarmerProfile;step:number;pendingProducts:string};

// Incomplete answers are valid drafts, but must never unlock a completed profile.
export function parseOnboardingDraft(value:unknown):OnboardingDraft|null{
 if(!value||typeof value!=='object')return null;
 const draft=value as OnboardingDraft;
 if(!draft.profile||!Number.isInteger(draft.step)||draft.step<0||draft.step>2||typeof draft.pendingProducts!=='string'||draft.pendingProducts.length>2500)return null;
 for(const key of ['farmerName','farmName','location','story','products','philosophy'] as const){
  if(typeof draft.profile[key]!=='string'||draft.profile[key].length>2500)return null;
 }
 try{validProfile({...draft.profile,farmerName:'Draft',farmName:'Draft',products:'Draft'});}catch{return null;}
 let step=draft.step;
 try{validProfile(draft.profile);}catch{step=0;}
 return {profile:{...blankProfile,...draft.profile},step,pendingProducts:draft.pendingProducts};
}

export function optionalStepStatus(profile:FarmerProfile,step:number){
 return step===1?(profile.story.trim()||profile.philosophy.trim()?'Complete':'Skipped'):
  step===2?(profile.photos.length?'Complete':'Skipped'):'Complete';
}

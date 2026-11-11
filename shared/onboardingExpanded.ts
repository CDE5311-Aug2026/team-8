import {blankProfile,type FarmerProfile} from './branding.ts';
import {certificateKinds,validFarmCertificate,validFarmerPortrait,validGrowingPractices,type CertificateKind} from './farmCredentials.ts';
export const onboardingScreens=['welcome','signin','signup','basics','story','practices','certificate','certificate-upload','photos','ready','edit'] as const;
export type OnboardingScreen=typeof onboardingScreens[number];
export type FarmOnboardingDraft={profile:FarmerProfile;life:string;step:OnboardingScreen;pendingProduct?:string;certificateKind?:CertificateKind;photoReturn?:'certificate'|'certificate-upload';practicesReviewed?:boolean};
export function restoreFarmOnboardingDraft(value:unknown):FarmOnboardingDraft|null{
 try{const draft=value as FarmOnboardingDraft;if(!draft||!draft.profile||typeof draft.life!=='string'||draft.life.length>1200)return null;const profile={...blankProfile,...draft.profile};
 if((['farmerName','farmName','location','story','products','philosophy'] as const).some(key=>typeof profile[key]!=='string'||profile[key].length>2500)||!Array.isArray(profile.photos)||profile.photos.length>3||profile.photos.some(photo=>!photo||typeof photo.url!=='string'||typeof photo.id!=='string'||typeof photo.name!=='string'||!['farm','products','process'].includes(photo.kind)))return null;
 if(profile.growingPractices!==undefined&&!validGrowingPractices(profile.growingPractices)||profile.certificate!==undefined&&!validFarmCertificate(profile.certificate)||profile.portrait!==undefined&&!validFarmerPortrait(profile.portrait))return null;
 return {profile,life:draft.life,step:onboardingScreens.includes(draft.step)?draft.step:'basics',pendingProduct:typeof draft.pendingProduct==='string'?draft.pendingProduct.slice(0,2500):'',certificateKind:certificateKinds.includes(draft.certificateKind!)?draft.certificateKind:profile.certificate?.kind||'organic',photoReturn:draft.photoReturn==='certificate-upload'?'certificate-upload':'certificate',practicesReviewed:draft.practicesReviewed===true};
 }catch{return null;}
}
// Order: who you are (basics, story, photos), then how you grow and proof (practices, certificate). Certificate is last and saves the profile.
export function farmOnboardingStep(screen:OnboardingScreen){return screen==='certificate-upload'?4:['basics','story','photos','practices','certificate'].indexOf(screen);}
export function previousFarmOnboardingScreen(screen:OnboardingScreen,_photoReturn?:FarmOnboardingDraft['photoReturn']):OnboardingScreen{return screen==='certificate-upload'?'certificate':screen==='certificate'?'practices':screen==='practices'?'photos':screen==='photos'?'story':screen==='story'?'basics':'welcome';}

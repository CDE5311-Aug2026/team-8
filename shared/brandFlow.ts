import {signature,validConcept,validProfile,type BrandConcept,type BrandKit,type FarmerProfile} from './branding.ts';

export type BrandStage='setup'|'review'|'generating'|'preview'|'saved';
export type BrandWork={version:2;stage:BrandStage;choice:'create'|'existing';profile:FarmerProfile;concepts:BrandConcept[];selected:number;palette:number;style:number;handwritten:boolean;image:string|null;origin:'ai'|'sample';basis:string;refinement:string};
export const designStyles=['Minimal','Rustic','Playful'] as const;
export const brandPalettes=[['#415b51','#a8ba9a','#f5f0df'],['#766543','#d9bc83','#f3ead9'],['#6f785b','#b67c61','#eee4d9']];
export const demoConcepts:BrandConcept[]=designStyles.map((name,index)=>({id:`demo-${name.toLowerCase()}`,name,tagline:'Fresh from our farm',rationale:'A sample design direction for exploring your farm identity.',colors:brandPalettes[index],typography:index===2?'sans':'serif',packaging:`${name} labels with a farm wordmark, a small botanical motif and room for product information.`,imagePrompt:'A decorative botanical illustration. No factual farm or certification claims.'}));
export function existingBrand(profile:FarmerProfile):BrandKit{
 validProfile(profile);
 return {origin:'existing',concept:{id:'existing-brand',name:'Existing brand',tagline:profile.farmName,rationale:'The farmer has confirmed they already have a brand identity.',colors:brandPalettes[0],typography:'serif',packaging:'Use your existing brand artwork for product packaging. No artwork has been uploaded.',imagePrompt:'No AI image requested.'},image:null,imageSource:'none',profileSignature:signature(profile)};
}
export function restoreBrandWork(value:unknown,profile:FarmerProfile):BrandWork|null{
 try{
  if(!value||typeof value!=='object')return null;
  const v=value as Partial<BrandWork>;
  if(!Array.isArray(v.concepts)||v.concepts.length>3||!['ai','sample'].includes(v.origin||'')||typeof v.basis!=='string')return null;
  v.concepts.forEach(validConcept);
  if(!Number.isInteger(v.selected)||v.selected!<0||v.selected!>=Math.max(1,v.concepts.length))return null;
  let restoredProfile=v.profile?validProfile(v.profile):profile;
  // Interrupted requests return to a usable screen; restoring never issues a paid request.
  let stage=v.stage==='generating'?(v.concepts.length?'preview':'review'):['setup','review','preview','saved'].includes(v.stage||'')?v.stage!:(v.concepts.length?'preview':'setup');
  if(v.basis&&signature(profile)!==v.basis&&signature(restoredProfile)===v.basis){restoredProfile=profile;stage='review';}
  return {version:2,stage,choice:v.choice==='existing'?'existing':'create',profile:restoredProfile,concepts:v.concepts,selected:v.selected!,palette:Number.isInteger(v.palette)&&v.palette!>=0&&v.palette!<=2?v.palette!:-1,style:Number.isInteger(v.style)&&v.style!>=0&&v.style!<=2?v.style!:0,handwritten:v.handwritten===true,image:typeof v.image==='string'&&v.image.startsWith('data:image/')?v.image:null,origin:v.origin as 'ai'|'sample',basis:v.basis,refinement:typeof v.refinement==='string'?v.refinement.slice(0,500):''};
 }catch{return null;}
}
export function buildBrand(work:BrandWork):BrandKit|null{
 const concept=work.concepts[work.selected];if(!concept)return null;
 const photo=work.profile.photos.find(photo=>photo.kind==='products')||work.profile.photos[0];
 return {concept:{...concept,colors:work.palette>=0?brandPalettes[work.palette]:concept.colors,typography:work.style===2?'sans':'serif'},origin:work.origin,image:work.image||photo?.url||null,imageSource:work.image?'ai':photo?'uploaded':'none',profileSignature:work.basis,designStyle:designStyles[work.style],handwritten:work.handwritten};
}

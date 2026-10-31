import {signature,validProfile,type BrandKit,type FarmerProfile} from './branding.ts';
import {designStyles,demoConcepts,existingBrand} from './brandFlow.ts';

export const brandV2Key='farmily-brand-v2-work';
export const v2Palettes=[['#074226','#e9b949','#f3efe6'],['#8a3b12','#f1d9a6','#f3efe6'],['#24456b','#f6c9b5','#f3efe6'],['#3f3a33','#e7e1d6','#f3efe6']];
export const v2Categories=['Vegetables','Fruit','Honey','Herbs'] as const;
export type V2Stage='start'|'farm'|'creating'|'style'|'saved';
export type V2BrandWork={version:1;stage:V2Stage;profile:FarmerProfile;sourceSignature:string;category:string;include:string;refinement:string;style:number;palette:number;handwritten:boolean;choice:'create'|'existing'};
export type V2BrandKit=BrandKit&{category?:string;preferences?:string;headingFont?:string;bodyFont?:string};
export function newV2BrandWork(profile:FarmerProfile,brand:BrandKit|null=null):V2BrandWork{
 const kit=brand as V2BrandKit|null;const current=brand?.profileSignature===signature(profile);
 return {version:1,stage:current?'saved':'start',profile,sourceSignature:signature(profile),category:kit?.category||v2Categories.find(c=>profile.products.toLowerCase().includes(c.toLowerCase()))||'Vegetables',include:kit?.preferences||'',refinement:'',style:Math.max(0,designStyles.indexOf(brand?.designStyle||'Minimal')),palette:Math.max(0,v2Palettes.findIndex(colors=>colors.join()===brand?.concept.colors.join())),handwritten:!!brand?.handwritten,choice:brand?.origin==='existing'?'existing':'create'};
}
export function restoreV2BrandWork(value:unknown,profile:FarmerProfile):V2BrandWork|null{
 try{
  if(!value||typeof value!=='object')return null;const v=value as V2BrandWork;
  if(v.version!==1||!['start','farm','creating','style','saved'].includes(v.stage)||!v2Categories.includes(v.category as typeof v2Categories[number])||!['create','existing'].includes(v.choice))return null;
  if(!Number.isInteger(v.style)||v.style<0||v.style>2||!Number.isInteger(v.palette)||v.palette<0||v.palette>3||typeof v.handwritten!=='boolean')return null;
  if(typeof v.include!=='string'||v.include.length>2500||typeof v.refinement!=='string'||v.refinement.length>2500||typeof v.sourceSignature!=='string')return null;
  validProfile(v.profile);
  if(v.sourceSignature!==signature(profile))return null;
  return {...v,stage:v.stage==='creating'?'farm':v.stage};
 }catch{return null;}
}
export function makeV2Brand(work:V2BrandWork):V2BrandKit{
 validProfile(work.profile);
 if(work.choice==='existing')return {...existingBrand(work.profile),category:work.category};
 const style=designStyles[work.style];
 return {origin:'sample',concept:{...demoConcepts[work.style],colors:v2Palettes[work.palette],typography:work.style===2?'sans':'serif'},image:null,imageSource:'none',profileSignature:signature(work.profile),designStyle:style,handwritten:work.handwritten,category:work.category,preferences:[work.include,work.refinement].filter(Boolean).join('\n'),headingFont:work.handwritten?'Handwritten':style==='Minimal'?'Silom':style==='Rustic'?'Lora':'Palanquin',bodyFont:'Palanquin'};
}

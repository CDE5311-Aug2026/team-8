import {validConcept,validProfile,type BrandKit,type FarmerProfile} from './branding.ts';

export const brandLibraryKey='farmily-brand-designs';
export type BrandDesign={id:string;savedAt:string|null;brand:BrandKit;profile:FarmerProfile};
export const sameDesign=(a:BrandKit,b:BrandKit)=>JSON.stringify(a)===JSON.stringify(b);

export function restoreDesigns(value:unknown):BrandDesign[]{
 if(!Array.isArray(value))return [];
 return value.filter((entry):entry is BrandDesign=>{
  try{
   if(!entry||typeof entry.id!=='string'||!entry.id||!(entry.savedAt===null||typeof entry.savedAt==='string'&&Number.isFinite(Date.parse(entry.savedAt))))return false;
   validProfile(entry.profile);validConcept(entry.brand?.concept);
   return ['ai','sample','existing'].includes(entry.brand.origin)&&['ai','uploaded','none'].includes(entry.brand.imageSource)&&typeof entry.brand.profileSignature==='string'&&(entry.brand.image===null||typeof entry.brand.image==='string');
  }catch{return false;}
 });
}

export function keepDesign(designs:BrandDesign[],brand:BrandKit,profile:FarmerProfile,savedAt:string|null=new Date().toISOString()):BrandDesign[]{
 if(designs.some(design=>sameDesign(design.brand,brand)))return designs;
 return [{id:crypto.randomUUID(),savedAt,brand:structuredClone(brand),profile:structuredClone(profile)},...designs];
}

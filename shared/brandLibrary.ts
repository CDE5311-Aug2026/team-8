import {validConcept,validProfile,type BrandKit,type FarmerProfile} from './branding.ts';
import type {CatalogueProduct} from './catalogue.ts';

export const brandLibraryKey='farmily-brand-designs';
export type BrandDesign={id:string;savedAt:string|null;brand:BrandKit;profile:FarmerProfile};
export const sameDesign=(a:BrandKit,b:BrandKit)=>JSON.stringify(a)===JSON.stringify(b);
export function editDesign(designs:BrandDesign[],previous:BrandKit,next:BrandKit,profile:FarmerProfile){const matching=designs.some(d=>sameDesign(d.brand,previous));return matching?designs.map(d=>sameDesign(d.brand,previous)?{...d,brand:structuredClone(next),profile:structuredClone(profile),savedAt:new Date().toISOString()}:d):keepDesign(designs,next,profile);}
export function rebrandProducts(products:CatalogueProduct[],previous:BrandKit,next:BrandKit){return products.map(p=>p.brandIdentity&&sameDesign(p.brandIdentity,previous)?{...p,brandIdentity:structuredClone(next)}:p);}

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

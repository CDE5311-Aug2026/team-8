import {canAddProduct,type FarmerProfile} from './branding.ts';
import {validProduct,type ProductDraft} from './productFlow.ts';

export const publishV2Key='farmily-publish-v2-work';
export type PublishPhoto={url:string;name:string};
export type PublishStage='review'|'story'|'preview'|'live'|'marketplace';
export type LocalProduct=ProductDraft&{publication?:'local-demo';listingPhotos?:PublishPhoto[];processPhotos?:PublishPhoto[]};
export type PublishWork={version:1;source:string;stage:PublishStage;product:LocalProduct;photos:(PublishPhoto|null)[];behind:(PublishPhoto|null)[];original:string;polished:string;descriptionMode:'original'|'polished'};
export const publishSource=(product:ProductDraft)=>JSON.stringify([product.name,product.category,product.photo,product.ingredients,product.ingredientsNotApplicable,product.allergens,product.allergenDetails,product.quantity,product.price,product.description,product.brandIdentity]);
const validPhoto=(photo:unknown):photo is PublishPhoto=>{if(!photo||typeof photo!=='object')return false;const p=photo as PublishPhoto;return typeof p.name==='string'&&p.name.length<=500&&typeof p.url==='string'&&(/^data:image\/(png|jpeg|webp);base64,/.test(p.url)||p.url.startsWith('/')&&!p.url.startsWith('//'));};
export function newPublishWork(product:LocalProduct):PublishWork{return {version:1,source:publishSource(product),stage:'review',product,photos:Array.from({length:3},(_,i)=>product.listingPhotos?.[i]||(!i&&product.photo?{url:product.photo,name:'Cover'}:null)),behind:Array.from({length:2},(_,i)=>product.processPhotos?.[i]||null),original:product.description||'',polished:'',descriptionMode:'original'};}
export function restorePublishWork(value:unknown,product:LocalProduct):PublishWork|null{
 try{if(!value||typeof value!=='object')return null;const v=value as PublishWork;
 if(v.version!==1||v.source!==publishSource(product)||!['review','story','preview','live','marketplace'].includes(v.stage)||!['original','polished'].includes(v.descriptionMode))return null;
 if(!v.product||!validProduct(v.product)||typeof v.product.live!=='boolean')return null;
 if(['original','polished'].some(key=>typeof v[key as 'original'|'polished']!=='string'||v[key as 'original'|'polished'].length>2500))return null;
 if(!Array.isArray(v.photos)||v.photos.length!==3||!Array.isArray(v.behind)||v.behind.length!==2||[...v.photos,...v.behind].some(photo=>photo!==null&&!validPhoto(photo)))return null;
 if(['live','marketplace'].includes(v.stage)&&(!v.product.live||v.product.publication!=='local-demo'||!product.live))return null;
 return v;}catch{return null;}
}
export function publishDescription(work:PublishWork){return work.descriptionMode==='polished'?work.polished:work.original;}
export function polishDescription(original:string,name:string,farmName:string,tone='polished'){
 const clean=original.trim().replace(/\s+/g,' ')||`${name} from ${farmName}.`;
 if(tone==='Shorter')return clean.match(/^[\s\S]*?[.!?](?:\s|$)/)?.[0].trim()||clean;
 if(tone==='Warmer')return `Meet ${name}: ${clean.charAt(0).toLowerCase()+clean.slice(1)}`;
 if(tone==='More casual')return clean.replace(/We are\b/g,"We're").replace(/It is\b/g,"It's").replace(/They are\b/g,"They're");
 return clean.charAt(0).toUpperCase()+clean.slice(1)+(/[.!?]$/.test(clean)?'':'.');
}
export function localPublication(work:PublishWork,profile:FarmerProfile):LocalProduct{
 if(!validProduct(work.product)||!canAddProduct(profile,work.product.brandIdentity||null))throw new Error('Review your product details and saved brand before publishing.');
 return {...work.product,photo:work.photos.find(p=>p)?.url||'',description:publishDescription(work),listingPhotos:work.photos.filter((p):p is PublishPhoto=>!!p),processPhotos:work.behind.filter((p):p is PublishPhoto=>!!p),live:true,publication:'local-demo'};
}

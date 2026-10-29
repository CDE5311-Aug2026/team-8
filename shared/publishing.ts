import type {CatalogueProduct} from './catalogue.ts';
import type {FarmerProfile} from './branding.ts';
import {splitFarmStory} from './farmStory.ts';
import {validProduct} from './productFlow.ts';

export const listingSections=['product','information','story','process','farmer'] as const;
export type ListingSection=typeof listingSections[number];
export type ListingLayout='Product First'|'Story First'|'Process First'|'Custom';
export type ListingPhoto={url:string;caption:string};
export type ListingContent={version?:2;behindPhotos?:ListingPhoto[];descriptionOriginal?:string;descriptionPolished?:string;descriptionVersion?:'original'|'polished';layout:ListingLayout;order:ListingSection[];storyTitle:string;story:string;storyPhoto:ListingPhoto|null;processTitle:string;process:string;processPhotos:ListingPhoto[]};
export const sectionLabels:Record<ListingSection,string>={product:'Product identity',information:'Product information',story:'Product story',process:'Picking and packing',farmer:'Meet your farmer'};
export function layoutOrder(layout:ListingLayout):ListingSection[]{return layout==='Story First'?['story','product','information','process','farmer']:layout==='Process First'?['process','product','information','story','farmer']:[...listingSections];}
export function validOrder(value:unknown):value is ListingSection[]{return Array.isArray(value)&&value.length===listingSections.length&&new Set(value).size===listingSections.length&&value.every(key=>listingSections.includes(key));}
export function restoreListing(value:unknown):ListingContent|null{
 if(!value||typeof value!=='object')return null;
 const v=value as ListingContent;
 const photo=(p:ListingPhoto)=>p&&typeof p.url==='string'&&typeof p.caption==='string'&&p.caption.length<=2500;
 return ['Product First','Story First','Process First','Custom'].includes(v.layout)&&validOrder(v.order)&&['storyTitle','story','processTitle','process'].every(key=>typeof v[key as keyof ListingContent]==='string'&&(v[key as keyof ListingContent] as string).length<=2500)&&(!v.storyPhoto||photo(v.storyPhoto))&&Array.isArray(v.processPhotos)&&v.processPhotos.length<=2&&v.processPhotos.every(photo)&&(!v.behindPhotos||Array.isArray(v.behindPhotos)&&v.behindPhotos.every(photo))&&['descriptionOriginal','descriptionPolished'].every(k=>v[k as keyof ListingContent]===undefined||typeof v[k as keyof ListingContent]==='string'&&(v[k as keyof ListingContent] as string).length<=2500)?v:null;
}
export function listingFor(product:CatalogueProduct,profile:FarmerProfile):ListingContent{
 const stored=restoreListing(product.listing);if(stored)return {...structuredClone(stored),version:2,behindPhotos:structuredClone(stored.behindPhotos||[...stored.processPhotos,...(stored.storyPhoto?[stored.storyPhoto]:[])]),descriptionOriginal:stored.descriptionOriginal??product.description,descriptionVersion:stored.descriptionVersion||'original'};
 const story=splitFarmStory(product.story||profile.story),farmPhoto=profile.photos.find(p=>p.kind==='farm');
 return {version:2,behindPhotos:profile.photos.filter(p=>p.kind!=='products').map(p=>({url:p.url,caption:''})),descriptionOriginal:product.description,descriptionVersion:'original',layout:'Product First',order:layoutOrder('Product First'),storyTitle:`The story behind ${product.name}`,story:story.beginnings,storyPhoto:farmPhoto?{url:farmPhoto.url,caption:`The people behind ${profile.farmName}`}:null,processTitle:'From picking to packing',process:story.dailyLife,processPhotos:profile.photos.filter(p=>p.kind==='process').slice(0,2).map(p=>({url:p.url,caption:''}))};
}
export function moveListingSection(content:ListingContent,section:ListingSection,direction:-1|1):ListingContent{
 const order=[...content.order],index=order.indexOf(section),next=index+direction;if(index<0||next<0||next>=order.length)return content;
 [order[index],order[next]]=[order[next],order[index]];return {...content,layout:'Custom',order};
}
export function publishListing(product:CatalogueProduct,listing:ListingContent):CatalogueProduct{
 if(product.packagingComplete===false||!product.brandIdentity||!validProduct(product))throw new Error('Complete product details and packaging before publishing.');
 if(!restoreListing(listing))throw new Error('Check the listing content before publishing.');
 return {...product,listing:structuredClone(listing),live:true};
}

export type PublishStage='details'|'media'|'preview'|'success';
export function publishingEntry(product:CatalogueProduct,profile:FarmerProfile,editing=false):PublishStage{
 const listing=listingFor(product,profile);
 return !editing&&validProduct(product)&&!!product.photo&&!!product.description.trim()&&!!product.photos?.some(Boolean)&&!!listing.behindPhotos?.some(p=>p.url)?'preview':'details';
}
export function demoDescription(product:CatalogueProduct,profile:FarmerProfile,source:string,tone='polish'){
 const original=source.trim().replace(/\s+/g,' ');
 const base=original||product.name+' from '+profile.farmName+'.'+(product.quantity?' Available in '+product.quantity+' packs.':'');
 if(/short/i.test(tone))return (base.match(/[^.!?]+[.!?]?/)?.[0]||base).trim().slice(0,2500);
 if(/warm/i.test(tone))return ('Meet '+product.name+' from '+profile.farmName+'. '+(original||'')).trim().slice(0,2500);
 if(/casual/i.test(tone))return base.replace(/\bIt is\b/g,"It's").replace(/\bThis product is\b/g,"It's").replace(/\bpurchase\b/gi,'try').slice(0,2500);
 return (base.charAt(0).toUpperCase()+base.slice(1)+( /[.!?]$/.test(base)?'':'.')).slice(0,2500);
}

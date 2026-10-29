import {validConcept} from './branding.ts';
import {fieldNames} from './analysis.ts';
import type {ProductDraft} from './productFlow.ts';

export const catalogueKey='farmily-products';
export type CatalogueProduct=ProductDraft&{id:string;createdAt:string};
export type ProductStatus='Draft'|'Unpublished'|'Published';
export function productStatus(product:ProductDraft):ProductStatus{return product.packagingComplete===false?'Draft':product.live?'Published':'Unpublished';}
export function restoreCatalogue(value:unknown,legacy:unknown=null):CatalogueProduct[]{
 const source=Array.isArray(value)?value:legacy?[legacy]:[];
 const seen=new Set<string>();
 return source.flatMap((item,index)=>{
  if(!item||typeof item!=='object')return [];
  const p=item as ProductDraft;
  if(!p.brandIdentity||!p.name?.trim()||typeof p.price!=='string'||typeof p.quantity!=='string')return [];
  try{validConcept(p.brandIdentity.concept);}catch{return [];}
  const id=typeof p.id==='string'&&p.id?p.id:`legacy-${index}`;
  if(seen.has(id))return [];seen.add(id);
  return [{...Object.fromEntries(fieldNames.map(key=>[key,''])),...p,id,createdAt:p.createdAt||'2026-01-01T00:00:00.000Z'} as CatalogueProduct];
 });
}
export function upsertProduct(products:CatalogueProduct[],product:CatalogueProduct){
 const index=products.findIndex(item=>item.id===product.id);
 return index<0?[...products,product]:products.map(item=>item.id===product.id?product:item);
}

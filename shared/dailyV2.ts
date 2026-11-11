import {validConcept,type BrandKit} from './branding.ts';
import {validProduct,type ProductDraft} from './productFlow.ts';
import type {LocalProduct} from './publishV2.ts';
export const catalogueKey='farmily-catalogue-v2';
export const dailyOrdersKey='farmily-sample-orders-v2';
export type CatalogueItem={id:string;product:LocalProduct;draft:boolean;sample?:boolean};
export type CatalogueStatus='Published'|'Unpublished'|'Draft';
export function catalogueStatus(item:CatalogueItem):CatalogueStatus{return item.draft?'Draft':item.product.live?'Published':'Unpublished';}
export function restoreCatalogue(value:unknown):CatalogueItem[]{if(!Array.isArray(value))return [];return value.filter((item):item is CatalogueItem=>{try{return !!item&&typeof item.id==='string'&&typeof item.draft==='boolean'&&typeof item.product?.name==='string'&&typeof item.product.photo==='string'&&typeof item.product.live==='boolean'&&(!item.product.brandIdentity||!!validConcept(item.product.brandIdentity.concept));}catch{return false;}});}
// The first read of this catalogue copies every product from the older list (farmily-products),
// so saving one product can never replace the whole list with just that product.
export function migrateCatalogue(existing:unknown,legacy:(LocalProduct&{id:string})[]):{items:CatalogueItem[];migrated:boolean}{
 if(existing!==null&&existing!==undefined)return {items:restoreCatalogue(existing),migrated:false};
 return {items:restoreCatalogue(legacy.map(product=>({id:product.id,product,draft:product.packagingComplete===false}))),migrated:true};
}
// A new product with the same name as a draft finishes that draft instead of adding a second copy.
export function findDraftTwin(items:CatalogueItem[],name:string){const key=name.trim().toLowerCase();return key?items.find(item=>item.draft&&item.product.name.trim().toLowerCase()===key):undefined;}
// Replace in place so editing or opening a product never reorders the list; new products go last.
export function upsertCatalogue(items:CatalogueItem[],item:CatalogueItem){return items.some(p=>p.id===item.id)?items.map(p=>p.id===item.id?item:p):[...items,item];}
export function currentCatalogueItem(product:LocalProduct&{catalogueId?:string},items:CatalogueItem[]):CatalogueItem{
 const existing=items.find(item=>product.catalogueId?item.id===product.catalogueId:item.product.name===product.name);
 const supplied=Object.fromEntries(Object.entries(product).filter(([,value])=>value!==undefined));
 const merged={...existing?.product,...supplied} as LocalProduct;
 return {id:product.catalogueId||existing?.id||`current-${product.name}`,product:merged,draft:merged.packagingComplete===undefined?existing?.draft??!merged.brandIdentity:!merged.packagingComplete};
}
export function isProductDraft(product:ProductDraft,brand:BrandKit|null){try{return !validProduct(product)||!brand;}catch{return true;}}
export type OrderStatus='New'|'Preparing'|'Ready'|'Delivered'|'Cancelled';
export type SampleOrder={id:string;customer:string;items:string;total:string;delivery:string;status:OrderStatus};
export const sampleOrders:SampleOrder[]=[
 {id:'#1042',customer:'Minh T.',items:'1× Wildflower Honey, 1× Lemongrass Tea',total:'18.00',delivery:'Delivery to Toa Payoh',status:'New'},
 {id:'#1041',customer:'Daniel T.',items:'1× Lemongrass Tea',total:'6.00',delivery:'Delivery to Jurong',status:'New'},
 {id:'#1039',customer:'Sarah K.',items:'3× Wildflower Honey',total:'42.00',delivery:'Delivery to Tampines',status:'Preparing'},
 {id:'#1037',customer:'Ahmad R.',items:'2× Lemongrass Tea',total:'12.00',delivery:'Delivery to Bedok',status:'Preparing'},
 {id:'#1036',customer:'Priya N.',items:'1× Wildflower Honey',total:'14.00',delivery:'Delivery to Clementi',status:'Ready'},
 {id:'#1030',customer:'Wei J.',items:'1× Wildflower Honey',total:'14.00',delivery:'Delivery to Ang Mo Kio',status:'Delivered'},
 {id:'#1028',customer:'Tom H.',items:'1× Lemongrass Tea',total:'6.00',delivery:'Pickup at farm',status:'Cancelled'},
];
export function changeSampleOrder(orders:SampleOrder[],id:string,next:OrderStatus){return orders.map(order=>{if(order.id!==id)return order;const allowed:Record<OrderStatus,OrderStatus[]>={New:['Preparing','Cancelled'],Preparing:['Ready','Cancelled'],Ready:['Delivered'],Delivered:[],Cancelled:[]};return allowed[order.status]?.includes(next)?{...order,status:next}:order;});}
export function restoreSampleOrders(value:unknown):SampleOrder[]{const saved=Array.isArray(value)?value:[];return sampleOrders.map(fixture=>{const old=saved.find(order=>order?.id===fixture.id);const status=old?.status==='On the way'?'Ready':old?.status==='Completed'?'Delivered':old?.status;return {...fixture,status:['New','Preparing','Ready','Delivered','Cancelled'].includes(status)?status:fixture.status};});}

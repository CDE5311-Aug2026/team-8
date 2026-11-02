import {validConcept,type BrandKit} from './branding.ts';
import {validProduct,type ProductDraft} from './productFlow.ts';
import type {LocalProduct} from './publishV2.ts';
export const catalogueKey='farmily-catalogue-v2';
export const dailyOrdersKey='farmily-sample-orders-v2';
export type CatalogueItem={id:string;product:LocalProduct;draft:boolean;sample?:boolean};
export type CatalogueStatus='Published'|'Unpublished'|'Draft';
export function catalogueStatus(item:CatalogueItem):CatalogueStatus{return item.draft?'Draft':item.product.live?'Published':'Unpublished';}
export function restoreCatalogue(value:unknown):CatalogueItem[]{if(!Array.isArray(value))return [];return value.filter((item):item is CatalogueItem=>{try{return !!item&&typeof item.id==='string'&&typeof item.draft==='boolean'&&typeof item.product?.name==='string'&&typeof item.product.photo==='string'&&typeof item.product.live==='boolean'&&(!item.product.brandIdentity||!!validConcept(item.product.brandIdentity.concept));}catch{return false;}});}
export function upsertCatalogue(items:CatalogueItem[],item:CatalogueItem){return [...items.filter(p=>p.id!==item.id),item];}
export function isProductDraft(product:ProductDraft,brand:BrandKit|null){try{return !validProduct(product)||!brand;}catch{return true;}}
export type OrderStatus='New'|'Preparing'|'On the way'|'Completed'|'Cancelled';
export type SampleOrder={id:string;customer:string;items:string;total:string;delivery:string;status:OrderStatus};
export const sampleOrders:SampleOrder[]=[
 {id:'#1042',customer:'Mei L.',items:'2× Wildflower Honey',total:'28.00',delivery:'Delivery to Tampines',status:'New'},
 {id:'#1041',customer:'Daniel T.',items:'1× Lemongrass Tea',total:'6.00',delivery:'Pickup at farm',status:'New'},
 {id:'#1039',customer:'Sarah K.',items:'3× Pandan Kaya',total:'28.50',delivery:'Delivery',status:'Preparing'},
 {id:'#1037',customer:'Ahmad R.',items:'2× Lemongrass Tea',total:'12.00',delivery:'Delivery',status:'Preparing'},
 {id:'#1036',customer:'Priya N.',items:'1× Wildflower Honey',total:'14.00',delivery:'Delivery',status:'On the way'},
 {id:'#1030',customer:'Wei J.',items:'1× Wildflower Honey',total:'14.00',delivery:'Delivery',status:'Completed'},
 {id:'#1028',customer:'Tom H.',items:'1× Mango Jam',total:'8.00',delivery:'Pickup at farm',status:'Cancelled'},
];
export function changeSampleOrder(orders:SampleOrder[],id:string,next:OrderStatus){return orders.map(order=>{if(order.id!==id)return order;const allowed:Record<OrderStatus,OrderStatus[]>={New:['Preparing','Cancelled'],Preparing:['On the way','Cancelled'],'On the way':['Completed'],Completed:[],Cancelled:[]};return allowed[order.status].includes(next)?{...order,status:next}:order;});}

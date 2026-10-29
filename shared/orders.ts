import type {CatalogueProduct} from './catalogue.ts';
import {productStats} from './demoDashboard.ts';
export const orderStatuses=['New Order','Preparing','On the Way','Completed','Cancelled'] as const;
export type OrderStatus=typeof orderStatuses[number];
export type DemoOrder={id:string;number:number;productId:string;productName:string;customer:string;quantity:number;total:number;delivery:string;status:OrderStatus};
export const orderKey='farmily-orders';
export function canTransitionOrder(from:OrderStatus,to:OrderStatus){return (from==='New Order'&&['Preparing','Cancelled'].includes(to))||(from==='Preparing'&&['On the Way','Cancelled'].includes(to))||(from==='On the Way'&&['Completed','Cancelled'].includes(to));}
export function changeOrderStatus(order:DemoOrder,status:OrderStatus):DemoOrder{if(!canTransitionOrder(order.status,status))throw new Error('This order cannot move to that status.');return {...order,status};}
export function restoreOrders(value:unknown):DemoOrder[]{return Array.isArray(value)?value.filter((o):o is DemoOrder=>!!o&&typeof o.id==='string'&&typeof o.productId==='string'&&typeof o.productName==='string'&&typeof o.customer==='string'&&typeof o.delivery==='string'&&Number.isFinite(o.total)&&Number.isInteger(o.quantity)&&o.quantity>0&&orderStatuses.includes(o.status)):[];}
export function initialOrders(products:CatalogueProduct[]):DemoOrder[]{
 if(products.some(p=>p.id==='demo-honey')){const rows:[number,string,string,number,OrderStatus,string][]=[[1042,'demo-honey','Mei L.',2,'New Order','Delivery to Tampines'],[1041,'demo-tea','Daniel T.',1,'New Order','Pickup at farm'],[1039,'demo-kaya','Sarah K.',3,'Preparing','Delivery to Central'],[1037,'demo-tea','Ahmad R.',2,'Preparing','Pickup at farm'],[1036,'demo-honey','Priya N.',1,'On the Way','Delivery to Tampines'],[1030,'demo-tea','Wei J.',2,'Completed','Pickup at farm'],[1028,'demo-jam','Tom H.',1,'Cancelled','Delivery to East']];return rows.flatMap(([number,id,customer,quantity,status,delivery])=>{const product=products.find(p=>p.id===id);return product?[{id:`demo-order-${number}`,number,productId:id,productName:product.name,customer,quantity,total:quantity*Number(product.price),delivery,status}]:[];});}
 return products.filter(p=>p.live).flatMap((p,pi)=>Array.from({length:productStats(p).orders},(_,i)=>({id:`${p.id}-order-${i}`,number:1000+pi*100+i,productId:p.id,productName:p.name,customer:['Mei L.','Daniel T.','Sarah K.','Ahmad R.'][i%4],quantity:1,total:Number(p.price),delivery:i%2?'Pickup at farm':'Delivery to East',status:orderStatuses[i%orderStatuses.length]})));
}

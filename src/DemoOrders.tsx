import {useState} from 'react';
import {dashboardStats} from '../shared/demoDashboard';
import type {CatalogueProduct} from '../shared/catalogue';
import {money} from './FarmerHome';
import {workspaceStorage} from './accountStorage';
import DevBadge from './DevBadge';
export default function DemoOrders({products,onProduct,onProducts}:{products:CatalogueProduct[];onProduct:(p:CatalogueProduct)=>void;onProducts:()=>void}){
 const [filter,setFilter]=useState<'all'|'pending'|'fulfilled'>('all');
 let promotions:string[]=[];try{promotions=JSON.parse(workspaceStorage.getItem('farmily-demo-promotions')||'[]');}catch{/* no promotions */}
 const d=dashboardStats(products,30,promotions);const orders=d.stats.flatMap(s=>Array.from({length:s.orders},(_,i)=>({id:`${s.product.id}-${i}`,product:s.product,total:s.sales/s.orders,pending:i%4===0,customer:['Mei L.','Amir T.','Sarah W.','Kai C.'][i%4]})));
 return <><span className="eyebrow">YOUR FARM BUSINESS</span><h1>Orders</h1><p><DevBadge/> Simulated orders · Last 30 days</p><div className="pf-mode" role="group" aria-label="Filter orders">{(['all','pending','fulfilled'] as const).map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f[0].toUpperCase()+f.slice(1)}</button>)}</div>{orders.length?<div className="dh-report-list">{orders.filter(o=>filter==='all'||(filter==='pending'?o.pending:!o.pending)).map((o,i)=><button key={o.id} onClick={()=>onProduct(o.product)}><strong>#{String(i+1).padStart(4,'0')} · {o.product.name}</strong><span>{o.customer} · {money(o.total)} · {o.pending?'Pending':'Fulfilled'}</span></button>)}</div>:<div className="empty-products orders-empty"><h2>No orders yet</h2><p>Add a product to explore simulated orders.</p><button className="button secondary" onClick={onProducts}>View my products</button></div>}</>;
}

import {useState} from 'react';
import {productStatus,type CatalogueProduct,type ProductStatus} from '../shared/catalogue';
import {FarmerPage,FilterChips,FigmaIcon,type FarmerTab} from './FarmerPage';
import {CatalogueCard} from './FarmerHome';
import ProductsEmptyState from './ProductsEmptyState';
export default function ProductsPage({products,brandReady,onAdd,onOpen,onNavigate}:{products:CatalogueProduct[];brandReady:boolean;onAdd:()=>void;onOpen:(p:CatalogueProduct)=>void;onNavigate:(view:FarmerTab)=>void}){
 const [filter,setFilter]=useState<'All'|ProductStatus>('All');
 const filters=(['All','Draft','Unpublished','Published'] as const).map(id=>({id,label:`${id} ${id==='All'?products.length:products.filter(p=>productStatus(p)===id).length}`}));
 const visible=products.filter(p=>filter==='All'||productStatus(p)===filter);
 return <FarmerPage title="Your products" active="products" onNavigate={onNavigate} action={<button type="button" className="fp-add" onClick={onAdd}><FigmaIcon file="wf-icon-plus.svg" size={14}/>Add</button>}><FilterChips values={filters} selected={filter} onChange={setFilter} label="Filter products"/>{products.length?<div className="fp-product-grid">{visible.map(p=><CatalogueCard key={p.id} product={p} onOpen={()=>onOpen(p)}/>)}</div>:<ProductsEmptyState brandReady={brandReady} onContinue={onAdd}/>} {!!products.length&&!visible.length&&<p className="fp-empty">No {filter.toLowerCase()} products.</p>}</FarmerPage>;
}

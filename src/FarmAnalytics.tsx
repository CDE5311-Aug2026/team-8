import {X} from 'lucide-react';
import type {CatalogueProduct} from '../shared/catalogue';
import {productStats} from '../shared/demoDashboard';
import {workspaceStorage} from './accountStorage';
import {SalesChart,money} from './FarmerHome';
import DevBadge from './DevBadge';
import './analytics.css';
export function ProductPerformance({product,onClose,onManage,onPublish,onBranding}:{product:CatalogueProduct;onClose:()=>void;onManage:()=>void;onPublish:()=>void;onBranding:()=>void}){
 let promotions:string[]=[];try{const value=JSON.parse(workspaceStorage.getItem('farmily-demo-promotions')||'[]');if(Array.isArray(value))promotions=value;}catch{}
 const s=productStats(product,30,promotions.includes(product.id));
 return <div className="app-shell farmer-shell product-performance"><header className="performance-header"><h1>Product performance</h1><button type="button" className="icon-button" aria-label="Close product performance" onClick={onClose}><X/></button></header><main className="farmer-main"><div className="performance-product">{product.photo&&<img src={product.photo} alt={product.name}/>}<div><h2>{product.name}</h2><small>{product.live?'Published · demo':'Not published'} · {money(Number(product.price))} / {product.quantity}</small></div></div><small className="analytics-dev"><DevBadge/> Simulated performance · Last 30 days</small><dl className="analytics-metrics">{[['Product views',s.views],['Orders',s.orders],['Sales (SGD)',money(s.sales)],['Conversion',s.conversion+'%']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h2>Sales over time</h2><SalesChart values={[.14,.28,.25,.33].map(weight=>s.sales*weight)}/><section className="card"><h2>Try a fresh packaging design</h2><p>Explore a new design for {product.name} using your saved farm story.</p><button type="button" className="button primary" onClick={onBranding}>Create new branding</button></section>{!product.live&&<button type="button" className="button primary" onClick={onPublish}>Publish</button>}<button type="button" className="button secondary" onClick={onManage}>Manage product</button></main></div>;
}

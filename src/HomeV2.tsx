import {DailyNav} from './DailyPrimitives';
import {useEffect,useRef,useState} from 'react';
import {homeAssets} from './homeAssets';
import {formatSgd} from '../shared/currency';
import type {FarmerProfile} from '../shared/branding';
import MobileDialog from './MobileDialog';

type HomeProduct={name:string;photo:string;price:string;quantity:string;live:boolean;publication?:'local-demo'};
type Props={profile:FarmerProfile;brandReady:boolean;product:HomeProduct|null;signedIn:boolean;animateFrom:number;onCreateAccount:()=>void;onBranding:()=>void;onAddProduct:()=>void;onPublish:()=>void;onProducts:()=>void;onOrders:()=>void;onProfile:()=>void;onPerformance:()=>void;onShorts:()=>void};
function Icon({name}:{name:keyof typeof homeAssets}){return <img src={homeAssets[name]} alt=""/>;}
const tasks=[
 {step:2,title:'Create your brand',description:'Colours, personality and packaging',illustration:'imgIllustration1'},
 {step:3,title:'Add your first product',description:'Snap a photo, we fill in the rest',illustration:'nextIllustration'},
 {step:4,title:'Publish your first product',description:'Go live in the marketplace',illustration:'imgIllustration'},
] as const;
export default function HomeV2({profile,brandReady,product,signedIn,animateFrom,onCreateAccount,onBranding,onAddProduct,onPublish,onProducts,onOrders,onProfile,onPerformance,onShorts}:Props){
 const count=1+Number(brandReady)+Number(brandReady&&!!product)+Number(brandReady&&!!product?.live);
 const [leaving,setLeaving]=useState(()=>count>animateFrom&&animateFrom>0);
 const [sample,setSample]=useState(false);const [analytics,setAnalytics]=useState(false);const previewButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!leaving)return;const timer=window.setTimeout(()=>setLeaving(false),450);return()=>clearTimeout(timer);},[leaving]);
 const current=Math.min(count-1,2);
 const start=()=>{if(!brandReady)onBranding();else if(!product)onAddProduct();else onPublish();};
 const values=sample?['8','SGD 18.50','128','24','7','1']:['—','—','—','—','—','—'];
 const metrics=['Orders','Avg. order','Shop views','Followers','Customers','Repeat buyers'];
 function taskCard(index:number,layer:number,done=false){const task=tasks[index];return <article key={done?'done':task.step} className={`home-v2-task ${layer===0?'current':'queued'} ${done?'leaving':''} ${leaving&&!done&&layer===0?'rising':''}`} style={{'--layer':layer} as React.CSSProperties} aria-hidden={layer>0||done?true:undefined}>
  <small>{done?'Done':`Step ${task.step} of 4`}</small><h3>{done?(index===0?'Your brand is ready':index===1?'Your product is ready':'Your product is published'):task.title}</h3><p>{task.description}</p>
  {layer===0&&!done&&<button type="button" className="home-v2-start" onClick={start}>{count===3?'Review':'Start'}</button>}
  <div className="home-v2-illustration"><Icon name={done?'doneIllustration':layer>0?'imgIllustration':task.illustration}/></div>
 </article>;}
 return <div className="app-shell v2 home-v2">
  <header className="home-v2-header"><div className="v2-wordmark"><Icon name="imgIconLeaf"/>Farmily</div>{!signedIn&&<button type="button" className="home-v2-account" onClick={onCreateAccount}>Create account</button>}</header>
  <main className="home-v2-content">
   <div className="home-v2-brand"><div className="home-v2-avatar"><Icon name="imgIconLeaf1"/></div><div><small>Welcome, {profile.farmerName.trim().split(/\s+/)[0]}</small><h1>{profile.farmName}</h1>{profile.location&&<small>{profile.location}</small>}</div></div>
   <section className="home-v2-setup" aria-labelledby="home-setup-title"><div className="home-v2-heading"><h2 id="home-setup-title">Get your farm ready</h2><small aria-live="polite">{count} of 4 done</small></div>
    {count<4?<div className="home-v2-deck">{tasks.map((_,index)=>index>=current?taskCard(index,index-current):null).reverse()}{leaving&&taskCard(Math.max(0,animateFrom-1),0,true)}</div>:<div className="home-v2-all-set"><h3>Your farm is ready</h3><p>{product?.publication==='local-demo'?'Your first product is saved as a local listing.':'Your first product is published.'}</p><button className="v2-primary" onClick={onProducts}>View your products</button></div>}
   </section>
   <section className="home-v2-sales" aria-labelledby="home-sales-title"><h2 id="home-sales-title">My sales</h2><button type="button" ref={previewButton} className="home-v2-sales-card" aria-label="My sales. Preview sample analytics" onClick={()=>setAnalytics(true)}><div className="home-v2-earnings"><small>Lifetime earnings</small><strong>{sample?'SGD 148.00':'SGD 0.00'}</strong></div><dl className="home-v2-metrics">{metrics.map((label,index)=><div key={label}><dt>{label}</dt><dd>{values[index]}</dd></div>)}</dl><small>{sample?'Sample analytics · not your farm’s results':'Your numbers show up after your first order.'}</small></button></section>
   <section className="home-v2-products" aria-labelledby="home-products-title"><h2 id="home-products-title">Your products</h2>{product?<button className="home-v2-product" onClick={onPerformance}>{product.photo&&<img src={product.photo} alt={product.name}/>}<span><strong>{product.name}</strong><small>{product.live?'Local listing':'Not published'} · {formatSgd(product.price)} / {product.quantity}</small></span></button>:<div className="home-v2-empty"><div><Icon name="imgIcon"/></div><strong>No products yet</strong><p>Your first product will show here.</p></div>}</section>
  </main>
  <DailyNav tab="home" onNavigate={tab=>{if(tab==="home")window.scrollTo({top:0,behavior:"smooth"});else if(tab==="products")onProducts();else if(tab==="orders")onOrders();else if(tab==="profile")onProfile();else onShorts();}}/>
  {analytics&&<MobileDialog open={analytics} title="My sales" onCancel={()=>{setAnalytics(false);previewButton.current?.focus();}}><p>Analytics are not connected yet. You can preview sample numbers to see how this card will look.</p><button className="button primary" onClick={()=>{setSample(!sample);setAnalytics(false);previewButton.current?.focus();}}>{sample?'Hide sample analytics':'Preview sample analytics'}</button><button className="button secondary" onClick={()=>setAnalytics(false)}>Close</button></MobileDialog>}
 </div>;
}





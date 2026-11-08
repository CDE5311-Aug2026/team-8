import type {DailyProduct} from './DailyUseV2';

import CompletedHomeV2 from './CompletedHomeV2';
import useCardSwipe from './useCardSwipe';

import {useEffect,useState} from 'react';
import {homeAssets} from './homeAssets';

import type {FarmerProfile,BrandKit} from '../shared/branding';


type HomeProduct=DailyProduct;
type Props={brand:BrandKit|null;setupComplete:boolean;profile:FarmerProfile;brandReady:boolean;product:HomeProduct|null;signedIn:boolean;animateFrom:number;onCreateAccount:()=>void;onBranding:()=>void;onAddProduct:()=>void;onPublish:()=>void;onProducts:()=>void;onOrders:()=>void;onProfile:()=>void;onOpenProduct:(product:DailyProduct,tab:'overview'|'analytics')=>void;onShorts:()=>void;onMessages:()=>void};
function Icon({name}:{name:keyof typeof homeAssets}){return <img src={homeAssets[name]} alt=""/>;}
const tasks=[
 {step:2,title:'Create your brand',description:'Colours, personality and packaging',illustration:'imgIllustration1'},
 {step:3,title:'Add your first product',description:'Snap a photo, we fill in the rest',illustration:'nextIllustration'},
 {step:4,title:'Publish your first product',description:'Go live in the marketplace',illustration:'imgIllustration'},
] as const;
export default function HomeV2({brand,setupComplete,profile,brandReady,product,signedIn,animateFrom,onCreateAccount,onBranding,onAddProduct,onPublish,onProducts,onOrders,onProfile,onOpenProduct,onShorts,onMessages}:Props){
 const count=setupComplete?4:1+Number(brandReady)+Number(brandReady&&!!product)+Number(brandReady&&!!product?.live);
 const [leaving,setLeaving]=useState(()=>count>animateFrom&&animateFrom>0);
 useEffect(()=>{if(!leaving)return;const timer=window.setTimeout(()=>setLeaving(false),450);return()=>clearTimeout(timer);},[leaving]);
 const current=Math.min(count-1,2);
 const start=()=>{if(!brandReady)onBranding();else if(!product)onAddProduct();else onPublish();};
 const swipe=useCardSwipe(()=>start());
 function taskCard(index:number,layer:number,done=false){const task=tasks[index];return <article key={done?'done':task.step}  {...(layer===0&&!done?swipe.handlers:{})} className={`home-v2-task ${layer===0?'current':'queued'} ${done?'leaving':''} ${leaving&&!done&&layer===0?'rising':''} ${layer===0&&!done?swipe.className:''}`} style={{'--layer':layer,...(layer===0&&!done?swipe.style:{})} as React.CSSProperties} aria-hidden={layer>0||done?true:undefined}>
  <small>{done?'Done':`Step ${task.step} of 4`}</small><h3>{done?(index===0?'Your brand is ready':index===1?'Your product is ready':'Your product is published'):task.title}</h3><p>{task.description}</p>
  {layer===0&&!done&&<button type="button" className="home-v2-start" disabled={swipe.busy} onClick={()=>swipe.animate(1,start)}>{count===3?'Review':'Start'}</button>}
  <div className="home-v2-illustration"><Icon name={done?'doneIllustration':layer>0?'imgIllustration':task.illustration}/></div>
 </article>;}
 const setupSection=count<4?<section className="home-v2-setup" aria-labelledby="home-setup-title"><div className="home-v2-heading"><h2 id="home-setup-title">Get your farm ready</h2><small aria-live="polite">{count} of 4 done</small></div><div className="home-v2-deck">{tasks.map((_,index)=>index>=current?taskCard(index,index-current):null).reverse()}{leaving&&taskCard(Math.max(0,animateFrom-1),0,true)}</div></section>:null;
 return <CompletedHomeV2 {...{brand,profile,product,onProducts,onOrders,onProfile,onShorts,onBranding,onAddProduct,onOpenProduct,onMessages,signedIn,onCreateAccount}} onboarding={count<4} setupSection={setupSection}/>;
}

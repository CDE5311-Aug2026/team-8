// Customer side v2: the clickable prototype rebuilt from Figma "Customer Side · v2".
// It is a self-contained build in public/customer/ (its own styles), shown here in a
// full-screen frame so it can't affect the farmer side's styles. Open /customer/ directly
// to use it on its own.
// Point at index.html itself: in local dev, /customer/ falls back to the main app and nests it.
import {useEffect,useRef,useState} from 'react';
import './customer-loading.css';

// Sprout loading screen shown while the prototype loads (Figma "Get started / Loading").
function SproutLoading({done}:{done:boolean}){
 return <div className={`cx-loading${done?' is-done':''}`} role="status" aria-live="polite" aria-hidden={done}>
  <svg viewBox="0 0 72 81" aria-hidden="true">
   <circle cx="36" cy="44.64" r="36" fill="#19A35A"/>
   <path d="M34.5601 15.84C34.5601 5.76 41.7601 0 53.2801 0C53.2801 10.08 46.0801 15.84 34.5601 15.84Z" fill="#074226"/>
   <g className="cx-loading-eyes"><circle cx="27.72" cy="29.016" r="3.24" fill="white"/><circle cx="45" cy="29.016" r="3.24" fill="white"/></g>
  </svg>
  <div className="cx-loading-words"><strong>Setting up your market</strong><span>Sprout is gathering farms near you</span></div>
 </div>;
}

// Back on the prototype's first screen posts "farmily-customer-exit" so we can return to Welcome.
export default function CustomerApp({onExit}:{onExit?:()=>void}){
 const frame=useRef<HTMLIFrameElement>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  const listen=(event:MessageEvent)=>{
   if(event.origin!==location.origin||event.source!==frame.current?.contentWindow)return;
   if(event.data?.type==='farmily-customer-exit')onExit?.();
  };
  window.addEventListener('message',listen);
  return()=>window.removeEventListener('message',listen);
 },[onExit]);
 // The frame's load event fires once the prototype script has run; wait a beat so its first paint is in.
 const ready=()=>window.setTimeout(()=>setLoaded(true),200);
 return <>
  <iframe
   ref={frame}
   src="/customer/index.html"
   title="Farmily customer prototype"
   style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,background:'#f5f5f2'}}
   allow="autoplay"
   onLoad={ready}
  />
  <SproutLoading done={loaded}/>
 </>;
}

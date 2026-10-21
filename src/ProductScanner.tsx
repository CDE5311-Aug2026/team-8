import DevBadge from './DevBadge';
import {useEffect,useRef,useState} from 'react';
import ProductCamera from './ProductCamera';
import {fieldNames,validateAnalysis,type Analysis,type FieldName} from '../shared/analysis';
export type ProductInfo=Record<FieldName,string>;
export function emptyInfo():ProductInfo{return Object.fromEntries(fieldNames.map(key=>[key,''])) as ProductInfo;}
import {productAsset as asset} from './productAssets';
export default function ProductScanner({onUse,onPhotoChange,initialPhoto='',initialSample=false}:{onUse:(info:ProductInfo,photo:string,analysis:Analysis|null,sample:boolean)=>void;onPhotoChange:(photo:string,sample:boolean)=>void;initialPhoto?:string;initialSample?:boolean}){
 const [photo,setPhoto]=useState(initialPhoto);const [sample,setSample]=useState(initialSample);const [busy,setBusy]=useState(false);const [reading,setReading]=useState(false);const [error,setError]=useState('');const [token,setToken]=useState('');const [camera,setCamera]=useState(false);
 const input=useRef<HTMLInputElement>(null);const active=useRef<AbortController|null>(null);const reader=useRef<FileReader|null>(null);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{onPhotoChange(photo,sample);},[photo,sample,onPhotoChange]);
 useEffect(()=>()=>{active.current?.abort();reader.current?.abort();if(timer.current)clearTimeout(timer.current);},[]);
 function select(file?:File){
  if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setError('Choose a JPG, PNG or WebP photo smaller than 2 MB.');return;}
  setError('');setReading(true);reader.current?.abort();const next=new FileReader();reader.current=next;
  next.onload=()=>{setPhoto(String(next.result));setSample(false);setReading(false);};next.onerror=()=>{setError('We could not open this photo. Try another.');setReading(false);};next.readAsDataURL(file);
 }
 async function analyze(){
  if(!photo||busy)return;setError('');setBusy(true);
  if(sample){timer.current=setTimeout(()=>{onUse({...emptyInfo(),name:'Heirloom Tomatoes',category:'Vegetables',quantity:'1 kg'},photo,null,true);},1000);return;}
  const controller=new AbortController();active.current=controller;const timeout=setTimeout(()=>controller.abort(),55000);
  try{
   const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-Scan-Token':token}:{})},body:JSON.stringify({image:photo}),signal:controller.signal});
   const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.error||'Photo analysis is unavailable. Retry or enter details manually.');
   const result=validateAnalysis(payload?.analysis);
   if(active.current===controller)onUse(Object.fromEntries(fieldNames.map(key=>[key,result.fields[key].value||''])) as ProductInfo,photo,result,false);
  }catch(err){if(active.current===controller)setError(err instanceof Error&&err.name==='AbortError'?'Analysis stopped. Retry or enter details manually.':err instanceof Error?err.message:'Photo analysis failed.');}
  finally{clearTimeout(timeout);if(active.current===controller){active.current=null;setBusy(false);}}
 }
 function cancel(){active.current?.abort();if(timer.current)clearTimeout(timer.current);timer.current=null;setBusy(false);}
 return <section className="pf-scanner" aria-label="Product photo">
  <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event=>{select(event.target.files?.[0]);event.target.value='';}}/>
  <div className={`pf-photo-slot ${photo?'has-photo':''} ${busy?'is-scanning':''}`}>{photo?<img className={sample?'pf-sample-photo':''} src={photo} alt="Product photo to review"/>:<button type="button" className="pf-photo-prompt" onClick={()=>input.current?.click()}><span><img src={asset('camera.svg')} alt=""/></span><span>Take a clear photo of your product.</span></button>}{busy&&<><span className="pf-image-badge">✦ AI{sample?' · DEV sample':''}</span><div className="pf-scan-line"/><div className="pf-scan-corners" aria-hidden="true"><i/><i/><i/><i/></div></>}</div>
  <div className="pf-ai-callout"><strong>✦ Farmily AI</strong><p>We’ll read your photo and fill in the details.</p></div>
  <div className="pf-photo-actions">{busy?<button className="button primary" type="button" disabled>✦ Reading your photo…</button>:photo?<><button className="button secondary" type="button" onClick={()=>{setPhoto('');setSample(false);}}>Retake the photo</button><button className="button primary" type="button" disabled={reading} onClick={()=>void analyze()}>Use this photo</button></>:<><button className="button secondary" type="button" disabled={reading} onClick={()=>setCamera(true)}>Take a photo</button><button className="button secondary" type="button" disabled={reading} onClick={()=>input.current?.click()}>{reading?'Opening photo…':'Upload a photo'}</button></>}</div>
  <div className="pf-photo-options">{busy?<button type="button" className="text-button" onClick={cancel}>Cancel analysis</button>:<><p className="pf-privacy">Photo analysis sends this image to OpenAI.</p>{error&&<p className="scan-error" role="alert">{error}</p>}<button className="text-button" type="button" disabled={reading} onClick={()=>onUse(emptyInfo(),photo,null,sample)}>Enter details manually</button>{!photo&&<button type="button" className="text-button" onClick={()=>{setPhoto(asset('sample-photo.png'));setSample(true);}}><DevBadge/> Explore sample product</button>}<details className="scan-access"><summary><DevBadge/> Demo scan access code</summary><label className="field"><span>Scan access code</span><input type="password" autoComplete="off" enterKeyHint="done" value={token} onChange={event=>setToken(event.target.value)}/></label></details></>}</div>
  {camera&&<ProductCamera onClose={()=>setCamera(false)} onCapture={value=>{setPhoto(value);setSample(false);setCamera(false);setError('');}}/>}
 </section>;
}

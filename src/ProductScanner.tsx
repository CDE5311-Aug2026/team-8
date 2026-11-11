import {localDemo} from './demoMode';
import {authClient} from './authClient';

import {useEffect,useRef,useState} from 'react';
import ProductCamera from './ProductCamera';
import {fieldNames,validateAnalysis,type Analysis,type FieldName} from '../shared/analysis';
export type ProductInfo=Record<FieldName,string>;
export function emptyInfo():ProductInfo{return Object.fromEntries(fieldNames.map(key=>[key,''])) as ProductInfo;}

import {addProductAssets as v2Assets} from './addProductAssets';
import {presetProductInfo} from '../shared/presetProduct';
import {matchProductPhoto} from './photoHash';
import {readDailyCatalogue} from './catalogueStorage';
// Details for a recognised product: what the farm already saved for it, or the Mango Jam preset.
function knownProductInfo(id:string):ProductInfo&{price?:string}{
 const saved=readDailyCatalogue().find(item=>(item.product.id||item.id)===id)?.product as Partial<ProductInfo&{price:string}>|undefined;
 const base={...emptyInfo(),...(id==='demo-jam'?presetProductInfo:{})};
 if(!saved)return base;
 const pick=Object.fromEntries((Object.keys(base) as (keyof ProductInfo)[]).filter(key=>typeof saved[key]==='string'&&saved[key]).map(key=>[key,saved[key]]));
 return {...base,...pick,price:saved.price};
}
export default function ProductScanner({onUse,onPhotoChange,initialPhoto='',initialSample=false,variant='v2'}:{onUse:(info:ProductInfo,photo:string,analysis:Analysis|null,sample:boolean,notice?:string)=>void;onPhotoChange:(photo:string,sample:boolean)=>void;initialPhoto?:string;initialSample?:boolean;variant?:'legacy'|'v2'}){
 const [photo,setPhoto]=useState(initialPhoto);const [sample,setSample]=useState(initialSample);const [busy,setBusy]=useState(false);const [reading,setReading]=useState(false);const [error,setError]=useState('');const [token,setToken]=useState('');const [camera,setCamera]=useState(false);
 const input=useRef<HTMLInputElement>(null);const active=useRef<AbortController|null>(null);const reader=useRef<FileReader|null>(null);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{onPhotoChange(photo,sample);},[photo,sample,onPhotoChange]);
 useEffect(()=>()=>{active.current?.abort();reader.current?.abort();if(timer.current)clearTimeout(timer.current);},[]);
 function select(file?:File){
  if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setError('Choose a JPG, PNG or WebP photo smaller than 2 MB.');return;}
  setError('');setReading(true);reader.current?.abort();const next=new FileReader();reader.current=next;
  next.onload=()=>{const uploaded=String(next.result);setPhoto(uploaded);setSample(false);setReading(false);if(variant!=='v2'&&(localDemo||!import.meta.env.VITE_DEV_TESTING&&!authClient&&!token))onUse(emptyInfo(),uploaded,null,false,'Enter the product details to continue.');};next.onerror=()=>{setError('We could not open this photo. Try another.');setReading(false);};next.readAsDataURL(file);
 }
 async function analyze(){
  if(!photo||busy)return;setError('');setBusy(true);
  // A photo of one of the farm's products fills in that product's details.
  if(variant==='v2'){const id=await matchProductPhoto(photo);if(id){const info=knownProductInfo(id);const live=readDailyCatalogue().some(item=>(item.product.id||item.id)===id&&item.product.live);onUse(info,photo,null,id==='demo-jam',live?`${info.name} is already in your products. Saving adds another listing.`:'');return;}}
  if(localDemo||!import.meta.env.VITE_DEV_TESTING&&!authClient&&!token){if(variant==='v2')timer.current=setTimeout(()=>onUse(emptyInfo(),photo,null,false,'Sprout AI could not recognise this product. Enter the details below.'),900);else onUse(emptyInfo(),photo,null,false,'Enter the product details to continue.');return;}
  const controller=new AbortController();active.current=controller;const timeout=setTimeout(()=>controller.abort(),55000);
  try{
   const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-Scan-Token':token}:{})},body:JSON.stringify({image:photo}),signal:controller.signal});
   const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.error||'Photo analysis is unavailable. Retry or enter details manually.');
   const result=validateAnalysis(payload?.analysis);
   if(active.current===controller)onUse(Object.fromEntries(fieldNames.map(key=>[key,result.fields[key].value||''])) as ProductInfo,photo,result,false);
  }catch{if(active.current===controller)onUse(emptyInfo(),photo,null,false,'Scanning is unavailable. Your photo is saved; enter the product details to continue.');}
  finally{clearTimeout(timeout);if(active.current===controller){active.current=null;setBusy(false);}}
 }
 function cancel(){const request=active.current;active.current=null;request?.abort();if(timer.current)clearTimeout(timer.current);timer.current=null;setBusy(false);}
 return <section className="ap-scanner" aria-label="Product photo"><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="Upload product photo" onChange={e=>{select(e.target.files?.[0]);e.target.value='';}}/><main className="ap-content"><div className="ap-heading"><h1>{busy?'Reading your photo…':photo?'Looks good?':'Add a product'}</h1>{!busy&&<p>{photo?'Make sure the label is easy to read.':'Start with a clear photo.'}</p>}</div>{photo?<div className={`ap-photo ${busy?'ap-reading':''}`}><img src={photo} alt="Product photo to review"/>{busy&&<><div className="ap-scan-line"/><div className="ap-found" role="status">{sample?<><span><img alt="" src={v2Assets['1142:2280_imgIconCheck']}/>Mango Jam</span><span><img alt="" src={v2Assets['1142:2280_imgIconCheck']}/>220 g</span><span>Check the details next</span></>:<span>Preparing your photo…</span>}</div></>}</div>:<button className="ap-photo-empty" onClick={()=>input.current?.click()}><img alt="" src={v2Assets['1142:2172_imgIconCamera']}/><span>Take a photo of your product</span></button>}{!photo&&<p className="ap-ai-note"><img alt="" src={v2Assets['1142:2172_imgIconSparkle']}/>We’ll read your photo and fill in the details.</p>}{error&&<p role="alert" className="ap-error">{error}</p>}<div className="ap-photo-options">{busy?<button className="v2-link" onClick={cancel}>Cancel reading</button>:<><button className="v2-link" onClick={()=>onUse(emptyInfo(),photo,null,sample)}>Enter details manually</button></>}</div></main><footer className="ap-footer">{busy?<button className="v2-primary" disabled>Continue</button>:photo?<div className="ap-button-row"><button className="v2-secondary" onClick={()=>{setPhoto('');setSample(false);}}>Retake</button><button className="v2-primary" disabled={reading} onClick={()=>void analyze()}>Use this photo</button></div>:<div className="ap-button-row"><button className="v2-secondary" disabled={reading} onClick={()=>input.current?.click()}>{reading?'Opening…':'Upload'}</button><button className="v2-primary" onClick={()=>setCamera(true)}>Take a photo</button></div>}</footer>{camera&&<ProductCamera variant="v2" onClose={()=>setCamera(false)} onCapture={value=>{setPhoto(value);setSample(false);setCamera(false);setError('');}}/>}</section>;

}

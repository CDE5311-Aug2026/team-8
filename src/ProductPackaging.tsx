import {useEffect,useState,type CSSProperties} from 'react';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';
import {productAsset as asset} from './productAssets';
export function ProductLabel({product,profile,brand}:{product:ProductDraft;profile:FarmerProfile;brand:BrandKit}){
 return <div className="pf-product-label" style={{background:brand.concept.colors[1],color:brand.concept.colors[0],fontFamily:brand.handwritten?'Comic Sans MS,cursive':brand.designStyle==='Rustic'?'Lora,Georgia,serif':brand.concept.typography==='serif'?'Bree Serif,serif':'Palanquin,sans-serif'}}><small>{profile.farmName}</small><strong>{product.name||'Your product'}</strong><i style={{background:brand.concept.colors[2]}}/><small>{product.quantity}</small></div>;
}
export default function ProductPackaging({product,profile,brand,mode='photo',saved=false,initialAngle=-24}:{product:ProductDraft;profile:FarmerProfile;brand:BrandKit;mode?:'photo'|'3d';saved?:boolean;initialAngle?:number}){
 const [angle,setAngle]=useState(initialAngle);useEffect(()=>setAngle(initialAngle),[initialAngle]);
 const sample=product.sample&&brand.origin==='sample'&&profile.farmName==='Green Valley Farm'&&product.name==='Heirloom Tomatoes'&&(!brand.designStyle||brand.designStyle==='Minimal')&&!brand.handwritten&&brand.concept.colors.join(',')==='#415b51,#a8ba9a,#f5f0df';
 return <div className={`pf-packaging-preview ${mode==='3d'?'pf-three-d':''} ${sample&&mode==='photo'?'pf-sample-packaging':''}`}>
  {sample&&mode==='photo'?<img src={asset(saved?'sample-saved.png':'sample-packaging.png')} alt="AI-generated Figma sample packaging reference"/>:mode==='photo'?<><div className="pf-real-product-photo">{product.photo?<img src={product.photo} alt={product.name}/>:<span>No photo added</span>}</div><div className="pf-photo-brand-label"><ProductLabel product={product} profile={profile} brand={brand}/></div></>:<><div className="pf-box-scene"><div className="pf-box" style={{'--box-angle':`${angle}deg`,'--box-color':brand.concept.colors[0]} as CSSProperties}><div className="pf-box-top">{product.photo&&<img src={product.photo} alt="Product inside packaging concept"/>}</div><div className="pf-box-front"><ProductLabel product={product} profile={profile} brand={brand}/></div><div className="pf-box-side"><span>{profile.farmName}</span><small>{brand.concept.tagline}</small></div></div></div><label className="pf-rotate-label">Rotate packaging<input type="range" min={-45} max={25} value={angle} onChange={event=>setAngle(Number(event.target.value))}/></label></>}
  {sample&&mode==='photo'&&<span className="pf-image-badge">✦ {sample?'AI generated · sample':'AI-generated brand art'}</span>}
 </div>;
}

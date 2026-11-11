import usePackagingRotation from './usePackagingRotation';
import {botanicalMotif,hasDesignTweaks,labelTheme,sprigArt,validDesignTweaks} from '../shared/labelTemplates';
import './product-label.css';
import {samplePackagingFor} from '../shared/samplePackaging';
import SamplePackagingPreview from './SamplePackagingPreview';
import {isRefinedBrand} from '../shared/brandRefined';
import {BrandLogo} from './BrandBoard';
import {useEffect,useState,type CSSProperties} from 'react';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';
import {productAsset as asset} from './productAssets';
export function ProductLabel({product,profile,brand}:{product:ProductDraft;profile:FarmerProfile;brand:BrandKit}){
 const template=product.labelTemplate||'botanical',tweaks=hasDesignTweaks(product.designTweaks)&&validDesignTweaks(product.designTweaks)?product.designTweaks:undefined,theme=labelTheme(brand,template,tweaks);
 const art=tweaks?.art,band=tweaks?.layout==='band';
 const style={backgroundColor:theme.paper,color:theme.ink,'--label-ink':theme.ink,'--label-paper':theme.paper,...(tweaks?.paper?{backgroundImage:'none'}:{})} as CSSProperties;
 return <div className={`pf-product-label label-template label-${template}${band?' label-band':''}${art?` label-art-${art}`:''}`} style={style}>{art==='leaves'&&<><svg className="label-botanical first" viewBox="0 0 70 90" aria-hidden="true" dangerouslySetInnerHTML={{__html:botanicalMotif}}/><svg className="label-botanical last" viewBox="0 0 70 90" aria-hidden="true" dangerouslySetInnerHTML={{__html:botanicalMotif}}/></>}<div className="label-farm">{isRefinedBrand(brand)?<BrandLogo selection={brand.refined.selection} name={profile.farmName} slot="small" ink={band?theme.paper:theme.ink}/>:profile.farmName}</div>{art==='sprig'?<svg className="label-sprig" viewBox="0 0 40 48" aria-hidden="true" dangerouslySetInnerHTML={{__html:sprigArt}}/>:<i className="label-rule" aria-hidden="true"><span/>{art!=='none'&&<svg viewBox="0 0 40 24" width="28" height="18"><path d="M20 22C20 12 14 6 4 2C7 13 14 14 20 22M20 22C22 9 29 4 37 2C34 13 27 16 20 22M20 22L21 8" fill="none" stroke="currentColor" strokeWidth="1"/></svg>}<span/></i>}<strong>{product.name||'Your product'}</strong>{template!=='botanical'&&product.category&&product.category!=='Other'&&<span className="label-category">{product.category}</span>}{product.quantity&&<small className="label-quantity">{product.quantity}</small>}</div>;
}

export default function ProductPackaging({product,profile,brand,mode='photo',saved=false,initialAngle=-24}:{product:ProductDraft;profile:FarmerProfile;brand:BrandKit;mode?:'photo'|'3d';saved?:boolean;initialAngle?:number}){
 const [angle,setAngle]=useState(initialAngle);useEffect(()=>setAngle(initialAngle),[initialAngle]);
 const rotation=usePackagingRotation(angle,setAngle);const spec=samplePackagingFor(product);if(spec)return <div className="pf-packaging-preview"><SamplePackagingPreview spec={spec} label={<ProductLabel product={product} profile={profile} brand={brand}/>} mode={mode} angle={angle} onAngle={setAngle}/></div>;
 const sample=product.sample&&brand.origin==='sample'&&profile.farmName==='Green Valley Farm'&&product.name==='Heirloom Tomatoes'&&(!brand.designStyle||brand.designStyle==='Minimal')&&!brand.handwritten&&brand.concept.colors.join(',')==='#415b51,#a8ba9a,#f5f0df';
 return <div className={`pf-packaging-preview ${mode==='3d'?'pf-three-d':''} ${sample&&mode==='photo'?'pf-sample-packaging':''}`}>
  {sample&&mode==='photo'?<img src={asset(saved?'sample-saved.png':'sample-packaging.png')} alt="Packaging design"/>:mode==='photo'?<><div className="pf-real-product-photo">{product.photo?<img src={product.photo} alt={product.name}/>:<span>No photo added</span>}</div><div className="pf-photo-brand-label"><ProductLabel product={product} profile={profile} brand={brand}/></div></>:<><div className="pf-box-scene model-rotation" {...rotation.props}><div className="pf-box" style={{'--box-angle':`${angle}deg`,'--box-color':brand.concept.colors[0]} as CSSProperties}><div className="pf-box-top">{product.photo&&<img src={product.photo} alt="Product inside packaging concept"/>}</div><div className="pf-box-front"><ProductLabel product={product} profile={profile} brand={brand}/></div><div className="pf-box-side"><span>{profile.farmName}</span><small>{brand.concept.tagline}</small></div></div><span className="packaging-rotate-hint" aria-hidden="true">Drag to rotate</span><span id={rotation.descriptionId} className="packaging-rotate-keyboard">Drag left or right to rotate. Use the left and right arrow keys, or Home to reset.</span></div></>}
  {sample&&mode==='photo'&&<span className="pf-image-badge">✦ {sample?'Made by Sprout':'AI-generated brand art'}</span>}
 </div>;
}

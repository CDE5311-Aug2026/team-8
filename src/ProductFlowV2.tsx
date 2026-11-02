import RequiredMark from './RequiredMark';
import {addProductAssets as ap} from './addProductAssets';
import VoiceField from './VoiceField';

import PublishV2 from './PublishV2';
import {advanceField} from './mobileForms';

import {workspaceStorage} from './accountStorage';
import {useCallback,useEffect,useRef,useState} from 'react';

import ProductScanner,{emptyInfo,type ProductInfo} from './ProductScanner';
import ProductPackaging,{ProductLabel} from './ProductPackaging';
import MobileDialog from './MobileDialog';

import {categories,fieldLabels,type FieldName,type Analysis} from '../shared/analysis';
import {canAddProduct,signature,validConcept,type FarmerProfile,type BrandKit} from '../shared/branding';
import {brandLibraryKey,restoreDesigns,sameDesign} from '../shared/brandLibrary';
import {labelSvg,productCanSave,validProduct,restoreProductWork,productWorkKey,type ProductDraft} from '../shared/productFlow';

import CurrencyField from './CurrencyField';
import {formatSgd} from '../shared/currency';

import AllergenPicker from './AllergenPicker';
import {initialAllergens,allergenStatement,addIngredients} from '../shared/productFields';
import './product-flow.css';

type Screen='add'|'details'|'packaging'|'saved'|'listing';
type Props={editOnOpen?:boolean;publishOnOpen?:boolean;farmProfile:FarmerProfile;brandKit:BrandKit|null;startAt:'add'|'listing';onSaved:()=>void;onExit:()=>void;onCatalogue:()=>void;onPerformance:()=>void;onBranding:()=>void;onCreateAccount:()=>void};

const workKey=productWorkKey;
function read(key:string){try{return JSON.parse(workspaceStorage.getItem(key)||'null');}catch{return null;}}
export default function ProductFlowV2({editOnOpen=false,publishOnOpen=false,farmProfile,brandKit,startAt,onSaved,onExit,onCatalogue,onPerformance,onBranding,onCreateAccount}:Props){

 const [initial]=useState(()=>{const empty:ProductDraft={...emptyInfo(),photo:'',price:'',currency:'SGD',story:farmProfile.story,live:false};const stored=read(startAt==='listing'?'farmily-draft':workKey);const restored=restoreProductWork(startAt==='listing'?{product:stored,screen:'details',profileSignature:signature(farmProfile),reviewed:false,analysis:null}:stored,farmProfile);if(restored)return {...restored,screen:(startAt==='listing'?(editOnOpen?'details':'listing'):restored.screen) as Screen};return {product:empty,screen:startAt as Screen,reviewed:false,analysis:null};});
 const [voiceOpen,setVoiceOpen]=useState(false);
 const [theme,setTheme]=useState(()=>Math.max(0,Math.min(2,initial.product.v2PackagingTheme||0)));
 const [publishV2,setPublishV2]=useState(publishOnOpen&&startAt==='listing');
 const [product,setProduct]=useState(initial.product);const [screen,setScreen]=useState<Screen>(initial.screen);const [reviewed,setReviewed]=useState(initial.reviewed);const [analysis,setAnalysis]=useState<Analysis|null>(initial.analysis);const [touched,setTouched]=useState<string[]>([]);
 const [selectedBrand,setSelectedBrand]=useState<BrandKit|null>(()=>{try{if(initial.product.brandIdentity){validConcept(initial.product.brandIdentity.concept);return initial.product.brandIdentity;}}catch{/* use current identity */}return brandKit;});
 const [scanNotice,setScanNotice]=useState('');
 const [mode,setMode]=useState<'photo'|'3d'>(initial.product.packagingMode||'3d');const [error,setError]=useState('');const [exitOpen,setExitOpen]=useState(false);
 const entryDraft=useRef(workspaceStorage.getItem(workKey));const heading=useRef<HTMLHeadingElement>(null);
 const [designs]=useState(()=>{const all=restoreDesigns(read(brandLibraryKey));return [brandKit,...all.map(item=>item.brand)].filter((kit,index,kits):kit is BrandKit=>!!kit&&canAddProduct(farmProfile,kit)&&kits.findIndex(other=>!!other&&sameDesign(other,kit))===index);});
 const go=(next:Screen)=>{setScreen(next);setError('');};
 const draft=()=>({product:{...product,brandIdentity:selectedBrand,packagingMode:mode},profileSignature:signature(farmProfile),screen,reviewed,analysis});
 const persist=()=>{try{workspaceStorage.setItem(workKey,JSON.stringify(draft()));return true;}catch{setError('Your draft could not be saved. Use a smaller photo or free some browser storage.');return false;}};
 useEffect(()=>{if(['add','details','packaging'].includes(screen))persist();},[product,screen,reviewed,analysis,selectedBrand,mode]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});},[screen]);
 const update=(key:keyof ProductDraft,value:string)=>{setProduct(p=>({...p,[key]:value}));setReviewed(false);setTouched(keys=>[...keys,key]);};
 const photoChanged=useCallback((photo:string,sample:boolean)=>{setProduct(value=>value.photo===photo&&!!value.sample===sample?value:{...value,photo,sample});setReviewed(false);},[]);
 const scan=(info:ProductInfo,photo:string,result:Analysis|null,sample:boolean,notice='')=>{setScanNotice(notice);setProduct(p=>({...p,...info,allergenDetails:initialAllergens(info.allergens),ingredientsNotApplicable:false,ingredientInput:'',photo,sample,price:sample?'4.50':p.price}));setAnalysis(result);setTouched([]);setReviewed(false);go('details');};
 function save(){
  if(!selectedBrand||!productCanSave(product,farmProfile,selectedBrand,reviewed)){setError('Check the product information and choose a saved brand before confirming.');return;}
  const next:ProductDraft={...product,packagingComplete:true,currency:'SGD',brandIdentity:selectedBrand,packagingMode:mode,live:startAt==='listing'?product.live:false};
  try{workspaceStorage.setItem('farmily-draft',JSON.stringify(next));workspaceStorage.removeItem(workKey);setProduct(next);onSaved();go('saved');}catch{setError('Your product could not be saved. Use a smaller photo or free some browser storage.');}
 }
 function discard(){try{if(entryDraft.current===null)workspaceStorage.removeItem(workKey);else workspaceStorage.setItem(workKey,entryDraft.current);onExit();}catch{setError('Your changes could not be discarded. Try again.');}}
 function download(){if(!selectedBrand)return;const url=URL.createObjectURL(new Blob([labelSvg(product,farmProfile,selectedBrand)],{type:'image/svg+xml'}));const link=document.createElement('a');link.href=url;link.download=`${product.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'product'}-label.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function provenance(key:FieldName){const field=analysis?.fields?.[key];if(!field||touched.includes(key)||!field.value)return null;return <small className="pf-source">{field.source==='label'?`✦ Read from photo: “${field.evidence||field.value}”`:field.source==='visual'?'✦ Suggested from appearance — please confirm':null}</small>;}
 const detailsValid=(()=>{try{return validProduct({...product,ingredients:(product.ingredients+(product.ingredientInput?'\n'+product.ingredientInput:''))});}catch{return false;}})();
 const step=screen==='add'?1:screen==='details'?2:3;

 const sampleArt=product.sample===true;
 const themeImages=[ap['1142:2425_imgPackagingPreview'],ap['1142:2425_imgPreview'],ap['1142:2425_imgPreview1']];
 const renderPackaging=(saved=false)=>sampleArt&&mode==='3d'?<img className="ap-packaging-art" src={saved&&theme===0?ap['1142:2502_imgProductImage']:themeImages[theme]} alt="Sample packaging reference"/>:selectedBrand?<ProductPackaging product={product} profile={farmProfile} brand={selectedBrand} mode={mode}/>:<p>Choose a brand identity to continue.</p>;
 if(publishV2)return <PublishV2 product={{...product,brandIdentity:selectedBrand||product.brandIdentity}} profile={farmProfile} onSaved={onSaved} onExit={onExit} onProducts={onCatalogue} onBranding={onBranding}/>;
 return <div className="daily-app-root v2 ap-root"><div className={'app-shell v2 ap-flow ap-'+screen}>
 <header className="ap-header">{['details','packaging'].includes(screen)&&<button className="ap-back" aria-label="Back" onClick={()=>go(screen==='packaging'?'details':'add')}><img alt="" src={ap['1142:2321_imgIcon1']}/></button>}{!['saved','listing'].includes(screen)&&<div className="ap-steps" role="progressbar" aria-label="Add product progress" aria-valuenow={screen==='packaging'?2:1} aria-valuemin={1} aria-valuemax={3}>{[0,1,2].map(n=><i key={n} className={n===(screen==='packaging'?1:0)?'active':n<(screen==='packaging'?1:0)?'done':''}/>)}</div>}<button className="ap-close" aria-label="Close product creation" onClick={()=>['saved','listing'].includes(screen)?onExit():setExitOpen(true)}><img alt="" src={ap['1142:2172_imgIcon1']}/></button></header>
 {screen==='add'&&<ProductScanner variant="v2" onPhotoChange={photoChanged} initialSample={product.sample} initialPhoto={product.photo} onUse={scan}/>}
 {screen==='details'&&<><main className="ap-content"><h1 ref={heading} tabIndex={-1}>Product details</h1><div className="ap-thumb-row">{product.photo?<img src={product.photo} alt={product.name||'Product photo'}/>:<span>No photo</span>}<p className="ap-ai-note"><img alt="" src={ap['1142:2321_imgIconSparkle']}/>We’ll use this photo to design your packaging.</p></div>{scanNotice&&<small className="ap-notice">{scanNotice}</small>}{analysis&&<details className="ap-analysis"><summary>Review photo suggestions</summary>{[...analysis.questions,...analysis.warnings].map((text,index)=><p key={index}>{text}</p>)}</details>}
 <form id="ap-details" className="ap-details-form" onKeyDown={advanceField} onSubmit={e=>{e.preventDefault();try{const next={...product,ingredients:(product.ingredients+(product.ingredientInput?'\n'+product.ingredientInput:'')),ingredientInput:''};if(validProduct(next)&&reviewed){setProduct(next);go('packaging');}}catch(err){setError((err as Error).message);}}}>
 <div className="ap-category"><span>Category</span><div>{[...new Set(['Vegetables','Fruit','Herbs',...categories,product.category].filter(Boolean))].map(value=><button type="button" key={value} aria-pressed={product.category===value} onClick={()=>update('category',value)}>{value}</button>)}</div></div>{provenance('category')}
 <label className="ap-field">Product name<RequiredMark/><input required aria-label="Product name" value={product.name} maxLength={2000} onChange={e=>update('name',e.target.value)}/></label>{provenance('name')}
 <div className="ap-ingredients ap-free-ingredients"><VoiceField label="Ingredients" value={product.ingredients+(product.ingredientInput?'\n'+product.ingredientInput:'')} placeholder="Enter your product’s ingredients (optional)" mic={ap['1142:2321_imgIcon']} onChange={ingredients=>{setProduct(p=>({...p,ingredients,ingredientInput:'',ingredientsNotApplicable:false}));setReviewed(false);setTouched(keys=>[...keys,'ingredients']);}}/></div>{provenance('ingredients')}
 <AllergenPicker value={product.allergenDetails||initialAllergens(product.allergens)} labelEvidence={analysis?.fields.allergens.source==='label'?analysis.fields.allergens.evidence||undefined:undefined} onChange={value=>{setProduct(p=>({...p,allergenDetails:value,allergens:allergenStatement(value)}));setReviewed(false);}}/>
 <div className="ap-quantity-price"><label className="ap-field">Quantity<RequiredMark/><input required aria-label="Quantity" value={product.quantity} maxLength={2000} placeholder="e.g. 1 kg" onChange={e=>update('quantity',e.target.value)}/></label><CurrencyField value={product.price} onChange={value=>update('price',value)}/></div>
 <details className="ap-more"><summary>More product details</summary>{(['description','brand','nutrition','storage','expiry','producer','origin'] as FieldName[]).map(key=><label className="ap-field" key={key}>{fieldLabels[key]}<textarea maxLength={2000} value={product[key]} onChange={e=>update(key,e.target.value)}/>{provenance(key)}</label>)}</details>
 <label className="ap-confirm"><span><input required type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/><img alt="" src={ap['1142:2321_imgIconCheck']}/></span>All details are correct</label></form></main><footer className="ap-footer"><button className="v2-primary" form="ap-details" type="submit" disabled={!detailsValid||!reviewed}>Continue</button></footer></>}
 {screen==='packaging'&&<><main className="ap-content"><h1 ref={heading} tabIndex={-1}>Your packaging</h1><div className="daily-segments" role="group" aria-label="Packaging preview mode">{(['3d','photo'] as const).map(value=><button type="button" className={mode===value?'active':''} key={value} aria-pressed={mode===value} onClick={()=>setMode(value)}>{value==='3d'?'3D box':'On your photo'}</button>)}</div><div className="ap-packaging-preview">{renderPackaging()}</div><section className="ap-theme"><div><h2>Design theme</h2><button className="v2-link" onClick={onBranding}>From Design</button></div><div className="ap-themes" role="group" aria-label="Design themes">{sampleArt?themeImages.map((src,index)=><button key={src} aria-pressed={theme===index} onClick={()=>{setTheme(index);setProduct(p=>({...p,v2PackagingTheme:index}));}}><img src={src} alt=""/><span>{['Default','Harvest','Market'][index]}{theme===index&&<img alt="" src={ap['1142:2425_imgCheck']}/>}</span></button>):designs.map((kit,index)=><button key={index} aria-pressed={!!selectedBrand&&sameDesign(selectedBrand,kit)} onClick={()=>setSelectedBrand(kit)}><div><ProductLabel product={product} profile={farmProfile} brand={kit}/></div><span>{index===0?'Default':kit.concept.name}{selectedBrand&&sameDesign(selectedBrand,kit)&&<img alt="" src={ap['1142:2425_imgCheck']}/>}</span></button>)}</div></section>{sampleArt&&<small>Sample design references · the download uses your entered product details.</small>}</main><footer className="ap-footer"><div className="ap-button-row"><button className="v2-secondary ap-small-back" onClick={()=>go('details')}>Back</button><button className="v2-primary" disabled={!productCanSave(product,farmProfile,selectedBrand,reviewed)} onClick={save}>Use this design</button></div></footer></>}
 {['saved','listing'].includes(screen)&&<><main className="ap-content"><div className="ap-saved-heading"><div><span><img alt="" src={ap['1142:2502_imgIconCheck']}/></span>{screen==='saved'?'Saved in Products':product.live?'Local listing':'Saved product'}</div><h1 ref={heading} tabIndex={-1}>{product.name}</h1></div><div className="ap-saved-photo">{renderPackaging(true)}<button aria-label="Download packaging label" onClick={download}><img alt="" src={ap['1142:2502_imgIcon1']}/></button></div><div className="ap-saved-meta"><div><span>{farmProfile.farmName}</span><strong>{formatSgd(product.price)} / {product.quantity}</strong></div><small>Allergens: {product.allergens||'Not provided'}</small></div>{screen==='listing'&&<button className="v2-secondary" onClick={()=>{setReviewed(false);go('details');}}>Edit product</button>}</main><footer className="ap-footer ap-saved-footer"><button className="v2-primary ap-accent" onClick={()=>setPublishV2(true)}>Publish to marketplace</button><button className="v2-link" onClick={onCatalogue}>View in Products</button></footer></>}
 {error&&<p className="ap-error" role="alert">{error}</p>}</div>
 <MobileDialog open={exitOpen} onCancel={()=>setExitOpen(false)} title="Leave product creation?"><div className="ap-exit-actions"><button className="v2-primary" onClick={()=>{if(persist())onExit();}}>Save draft and exit</button><button className="v2-secondary" onClick={discard}>Discard and exit</button><button className="v2-link" onClick={()=>setExitOpen(false)}>Keep editing</button></div></MobileDialog>
 <MobileDialog open={voiceOpen} onCancel={()=>setVoiceOpen(false)} title="Record ingredients"><VoiceField label="Ingredients" value={product.ingredients} placeholder="Describe the ingredients" mic={ap['1142:2321_imgIcon']} onChange={text=>update('ingredients',text)}/><button className="v2-primary" onClick={()=>setVoiceOpen(false)}>Use ingredients</button></MobileDialog></div>;
}

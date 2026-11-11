// "Your brand" (Figma: Farmer Side · v1 → 9 Your brand). One main brand, the product designs made from it,
import {readDailyCatalogue} from './catalogueStorage';
// new designs from the brand, and a limited number of main-brand changes.
import {useState} from 'react';
import ProductCover,{hasOwnDesign} from './ProductCover';
import '@fontsource/courgette/latin-400.css';
import {Check,ChevronRight,Image as ImageIcon,Leaf,X} from 'lucide-react';
import './brand-page.css';
import {DailyHeader,DailyStatus} from './DailyPrimitives';
import ProductPackaging from './ProductPackaging';
import {syncShopCovers} from './shopCovers';
import DesignEditor,{FlatLabelPreview,LabelThumb,type DesignChoice} from './DesignEditor';
import {downloadPackaging} from './dailyDownloads';
import Sprout from './Sprout';
import {workspaceStorage} from './accountStorage';
import {catalogueKey,type CatalogueItem} from '../shared/dailyV2';
import {designPapers,hasDesignTweaks,labelTemplateNames,validDesignTweaks,validLabelTemplate,type LabelTemplate} from '../shared/labelTemplates';
import {presetDesignPhotos,presetImagesFor,presetPackaging} from '../shared/presetProduct';
import type {V2BrandKit} from '../shared/brandV2';
import {applyDirection,directionsFor,type DirectionKit} from '../shared/brandDirections';
import '@fontsource/bree-serif/400.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/oleo-script/latin-400.css';
import {brandPageKey,restoreBrandPage,type BrandPageState} from '../shared/brandPage';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';

type Screen={id:'overview'}|{id:'design';product?:string;extra?:string}|{id:'new'}|{id:'change'};
type Props={profile:FarmerProfile;brand:BrandKit;onBack:()=>void;onSaveBrand:(kit:BrandKit,farm:FarmerProfile)=>boolean};

const read=(key:string)=>{try{return JSON.parse(workspaceStorage.getItem(key)||'null');}catch{return null;}};
const templateOf=(item:CatalogueItem):LabelTemplate=>validLabelTemplate(item.product.labelTemplate)?item.product.labelTemplate:'botanical';
const hasDesign=(item:CatalogueItem)=>!!item.product.brandIdentity&&item.product.packagingComplete!==false;
// Designs and changes left, for the Home and Profile entries.
export function brandSummary(){const designs=readDailyCatalogue().filter(hasDesign);const page=restoreBrandPage(read(brandPageKey));return {designs:designs.length+page.extras.length,changesLeft:page.changesLeft,thumb:designs[0]?.product.photo||''};}
const patterns:Record<string,string>={Minimal:'Leaf pattern',Rustic:'Hand-drawn pattern',Playful:'Dotted pattern'};

function Wordmark({brand,name}:{brand:BrandKit;name:string}){
 return <div className="yb-wordmark-stage"><div className="yb-wordmark" style={{background:brand.concept.colors[0],fontFamily:`'${(brand as DirectionKit).logoFont||'Courgette'}', serif`}}><Leaf size={18} aria-hidden="true"/>{name}</div></div>;
}
function BrandCard({brand,profile,label}:{brand:BrandKit;profile:FarmerProfile;label?:string}){
 const kit=brand as V2BrandKit;
 return <><div className="yb-card-top"><span className="yb-tag">Main brand</span>{label&&<small>{label}</small>}</div><Wordmark brand={brand} name={profile.farmName}/><div className="yb-brand-meta"><span className="yb-swatches">{brand.concept.colors.slice(0,3).map(color=><i key={color} style={{background:color}}/>)}</span><span>{kit.headingFont||'Bricolage Grotesque'}, {kit.bodyFont||'Figtree'}</span></div><small className="yb-pattern">{(brand as DirectionKit).pattern||patterns[brand.designStyle||'Minimal']||'Leaf pattern'}</small></>;
}
function Tick({on}:{on:boolean}){return <span className={`yb-tick ${on?'on':''}`} aria-hidden="true">{on&&<Check size={14} strokeWidth={3}/>}</span>;}

export default function YourBrandV2({profile,brand,onBack,onSaveBrand}:Props){
 const [screen,setScreen]=useState<Screen>({id:'overview'});
 const [catalogue,setCatalogue]=useState(()=>readDailyCatalogue());
 const [page,setPage]=useState<BrandPageState>(()=>restoreBrandPage(read(brandPageKey)));
 const [error,setError]=useState('');
 const designs=catalogue.filter(hasDesign);
 const persist=(nextCatalogue:CatalogueItem[],nextPage:BrandPageState)=>{try{workspaceStorage.setItem(catalogueKey,JSON.stringify(nextCatalogue));workspaceStorage.setItem(brandPageKey,JSON.stringify(nextPage));setCatalogue(nextCatalogue);void syncShopCovers(nextCatalogue.filter(item=>!item.draft).map(item=>({...item.product,id:item.product.id||item.id}) as ProductDraft),profile,brand);setPage(nextPage);setError('');return true;}catch{setError('Your change could not be saved. Browser storage is full or unavailable.');return false;}};
 const go=(next:Screen)=>{setError('');setScreen(next);window.scrollTo(0,0);};
 const footer=(children:React.ReactNode)=><footer className="daily-footer yb-footer">{error&&<p role="alert" className="v2-error">{error}</p>}{children}</footer>;

 const saveDesign=(target:string|null,design:DesignChoice,name:string,extraId?:string)=>{
  const tweaks=hasDesignTweaks(design.tweaks)?design.tweaks:undefined;
  if(target){const item=catalogue.find(entry=>entry.id===target);if(!item)return;const product={...item.product,labelTemplate:design.template,designTweaks:tweaks,brandIdentity:item.product.brandIdentity||brand,packagingComplete:true};if(!tweaks)delete product.designTweaks;if(persist(catalogue.map(entry=>entry.id===target?{...item,product}:entry),page))go({id:'overview'});return;}
  const entry={id:extraId||crypto.randomUUID(),name:name||`${labelTemplateNames[design.template]} design`,template:design.template,...(tweaks?{tweaks}:{})};
  const extras=extraId?page.extras.map(extra=>extra.id===extraId?entry:extra):[...page.extras,entry];
  if(persist(catalogue,{...page,extras}))go({id:'overview'});
 };
 if(screen.id==='design')return <DesignScreen key={screen.product||screen.extra} {...{profile,brand,catalogue,page,footer}} productId={screen.product} extraId={screen.extra} onBack={()=>go({id:'overview'})} onSave={(target,design,name)=>saveDesign(target,design,name,screen.extra)}/>;
 if(screen.id==='new')return <DesignScreen key="new" isNew {...{profile,brand,catalogue,page,footer}} onBack={()=>go({id:'overview'})} onSave={(target,design,name)=>saveDesign(target,design,name)}/>;
 if(screen.id==='change')return <ChangeBrandScreen {...{profile,brand,designs,page,footer}} onBack={()=>go({id:'overview'})} onSave={(kit,ticked)=>{
  if(!onSaveBrand(kit,profile)){setError('Your brand could not be saved. Please try again.');return;}
  const nextCatalogue=catalogue.map(item=>ticked.includes(item.id)?{...item,product:{...item.product,brandIdentity:kit}}:item);
  if(persist(nextCatalogue,{...page,changesLeft:Math.max(0,page.changesLeft-1)}))go({id:'overview'});
 }}/>;

 const count=designs.length+page.extras.length;
 return <div className="app-shell v2 daily yb"><DailyHeader title="Your brand" onBack={onBack}/><main className="daily-content yb-content">
  <section className="yb-card"><BrandCard brand={brand} profile={profile} label={page.changesLeft?`${page.changesLeft} ${page.changesLeft===1?'change':'changes'} left`:'No changes left'}/><button type="button" className="v2-secondary yb-change" disabled={!page.changesLeft} onClick={()=>go({id:'change'})}>Change main brand</button></section>
  <section className="yb-designs"><div className="yb-section-heading"><h2>Product designs</h2><span>{count}</span></div>
   {count?<div className="yb-list">{designs.map(item=><button type="button" key={item.id} className="yb-row" onClick={()=>go({id:'design',product:item.id})}><span className="yb-thumb">{hasOwnDesign({...item.product,brandIdentity:item.product.brandIdentity||brand})||presetImagesFor(item.product)||item.product.photo?<ProductCover product={item.product as ProductDraft} profile={profile} brand={brand} scale={.2}/>:<ImageIcon size={20}/>}</span><span className="yb-row-copy"><strong>{item.product.name}</strong><small>{hasOwnDesign({...item.product,brandIdentity:item.product.brandIdentity||brand})?'Your own':labelTemplateNames[templateOf(item)]}</small></span><ChevronRight size={20} aria-hidden="true"/></button>)}
    {page.extras.map(extra=><button type="button" key={extra.id} className="yb-row" onClick={()=>go({id:'design',extra:extra.id})}><span className="yb-thumb"><LabelThumb design={{template:extra.template,tweaks:extra.tweaks||{}}} brand={brand} profile={profile} name={extra.name} scale={.24}/></span><span className="yb-row-copy"><strong>{extra.name}</strong><small>{extra.tweaks?'Your own':labelTemplateNames[extra.template]}</small></span><DailyStatus status="Not used yet"/></button>)}</div>
   :<p className="yb-empty">No product designs yet. Make one from your brand.</p>}
  </section>
 </main>{footer(<button type="button" className="v2-primary" onClick={()=>go({id:'new'})}>New design</button>)}</div>;
}

function DesignScreen({profile,brand,catalogue,page,productId,extraId,isNew=false,footer,onBack,onSave}:{profile:FarmerProfile;brand:BrandKit;catalogue:CatalogueItem[];page:BrandPageState;productId?:string;extraId?:string;isNew?:boolean;footer:(children:React.ReactNode)=>React.ReactNode;onBack:()=>void;onSave:(target:string|null,design:DesignChoice,name:string)=>void}){
 const extra=page.extras.find(entry=>entry.id===extraId);
 const products=catalogue.filter(item=>!item.draft||hasDesign(item));
 const [target,setTarget]=useState<string|null>(productId||null);
 const item=catalogue.find(entry=>entry.id===target);
 const saved=item?templateOf(item):extra?.template||'botanical';
 const [value,setValue]=useState<DesignChoice>(()=>{const tweaks=isNew?undefined:item?item.product.designTweaks:extra?.tweaks;return {template:isNew?'botanical':saved,tweaks:validDesignTweaks(tweaks)?tweaks:{}};});
 const [name,setName]=useState(extra?.name||'');const [mode,setMode]=useState<'3d'|'photo'>('3d');
 const {template,tweaks}=value;const own=hasDesignTweaks(tweaks)&&!(item&&presetImagesFor(item.product)===presetPackaging);const kit=item?.product.brandIdentity||brand;
 const title=isNew?'New design':item?.product.name||extra?.name||'Design';
 const images=item?presetImagesFor(item.product):null;
 // Mango Jam only has finished photos for the three themes, so it picks a theme and nothing else.
 const jamOnly=!!images&&images===presetPackaging;const view=mode==='3d'?'studio':'photo';
 const sampleImage=!isNew&&template===saved?item?.product.samplePackaging?.image:undefined;
 const product=item?{...(item.product as ProductDraft),labelTemplate:template,designTweaks:own?tweaks:undefined}:null;
 const photos=own?presetDesignPhotos(product):null;
 // On a product: the theme alone shows its finished photo; once changed, the packaging is drawn on the product's own shape.
 // With no product: only the label, because shape, name and weight come from the product it's used on.
 const preview=!product?<FlatLabelPreview design={value} brand={brand} profile={profile}/>
  :photos?<img className="yb-preview-art" src={photos[view]} alt={`${product.name} packaging`}/>
  :!own&&images?<img className="yb-preview-art" src={images[template][view]} alt={`${product.name} packaging`}/>
  :!own&&sampleImage?<img className="yb-preview-art" src={sampleImage} alt={`${product.name} packaging`}/>
  :<ProductPackaging product={product} profile={profile} brand={kit} mode={mode}/>;
 const src=photos?photos[view]:product&&!own?images?images[template][view]:sampleImage:undefined;
 const others=catalogue.filter(entry=>entry.id!==target&&hasDesign(entry));const match=others[0];
 const suggestions=[
  ...(match?[{label:`Match my ${match.product.name.split(' ').pop()!.toLowerCase()}`,apply:()=>setValue({template:templateOf(match),tweaks:validDesignTweaks(match.product.designTweaks)?match.product.designTweaks:{}})}]:[]),
  {label:'Bolder on the shelf',apply:()=>setValue(current=>({...current,tweaks:{paper:designPapers(kit)[2]||designPapers(kit)[0],layout:'band',art:'sprig'}}))},
 ];
 const options=[...products.map(entry=>({id:entry.id as string|null,name:entry.product.name})),{id:null,name:'No product yet'}];
 return <div className="app-shell v2 daily yb"><DailyHeader title={title} onBack={onBack}/><main className="daily-content yb-content">
  {isNew&&<section><h2 className="yb-label">For which product?</h2><div className="yb-list yb-options" role="radiogroup" aria-label="Product">{options.map(option=><button type="button" role="radio" aria-checked={target===option.id} key={option.id||'none'} className="yb-option" onClick={()=>setTarget(option.id)}><Tick on={target===option.id}/>{option.name}</button>)}</div>{item&&<small className="yb-note">It replaces the current packaging for {item.product.name}.</small>}</section>}
  <div className="yb-preview">{preview}</div>
  {product&&<div className="daily-segments yb-segments" role="group" aria-label="Preview">{(['3d','photo'] as const).map(option=><button type="button" key={option} aria-pressed={mode===option} className={mode===option?'active':''} onClick={()=>setMode(option)}>{option==='3d'?'3D box':'On photo'}</button>)}</div>}
  {!product&&<section className="de-section"><h2>Name</h2><input className="yb-name" value={name} maxLength={60} placeholder="Holiday gift box" onChange={e=>setName(e.target.value)}/><small>Shape, name and weight come from the product you use it on.</small></section>}
  <DesignEditor brand={kit} profile={profile} value={jamOnly?{template,tweaks:{}}:value} onChange={setValue} tileImage={images?(option=>images[option].studio):undefined} suggestions={suggestions} themesOnly={jamOnly}/>
 </main>{footer(<div className="yb-button-row">{product&&(src?<a className="v2-secondary yb-download" href={src} download={`${product.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-packaging.jpg`}>Download</a>:<button type="button" className="v2-secondary yb-download" onClick={()=>{void downloadPackaging('png',product,profile,kit).catch(()=>{});}}>Download</button>)}<button type="button" className="v2-primary" onClick={()=>onSave(target,{template,tweaks:own?tweaks:{}},name.trim())}>Save design</button></div>)}</div>;
}

function ChangeBrandScreen({profile,brand,designs,page,footer,onBack,onSave}:{profile:FarmerProfile;brand:BrandKit;designs:CatalogueItem[];page:BrandPageState;footer:(children:React.ReactNode)=>React.ReactNode;onBack:()=>void;onSave:(kit:BrandKit,ticked:string[])=>void}){
 const options=directionsFor(brand);
 const [picked,setPicked]=useState(options[0].id);
 const [ticked,setTicked]=useState(()=>designs.map(item=>item.id));const [tip,setTip]=useState(true);
 const direction=options.find(option=>option.id===picked)||options[0];
 return <div className="app-shell v2 daily yb"><DailyHeader title="Change main brand" onBack={onBack}/><main className="daily-content yb-content">
  {tip&&<aside className="yb-tip"><Sprout size="small"/><div><strong>You have {page.changesLeft} {page.changesLeft===1?'change':'changes'} left</strong><p>Your brand is how shoppers know you. Change it only when you need to.</p></div><button type="button" aria-label="Close tip" onClick={()=>setTip(false)}><X size={18}/></button></aside>}
  <section><h2 className="yb-subheading">Pick a new direction</h2><div className="yb-directions" role="radiogroup" aria-label="Brand direction">{options.map(option=>{const kit=applyDirection(brand,option);return <button type="button" role="radio" aria-checked={picked===option.id} key={option.id} className={`yb-direction ${picked===option.id?'active':''}`} onClick={()=>setPicked(option.id)}><Wordmark brand={kit} name={profile.farmName}/><strong>{option.name}</strong><span className="yb-brand-meta"><span className="yb-swatches">{option.colors.map(color=><i key={color} style={{background:color}}/>)}</span><span>{option.headingFont}, {option.bodyFont}</span></span><small className="yb-pattern">{option.pattern}</small></button>;})}</div></section>
  {!!designs.length&&<section><h2 className="yb-subheading">Update these products too?</h2><div className="yb-list yb-options">{designs.map(item=>{const on=ticked.includes(item.id);return <button type="button" role="checkbox" aria-checked={on} key={item.id} className="yb-option" onClick={()=>setTicked(list=>on?list.filter(id=>id!==item.id):[...list,item.id])}><Tick on={on}/>{item.product.name}</button>;})}</div><small className="yb-note">Products you don’t tick keep their old design.</small></section>}
 </main>{footer(<button type="button" className="v2-primary" disabled={!page.changesLeft} onClick={()=>onSave(applyDirection(brand,direction),ticked)}>Save brand</button>)}</div>;
}


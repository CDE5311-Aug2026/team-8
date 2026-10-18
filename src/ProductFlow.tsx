import DevBadge from './DevBadge';
import {workspaceStorage} from './accountStorage';
import {useState} from 'react';
import {ArrowLeft,Check,Package} from 'lucide-react';
import ProductScanner,{emptyInfo,type ProductInfo} from './ProductScanner';
import BrandPreview from './BrandPreview';
import {useAccount} from './AuthContext';
import {canPublish} from '../shared/access';
import {categories,fieldLabels,type FieldName} from '../shared/analysis';
import {canAddProduct,type FarmerProfile,type BrandKit} from '../shared/branding';

type Product=ProductInfo & {photo:string;price:string;story:string;live:boolean};
type Screen='add'|'details'|'review'|'saved'|'listing';
type Props={farmProfile:FarmerProfile;brandKit:BrandKit|null;startAt:'add'|'listing';onSaved:()=>void;onExit:()=>void;onBranding:()=>void;onCreateAccount:()=>void};
const labels:Record<Screen,string>={add:'Add product',details:'Product details',review:'Review product',saved:'Product saved',listing:'Your listing'};
export default function ProductFlow({farmProfile,brandKit,startAt,onSaved,onExit,onBranding,onCreateAccount}:Props){
 const {identity}=useAccount();
 const empty:Product={...emptyInfo(),photo:'',price:'',story:farmProfile.story,live:false};
 const [product,setProduct]=useState<Product>(()=>{if(startAt==='listing')try{return {...empty,...JSON.parse(workspaceStorage.getItem('farmily-draft')||'{}')};}catch{/* start an empty draft */}return empty;});
 const [screen,setScreen]=useState<Screen>(startAt);
 const [reviewed,setReviewed]=useState(false);const [error,setError]=useState('');
 const go=(next:Screen)=>{setScreen(next);setError('');if(next==='details')setReviewed(false);window.scrollTo({top:0,behavior:'instant'});};
 const update=(key:keyof Product,value:string)=>{setProduct(p=>({...p,[key]:value}));setReviewed(false);};
 const valid=product.name.trim()&&product.category.trim()&&product.ingredients.trim()&&product.allergens.trim()&&product.quantity.trim()&&Number(product.price)>0;
 const save=(live=false)=>{if(live&&!canPublish(identity)){onCreateAccount();return;}if(!canAddProduct(farmProfile,brandKit)){setError('Create and save your brand identity before saving a product or publishing its packaging.');return;}const next={...product,live,brandIdentity:brandKit};try{workspaceStorage.setItem('farmily-draft',JSON.stringify(next));setProduct(next);onSaved();go(live?'listing':'saved');}catch{setError('Browser storage is full. Please use a smaller photo or free some space before saving.');}};
 const scan=(info:ProductInfo,photo:string)=>{setProduct({...empty,...info,photo});go('details');};
 const sample=()=>{setProduct({...empty,name:'Heirloom Tomatoes',category:'Vegetables',ingredients:'Heirloom tomatoes',allergens:'None declared',quantity:'1 lb',price:'4.50',photo:`${import.meta.env.BASE_URL}images/tomatoes.jpg`});go('details');setError('[DEV] Sample product data — no AI analysis was performed. Review before saving.');};
 const price=`$${Number(product.price||0).toFixed(2)}`;
 const picture=product.photo?<img className="product-hero" src={product.photo} alt={product.name||'Uploaded product'}/>:<div className="product-placeholder"><Package size={36}/><span>No product photo</span></div>;
 const productCard=<section className="card product-card">{picture}<small>{farmProfile.farmName}</small><h2>{product.name}</h2><p>{price} / {product.quantity}</p>{(['ingredients','allergens','description','brand','nutrition','storage','expiry','producer','origin'] as FieldName[]).filter(key=>product[key]).map(key=><div className="info-row" key={key}><span>{fieldLabels[key]}</span><span>{product[key]}</span></div>)}</section>;
 const branding=<section className="product-branding"><div className="row"><h2>Your farm identity</h2><span className="badge">{brandKit?'Saved brand':'Not set up yet'}</span></div>{brandKit?<><BrandPreview brand={brandKit} profile={farmProfile} productName={product.name}/><small>Your saved identity, applied to this product. Packaging concept only; check the final label before printing.</small></>:<><p>Create and save your brand identity before saving this product. It is required for its packaging.</p><button className="text-button" onClick={onBranding}>Create my brand identity</button></>}</section>;
 return <div className="app-shell farmer-shell"><header><button className="icon-button back" aria-label="Back" onClick={()=>screen==='add'||screen==='listing'||screen==='saved'?onExit():go(screen==='details'?'add':'details')}><ArrowLeft/></button><h1>{labels[screen]}</h1></header><main className="product-main">
  {['add','details','review'].includes(screen)&&<div className="progress"><small>{labels[screen]} · Step {screen==='add'?1:screen==='details'?2:3} of 3</small><div role="progressbar" aria-label="Add product progress" aria-valuenow={screen==='add'?1:screen==='details'?2:3} aria-valuemin={0} aria-valuemax={3}><i style={{width:`${(screen==='add'?1:screen==='details'?2:3)/3*100}%`}}/></div></div>}
  {error&&<p className="scan-error" role="alert">{error}</p>}
  {screen==='add'&&<><div className="soft-callout"><small>{brandKit?'Your saved farm identity will be used for this product.':'Create your brand identity first to unlock product creation.'}</small></div><ProductScanner onUse={scan} onSample={sample}/></>}
  {screen==='details'&&<><p>Check the photo results and add anything missing. Your farm story is already linked to this product.</p><form onSubmit={event=>{event.preventDefault();if(valid&&reviewed)go('review')}}>
   {(['name','category','ingredients','allergens','quantity','price'] as const).map(key=><label className="field" key={key}><span>{key==='price'?'Price ($)':fieldLabels[key]}</span>{key==='category'?<select required value={product.category} onChange={e=>update(key,e.target.value)}><option value="">Choose a category</option>{categories.map(category=><option key={category}>{category}</option>)}</select>:<input required type={key==='price'?'number':'text'} min={key==='price'?'0.01':undefined} step={key==='price'?'0.01':undefined} value={product[key]} onChange={e=>update(key,e.target.value)}/>}</label>)}
   <details className="extra-details"><summary>More product details</summary>{(['description','brand','nutrition','storage','expiry','producer','origin'] as FieldName[]).map(key=><label className="field" key={key}><span>{fieldLabels[key]}</span><textarea rows={3} value={product[key]} onChange={e=>update(key,e.target.value)}/></label>)}</details>
   <label className="check-row"><input type="checkbox" required checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>I’ve checked the ingredients and allergens. “None declared” is used only when confirmed.</label><button className="button primary" type="submit" disabled={!valid||!reviewed}>Review my product</button>
  </form></>}
  {screen==='review'&&<><p>A final look before saving your product.</p>{productCard}<button className="text-button" onClick={()=>go('details')}>Edit product information</button>{branding}<section className="card"><h2>Your farm story</h2><p>{farmProfile.story||'No farm story added yet.'}</p><small>From your farmer profile · reused across your products.</small></section><button className="button primary" onClick={()=>save()}>Save product to catalogue</button></>}
  {screen==='saved'&&<div className="saved-screen"><div className="success-icon"><Check/></div><h2>Your product is ready</h2><p><DevBadge/> Saved as a local draft. Your onboarding progress has been updated.</p>{productCard}<div className="actions"><button className="button primary" onClick={onExit}>Back to home</button><button className="button secondary" onClick={()=>go('listing')}>Preview my listing</button></div></div>}
  {screen==='listing'&&<><div className="soft-callout"><DevBadge/> {product.live?'Published in this local prototype':'Draft listing · only visible in this browser'}</div>{productCard}{branding}<section className="card"><h2>Meet {farmProfile.farmName}</h2><p>{farmProfile.story||'Your farm story will appear here.'}</p><p>{farmProfile.philosophy}</p>{farmProfile.photos.map(photo=><figure className="reference-photo" key={photo.id}><img src={photo.url} alt={`Original ${photo.kind} photo supplied by the farmer`}/><figcaption>Original photo supplied by the farmer</figcaption></figure>)}</section><div className="actions"><button className="button secondary" onClick={()=>go('details')}>Edit product</button><button className="button primary" onClick={()=>save(!product.live)}>{product.live?'Return to draft':identity?'[DEV] Publish locally':'Create an account to publish'}</button><button className="text-button" onClick={onExit}>Back to home</button></div></>}
 </main></div>;
}

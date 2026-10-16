import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {ArrowRight,Check,Home,Package,Palette,UserRound,Leaf,Plus,Sparkles,X,ShoppingBag} from 'lucide-react';
import ProductFlow from './ProductFlow';
import BrandPreview from './BrandPreview';
import ProductsEmptyState from './ProductsEmptyState';
import {blankProfile,sampleProfile,sampleConcepts,signature,onboardingCount,canAddProduct,validProfile,validConcept,type FarmerProfile,type BrandKit,type BrandConcept,type FarmPhoto} from '../shared/branding';

function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
function readProfile(){try{return validProfile(read('farmily-profile',null));}catch{return null;}}
function readBrand():BrandKit|null{try{const value=read<BrandKit|null>('farmily-brand',null);if(!value||!['ai','sample'].includes(value.origin)||!['ai','uploaded','none'].includes(value.imageSource)||typeof value.profileSignature!=='string')return null;validConcept(value.concept);return value;}catch{return null;}}
type BrandWork={concepts:BrandConcept[];selected:number;origin:'ai'|'sample';image:string|null;basis:string};
function readWork():BrandWork|null{try{const work=read<BrandWork|null>('farmily-brand-work',null);if(!work||!Array.isArray(work.concepts)||!work.concepts.length||work.concepts.length>3||!['ai','sample'].includes(work.origin)||typeof work.basis!=='string'||!Number.isInteger(work.selected)||!work.concepts[work.selected])return null;work.concepts.forEach(validConcept);return work;}catch{return null;}}
type View='home'|'profile'|'branding'|'products'|'orders'|'add'|'listing';
type SavedProduct={name:string;photo:string;quantity:string;price:string;live:boolean;brandIdentity:BrandKit};
function readProduct():SavedProduct|null{
 const product=read<SavedProduct|null>('farmily-draft',null);
 // Legacy demo drafts predate the required product-to-brand association.
 if(!product?.brandIdentity){
  if(product?.name==='Heirloom Tomatoes'&&product.photo?.endsWith('/images/tomatoes.jpg')&&product.price==='4.50'&&product.quantity==='1 lb')try{localStorage.removeItem('farmily-draft');}catch{/* excluded from the catalogue regardless */}
  return null;
 }
 try{validConcept(product.brandIdentity.concept);return product;}catch{return null;}
}
export default function FarmerApp(){
 const [work]=useState(readWork);
 const [profile,setProfile]=useState<FarmerProfile|null>(readProfile);
 const [draft,setDraft]=useState<FarmerProfile>(()=>readProfile()||blankProfile);
 const [brand,setBrand]=useState<BrandKit|null>(readBrand);
 const [view,setView]=useState<View>(()=>readProfile()?'home':'profile');
 const [product,setProduct]=useState<SavedProduct|null>(readProduct);
 const [concepts,setConcepts]=useState<BrandConcept[]>(()=>{const stored=readBrand();return work?.concepts||(stored?[stored.concept]:[])});
 const [selected,setSelected]=useState(work?.selected||0);
 const [conceptOrigin,setConceptOrigin]=useState<'ai'|'sample'>(()=>work?.origin||readBrand()?.origin||'sample');
 const [image,setImage]=useState<string|null>(()=>work?.image||(readBrand()?.imageSource==='ai'?readBrand()?.image||null:null));
 const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState<'concepts'|'image'|null>(null);
 const [accessCode,setAccessCode]=useState('');const [approved,setApproved]=useState(false);const [uploading,setUploading]=useState(false);
 const [basis,setBasis]=useState(()=>work?.basis||readBrand()?.profileSignature||'');
 const brandReturn=useRef<View>('home');
 const controller=useRef<AbortController|null>(null);const photoReader=useRef<FileReader|null>(null);
 const pick=useRef<HTMLInputElement>(null);const photoKind=useRef<FarmPhoto['kind']>('farm');
 useEffect(()=>()=>{controller.current?.abort();photoReader.current?.abort();},[]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setError('');},[view]);
 const move=(next:View)=>{const target=next==='add'&&!canAddProduct(profile,brand)?'branding':next;if(target==='branding'&&view!=='branding')brandReturn.current=view;controller.current?.abort();controller.current=null;setBusy(null);setView(target);setNotice('');};
 const store=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{setError('Browser storage is full. Remove a photo or keep this page open; your changes are available in this session.');return false;}};
 const saveProfile=(value:FarmerProfile)=>{try{validProfile(value);if(uploading||!store('farmily-profile',value))return;setProfile(value);setDraft(value);setApproved(false);move('home');}catch(err){setError((err as Error).message);}};
 const update=(key:Exclude<keyof FarmerProfile,'photos'>,value:string)=>setDraft(p=>({...p,[key]:value}));
 const choosePhoto=(kind:FarmPhoto['kind'])=>{photoKind.current=kind;pick.current?.click();};
 const uploadPhoto=(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>512*1024){setError('Choose a JPG, PNG or WebP photo smaller than 512 KB.');return;}
  if(draft.photos.length>=3){setError('You can add up to three reference photos. Remove one to replace it.');return;}
  setError('');setUploading(true);photoReader.current?.abort();const reader=new FileReader();photoReader.current=reader;
  const kind=photoKind.current;reader.onload=()=>{setDraft(p=>({...p,photos:[...p.photos,{id:crypto.randomUUID(),kind,name:file.name,url:String(reader.result)}]}));setUploading(false);};reader.onerror=()=>{setError('We could not open this photo. Please try another.');setUploading(false);};reader.readAsDataURL(file);
 };
 async function generate(action:'concepts'|'image'){
  if(!profile||busy)return;setError('');setBusy(action);setApproved(false);
  const active=new AbortController();controller.current=active;const timeout=setTimeout(()=>active.abort(),action==='image'?100000:55000);
  try{
   const response=await fetch('/api/branding',{method:'POST',headers:{'Content-Type':'application/json',...(accessCode?{'X-Scan-Token':accessCode}:{})},signal:active.signal,body:JSON.stringify({action,profile,concept:concepts[selected]})});
   const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.error||'Branding generation is unavailable. Please try again.');
   if(controller.current!==active)return;
   if(action==='concepts'){if(!Array.isArray(data?.concepts)||data.concepts.length!==3)throw new Error('The branding ideas could not be read.');setConcepts(data.concepts.map(validConcept));setConceptOrigin('ai');setSelected(0);setImage(null);setBasis(signature(profile));}
   else {if(data?.source!=='ai'||typeof data.image!=='string'||!data.image.startsWith('data:image/png;base64,'))throw new Error('The illustration could not be read.');setImage(data.image);}
  }catch(err){if(controller.current===active)setError(err instanceof Error&&err.name==='AbortError'?'Generation stopped. Your profile and existing ideas are saved.':(err as Error).message);}
  finally{clearTimeout(timeout);if(controller.current===active){setBusy(null);controller.current=null;}}
 }
 const useSamples=()=>{if(!profile)return;setConcepts(sampleConcepts);setConceptOrigin('sample');setSelected(0);setImage(null);setBasis(signature(profile));setApproved(false);setError('');};
 const reference=profile?.photos.find(photo=>photo.kind==='products')||profile?.photos[0];
 const current:BrandKit|null=profile&&concepts[selected]?{concept:concepts[selected],origin:conceptOrigin,image:image||reference?.url||null,imageSource:image?'ai':reference?'uploaded':'none',profileSignature:basis}:null;
 const brandCurrent=canAddProduct(profile,brand);
 const completion=onboardingCount(profile,brand,!!product);
 const saveBrand=()=>{if(!current||!approved||!profile||basis!==signature(profile))return;if(store('farmily-brand',current)){try{localStorage.removeItem('farmily-brand-work');}catch{/* keep saved identity */}setBrand(current);move(brandReturn.current);setNotice('Your brand identity is saved. It will be reused for your product packaging.');}};
 const pauseBrand=()=>{if(concepts.length&&!store('farmily-brand-work',{concepts,selected,origin:conceptOrigin,image,basis}))return;move(brandReturn.current);};
 if((view==='add'||view==='listing')&&profile&&(view==='listing'||brandCurrent))return <ProductFlow key={view} farmProfile={profile} brandKit={brandCurrent?brand:null} startAt={view==='listing'?'listing':'add'} onExit={()=>move('home')} onBranding={()=>move('branding')} onSaved={()=>setProduct(readProduct())}/>;
 return <div className={`app-shell farmer-shell ${view==='branding'?'branding-flow':''}`}>
  <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadPhoto}/>
  <header className="farmer-header"><span className="farmily-logo"><Leaf size={22}/> Farmily</span>{view==='branding'?<button className="icon-button close-branding" aria-label="Close brand creation" onClick={pauseBrand}><X size={23}/></button>:<span className="farmer-role">For farmers</span>}</header>
  <main className="farmer-main">
  {view==='profile'&&<>
   <span className="eyebrow">{profile?'YOUR FARM PROFILE':'WELCOME TO FARMILY'}</span><h1>{profile?'Tell your story':'Let’s get to know your farm'}</h1><p className="intro">A few details to make Farmily yours. You can build your brand and add products after this.</p>
   <form className="profile-form" onSubmit={e=>{e.preventDefault();saveProfile(draft);}}>
    <section className="card"><h2>The basics</h2>{([['farmerName','Your name','Alex'],['farmName','Farm name','Your farm’s name'],['location','Location (optional)','City or region'],['products','What do you sell?','Vegetables, honey, fresh herbs…']] as const).map(([key,label,placeholder])=><label className="field" key={key}><span>{label}</span><input required={key!=='location'} maxLength={2500} value={draft[key]} placeholder={placeholder} onChange={e=>update(key,e.target.value)}/></label>)}</section>
    <section className="card"><h2>The story behind your farm</h2><label className="field"><span>Your story (optional)</span><textarea maxLength={2500} rows={4} placeholder="How did your farm begin? What would you like people to know?" value={draft.story} onChange={e=>update('story',e.target.value)}/></label><label className="field"><span>Your philosophy (optional)</span><textarea maxLength={2500} rows={3} placeholder="What matters most in the way you grow or make your products?" value={draft.philosophy} onChange={e=>update('philosophy',e.target.value)}/></label><small>We’ll use your own words to inspire your brand identity. You can add more later.</small></section>
    <section className="card"><div className="row"><h2>Show us your world</h2><span className="badge">Optional</span></div><p>Photos of your farm, products or process help shape your brand. You can continue without any.</p><div className="photo-upload-grid">{(['farm','products','process'] as const).map(kind=><button className="reference-upload" type="button" key={kind} disabled={uploading||draft.photos.length>=3} onClick={()=>choosePhoto(kind)}><Plus size={20}/><span>{kind==='farm'?'Your farm':kind==='products'?'Your products':'Your process'}</span></button>)}</div><small>Up to 3 photos · JPG, PNG or WebP · 512 KB each</small>{draft.photos.map(photo=><figure className="reference-photo" key={photo.id}><img src={photo.url} alt={`${photo.kind} photo provided by you`}/><figcaption>{photo.kind} · Your photo</figcaption><button type="button" className="icon-button" aria-label={`Remove ${photo.name}`} onClick={()=>setDraft(p=>({...p,photos:p.photos.filter(item=>item.id!==photo.id)}))}><X size={18}/></button></figure>)}</section>
    {error&&<p role="alert" className="scan-error">{error}</p>}<button className="button primary" type="submit" disabled={uploading}>{uploading?'Opening photo…':profile?'Save profile':'Create my profile'}</button>
    {!profile&&<button type="button" className="text-button sample-link" onClick={()=>saveProfile(sampleProfile)}>Explore with a sample farm</button>}
   </form>
  </>}
  {view==='home'&&profile&&<>
   <div className="welcome-row"><div><span className="eyebrow">YOUR FARM, YOUR STORY</span><h1>Welcome, {profile.farmerName.trim().split(' ')[0]}</h1></div><span className="farm-avatar"><Leaf/></span></div>
   {profile.photos.find(photo=>photo.kind==='farm')?<img className="home-farm-photo" src={profile.photos.find(photo=>photo.kind==='farm')!.url} alt="Your farm photo"/>:<div className="home-farm-placeholder"><Leaf size={40}/><div><strong>{profile.farmName}</strong><span>{profile.location||'Growing your Farmily story'}</span></div><small>No farm photo added</small></div>}
   <section className="onboarding-card"><div className="row"><h2>{completion===3?'You’re all set':'Make yourself at home'}</h2><span className="completion-number">{completion}/3</span></div><p>{completion===3?'Your profile, brand identity and first product are ready.':completion===2?'One more step to bring your farm to life.':'Your profile is ready. A couple more steps will bring your farm to life.'}</p><div className="onboarding-track" role="progressbar" aria-label="Farm onboarding" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={3}><span style={{width:`${completion/3*100}%`}}/></div>
    <button className="onboarding-step" onClick={()=>{setDraft(profile);move('profile')}}><span className="step-marker complete"><Check size={16}/></span><span><strong>Create your profile</strong><small>Tell the story of your farm</small></span><span className="step-done">Done</span></button>
    <button className="onboarding-step" onClick={()=>move('branding')}><span className={`step-marker ${brandCurrent?'complete':''}`}>{brandCurrent?<Check size={16}/>:2}</span><span><strong>Create your brand identity</strong><small>{brand&&!brandCurrent?'Your profile changed · review your branding':'Colours, personality and packaging'}</small></span><ArrowRight size={18}/></button>
    <button className="onboarding-step" onClick={()=>move(product?'products':'add')}><span className={`step-marker ${product?'complete':''}`}>{product?<Check size={16}/>:3}</span><span><strong>Add your first product</strong><small>{brandCurrent?'Give your harvest a place to shine':'Create your brand identity to unlock'}</small></span>{product?<span className="step-done">Done</span>:brandCurrent?<ArrowRight size={18}/>:<span className="badge">Locked</span>}</button>
   </section>
   <section className="farm-ai-summary"><span className="eyebrow"><Sparkles size={15}/> FARMILY AI · YOUR BRAND BRIEF</span><h2>{profile.farmName}</h2><p>{profile.story||'Your farm story will help shape a brand that feels like you.'}</p><div className="brief-products">{profile.products.split(',').slice(0,4).map(item=><span key={item}>{item.trim()}</span>)}</div><small>{profile.philosophy||'Add your philosophy to make your branding brief more personal.'}</small><button className="text-button" onClick={()=>move('branding')}>Turn your story into a brand <ArrowRight size={14}/></button><small>Based on your profile · AI concepts can be reviewed and edited.</small></section>
   <div className="section-label"><h2>Your products</h2><button onClick={()=>move('products')}>{product?'1 product':'No products yet'}</button></div>{product?<button className="home-product" onClick={()=>move('listing')}>{product.photo&&<img src={product.photo} alt={product.name}/>}<span><strong>{product.name}</strong><small>{product.live?'Local listing':'Draft'} · ${product.price} / {product.quantity}</small></span><ArrowRight size={18}/></button>:<ProductsEmptyState brandReady={brandCurrent} onContinue={()=>move('add')}/>}
   <h2 className="suggestions-title">✦ Your next steps</h2><div className="home-suggestions"><button onClick={()=>move('branding')}><Palette/><span>Branding</span><small>{brandCurrent?'View identity':'Recommended'}</small></button><button onClick={()=>move('add')}><Package/><span>Products</span><small>{brandCurrent?'Add your harvest':'Brand identity required'}</small></button><button onClick={()=>{setDraft(profile);move('profile')}}><UserRound/><span>Your story</span><small>Make it yours</small></button></div>
  </>}
  {view==='branding'&&profile&&<>
   <span className="eyebrow">ONBOARDING · YOUR BRAND IDENTITY</span><h1>A brand that feels like you</h1><p className="intro">Your story, your values, your products. One identity to bring them together, from your farm page to your packaging.</p>
   <section className="card brand-brief"><div className="row"><h2>Your starting point</h2><button className="text-button" onClick={()=>{setDraft(profile);move('profile')}}>Edit profile</button></div><h3>{profile.farmName}</h3><dl><dt>Your products</dt><dd>{profile.products}</dd><dt>Your story</dt><dd>{profile.story||'Not added yet'}</dd><dt>Your philosophy</dt><dd>{profile.philosophy||'Not added yet'}</dd></dl>{profile.photos.length?<div className="brief-photo-strip">{profile.photos.map(photo=><figure key={photo.id}><img src={photo.url} alt={`Your ${photo.kind} reference`}/><figcaption>Your {photo.kind} photo</figcaption></figure>)}</div>:<div className="no-photos-note"><Leaf size={20}/><p>No photos? No problem. We can build ideas from your words. You can also generate a decorative illustration later.</p></div>}</section>
   <details className="scan-access"><summary>Have an AI access code?</summary><label className="field"><span>AI access code</span><input type="password" autoComplete="off" value={accessCode} onChange={e=>setAccessCode(e.target.value)}/></label></details>
   <small className="generation-note">Generate sends your farm story, products, philosophy and optional reference photos to OpenAI. Your name and location are not sent.</small>
   <button className="button primary" disabled={!!busy} onClick={()=>void generate('concepts')}><Sparkles size={17}/>{busy==='concepts'?'Finding your brand directions…':concepts.length?'Generate new ideas':'Generate my brand ideas'}</button>
   <button className="text-button sample-link" disabled={!!busy} onClick={useSamples}>Explore sample concepts — no AI call</button>
   {busy&&<button className="text-button" onClick={()=>controller.current?.abort()}>Cancel generation</button>}{error&&<p className="scan-error" role="alert">{error}</p>}
   {current&&<>
    <div className="section-label"><h2>Your brand directions</h2><span className="badge">{conceptOrigin==='sample'?'Sample concepts':'AI suggestions'}</span></div><div className="brand-tabs" aria-label="Brand directions">{concepts.map((concept,index)=><button key={concept.id} disabled={!!busy} aria-pressed={selected===index} className={selected===index?'selected':''} onClick={()=>{setSelected(index);setImage(null);setApproved(false);}}>{index+1}. {concept.name}</button>)}</div>
    {basis!==signature(profile)&&<p className="scan-error">Your profile has changed. Generate new ideas or reopen the sample concepts before saving.</p>}
    <BrandPreview brand={current} profile={profile}/>
    <section className="card concept-detail"><h2>{current.concept.name}</h2><p>{current.concept.rationale}</p><div className="palette">{current.concept.colors.map((color,index)=><label key={index}><input type="color" aria-label={`Brand colour ${index+1}`} value={color} disabled={!!busy} onChange={e=>{const next=[...concepts];next[selected]={...next[selected],colors:next[selected].colors.map((c,i)=>i===index?e.target.value:c)};setConcepts(next);setApproved(false);}}/><span>{color}</span></label>)}</div><label className="field"><span>Tagline</span><input maxLength={200} disabled={!!busy} value={current.concept.tagline} onChange={e=>{setConcepts(items=>items.map((item,i)=>i===selected?{...item,tagline:e.target.value}:item));setApproved(false);}}/></label><h3>Packaging direction</h3><p>{current.concept.packaging}</p><small>This identity will be reused for each product. Product names and label information stay specific to that product.</small></section>
    {!profile.photos.length&&<section className="illustration-option"><h2>Bring your story to life</h2><p>Optionally create a decorative illustration from what you wrote. It won’t be presented as a real photo of your farm.</p><button className="button secondary" disabled={!!busy||basis!==signature(profile)} onClick={()=>void generate('image')}>{busy==='image'?'Creating your illustration…':image?'Generate another illustration':'Generate an AI illustration'}</button>{image&&<button className="text-button" disabled={!!busy} onClick={()=>{setImage(null);setApproved(false)}}>Use typography only</button>}</section>}
    <label className="check-row"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/>I’ve reviewed this brand direction and how its visuals are described.</label><button className="button primary" disabled={!approved||!!busy||basis!==signature(profile)||!current.concept.tagline.trim()} onClick={saveBrand}>Save my brand identity</button>
   </>}
   <button className="text-button sample-link" onClick={pauseBrand}>Save this step for later</button>
  </>}
  {view==='products'&&profile&&<><span className="eyebrow">YOUR FARM CATALOGUE</span><h1>Your products</h1>{product?<button className="home-product" onClick={()=>move('listing')}>{product.photo&&<img src={product.photo} alt={product.name}/>}<span><strong>{product.name}</strong><small>{product.live?'Local listing':'Draft'}</small></span><ArrowRight/></button>:<ProductsEmptyState brandReady={brandCurrent} onContinue={()=>move('add')}/>}{product&&<button className="button primary" onClick={()=>move('add')}><Plus size={18}/>{brandCurrent?'Add a product':'Create my brand identity'}</button>}</>}
  {view==='orders'&&profile&&<><span className="eyebrow">YOUR FARM BUSINESS</span><h1>Orders</h1><div className="empty-products orders-empty"><ShoppingBag size={40}/><h2>No orders yet</h2><p>You’ll find customer orders and their fulfilment status here.</p><button className="button secondary" onClick={()=>move('products')}>View my products</button></div></>}
  {notice&&<p className="soft-callout" role="status">{notice}</p>}
  </main>
  {profile&&view!=='branding'&&<nav className="farmer-nav" aria-label="Farmer navigation">{([{id:'home',label:'Home',Icon:Home},{id:'products',label:'Products',Icon:Package},{id:'orders',label:'Orders',Icon:ShoppingBag},{id:'profile',label:'Profile',Icon:UserRound}] as const).map(({id,label,Icon})=><button key={id} className={view===id?'active':''} aria-current={view===id?'page':undefined} onClick={()=>{if(id==='profile')setDraft(profile);move(id)}}><Icon size={21}/><span>{label}</span></button>)}</nav>}
 </div>;
}

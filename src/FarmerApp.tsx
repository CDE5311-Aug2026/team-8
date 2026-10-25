import FarmStoryFields from './FarmStoryFields';
import {DailyAnalytics,ProductPerformance} from './FarmAnalytics';
import {formatSgd} from '../shared/currency';
import RequiredMark from './RequiredMark';
import DevBadge from './DevBadge';
import {workspaceStorage} from './accountStorage';
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {ArrowLeft,ArrowRight,BarChart3,Check,Home,Package,Palette,UserRound,Leaf,Plus,X,ShoppingBag} from 'lucide-react';
import ProductFlow from './ProductFlow';
import {useAccount} from './AuthContext';
import {workspaceKeys} from '../shared/access';
import BrandIdentityFlow from './BrandIdentityFlow';
import BrandDesigns from './BrandDesigns';
import {brandLibraryKey,restoreDesigns,keepDesign} from '../shared/brandLibrary';
import ProductsEmptyState from './ProductsEmptyState';
import {advanceField} from './mobileForms';
import ProductTags from './ProductTags';
import OnboardingProgress from './OnboardingProgress';
import {addProducts} from '../shared/products';
import AccountCard from './AccountCard';
import {onboardingDraftKey,parseOnboardingDraft} from '../shared/onboarding';
import {blankProfile,sampleProfile,signature,onboardingCount,canAddProduct,validProfile,validConcept,type FarmerProfile,type BrandKit,type FarmPhoto} from '../shared/branding';

function read<T>(key:string,fallback:T):T{try{return JSON.parse(workspaceStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
function readProfile(){try{return validProfile(read('farmily-profile',null));}catch{return null;}}
function readBrand():BrandKit|null{try{const value=read<BrandKit|null>('farmily-brand',null);if(!value||!['ai','sample','existing'].includes(value.origin)||!['ai','uploaded','none'].includes(value.imageSource)||typeof value.profileSignature!=='string')return null;validConcept(value.concept);return value;}catch{return null;}}
function readDesigns(){const designs=restoreDesigns(read(brandLibraryKey,[]));const current=readBrand();const farm=readProfile();return current&&farm?keepDesign(designs,current,farm,null):designs;}
type View='account-offer'|'home'|'profile'|'branding'|'products'|'orders'|'add'|'listing'|'performance';
type SavedProduct={name:string;photo:string;quantity:string;price:string;live:boolean;brandIdentity:BrandKit};
function readProduct():SavedProduct|null{
 const product=read<SavedProduct|null>('farmily-draft',null);
 // Legacy demo drafts predate the required product-to-brand association.
 if(!product?.brandIdentity){
  if(product?.name==='Heirloom Tomatoes'&&product.photo?.endsWith('/images/tomatoes.jpg')&&product.price==='4.50'&&product.quantity==='1 lb')try{workspaceStorage.removeItem('farmily-draft');}catch{/* excluded from the catalogue regardless */}
  return null;
 }
 try{validConcept(product.brandIdentity.concept);return product;}catch{return null;}
}
export default function FarmerApp({onChangeRole,onCreateAccount,onSignIn,onSignOut}:{onChangeRole:()=>void;onCreateAccount:()=>void;onSignIn:()=>void;onSignOut:()=>Promise<void>}){
 const {identity,sync,syncError}=useAccount();
 const [accountCardDismissed,setAccountCardDismissed]=useState(()=>read('farmily-account-dismissed',false));
 const [restoredDraft]=useState(()=>parseOnboardingDraft(read(onboardingDraftKey,null)));
 const [profileStep,setProfileStep]=useState(()=>restoredDraft?.step||0);
 const [pendingProducts,setPendingProducts]=useState(()=>restoredDraft?.pendingProducts||'');
 const [draftError,setDraftError]=useState('');
 const profileHeading=useRef<HTMLHeadingElement>(null);
 const [savedProfile,setProfile]=useState<FarmerProfile|null>(readProfile);
 const profile=savedProfile||blankProfile;
 const [setupDeferred]=useState(()=>read('farmily-onboarding-skipped',false));
 const [draft,setDraft]=useState<FarmerProfile>(()=>readProfile()||restoredDraft?.profile||blankProfile);
 const [brandDesigns,setBrandDesigns]=useState(readDesigns);
 const [startNewBrand,setStartNewBrand]=useState(false);
 const [brand,setBrand]=useState<BrandKit|null>(readBrand);
 const [onboarding,setOnboarding]=useState(()=>!readProfile()&&!read('farmily-onboarding-skipped',false));
 const [publishImmediately,setPublishImmediately]=useState(false);
 const [view,setView]=useState<View>(()=>readProfile()||read('farmily-onboarding-skipped',false)?'home':'profile');
 const [product,setProduct]=useState<SavedProduct|null>(readProduct);
 const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [confirmDelete,setConfirmDelete]=useState(false);
 const [uploading,setUploading]=useState(false);
 const brandReturn=useRef<View>('home');
 const photoReader=useRef<FileReader|null>(null);
 const pick=useRef<HTMLInputElement>(null);const photoKind=useRef<FarmPhoto['kind']>('farm');
 useEffect(()=>()=>{photoReader.current?.abort();},[]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setError('');},[view]);
 const move=(next:View)=>{setPublishImmediately(false);setStartNewBrand(false);if(next==='profile'&&!savedProfile){setOnboarding(true);}const target=next==='add'&&!canAddProduct(savedProfile,brand)?'branding':next;if(target==='branding'&&view!=='branding')brandReturn.current=view;setView(target);setNotice('');};
 const store=(key:string,value:unknown)=>{try{workspaceStorage.setItem(key,JSON.stringify(value));return true;}catch{setError('Browser storage is full. Remove a photo or keep this page open; your changes are available in this session.');return false;}};
 const saveProfile=(value:FarmerProfile,sample=false)=>{try{validProfile(value);if(uploading||!store('farmily-profile',value))return;setProfile(value);setDraft(value);setOnboarding(false);try{workspaceStorage.removeItem(onboardingDraftKey);}catch{/* completed profile remains saved */}move((onboarding||!savedProfile)&&!identity&&!sample?'account-offer':'home');}catch(err){setError((err as Error).message);}};
 useEffect(()=>{if(onboarding&&view==='profile'){window.scrollTo({top:0,behavior:'instant'});profileHeading.current?.focus({preventScroll:true});}},[profileStep,onboarding,view]);
 useEffect(()=>{
  if(!onboarding||view!=='profile')return;
  try{workspaceStorage.setItem(onboardingDraftKey,JSON.stringify({profile:draft,step:profileStep,pendingProducts}));setDraftError('');}
  catch{setDraftError('Your draft could not be saved in this browser. Keep this page open and remove a photo before trying again.');}
 },[draft,profileStep,pendingProducts,onboarding,view]);
 useEffect(()=>{if(view==='account-offer')profileHeading.current?.focus({preventScroll:true});},[view]);
 const dismissAccount=()=>{setAccountCardDismissed(true);try{workspaceStorage.setItem('farmily-account-dismissed','true');}catch{/* dismiss for this visit */}};
 const deleteProfile=()=>{try{for(const key of workspaceKeys)workspaceStorage.removeItem(key);onChangeRole();}catch{setError('We could not delete your saved profile. Please try again.');}};
 const update=(key:Exclude<keyof FarmerProfile,'photos'>,value:string)=>setDraft(p=>({...p,[key]:value}));
 const choosePhoto=(kind:FarmPhoto['kind'])=>{photoKind.current=kind;pick.current?.click();};
 const uploadPhoto=(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>512*1024){setError('Choose a JPG, PNG or WebP photo smaller than 512 KB.');return;}
  if(draft.photos.length>=3){setError('You can add up to three reference photos. Remove one to replace it.');return;}
  setError('');setUploading(true);photoReader.current?.abort();const reader=new FileReader();photoReader.current=reader;
  const kind=photoKind.current;reader.onload=()=>{setDraft(p=>({...p,photos:[...p.photos,{id:crypto.randomUUID(),kind,name:file.name,url:String(reader.result)}]}));setUploading(false);};reader.onerror=()=>{setError('We could not open this photo. Please try another.');setUploading(false);};reader.readAsDataURL(file);
 };
 const brandCurrent=canAddProduct(savedProfile,brand);
 const completion=onboardingCount(savedProfile,brand,!!product);
 if(view==='account-offer')return <div className="app-shell account-offer"><header className="farmer-header"><span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main"><div className="profile-saved-icon"><Check size={32}/></div><h1 ref={profileHeading} tabIndex={-1}>Your farm profile is ready</h1><p className="intro">Create an account to save your farm across devices.</p><section className="card saved-profile-summary"><Leaf size={23}/><div><h2>{profile.farmName}</h2><p>Your farm profile is saved in this browser.</p></div><Check size={19}/></section><div className="welcome-actions"><button className="button primary" onClick={onCreateAccount}>Create account</button><p className="account-signin-link">Already have an account? <button className="text-button" onClick={onSignIn}>Sign in</button></p><button className="button secondary" onClick={()=>{dismissAccount();move('home');}}>Continue as guest</button><button className="text-button" onClick={()=>{setDraft(profile);setOnboarding(true);setProfileStep(2);move('profile');}}>Edit farm profile</button></div></main></div>;
 if(view==='performance'&&product)return <ProductPerformance product={product} onClose={()=>move('home')} onManage={()=>move('listing')} onPublish={()=>{move('listing');setPublishImmediately(true);}} onBranding={()=>{move('branding');setStartNewBrand(true);}}/>;
 if(view==='branding')return <BrandIdentityFlow startNew={startNewBrand} profile={savedProfile} brand={brand} onExit={()=>move(brandReturn.current)} onHome={()=>move('home')} onAddProduct={()=>move('add')} onCreateAccount={onCreateAccount} onEditProfile={()=>{setDraft(profile);move('profile');}} onSaveProfile={farm=>{try{validProfile(farm);if(!store('farmily-profile',farm))return false;setProfile(farm);setDraft(farm);return true;}catch{return false;}}} onSaveBrand={(kit,farm)=>{try{validProfile(farm);validConcept(kit.concept);if(kit.profileSignature!==signature(farm))return false;const designs=keepDesign(brandDesigns,kit,farm);if(!store(brandLibraryKey,designs)||!store('farmily-profile',farm)||!store('farmily-brand',kit))return false;setBrandDesigns(designs);setProfile(farm);setDraft(farm);setBrand(kit);return true;}catch{return false;}}}/>;
 if((view==='add'||view==='listing')&&profile&&(view==='listing'||brandCurrent))return <ProductFlow publishOnOpen={publishImmediately} onCatalogue={()=>move('products')} onPerformance={()=>move('performance')} onCreateAccount={onCreateAccount} key={view} farmProfile={profile} brandKit={brandCurrent?brand:null} startAt={view==='listing'?'listing':'add'} onExit={()=>move(view==='listing'?'products':'home')} onBranding={()=>move('branding')} onSaved={()=>setProduct(readProduct())}/>;
 return <div className="app-shell farmer-shell">
  <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadPhoto}/>
  <header className="farmer-header">{onboarding&&profileStep===0&&<button type="button" className="icon-button back" aria-label={profileStep>0?'Previous step':setupDeferred?'Back to home':'Back to welcome'} disabled={uploading} onClick={()=>{if(profileStep>0){setProfileStep(step=>step-1);setError('');}else if(setupDeferred){setOnboarding(false);move('home');}else onChangeRole();}}><ArrowLeft/></button>}<span className="farmily-logo"><Leaf size={22}/> Farmily</span>{onboarding?null:<span className="farmer-role">{identity?.demo?<><DevBadge/> Demo farmer</>:identity?'Farmer':'Guest · Farmer'}</span>}</header>
  <main className="farmer-main" onKeyDown={advanceField}>
  {view==='profile'&&<>
   {onboarding&&<OnboardingProgress step={profileStep} profile={draft}/>}<h1 ref={profileHeading} tabIndex={-1}>{onboarding?['Let’s get to know your farm','Tell the story behind your farm','Show us your world'][profileStep]:'Your farm profile'}</h1>
   {!onboarding&&<AccountCard onCreateAccount={onCreateAccount} onSignOut={onSignOut} onError={setError}/>}<form className="profile-form" onSubmit={e=>{e.preventDefault();try{const pending=String(new FormData(e.currentTarget).get('pendingProducts')||'');const next={...draft,products:addProducts(draft.products,pending)};if(onboarding&&profileStep<2){if(profileStep===0)validProfile(next);setDraft(next);setPendingProducts('');setError('');setProfileStep(step=>step+1);}else saveProfile(next);}catch(err){setError((err as Error).message);}}}>
    {(!onboarding||profileStep===0)&&<section className="card">{!onboarding&&<h2>The basics</h2>}{([['farmerName','Your name','Alex'],['farmName','Farm name','Your farm’s name'],['location','Location (optional)','City or region']] as const).map(([key,label,placeholder])=><label className="field" key={key}><span>{label}{key!=='location'&&<RequiredMark/>}</span><input name={key} autoComplete={key==='farmerName'?'name':key==='farmName'?'organization':'address-level2'} autoCapitalize="words" enterKeyHint="next" required={key!=='location'} maxLength={2500} value={draft[key]} placeholder={placeholder} onChange={e=>update(key,e.target.value)}/></label>)}<ProductTags value={draft.products} onChange={value=>update('products',value)} pendingValue={pendingProducts} onPendingChange={setPendingProducts}/></section>}
    {(!onboarding||profileStep===1)&&<section className="card">{!onboarding&&<h2>The story behind your farm</h2>}<FarmStoryFields value={draft} onChange={patch=>setDraft(value=>({...value,...patch}))}/></section>}
    {(!onboarding||profileStep===2)&&<section className="card">{!onboarding&&<div className="row"><h2>Show us your world</h2><span className="badge">Optional</span></div>}<div className="photo-upload-grid">{(['farm','products','process'] as const).map(kind=><button className="reference-upload" type="button" key={kind} disabled={uploading||draft.photos.length>=3} onClick={()=>choosePhoto(kind)}><Plus size={20}/><span>{kind==='farm'?'Your farm':kind==='products'?'Your products':'Your process'}</span></button>)}</div><small>Up to 3 photos · JPG, PNG or WebP · 512 KB each</small>{draft.photos.map(photo=><figure className="reference-photo" key={photo.id}><img src={photo.url} alt={`${photo.kind} photo provided by you`}/><figcaption>{photo.kind} · Your photo</figcaption><button type="button" className="icon-button" aria-label={`Remove ${photo.name}`} onClick={()=>setDraft(p=>({...p,photos:p.photos.filter(item=>item.id!==photo.id)}))}><X size={18}/></button></figure>)}</section>}
    {error&&<p role="alert" className="scan-error">{error}</p>}<div className="step-navigation">{onboarding&&profileStep>0&&<button className="button secondary" type="button" disabled={uploading} onClick={()=>{setProfileStep(step=>step-1);setError('');}}>Previous</button>}<button className="button primary" type="submit" disabled={uploading}>{uploading?'Opening photo…':onboarding?(profileStep===2?'Save farm profile':'Continue'):'Save profile'}</button></div>
    {onboarding&&profileStep>0&&(profileStep===1?!draft.story.trim()&&!draft.philosophy.trim():!draft.photos.length)&&<button type="button" className="text-button skip-profile-step" disabled={uploading} onClick={()=>{setError('');if(profileStep===1)setProfileStep(2);else saveProfile(draft);}}>Skip for now</button>}
    {onboarding&&(draftError?<p className="scan-error" role="alert">{draftError}</p>:<small className="draft-save-status" role="status">Draft saved in this browser</small>)}
    {!savedProfile&&<><button type="button" className="text-button sample-link" onClick={()=>saveProfile(sampleProfile,true)} disabled={uploading}><DevBadge/> Explore with a sample farm</button></>}
   </form>
   {!onboarding&&<BrandDesigns designs={brandDesigns} current={brand} onCreate={()=>{move('branding');setStartNewBrand(true);}}/>}
   {savedProfile&&!onboarding&&<section className="profile-delete-section">{confirmDelete?<div className="card" role="alert"><h2>Delete your farm profile?</h2><p>This clears your farm details, brand identity and product drafts from this workspace and returns you to Welcome. Your account will remain.</p><button type="button" className="button delete-profile-button" onClick={deleteProfile}>Delete profile and return to Welcome</button><button type="button" className="button secondary" onClick={()=>setConfirmDelete(false)}>Keep my profile</button></div>:<button type="button" className="text-button delete-profile-link" onClick={()=>setConfirmDelete(true)}>Delete farm profile</button>}</section>}
  </>}
  {view==='home'&&profile&&<>
   {!identity&&!accountCardDismissed&&<AccountCard onCreateAccount={onCreateAccount} onSignOut={onSignOut} onError={setError} onClose={dismissAccount}/>}
   {identity&&<small className="account-sync" role="status">{identity?.demo?<><DevBadge/> Demo progress saved on this device</>:sync==='saved'?'Progress saved to your account':sync==='saving'?'Saving to your account…':syncError||'Drafts saved on this device'}</small>}
   <div className="welcome-row"><div><span className="eyebrow">YOUR FARM, YOUR STORY</span><h1>{savedProfile?`Welcome, ${profile.farmerName.trim().split(' ')[0]}`:'Welcome to Farmily'}</h1></div><span className="farm-avatar"><Leaf/></span></div>
   {profile.photos.find(photo=>photo.kind==='farm')?<img className="home-farm-photo" src={profile.photos.find(photo=>photo.kind==='farm')!.url} alt="Your farm photo"/>:<div className="home-farm-placeholder"><Leaf size={40}/><div><strong>{profile.farmName||'Your farm'}</strong><span>{profile.location||'Growing your Farmily story'}</span></div><small>No farm photo added</small></div>}
   <section className="onboarding-card"><div className="row"><h2>{completion===4?'You’re all set':'Make yourself at home'}</h2><span className="completion-number">{completion}/4</span></div><p>{completion===0?'Explore Farmily now. Complete these steps whenever you’re ready to set up your farm.':completion===4?'Your farm is ready to welcome customers.':completion===3?'Your first product is ready. Publish it to start selling.':`${4-completion} steps left to bring your farm to life.`}</p><div className="onboarding-track" role="progressbar" aria-label="Farm onboarding" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={4}><span style={{width:`${completion/4*100}%`}}/></div>
    <button className="onboarding-step" onClick={()=>{setDraft(profile);move('profile')}}><span className={`step-marker ${savedProfile?'complete':''}`}>{savedProfile?<Check size={16}/>:1}</span><span><strong>Create your profile</strong><small>Tell the story of your farm</small></span>{savedProfile?<span className="step-done">Done</span>:<ArrowRight size={18}/>}</button>
    <button className="onboarding-step" onClick={()=>move('branding')}><span className={`step-marker ${brandCurrent?'complete':''}`}>{brandCurrent?<Check size={16}/>:2}</span><span><strong>Create your brand identity</strong><small>{brand&&!brandCurrent?'Your profile changed · review your branding':'Colours, personality and packaging'}</small></span>{brandCurrent?<span className="step-done">Done</span>:<ArrowRight size={18}/>}</button>
    <button type="button" className="onboarding-step product-onboarding-step" disabled={!brandCurrent||!!product} onClick={()=>move('add')}><span className={`step-marker ${product?'complete':''}`}>{product?<Check size={16}/>:3}</span><span><strong>Add your first product</strong><small>{product?'Your first product is saved':brandCurrent?'Create your first product listing':'Create your brand identity to unlock'}</small></span>{product?<span className="step-done">Done</span>:brandCurrent?<ArrowRight size={18}/>:<span className="badge">Locked</span>}</button>
    <button type="button" className="onboarding-step product-onboarding-step" disabled={!product} onClick={()=>move('products')}><span className="step-marker">4</span><span><strong>Publish your first product</strong><small>{product?'Review your product and publish to the marketplace':'Add your first product to unlock'}</small></span>{product?<ArrowRight size={18}/>:<span className="badge">Locked</span>}</button>
   </section>
   <DailyAnalytics product={product} brandReady={brandCurrent} onBranding={()=>{move('branding');setStartNewBrand(true);}} onProduct={()=>move('add')} onPublish={()=>move('products')}/>
   <div className="section-label"><h2>Your products</h2><button onClick={()=>move('products')}>{product?'1 product':'No products yet'}</button></div>{product?<button className="home-product" onClick={()=>move('performance')}>{product.photo&&<img src={product.photo} alt={product.name}/>}<span><strong>{product.name}</strong><small>{product.live?'[DEV] Local listing':'Not published'} · {formatSgd(product.price)} / {product.quantity}</small></span><BarChart3 size={20} aria-hidden="true"/></button>:<ProductsEmptyState brandReady={brandCurrent} onContinue={()=>move('add')}/>}
  </>}
  {view==='products'&&profile&&<><span className="eyebrow">YOUR FARM CATALOGUE</span><h1>Your products</h1>{product?<button className="home-product" onClick={()=>move('listing')}>{product.photo&&<img src={product.photo} alt={product.name}/>}<span><strong>{product.name}</strong><small>{product.live?'[DEV] Local listing':'Not published'}</small></span><ArrowRight/></button>:<ProductsEmptyState brandReady={brandCurrent} onContinue={()=>move('add')}/>}{product&&<button className="button primary" onClick={()=>move('add')}><Plus size={18}/>{brandCurrent?'Add a product':'Create my brand identity'}</button>}</>}
  {view==='orders'&&profile&&<><span className="eyebrow">YOUR FARM BUSINESS</span><h1>Orders</h1><div className="empty-products orders-empty"><ShoppingBag size={40}/><DevBadge/><h2>No orders yet</h2><p>Orders are a preview for now. Customer orders and fulfilment are not connected yet.</p><button className="button secondary" onClick={()=>move('products')}>View my products</button></div></>}
  {notice&&<p className="soft-callout" role="status">{notice}</p>}
  </main>
  {profile&&!onboarding&&<nav className="farmer-nav" aria-label="Farmer navigation">{([{id:'home',label:'Home',Icon:Home},{id:'products',label:'Products',Icon:Package},{id:'orders',label:'Orders',Icon:ShoppingBag},{id:'profile',label:'Profile',Icon:UserRound}] as const).map(({id,label,Icon})=><button key={id} className={view===id?'active':''} aria-current={view===id?'page':undefined} onClick={()=>{if(id==='profile')setDraft(profile);move(id)}}><Icon size={21}/><span>{label}</span></button>)}</nav>}
 </div>;
}

import PublishingFlow from './PublishingFlow';
import FarmStoryFields from './FarmStoryFields';
import {localDemo} from './demoMode';
import ProductDetails,{type DetailTab} from './ProductDetails';
import ProductsPage from './ProductsPage';
import OrdersPage from './OrdersPage';
import ProfilePage from './ProfilePage';
import FarmerHome from './FarmerHome';
import DashboardIcon from './DashboardIcon';
import {readCatalogue,saveCatalogueProduct} from './catalogueStorage';
import type {CatalogueProduct} from '../shared/catalogue';
import type {NextAction} from '../shared/demoDashboard';
import DemoOrders from './DemoOrders';
import RequiredMark from './RequiredMark';
import DevBadge from './DevBadge';
import {workspaceStorage} from './accountStorage';
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {ArrowLeft,Check,Leaf,Plus,X} from 'lucide-react';
import ProductFlow from './ProductFlow';
import {useAccount} from './AuthContext';
import {workspaceKeys} from '../shared/access';
import BrandIdentityFlow from './BrandIdentityFlow';
import BrandDesigns from './BrandDesigns';
import {brandLibraryKey,restoreDesigns,keepDesign,editDesign,rebrandProducts} from '../shared/brandLibrary';
import ProductsEmptyState from './ProductsEmptyState';
import {advanceField} from './mobileForms';
import ProductTags from './ProductTags';
import OnboardingProgress from './OnboardingProgress';
import {addProducts} from '../shared/products';
import AccountCard from './AccountCard';
import {onboardingDraftKey,parseOnboardingDraft} from '../shared/onboarding';
import {blankProfile,sampleProfile,signature,canAddProduct,validProfile,validConcept,type FarmerProfile,type BrandKit,type FarmPhoto} from '../shared/branding';

function read<T>(key:string,fallback:T):T{try{return JSON.parse(workspaceStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
function readProfile(){try{return validProfile(read('farmily-profile',null));}catch{return null;}}
function readBrand():BrandKit|null{try{const value=read<BrandKit|null>('farmily-brand',null);if(!value||!['ai','sample','existing'].includes(value.origin)||!['ai','uploaded','none'].includes(value.imageSource)||typeof value.profileSignature!=='string')return null;validConcept(value.concept);return value;}catch{return null;}}
function readDesigns(){const designs=restoreDesigns(read(brandLibraryKey,[]));const current=readBrand();const farm=readProfile();return current&&farm?keepDesign(designs,current,farm,null):designs;}
type View='account-offer'|'home'|'profile'|'branding'|'products'|'orders'|'add'|'listing'|'performance'|'edit'|'profile-edit'|'publish';
export default function FarmerApp({onChangeRole,onCreateAccount,onSignIn,onSignOut}:{onChangeRole:()=>void;onCreateAccount:()=>void;onSignIn:()=>void;onSignOut:()=>Promise<void>}){
 const {identity}=useAccount();
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
 const [editingBrand,setEditingBrand]=useState<BrandKit|null>(null);
 const [detailTab,setDetailTab]=useState<DetailTab>('Overview');
 const [brand,setBrand]=useState<BrandKit|null>(readBrand);
 const [onboarding,setOnboarding]=useState(()=>!readProfile()&&!read('farmily-onboarding-skipped',false));
 const [publishImmediately,setPublishImmediately]=useState(false);
 const [view,setView]=useState<View>(()=>readProfile()||read('farmily-onboarding-skipped',false)?'home':'profile');
 const [products,setProducts]=useState(readCatalogue);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const product=products.find(p=>p.id===selectedId)||products[0]||null;
 const savedProduct=(p:CatalogueProduct)=>{setProducts(readCatalogue());setSelectedId(p.id);};
 const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [confirmDelete,setConfirmDelete]=useState(false);
 const [uploading,setUploading]=useState(false);
 const brandReturn=useRef<View>('home');
 const photoReader=useRef<FileReader|null>(null);
 const pick=useRef<HTMLInputElement>(null);const photoKind=useRef<FarmPhoto['kind']>('farm');
 useEffect(()=>()=>{photoReader.current?.abort();},[]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setError('');},[view]);
 const move=(next:View)=>{if(next!=='branding')setEditingBrand(null);setPublishImmediately(false);setStartNewBrand(false);if(next==='profile'&&!savedProfile){setOnboarding(true);}const target=next==='add'&&!canAddProduct(savedProfile,brand)?'branding':next;if(target==='branding'&&view!=='branding')brandReturn.current=view;setView(target);setNotice('');};
 const store=(key:string,value:unknown)=>{try{workspaceStorage.setItem(key,JSON.stringify(value));return true;}catch{setError('Browser storage is full. Remove a photo or keep this page open; your changes are available in this session.');return false;}};
 const saveProfile=(value:FarmerProfile,sample=false)=>{try{validProfile(value);if(uploading||!store('farmily-profile',value))return;setProfile(value);setDraft(value);setOnboarding(false);try{workspaceStorage.removeItem(onboardingDraftKey);}catch{/* completed profile remains saved */}move(view==='profile-edit'?'profile':(onboarding||!savedProfile)&&!identity&&!sample?'account-offer':'home');}catch(err){setError((err as Error).message);}};
 useEffect(()=>{if(onboarding&&view==='profile'){window.scrollTo({top:0,behavior:'instant'});profileHeading.current?.focus({preventScroll:true});}},[profileStep,onboarding,view]);
 useEffect(()=>{
  if(!onboarding||view!=='profile')return;
  try{workspaceStorage.setItem(onboardingDraftKey,JSON.stringify({profile:draft,step:profileStep,pendingProducts}));setDraftError('');}
  catch{setDraftError('Your draft could not be saved in this browser. Keep this page open and remove a photo before trying again.');}
 },[draft,profileStep,pendingProducts,onboarding,view]);
 useEffect(()=>{if(view==='account-offer')profileHeading.current?.focus({preventScroll:true});},[view]);
 const dismissAccount=()=>{try{workspaceStorage.setItem('farmily-account-dismissed','true');}catch{/* dismiss for this visit */}};
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
 const openProduct=(p:CatalogueProduct)=>{setSelectedId(p.id);setDetailTab('Overview');move('listing');};
 const navigate=(v:'home'|'products'|'orders'|'profile')=>{if(v==='profile')setDraft(profile);move(v);};
 const homeAction=(a:NextAction)=>{if(a.kind==='profile'){setDraft(profile);move('profile');}else if(a.kind==='branding'){move('branding');setStartNewBrand(true);}else if(a.kind==='add'){move('add');}else if(a.kind==='publish'){setSelectedId(a.productId||products[0]?.id||null);const target=products.find(p=>p.id===(a.productId||products[0]?.id));const unfinished=a.id==='finish'||target?.packagingComplete===false;setDetailTab(unfinished?'Packaging':'Overview');move(unfinished?'listing':'publish');}};
 if(view==='account-offer')return <div className="app-shell account-offer"><header className="farmer-header"><span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main"><div className="profile-saved-icon"><Check size={32}/></div><h1 ref={profileHeading} tabIndex={-1}>Your farm profile is ready</h1><p className="intro">{localDemo?'Try a demo account, or keep exploring as a guest.':'Create an account to save your farm across devices.'}</p><section className="card saved-profile-summary"><Leaf size={23}/><div><h2>{profile.farmName}</h2><p>Your farm profile is saved in this browser.</p></div><Check size={19}/></section><div className="welcome-actions"><button className="button primary" onClick={onCreateAccount}>Create account</button><p className="account-signin-link">Already have an account? <button className="text-button" onClick={onSignIn}>Sign in</button></p><button className="button secondary" onClick={()=>{dismissAccount();move('home');}}>Continue as guest</button><button className="text-button" onClick={()=>{setDraft(profile);setOnboarding(true);setProfileStep(2);move('profile');}}>Edit farm profile</button></div></main></div>;
 if(view==='publish'&&product)return <PublishingFlow key={product.id} product={product} profile={profile} onSave={p=>{saveCatalogueProduct(p);savedProduct(p);}} onBack={()=>move('listing')} onProducts={()=>move('products')} onAdd={()=>move('add')}/>;
 if((view==='listing'||view==='performance')&&product)return <ProductDetails key={product.id+view+detailTab} initialTab={view==='performance'?'Analytics':detailTab} onStartPublish={()=>move('publish')} product={product} profile={profile} onBack={()=>move('products')} onEdit={()=>move('edit')} onBranding={()=>{move('branding');setStartNewBrand(true);}} onProfile={()=>move('profile')}/>;
 if(view==='products')return <ProductsPage products={products} brandReady={brandCurrent} onAdd={()=>move('add')} onOpen={openProduct} onNavigate={navigate}/>;
 if(view==='orders')return <OrdersPage products={products} onNavigate={navigate}/>;
 if(view==='profile'&&!onboarding)return <ProfilePage profile={profile} designs={brandDesigns} products={products} onEditFarm={()=>{setDraft(profile);move('profile-edit');}} onCreateBrand={()=>{move('branding');setStartNewBrand(true);}} onEditBrand={kit=>{move('branding');setEditingBrand(kit);}} onPackaging={p=>{setSelectedId(p.id);setDetailTab('Packaging');move('listing');}} onNavigate={navigate} onSignOut={onSignOut} onDeleteGuest={deleteProfile} onCreateAccount={onCreateAccount}/>;
 if(view==='branding')return <BrandIdentityFlow preferSaved={!!editingBrand} startNew={startNewBrand} profile={savedProfile} brand={editingBrand||brand} onExit={()=>move(brandReturn.current)} onHome={()=>move('home')} onAddProduct={()=>move('add')} onCreateAccount={onCreateAccount} onEditProfile={()=>{setDraft(profile);move('profile');}} onSaveProfile={farm=>{try{validProfile(farm);if(!store('farmily-profile',farm))return false;setProfile(farm);setDraft(farm);return true;}catch{return false;}}} onSaveBrand={(kit,farm)=>{try{validProfile(farm);validConcept(kit.concept);if(kit.profileSignature!==signature(farm))return false;const designs=editingBrand?editDesign(brandDesigns,editingBrand,kit,farm):keepDesign(brandDesigns,kit,farm);const linked=editingBrand?rebrandProducts(products,editingBrand,kit):products;const updates:Record<string,unknown>={[brandLibraryKey]:designs,'farmily-profile':farm,'farmily-brand':kit,'farmily-products':linked};const backup=Object.fromEntries(Object.keys(updates).map(key=>[key,workspaceStorage.getItem(key)]));try{for(const [key,value] of Object.entries(updates))workspaceStorage.setItem(key,JSON.stringify(value));}catch{for(const [key,value] of Object.entries(backup)){try{if(value===null)workspaceStorage.removeItem(key);else workspaceStorage.setItem(key,value);}catch{}}return false;}setBrandDesigns(designs);setProfile(farm);setDraft(farm);setBrand(kit);setProducts(linked);return true;}catch{return false;}}}/>;
 if((view==='add'||view==='edit')&&profile&&(view==='edit'||brandCurrent))return <ProductFlow onRequestPublish={p=>{setSelectedId(p.id);move('publish');}} editOnOpen={view==='edit'} publishOnOpen={publishImmediately} onCatalogue={()=>move('products')} onPerformance={()=>move('performance')} onCreateAccount={onCreateAccount} initialProduct={view==='edit'?product||undefined:undefined} key={view==='edit'?view+product?.id:view} farmProfile={profile} brandKit={brandCurrent?brand:null} startAt={view==='edit'?'listing':'add'} onExit={()=>move(view==='edit'?'listing':'products')} onBranding={()=>move('branding')} onSaved={savedProduct}/>;
 return <div className={"app-shell farmer-shell "+(view==="home"?"dashboard-shell":"")}>
  <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadPhoto}/>
  {view==='profile-edit'?<header className="fp-edit-header"><h1>Farm details</h1><button aria-label="Close farm editing" onClick={()=>move('profile')}><X/></button></header>:<header className="farmer-header">{onboarding&&profileStep===0&&<button type="button" className="icon-button back" aria-label={profileStep>0?'Previous step':setupDeferred?'Back to home':'Back to welcome'} disabled={uploading} onClick={()=>{if(profileStep>0){setProfileStep(step=>step-1);setError('');}else if(setupDeferred){setOnboarding(false);move('home');}else onChangeRole();}}><ArrowLeft/></button>}<span className="farmily-logo">{view==="home"?<DashboardIcon name="lucide-leaf"/>:<Leaf size={22}/>} Farmily</span>{onboarding?null:<span className="farmer-role">{identity?.demo?<><DevBadge/> Demo farmer</>:identity?'Farmer':'Guest · Farmer'}</span>}</header>}
  <main className={"farmer-main "+(view==="home"?"dashboard-main":"")} onKeyDown={advanceField}>
  {(view==='profile'||view==='profile-edit')&&<>
   {onboarding&&<OnboardingProgress step={profileStep} profile={draft}/>}<h1 className={view==='profile-edit'?'sr-only':undefined} ref={profileHeading} tabIndex={-1}>{onboarding?['Let’s get to know your farm','Tell the story behind your farm','Show us your world'][profileStep]:'Edit farm details'}</h1>
   {!onboarding&&view!=='profile-edit'&&<AccountCard onCreateAccount={onCreateAccount} onSignOut={onSignOut} onError={setError}/>}<form className="profile-form" onSubmit={e=>{e.preventDefault();try{const pending=String(new FormData(e.currentTarget).get('pendingProducts')||'');const next={...draft,products:addProducts(draft.products,pending)};if(onboarding&&profileStep<2){if(profileStep===0)validProfile(next);setDraft(next);setPendingProducts('');setError('');setProfileStep(step=>step+1);}else saveProfile(next);}catch(err){setError((err as Error).message);}}}>
    {(!onboarding||profileStep===0)&&<section className="card">{!onboarding&&<h2>The basics</h2>}{([['farmerName','Your name','Alex'],['farmName','Farm name','Your farm’s name'],['location','Location (optional)','City or region']] as const).map(([key,label,placeholder])=><label className="field" key={key}><span>{label}{key!=='location'&&<RequiredMark/>}</span><input name={key} autoComplete={key==='farmerName'?'name':key==='farmName'?'organization':'address-level2'} autoCapitalize="words" enterKeyHint="next" required={key!=='location'} maxLength={2500} value={draft[key]} placeholder={placeholder} onChange={e=>update(key,e.target.value)}/></label>)}{view==='profile-edit'&&<label className="field"><span>Address</span><input name="farmAddress" autoComplete="street-address" value={draft.address||''} placeholder="Street address" maxLength={2500} onChange={e=>update('address',e.target.value)}/></label>}<ProductTags value={draft.products} onChange={value=>update('products',value)} pendingValue={pendingProducts} onPendingChange={setPendingProducts}/></section>}
    {(!onboarding||profileStep===1)&&<section className="card">{!onboarding&&<h2>The story behind your farm</h2>}<FarmStoryFields value={draft} onChange={patch=>setDraft(value=>({...value,...patch}))}/></section>}
    {(!onboarding||profileStep===2)&&<section className="card">{!onboarding&&<div className="row"><h2>Show us your world</h2><span className="badge">Optional</span></div>}<div className="photo-upload-grid">{(['farm','products','process'] as const).map(kind=><button className="reference-upload" type="button" key={kind} disabled={uploading||draft.photos.length>=3} onClick={()=>choosePhoto(kind)}><Plus size={20}/><span>{kind==='farm'?'Your farm':kind==='products'?'Your products':'Your process'}</span></button>)}</div><small>Up to 3 photos · JPG, PNG or WebP · 512 KB each</small>{draft.photos.map(photo=><figure className="reference-photo" key={photo.id}><img src={photo.url} alt={`${photo.kind} photo provided by you`}/><figcaption>{photo.kind} · Your photo</figcaption><button type="button" className="icon-button" aria-label={`Remove ${photo.name}`} onClick={()=>setDraft(p=>({...p,photos:p.photos.filter(item=>item.id!==photo.id)}))}><X size={18}/></button></figure>)}</section>}
    {error&&<p role="alert" className="scan-error">{error}</p>}<div className="step-navigation">{onboarding&&profileStep>0&&<button className="button secondary" type="button" disabled={uploading} onClick={()=>{setProfileStep(step=>step-1);setError('');}}>Previous</button>}<button className="button primary" type="submit" disabled={uploading}>{uploading?'Opening photo…':onboarding?(profileStep===2?'Save farm profile':'Continue'):'Save profile'}</button></div>
    {onboarding&&profileStep>0&&(profileStep===1?!draft.story.trim()&&!draft.philosophy.trim():!draft.photos.length)&&<button type="button" className="text-button skip-profile-step" disabled={uploading} onClick={()=>{setError('');if(profileStep===1)setProfileStep(2);else saveProfile(draft);}}>Skip for now</button>}
    {onboarding&&(draftError?<p className="scan-error" role="alert">{draftError}</p>:<small className="draft-save-status" role="status">Draft saved in this browser</small>)}
    {!savedProfile&&<><button type="button" className="text-button sample-link" onClick={()=>saveProfile(sampleProfile,true)} disabled={uploading}><DevBadge/> Explore with a sample farm</button></>}
   </form>
   {!onboarding&&view!=='profile-edit'&&<BrandDesigns designs={brandDesigns} current={brand} onCreate={()=>{move('branding');setStartNewBrand(true);}}/>}
   {savedProfile&&!onboarding&&view!=='profile-edit'&&<section className="profile-delete-section">{confirmDelete?<div className="card" role="alert"><h2>Delete your farm profile?</h2><p>This clears your farm details, brand identity and product drafts from this workspace and returns you to Welcome. Your account will remain.</p><button type="button" className="button delete-profile-button" onClick={deleteProfile}>Delete profile and return to Welcome</button><button type="button" className="button secondary" onClick={()=>setConfirmDelete(false)}>Keep my profile</button></div>:<button type="button" className="text-button delete-profile-link" onClick={()=>setConfirmDelete(true)}>Delete farm profile</button>}</section>}
  </>}
  {view==='home'&&<FarmerHome profile={savedProfile} products={products} brandReady={brandCurrent} onProducts={()=>move('products')} onProduct={openProduct} onAdd={()=>move('add')} onBranding={()=>{move('branding');setStartNewBrand(true);}} onAction={homeAction}/>}
  {error&&view!=='profile'&&<p className="scan-error" role="alert">{error}</p>}
  {notice&&<p className="soft-callout" role="status">{notice}</p>}
  </main>
  {profile&&!onboarding&&<nav className="farmer-nav" aria-label="Farmer navigation">{([{id:'home',label:'Home'},{id:'products',label:'Products'},{id:'orders',label:'Orders'},{id:'profile',label:'Profile'}] as const).map(({id,label})=><button key={id} className={view===id?'active':''} aria-current={view===id?'page':undefined} onClick={()=>{if(id==='profile')setDraft(profile);move(id)}}><DashboardIcon name={({'home':'lucide-house','products':'lucide-package','orders':'lucide-shopping-bag','profile':'lucide-user-round'})[id]}/><span>{label}</span></button>)}</nav>}
 </div>;
}

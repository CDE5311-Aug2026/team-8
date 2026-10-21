import RequiredMark from './RequiredMark';
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {X} from 'lucide-react';
import {useAccount} from './AuthContext';
import {authClient} from './authClient';
import {workspaceStorage} from './accountStorage';
import {advanceField} from './mobileForms';
import BrandPreview from './BrandPreview';
import DevBadge from './DevBadge';
import {blankProfile,canAddProduct,imageDisclosure,signature,validConcept,validProfile,type BrandKit,type FarmerProfile} from '../shared/branding';
import {brandPalettes,buildBrand,demoConcepts,designStyles,existingBrand,restoreBrandWork,type BrandStage,type BrandWork} from '../shared/brandFlow';
import './brand-identity.css';

const asset=(file:string)=>`${import.meta.env.BASE_URL}images/branding/${file}`;
type Props={startNew?:boolean;profile:FarmerProfile|null;brand:BrandKit|null;onExit:()=>void;onHome:()=>void;onAddProduct:()=>void;onCreateAccount:()=>void;onEditProfile:()=>void;onSaveProfile:(profile:FarmerProfile)=>boolean;onSaveBrand:(brand:BrandKit,profile:FarmerProfile)=>boolean};

function initialWork(profile:FarmerProfile,brand:BrandKit|null,startNew=false):BrandWork{
 if(startNew)brand=null;
 else try{const work=restoreBrandWork(JSON.parse(workspaceStorage.getItem('farmily-brand-work')||'null'),profile);if(work)return work.stage==='saved'&&!canAddProduct(profile,brand)?{...work,stage:work.concepts.length?'preview':'setup'}:work;}catch{/* start from the saved profile */}
 const current=canAddProduct(profile,brand);
 return {version:2,stage:current?'saved':'setup',choice:brand?.origin==='existing'?'existing':'create',profile,concepts:current&&brand&&brand.origin!=='existing'?[brand.concept]:[],selected:0,palette:-1,style:brand?.designStyle?designStyles.indexOf(brand.designStyle):0,handwritten:brand?.handwritten||false,image:brand?.imageSource==='ai'?brand.image:null,origin:brand?.origin==='ai'?'ai':'sample',basis:brand?.profileSignature||'',refinement:''};
}

function Mockup({brand,profile,packaging=false}:{brand:BrandKit;profile:FarmerProfile;packaging?:boolean}){
 const customized=brand.designStyle!=='Minimal'||brand.handwritten||brand.concept.colors.join()!==brandPalettes[0].join()||brand.concept.tagline!==demoConcepts[0].tagline;
 if(brand.origin==='sample'&&!customized)return <div className="brand-mockup sample-mockup"><img className="brand-sample-image" src={asset(packaging?'sample-packaging.png':'sample-label.png')} alt={packaging?'Sample AI-generated packaging reference from the Figma design':'Sample AI-generated product label reference from the Figma design'}/><span className="brand-image-label">✦ AI-generated · sample</span></div>;
 return <div className={`brand-mockup live-mockup ${packaging?'packaging-mockup':''}`}><BrandPreview brand={brand} profile={profile}/>{brand.imageSource==='ai'&&<span className="brand-image-label">✦ AI-generated</span>}</div>;
}

export default function BrandIdentityFlow({startNew=false,profile,brand,onExit,onHome,onAddProduct,onCreateAccount,onEditProfile,onSaveProfile,onSaveBrand}:Props){
 const {identity}=useAccount();const [work,setWork]=useState(()=>initialWork(profile||blankProfile,brand,startNew));
 const [saved,setSaved]=useState(brand);const [error,setError]=useState('');const [storageError,setStorageError]=useState('');const [uploading,setUploading]=useState(false);const [previewIndex,setPreviewIndex]=useState(0);const [status,setStatus]=useState('');
 const controller=useRef<AbortController|null>(null);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const reader=useRef<FileReader|null>(null);const fileInput=useRef<HTMLInputElement>(null);const heading=useRef<HTMLHeadingElement>(null);const carousel=useRef<HTMLDivElement>(null);
 const workRef=useRef(work);workRef.current=work;
 const entryDraft=useRef<string|null>(workspaceStorage.getItem('farmily-brand-work'));
 const [exitOpen,setExitOpen]=useState(false);
 const exitDialog=useRef<HTMLDialogElement>(null);
 const feedback=useRef<HTMLParagraphElement>(null);
 const update=(patch:Partial<BrandWork>)=>{setError('');setStatus('');setWork(value=>({...value,...patch}));};
 const persist=(value:BrandWork)=>{try{workspaceStorage.setItem('farmily-brand-work',JSON.stringify(value));setStorageError('');return true;}catch{setStorageError('Your design draft could not be saved. Remove a photo or keep this page open before continuing.');return false;}};
 useEffect(()=>{persist(work);},[work]);
 useEffect(()=>{
  const dialog=exitDialog.current;
  if(!dialog)return;
  if(!exitOpen){dialog.close();return;}
  const alignToApp=()=>{
   const frame=dialog.parentElement?.getBoundingClientRect();if(!frame)return;
   const top=Math.max(0,frame.top);
   Object.assign(dialog.style,{left:`${frame.left}px`,top:`${top}px`,width:`${frame.width}px`,height:`${Math.max(0,Math.min(window.innerHeight,frame.bottom)-top)}px`});
  };
  alignToApp();dialog.showModal();
  window.addEventListener('resize',alignToApp);window.addEventListener('scroll',alignToApp,{passive:true});
  return()=>{window.removeEventListener('resize',alignToApp);window.removeEventListener('scroll',alignToApp);};
 },[exitOpen]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});},[work.stage]);
 useEffect(()=>{if(error)feedback.current?.scrollIntoView({block:'nearest'});},[error]);
 useEffect(()=>()=>{controller.current?.abort();if(timer.current)clearTimeout(timer.current);reader.current?.abort();},[]);
 const stop=()=>{controller.current?.abort();controller.current=null;if(timer.current)clearTimeout(timer.current);timer.current=null;};
 const close=(exit=onExit)=>{const value={...workRef.current,stage:workRef.current.stage==='generating'?(workRef.current.concepts.length?'preview':'review') as BrandStage:workRef.current.stage};if(!persist(value))return;stop();exit();};
 const discard=()=>{
  try{if(entryDraft.current===null)workspaceStorage.removeItem('farmily-brand-work');else workspaceStorage.setItem('farmily-brand-work',entryDraft.current);}
  catch{setStorageError('Your changes could not be discarded. Please try again.');return;}
  stop();onExit();
 };
 const go=(stage:BrandStage)=>{stop();update({stage});};
 const current=buildBrand(work);const currentProfile=work.profile;
 const step=work.stage==='setup'?1:work.stage==='review'||work.stage==='generating'?2:3;
 const stale=work.basis!==signature(work.profile);

 function confirmProfile(){
  try{validProfile(work.profile);if(!onSaveProfile(work.profile)){setError('Your farm details could not be saved. Please free some browser storage and try again.');return false;}return true;}
  catch(err){setError((err as Error).message);return false;}
 }
 function confirmExisting(){
  if(!confirmProfile())return;
  const next=existingBrand(work.profile);if(!onSaveBrand(next,work.profile)){setError('Your brand could not be saved. Please try again.');return;}
  setSaved(next);update({stage:'saved',basis:signature(work.profile)});
 }
 function previewSamples(){
  if(!confirmProfile())return;
  update({stage:'generating',origin:'sample'});
  timer.current=setTimeout(()=>{setWork(value=>({...value,concepts:demoConcepts,selected:0,palette:0,style:0,handwritten:false,image:null,origin:'sample',basis:signature(value.profile),stage:'preview'}));timer.current=null;},1000);
 }
 async function generate(action:'concepts'|'image'='concepts',refinement=''){
  if(work.stage==='generating'||uploading)return;
  if(!confirmProfile())return;
  if(!identity){setError('Create an account to generate your own brand, or explore the sample preview below.');return;}
  const source=work;const active=new AbortController();controller.current=active;
  update({stage:'generating'});
  const timeout=setTimeout(()=>active.abort(),action==='image'?100000:55000);
  try{
   const session=await authClient?.auth.getSession();const token=session?.data.session?.access_token;
   if(!token)throw new Error('Please sign in again before generating your brand.');
   const response=await fetch('/api/branding',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},signal:active.signal,body:JSON.stringify({profile:source.profile,action,concept:current?.concept,refinement})});
   const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.error||'Brand generation is unavailable. Please try again.');
   if(controller.current!==active)return;
   if(action==='image'){
    if(data?.source!=='ai'||typeof data.image!=='string'||!data.image.startsWith('data:image/png;base64,'))throw new Error('The illustration could not be read.');
    setWork(value=>({...value,image:data.image,stage:'preview'}));
   }else{
    if(data?.source!=='ai'||!Array.isArray(data.concepts)||data.concepts.length!==3)throw new Error('The brand directions could not be read.');
    setWork(value=>({...value,concepts:data.concepts.map(validConcept),selected:0,palette:refinement==='Try softer colors'?2:-1,style:refinement==='Make it more minimal'?0:refinement?value.style:0,handwritten:refinement==='Handwrite style'?true:refinement?value.handwritten:false,image:null,origin:'ai',basis:signature(source.profile),refinement:'',stage:'preview'}));
   }
  }catch(err){if(controller.current===active){setError(err instanceof Error&&err.name==='AbortError'?'Generation stopped. Your farm details and previous design are still available.':(err as Error).message);setWork(value=>({...value,stage:source.concepts.length?'preview':'review'}));}}
  finally{clearTimeout(timeout);if(controller.current===active)controller.current=null;}
 }
 function refine(text=work.refinement){
  if(!text.trim())return;
  if(work.origin==='sample'){
   if(text==='Make it more minimal')update({style:0,selected:0,refinement:''});
   else if(text==='Try softer colors')update({palette:2,refinement:''});
   else if(text==='Handwrite style')update({handwritten:true,refinement:''});
   else{setError('Custom refinements need AI generation. Create an account and generate your own brand to use this request.');return;}
   setStatus('Sample preview updated. No AI request was made.');
  }else void generate('concepts',text.trim());
 }
 function save(){
  if(!current||stale){setError('Your farm information changed. Generate or load a fresh preview before saving.');return;}
  if(!onSaveBrand(current,work.profile)){setError('Your brand could not be saved. Please try again.');return;}setSaved(current);update({stage:'saved'});
 }
 function upload(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>512*1024){setError('Choose a JPG, PNG or WebP photo smaller than 512 KB.');return;}
  if(work.profile.photos.length>=3&&!work.profile.photos.some(photo=>photo.kind==='farm')){setError('Your profile already has three photos. Remove one from Profile to add another.');return;}
  setUploading(true);reader.current?.abort();const active=new FileReader();reader.current=active;
  active.onload=()=>{setWork(value=>({...value,profile:{...value.profile,photos:[{id:crypto.randomUUID(),kind:'farm' as const,name:file.name,url:String(active.result)},...value.profile.photos.filter(photo=>photo.kind!=='farm')].slice(0,3)}}));setUploading(false);};
  active.onerror=()=>{setError('We could not open that photo. Please choose another.');setUploading(false);};active.readAsDataURL(file);
 }
 const selectedBrand=work.choice==='existing'?(saved||brand):current;
 const farmPhoto=work.profile.photos.find(photo=>photo.kind==='farm');
 return <div className={`app-shell brand-identity-flow brand-stage-${work.stage}`}>
  <header className="brand-flow-header"><h1 ref={heading} tabIndex={-1}>Brand Identity</h1><button className="icon-button brand-close" aria-label="Close brand creation" onClick={()=>work.stage==='saved'?close():setExitOpen(true)} disabled={uploading}><X size={18}/></button></header>
  <main className="brand-flow-main" onKeyDown={advanceField}>
   <div className="brand-flow-progress"><span>Step {step} of 3</span><div role="progressbar" aria-label="Brand identity progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step}><i style={{width:step===1?'40%':step===2?'70%':'100%'}}/></div></div>
   {work.stage==='setup'&&<><h2>Does your farm already have a brand?<RequiredMark/></h2><div className="brand-choice-list" role="radiogroup" aria-required="true" aria-label="Does your farm already have a brand?">{(['create','existing'] as const).map(choice=><label key={choice} className={`brand-choice ${work.choice===choice?'selected':''}`}><input type="radio" required name="brand-choice" value={choice} checked={work.choice===choice} onChange={()=>update({choice})}/><span className="brand-choice-top"><img src={asset(choice==='create'?'create-brand.svg':'existing-brand.svg')} alt=""/><span className="brand-radio-visual"><img src={asset('selection.svg')} alt=""/>{work.choice===choice&&<img className="brand-radio-dot" src={asset('selected-dot.svg')} alt=""/>}</span></span><strong>{choice==='create'?'No, help me create one':'Yes, I already have one'}</strong><small>{choice==='create'?"Create your farm’s brand with AI.":'No artwork upload needed.'}</small></label>)}</div><div className="brand-flow-actions brand-bottom-actions"><button className="button primary" onClick={()=>work.choice==='existing'?confirmExisting():go('review')}>Continue</button></div></>}
   {work.stage==='review'&&<><h2>Let’s start with your farm!</h2><form className="brand-review-form" onSubmit={event=>{event.preventDefault();void generate();}}><section className="brand-review-card"><div className="brand-profile-field"><span className="brand-field-label">Farm profile</span><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload}/><button type="button" className="brand-photo-field" disabled={uploading} onClick={()=>fileInput.current?.click()}>{farmPhoto?<img className="brand-profile-photo" src={farmPhoto.url} alt="Your farm profile photo"/>:<img className="brand-add-photo" src={asset('add-photo.svg')} alt=""/>}<span><strong>{uploading?'Opening photo…':farmPhoto?'Change profile photo':'Add a profile photo'}</strong></span></button></div><label className="field"><span>Farm name<RequiredMark/></span><input required name="brandFarmName" value={work.profile.farmName} maxLength={2500} autoComplete="organization" enterKeyHint="next" onChange={event=>update({profile:{...work.profile,farmName:event.target.value}})}/></label><label className="field"><span>Farm story</span><textarea name="brandFarmStory" rows={5} maxLength={2500} value={work.profile.story} placeholder="Tell us a little about your farm." onChange={event=>update({profile:{...work.profile,story:event.target.value}})}/></label><label className="field"><span>Farm category<RequiredMark/></span><input required name="brandFarmCategory" value={work.profile.products} maxLength={2500} placeholder="e.g. Vegetables" enterKeyHint="done" onChange={event=>update({profile:{...work.profile,products:event.target.value}})}/></label></section>{!profile&&<p className="brand-setup-help">Complete your farmer profile before creating a brand. <button type="button" className="text-button" onClick={onEditProfile}>Complete my profile</button></p>}<div className="brand-flow-actions"><button className="button primary" type="submit" disabled={uploading}>Generate My Brand ✦</button><button className="button secondary" type="button" disabled={uploading} onClick={()=>go('setup')}>Previous</button>{!identity&&<button className="text-button brand-auth-link" type="button" onClick={onCreateAccount}>Create an account for AI generation</button>}<button className="text-button brand-demo-link" type="button" disabled={uploading} onClick={previewSamples}><DevBadge/> Try sample preview</button></div><small className="brand-generation-disclosure">Generation uses your farm story, products, philosophy and optional photos. No photos? We can create an illustration from your written profile and label it AI-generated.</small></form></>}
   {work.stage==='generating'&&<><section className="brand-generating" role="status" aria-live="polite"><img src={asset('loading.svg')} alt=""/><h2>Creating a look for {currentProfile.farmName}…</h2></section><p className="brand-generation-status">{work.origin==='sample'&&!controller.current?<><DevBadge/> Simulated AI preview ✦</>:'This may take a moment.'}</p><div className="brand-flow-actions brand-bottom-actions"><button className="text-button" onClick={()=>go(work.concepts.length?'preview':'review')}>Cancel generation</button></div></>}
   {work.stage==='preview'&&current&&<><div className="brand-ai-banner"><strong>✦ Farmily AI</strong><small>{work.origin==='sample'?<><DevBadge/> Sample design preview</>:'Designed uniquely for your farm'}</small></div><div className="brand-preview-carousel" ref={carousel} onScroll={event=>{const element=event.currentTarget;const width=element.firstElementChild?.getBoundingClientRect().width||338;setPreviewIndex(Math.round(element.scrollLeft/(width+8)));}}>{[false,true].map(packaging=><div className="brand-preview-slide" key={String(packaging)}><Mockup brand={current} profile={work.profile} packaging={packaging}/></div>)}</div><div className="brand-carousel-dots">{[0,1].map(index=><button key={index} type="button" aria-label={`Show ${index===0?'label':'packaging'} preview`} aria-pressed={previewIndex===index} onClick={()=>{const width=carousel.current?.firstElementChild?.getBoundingClientRect().width||338;carousel.current?.scrollTo({left:index*(width+8),behavior:'smooth'});setPreviewIndex(index);}}><span/></button>)}</div>
    <section className="brand-style-section"><h2>✦ Design style</h2><div className="brand-style-options" role="group" aria-label="Design style">{designStyles.map((style,index)=><button key={style} type="button" className={work.style===index?'selected':''} aria-pressed={work.style===index} onClick={()=>update({style:index,selected:Math.min(index,work.concepts.length-1),handwritten:false})}><span className={`brand-style-thumb thumb-${style.toLowerCase()}`}><img src={asset(index===2?'harvest-motif.svg':'field-illustration.svg')} alt=""/><strong>{work.profile.farmName}</strong><small>FRESH FROM OUR FARM</small></span><span>{style}</span></button>)}</div></section>
    <section className="brand-palette-section"><h2>✦ Color Palette</h2><div className="brand-palette-options" role="group" aria-label="Color palette">{brandPalettes.map((colors,index)=><button key={index} type="button" aria-label={['Forest green palette','Warm harvest palette','Soft earth palette'][index]} aria-pressed={work.palette===index} className={work.palette===index?'selected':''} onClick={()=>update({palette:index})}><span>{colors.map(color=><i key={color} style={{background:color}}/>)}</span></button>)}</div><small>These colors apply to your brand preview only.</small></section>
    <section className="brand-refinement-section"><h2>✦ Want to change something?</h2><form className="brand-refinement-form" onSubmit={event=>{event.preventDefault();refine();}}><label className="sr-only" htmlFor="brand-refinement">Describe changes to your brand</label><input id="brand-refinement" maxLength={500} placeholder="Make the design more minimal and use warmer colors." value={work.refinement} onChange={event=>update({refinement:event.target.value})} enterKeyHint="send"/><button type="submit" aria-label="Apply brand refinement" disabled={!work.refinement.trim()}><img src={asset('send.svg')} alt=""/></button></form><div className="brand-refinement-suggestions">{['Make it more minimal','Try softer colors','Handwrite style'].map(text=><button key={text} type="button" onClick={()=>refine(text)}>{text}</button>)}</div>{status&&<small role="status">{work.origin==='sample'&&<DevBadge/>}{status}</small>}</section>
    <details className="brand-details"><summary>Edit brand details</summary><p>{current.concept.rationale}</p><label className="field"><span>Tagline<RequiredMark/></span><input required value={current.concept.tagline} maxLength={200} onChange={event=>{const concepts=[...work.concepts];concepts[work.selected]={...concepts[work.selected],tagline:event.target.value};update({concepts});}}/></label><p>{current.concept.packaging}</p>{work.origin==='ai'&&!work.profile.photos.length&&<button type="button" className="button secondary" onClick={()=>void generate('image')}>Generate an AI illustration</button>}<small>{imageDisclosure(current.imageSource)}</small></details>
    {work.origin==='sample'&&<small className="brand-sample-disclosure">Figma sample artwork for illustration. Your saved name, style and colors are applied to product packaging.</small>}
    {stale&&<p className="scan-error" role="alert">Your farm information changed. Generate or load a fresh preview before saving.</p>}<div className="brand-flow-actions"><button className="button primary" disabled={stale||!current.concept.tagline.trim()} onClick={save}>Save in Design</button><button className="button secondary" type="button" onClick={()=>go('review')}>Previous</button></div>
   </>}
   {work.stage==='saved'&&selectedBrand&&<><div className="brand-saved-banner" role="status"><img src={asset('success-check.svg')} alt=""/><div><h2>Saved in Design</h2><small>You can now use it to create packaging for all your products.</small></div></div><section className="brand-saved-card"><h2>{selectedBrand.origin==='existing'?'Your Existing Brand':'Default Brand Style'}</h2>{selectedBrand.origin==='existing'?<div className="brand-existing-art"><img src={asset('existing-brand.svg')} alt=""/><strong>{work.profile.farmName}</strong><p>No artwork uploaded.</p></div>:<Mockup brand={selectedBrand} profile={work.profile}/>}<h3>{work.profile.farmName}</h3>{selectedBrand.origin!=='existing'&&<div className="brand-font-summary"><span className={selectedBrand.handwritten?'handwritten':'brand-display-font'}>Aa <small>{selectedBrand.handwritten?'Handwritten':selectedBrand.designStyle==='Rustic'?'Lora':selectedBrand.designStyle==='Playful'?'Palanquin':'Bree Serif'}</small></span><span>Aa <small>Palanquin</small></span><small>{selectedBrand.designStyle||'Minimal'}</small></div>}{selectedBrand.origin!=='existing'&&<div className="brand-saved-colors">{selectedBrand.concept.colors.map(color=><span key={color} style={{background:color}}/>)}</div>}{selectedBrand.origin==='sample'&&<small><DevBadge/> Sample artwork · demo identity</small>}</section><div className="brand-flow-actions brand-bottom-actions"><button className="button primary" onClick={onAddProduct}>Add Your First Product</button><button className="button secondary" onClick={onHome}>Back to Home</button></div></>}
   {error&&<p ref={feedback} className="scan-error" role="alert">{error}</p>}{storageError&&<p className="scan-error" role="alert">{storageError}</p>}
  </main>
  <dialog ref={exitDialog} className="brand-exit-dialog" aria-labelledby="brand-exit-title" onCancel={()=>setExitOpen(false)}>
   <div className="brand-exit-card">
   <h2 id="brand-exit-title">Leave brand creation?</h2>

   <div className="brand-flow-actions">
    <button type="button" className="button primary" onClick={()=>close()}>Save draft and exit</button>
    <button type="button" className="button secondary brand-discard" onClick={discard}>Discard and exit</button>
    <button type="button" className="text-button" autoFocus onClick={()=>setExitOpen(false)}>Keep editing</button>
   </div>
   {storageError&&<p className="scan-error" role="alert">{storageError}</p>}
   </div>
  </dialog>
 </div>;
}

import {useEffect,useRef,useState} from 'react';
import {Camera,Leaf,Pencil} from 'lucide-react';
import type {FarmerProfile} from '../shared/branding';
import {maxFarmUploadBytes,type FarmerPortrait} from '../shared/farmCredentials';
import MobileDialog from './MobileDialog';

export default function ProfilePhotoEditor({profile,sample,onSave}:{profile:FarmerProfile;sample:boolean;onSave:(profile:FarmerProfile)=>boolean}){
 const [open,setOpen]=useState(false),[portrait,setPortrait]=useState<FarmerPortrait|undefined>(profile.portrait),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const reader=useRef<FileReader|null>(null),input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>reader.current?.abort(),[]);
 function cancel(){const current=reader.current;reader.current=null;current?.abort();setBusy(false);setError('');setOpen(false);}
 function upload(file:File|undefined){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>maxFarmUploadBytes){setError('Choose a JPG, PNG or WebP photo up to 512 KB.');return;}
  reader.current?.abort();const current=new FileReader();reader.current=current;setBusy(true);setError('');
  current.onload=()=>{if(reader.current===current)setPortrait({id:crypto.randomUUID(),name:file.name,url:String(current.result)});};
  current.onerror=()=>{if(reader.current===current)setError('This photo could not be read. Please try another.');};
  current.onloadend=()=>{if(reader.current===current){reader.current=null;setBusy(false);}};
  current.readAsDataURL(file);
 }
 function picture(photo:FarmerPortrait|undefined){return photo?<img className="dr-farmer-portrait" src={photo.url} alt={profile.farmerName}/>:sample?<img className="dr-farmer-portrait" src="/sample-profile/farmer.png" alt="Sample farmer portrait"/>:<Leaf aria-hidden="true"/>;}
 return <><button type="button" className="farmer-avatar-edit" aria-label="Update profile photo" onClick={()=>{setPortrait(profile.portrait);setError('');setOpen(true);}}>{picture(profile.portrait)}<span className="farmer-avatar-pencil"><Pencil size={18} aria-hidden="true"/></span></button>
 <MobileDialog open={open} title="Update profile photo" onCancel={cancel}><div className="farmer-photo-editor"><div className="farmer-photo-preview">{picture(portrait)}</div><p>Choose a clear photo of yourself for your farm profile.</p><small>JPG, PNG or WebP · up to 512 KB</small><input hidden ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload profile photo" disabled={busy} onChange={event=>{upload(event.target.files?.[0]);event.target.value='';}}/><button type="button" className="v2-secondary" disabled={busy} onClick={()=>input.current?.click()}><Camera size={20} aria-hidden="true"/>{busy?'Reading photo…':'Choose photo'}</button>{error&&<p className="v2-error" role="alert">{error}</p>}<button type="button" className="v2-primary" disabled={busy||!portrait} onClick={()=>{try{if(!onSave({...profile,portrait}))throw Error('Your photo could not be saved. Please try again.');cancel();}catch(e){setError(e instanceof Error?e.message:'Your photo could not be saved.');}}}>Save photo</button></div></MobileDialog></>;
}

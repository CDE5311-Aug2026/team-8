import {presetBehindPhotos} from '../shared/presetProduct';
import {useRef,useState} from 'react';
import {Plus,X} from 'lucide-react';
export default function ProductPhotos({value,onChange}:{value:string[];onChange:(photos:string[])=>void}){
 const input=useRef<HTMLInputElement>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const add=async(files:FileList|null)=>{if(!files?.length)return;const next=Array.from(files).slice(0,Math.max(0,2-value.length));setError('');if(next.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>512*1024)){setError('Choose JPG, PNG or WebP images under 512 KB.');return;}const images=next.map((_,i)=>presetBehindPhotos[(value.length+i)%presetBehindPhotos.length].url);onChange([...value,...images]);};
 return <div className="pf-extra-photos"><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e=>{void add(e.target.files);e.target.value='';}}/><div>{value.map((photo,i)=><span key={i}><img src={photo} alt={`Additional product photo ${i+1}`}/><button type="button" aria-label={`Remove additional photo ${i+1}`} onClick={()=>onChange(value.filter((_,index)=>index!==i))}><X size={14}/></button></span>)}</div>{value.length<2&&<button type="button" className="text-button" disabled={busy} onClick={()=>input.current?.click()}><Plus size={15}/>{busy?'Opening photos…':'Add product photos'}</button>}{error&&<p className="scan-error" role="alert">{error}</p>}</div>;
}

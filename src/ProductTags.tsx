import {useId,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {addProducts} from '../shared/products';

export default function ProductTags({value,onChange,pendingValue,onPendingChange}:{value:string;onChange:(value:string)=>void;pendingValue?:string;onPendingChange?:(value:string)=>void}){
 const id=useId();const [localInput,setLocalInput]=useState('');const [error,setError]=useState('');
 const input=pendingValue??localInput;
 const setInput=(value:string)=>{setLocalInput(value);onPendingChange?.(value);};
 const inputRef=useRef<HTMLInputElement>(null);
 const products=value.split(',').map(item=>item.trim()).filter(Boolean);
 function add(){
  try{onChange(addProducts(value,input));setInput('');setError('');inputRef.current?.focus({preventScroll:true});}
  catch(err){setError((err as Error).message);}
 }
 return <div className="field product-tags-field">
  <label htmlFor={id}>Your products</label>
  <small id={`${id}-note`}>Start with a few products. You can add more later.</small>
  <div className="product-tags-entry"><input ref={inputRef} id={id} name="pendingProducts" value={input} required={!products.length} maxLength={2500} placeholder="e.g. Tomatoes" autoComplete="off" autoCapitalize="words" enterKeyHint="enter" aria-describedby={`${id}-note`} onChange={event=>{setInput(event.target.value);setError('');}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();add();}}}/><button type="button" className="button secondary" disabled={!input.trim()} onPointerDown={event=>event.preventDefault()} onClick={add}>Add</button></div>

  {!!products.length&&<ul className="product-tags" aria-label="Your products">{products.map((product,index)=><li key={`${product}-${index}`}><span>{product}</span><button type="button" aria-label={`Remove ${product}`} onClick={()=>{onChange(products.filter((_,i)=>i!==index).join(', '));setError('');}}><X size={14}/></button></li>)}</ul>}
  {error&&<p className="scan-error" role="alert">{error}</p>}
 </div>;
}

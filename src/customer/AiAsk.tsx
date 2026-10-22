import {useEffect,useState,type FormEvent} from 'react';
import {answerFor,thinkingMs} from './aiAnswers';
import {SendIcon,SparkleIcon} from './icons';
import {aiPromptChips,formatPrice,productById} from './products';

export default function AiAsk({onSelectProduct}:{onSelectProduct:(id:string)=>void}){
 const [question,setQuestion]=useState<string|null>(null);
 const [thinking,setThinking]=useState(false);
 const [draft,setDraft]=useState('');
 useEffect(()=>{
  if(question===null)return;
  setThinking(true);
  const timer=window.setTimeout(()=>setThinking(false),thinkingMs);
  return ()=>window.clearTimeout(timer);
 },[question]);
 const ask=(text:string)=>{setQuestion(text);setDraft('');};
 const send=(event:FormEvent)=>{event.preventDefault();const text=draft.trim();if(text)ask(text);};
 const reset=()=>{setQuestion(null);setThinking(false);};
 return <>
  <div className="cx-ai-ask">
   <div className="cx-ai-ask-title"><SparkleIcon className="cx-ai-mark"/><h3>Not sure what to pick?</h3></div>
   <p className="cx-ai-ask-hint">Tell Farmily AI what you’re cooking</p>
   {question===null&&<div className="cx-ai-chips">
    {aiPromptChips.map(text=><button key={text} type="button" className="cx-chip cx-chip-prompt" onClick={()=>ask(text)}>{text}</button>)}
   </div>}
  </div>
  {question===null&&<form className="cx-ai-input" onSubmit={send}>
   <input type="text" placeholder="Ask Farmily AI" aria-label="Ask Farmily AI" value={draft} onChange={e=>setDraft(e.target.value)}/>
   <button type="submit" className="cx-ai-send" aria-label="Send"><SendIcon/></button>
  </form>}
  {question!==null&&<div className="cx-ai-answer" aria-live="polite">
   <p className="cx-ai-question">{question}</p>
   <p className="cx-ai-label"><SparkleIcon size={16}/>Farmily AI</p>
   {thinking?<p className="cx-ai-thinking">Thinking…</p>:<>
    <div className="cx-ai-rows">
     {answerFor(question).map(({productId,reason})=>{
      const product=productById(productId);
      return <button key={productId} type="button" className="cx-ai-row" onClick={()=>onSelectProduct(productId)}>
       <span className="cx-ai-row-photo" style={{backgroundImage:`url(${product.image})`}} role="img" aria-label={product.name}/>
       <span className="cx-ai-row-text">
        <span className="cx-ai-row-name">{product.name}</span>
        <span className="cx-ai-row-reason">{reason}</span>
        <span className="cx-ai-row-price">{formatPrice(product.price)} / {product.unit}</span>
       </span>
      </button>;
     })}
    </div>
    <button type="button" className="cx-ai-again" onClick={reset}>Ask something else</button>
   </>}
  </div>}
 </>;
}

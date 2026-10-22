import {useState} from 'react';
import type {Go} from './navigation';
import {interestLimit,interestOptions} from './products';

export default function InterestsScreen({go}:{go:Go}){
 const [selected,setSelected]=useState<string[]>([]);
 const full=selected.length===interestLimit;
 const toggle=(label:string)=>setSelected(s=>s.includes(label)?s.filter(x=>x!==label):s.length<interestLimit?[...s,label]:s);
 return <div className="cx-interests">
  <header className="cx-product-header"><h1 className="cx-end-brand">Farmily</h1></header>
  <main className="cx-interests-body">
   <div className="cx-signup-intro">
    <h2 className="cx-signup-title">What do you like?</h2>
    <p className="cx-signup-sub">Pick {interestLimit} to personalise your home page.</p>
   </div>
   <div className="cx-interest-grid">
    {interestOptions.map(label=>{
     const on=selected.includes(label);
     return <button key={label} type="button" className={`cx-interest-tile${on?' cx-interest-on':''}`} aria-pressed={on} disabled={full&&!on} onClick={()=>toggle(label)}>{label}</button>;
    })}
   </div>
   <div className="cx-interests-footer">
    <button type="button" className="cx-button cx-button-block" disabled={!full} onClick={()=>go('home')}>Continue</button>
    <button type="button" className="cx-skip" onClick={()=>go('home')}>Skip for now</button>
   </div>
  </main>
 </div>;
}

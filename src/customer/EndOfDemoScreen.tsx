import {FlagIcon} from './icons';
import type {Go} from './navigation';

export default function EndOfDemoScreen({go}:{go:Go}){
 return <main className="cx-end">
  <header className="cx-end-header"><h1 className="cx-end-brand">Farmily</h1></header>
  <div className="cx-end-body">
   <span className="cx-end-icon"><FlagIcon/></span>
   <h2 className="cx-end-title">You’ve reached the end<br/>of the demo</h2>
   <p className="cx-end-text">This part of Farmily isn’t built yet.</p>
  </div>
  <button type="button" className="cx-button cx-button-block" onClick={()=>go('home')}>Back to home</button>
 </main>;
}

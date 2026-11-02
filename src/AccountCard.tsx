import DevBadge from './DevBadge';
import {useAccount} from './AuthContext';
import {X} from 'lucide-react';

export default function AccountCard({onCreateAccount,onSignOut,onError,onClose}:{onCreateAccount:()=>void;onSignOut:()=>Promise<void>;onError:(message:string)=>void;onClose?:()=>void}){
 const {identity,sync,syncError}=useAccount();
 return <section className="card account-profile">
  {onClose&&<button type="button" className="icon-button account-card-close" aria-label="Dismiss account card" onClick={onClose}><X size={18}/></button>}
  <span className="badge">{identity?.demo?<><DevBadge/> Demo account</>:identity?'Signed in':'Guest'}</span>
  <h2>{identity?'Your account':'You’re exploring as a guest'}</h2>
  <p>{identity?identity.email:'Your local profile is not an account. Create one before publishing products or accepting orders.'}</p>
  {identity?<><small>{identity?.demo?'Demo progress is saved on this device only.':sync==='saved'?'Account saving connected':syncError||'Saving your progress…'}</small><button type="button" className="button secondary" onClick={()=>void onSignOut().catch(()=>onError('Could not sign out. Please try again.'))}>Sign out</button></>:<button type="button" className="button secondary" onClick={onCreateAccount}>Create an account</button>}
 </section>;
}

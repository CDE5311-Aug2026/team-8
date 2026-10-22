import DevBadge from './DevBadge';
import {useState} from 'react';
import FarmerApp from './FarmerApp';
import {entryStep,initialRole,roleKey,type UserRole} from '../shared/role';
import {validProfile} from '../shared/branding';
import {workspaceStorage} from './accountStorage';
import {useAccount} from './AuthContext';
import AccountGate from './AccountGate';
import Welcome from './Welcome';
import CustomerApp from './customer/CustomerApp';

export default function App(){
 const account=useAccount();
 const [role,setRole]=useState<UserRole|null>(()=>{try{let hasProfile=false;try{validProfile(JSON.parse(workspaceStorage.getItem('farmily-profile')||'null'));hasProfile=true;}catch{/* new farmer */}return initialRole(workspaceStorage.getItem(roleKey),hasProfile);}catch{return null;}});
 const [guest,setGuest]=useState(()=>{try{return localStorage.getItem('farmily-guest-mode')==='true';}catch{return false;}});
 const [accountPrompt,setAccountPrompt]=useState<'signin'|'signup'|null>(null);
 const choose=(next:UserRole|null)=>{try{if(next)workspaceStorage.setItem(roleKey,next);else workspaceStorage.removeItem(roleKey);}catch{/* selection still works for this session */}setAccountPrompt(null);if(next&&!account.identity){try{localStorage.setItem('farmily-guest-mode','true');}catch{}setGuest(true);}setRole(next);window.scrollTo({top:0,behavior:'instant'});};
 const startSelling=()=>{try{workspaceStorage.removeItem('farmily-onboarding-skipped');}catch{/* onboarding remains available from Home */}choose('farmer');};
 const signOut=async()=>{try{localStorage.removeItem('farmily-guest-mode');}catch{/* session only */}setGuest(false);await account.signOut();};
 const accountPage=accountPrompt?<AccountGate key={accountPrompt} initialMode={accountPrompt} onBack={()=>setAccountPrompt(null)}/>:null;
 const entry=entryStep(!!account.identity,guest,role);
 if(entry==='farmer')return <><div hidden={!!accountPrompt}><FarmerApp onChangeRole={()=>choose(null)} onCreateAccount={()=>setAccountPrompt('signup')} onSignIn={()=>setAccountPrompt('signin')} onSignOut={signOut}/></div>{accountPage}</>;
 if(entry==='customer')return <><div hidden={!!accountPrompt}><CustomerApp/></div>{accountPage}</>;
 return <><div hidden={!!accountPrompt}><Welcome onExplore={()=>choose('customer')} onSell={startSelling} onSignIn={()=>setAccountPrompt('signin')}/></div>{accountPage}</>;
}

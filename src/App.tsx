import CustomerApp from './customer/CustomerApp';
import {useState} from 'react';
import FarmerApp from './FarmerApp';
import {entryStep,initialRole,roleKey,visitKey,type UserRole} from '../shared/role';
import {validProfile} from '../shared/branding';
import {workspaceStorage} from './accountStorage';
import {useAccount} from './AuthContext';
import Welcome from './Welcome';
import OnboardingV2 from './OnboardingV2';

export default function App(){
 const account=useAccount();
 const [hasShop]=useState(()=>{try{validProfile(JSON.parse(workspaceStorage.getItem('farmily-profile')||'null'));return true;}catch{return false;}});
 const [role,setRole]=useState<UserRole|null>(()=>{try{const hasProfile=hasShop;let sameVisit=false;try{sameVisit=!!sessionStorage.getItem(visitKey);}catch{/* treat as a new visit */}return initialRole(workspaceStorage.getItem(roleKey),hasProfile,sameVisit);}catch{return null;}});
 const [guest,setGuest]=useState(()=>{try{return localStorage.getItem('farmily-guest-mode')==='true';}catch{return false;}});
 const [accountPrompt,setAccountPrompt]=useState<'signin'|'signup'|null>(null);
 // A farmer who already has a shop sees the choice page on a new visit, and I want to sell opens the shop.
 const [v2Complete,setV2Complete]=useState(()=>role==='farmer'||hasShop);
 const choose=(next:UserRole|null)=>{try{if(next)workspaceStorage.setItem(roleKey,next);else workspaceStorage.removeItem(roleKey);}catch{/* selection still works for this session */}try{if(next)sessionStorage.setItem(visitKey,next);else sessionStorage.removeItem(visitKey);}catch{/* a refresh shows the choice again */}setAccountPrompt(null);if(!next)setV2Complete(false);if(next&&!account.identity){try{localStorage.setItem('farmily-guest-mode','true');}catch{}setGuest(true);}setRole(next);window.scrollTo({top:0,behavior:'instant'});};
 const startSelling=()=>{try{workspaceStorage.removeItem('farmily-onboarding-skipped');}catch{/* onboarding remains available from Home */}choose('farmer');};
 const signOut=async()=>{try{localStorage.removeItem('farmily-guest-mode');}catch{/* session only */}setGuest(false);await account.signOut();};
 const accountPage=accountPrompt?<OnboardingV2 key={accountPrompt} accountMode={accountPrompt} onBuy={()=>choose('customer')} onComplete={()=>setAccountPrompt(null)} onAccountBack={()=>setAccountPrompt(null)}/>:null;
 const entry=entryStep(!!account.identity,guest,role);
 if(!v2Complete&&entry!=='customer')return <OnboardingV2 onBuy={()=>choose('customer')} onComplete={()=>{setV2Complete(true);startSelling();}}/>;
 if(entry==='farmer')return <><div hidden={!!accountPrompt}><FarmerApp onChangeRole={()=>choose(null)} onCreateAccount={()=>setAccountPrompt('signup')} onSignIn={()=>setAccountPrompt('signin')} onSignOut={signOut}/></div>{accountPage}</>;
 if(entry==='customer')return <><div hidden={!!accountPrompt}><CustomerApp onExit={()=>choose(null)}/></div>{accountPage}</>;
 return <><div hidden={!!accountPrompt}><Welcome onExplore={()=>choose('customer')} onSell={startSelling} onSignIn={()=>setAccountPrompt('signin')}/></div>{accountPage}</>;
}

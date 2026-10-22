import RequiredMark from './RequiredMark';
import {advanceField} from './mobileForms';
import DevBadge from './DevBadge';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Leaf} from 'lucide-react';
import {authClient} from './authClient';
import {useAccount} from './AuthContext';
import {snapshot} from './accountStorage';
import {hasProgress} from '../shared/workspace';

export default function AccountGate({onBack,initialMode='signin'}:{onBack?:()=>void;initialMode?:'signup'|'signin'}){
 const [mode,setMode]=useState(initialMode);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');
 const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});},[mode]);
 const {prepareGuestTransfer,signInDemo}=useAccount();const hasDrafts=hasProgress(snapshot(null));
 async function submit(){
  setError('');setMessage('');if(!authClient&&mode==='signin'){try{if(!signInDemo(email,password))setError('[DEV] Use farmer@example.com with password 123456 to sign in to the demo.');}catch{setError('[DEV] Demo sign-in needs browser storage. Please enable it and try again.');}return;}if(!authClient){setError('[DEV] Account creation and sign-in are not connected yet. Return to the previous screen to keep exploring.');return;}
  if(mode==='signup'&&password!==confirmation){setError('The passwords do not match.');return;}
  setBusy(true);
  prepareGuestTransfer(email.trim());
  try{
   const result=mode==='signup'?await authClient.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}}):await authClient.auth.signInWithPassword({email:email.trim(),password});
   if(result.error)throw result.error;
   setPassword('');setConfirmation('');
   if(!result.data.session)setMessage('Confirm your email, then sign in.');
  }catch(err){prepareGuestTransfer(null);setError(err instanceof Error?err.message:'We could not connect. Please try again.');}
  finally{setBusy(false);}
 }
 const form=<form className="welcome-signin-form" onKeyDown={advanceField} onSubmit={e=>{e.preventDefault();void submit();}}>
   <label className="field"><span>Email<RequiredMark/></span><input type="email" name="email" inputMode="email" autoCapitalize="none" spellCheck={false} enterKeyHint="next" placeholder="you@example.com" autoComplete="email" required disabled={busy} value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label className="field"><span>Password<RequiredMark/></span><input type="password" name="password" autoCapitalize="none" spellCheck={false} enterKeyHint={mode==='signup'?'next':'go'} placeholder={mode==='signup'?'At least 8 characters':undefined} autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {mode==='signup'&&<><label className="field"><span>Confirm password<RequiredMark/></span><input type="password" name="passwordConfirmation" autoCapitalize="none" spellCheck={false} enterKeyHint="go" autoComplete="new-password" required minLength={8} disabled={busy} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label></>}
   {hasDrafts&&authClient&&<p className="soft-callout">{mode==='signup'?'Your current farm and drafts will be included.':'If your guest drafts differ from your saved account progress, we’ll ask which to use after you sign in.'}</p>}
   {!authClient&&<p className="soft-callout"><DevBadge/> {mode==='signin'?'Demo sign-in: farmer@example.com · Password: 123456. Saved on this device only.':'Account creation is not connected yet. Use Sign in to try the demo account.'}</p>}
   {error&&<p className="scan-error" role="alert">{error}</p>}{message&&<p className="soft-callout" role="status">{message}</p>}
   <button type="submit" className="button primary" disabled={busy||(!authClient&&mode==='signup')}>{busy?'Connecting…':mode==='signup'?'Create account':'Sign in'}</button>
  </form>;
 return <div className="app-shell account-gate"><header className="farmer-header">{onBack&&<button type="button" className="icon-button back" aria-label="Back" disabled={busy} onClick={onBack}><ArrowLeft/></button>}<span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main">
  <section className="welcome-intro"><h1 ref={heading} tabIndex={-1}>{mode==='signup'?'Create your account':'Welcome back'}</h1>{mode==='signup'&&<p className="intro">Save your farm across devices.</p>}</section>
  {form}
  <div className="account-secondary"><p>{mode==='signup'?'Already part of Farmily?':'New to Farmily?'}</p><button type="button" className="button secondary" disabled={busy} onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setMessage('');setPassword('');setConfirmation('');}}>{mode==='signup'?'Sign in':'Create an account'}</button></div>

 </main></div>;
}

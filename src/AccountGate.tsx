import {useState} from 'react';
import {ArrowLeft,Leaf} from 'lucide-react';
import {authClient} from './authClient';
import {useAccount} from './AuthContext';
import {snapshot} from './accountStorage';

export default function AccountGate({onBack,initialMode='signin',reason}:{onBack?:()=>void;initialMode?:'signup'|'signin';reason?:string}){
 const [mode,setMode]=useState(initialMode);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');
 const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [bringDrafts,setBringDrafts]=useState(false);
 const {importGuest}=useAccount();const hasDrafts=Object.keys(snapshot(null)).length>0;
 async function submit(){
  setError('');setMessage('');if(!authClient){setError('Account creation and sign-in are not connected yet. Return to the previous screen to keep exploring.');return;}
  if(mode==='signup'&&password!==confirmation){setError('The passwords do not match.');return;}
  setBusy(true);
  importGuest(bringDrafts);
  try{
   const result=mode==='signup'?await authClient.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}}):await authClient.auth.signInWithPassword({email:email.trim(),password});
   if(result.error)throw result.error;
   setPassword('');setConfirmation('');
   if(!result.data.session)setMessage('Check your email to confirm your account, then sign in. You can return to the previous screen and keep exploring while you wait.');
  }catch(err){setError(err instanceof Error?err.message:'We could not connect. Please try again.');}
  finally{setBusy(false);}
 }
 return <div className="app-shell account-gate"><header className="farmer-header">{onBack&&<button type="button" className="icon-button back" aria-label="Back" disabled={busy} onClick={onBack}><ArrowLeft/></button>}<span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main">
  <section className="welcome-intro"><span className="eyebrow">FROM FARMERS TO FOOD LOVERS</span><h1>{mode==='signup'?'Join the Farmily':'Welcome to Farmily'}</h1><p className="welcome-catchphrase">Good food starts with a connection.</p><p className="intro">Meet the people behind your food. Share the story behind what you grow.</p></section>
  {reason&&<p className="soft-callout account-reason">{reason}</p>}
  <form className="welcome-signin-form" onSubmit={e=>{e.preventDefault();void submit();}}><h2>{mode==='signup'?'Create your account':'Sign in'}</h2>
   <label className="field"><span>Email</span><input type="email" placeholder="you@example.com" autoComplete="email" required disabled={busy} value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label className="field"><span>Password</span><input type="password" placeholder={mode==='signup'?'Choose a password':'Your password'} autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {mode==='signup'&&<><small>Use at least 8 characters.</small><label className="field"><span>Confirm password</span><input type="password" autoComplete="new-password" required minLength={8} disabled={busy} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label></>}
   {hasDrafts&&<label className="check-row"><input type="checkbox" checked={bringDrafts} disabled={busy} onChange={e=>setBringDrafts(e.target.checked)}/>Bring my guest profile and drafts into this account if it has no saved workspace.</label>}
   {!authClient&&<p className="soft-callout">Account creation and sign-in aren’t connected yet. Return to the previous screen to keep exploring.</p>}
   {error&&<p className="scan-error" role="alert">{error}</p>}{message&&<p className="soft-callout" role="status">{message}</p>}
   <button type="submit" className="button primary" disabled={busy||!authClient}>{busy?'Connecting…':mode==='signup'?'Create account':'Sign in'}</button>
  </form>
  <div className="account-secondary"><p>{mode==='signup'?'Already part of Farmily?':'New to Farmily?'}</p><button type="button" className="button secondary" disabled={busy} onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setMessage('');setPassword('');setConfirmation('');}}>{mode==='signup'?'Sign in':'Create an account'}</button></div>
  <small id="guest-save-note" className="guest-save-note">You can explore without an account. Your progress stays in this browser until you create one.</small>
 </main></div>;
}

import {advanceField} from './mobileForms';
import DevBadge from './DevBadge';
import {useState} from 'react';
import {ArrowLeft,Leaf} from 'lucide-react';
import {authClient} from './authClient';
import {useAccount} from './AuthContext';
import {snapshot} from './accountStorage';
import {hasProgress} from '../shared/workspace';

export default function AccountGate({onBack,initialMode='signin'}:{onBack?:()=>void;initialMode?:'signup'|'signin'}){
 const [mode,setMode]=useState(initialMode);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');
 const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const {prepareGuestTransfer}=useAccount();const hasDrafts=hasProgress(snapshot(null));
 async function submit(){
  setError('');setMessage('');if(!authClient){setError('[DEV] Account creation and sign-in are not connected yet. Return to the previous screen to keep exploring.');return;}
  if(mode==='signup'&&password!==confirmation){setError('The passwords do not match.');return;}
  setBusy(true);
  prepareGuestTransfer(email.trim());
  try{
   const result=mode==='signup'?await authClient.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}}):await authClient.auth.signInWithPassword({email:email.trim(),password});
   if(result.error)throw result.error;
   setPassword('');setConfirmation('');
   if(!result.data.session)setMessage('Check your email to confirm your account, then sign in. You can return to the previous screen and keep exploring while you wait.');
  }catch(err){prepareGuestTransfer(null);setError(err instanceof Error?err.message:'We could not connect. Please try again.');}
  finally{setBusy(false);}
 }
 return <div className="app-shell account-gate"><header className="farmer-header">{onBack&&<button type="button" className="icon-button back" aria-label="Back" disabled={busy} onClick={onBack}><ArrowLeft/></button>}<span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main">
  <section className="welcome-intro"><span className="eyebrow">FROM FARMERS TO FOOD LOVERS</span><h1>{mode==='signup'?'Join the Farmily':'Welcome to Farmily'}</h1><p className="welcome-catchphrase">Good food starts with a connection.</p><p className="intro">Meet the people behind your food. Share the story behind what you grow.</p></section>

  <form className="welcome-signin-form" onKeyDown={advanceField} onSubmit={e=>{e.preventDefault();void submit();}}><h2>{mode==='signup'?'Create your account':'Sign in'}</h2>
   <label className="field"><span>Email</span><input type="email" name="email" inputMode="email" autoCapitalize="none" spellCheck={false} enterKeyHint="next" placeholder="you@example.com" autoComplete="email" required disabled={busy} value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label className="field"><span>Password</span><input type="password" name="password" autoCapitalize="none" spellCheck={false} enterKeyHint={mode==='signup'?'next':'go'} placeholder={mode==='signup'?'Choose a password':'Your password'} autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {mode==='signup'&&<><small>Use at least 8 characters.</small><label className="field"><span>Confirm password</span><input type="password" name="passwordConfirmation" autoCapitalize="none" spellCheck={false} enterKeyHint="go" autoComplete="new-password" required minLength={8} disabled={busy} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label></>}
   {hasDrafts&&<p className="soft-callout">{mode==='signup'?'Your farm profile and drafts will be saved to your account.':'If your guest drafts differ from your saved account progress, we’ll ask which to use after you sign in.'}</p>}
   {!authClient&&<p className="soft-callout"><DevBadge/> Account creation and sign-in aren’t connected yet. Return to the previous screen to keep exploring.</p>}
   {error&&<p className="scan-error" role="alert">{error}</p>}{message&&<p className="soft-callout" role="status">{message}</p>}
   <button type="submit" className="button primary" disabled={busy||!authClient}>{busy?'Connecting…':mode==='signup'?'Create account':'Sign in'}</button>
  </form>
  <div className="account-secondary"><p>{mode==='signup'?'Already part of Farmily?':'New to Farmily?'}</p><button type="button" className="button secondary" disabled={busy} onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setMessage('');setPassword('');setConfirmation('');}}>{mode==='signup'?'Sign in':'Create an account'}</button></div>
  <small id="guest-save-note" className="guest-save-note">You can explore without an account. Your progress stays in this browser until you create one.</small>
 </main></div>;
}

import {useState,type FormEvent} from 'react';
import {AppleIcon,ArrowLeftIcon,EyeIcon,EyeOffIcon,GoogleIcon,LockIcon,MailIcon} from './icons';
import type {Back} from './navigation';

export default function SignUpScreen({back,onSignUp}:{back:Back;onSignUp:()=>void}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const ready=email.trim()!==''&&password!=='';
 const submit=(event:FormEvent)=>{event.preventDefault();if(ready)onSignUp();};
 return <div className="cx-signup">
  <header className="cx-product-header">
   <button type="button" className="cx-icon-button cx-back" aria-label="Back" onClick={back}><ArrowLeftIcon/></button>
   <h1 className="cx-end-brand">Farmily</h1>
  </header>
  <main className="cx-signup-body">
   <div className="cx-signup-intro">
    <h2 className="cx-signup-title">Create your account</h2>
    <p className="cx-signup-sub">Already have an account? <span className="cx-link">Log in</span></p>
   </div>
   <form className="cx-signup-form" onSubmit={submit} noValidate>
    <label className="cx-field">
     <MailIcon/>
     <input type="email" autoComplete="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)}/>
    </label>
    <label className="cx-field">
     <LockIcon/>
     <input type={showPassword?'text':'password'} autoComplete="new-password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
     <button type="button" className="cx-icon-button cx-peek" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(s=>!s)}>{showPassword?<EyeOffIcon/>:<EyeIcon/>}</button>
    </label>
    <button type="submit" className="cx-button cx-button-block cx-button-pill cx-signup-submit" disabled={!ready}>Create account</button>
   </form>
   <div className="cx-or"><span/>or<span/></div>
   <div className="cx-social">
    <button type="button" className="cx-social-button"><GoogleIcon/>Continue with Google</button>
    <button type="button" className="cx-social-button"><AppleIcon/>Continue with Apple</button>
   </div>
   <p className="cx-terms">By signing up, you agree to our<br/><span className="cx-link">Terms of Service</span> and <span className="cx-link">Privacy Policy</span></p>
  </main>
 </div>;
}

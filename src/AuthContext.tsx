import {onboardingSampleWorkspace} from '../shared/onboardingSamples';
import {upgradeSampleProduct} from '../shared/samplePackaging';
import {authenticateLocal,saveLocalCredentials,removeLocalAccount} from './localAccounts';
import {demoAccount,demoSessionKey,matchesDemoAccount} from '../shared/demoAccount';
import {demoWorkspace,demoProducts,demoProfile} from '../shared/demoDashboard';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Leaf} from 'lucide-react';
import {authClient} from './authClient';
import {restore,setStorageOwner,snapshot} from './accountStorage';
import {workspaceKey,workspaceKeys,type Identity} from '../shared/access';
import {guestTransferAction,type Workspace} from '../shared/workspace';

type AccountState={activateOnboardingSamples:()=>Promise<void>;sampleMode:boolean;setSampleMode:(enabled:boolean)=>Promise<void>;startDemoSignup:(email:string,password:string)=>Promise<void>;signInDemo:(email:string,password:string)=>Promise<boolean>;updateDemoAccount:(email:string,password?:string)=>Promise<void>;deleteDemoAccount:()=>Promise<void>;identity:Identity;loading:boolean;sync:'local'|'saving'|'saved'|'error';syncError:string;signOut:()=>Promise<void>;prepareGuestTransfer:(email:string|null)=>void};
type Conflict={id:string;email:string;guest:Workspace;account:Workspace;version:number};
const previousSessionKey='farmily-before-sample-session';
const pendingKey='farmily-pending-account-transfer';
function seedDemoWorkspace(){
 const current=snapshot(demoAccount.id);if(current['farmily-demo-seed-version']==='5')return;
 if(!current['farmily-products']&&!current['farmily-draft']){restore(demoAccount.id,{...current,...demoWorkspace()});return;}
 const next:Record<string,string>={...current,'farmily-demo-seed-version':'5'};
 for(const key of ['farmily-products','farmily-catalogue-v2','farmily-draft']){try{const value=JSON.parse(current[key]||'null');if(key==='farmily-catalogue-v2'&&Array.isArray(value))next[key]=JSON.stringify(value.map(item=>({...item,product:upgradeSampleProduct(item.product)})));else if(Array.isArray(value))next[key]=JSON.stringify(value.map(upgradeSampleProduct));else if(value&&key==='farmily-draft')next[key]=JSON.stringify(upgradeSampleProduct(value));}catch{/* Preserve malformed records for their own restore guards. */}}
 restore(demoAccount.id,next);
}

const AccountContext=createContext<AccountState|null>(null);
export function useAccount(){const value=useContext(AccountContext);if(!value)throw new Error('AccountProvider is required');return value;}
function prepareSampleWorkspace(){seedDemoWorkspace();const current=snapshot(demoAccount.id);if(!current['farmily-draft'])restore(demoAccount.id,{...current,'farmily-draft':JSON.stringify(demoProducts[0])});}
function prepareGuestTransfer(email:string|null){if(email)localStorage.setItem(pendingKey,JSON.stringify({email:email.toLowerCase(),at:Date.now()}));else localStorage.removeItem(pendingKey);}
function pendingTransfer(email:string){try{const pending=JSON.parse(localStorage.getItem(pendingKey)||'null');return pending?.email===email.toLowerCase()&&Date.now()-pending.at<24*60*60*1000;}catch{return false;}}
export function AccountProvider({children}:{children:ReactNode}){
 const [identity,setIdentity]=useState<Identity>(()=>{try{const stored=localStorage.getItem(demoSessionKey);const demo=stored==='active'?demoAccount:stored?JSON.parse(stored):null;if(demo?.demo===true&&typeof demo.id==='string'&&demo.id.startsWith('demo-')&&typeof demo.email==='string'){if(demo.id===demoAccount.id)prepareSampleWorkspace();setStorageOwner(demo.id);return demo;}}catch{/* use guest workspace */}setStorageOwner(null);return null;});const [loading,setLoading]=useState(!!authClient&&!identity?.demo);
 const [sync,setSync]=useState<AccountState['sync']>('local');const [syncError,setSyncError]=useState('');
 const [conflict,setConflict]=useState<Conflict|null>(null);const [resolving,setResolving]=useState(false);
 const active=useRef<string|null>(null);const sequence=useRef(0);const conflictRef=useRef<Conflict|null>(null);
 async function openWorkspace(id:string,email:string,workspace:Workspace,save:boolean,guest:Workspace|null,version:number){
  if(save){
   const result=await authClient!.from('farmer_workspaces').upsert({user_id:id,data:workspace});
   if(version!==sequence.current)return;
   if(result.error)throw result.error;
   else{
    setSync('saved');setSyncError('');
   }
  }else{setSync('saved');setSyncError('');}
  restore(id,workspace);active.current=id;prepareGuestTransfer(null);
  // Clear only the transferred source after saving, leaving newer guest changes intact.
  if(guest&&JSON.stringify(snapshot(null))===JSON.stringify(guest))for(const key of workspaceKeys)localStorage.removeItem(workspaceKey(key,null));
  setIdentity({id,email});setLoading(false);
 }
 async function connect(){
  try{const session=JSON.parse(localStorage.getItem(demoSessionKey)||'null');if(session?.id===demoAccount.id){setLoading(false);return;}}catch{}
  if(!authClient||conflictRef.current)return;
  const version=++sequence.current;
  try{
   const {data,error}=await authClient.auth.getUser();if(version!==sequence.current)return;
   if(error||!data.user){active.current=null;setStorageOwner(null);setIdentity(null);setSync('local');setLoading(false);return;}
   const id=data.user.id,email=data.user.email||'';
   if(active.current===id){setLoading(false);return;}
   setLoading(true);setStorageOwner(id);
   const workspace=await authClient.from('farmer_workspaces').select('data').eq('user_id',id).maybeSingle();if(version!==sequence.current)return;
   if(workspace.error){active.current=id;setIdentity({id,email});setSync('error');setSyncError('Cloud saving is unavailable. Your drafts stay in this browser.');setLoading(false);return;}
   const account:Workspace=workspace.data?.data||snapshot(id),guest=snapshot(null);
   const action=pendingTransfer(email)?guestTransferAction(account,guest):'account';
   if(action==='conflict'){
    const choice={id,email,account,guest,version};conflictRef.current=choice;setConflict(choice);setLoading(false);return;
   }
   await openWorkspace(id,email,action==='guest'?guest:account,action==='guest'||!workspace.data,action==='guest'?guest:null,version);
  }catch{if(version===sequence.current){active.current=null;setStorageOwner(null);setIdentity(null);setLoading(false);setSync('error');setSyncError('We could not load your account. Your guest progress is still saved in this browser.');}}
 }
 async function resolveConflict(useGuest:boolean){
  if(!conflict||resolving)return;setResolving(true);
  try{
   await openWorkspace(conflict.id,conflict.email,useGuest?conflict.guest:conflict.account,useGuest,useGuest?conflict.guest:null,conflict.version);
   conflictRef.current=null;setConflict(null);
  }catch{setSyncError('We could not save your choice. Both versions are still available. Please try again.');}
  finally{setResolving(false);}
 }
 useEffect(()=>{
  if(!authClient){setStorageOwner(identity?.demo?identity.id:null);return;}
  let mounted=true;
  const {data}=authClient.auth.onAuthStateChange(()=>{if(mounted)window.setTimeout(()=>{if(mounted)void connect();},0);});
  void connect();
  return()=>{mounted=false;sequence.current++;data.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if(!identity||identity.demo||!authClient)return;
  let timer:ReturnType<typeof setTimeout>|undefined;let disposed=false;
  const save=()=>{clearTimeout(timer);setSync('saving');timer=setTimeout(async()=>{try{const result=await authClient!.from('farmer_workspaces').upsert({user_id:identity.id,data:snapshot(identity.id)});if(!disposed){setSync(result.error?'error':'saved');setSyncError(result.error?'Cloud saving is unavailable. Your drafts stay in this browser.':'');}}catch{if(!disposed){setSync('error');setSyncError('Cloud saving is unavailable. Your drafts stay in this browser.');}}},600);};
  window.addEventListener('farmily-workspace-change',save);return()=>{disposed=true;clearTimeout(timer);window.removeEventListener('farmily-workspace-change',save);};
 },[identity?.id]);
 async function startDemoSignup(email:string,password:string){
  if(authClient)return;
  const demo={id:'demo-created-'+crypto.randomUUID(),email:email.trim().toLowerCase(),demo:true as const};
  await saveLocalCredentials(demo.id,demo.email,password);restore(demo.id,snapshot(null));localStorage.setItem(demoSessionKey,JSON.stringify(demo));setStorageOwner(demo.id);active.current=demo.id;setIdentity(demo);setSync('local');setSyncError('');setLoading(false);
 }
 async function signInDemo(email:string,password:string){
  if(authClient&&!matchesDemoAccount(email,password))return false;const signed=await authenticateLocal(email,password);if(!signed)return false;
  if(signed.id===demoAccount.id){if(identity?.id!==demoAccount.id)localStorage.setItem(previousSessionKey,localStorage.getItem(demoSessionKey)||'');prepareSampleWorkspace();}sequence.current++;
  localStorage.setItem(demoSessionKey,JSON.stringify(signed));setStorageOwner(signed.id);active.current=signed.id;setIdentity(signed);setLoading(false);setSync('local');setSyncError('');return true;
 }
 async function updateDemoAccount(email:string,password?:string){if(!identity?.demo)throw new Error('DEV: Account editing is available for local demo accounts.');await saveLocalCredentials(identity.id,email,password);const next={...identity,email:email.trim().toLowerCase()};localStorage.setItem(demoSessionKey,JSON.stringify(next));setIdentity(next);}
 async function deleteDemoAccount(){if(!identity?.demo)throw new Error('DEV: Only a local demo account can be deleted here.');for(const key of workspaceKeys)localStorage.removeItem(workspaceKey(key,identity.id));removeLocalAccount(identity.id);localStorage.removeItem('farmily-guest-mode');await signOut();}
 async function activateOnboardingSamples(){
  if(identity?.id===demoAccount.id)return;
  const source=snapshot(identity?.id||null);
  restore(demoAccount.id,onboardingSampleWorkspace(source));
  await signInDemo(demoAccount.email,'123456');
 }
 async function setSampleMode(enabled:boolean){
  if(enabled){if(identity?.id!==demoAccount.id)await signInDemo(demoAccount.email,'123456');return;}
  if(identity?.id!==demoAccount.id)return;
  const previous=localStorage.getItem(previousSessionKey);localStorage.removeItem(previousSessionKey);localStorage.removeItem(demoSessionKey);sequence.current++;
  try{const account=JSON.parse(previous||'null');if(account?.demo===true&&typeof account.id==='string'&&account.id.startsWith('demo-')&&account.id!==demoAccount.id&&typeof account.email==='string'){localStorage.setItem(demoSessionKey,JSON.stringify(account));active.current=account.id;setStorageOwner(account.id);setIdentity(account);setSync('local');setSyncError('');setLoading(false);return;}}catch{}
  active.current=null;setStorageOwner(null);setIdentity(null);setLoading(false);setSync('local');setSyncError('');if(authClient)await connect();
 }
 const signOut=async()=>{localStorage.removeItem(demoSessionKey);localStorage.removeItem(previousSessionKey);if(authClient&&!identity?.demo){const {error}=await authClient.auth.signOut();if(error)throw error;}sequence.current++;active.current=null;setStorageOwner(null);setIdentity(null);setConflict(null);conflictRef.current=null;setSync('local');};
 return <AccountContext.Provider value={{activateOnboardingSamples,sampleMode:identity?.id===demoAccount.id,setSampleMode,startDemoSignup,signInDemo,updateDemoAccount,deleteDemoAccount,identity,loading,sync,syncError,signOut,prepareGuestTransfer}}>{conflict?<div className="app-shell account-offer"><header className="farmer-header"><span className="farmily-logo"><Leaf size={22}/> Farmily</span></header><main className="farmer-main"><span className="eyebrow">WELCOME BACK</span><h1>Which progress would you like to use?</h1><p className="intro">Your account has saved progress that differs from the farm profile and drafts on this device.</p><section className="card"><h2>Keep my account progress</h2><p>Continue where you left off. Your guest drafts will stay on this device.</p><button className="button primary" disabled={resolving} onClick={()=>void resolveConflict(false)}>Use account progress</button></section><section className="card"><h2>Use my guest progress</h2><p>Replace this account’s farm profile, branding and product drafts with the guest progress from this device.</p><button className="button secondary" disabled={resolving} onClick={()=>void resolveConflict(true)}>Replace with guest progress</button></section>{syncError&&<p role="alert" className="scan-error">{syncError}</p>}</main></div>:loading?<div className="app-shell"><main className="farmer-main"><p role="status">Checking your account…</p></main></div>:<div key={identity?.id||'guest'} className="account-root">{children}</div>}</AccountContext.Provider>;
}

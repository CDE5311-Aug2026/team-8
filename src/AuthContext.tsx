import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {authClient} from './authClient';
import {restore,setStorageOwner,snapshot} from './accountStorage';
import type {Identity} from '../shared/access';

type AccountState={identity:Identity;loading:boolean;sync:'local'|'saving'|'saved'|'error';syncError:string;signOut:()=>Promise<void>;importGuest:(enabled:boolean)=>void};
const AccountContext=createContext<AccountState|null>(null);
export function useAccount(){const value=useContext(AccountContext);if(!value)throw new Error('AccountProvider is required');return value;}
export function AccountProvider({children}:{children:ReactNode}){
 const [identity,setIdentity]=useState<Identity>(null);const [loading,setLoading]=useState(!!authClient);
 const [sync,setSync]=useState<AccountState['sync']>('local');const [syncError,setSyncError]=useState('');
 const active=useRef<string|null>(null);const sequence=useRef(0);const carry=useRef(false);
 async function connect(){
  const version=++sequence.current;
  if(!authClient)return;
  try{
   const {data,error}=await authClient.auth.getUser();if(version!==sequence.current)return;
   if(error||!data.user){active.current=null;setStorageOwner(null);setIdentity(null);setSync('local');setLoading(false);return;}
   const id=data.user.id;
   if(active.current===id){setLoading(false);return;}
   setLoading(true);setStorageOwner(id);
   const workspace=await authClient.from('farmer_workspaces').select('data').eq('user_id',id).maybeSingle();if(version!==sequence.current)return;
   if(workspace.error){setSync('error');setSyncError('Cloud saving is unavailable. Your drafts stay in this browser.');}
   else if(workspace.data?.data){restore(id,workspace.data.data);setSync('saved');setSyncError('');}
   else if(carry.current){restore(id,snapshot(null));setSync('saving');}
   else{setSync('saved');setSyncError('');}
   active.current=id;carry.current=false;setIdentity({id,email:data.user.email||''});setLoading(false);
   if(!workspace.error&&!workspace.data){const saved=await authClient.from('farmer_workspaces').upsert({user_id:id,data:snapshot(id)});if(version===sequence.current){setSync(saved.error?'error':'saved');if(saved.error)setSyncError('Cloud saving is unavailable. Your drafts stay in this browser.');}}
  }catch{if(version===sequence.current){active.current=null;setStorageOwner(null);setIdentity(null);setLoading(false);setSync('error');setSyncError('We could not verify your session. Please sign in again.');}}
 }
 useEffect(()=>{
  if(!authClient){setStorageOwner(null);return;}
  let mounted=true;
  const {data}=authClient.auth.onAuthStateChange(()=>{if(mounted)window.setTimeout(()=>{if(mounted)void connect();},0);});
  void connect();
  return()=>{mounted=false;sequence.current++;data.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if(!identity||!authClient)return;
  let timer:ReturnType<typeof setTimeout>|undefined;let disposed=false;
  const save=()=>{clearTimeout(timer);setSync('saving');timer=setTimeout(async()=>{try{const result=await authClient!.from('farmer_workspaces').upsert({user_id:identity.id,data:snapshot(identity.id)});if(!disposed){setSync(result.error?'error':'saved');setSyncError(result.error?'Cloud saving is unavailable. Your drafts stay in this browser.':'');}}catch{if(!disposed){setSync('error');setSyncError('Cloud saving is unavailable. Your drafts stay in this browser.');}}},600);};
  window.addEventListener('farmily-workspace-change',save);return()=>{disposed=true;clearTimeout(timer);window.removeEventListener('farmily-workspace-change',save);};
 },[identity?.id]);
 const signOut=async()=>{if(authClient){const {error}=await authClient.auth.signOut();if(error)throw error;}sequence.current++;active.current=null;setStorageOwner(null);setIdentity(null);setSync('local');};
 return <AccountContext.Provider value={{identity,loading,sync,syncError,signOut,importGuest:(enabled)=>{carry.current=enabled;}}}>{loading?<div className="app-shell"><main className="farmer-main"><p role="status">Checking your account…</p></main></div>:<div key={identity?.id||'guest'} className="account-root">{children}</div>}</AccountContext.Provider>;
}

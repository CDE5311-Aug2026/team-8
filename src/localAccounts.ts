import {demoAccount,matchesDemoAccount} from '../shared/demoAccount.ts';
export type LocalAccount={id:string;email:string;salt:string;digest:string};
const key='farmily-local-demo-accounts';
export function localAccounts():LocalAccount[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(a=>a&&typeof a.id==='string'&&typeof a.email==='string'&&typeof a.salt==='string'&&typeof a.digest==='string'):[];}catch{return [];}}
async function digest(password:string,salt:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+password));return Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function saveLocalCredentials(id:string,email:string,password?:string){
 const accounts=localAccounts(),prior=accounts.find(a=>a.id===id);email=email.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');
 if(accounts.some(a=>a.email===email&&a.id!==id)||email===demoAccount.email&&id!==demoAccount.id)throw new Error('That email already has a local demo account.');
 if(password!==undefined&&password.length<6)throw new Error('Use at least 6 characters.');
 const salt=prior?.salt||crypto.randomUUID();const hash=password!==undefined?await digest(password,salt):prior?.digest||await digest('123456',salt);
 const next={id,email,salt,digest:hash};localStorage.setItem(key,JSON.stringify([...accounts.filter(a=>a.id!==id),next]));return next;
}
export async function authenticateLocal(email:string,password:string){
 const accounts=localAccounts(),account=accounts.find(a=>a.email===email.trim().toLowerCase());
 if(account)return await digest(password,account.salt)===account.digest?{id:account.id,email:account.email,demo:true as const}:null;
 return !accounts.some(a=>a.id===demoAccount.id)&&matchesDemoAccount(email,password)?demoAccount:null;
}
export function removeLocalAccount(id:string){localStorage.setItem(key,JSON.stringify(localAccounts().filter(a=>a.id!==id)));}

import {workspaceKey,workspaceKeys} from '../shared/access';
let owner:string|null=null;
export function setStorageOwner(id:string|null){owner=id;}
export const workspaceStorage={
 getItem(key:string){return localStorage.getItem(workspaceKey(key,owner));},
 setItem(key:string,value:string){localStorage.setItem(workspaceKey(key,owner),value);window.dispatchEvent(new Event('farmily-workspace-change'));},
 removeItem(key:string){localStorage.removeItem(workspaceKey(key,owner));window.dispatchEvent(new Event('farmily-workspace-change'));},
};
export function snapshot(id:string|null):Record<string,string>{return Object.fromEntries(workspaceKeys.flatMap(key=>{const value=localStorage.getItem(workspaceKey(key,id));return value?[[key,value]]:[];}));}
export function restore(id:string,data:Record<string,string>){for(const key of workspaceKeys){if(typeof data[key]==='string')localStorage.setItem(workspaceKey(key,id),data[key]);else localStorage.removeItem(workspaceKey(key,id));}}

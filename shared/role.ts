export type UserRole='farmer'|'customer';
export const roleKey='farmily-role';
export function parseRole(value:string|null):UserRole|null{return value==='farmer'||value==='customer'?value:null;}
// Every new visit (a QR code, a shared link, a new tab, reopening the home-screen app) starts on
// the buy or sell choice. Within the same visit a refresh keeps farmers in their shop.
// Picking "I want to sell" again still resumes the farmer's saved progress.
export const visitKey='farmily-visit-role';
export function initialRole(value:string|null,hasFarmerProfile:boolean,sameVisit=true):UserRole|null{if(!sameVisit)return null;return parseRole(value)==='farmer'||hasFarmerProfile?'farmer':null;}
export function entryStep(signedIn:boolean,guest:boolean,role:UserRole|null){return !signedIn&&!guest?'welcome':role||'welcome';}

export type UserRole='farmer'|'customer';
export const roleKey='farmily-role';
export function parseRole(value:string|null):UserRole|null{return value==='farmer'||value==='customer'?value:null;}
export function initialRole(value:string|null,hasFarmerProfile:boolean):UserRole|null{return parseRole(value)||(hasFarmerProfile?'farmer':null);}
export function entryStep(signedIn:boolean,guest:boolean,role:UserRole|null){return !signedIn&&!guest?'welcome':role||'welcome';}

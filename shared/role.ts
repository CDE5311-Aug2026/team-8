export type UserRole='farmer'|'customer';
export const roleKey='farmily-role';
export function parseRole(value:string|null):UserRole|null{return value==='farmer'||value==='customer'?value:null;}
// Farmers go back to their shop. Customers start from the buy or sell choice on every visit,
// so a shared link or QR code always opens that page first.
export function initialRole(value:string|null,hasFarmerProfile:boolean):UserRole|null{return parseRole(value)==='farmer'||hasFarmerProfile?'farmer':null;}
export function entryStep(signedIn:boolean,guest:boolean,role:UserRole|null){return !signedIn&&!guest?'welcome':role||'welcome';}

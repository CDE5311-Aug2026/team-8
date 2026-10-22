export const demoAccount={id:'demo-farmer',email:'farmer@example.com',demo:true as const};
export const demoSessionKey='farmily-demo-session';
// Public prototype credentials, never a real authentication token.
export function matchesDemoAccount(email:string,password:string){return email.trim().toLowerCase()===demoAccount.email&&password==='123456';}

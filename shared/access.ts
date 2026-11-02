export type Identity={id:string;email:string;demo?:boolean}|null;
export function canPublish(identity:Identity):boolean{return !!identity?.id&&!identity.demo;}
export const canGenerateBranding=canPublish;
export function workspaceKey(key:string,userId:string|null){return userId?`farmily-user:${userId}:${key}`:key;}
export const workspaceKeys=['farmily-role','farmily-onboarding-skipped','farmily-profile','farmily-profile-draft','farmily-v2-onboarding','farmily-account-dismissed','farmily-brand','farmily-brand-designs','farmily-brand-work','farmily-brand-v2-work','farmily-product-work','farmily-publish-v2-work','farmily-draft','farmily-catalogue-v2','farmily-shorts-v2','farmily-products','farmily-orders','farmily-demo-promotions','farmily-demo-seed-version'] as const;

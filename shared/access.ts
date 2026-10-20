export type Identity={id:string;email:string}|null;
export function canPublish(identity:Identity):boolean{return !!identity?.id;}
export const canGenerateBranding=canPublish;
export function workspaceKey(key:string,userId:string|null){return userId?`farmily-user:${userId}:${key}`:key;}
export const workspaceKeys=['farmily-role','farmily-onboarding-skipped','farmily-profile','farmily-profile-draft','farmily-account-dismissed','farmily-brand','farmily-brand-designs','farmily-brand-work','farmily-draft'] as const;

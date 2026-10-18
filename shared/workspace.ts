import {workspaceKeys} from './access.ts';

export type Workspace=Record<string,string>;
const progressKeys=workspaceKeys.filter(key=>!['farmily-role','farmily-onboarding-skipped'].includes(key));
export function hasProgress(workspace:Workspace){return progressKeys.some(key=>!!workspace[key]);}
export function guestTransferAction(account:Workspace,guest:Workspace):'account'|'guest'|'conflict'{
 if(!hasProgress(guest))return 'account';
 if(!hasProgress(account))return 'guest';
 return progressKeys.every(key=>account[key]===guest[key])?'account':'conflict';
}

export type Screen='interests'|'home'|'endOfDemo'|'product'|'signup'|'cart';
export type Go=(screen:Screen,productId?:string)=>void;
export type Back=()=>void;
export type ActionType='add'|'buy';
export type PendingAction={type:ActionType;productId:string};
export type RequestAction=(type:ActionType,productId:string)=>void;

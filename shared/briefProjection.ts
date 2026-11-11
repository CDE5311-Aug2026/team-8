import {briefKinds,type BriefKind} from './briefV2.ts';
export const projectionKey='farmily-brief-projection-v1';
export type ProjectionPlan={selected:BriefKind[];uplifts:Record<BriefKind,number>};
export const defaultProjectionPlan=():ProjectionPlan=>({selected:[...briefKinds],uplifts:{bundle:8,taster:5,delivery:4}});
export function restoreProjectionPlan(value:unknown):ProjectionPlan{
 const plan=value as ProjectionPlan;
 if(!plan||!Array.isArray(plan.selected)||plan.selected.some(kind=>!briefKinds.includes(kind))||!plan.uplifts||briefKinds.some(kind=>!Number.isFinite(plan.uplifts[kind])||plan.uplifts[kind]<0||plan.uplifts[kind]>30))return defaultProjectionPlan();
 return {selected:[...new Set(plan.selected)],uplifts:{...plan.uplifts}};
}
export function salesProjection(plan:ProjectionPlan,sample:boolean){
 // Weekly sales for the last 4 weeks; they add up to Your sales' 30-day total (SGD 1,240).
 const history=sample?[260,295,325,360]:[0,0,0,0];
 const weekly=history.at(-1)!;
 const lift=sample?[...new Set(plan.selected)].reduce((sum,kind)=>sum+plan.uplifts[kind],0)/100:0;
 const baseline=Array.from({length:4},()=>weekly);
 const projected=baseline.map(amount=>Math.round(amount*(1+lift)*100)/100);
 const total=(values:number[])=>Math.round(values.reduce((sum,n)=>sum+n,0)*100)/100;
 return {history,baseline,projected,lift,observed:total(history),baselineTotal:total(baseline),projectedTotal:total(projected),improvement:Math.round((total(projected)-total(baseline))*100)/100};
}

// Saved state for the "Your brand" page: how many main-brand changes are left (3 in total) and
// designs made from the brand that are not on a product yet ("Not used yet").
import {hasDesignTweaks,validDesignTweaks,validLabelTemplate,type DesignTweaks,type LabelTemplate} from './labelTemplates.ts';

export const brandPageKey='farmily-brand-page-v1';
export const brandChangeLimit=3;
// A design made before it has a product: only the label style. Shape, name and weight come from the product it's used on.
export type BrandExtraDesign={id:string;name:string;template:LabelTemplate;tweaks?:DesignTweaks};
export type BrandPageState={version:1;changesLeft:number;extras:BrandExtraDesign[]};

export function restoreBrandPage(value:unknown):BrandPageState{
 const fallback:BrandPageState={version:1,changesLeft:brandChangeLimit,extras:[]};
 if(!value||typeof value!=='object')return fallback;
 const state=value as BrandPageState;
 const changesLeft=Number.isInteger(state.changesLeft)?Math.max(0,Math.min(brandChangeLimit,state.changesLeft)):brandChangeLimit;
 const extras=Array.isArray(state.extras)?state.extras.filter(extra=>!!extra&&typeof extra.id==='string'&&typeof extra.name==='string'&&extra.name.length<=200&&validLabelTemplate(extra.template)&&(extra.tweaks===undefined||validDesignTweaks(extra.tweaks))).map(extra=>{const {tweaks,...rest}=extra;return hasDesignTweaks(tweaks)?{...rest,tweaks}:rest;}).slice(0,50):[];
 return {version:1,changesLeft,extras};
}

// The preset farm starts with one design that is not on a product yet.
export const presetBrandPage:BrandPageState={version:1,changesLeft:brandChangeLimit,extras:[{id:'preset-holiday-box',name:'Holiday gift box',template:'botanical'}]};

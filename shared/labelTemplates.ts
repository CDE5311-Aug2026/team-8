import {brandPalettes,isRefinedBrand,readableBrandInk} from './brandRefined.ts';
import type {BrandKit} from './branding.ts';
export const labelTemplates=['botanical','minimal','market'] as const;
export type LabelTemplate=typeof labelTemplates[number];
export const labelTemplateNames={botanical:'Botanical',minimal:'Minimal',market:'Market'};
export const botanicalMotif='<path d="M12 82C14 59 32 40 56 12M25 59C9 56 5 47 8 39C21 41 28 47 25 59ZM36 44C22 34 24 23 29 19C40 26 42 34 36 44ZM44 34C47 18 58 18 64 21C60 34 53 38 44 34ZM18 70C30 56 42 60 45 66C33 75 25 76 18 70Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
// A product's own design: a theme as the starting point, then small changes that stay inside the brand.
export const sprigArt='<path d="M20 46V4M20 30C20 20 14 14 6 10M20 22C20 14 26 9 34 6M20 38C20 30 12 26 4 24M20 34C21 27 28 23 36 22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
export type DesignArt='leaves'|'sprig'|'none';export type DesignLayout='centred'|'band';
export type DesignTweaks={paper?:string;art?:DesignArt;layout?:DesignLayout};
export const designArtNames:Record<DesignArt,string>={leaves:'Leaves',sprig:'Sprig',none:'None'};
export const designLayoutNames:Record<DesignLayout,string>={centred:'Centred',band:'Top band'};
// Label colours a farmer can pick: white, cream, then the brand's own colours.
// Label colours: white, cream and the brand colours. Near-identical colours are shown once.
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const close=(a:string,b:string)=>{const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])<24;};
export function designPapers(brand:BrandKit){const out:string[]=[];for(const color of ['#ffffff','#f6ecd9',...brand.concept.colors.map(c=>c.toLowerCase())])if(/^#[0-9a-f]{6}$/.test(color)&&!out.some(other=>close(other,color)))out.push(color);return out.slice(0,6);}
export function hasDesignTweaks(tweaks:DesignTweaks|undefined|null):tweaks is DesignTweaks{return !!tweaks&&(!!tweaks.paper||!!tweaks.art||!!tweaks.layout);}
export function validDesignTweaks(value:unknown):value is DesignTweaks{if(!value||typeof value!=='object')return false;const t=value as DesignTweaks;return (t.paper===undefined||/^#[0-9a-f]{6}$/i.test(t.paper))&&(t.art===undefined||t.art in designArtNames)&&(t.layout===undefined||t.layout in designLayoutNames);}
export function labelTheme(brand:BrandKit,template:LabelTemplate='botanical',tweaks?:DesignTweaks){
 if(brand.concept.colors.some(color=>!/^#[0-9a-f]{6}$/i.test(color)))throw Error('Invalid brand colors.');
 const palette=isRefinedBrand(brand)?brandPalettes[brand.refined.selection.palette]:null;const paper=template==='botanical'?'#f6ecd9':template==='minimal'?'#ffffff':palette?.light||brand.concept.colors[1];const original=palette?.main||brand.concept.colors[0];const preferred=template==='botanical'?'#'+[1,3,5].map(index=>Math.round(parseInt(original.slice(index,index+2),16)*.74).toString(16).padStart(2,'0')).join(''):original;const finalPaper=tweaks?.paper||paper;return {paper:finalPaper,ink:readableBrandInk(finalPaper,preferred),accent:brand.concept.colors[2]};
}
export function validLabelTemplate(value:unknown):value is LabelTemplate{return labelTemplates.includes(value as LabelTemplate);}

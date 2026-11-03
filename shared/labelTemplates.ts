import {brandPalettes,isRefinedBrand,readableBrandInk} from './brandRefined.ts';
import type {BrandKit} from './branding.ts';
export const labelTemplates=['botanical','minimal','market'] as const;
export type LabelTemplate=typeof labelTemplates[number];
export const labelTemplateNames={botanical:'Botanical',minimal:'Minimal',market:'Market'};
export const botanicalMotif='<path d="M12 82C14 59 32 40 56 12M25 59C9 56 5 47 8 39C21 41 28 47 25 59ZM36 44C22 34 24 23 29 19C40 26 42 34 36 44ZM44 34C47 18 58 18 64 21C60 34 53 38 44 34ZM18 70C30 56 42 60 45 66C33 75 25 76 18 70Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
export function labelTheme(brand:BrandKit,template:LabelTemplate='botanical'){
 if(brand.concept.colors.some(color=>!/^#[0-9a-f]{6}$/i.test(color)))throw Error('Invalid brand colors.');
 const palette=isRefinedBrand(brand)?brandPalettes[brand.refined.selection.palette]:null;const paper=template==='botanical'?'#f6ecd9':template==='minimal'?'#ffffff':palette?.light||brand.concept.colors[1];const original=palette?.main||brand.concept.colors[0];const preferred=template==='botanical'?'#'+[1,3,5].map(index=>Math.round(parseInt(original.slice(index,index+2),16)*.74).toString(16).padStart(2,'0')).join(''):original;return {paper,ink:readableBrandInk(paper,preferred),accent:brand.concept.colors[2]};
}
export function validLabelTemplate(value:unknown):value is LabelTemplate{return labelTemplates.includes(value as LabelTemplate);}

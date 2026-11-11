// Complete brand directions offered on "Change main brand" (Figma: Components · v1 → Brand direction card).
// Each one sets the logo font, colours, font pairing and pattern together, so the brand stays consistent.
import type {BrandKit} from './branding.ts';
import type {V2BrandKit} from './brandV2.ts';

export type BrandDirection={id:string;name:string;colors:string[];logoFont:string;headingFont:string;bodyFont:string;pattern:string;designStyle:NonNullable<BrandKit['designStyle']>;typography:'serif'|'sans'};

export const brandDirections:BrandDirection[]=[
 {id:'garden-journal',name:'Garden journal',colors:['#074226','#e9b949','#f3efe6'],logoFont:'Courgette',headingFont:'Bricolage Grotesque',bodyFont:'Figtree',pattern:'Leaf pattern',designStyle:'Minimal',typography:'sans'},
 {id:'sunday-market',name:'Sunday market',colors:['#8a3b12','#f1d9a6','#f3efe6'],logoFont:'Bree Serif',headingFont:'Bree Serif',bodyFont:'Lato',pattern:'Hand-drawn pattern',designStyle:'Rustic',typography:'serif'},
 {id:'quiet-coast',name:'Quiet coast',colors:['#24456b','#f6c9b5','#f3efe6'],logoFont:'DM Serif Display',headingFont:'DM Serif Display',bodyFont:'Figtree',pattern:'Dotted pattern',designStyle:'Playful',typography:'serif'},
 {id:'earth-and-clay',name:'Earth and clay',colors:['#3f3a33','#e7e1d6','#f3efe6'],logoFont:'Oleo Script',headingFont:'Bricolage Grotesque',bodyFont:'Lato',pattern:'Grain pattern',designStyle:'Rustic',typography:'sans'},
];

export type DirectionKit=V2BrandKit&{directionId?:string;logoFont?:string;pattern?:string};

// The three directions to offer: everything except the one the farm already uses.
export function directionsFor(brand:BrandKit){
 const current=(brand as DirectionKit).directionId;
 return brandDirections.filter(direction=>direction.id!==current).slice(0,3);
}

export function applyDirection(brand:BrandKit,direction:BrandDirection):DirectionKit{
 return {...brand,concept:{...brand.concept,name:direction.name,colors:direction.colors,typography:direction.typography},designStyle:direction.designStyle,headingFont:direction.headingFont,bodyFont:direction.bodyFont,logoFont:direction.logoFont,pattern:direction.pattern,directionId:direction.id};
}

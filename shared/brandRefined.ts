import {farmBrandRanking,farmBrandAnchor} from './brandFarmContext.ts';
import {signature,validProfile,type BrandKit,type FarmerProfile} from './branding.ts';

export const refinedBrandKey='farmily-brand-refined-work';
// Values and order come from Figma 1588:233. The two unnamed swatches keep their hex labels.
export const brandPalettes=[
 {id:'moss',name:'Moss',main:'#3f5a3c',light:'#e3e8d5'},
 {id:'wheat',name:'Wheat',main:'#76602e',light:'#f1e9d2'},
 {id:'clay',name:'Clay',main:'#8a5a3e',light:'#f0e2d3'},
 {id:'harbour',name:'Harbour',main:'#3e5566',light:'#dce4ea'},
 {id:'purple',name:'#5E4258',main:'#5e4258',light:'#ede2ea'},
 {id:'neutral',name:'#3D3A36',main:'#3d3a36',light:'#eae6df'},
] as const;
export const brandLogoFonts=['Courgette','Grand Hotel','Yellowtail','Kaushan Script','Oleo Script','DM Serif Display'] as const;
export const brandMarks=['Leaf','Sprout','Plant','Seed','Sun','Flower'] as const;
export const brandPatterns=['Leaf line','Dots','Lines','Plain'] as const;
export const brandTabs=['Colour','Type','Logo','Pattern'] as const;
export type BrandTab=typeof brandTabs[number];
export type BrandSelection={palette:number;font:number;mark:number;pattern:number};
export type BrandLook={name:string;selection:BrandSelection;reason:string};
export type RefinedBrandWork={version:1;sourceSignature:string;stage:'looks'|'tune'|'kit';tab:BrandTab;looks:BrandLook[];selected:number;selection:BrandSelection;directionRequest:string;requests:Record<BrandTab,string>};
export type RefinedBrandKit=BrandKit&{headingFont:string;bodyFont:'Figtree';preferences:string;refined:{version:1;selection:BrandSelection;contrast:Record<string,string>}};
export function validBrandSelection(value:unknown):value is BrandSelection{if(!value||typeof value!=='object')return false;const s=value as BrandSelection;return ([['palette',6],['font',6],['mark',6],['pattern',4]] as const).every(([key,max])=>Number.isInteger(s[key])&&s[key]>=0&&s[key]<max);}
export function isRefinedBrand(brand:BrandKit|null|undefined):brand is RefinedBrandKit{const candidate=brand as RefinedBrandKit|undefined;return candidate?.refined?.version===1&&validBrandSelection(candidate.refined.selection);}
export function contrastRatio(a:string,b:string){function luminance(hex:string){const channels=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;}const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function readableBrandInk(background:string,preferred:string){if(contrastRatio(background,preferred)>=4.5)return preferred;return contrastRatio(background,'#1a1a18')>=contrastRatio(background,'#ffffff')?'#1a1a18':'#ffffff';}
const optionReasons:Record<BrandTab,string[]>={
 Colour:['Moss pairs leafy green with pale cream to give the story a botanical setting.','Wheat uses golden brown and warm cream for a harvest-inspired label.','Clay brings soil-brown warmth to the farm name and packaging.','Harbour uses blue-grey and cool cream for a quieter farm identity.','The plum palette adds a floral accent with a soft pink background.','Charcoal and warm grey let the farm name and product take the lead.'],
 Type:['Courgette gives the farm name the personal feel of a handwritten note.','Grand Hotel makes the farm name feel like a welcoming market sign.','Yellowtail adds flowing, informal lettering to the farm name.','Kaushan Script adds brush-like strokes for a handmade feel.','Oleo Script gives the farm name rounded, bold lettering that stands out on a label.','DM Serif Display gives the farm name a clear, classic presence on small labels.'],
 Logo:['A single leaf offers a simple botanical symbol for the farm.','A sprout brings the idea of a new growing season into the farm mark.','The plant mark gives the identity a fuller botanical shape.','The seed mark suggests beginnings and care carried forward.','The sun mark adds a bright, open shape to the farm identity.','The flower mark adds a blossom motif to the farm identity.'],
 Pattern:['Leaf lines carry a botanical detail around the edges of the product label.','Small dots add a gentle rhythm without crowding the product name.','Fine lines give the label an orderly structure around the farm name.','A plain background gives the farm story and product information more space.'],
};
export function brandReasonParts(profile:FarmerProfile,tab:BrandTab,index:number,request=''){
 const asked=request.trim()?` You asked for “${request.trim().slice(0,90)}”.`:'';
 return {suggestion:optionReasons[tab][index]+asked,reference:farmBrandAnchor(profile,index%3)};
}
export function brandReason(profile:FarmerProfile,tab:BrandTab,index:number,request=''){
 const {suggestion,reference}=brandReasonParts(profile,tab,index,request);return suggestion+' '+reference;
}
const lookNames=['Hand-picked','Market fresh','Clean greens'];
export function brandLookReason(profile:FarmerProfile,selection:BrandSelection,index:number,request=''){
 return request?`For ${profile.products}. You asked for “${request.trim().slice(0,100)}”; this combines ${brandPalettes[selection.palette].name}, ${brandLogoFonts[selection.font]} and ${brandPatterns[selection.pattern]}.`:`You grow ${profile.products}. ${index===0?'A soft, hand-written look':index===1?'A warm, friendly market look':'A calmer, modern look'}.`;
}
export function rankedBrandOptions(profile:FarmerProfile,tab:BrandTab,request=''):number[]{
 const q=request.toLowerCase();let order=farmBrandRanking(profile,tab,request);
 const prefer=(index:number)=>{order=[index,...order.filter(value=>value!==index)];};
 if(tab==='Colour'){if(/honey|sun|gold|warm|market/.test(q))order=[1,2,0,3,4,5];if(/even warmer|soil|earth|clay/.test(q))prefer(2);if(/blue|sea|harbour|cool/.test(q))prefer(3);if(/purple|pink/.test(q))prefer(4);if(/contrast|black|neutral/.test(q))prefer(5);if(/green|moss|back to green/.test(q))prefer(0);}
 if(tab==='Type'){if(/classic|serif|read/.test(q))prefer(5);if(/playful|grand/.test(q))prefer(1);if(/yellowtail/.test(q))prefer(2);if(/kaushan/.test(q))prefer(3);if(/oleo|bold/.test(q))prefer(4);if(/hand.drawn|hand.painted|courgette/.test(q))prefer(0);}
 if(tab==='Logo'){if(/start|sprout/.test(q))prefer(1);if(/plant|herb/.test(q))prefer(2);if(/seed/.test(q))prefer(3);if(/sun|brighter/.test(q))prefer(4);if(/flower|honey/.test(q))prefer(5);if(/leaf|simple|greens|kangkong|bayam/.test(q))prefer(0);}
 if(tab==='Pattern'){if(/dot|simple/.test(q))prefer(1);if(/line|bold/.test(q))prefer(2);if(/no pattern|plain|none/.test(q))prefer(3);if(/hand.drawn|leaf/.test(q))prefer(0);}
 return order;
}
export function makeBrandLooks(profile:FarmerProfile,request=''):BrandLook[]{
 validProfile(profile);const colours=rankedBrandOptions(profile,'Colour',request);const fonts=rankedBrandOptions(profile,'Type',request);const marks=rankedBrandOptions(profile,'Logo',request);const patterns=rankedBrandOptions(profile,'Pattern',request);
 return [0,1,2].map(index=>{const selection={palette:colours[index],font:fonts[index],mark:marks[index],pattern:patterns[index]};return {name:lookNames[index],selection,reason:brandLookReason(profile,selection,index,request)};});
}
export function newRefinedBrandWork(profile:FarmerProfile,brand:BrandKit|null=null):RefinedBrandWork{const looks=makeBrandLooks(profile);return {version:1,sourceSignature:signature(profile),stage:isRefinedBrand(brand)?'kit':'looks',tab:'Colour',looks,selected:0,selection:isRefinedBrand(brand)?{...brand.refined.selection}:looks[0].selection,directionRequest:'',requests:{Colour:'',Type:'',Logo:'',Pattern:''}};}
export function restoreRefinedBrandWork(value:unknown,profile:FarmerProfile):RefinedBrandWork|null{try{const work=value as RefinedBrandWork;if(!work||work.version!==1||work.sourceSignature!==signature(profile)||!['looks','tune','kit'].includes(work.stage)||!brandTabs.includes(work.tab)||!validBrandSelection(work.selection)||!Number.isInteger(work.selected)||work.selected<0||work.selected>2||!Array.isArray(work.looks)||work.looks.length!==3||work.looks.some(look=>!look||!validBrandSelection(look.selection)||typeof look.name!=='string'||look.name.length>120||typeof look.reason!=='string'||look.reason.length>2000)||typeof work.directionRequest!=='string'||work.directionRequest.length>2500||!work.requests||brandTabs.some(tab=>typeof work.requests[tab]!=='string'||work.requests[tab].length>2500))return null;return {...work,looks:work.looks.map((look,index)=>({...look,name:lookNames[index],reason:brandLookReason(profile,look.selection,index,work.directionRequest)}))};}catch{return null;}}
export function makeRefinedBrand(work:RefinedBrandWork,profile:FarmerProfile):RefinedBrandKit{
 validProfile(profile);if(!validBrandSelection(work.selection))throw new Error('Choose an approved brand option.');const s=work.selection,p=brandPalettes[s.palette];
 const contrast={main:readableBrandInk(p.main,p.light),light:readableBrandInk(p.light,p.main),white:readableBrandInk('#ffffff',p.main)};
 return {origin:'sample',image:null,imageSource:'none',profileSignature:signature(profile),concept:{id:'refined-'+[s.palette,s.font,s.mark,s.pattern].join('-'),name:work.looks[work.selected].name,tagline:profile.farmName,rationale:work.looks[work.selected].reason,colors:[p.main,p.light,'#1a1a18'],typography:s.font===5?'serif':'sans',packaging:`${brandMarks[s.mark]} mark · ${brandPatterns[s.pattern]} pattern`,imagePrompt:'Local brand board using approved colours, logo font, mark and pattern. No generated artwork.'},headingFont:brandLogoFonts[s.font],bodyFont:'Figtree',preferences:[work.directionRequest,...Object.values(work.requests)].filter(Boolean).join('\n'),refined:{version:1,selection:{...s},contrast}};
}

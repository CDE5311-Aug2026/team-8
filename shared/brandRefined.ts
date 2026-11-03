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
function quote(profile:FarmerProfile){return (profile.story.trim()||profile.products.trim()).slice(0,130);}
export function brandReason(profile:FarmerProfile,tab:BrandTab,index:number,request=''){
 const product=profile.products.trim();const source=quote(profile);
 if(request.trim())return `You asked for “${request.trim().slice(0,100)}”. ${tab==='Colour'?brandPalettes[index].name:tab==='Type'?brandLogoFonts[index]:tab==='Logo'?brandMarks[index]:brandPatterns[index]} is an approved ${tab==='Type'?'logo font':tab==='Logo'?'mark':tab==='Pattern'?'pattern':'palette'} for ${product}.`;
 if(tab==='Colour'&&index===0&&/kangkong|bayam/i.test(product))return `Like your ${product}. Fresh and green, the way your greens look on the stall.`;
 if(tab==='Type'&&index===0&&/by hand|hand.pick/i.test(profile.story))return 'Hand-written, like a market sign. Fits how you pick everything by hand.';
 if(tab==='Logo'&&index===0)return `You grow ${product}, so one simple leaf says it clearly.`;
 if(tab==='Pattern'&&index===0)return `Rows of leaves, inspired by ${product}. Quiet enough for the label.`;
 return `For ${product}. ${tab==='Colour'?'This palette':tab==='Type'?'This logo font':tab==='Logo'?'This mark':'This pattern'} was picked from “${source}”.`;
}
export function rankedBrandOptions(profile:FarmerProfile,tab:BrandTab,request=''):number[]{
 const q=request.toLowerCase(),context=(profile.products+' '+profile.story).toLowerCase();let order=tab==='Colour'?[0,1,2,3,4,5]:tab==='Type'?[0,1,2,3,4,5]:tab==='Logo'?[0,1,2,3,4,5]:[0,1,2,3];
 const prefer=(index:number)=>{order=[index,...order.filter(value=>value!==index)];};
 if(tab==='Colour'){if(/honey|sun|gold|warm|market/.test(q||context))order=[1,2,0,3,4,5];if(/even warmer|soil|earth|clay/.test(q))prefer(2);if(/blue|sea|harbour|cool/.test(q))prefer(3);if(/purple|pink/.test(q))prefer(4);if(/contrast|black|neutral/.test(q))prefer(5);if(/green|moss|back to green/.test(q))prefer(0);}
 if(tab==='Type'){if(/classic|serif|read/.test(q))prefer(5);if(/playful|grand/.test(q))prefer(1);if(/yellowtail/.test(q))prefer(2);if(/kaushan/.test(q))prefer(3);if(/oleo|bold/.test(q))prefer(4);if(/hand.drawn|hand.painted|courgette/.test(q))prefer(0);}
 if(tab==='Logo'){if(/start|sprout/.test(q||context))prefer(1);if(/plant|herb/.test(q))prefer(2);if(/seed/.test(q))prefer(3);if(/sun|brighter/.test(q))prefer(4);if(/flower|honey/.test(q||context))prefer(5);if(/leaf|simple|greens|kangkong|bayam/.test(q||context))prefer(0);}
 if(tab==='Pattern'){if(/dot|simple/.test(q))prefer(1);if(/line|bold/.test(q))prefer(2);if(/no pattern|plain|none/.test(q))prefer(3);if(/hand.drawn|leaf/.test(q))prefer(0);}
 return order;
}
export function makeBrandLooks(profile:FarmerProfile,request=''):BrandLook[]{
 validProfile(profile);const colours=rankedBrandOptions(profile,'Colour',request);const fonts=rankedBrandOptions(profile,'Type',request);const marks=rankedBrandOptions(profile,'Logo',request);const patterns=rankedBrandOptions(profile,'Pattern',request);
 return ['Hand-picked','Market fresh','Clean greens'].map((name,index)=>{const selection={palette:request?colours[index]:[0,1,3][index],font:request?fonts[index]:[0,1,5][index],mark:request?marks[index]:0,pattern:request?patterns[index]:index};return {name,selection,reason:request?`For ${profile.products}. You asked for “${request.trim().slice(0,100)}”; this combines ${brandPalettes[selection.palette].name}, ${brandLogoFonts[selection.font]} and ${brandPatterns[selection.pattern]}.`:`You grow ${profile.products}. ${index===0?'A soft, hand-written look':index===1?'A warm, friendly market look':'A calmer, modern look'}.`};});
}
export function newRefinedBrandWork(profile:FarmerProfile,brand:BrandKit|null=null):RefinedBrandWork{const looks=makeBrandLooks(profile);return {version:1,sourceSignature:signature(profile),stage:isRefinedBrand(brand)?'kit':'looks',tab:'Colour',looks,selected:0,selection:isRefinedBrand(brand)?{...brand.refined.selection}:looks[0].selection,directionRequest:'',requests:{Colour:'',Type:'',Logo:'',Pattern:''}};}
export function restoreRefinedBrandWork(value:unknown,profile:FarmerProfile):RefinedBrandWork|null{try{const work=value as RefinedBrandWork;if(!work||work.version!==1||work.sourceSignature!==signature(profile)||!['looks','tune','kit'].includes(work.stage)||!brandTabs.includes(work.tab)||!validBrandSelection(work.selection)||!Number.isInteger(work.selected)||work.selected<0||work.selected>2||!Array.isArray(work.looks)||work.looks.length!==3||work.looks.some(look=>!look||!validBrandSelection(look.selection)||typeof look.name!=='string'||look.name.length>120||typeof look.reason!=='string'||look.reason.length>2000)||typeof work.directionRequest!=='string'||work.directionRequest.length>2500||!work.requests||brandTabs.some(tab=>typeof work.requests[tab]!=='string'||work.requests[tab].length>2500))return null;return work;}catch{return null;}}
export function makeRefinedBrand(work:RefinedBrandWork,profile:FarmerProfile):RefinedBrandKit{
 validProfile(profile);if(!validBrandSelection(work.selection))throw new Error('Choose an approved brand option.');const s=work.selection,p=brandPalettes[s.palette];
 const contrast={main:readableBrandInk(p.main,p.light),light:readableBrandInk(p.light,p.main),white:readableBrandInk('#ffffff',p.main)};
 return {origin:'sample',image:null,imageSource:'none',profileSignature:signature(profile),concept:{id:'refined-'+[s.palette,s.font,s.mark,s.pattern].join('-'),name:work.looks[work.selected].name,tagline:profile.farmName,rationale:work.looks[work.selected].reason,colors:[p.main,p.light,'#1a1a18'],typography:s.font===5?'serif':'sans',packaging:`${brandMarks[s.mark]} mark · ${brandPatterns[s.pattern]} pattern`,imagePrompt:'Local brand board using approved colours, logo font, mark and pattern. No generated artwork.'},headingFont:brandLogoFonts[s.font],bodyFont:'Figtree',preferences:[work.directionRequest,...Object.values(work.requests)].filter(Boolean).join('\n'),refined:{version:1,selection:{...s},contrast}};
}

import type {FarmerProfile} from './branding.ts';
import type {BrandTab} from './brandRefined.ts';

type Theme={match:RegExp;name:string;prompt:string;choices:Record<BrandTab,number[]>};
const themes:Theme[]=[
 {match:/\bfamily\b|generations?|heritage|tradition|grandmother|grandfather/,name:'Rooted in tradition',prompt:'Reflect our family roots',choices:{Colour:[2,1],Type:[5,0],Logo:[3,2],Pattern:[2,0]}},
 {match:/by hand|hand[- ]?picked|handmade|small[- ]batch|craft|artisan/,name:'Made with care',prompt:'Bring out our handmade character',choices:{Colour:[2,1],Type:[0,3],Logo:[2,0],Pattern:[0,2]}},
 {match:/biodiversity|regenerat|sustainab|low waste|soil|nature|ecolog|organic/,name:'Close to nature',prompt:'Reflect our care for nature',choices:{Colour:[0,2],Type:[5,0],Logo:[0,2],Pattern:[0,3]}},
 {match:/honey|\bbees?\b|hives?/,name:'Golden harvest',prompt:'Bring out our honey tones',choices:{Colour:[1,2],Type:[5,4],Logo:[5,4],Pattern:[1,0]}},
 {match:/vegetable|greens|kangkong|bayam|herbs?|fresh|seasonal|harvest/,name:'Fresh from the farm',prompt:'Keep it fresh and botanical',choices:{Colour:[0,1],Type:[0,5],Logo:[0,2],Pattern:[0,2]}},
 {match:/community|neighbou?r|local families|welcom|together/,name:'A neighbourly welcome',prompt:'Make it warm and welcoming',choices:{Colour:[2,1],Type:[1,4],Logo:[1,4],Pattern:[1,3]}},
 {match:/coast|seaside|ocean|\bsea\b|island/,name:'Coastal calm',prompt:'Bring in our coastal colours',choices:{Colour:[3,0],Type:[5,2],Logo:[4,0],Pattern:[2,3]}},
 {match:/flowers?|lavender|blossom/,name:'Botanical colour',prompt:'Take inspiration from our flowers',choices:{Colour:[4,0],Type:[2,0],Logo:[5,2],Pattern:[0,1]}},
 {match:/orchard|fruits?|mango|citrus|berries|jam/,name:'Orchard warmth',prompt:'Bring out our orchard colours',choices:{Colour:[2,1],Type:[4,5],Logo:[4,2],Pattern:[1,0]}},
 {match:/minimal|simplicity|simple|uncluttered/,name:'Quiet simplicity',prompt:'Keep it simple and uncluttered',choices:{Colour:[5,0],Type:[5,0],Logo:[0,3],Pattern:[3,2]}},
];
const excerpt=(text:string,max=100)=>{const clean=text.trim().replace(/\s+/g,' ');return clean.length<=max?clean:clean.slice(0,max).trimEnd()+'…';};
function evidence(profile:FarmerProfile){return [
 {label:'Your story',text:profile.story,weight:2},
 {label:'Your philosophy',text:profile.philosophy,weight:3},
 {label:'Your growing practices',text:(profile.growingPractices||[]).join(', '),weight:2},
 {label:'What you grow',text:profile.products,weight:1},
].filter(item=>item.text.trim());}
function matches(theme:Theme,text:string){
 // A negated practice must not become the reason for a visual direction.
 return text.toLowerCase().split(/[.!?;\n]+/).some(sentence=>theme.match.test(sentence)&&!(/\b(?:not|never|without|non[- ])\b/.test(sentence)));
}
export function farmBrandRanking(profile:FarmerProfile,tab:BrandTab,request=''){
 const scores=Array.from({length:tab==='Pattern'?4:6},()=>0);
 for(const item of [...evidence(profile),{label:'Your request',text:request,weight:5}])for(const theme of themes)if(matches(theme,item.text))theme.choices[tab].forEach((option,index)=>{scores[option]+=item.weight*(index===0?4:1);});
 return scores.map((score,index)=>({score,index})).sort((a,b)=>b.score-a.score||a.index-b.index).map(item=>item.index);
}
export function farmBrandAnchor(profile:FarmerProfile,index:number){
 const source=index===0?profile.story:index===1?profile.philosophy:profile.products;
 const label=index===0?'Your story':index===1?'Your philosophy':'What you grow';
 const fallback=evidence(profile)[0];
 return `${source.trim()?label:fallback.label}: “${excerpt(source.trim()?source:fallback.text)}”.`;
}
export function farmBrandLookName(profile:FarmerProfile,index:number){
 const source=index===0?profile.story:index===1?profile.philosophy:profile.products;
 return themes.find(theme=>matches(theme,source))?.name||['Your farm story','Your farm values','Your harvest'][index];
}
export function farmBrandPrompts(profile:FarmerProfile,tab?:BrandTab){
 const ranked=themes.map(theme=>({theme,score:evidence(profile).reduce((sum,item)=>sum+(matches(theme,item.text)?item.weight:0),0)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score);
 const contextual=ranked.slice(0,2).map(item=>item.theme.prompt);
 const fallback=tab==='Type'?'Make our farm name easier to read':tab==='Logo'?'A simpler mark for our farm':tab==='Pattern'?'Let our products stand out':'Reflect our farm story';
 return [...new Set([...contextual,fallback,'Reflect our farm philosophy'])].slice(0,3);
}

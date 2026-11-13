import {isShowcaseProduct,showcasePackaging,showcaseTheme} from './showcaseProduct.ts';
import {presetBehindPhotos,presetProductPhoto,presetThemeSet} from './presetProduct.ts';
import type {LabelTemplate} from './labelTemplates.ts';
export type SamplePackaging={kind:'jar'|'carton';name:string;material:string;closure:string;image:string;fill:string;labelWidthMm:number;labelHeightMm:number};
export const samplePackaging:Record<string,SamplePackaging>={
 'demo-honey':{kind:'jar',name:'Honey jar',material:'Clear glass jar',closure:'Metal screw lid and paper tamper seal',image:'/sample-packaging/honey.png',fill:'#bd791d',labelWidthMm:90,labelHeightMm:55},
 'demo-tea':{kind:'carton',name:'Tea carton',material:'Paperboard carton with individually wrapped tea bags',closure:'Sealed tuck-top carton',image:'/sample-packaging/tea.png',fill:'#a9b991',labelWidthMm:70,labelHeightMm:100},
 'demo-kaya':{kind:'jar',name:'Kaya jar',material:'Wide-mouth glass jar',closure:'Metal screw lid and paper tamper seal',image:'/sample-packaging/kaya.png',fill:'#9fad72',labelWidthMm:85,labelHeightMm:45},
 'demo-jam':{kind:'jar',name:'Jam jar',material:'Clear glass preserve jar',closure:'Metal screw lid and paper tamper seal',image:'/sample-packaging/jam.png',fill:'#dfaa2e',labelWidthMm:85,labelHeightMm:50},
};
export const sampleProductDetails:Record<string,Record<string,string>>={
 'demo-honey':{description:'Golden wildflower honey with a smooth texture and gentle floral notes. Packed in a reusable glass jar with a screw lid and tamper seal.',ingredients:'100% wildflower honey',allergens:'No allergens declared',storage:'Keep the lid closed and store in a cool, dry place away from direct sunlight.',expiry:'See best-before date on the base of the jar.',producer:'Green Valley Farm',origin:'Lim Chu Kang, Singapore'},
 'demo-tea':{description:'A light, citrusy lemongrass infusion in 20 individually wrapped tea bags. Presented in a compact paperboard carton.',ingredients:'Dried lemongrass',allergens:'No allergens declared',storage:'Store sealed in a cool, dry place away from moisture and strong odours.',expiry:'See best-before date on the carton.',producer:'Green Valley Farm',origin:'Lim Chu Kang, Singapore'},
 'demo-kaya':{description:'A creamy pandan coconut spread for toast and breakfast treats. Packed in a wide-mouth glass jar with a screw lid and tamper seal.',ingredients:'Coconut milk, eggs, sugar, pandan leaves',allergens:'Contains eggs',storage:'Refrigerate after opening and use a clean, dry spoon.',expiry:'See use-by date on the jar lid.',producer:'Green Valley Farm',origin:'Lim Chu Kang, Singapore'},
 'demo-jam':{description:'A golden mango preserve with a soft, spreadable texture. Packed in a reusable glass jam jar with a screw lid and tamper seal.',ingredients:'Mango, sugar, lemon juice, fruit pectin',allergens:'No allergens declared',storage:'Refrigerate after opening and use a clean, dry spoon.',expiry:'See best-before date on the jar lid.',producer:'Green Valley Farm',origin:'Lim Chu Kang, Singapore'},
};
export function samplePackagingFor(product:{id?:string;samplePackaging?:SamplePackaging;showcase?:string;labelTemplate?:string}){if(isShowcaseProduct(product))return !product.labelTemplate||product.labelTemplate==='botanical'?showcasePackaging:{...showcasePackaging,image:showcaseTheme(product.labelTemplate).photo};return product.id&&samplePackaging[product.id]?product.samplePackaging||samplePackaging[product.id]:undefined;}
// Upgrade only the known demo products; keep edited fields, product status and custom photos.
export function upgradeSampleProduct<T extends {id?:string;[key:string]:unknown}>(product:T):T{
 const id=product.id||'',details=sampleProductDetails[id],pack=samplePackaging[id];if(!details)return product;const next={...product,samplePackaging:pack};
 for(const [key,value] of Object.entries(details)){const old=product[key];if(!old||old==='See product label'||key==='allergens'&&old==='None declared'||id==='demo-honey'&&key==='ingredients'&&old==='100% raw honey'||id==='demo-honey'&&key==='description'&&old==='Raw honey from our hives, harvested by hand each season.'){Object.assign(next,{[key]:value});if(key==='allergens'&&product.allergenDetails)Object.assign(next,{allergenDetails:{status:'label',original:value,contains:[],mayContain:[]}});}}
 // Quantities are written with a space, as on the customer side (250 g).
 if(typeof product.quantity==='string'&&/^\d+(g|kg|ml|l)$/i.test(product.quantity))Object.assign(next,{quantity:product.quantity.replace(/^(\d+)/,'$1 ')});
 if(!product.labelTemplate)Object.assign(next,{labelTemplate:id==='demo-tea'?'minimal':id==='demo-kaya'?'market':'botanical'});
 const theme=(next as {labelTemplate?:LabelTemplate}).labelTemplate||'botanical';const set=presetThemeSet(id);
 if(set&&!product.listingPhotos)Object.assign(next,{listingPhotos:[{url:set[theme].studio,name:'Cover'},...(id==='demo-jam'?[{url:presetProductPhoto,name:'Close-up'}]:[]),{url:set[theme].photo,name:'Packed'}]});
 if(set&&!product.processPhotos)Object.assign(next,{processPhotos:id==='demo-jam'?presetBehindPhotos.map(photo=>({...photo})):[{url:'/preset/farm-process.jpg',name:'Harvest'},{url:'/preset/farm-farm.jpg',name:'On the farm'}]});
 if(!product.photo||/^\/images\/farmer-pages\/product-image[123]?\.png$/.test(String(product.photo)))Object.assign(next,{photo:pack.image});
 return next;
}

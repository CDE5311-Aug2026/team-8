import {isShowcaseProduct,showcaseListingPhotos} from './showcaseProduct.ts';
// Demo preset for "Add product": whatever photo the farmer takes or uploads, the app shows
// Mango Jam and "AI" fills in its details for the farmer to check. Images: public/preset/
// (made with Figma AI, kept in Figma Drafts → "Preset images – Mango Jam").
import type {LabelTemplate} from './labelTemplates.ts';
import type {FarmPhoto} from './branding.ts';

export const presetProductPhoto='/preset/jam-photo.jpg';

export const presetProductInfo={
 name:'Mango Jam',category:'Fruit',quantity:'220 g',
 ingredients:'Ripe mango, cane sugar, lime juice',allergens:'',
 description:'Small-batch jam made from ripe mangoes picked on our farm.',
 brand:'Green Valley Farm',nutrition:'',storage:'Keep in a cool, dry place. Refrigerate after opening.',
 expiry:'12 months unopened',producer:'Green Valley Farm',origin:'Lim Chu Kang, Singapore',
};
export const presetProductPrice='8.00';

// One studio shot (3D view) and one on-photo shot per theme.
export const presetPackaging:Record<LabelTemplate,{studio:string;photo:string}>={
 botanical:{studio:'/preset/jam-botanical-studio.jpg',photo:'/preset/jam-botanical-photo.jpg'},
 minimal:{studio:'/preset/jam-minimal-studio.jpg',photo:'/preset/jam-minimal-photo.jpg'},
 market:{studio:'/preset/jam-market-studio.jpg',photo:'/preset/jam-market-photo.jpg'},
};
export function presetPackagingImage(template:LabelTemplate|undefined,view:'studio'|'photo'){return presetPackaging[template||'botanical'][view];}

// Farm, products and work photos for the preset Green Valley Farm profile (Figma Drafts → "Preset images – Green Valley Farm").
export const presetFarmPhotos:FarmPhoto[]=[
 {id:'preset-farm',kind:'farm',url:'/preset/farm-farm.jpg',name:'Green Valley Farm'},
 {id:'preset-products',kind:'products',url:'/preset/farm-products.jpg',name:'Our products'},
 {id:'preset-process',kind:'process',url:'/preset/farm-process.jpg',name:'Harvesting lemongrass'},
];

// Onboarding demo: whatever photo the farmer uploads, the matching preset photo is used instead.
export function presetFarmPhoto(kind:FarmPhoto['kind']):FarmPhoto{const photo=presetFarmPhotos.find(item=>item.kind===kind)||presetFarmPhotos[0];return {...photo,id:`${photo.id}-${Date.now()}`};}
export const presetPortrait={id:'preset-portrait',name:'Farmer photo',url:'/sample-profile/farmer.png'};

// Theme images for the preset farm's other products (Figma Drafts → "Preset images – theme sets").
const themeSet=(name:string):Record<LabelTemplate,{studio:string;photo:string}>=>({
 botanical:{studio:`/preset/${name}-botanical-studio.jpg`,photo:`/preset/${name}-botanical-photo.jpg`},
 minimal:{studio:`/preset/${name}-minimal-studio.jpg`,photo:`/preset/${name}-minimal-photo.jpg`},
 market:{studio:`/preset/${name}-market-studio.jpg`,photo:`/preset/${name}-market-photo.jpg`},
});
const presetSets:Record<string,Record<LabelTemplate,{studio:string;photo:string}>>={'demo-honey':themeSet('honey'),'demo-tea':themeSet('tea'),'demo-kaya':themeSet('kaya'),'demo-jam':presetPackaging};
export function presetThemeSet(id:string){return presetSets[id]||null;}
// The image set for a preset product, or null when the product has no preset images.
export function presetImagesFor(product:{id?:string;photo?:string}|undefined|null){
 if(!product)return null;
 if(product.photo===presetProductPhoto||product.photo?.startsWith('/preset/jam-'))return presetPackaging;
 return product.id?presetSets[product.id]||null:null;
}

// Wildflower Honey (the first product testers open) has finished photos for every Botanical choice
// in the design editor, so a matching combo shows a real photo instead of the drawn packaging.
// Key: label colour, picture, layout. Cream, leaves and centred are the Botanical defaults.
const honeyDesigns:Record<string,string>={
 '#ffffff|leaves|centred':'white','#415b51|leaves|centred':'green','#c9a35b|leaves|centred':'gold',
 'cream|sprig|centred':'sprig','cream|none|centred':'none','cream|leaves|band':'band','#415b51|sprig|band':'bold',
};
export const honeyDesignUrls=Object.values(honeyDesigns).flatMap(name=>[`/preset/honey-botanical-${name}-studio.jpg`,`/preset/honey-botanical-${name}-photo.jpg`]);
type Tweaks={paper?:string;art?:string;layout?:string};
export function presetDesignPhotos(product:{id?:string;labelTemplate?:string;designTweaks?:Tweaks}|undefined|null):{studio:string;photo:string}|null{
 const t=product?.designTweaks;if(product?.id!=='demo-honey'||(product.labelTemplate||'botanical')!=='botanical'||!t||!(t.paper||t.art||t.layout))return null;
 // Label colours match by closeness, so a slightly different brand green or gold still finds its photo.
 const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));const near=(a:string,b:string)=>{const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])<24;};
 const paper=(t.paper||'#f6ecd9').toLowerCase();
 const swatch=near(paper,'#f6ecd9')?'cream':['#ffffff','#415b51','#c9a35b'].find(color=>near(paper,color));
 const name=swatch&&honeyDesigns[`${swatch}|${t.art||'leaves'}|${t.layout||'centred'}`];
 return name?{studio:`/preset/honey-botanical-${name}-studio.jpg`,photo:`/preset/honey-botanical-${name}-photo.jpg`}:null;
}

// Mango Jam listing photos for the publish step: cover and packed follow the chosen theme.
export function presetListingPhotos(template:LabelTemplate|undefined){const set=presetPackaging[template||'botanical'];return [{url:set.studio,name:'Cover'},{url:presetProductPhoto,name:'Close-up'},{url:set.photo,name:'Packed'}];}
// Listing photos as shoppers see them. Cover and Packed always follow the product's current theme,
// so changing the theme changes them too. The farmer's own photos (not packaging renders) stay in between.
export function themedListingPhotos<P extends {url:string;name?:string}>(product:{showcase?:string;id?:string;photo?:string;labelTemplate?:string;listingPhotos?:P[];designTweaks?:{paper?:string;art?:string;layout?:string}}):{url:string;name?:string}[]{
 if(isShowcaseProduct(product))return [...showcaseListingPhotos(),...(product.listingPhotos?.length?product.listingPhotos:showcaseListingPhotos(product.photo)).filter(p=>p.url!==showcaseListingPhotos()[0].url)];
 const own=product.listingPhotos||[];const set=presetImagesFor(product);if(!set)return own;
 const ownDesign=!!product.designTweaks&&!!(product.designTweaks.paper||product.designTweaks.art||product.designTweaks.layout);
 const matched=presetDesignPhotos(product);
 const theme=matched||set[(['botanical','minimal','market'] as string[]).includes(product.labelTemplate||'')?product.labelTemplate as LabelTemplate:'botanical'];
 const packagingUrls=new Set([...Object.values(set).flatMap(item=>[item.studio,item.photo]),...honeyDesignUrls]);
 const rest=own.filter(photo=>!packagingUrls.has(photo.url)&&!photo.url.startsWith('/sample-packaging/'));
 // A product with its own design has no finished photos; its cover is drawn from the brand (ProductCover).
 if(ownDesign&&!matched)return rest;
 return [{name:'Cover',url:theme.studio},...rest,{name:'Packed',url:theme.photo}];
}
// The cover shoppers and the farmer see on cards: the theme's cover for preset products, else the product photo.
export function coverPhoto(product:{showcase?:string;id?:string;photo?:string;labelTemplate?:string;listingPhotos?:{url:string}[];designTweaks?:{paper?:string;art?:string;layout?:string}}){return themedListingPhotos(product)[0]?.url||product.photo||'';}
// Every certificate upload saves this small sample file instead of the farmer's own file.
export const presetCertificateFile={name:'organic-certificate.png',type:'image/png',size:68,dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='};
export const presetCertificateDetails={issuedBy:'SFA Organic',number:'SG-ORG-2041',validUntil:'2027-06-30'};
export const presetBehindPhotos=[{url:'/preset/jam-harvest.jpg',name:'Harvest'},{url:'/preset/jam-packing.jpg',name:'Packing'}];
// The old tomato sample photos, swapped for Mango Jam ones in saved data (see migrateLegacySamplePhotos).
export const legacySamplePhotos:Record<string,string>={
 '/publish-v2/7839daa2-7c11-42df-98bb-af726f35612d.png':'/preset/jam-botanical-studio.jpg',
 '/publish-v2/3653116f-3551-465f-975e-c817852d7270.png':presetProductPhoto,
 '/publish-v2/c71e924e-3c53-4aff-8481-5b28d7e5f098.png':'/preset/jam-botanical-photo.jpg',
 '/publish-v2/4658824a-eb38-4460-8938-a2eba5fb2eed.png':'/preset/jam-harvest.jpg',
 '/publish-v2/1df5c969-0fa2-4777-8715-89a8ff44ec09.png':'/preset/jam-packing.jpg',
};
// Photos the farmer uploaded before everything was preset, saved as large data URLs, filled the
// browser's storage so nothing could be saved. Swap each one for the matching preset photo.
function swapUploads(value:unknown,key=''):unknown{
 if(typeof value==='string')return value.startsWith('data:image/')&&value.length>1000?(key==='photo'?presetProductPhoto:presetBehindPhotos[0].url):value;
 if(Array.isArray(value))return value.map(item=>swapUploads(item,key));
 if(!value||typeof value!=='object')return value;
 const o=value as Record<string,unknown>;
 // Showcase photos are resized on input and must survive reloads.
 if(o.showcase==='pomegranate'||(o.product as {showcase?:string}|undefined)?.showcase==='pomegranate')return value;
 // Mango Jam only has photos for the three themes, so label colour, picture and layout changes are dropped.
 if(typeof o.photo==='string'&&o.photo.startsWith('/preset/jam-')&&o.designTweaks!==undefined){const {designTweaks:_dropped,...rest}=o;void _dropped;return swapUploads(rest,key);}
 if(typeof o.dataUrl==='string'&&o.dataUrl.length>1000)return {...presetCertificateFile};
 if(typeof o.url==='string'&&o.url.startsWith('data:image/')){
  if(key==='portrait')return {...o,url:presetPortrait.url};
  if(o.kind==='farm'||o.kind==='products'||o.kind==='process')return {...o,url:presetFarmPhoto(o.kind).url};
 }
 return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,swapUploads(v,k)]));
}
export function migrateLegacySamplePhotos(storage:Pick<Storage,'length'|'key'|'getItem'|'setItem'>){
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith('farmily'))continue;const value=storage.getItem(key);if(!value||!value.includes('data:image/')&&!(value.includes('/preset/jam-')&&value.includes('designTweaks')))continue;try{const next=JSON.stringify(swapUploads(JSON.parse(value)));if(next!==value)storage.setItem(key,next);}catch{}}
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith('farmily'))continue;const value=storage.getItem(key);if(!value||!value.includes('/publish-v2/'))continue;let next=value;for(const [from,to] of Object.entries(legacySamplePhotos))next=next.split(from).join(to);if(next!==value)storage.setItem(key,next);}
}

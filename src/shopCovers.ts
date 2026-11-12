import {isShowcaseProduct} from '../shared/showcaseProduct';
// Shop covers: the picture shoppers see for each published product on the customer side.
// A preset theme uses its finished photo. A product with its own design (changed in Your brand)
// is drawn here from the brand, so the customer side shows the same design as the farmer side.
import {renderLabelSvg} from '../shared/renderLabelSvg';
import {coverPhoto,presetDesignPhotos} from '../shared/presetProduct';
import {samplePackagingFor} from '../shared/samplePackaging';
import {hasDesignTweaks,labelTheme,validDesignTweaks} from '../shared/labelTemplates';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';

export const shopCoversKey='farmily-shop-covers';
type Cover={sig:string;url:string};

const ownDesign=(product:ProductDraft)=>validDesignTweaks(product.designTweaks)&&hasDesignTweaks(product.designTweaks);
const shade=(hex:string,amount:number)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*amount))).toString(16).padStart(2,'0')).join('');

async function labelImage(product:ProductDraft,profile:FarmerProfile,brand:BrandKit){
 const svg=renderLabelSvg(product,profile,brand,undefined,true);
 const box=svg.match(/viewBox="0 0 (\d+) (\d+)"/);const width=box?Number(box[1]):960,height=box?Number(box[2]):420;
 const sized=svg.replace(/<svg([^>]*?) width="[^"]+" height="[^"]+"/,`<svg$1 width="${width}" height="${height}"`);
 const url=URL.createObjectURL(new Blob([sized],{type:'image/svg+xml'}));
 try{const image=new Image();image.src=url;await image.decode();return {image,ratio:height/width};}finally{URL.revokeObjectURL(url);}
}

function roundRect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

// A simple packshot: the product's own shape (jar or carton) with the label on the front.
export async function renderCover(product:ProductDraft,profile:FarmerProfile,brand:BrandKit){
 const canvas=document.createElement('canvas');canvas.width=800;canvas.height=800;const c=canvas.getContext('2d');if(!c)throw Error('Image drawing is unavailable in this browser.');
 const {image,ratio}=await labelImage(product,profile,brand);const theme=labelTheme(brand,product.labelTemplate||'botanical',ownDesign(product)?product.designTweaks:undefined);
 const spec=samplePackagingFor(product);const main=brand.concept.colors[0];
 c.fillStyle='#efeee9';c.fillRect(0,0,800,800);
 c.fillStyle='rgba(0,0,0,.12)';c.beginPath();c.ellipse(400,712,230,26,0,0,Math.PI*2);c.fill();
 if(spec?.kind==='jar'){
  roundRect(c,228,236,344,470,46);c.fillStyle=spec.fill;c.fill();
  c.fillStyle='rgba(255,255,255,.18)';roundRect(c,252,262,36,410,18);c.fill();
  roundRect(c,240,168,320,84,14);c.fillStyle=shade(main,.8);c.fill();
  const w=332,h=Math.min(300,w*ratio);c.drawImage(image,234,470-h/2,w,h);
 }else{
  c.fillStyle=shade(main,.85);c.beginPath();c.moveTo(550,170);c.lineTo(610,132);c.lineTo(610,652);c.lineTo(550,690);c.closePath();c.fill();
  c.fillStyle=shade(theme.paper,.9);c.beginPath();c.moveTo(210,170);c.lineTo(270,132);c.lineTo(610,132);c.lineTo(550,170);c.closePath();c.fill();
  c.fillStyle=theme.paper;c.fillRect(210,170,340,520);
  const w=340,h=Math.min(500,w*ratio);c.drawImage(image,210,170+520*.4-h/2,w,h);
 }
 return canvas.toDataURL('image/jpeg',.88);
}

function readCovers():Record<string,Cover>{try{const value=JSON.parse(localStorage.getItem(shopCoversKey)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}}

// Keyed by the preset product (honey, tea, kaya, jam), which is how the customer side names them.
export async function syncShopCovers(products:ProductDraft[],profile:FarmerProfile,brand:BrandKit|null){
 const before=readCovers();const next:Record<string,Cover>={};
 for(const product of products){
  const key=String(product.id||'').replace(/^demo-/,'');if(!key||!product.live)continue;
  const kit=product.brandIdentity||brand;
  if(kit&&!isShowcaseProduct(product)&&ownDesign(product)&&!presetDesignPhotos(product)){
   const sig=JSON.stringify([product.name,product.quantity,product.labelTemplate,product.designTweaks,kit.concept.colors,profile.farmName]);
   if(before[key]?.sig===sig){next[key]=before[key];continue;}
   try{next[key]={sig,url:await renderCover(product,profile,kit)};}catch{/* keep the preset photo */}
  }else{const url=coverPhoto(product);if(url)next[key]={sig:url,url};}
 }
 try{localStorage.setItem(shopCoversKey,JSON.stringify(next));}catch{/* storage full: the customer side keeps its preset photos */}
}

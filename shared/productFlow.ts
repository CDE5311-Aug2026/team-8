import {allergenStatement,validAllergenSelection,type AllergenSelection} from './productFields.ts';
import {canAddProduct,signature,validConcept,type BrandKit,type FarmerProfile} from './branding.ts';
import {fieldNames,validateAnalysis,type Analysis,type FieldName} from './analysis.ts';
type ProductInfo=Record<FieldName,string>;
export type ProductDraft=ProductInfo&{photo:string;price:string;story:string;live:boolean;sample?:boolean;ingredientInput?:string;allergenDetails?:AllergenSelection;brandIdentity?:BrandKit;packagingMode?:'photo'|'3d'};
export const productWorkKey='farmily-product-work';
export function restoreProductWork(value:unknown,profile:FarmerProfile){
 if(!value||typeof value!=='object')return null;
 const saved=value as {product:ProductDraft;profileSignature:string;screen:string;reviewed:boolean;analysis:Analysis|null};
 const product={...saved.product};
 if(product.allergenDetails&&!validAllergenSelection(product.allergenDetails))delete product.allergenDetails;
 if(typeof product.ingredientInput!=='string')product.ingredientInput='';
 if(saved.profileSignature!==signature(profile)||!product||[...fieldNames,'photo','price','story'].some(key=>typeof product[key as keyof ProductDraft]!=='string')||typeof product.live!=='boolean')return null;
 try{
  if(product.brandIdentity)validConcept(product.brandIdentity.concept);
  const analysis=saved.analysis?validateAnalysis(saved.analysis):null;
  const reviewed=saved.reviewed===true;
  const screen=saved.screen==='packaging'&&validProduct(product)&&reviewed?'packaging':saved.screen==='add'?'add':'details';
  return {product,screen,reviewed,analysis} as {product:ProductDraft;screen:'add'|'details'|'packaging';reviewed:boolean;analysis:Analysis|null};
 }catch{return null;}
}
export function validProduct(product:ProductDraft){return (!product.allergenDetails||validAllergenSelection(product.allergenDetails)&&product.allergenDetails.status!=='unknown'&&allergenStatement(product.allergenDetails)===product.allergens)&&['name','category','allergens','quantity'].every(key=>!!product[key as keyof ProductDraft]?.toString().trim())&&/^\d+(\.\d{1,2})?$/.test(product.price)&&Number.isFinite(Number(product.price))&&Number(product.price)>0;}
export function productCanSave(product:ProductDraft,profile:FarmerProfile,brand:BrandKit|null,reviewed:boolean){return reviewed&&validProduct(product)&&canAddProduct(profile,brand);}
const escapeXml=(value:string)=>value.replace(/[<>&"']/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]!));
export function labelSvg(product:ProductDraft,profile:FarmerProfile,brand:BrandKit){
 const colors=brand.concept.colors;if(colors.some(color=>!/^#[0-9a-f]{6}$/i.test(color)))throw new Error('Invalid brand colors.');
 const lines=[`Farm: ${profile.farmName}`,`Product: ${product.name}`,`Quantity: ${product.quantity}`,...(product.ingredients.trim()?[`Ingredients: ${product.ingredients}`]:[]),`Allergens: ${product.allergens}`,...(['storage','expiry','producer','origin','nutrition'] as const).filter(key=>product[key]).map(key=>`${key}: ${product[key]}`)].flatMap(text=>text.match(/.{1,58}(?:\s|$)|.{1,58}/g)||[]);
 const height=160+lines.length*32;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}"><rect width="960" height="${height}" fill="${colors[1]}"/><rect x="20" y="20" width="920" height="${height-40}" fill="none" stroke="${colors[0]}"/><text x="52" y="74" fill="${colors[0]}" font-family="Georgia,serif" font-size="28">${escapeXml(brand.concept.name)}</text><path d="M52 96H908" stroke="${colors[2]}" stroke-width="3"/>${lines.map((text,index)=>`<text x="52" y="${140+index*32}" fill="${colors[0]}" font-family="sans-serif" font-size="23">${escapeXml(text)}</text>`).join('')}</svg>`;
}

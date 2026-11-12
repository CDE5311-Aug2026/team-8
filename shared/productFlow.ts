import {renderLabelSvg} from './renderLabelSvg.ts';
import {botanicalMotif,labelTheme,validDesignTweaks,validLabelTemplate,type DesignTweaks,type LabelTemplate} from './labelTemplates.ts';
import {samplePackagingFor} from './samplePackaging.ts';
import type {SamplePackaging} from './samplePackaging.ts';
import type {ListingContent} from './publishing.ts';
import {allergenStatement,validAllergenSelection,type AllergenSelection} from './productFields.ts';
import {canAddProduct,signature,validConcept,type BrandKit,type FarmerProfile} from './branding.ts';
import {fieldNames,validateAnalysis,type Analysis,type FieldName} from './analysis.ts';
type ProductInfo=Record<FieldName,string>;
export type ProductDraft=ProductInfo&{labelTemplate?:LabelTemplate;designTweaks?:DesignTweaks;samplePackaging?:SamplePackaging;id?:string;createdAt?:string;packagingComplete?:boolean;photos?:string[];listing?:ListingContent;photo:string;price:string;currency?:'SGD';story:string;live:boolean;sample?:boolean;showcase?:'pomegranate';ingredientInput?:string;ingredientsNotApplicable?:boolean;allergenDetails?:AllergenSelection;brandIdentity?:BrandKit;v2PackagingTheme?:number;packagingMode?:'photo'|'3d'};
export const productWorkKey='farmily-product-work';
export function restoreProductWork(value:unknown,profile:FarmerProfile){
 if(!value||typeof value!=='object')return null;
 const saved=value as {product:ProductDraft;profileSignature:string;screen:string;reviewed:boolean;analysis:Analysis|null};
 const product={...saved.product};if(product.labelTemplate!==undefined&&!validLabelTemplate(product.labelTemplate))delete product.labelTemplate;if(product.designTweaks!==undefined&&!validDesignTweaks(product.designTweaks))delete product.designTweaks;
 if(product.v2PackagingTheme!==undefined&&(!Number.isInteger(product.v2PackagingTheme)||product.v2PackagingTheme<0||product.v2PackagingTheme>2))delete product.v2PackagingTheme;
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
export function validProduct(product:ProductDraft){return (product.ingredientsNotApplicable===true?!product.ingredients.trim()&&!product.ingredientInput?.trim():true)&&(!product.allergenDetails||validAllergenSelection(product.allergenDetails)&&product.allergenDetails.status!=='unknown'&&allergenStatement(product.allergenDetails)===product.allergens)&&['name','category','allergens','quantity'].every(key=>!!product[key as keyof ProductDraft]?.toString().trim())&&/^\d+(\.\d{1,2})?$/.test(product.price)&&Number.isFinite(Number(product.price))&&Number(product.price)>0;}
export function productCanSave(product:ProductDraft,profile:FarmerProfile,brand:BrandKit|null,reviewed:boolean){return reviewed&&validProduct(product)&&canAddProduct(profile,brand);}
export function labelSvg(product:ProductDraft,profile:FarmerProfile,brand:BrandKit,artwork?:string){return renderLabelSvg(product,profile,brand,artwork);}

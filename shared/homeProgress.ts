import type {CatalogueItem} from './dailyV2.ts';

export const setupCompleteKey='farmily-setup-complete';
type Product={live?:boolean;packagingComplete?:boolean}|null;
export function setupWasCompleted(saved:boolean,current:Product,catalogue:CatalogueItem[],legacy:Product[]=[]){
 return saved||!!current?.live&&current.packagingComplete!==false||catalogue.some(item=>!item.draft&&item.product.live)||legacy.some(product=>!!product?.live&&product.packagingComplete!==false);
}

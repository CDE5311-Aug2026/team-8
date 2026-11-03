import {demoProducts,demoWorkspace} from './demoDashboard.ts';
import {restoreCatalogue} from './catalogue.ts';
import {restoreCatalogue as restoreDailyCatalogue,type CatalogueItem} from './dailyV2.ts';
import type {Workspace} from './workspace.ts';

export const onboardingSampleReturnKey='farmily-onboarding-sample-return';
export function onboardingSampleWorkspace(current:Workspace):Workspace{
 const read=(key:string)=>{try{return JSON.parse(current[key]||'null');}catch{return null;}};
 const saved=restoreCatalogue(read('farmily-products'));
 const daily=restoreDailyCatalogue(read('farmily-catalogue-v2'));
 const userProducts=daily.filter(item=>!item.sample).map(item=>({...item.product,id:item.id,createdAt:'2026-01-01T00:00:00.000Z'}));
 const products=new Map([...demoProducts,...saved,...userProducts].map(product=>[product.id,product]));
 const catalogue=new Map<string,CatalogueItem>([...products.values()].map(product=>[product.id,{id:product.id,product,draft:product.packagingComplete===false}]));
 for(const item of daily)catalogue.set(item.id,item);
 return {...demoWorkspace(),...current,'farmily-products':JSON.stringify([...products.values()]),'farmily-catalogue-v2':JSON.stringify([...catalogue.values()]),'farmily-setup-complete':'true',[onboardingSampleReturnKey]:'true'};
}

import {catalogueKey,restoreCatalogue,upsertProduct,type CatalogueProduct} from '../shared/catalogue';
import {workspaceStorage} from './accountStorage';
import {catalogueKey as dailyKey,migrateCatalogue} from '../shared/dailyV2';
function read(key:string){try{return JSON.parse(workspaceStorage.getItem(key)||'null');}catch{return null;}}
export function readCatalogue(){return restoreCatalogue(read(catalogueKey),read('farmily-draft'));}
export function saveCatalogueProduct(product:CatalogueProduct){
 // The catalogue is authoritative; farmily-draft is retained only for older clients.
 workspaceStorage.setItem(catalogueKey,JSON.stringify(upsertProduct(readCatalogue(),product)));
 try{workspaceStorage.setItem('farmily-draft',JSON.stringify(product));}catch{/* catalogue already saved */}
}
// Every reader of the product list goes through here, so the older list is brought over once.
export function readDailyCatalogue(){
 const {items,migrated}=migrateCatalogue(read(dailyKey),readCatalogue() as never);
 if(migrated&&items.length)try{workspaceStorage.setItem(dailyKey,JSON.stringify(items));}catch{/* read-only: still return the list */}
 return items;
}

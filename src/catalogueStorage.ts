import {catalogueKey,restoreCatalogue,upsertProduct,type CatalogueProduct} from '../shared/catalogue';
import {workspaceStorage} from './accountStorage';
function read(key:string){try{return JSON.parse(workspaceStorage.getItem(key)||'null');}catch{return null;}}
export function readCatalogue(){return restoreCatalogue(read(catalogueKey),read('farmily-draft'));}
export function saveCatalogueProduct(product:CatalogueProduct){
 // The catalogue is authoritative; farmily-draft is retained only for older clients.
 workspaceStorage.setItem(catalogueKey,JSON.stringify(upsertProduct(readCatalogue(),product)));
 try{workspaceStorage.setItem('farmily-draft',JSON.stringify(product));}catch{/* catalogue already saved */}
}

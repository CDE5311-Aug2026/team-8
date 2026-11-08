import {labelSvg,type ProductDraft} from '../shared/productFlow';
import type {BrandKit,FarmerProfile} from '../shared/branding';
export const botanicalArtwork='/label-templates/botanical-paper.png';
let paper:Promise<string>|null=null;
function embeddedPaper(){if(!paper)paper=fetch(botanicalArtwork).then(response=>{if(!response.ok)throw Error('The label artwork could not be loaded. Please try again.');return response.blob();}).then(blob=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('The label artwork could not be read.'));reader.readAsDataURL(blob);})).catch(error=>{paper=null;throw error;});return paper;}
export async function printableLabelSvg(product:ProductDraft,profile:FarmerProfile,brand:BrandKit){return labelSvg(product,profile,brand,(product.labelTemplate||'botanical')==='botanical'?await embeddedPaper():undefined);}

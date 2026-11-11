// Difference hash of a photo, drawn small in a canvas (see shared/photoMatch.ts).
import {nearestProduct,productReferencePhotos} from '../shared/photoMatch';
export async function photoHash(src:string){
 const image=new Image();image.crossOrigin='anonymous';image.src=src;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=9;canvas.height=8;const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)throw Error('Canvas unavailable');
 c.drawImage(image,0,0,9,8);const data=c.getImageData(0,0,9,8).data;const grey=(x:number,y:number)=>{const i=(y*9+x)*4;return data[i]*.299+data[i+1]*.587+data[i+2]*.114;};
 let hex='';for(let y=0;y<8;y++){let byte=0;for(let x=0;x<8;x++)byte=byte<<1|(grey(x,y)>grey(x+1,y)?1:0);hex+=byte.toString(16).padStart(2,'0');}return hex;
}
let references:Promise<Record<string,string[]>>|null=null;
function referenceHashes(){return references??=Promise.all(Object.entries(productReferencePhotos).map(async([id,urls])=>[id,(await Promise.all(urls.map(url=>photoHash(url).catch(()=>null)))).filter((h):h is string=>!!h)] as const)).then(Object.fromEntries);}
// The preset product id this photo shows, or null when it is not one of the farm's products.
export async function matchProductPhoto(photo:string){try{return nearestProduct(await photoHash(photo),await referenceHashes());}catch{return null;}}

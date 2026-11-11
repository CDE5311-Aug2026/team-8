// Matches an uploaded product photo to a product the farm already has, by comparing small
// difference hashes (64 bits, as 16 hex characters). No match means the details are left empty
// (or read by the real photo scan), so the app never invents a product for an unknown photo.
const designs=['band','bold','gold','green','none','sprig','white'];
const themed=(key:string)=>['botanical','minimal','market'].flatMap(theme=>[`/preset/${key}-${theme}-studio.jpg`,`/preset/${key}-${theme}-photo.jpg`]);
export const productReferencePhotos:Record<string,string[]>={
 'demo-honey':[...themed('honey'),...designs.flatMap(d=>[`/preset/honey-botanical-${d}-studio.jpg`,`/preset/honey-botanical-${d}-photo.jpg`]),'/sample-packaging/honey.png'],
 'demo-tea':[...themed('tea'),'/sample-packaging/tea.png'],
 'demo-kaya':[...themed('kaya'),'/sample-packaging/kaya.png'],
 'demo-jam':['/preset/jam-photo.jpg',...themed('jam'),'/sample-packaging/jam.png'],
};
export const matchThreshold=10;
export function hammingHex(a:string,b:string){if(a.length!==b.length)return Infinity;let d=0;for(let i=0;i<a.length;i++){let x=parseInt(a[i],16)^parseInt(b[i],16);while(x){d+=x&1;x>>=1;}}return d;}
export function nearestProduct(hash:string,references:Record<string,string[]>,threshold=matchThreshold):string|null{
 let best:string|null=null,bestDistance=Infinity;
 for(const [id,hashes] of Object.entries(references))for(const h of hashes){const d=hammingHex(hash,h);if(d<bestDistance){bestDistance=d;best=id;}}
 return bestDistance<=threshold?best:null;
}

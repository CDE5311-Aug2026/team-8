import type {CatalogueProduct} from '../shared/catalogue';
import type {FarmerProfile} from '../shared/branding';
import {labelSvg} from '../shared/productFlow';
import {jpegPdf,storedZip} from '../shared/demoExports';
const decode=(url:string)=>Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));
export function packagingRender(product:CatalogueProduct,profile:FarmerProfile,angle=0){
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;const c=canvas.getContext('2d');if(!c)throw new Error('Image export is unavailable in this browser.');
 const colors=product.brandIdentity?.concept.colors||['#415b51','#fffdf0','#a8ba6d'];c.fillStyle='#fffdf0';c.fillRect(0,0,960,720);
 const x=angle===0?300:angle===1?340:260,side=angle===2?-100:100;c.fillStyle=colors[0];c.fillRect(x,140,300,400);c.fillStyle=colors[2];c.beginPath();c.moveTo(x+300,140);c.lineTo(x+300+side,100);c.lineTo(x+300+side,500);c.lineTo(x+300,540);c.fill();c.fillStyle='#d7dbc9';c.beginPath();c.moveTo(x,140);c.lineTo(x+side,100);c.lineTo(x+300+side,100);c.lineTo(x+300,140);c.fill();
 c.fillStyle=colors[1];c.fillRect(x+20,180,260,300);c.fillStyle=colors[0];c.font='24px Georgia';c.textAlign='center';c.fillText(profile.farmName.slice(0,28),x+150,225,240);c.font='bold 32px Georgia';const words=product.name.match(/.{1,18}(?:\s|$)|.{1,18}/g)||[product.name];words.slice(0,3).forEach((text,i)=>c.fillText(text.trim(),x+150,290+i*40,235));c.font='24px sans-serif';c.fillText(product.quantity,x+150,440);c.fillStyle='#788076';c.font='18px sans-serif';c.fillText('DEMO RENDER · NOT A PRINT-READY FILE',480,640);c.font='16px sans-serif';c.fillText(`Packaging concept · view ${angle+1}`,480,675);return canvas;
}
export async function downloadPackaging(format:'pdf'|'svg'|'png'|'all',product:CatalogueProduct,profile:FarmerProfile){
 const canvas=packagingRender(product,profile),base=(product.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'product')+'-demo';
 const files:{name:string;bytes:Uint8Array;type:string}[]=[];
 if(format==='pdf'||format==='all')files.push({name:base+'-print.pdf',bytes:jpegPdf(decode(canvas.toDataURL('image/jpeg',.9)),960,720),type:'application/pdf'});
 if(format==='png'||format==='all')files.push({name:base+'-mockup.png',bytes:decode(canvas.toDataURL('image/png')),type:'image/png'});
 if(format==='svg'||format==='all'){
  if(!product.brandIdentity)throw new Error('Complete packaging first.');
  const label=labelSvg(product,profile,product.brandIdentity).replace('<svg ','<svg x="330" y="205" ');const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><rect width="960" height="720" fill="#fffdf0"/><g fill="none" stroke="#415b51" stroke-width="2"><rect x="180" y="100" width="600" height="480"/><path d="M330 100V580M630 100V580"/><path d="M330 180H630M330 500H630" stroke-dasharray="10 8"/></g><g transform="translate(225 145) scale(.32)">${label}</g><text x="480" y="640" text-anchor="middle" fill="#a53d32" font-family="sans-serif" font-size="18">DEMO DIELINE — NOT PRINT READY OR TO SCALE</text></svg>`;files.push({name:base+'-dieline.svg',bytes:new TextEncoder().encode(svg),type:'image/svg+xml'});
 }
 const file=format==='all'?{name:base+'-packaging.zip',bytes:storedZip(files),type:'application/zip'}:files[0];const url=URL.createObjectURL(new Blob([file.bytes.slice().buffer],{type:file.type}));const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

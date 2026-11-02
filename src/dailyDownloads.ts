import {jsPDF} from 'jspdf';
import {zipSync,strToU8} from 'fflate';
import {labelSvg,type ProductDraft} from '../shared/productFlow';
import type {BrandKit,FarmerProfile} from '../shared/branding';
function saveBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function packagingFiles(product:ProductDraft,profile:FarmerProfile,brand:BrandKit,mockup?:string){
 const svg=labelSvg(product,profile,brand);const image=new Image();const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d');if(!context)throw new Error('Image export is unavailable.');context.drawImage(image,0,0);const labelPng=canvas.toDataURL('image/png');
 const pdf=new jsPDF({unit:'mm',format:'a4'});const width=Math.min(190,277*canvas.width/canvas.height);const height=width*canvas.height/canvas.width;pdf.addImage(labelPng,'PNG',10,10,width,height);const pdfBytes=new Uint8Array(pdf.output('arraybuffer'));
 const pngBytes=mockup?new Uint8Array(await (await fetch(mockup)).arrayBuffer()):new Uint8Array(await (await fetch(labelPng)).arrayBuffer());return {pdf:pdfBytes,svg:strToU8(svg),png:pngBytes};
 }finally{URL.revokeObjectURL(url);}
}
export async function downloadPackaging(kind:'pdf'|'svg'|'png'|'all',product:ProductDraft,profile:FarmerProfile,brand:BrandKit,mockup?:string){const files=await packagingFiles(product,profile,brand,mockup);const slug=product.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'product';if(kind==='all'){const zip=zipSync({[`${slug}-print.pdf`]:files.pdf,[`${slug}-label.svg`]:files.svg,[`${slug}-preview.png`]:files.png});saveBlob(new Blob([zip as BlobPart],{type:'application/zip'}),`${slug}-packaging.zip`);}else saveBlob(new Blob([files[kind] as BlobPart],{type:kind==='pdf'?'application/pdf':kind==='svg'?'image/svg+xml':'image/png'}),`${slug}-${kind==='png'?'preview':'label'}.${kind}`);}
export function downloadSalesReport(name:string){saveBlob(new Blob([`Sample data only\nProduct,Orders,Lifetime earnings,Product views\n"${name.replaceAll('"','""')}",38,3640.00,2350\n`],{type:'text/csv;charset=utf-8'}),'sample-sales-report.csv');}

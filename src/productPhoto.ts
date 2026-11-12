// Bound camera/upload photos before putting them in browser storage.
export async function compactProductPhoto(source:string){
 const image=new Image();image.src=source;await image.decode();
 const scale=Math.min(1,960/Math.max(image.naturalWidth,image.naturalHeight));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const context=canvas.getContext('2d');if(!context)throw new Error('Photo processing is unavailable.');
 context.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.75);
}

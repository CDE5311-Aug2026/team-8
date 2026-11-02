// Small browser-compatible PDF/ZIP writers; no export framework is needed.
const utf8=(text:string)=>new TextEncoder().encode(text);
function concat(parts:Uint8Array[]){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;}
export function jpegPdf(jpeg:Uint8Array,width:number,height:number){
 const chunks=[utf8('%PDF-1.4\n')],offsets=[0];let length=chunks[0].length;
 const object=(n:number,parts:Uint8Array[])=>{offsets[n]=length;const bytes=concat([utf8(`${n} 0 obj\n`),...parts,utf8('\nendobj\n')]);chunks.push(bytes);length+=bytes.length;};
 object(1,[utf8('<< /Type /Catalog /Pages 2 0 R >>')]);object(2,[utf8('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')]);
 object(3,[utf8('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>')]);
 object(4,[utf8(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),jpeg,utf8('\nendstream')]);
 const content=utf8('q\n535 0 0 401.25 30 220 cm\n/Im0 Do\nQ');object(5,[utf8(`<< /Length ${content.length} >>\nstream\n`),content,utf8('\nendstream')]);
 const xref=length;chunks.push(utf8('xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));return concat(chunks);
}
function crc32(bytes:Uint8Array){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function storedZip(files:{name:string;bytes:Uint8Array}[]){
 const local:Uint8Array[]=[],directory:Uint8Array[]=[];let offset=0;
 for(const file of files){const name=utf8(file.name),crc=crc32(file.bytes),header=new Uint8Array(30),view=new DataView(header.buffer);view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint32(14,crc,true);view.setUint32(18,file.bytes.length,true);view.setUint32(22,file.bytes.length,true);view.setUint16(26,name.length,true);local.push(header,name,file.bytes);
  const entry=new Uint8Array(46),dv=new DataView(entry.buffer);dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);dv.setUint32(16,crc,true);dv.setUint32(20,file.bytes.length,true);dv.setUint32(24,file.bytes.length,true);dv.setUint16(28,name.length,true);dv.setUint32(42,offset,true);directory.push(entry,name);offset+=header.length+name.length+file.bytes.length;
 }
 const central=concat(directory),end=new Uint8Array(22),dv=new DataView(end.buffer);dv.setUint32(0,0x06054b50,true);dv.setUint16(8,files.length,true);dv.setUint16(10,files.length,true);dv.setUint32(12,central.length,true);dv.setUint32(16,offset,true);return concat([...local,central,end]);
}

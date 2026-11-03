export const growingPractices=['Organic','Low waste','Sustainable','Biodiversity friendly','Traditional','Ethical','Regenerative','Fresh and seasonal','Community focused','Natural methods'] as const;
export type GrowingPractice=typeof growingPractices[number];
export const certificateKinds=['organic','good-practice','other'] as const;
export type CertificateKind=typeof certificateKinds[number];
export const certificateLabels:Record<CertificateKind,string>={organic:'Organic certificate','good-practice':'Good farming practice certificate',other:'Your certificate'};
export const maxFarmUploadBytes=512*1024;
export type LocalCertificateFile={name:string;type:string;size:number;dataUrl:string};
export type FarmCertificate={kind:CertificateKind;file:LocalCertificateFile;issuedBy:string;number:string;validUntil:string;status:'draft'|'local-pending';localReviewAt?:string};
export type FarmerPortrait={id:string;name:string;url:string};
export function suggestedGrowingPractices(story:string):GrowingPractice[]{
 const text=story.toLowerCase();const patterns=[/\borganic\b/,/\blow waste\b|\bless waste\b/,/\bsustainable\b/,/\bbiodiversity\b/,/\btraditional\b/,/\bethical\b/,/\bregenerative\b/,/\bfresh and seasonal\b|\bseasonal\b/,/\bcommunity focused\b/,/\bnatural methods\b/];
 return growingPractices.filter((_,index)=>patterns[index].test(text)&&!(index===0&&/\bnot organic\b|\bnon[- ]organic\b/.test(text)));
}
export function validGrowingPractices(value:unknown):value is GrowingPractice[]{return Array.isArray(value)&&value.length<=growingPractices.length&&value.every(item=>growingPractices.includes(item))&&new Set(value).size===value.length;}
export function validFarmerPortrait(value:unknown):value is FarmerPortrait{const p=value as FarmerPortrait;return !!p&&typeof p.id==='string'&&p.id.length<=100&&typeof p.name==='string'&&p.name.length<=500&&typeof p.url==='string'&&p.url.length<maxFarmUploadBytes*1.4&&/^data:image\/(jpeg|png|webp);base64,[a-z\d+/]+=*$/i.test(p.url);}
export function validFarmCertificate(value:unknown):value is FarmCertificate{
 const c=value as FarmCertificate;if(!c||!certificateKinds.includes(c.kind)||!['draft','local-pending'].includes(c.status)||!c.file)return false;
 const f=c.file;if(typeof f.name!=='string'||!f.name.trim()||f.name.length>500||!['application/pdf','image/jpeg','image/png','image/webp'].includes(f.type)||!Number.isInteger(f.size)||f.size<1||f.size>maxFarmUploadBytes||typeof f.dataUrl!=='string'||f.dataUrl.length>maxFarmUploadBytes*1.4||!f.dataUrl.startsWith(`data:${f.type};base64,`)||!/^data:(application\/pdf|image\/(jpeg|png|webp));base64,[a-z\d+/]+=*$/i.test(f.dataUrl))return false;
 if(![c.issuedBy,c.number,c.validUntil].every(text=>typeof text==='string'&&text.length<=2500))return false;
 return c.localReviewAt===undefined||typeof c.localReviewAt==='string'&&Number.isFinite(Date.parse(c.localReviewAt));
}
export function localCertificateReview(certificate:FarmCertificate):FarmCertificate{
 if(!validFarmCertificate(certificate)||![certificate.issuedBy,certificate.number,certificate.validUntil].every(text=>text.trim()))throw new Error('Add the issuer, certificate number and valid-until date before continuing.');
 return {...certificate,status:'local-pending',localReviewAt:new Date().toISOString()};
}
export function newFarmCertificate(kind:CertificateKind,file:LocalCertificateFile):FarmCertificate{return {kind,file,issuedBy:'',number:'',validUntil:'',status:'draft'};}
export function certificateFileError(file:{type:string;size:number}){if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))return 'Choose a PDF, JPG, PNG or WebP certificate.';if(file.size<1||file.size>maxFarmUploadBytes)return 'Choose a certificate up to 512 KB for this local demo.';return '';}

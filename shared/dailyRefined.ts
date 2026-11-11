import type {SampleOrder} from './dailyV2.ts';
import type {FarmerProfile} from './branding.ts';
import {validFarmCertificate,type FarmCertificate} from './farmCredentials.ts';

export const restockMessagesKey='farmily-restock-messages-v2';
export const certificateNoticesKey='farmily-certificate-notices-v2';
export type RestockMessage={productId:string;text:string;sentAt?:string};
export function restoreRestockMessages(value:unknown):RestockMessage[]{return Array.isArray(value)?value.filter((m):m is RestockMessage=>!!m&&typeof m.productId==='string'&&m.productId.length<=500&&typeof m.text==='string'&&m.text.length<=2000&&(m.sentAt===undefined||typeof m.sentAt==='string'&&Number.isFinite(Date.parse(m.sentAt)))):[];}
export function restockText(name:string,description:string='',stock?:string){return `An update from our farm: ${name}.${description.trim()?` ${description.trim()}`:''}${stock?` ${stock} available.`:''}`;}
export type CertificateEntry={id:string;title:string;certificate:FarmCertificate;review:'pending'|'approved'|'not-approved';reason?:string;sample?:boolean};
export function validCertificateEntry(value:unknown):value is CertificateEntry{const c=value as CertificateEntry;return !!c&&typeof c.id==='string'&&c.id.length>0&&c.id.length<=100&&typeof c.title==='string'&&c.title.length>0&&c.title.length<=100&&validFarmCertificate(c.certificate)&&['pending','approved','not-approved'].includes(c.review)&&(c.review==='pending'||c.sample===true)&&(c.reason===undefined||typeof c.reason==='string'&&c.reason.length<=2500);}
export function profileCertificates(profile:FarmerProfile):CertificateEntry[]{return profile.certificates|| (profile.certificate?[{id:'onboarding-certificate',title:profile.certificate.kind==='organic'?'Organic':profile.certificate.kind==='good-practice'?'Good farming practice':'Certificate',certificate:profile.certificate,review:'pending'}]:[]);}
export function certificateExpiry(value:string):number|null{
 const text=value.trim();const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text),written=/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(text);const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 let year:number,month:number,day:number;if(iso){year=Number(iso[1]);month=Number(iso[2]);day=Number(iso[3]);}else if(written){year=Number(written[3]);const name=written[2].toLowerCase();month=months.findIndex(full=>full===name||name.length===3&&full.startsWith(name))+1;day=Number(written[1]);}else return null;
 if(year<1900||year>9999||month<1||month>12||day<1||day>31)return null;const check=new Date(Date.UTC(year,month-1,day));if(check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)return null;return Date.parse(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T23:59:59.999+08:00`);
}
export function certificateStatus(entry:CertificateEntry,now=Date.now()):'Verified'|'Not approved'|'In review'|'Expires soon'|'Expired'{if(entry.review==='not-approved')return 'Not approved';if(entry.review==='pending')return 'In review';const expires=certificateExpiry(entry.certificate.validUntil);if(expires===null)return 'Not approved';if(expires<=now)return 'Expired';return expires-now<=30*86400000?'Expires soon':'Verified';}
export function shopperCertificates(entries:CertificateEntry[],now=Date.now(),samplePreview=false){return entries.filter(entry=>(!entry.sample||samplePreview)&&entry.review==='approved'&&['Verified','Expires soon'].includes(certificateStatus(entry,now)));}
export function certificateNotices(entries:CertificateEntry[],now=Date.now()){return entries.flatMap(entry=>{const status=certificateStatus(entry,now);if(status==='In review')return [];const message=status==='Not approved'?`${entry.title} was not approved. ${entry.reason||'Review the details and upload your certificate again.'}`:status==='Expires soon'?`${entry.title} expires within 30 days. Upload a renewed certificate.`:status==='Expired'?`${entry.title} has expired and is hidden from shoppers.`:`${entry.title} was approved.`;return [{id:`${entry.id}:${status}:${entry.certificate.localReviewAt||entry.certificate.validUntil}`,title:status==='Expires soon'?'Certificate expires soon':status==='Expired'?'Certificate expired':`Certificate ${status==='Verified'?'approved':'not approved'}`,message,sample:entry.sample===true}];});}
// Every sample order has the same details: who, when, where and each item (Figma: Order details).
const orderInfo:Record<string,{shopping:string;window:string;address:string}>={
 '#1042':{shopping:'First order',window:'Sat, 9am to 12pm',address:'Toa Payoh'},
 '#1041':{shopping:'Ordered 3 times',window:'Sat, 2pm to 5pm',address:'Jurong'},
 '#1039':{shopping:'Ordered 5 times',window:'Fri, 9am to 12pm',address:'Tampines'},
 '#1037':{shopping:'Ordered twice',window:'Fri, 2pm to 5pm',address:'Bedok'},
 '#1036':{shopping:'First order',window:'Thu, 9am to 12pm',address:'Clementi'},
 '#1030':{shopping:'Ordered 4 times',window:'Tue, 2pm to 5pm',address:'Ang Mo Kio'},
 '#1028':{shopping:'First order',window:'Sat, 10am to 12pm',address:'Pickup at farm'},
};
const orderProducts:Record<string,{name:string;size:string;unit:[string,string];price:number;image:string}>={
 honey:{name:'Wildflower Honey',size:'250 g',unit:['jar','jars'],price:14,image:'honey'},
 tea:{name:'Lemongrass Tea',size:'20 bags',unit:['box','boxes'],price:6,image:'tea'},
 kaya:{name:'Pandan Kaya',size:'200 g',unit:['jar','jars'],price:9.5,image:'kaya'},
 jam:{name:'Mango Jam',size:'220 g',unit:['jar','jars'],price:8,image:'jam'},
};
export function orderDetails(order:SampleOrder){
 const info=orderInfo[order.id]||{shopping:'Not provided',window:'Not provided',address:order.delivery.startsWith('Delivery to ')?order.delivery.slice(12):order.delivery};
 const items=order.items.split(',').map(part=>{const m=/^\s*(\d+)\s*×\s*(.+)$/.exec(part);const count=m?Number(m[1]):1,label=(m?m[2]:part).trim();const key=/tea/i.test(label)?'tea':/kaya/i.test(label)?'kaya':/jam/i.test(label)?'jam':'honey';const p=orderProducts[key];return {name:p.name,quantity:`${p.size}, ${count} ${p.unit[count===1?0:1]}`,price:(p.price*count).toFixed(2),image:p.image};});
 const subtotal=items.reduce((sum,item)=>sum+Number(item.price),0);const discount=Math.max(0,Math.round((subtotal-Number(order.total))*100)/100);
 return {...info,subtotal:subtotal.toFixed(2),discount:discount.toFixed(2),items};
}

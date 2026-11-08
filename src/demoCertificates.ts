import {newFarmCertificate} from '../shared/farmCredentials';
import {profileCertificates,type CertificateEntry} from '../shared/dailyRefined';
import type {FarmerProfile} from '../shared/branding';
const file={name:'organic-certificate.pdf',type:'application/pdf',size:14,dataUrl:'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y='};
export const demoCertificates:CertificateEntry[]=[
 {id:'sample-organic',title:'Organic',sample:true,review:'approved',certificate:{...newFarmCertificate('organic',file),issuedBy:'Control Union',number:'CU-2025-0817',validUntil:'14 March 2027',status:'local-pending'}},
 {id:'sample-good-practice',title:'Good farming practice',sample:true,review:'not-approved',reason:'We couldn’t read the date. Upload a clearer photo or the PDF.',certificate:{...newFarmCertificate('good-practice',{...file,name:'sg-gap-certificate.jpg'}),issuedBy:'SG GAP',number:'SGGAP-2024-311',validUntil:'',status:'local-pending'}},
 {id:'sample-food-safety',title:'Food safety',sample:true,review:'pending',certificate:{...newFarmCertificate('other',{...file,name:'sfa-licence.pdf'}),issuedBy:'SFA licence',number:'',validUntil:'',status:'local-pending'}},
];
export const shownCertificates=(profile:FarmerProfile,sample:boolean)=>profile.certificates!==undefined||profile.certificate?profileCertificates(profile):sample?demoCertificates:[];

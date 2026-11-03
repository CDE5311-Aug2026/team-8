import useCertificateClock from './useCertificateClock';
import {useState} from 'react';
import type {FarmerProfile} from '../shared/branding';
import {certificateNotices,certificateNoticesKey} from '../shared/dailyRefined';
import {shownCertificates} from './demoCertificates';
import {workspaceStorage} from './accountStorage';
export function useCertificateNotices(profile:FarmerProfile,sample:boolean){
 const [seen,setSeen]=useState<string[]>(()=>{try{const value=JSON.parse(workspaceStorage.getItem(certificateNoticesKey)||'null');return Array.isArray(value)?value.filter(v=>typeof v==='string'):[];}catch{return [];}});const [error,setError]=useState('');const entries=shownCertificates(profile,sample);const now=useCertificateClock(entries);const notices=certificateNotices(entries,now);

 function markRead(id:string){const next=[...new Set([...seen,id])];try{workspaceStorage.setItem(certificateNoticesKey,JSON.stringify(next));setSeen(next);setError('');}catch{setError('This notice could not be marked as read. Please try again.');}}
 return {notices,unread:notices.filter(notice=>!seen.includes(notice.id)).length,seen,markRead,error};
}
export default function CertificateNoticesV2({profile,sample}:{profile:FarmerProfile;sample:boolean}){const {notices,seen,markRead,error}=useCertificateNotices(profile,sample);if(!notices.length)return null;return <section className="dr-notices" aria-label="Certificate updates"><h2>Farm updates</h2>{notices.map(notice=><button type="button" className="dr-notice" key={notice.id} onClick={()=>markRead(notice.id)}><strong>{notice.title}{!seen.includes(notice.id)&&' · New'}</strong><span>{notice.message}</span>{notice.sample&&<small>Sample certificate update</small>}</button>)}{error&&<p role="alert">{error}</p>}</section>;}

import type {ReactNode} from 'react';
import {dailyRefinedAssets as a} from './dailyRefinedAssets';
import './daily-refined.css';
export function RefinedIcon({id}:{id:keyof typeof a}){return <img src={a[id]} alt=""/>;}
export function SubpageHeader({title,onBack,backIcon='1542:3585_imgIcon'}:{title:string;onBack:()=>void;backIcon?:keyof typeof a}){return <header className="dr-subpage-header"><button type="button" aria-label="Back" onClick={onBack}><RefinedIcon id={backIcon}/></button><h1>{title}</h1></header>;}
export function RefinedBadge({status}:{status:string}){const dot=status==='Not approved'||status==='Cancelled'||status==='Expired'?'1542:1742_imgDot1':status==='In review'?'1542:1742_imgDot2':status==='Preparing'?'1557:9082_imgDot1':status==='New order'?'1542:3585_imgDot1':'1542:1742_imgDot';return <span className="daily-status"><RefinedIcon id={dot}/>{status}</span>;}
export function DetailSection({title,children}:{title:string;children:ReactNode}){return <section className="dr-detail-section"><h2>{title}</h2><div className="dr-white-list">{children}</div></section>;}
export function DetailLine({label,value,className=''}:{label:string;value:string;className?:string}){return <div className={`dr-detail-line ${className}`}><span>{label}</span><strong>{value}</strong></div>;}
export function SubpageFooter({children}:{children:ReactNode}){return <footer className="dr-subpage-footer">{children}</footer>;}

import type {ReactNode} from 'react';
import {pageAssetSizes} from './pageAssetSizes';
import DashboardIcon from './DashboardIcon';
import DevBadge from './DevBadge';
export const pageAsset=(name:string)=>`${import.meta.env.BASE_URL}images/farmer-pages/${name}`;
export function FigmaIcon({file,size=16}:{file:string;size?:number}){const [w,h]=pageAssetSizes[file]||[size,size];return <span className="fp-icon" style={{width:size,height:size}} aria-hidden="true"><img src={pageAsset(file)} alt="" width={w} height={h} style={{transform:`scale(${size/Math.max(w,h)})`,transformOrigin:'top left'}}/></span>}
export type FarmerTab='home'|'products'|'orders'|'profile';
export function FarmerNav({active,onNavigate}:{active:FarmerTab;onNavigate:(view:FarmerTab)=>void}){return <nav className="farmer-nav" aria-label="Farmer navigation">{(['home','products','orders','profile'] as const).map(id=><button key={id} type="button" className={active===id?'active':''} aria-current={active===id?'page':undefined} onClick={()=>onNavigate(id)}><DashboardIcon name={({'home':'lucide-house','products':'lucide-package','orders':'lucide-shopping-bag','profile':'lucide-user-round'})[id]}/><span>{id[0].toUpperCase()+id.slice(1)}</span></button>)}</nav>}
export function PageHeader({title,action}:{title:string;action?:ReactNode}){return <header className="fp-header"><h1>{title}</h1>{action}</header>}
export function FarmerPage({title,active,onNavigate,action,children}:{title:string;active:FarmerTab;onNavigate:(view:FarmerTab)=>void;action?:ReactNode;children:ReactNode}){return <div className="app-shell farmer-page"><PageHeader title={title} action={action}/><main className="fp-main">{children}</main><FarmerNav active={active} onNavigate={onNavigate}/></div>}
export function StatusBadge({status,compact=false}:{status:string;compact?:boolean}){return <span className={`fp-status ${compact?'fp-status-compact':''} fp-status-${status.toLowerCase().replaceAll(' ','-')}`}>{status}</span>}
export function FilterChips<T extends string>({values,selected,onChange,label}:{values:{id:T;label:string}[];selected:T;onChange:(value:T)=>void;label:string}){return <div className="fp-filters" role="group" aria-label={label}>{values.map(v=><button type="button" key={v.id} aria-pressed={v.id===selected} onClick={()=>onChange(v.id)}>{v.label}</button>)}</div>}
export function SectionHeading({children,action}:{children:ReactNode;action?:ReactNode}){return <div className="fp-section-heading"><h2>{children}</h2>{action}</div>}
export function ListRow({label,value,icon,onClick}:{label:string;value?:string;icon?:string;onClick:()=>void}){return <button className="fp-list-row" type="button" onClick={onClick}>{icon&&<FigmaIcon file={icon}/>}<span>{label}</span>{value&&<small>{value}</small>}<FigmaIcon file="profile-wf-icon-chevron-right.svg"/></button>}
export function DemoNotice({children}:{children:ReactNode}){return <small className="fp-demo"><DevBadge/>{children}</small>}

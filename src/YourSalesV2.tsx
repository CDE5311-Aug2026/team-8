// "Your sales" (Figma: Farmer Side · v1 → 10 Your sales). Opened from Home → My sales.
import {readDailyCatalogue} from './catalogueStorage';
import {useState} from 'react';
import {ChevronRight,Download,Image as ImageIcon} from 'lucide-react';
import './your-sales.css';
import {DailyHeader} from './DailyPrimitives';
import SproutLoader from './SproutLoader';
import {workspaceStorage} from './accountStorage';
import {presetImagesFor} from '../shared/presetProduct';
import {validLabelTemplate} from '../shared/labelTemplates';
import {salesPeriods,salesReportCsv,salesSummaries,type SalesPeriod} from '../shared/salesSummary';

const money=(value:number,cents=false)=>`SGD ${value.toLocaleString('en-SG',{minimumFractionDigits:cents?2:0,maximumFractionDigits:cents?2:0})}`;
const read=(key:string)=>{try{return JSON.parse(workspaceStorage.getItem(key)||'null');}catch{return null;}};

function Chart({points}:{points:number[]}){
 const w=320,h=110,max=Math.max(...points)*1.15,min=0;
 const xy=points.map((v,i)=>[i*(w/(points.length-1)),h-((v-min)/(max-min))*h]);
 const line=xy.map(([x,y],i)=>{if(!i)return `M${x},${y}`;const [px,py]=xy[i-1];const cx=(px+x)/2;return `C${cx},${py} ${cx},${y} ${x},${y}`;}).join(' ');
 const [lx,ly]=xy[xy.length-1];
 return <svg className="ys-chart" viewBox={`-4 -6 ${w+8} ${h+8}`} preserveAspectRatio="none" aria-hidden="true"><path d={`${line} L${w},${h} L0,${h} Z`} fill="#19a35a" opacity=".14"/><path d={line} fill="none" stroke="#19a35a" strokeWidth="2" vectorEffect="non-scaling-stroke"/><line x1="0" x2={w} y1={h} y2={h} stroke="#e3e2dc" vectorEffect="non-scaling-stroke"/><circle cx={lx} cy={ly} r="3.5" fill="#19a35a"/></svg>;
}

export default function YourSalesV2({sample,onBack,onGrowth}:{sample:boolean;onBack:()=>void;onGrowth:()=>void}){
 const [period,setPeriod]=useState<SalesPeriod>('30d');
 const meta=salesPeriods.find(item=>item.id===period)!;const s=salesSummaries[period];
 const catalogue=readDailyCatalogue();
 const thumb=(id:string)=>{const item=catalogue.find(entry=>entry.id===id||entry.product.id===id);if(!item)return '';const images=presetImagesFor(item.product);return images?images[validLabelTemplate(item.product.labelTemplate)?item.product.labelTemplate:'botanical'].studio:item.product.photo;};
 function download(){const url=URL.createObjectURL(new Blob([salesReportCsv(period)],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download=`sales-report-${period}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(!sample)return <div className="app-shell v2 daily ys"><DailyHeader title="Your sales" onBack={onBack}/><main className="daily-content ys-content"><div className="ys-card ys-empty"><strong>No sales yet</strong><p>Your sales show here once shoppers start ordering.</p></div></main></div>;
 return <div className="app-shell v2 daily ys"><DailyHeader title="Your sales" onBack={onBack}/><main className="daily-content ys-content">
  <div className="ys-periods" role="group" aria-label="Period">{salesPeriods.map(item=><button type="button" key={item.id} aria-pressed={period===item.id} className={period===item.id?'active':''} onClick={()=>setPeriod(item.id)}>{item.label}</button>)}</div>
  <section className="ys-card ys-total"><small>Sales, {meta.long}</small><strong>{money(s.total,true)}</strong><p><b>+{s.change}%</b> vs the {meta.long.replace('last ','')} before</p><Chart points={s.points}/><div className="ys-axis">{meta.axis.map(label=><span key={label}>{label}</span>)}</div></section>
  <div className="ys-stats">{[[String(s.orders),'Orders'],[money(s.total/s.orders,true),'Avg. order'],[s.views.toLocaleString('en-SG'),'Shop views']].map(([value,label])=><div className="ys-card" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
  <section><h2 className="ys-heading">By product</h2><div className="ys-list">{s.products.map(item=>{const src=thumb(item.id);return <div className="ys-row" key={item.id}><span className="ys-thumb">{src?<img src={src} alt=""/>:<ImageIcon size={20}/>}</span><span className="ys-row-copy"><strong>{item.name}</strong><small>{item.sold} sold</small></span><b>{money(item.amount)}</b></div>;})}</div></section>
  <section><h2 className="ys-heading">Your shoppers</h2><div className="ys-stats">{[[s.customers,'Customers'],[s.repeat,'Repeat buyers'],[s.followers,'Followers']].map(([value,label])=><div className="ys-card" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div></section>
  <section><h2 className="ys-heading">Where orders come from</h2><div className="ys-card ys-regions">{s.regions.map(region=><div key={region.name}><span>{region.name}</span><i><b style={{width:`${region.share}%`}}/></i><span>{region.share}%</span></div>)}</div></section>
  <button type="button" className="ys-growth" onClick={onGrowth}><SproutLoader onDark still size={40}/><span><strong>Sprout AI found 2 ways to grow</strong><small>Open Sales and growth</small></span><ChevronRight size={20} aria-hidden="true"/></button>
  <button type="button" className="v2-secondary ys-download" onClick={download}><Download size={18} aria-hidden="true"/>Download report</button>
 </main></div>;
}

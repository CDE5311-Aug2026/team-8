import MobileDialog from './MobileDialog';
import {useEffect,useId,useState} from 'react';
import {ArrowRight,ChevronDown,CircleHelp,SlidersHorizontal} from 'lucide-react';
import {type BriefKind,type BriefState,type BriefTrial} from '../shared/briefV2';
import {defaultProjectionPlan,projectionKey,restoreProjectionPlan,salesProjection,type ProjectionPlan} from '../shared/briefProjection';
import {workspaceStorage} from './accountStorage';
import {useAccount} from './AuthContext';
import {DailyHeader,DailyNav,DailySegments,type DailyTab} from './DailyPrimitives';
import FarmSalesSection from './FarmSalesSection';
import Sprout from './Sprout';
import './brief-sales.css';

const opportunities=[
 {kind:'bundle' as const,title:'Create a breakfast bundle',text:'Pair tomatoes and honey in one offer to increase the value of each order.',evidence:'12 of 40 sample orders contain both products.',assumption:'Assumes additional sales from more products per order.'},
 {kind:'taster' as const,title:'Offer a smaller taster size',text:'Give first-time buyers a lower entry price for Pandan Kaya.',evidence:'2,350 sample views, with a 1.8% purchase rate.',assumption:'Assumes additional sales from first-time purchases.'},
 {kind:'delivery' as const,title:'Test free delivery in the East',text:'Run a limited delivery offer where sample demand is growing.',evidence:'Sample orders in the East increased by 24%.',assumption:'Assumes additional orders; delivery costs are excluded.'},
];
const currency=(n:number)=>new Intl.NumberFormat('en-SG',{style:'currency',currency:'SGD',maximumFractionDigits:0}).format(n);

function ProjectionChart({plan,sample,compact=false}:{plan:ProjectionPlan;sample:boolean;compact?:boolean}){
 const id=useId();const data=salesProjection(plan,sample);const [point,setPoint]=useState<number|null>(null);
 const floor=compact?84:166,plotHeight=compact?60:130;const max=Math.max(800,...data.projected)*1.15,x=(i:number)=>40+i*39.5,y=(n:number)=>floor-n/max*plotHeight;
 const line=(values:number[],offset=0)=>values.map((n,i)=>`${i?'L':'M'}${x(i+offset)},${y(n)}`).join(' ');
 const future=[data.history[3],...data.projected],base=[data.history[3],...data.baseline];
 const focus=point===null?null:point<4?`Week ${point+1}: ${currency(data.history[point])} sample sales`:`Week ${point+1}: ${currency(data.baseline[point-4])} baseline · ${currency(data.projected[point-4])} projected`;
 return <div className={`brief-projection-chart ${compact?'brief-chart-compact':''}`}><div className="brief-chart-periods"><span>Last 4 weeks</span><span>Next 4 weeks · projection</span></div><svg viewBox={`0 0 344 ${compact?112:204}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}><title id={`${id}-title`}>Sales and projected improvements</title><desc id={`${id}-desc`}>{sample?`Sample sales total SGD ${data.observed}. Over the next four weeks, baseline sales are SGD ${data.baselineTotal} and the selected scenario projects SGD ${data.projectedTotal}.`:'No connected sales data. Projections remain zero until sales data is available.'}</desc><defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#19a35a" stopOpacity=".16"/><stop offset="1" stopColor="#19a35a" stopOpacity="0"/></linearGradient></defs>{[0,1,2].map(i=>{const value=i*max/2;return <g key={i}><line x1="38" x2="320" y1={y(value)} y2={y(value)} stroke="#eceee8"/><text x="32" y={y(value)+4} textAnchor="end">{Math.round(value)}</text></g>;})}<rect x={x(3)} y="20" width={x(7)-x(3)} height={compact?64:148} fill="#f6f8f5"/><path d={`${line(future,3)} L${x(7)},${floor} L${x(3)},${floor} Z`} fill={`url(#${id}-fill)`}/><path d={line(data.history)} fill="none" stroke="#074226" strokeWidth="2.5"/><path d={line(base,3)} fill="none" stroke="#929f98" strokeWidth="2" strokeDasharray="4 5"/><path d={line(future,3)} fill="none" stroke="#19a35a" strokeWidth="2.5" strokeDasharray="6 4"/><line x1={x(3)} x2={x(3)} y1="20" y2={floor+4} stroke="#c4ccc5" strokeDasharray="3 4"/><text x={x(3)} y="12" textAnchor="middle">Today</text>{Array.from({length:8},(_,i)=><g key={i}><circle cx={x(i)} cy={y(i<4?data.history[i]:data.projected[i-4])} r="3.5" fill={i<4?'#074226':'#19a35a'}/><text x={x(i)} y={floor+22} textAnchor="middle">W{i+1}</text><circle tabIndex={0} role="button" aria-label={i<4?`Week ${i+1}: ${currency(data.history[i])} sample sales`:`Week ${i+1}: ${currency(data.projected[i-4])} projected sales`} cx={x(i)} cy={y(i<4?data.history[i]:data.projected[i-4])} r="13" fill="transparent" onMouseEnter={()=>setPoint(i)} onMouseLeave={()=>setPoint(null)} onFocus={()=>setPoint(i)} onBlur={()=>setPoint(null)} onClick={()=>setPoint(i)}/></g>)}</svg><div className="brief-chart-legend"><span><i/>Sample sales</span><span><i/>Baseline</span><span><i/>With suggestions</span></div><p className="brief-chart-readout" hidden={compact&&!focus} aria-live="polite">{focus||'Select a point to inspect weekly sales.'}</p></div>;
}

export default function BriefSalesDashboard({state,tab,onTab,onNavigate,onOpen,onDetails,onStatus,onInfo,onReport}:{state:BriefState;tab:string;onTab:(tab:string)=>void;onNavigate:(tab:DailyTab)=>void;onOpen:(kind:BriefKind,trial?:BriefTrial,editing?:boolean)=>void;onDetails:(trial:BriefTrial)=>void;onStatus:(trial:BriefTrial)=>void;onInfo:(message:string)=>void;onReport:()=>void}){
 const {sampleMode,setSampleMode}=useAccount();
 const [plan,setPlan]=useState<ProjectionPlan>(()=>{try{return restoreProjectionPlan(JSON.parse(workspaceStorage.getItem(projectionKey)||'null'));}catch{return defaultProjectionPlan();}});
 const [error,setError]=useState('');
 const [methodologyOpen,setMethodologyOpen]=useState(false);
 const [salesDetailsOpen,setSalesDetailsOpen]=useState(false);
 const [expanded,setExpanded]=useState<BriefKind|null>(null);
 const data=salesProjection(plan,sampleMode);
 const availableOpportunities=opportunities.filter(op=>!state.trials.some(trial=>trial.kind===op.kind));
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
 function update(next:ProjectionPlan){setPlan(next);try{workspaceStorage.setItem(projectionKey,JSON.stringify(next));setError('');}catch{setError('Your scenario is available for this visit but could not be saved.');}}
 const report=sampleMode?onReport:()=>onInfo('No connected sales data is available to export. Activate Samples to explore the example report.');
 return <div className="brief-pinned-layout">
  <DailyHeader title="Brief"><span className="brief-sales-badge">{sampleMode?'Sample data':'Sales overview'}</span></DailyHeader>
  <main className="brief-sales-content brief-pinned-content">
   <FarmSalesSection compact brief sample={sampleMode} onPeriod={()=>onInfo('This view compares the last 30 days with a four-week scenario. Sales are sample data; projections use the assumptions selected below.')} onReport={report} onDetails={()=>setSalesDetailsOpen(true)} chart={<>
    <ProjectionChart compact plan={plan} sample={sampleMode}/>
    <section className="brief-forecast brief-forecast-compact" aria-label="Sales projection summary">
     <div><small>Baseline · 4 weeks</small><strong>{currency(data.baselineTotal)}</strong></div>
     <div><small>With suggestions</small><strong>{currency(data.projectedTotal)}</strong></div>
     <p aria-live="polite"><strong>+{currency(data.improvement)}</strong><span>+{Math.round(data.lift*100)}% projected</span></p>
    </section>
   </>}/>
   <section className="brief-pinned-opportunities" aria-label="Sales opportunities">
    <div className="brief-opportunities-heading brief-pinned-heading"><h2><Sprout size="tiny"/>Sales opportunities</h2><button type="button" className="brief-methodology-icon" aria-label="How this projection works" onClick={()=>setMethodologyOpen(true)}><CircleHelp size={19} aria-hidden="true"/></button></div>
    {sampleMode&&<DailySegments label="Brief sections" active={tab} items={[{id:'ideas',label:'Opportunities',count:availableOpportunities.length},{id:'trying',label:'In progress',count:state.trials.length}]} onChange={onTab}/>}
    <div className="brief-opportunity-scroll" role="region" aria-label={tab==='trying'?'Trials in progress':'Suggested sales opportunities'} tabIndex={0}>
     {!sampleMode?<div className="brief-sales-empty"><p>Your sales and opportunities will appear here once connected data is available.</p><button className="v2-secondary" onClick={()=>void setSampleMode(true)}>Explore sample sales</button></div>:tab==='trying'?state.trials.length?state.trials.map(trial=>{
      const op=opportunities.find(item=>item.kind===trial.kind)!,isExpanded=expanded===trial.kind;
      return <article key={trial.kind} className="brief-opportunity brief-pinned-opportunity brief-pinned-trial">
       <div className="brief-pinned-opportunity-row">
        <div className="brief-pinned-trial-copy"><strong>{trial.name}</strong><small>{trial.status==='live'?'Active trial':trial.status==='paused'?'Paused':'Draft'} · {trial.kind==='bundle'?'Bundle':trial.kind==='taster'?'Taster size':'Delivery offer'}</small></div>
        <strong className="brief-pinned-uplift">+{currency(data.baselineTotal*plan.uplifts[trial.kind]/100)}</strong>
        <button type="button" className="brief-expand-opportunity" aria-label={`Details for ${trial.name}`} aria-expanded={isExpanded} aria-controls={`brief-trial-${trial.kind}`} onClick={()=>setExpanded(isExpanded?null:trial.kind)}><ChevronDown size={17} aria-hidden="true"/></button>
       </div>
       {isExpanded&&<div id={`brief-trial-${trial.kind}`} className="brief-pinned-opportunity-detail brief-pinned-trial-detail"><p>{op.text}</p><div className="brief-opportunity-evidence">{op.evidence}</div><small>Local trial · sales impact is projected.</small><div className="brief-opportunity-actions"><button className="v2-secondary" onClick={()=>onDetails(trial)}>View details</button><button className="v2-link" onClick={()=>trial.status==='draft'?onOpen(trial.kind,trial):onStatus(trial)}>{trial.status==='live'?'Pause trial':trial.status==='paused'?'Resume trial':'Continue setup'}</button></div></div>}
      </article>;
     }):<div className="brief-sales-empty"><h3>No trials started</h3><p>Review an opportunity, then set up a local trial.</p><button className="v2-secondary" onClick={()=>onTab('ideas')}>View opportunities</button></div>:availableOpportunities.length?availableOpportunities.map(op=>{
      const saved=state.trials.find(trial=>trial.kind===op.kind),included=plan.selected.includes(op.kind),isExpanded=expanded===op.kind;
      return <article className={`brief-opportunity brief-pinned-opportunity ${included?'included':''}`} key={op.kind}>
       <div className="brief-pinned-opportunity-row">
        <label className="brief-pinned-include"><input type="checkbox" aria-label={`Include ${op.title} in projection`} checked={included} onChange={e=>update({...plan,selected:e.target.checked?[...plan.selected,op.kind]:plan.selected.filter(kind=>kind!==op.kind)})}/><span><strong>{op.title}</strong><small title={op.evidence}>{op.evidence}</small></span></label>
        <strong className="brief-pinned-uplift">+{currency(data.baselineTotal*plan.uplifts[op.kind]/100)}</strong>
        <button type="button" className="brief-expand-opportunity" aria-label={`Details for ${op.title}`} aria-expanded={isExpanded} aria-controls={`brief-opportunity-${op.kind}`} onClick={()=>setExpanded(isExpanded?null:op.kind)}><ChevronDown size={17} aria-hidden="true"/></button>
       </div>
       {isExpanded&&<div id={`brief-opportunity-${op.kind}`} className="brief-pinned-opportunity-detail">
        <p>{op.text}</p><div className="brief-opportunity-evidence">{op.evidence}</div>
        <details className="brief-assumptions"><summary><SlidersHorizontal size={14}/>Projection assumption · {plan.uplifts[op.kind]}%</summary><label>Expected sales uplift<span><input aria-label={`${op.title} expected uplift`} type="number" min={0} max={30} step={1} value={plan.uplifts[op.kind]} onChange={e=>{const value=Number(e.target.value);if(Number.isFinite(value))update({...plan,uplifts:{...plan.uplifts,[op.kind]:Math.min(30,Math.max(0,value))}});}}/>%</span></label><small>{op.assumption} Adjust this example assumption to compare scenarios.</small></details>
        <button className="v2-link brief-review-opportunity" onClick={()=>onOpen(op.kind,saved,!!saved)}>{saved?'Manage trial':'Review & set up'}<ArrowRight size={16}/></button>
       </div>}
      </article>;
     }):<div className="brief-sales-empty"><h3>All opportunities are in progress</h3><p>Track and manage your trials in the In progress tab.</p><button type="button" className="v2-secondary" onClick={()=>onTab('trying')}>View in progress</button></div>}
     {error&&<p role="status">{error}</p>}
    </div>
    <small className="brief-pinned-disclosure">4-week illustrative scenario · costs excluded</small>
   </section>
  </main>
  <DailyNav tab="shorts" onNavigate={onNavigate}/>
  <MobileDialog open={methodologyOpen} title="How this projection works" onCancel={()=>setMethodologyOpen(false)}><div className="brief-methodology-copy"><p>The baseline holds the latest sample week’s sales steady for four weeks. Each selected uplift is added to that baseline, without compounding. The example assumes a full four-week run with sufficient stock. Opportunities may overlap; this scenario does not account for that overlap or estimate profit.</p><p>Changing a scenario updates the graph. Setting up a trial saves it locally and does not create actual sales.</p></div><button type="button" className="v2-primary" onClick={()=>setMethodologyOpen(false)}>Got it</button></MobileDialog>
  <MobileDialog open={salesDetailsOpen} title="Sales details" onCancel={()=>setSalesDetailsOpen(false)}><div className="brief-sales-detail-summary"><span>Lifetime earnings</span><strong>{sampleMode?'SGD 12,480.00':'SGD 0.00'}</strong></div><dl className="daily-sales-metrics">{['Orders','Avg. order','Shop views','Followers','Customers','Repeat buyers'].map((label,i)=><div key={label}><dd>{sampleMode?['72','$25.83','1,240','86','64','12'][i]:'—'}</dd><dt>{label}</dt></div>)}</dl><button type="button" className="v2-primary" onClick={report}>Download sales report</button></MobileDialog>
 </div>;
}

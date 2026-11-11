import {useState} from 'react';
import {homeSampleReviews,summarizeReviews} from '../shared/reviewSentiment';
import Sprout from './Sprout';
import MobileDialog from './MobileDialog';
import './review-summary.css';

export const homeReviewSummary=summarizeReviews(homeSampleReviews);
const join=(values:string[])=>new Intl.ListFormat('en',{style:'long',type:'conjunction'}).format(values);
export default function SproutReviewSummary({sample}:{sample:boolean}){
 const [open,setOpen]=useState(false);
 const summary=sample?homeReviewSummary:summarizeReviews([]);
 return <><section className="sprout-review-summary" aria-label="Sprout AI review sentiment summary"><div className="sprout-review-heading"><Sprout size="tiny"/><strong>Sprout AI’s review summary</strong>{summary.total>0&&<span>Mostly positive</span>}</div>{summary.total?<>
  <p>Customers most often praise {join(summary.positiveThemes.slice(0,2).map(theme=>theme.name.toLowerCase()))}. {summary.positiveThemes[2]?.name} is another positive theme. {join(summary.concerns.map((theme,index)=>index===0?theme.name:theme.name.toLowerCase()))} are the main areas to watch.</p>
  <div className="sprout-sentiment-bar" role="img" aria-label={`${summary.positive} positive, ${summary.mixed} mixed and ${summary.negative} negative reviews`}><span style={{width:`${summary.positive/summary.total*100}%`}}/><span style={{width:`${summary.mixed/summary.total*100}%`}}/><span style={{width:`${summary.negative/summary.total*100}%`}}/></div>
  <div className="sprout-sentiment-labels"><span><i/>Positive {summary.positivePercent}%</span><span><i/>Mixed {Math.round(summary.mixed/summary.total*100)}%</span><span><i/>Negative {Math.round(summary.negative/summary.total*100)}%</span></div>
  <div className="sprout-review-footer"><small>Based on {summary.total} reviews</small><button type="button" onClick={()=>setOpen(true)}>Review themes</button></div>
 </>:<p>Sprout AI will summarise customer feedback once reviews are available.</p>}</section>
 <MobileDialog open={open} title="What customers are saying" onCancel={()=>setOpen(false)}><div className="sprout-review-themes"><p>Sentiment across {summary.total} reviews, grouped by rating and review themes.</p><h3>What customers appreciate</h3><dl>{summary.positiveThemes.map(theme=><div key={theme.name}><dt>{theme.name}</dt><dd>{theme.count} mentions</dd></div>)}</dl><h3>Areas to watch</h3><dl>{summary.concerns.map(theme=><div key={theme.name}><dt>{theme.name}</dt><dd>{theme.count} mentions</dd></div>)}</dl><small>A review can mention more than one theme.</small></div><button type="button" className="v2-primary" onClick={()=>setOpen(false)}>Got it</button></MobileDialog></>;
}

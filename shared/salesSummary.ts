// Preset sales for the demo farm, per period (Figma: Farmer Side · v1 → 10 Your sales).
// Product totals add up to the period total; orders x average order matches the total.
export type SalesPeriod='7d'|'30d'|'3m'|'year';
export const salesPeriods:{id:SalesPeriod;label:string;long:string;axis:string[]}[]=[
 {id:'7d',label:'7 days',long:'last 7 days',axis:['Mon','Wed','Fri','Sun']},
 {id:'30d',label:'30 days',long:'last 30 days',axis:['Week 1','Week 2','Week 3','Week 4']},
 {id:'3m',label:'3 months',long:'last 3 months',axis:['Sep','Oct','Nov']},
 {id:'year',label:'Year',long:'last 12 months',axis:['Dec','Mar','Jun','Sep']},
];
export type SalesSummary={total:number;change:number;orders:number;views:number;points:number[];products:{id:string;name:string;sold:number;amount:number}[];customers:number;repeat:number;followers:number;regions:{name:string;share:number}[]};
const regions=[{name:'East',share:42},{name:'Central',share:29},{name:'West',share:17},{name:'North',share:12}];
export const salesSummaries:Record<SalesPeriod,SalesSummary>={
 '7d':{total:310,change:8,orders:18,views:320,points:[30,42,38,55,47,44,54],products:[{id:'demo-honey',name:'Wildflower Honey',sold:11,amount:154},{id:'demo-tea',name:'Lemongrass Tea',sold:26,amount:156}],customers:17,repeat:4,followers:86,regions},
 '30d':{total:1240,change:12,orders:72,views:1240,points:[250,300,330,320,310,335,360],products:[{id:'demo-honey',name:'Wildflower Honey',sold:44,amount:616},{id:'demo-tea',name:'Lemongrass Tea',sold:104,amount:624}],customers:64,repeat:12,followers:86,regions},
 '3m':{total:3520,change:18,orders:205,views:3610,points:[980,1050,1120,1080,1150,1190,1240],products:[{id:'demo-honey',name:'Wildflower Honey',sold:113,amount:1582},{id:'demo-tea',name:'Lemongrass Tea',sold:323,amount:1938}],customers:141,repeat:33,followers:86,regions},
 'year':{total:12480,change:24,orders:726,views:12900,points:[720,840,910,980,1060,1150,1240],products:[{id:'demo-honey',name:'Wildflower Honey',sold:420,amount:5880},{id:'demo-tea',name:'Lemongrass Tea',sold:1100,amount:6600}],customers:412,repeat:96,followers:86,regions},
};
export function salesReportCsv(period:SalesPeriod){
 const s=salesSummaries[period],p=salesPeriods.find(item=>item.id===period)!;
 const rows=[['Period',p.label],['Sales (SGD)',s.total.toFixed(2)],['Orders',String(s.orders)],['Average order (SGD)',(s.total/s.orders).toFixed(2)],['Shop views',String(s.views)],[],['Product','Sold','Sales (SGD)'],...s.products.map(item=>[item.name,String(item.sold),item.amount.toFixed(2)]),[],['Region','Share of orders'],...s.regions.map(item=>[item.name,`${item.share}%`])];
 return rows.map(row=>row.join(',')).join('\n')+'\n';
}

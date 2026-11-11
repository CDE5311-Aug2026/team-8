// Preset analytics for each preset product, last 30 days (Figma: Farmer Side · v1 → product Analytics).
// Units and sales come from salesSummaries, so the product pages, Your sales and the report agree.
// Lifetime is the last 12 months, the demo farm's whole history. Reviews match the customer side.
import {salesSummaries} from './salesSummary.ts';
export type ProductAnalytics={sold:number;amount:number;orders:number;lifetime:number;change:number;views:number;buyers:number;newBuyers:number;repeat:number;rating:number;reviews:number;positive:number;review:{name:string;text:string};pair:string;regions:[string,number][]};
const extra:Record<string,Omit<ProductAnalytics,'sold'|'amount'|'lifetime'|'change'>>={
 'demo-honey':{orders:38,views:2350,buyers:34,newBuyers:25,repeat:9,rating:4.9,reviews:21,positive:100,review:{name:'Mei L.',text:'Light and floral, lovely in my morning tea.'},pair:'Lemongrass Tea',regions:[['East',41],['Central',27],['West',19],['North',13]]},
 'demo-tea':{orders:34,views:440,buyers:30,newBuyers:27,repeat:3,rating:4.8,reviews:109,positive:93,review:{name:'Sarah K.',text:'Lovely flavour, you can really taste the difference.'},pair:'Wildflower Honey',regions:[['East',44],['Central',30],['West',16],['North',10]]},
};
export function productAnalytics(id:string|undefined):ProductAnalytics|null{
 const more=id?extra[id]:undefined;if(!more)return null;
 const month=salesSummaries['30d'].products.find(p=>p.id===id),year=salesSummaries.year.products.find(p=>p.id===id);if(!month||!year)return null;
 return {...more,sold:month.sold,amount:month.amount,lifetime:year.amount,change:salesSummaries['30d'].change};
}
export const sgd=(value:number)=>`SGD ${value.toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

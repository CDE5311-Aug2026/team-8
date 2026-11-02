import {sampleProfile,sampleConcepts,signature,type BrandKit} from './branding.ts';
import {fieldNames} from './analysis.ts';
import type {CatalogueProduct} from './catalogue.ts';

export const demoProfile={...sampleProfile,farmerName:'Alex Tan',address:'Lim Chu Kang',products:'Wildflower honey, lemongrass tea, pandan kaya and mango jam'};
export const demoBrand:BrandKit={concept:sampleConcepts[0],origin:'sample',image:null,imageSource:'none',profileSignature:signature(demoProfile),designStyle:'Minimal'};
export const demoProducts:CatalogueProduct[]=[['honey','Wildflower Honey','14.00','250g',true],['tea','Lemongrass Tea','6.00','20 bags',true],['kaya','Pandan Kaya','9.50','200g',true],['jam','Mango Jam','8.00','220g',false]].map(([id,name,price,quantity,live])=>({...Object.fromEntries(fieldNames.map(key=>[key,''])),id:`demo-${id}`,name,price,quantity,category:'Other',ingredients:id==='honey'?'100% raw honey':'See product label',description:id==='honey'?'Raw honey from our hives, harvested by hand each season.':'',allergens:'None declared',ingredientsNotApplicable:false,story:demoProfile.story,currency:'SGD',brandIdentity:demoBrand,createdAt:'2026-10-01T09:00:00.000Z',packagingComplete:id!=='jam',live:id==='honey'||id==='tea',photo:`/images/farmer-pages/product-image${id==='honey'?'':id==='tea'?'1':id==='kaya'?'2':'3'}.png`} as CatalogueProduct));
export function demoWorkspace(){return {
 'farmily-role':'farmer','farmily-profile':JSON.stringify(demoProfile),'farmily-brand':JSON.stringify(demoBrand),'farmily-products':JSON.stringify(demoProducts),'farmily-account-dismissed':'true','farmily-demo-seed-version':'4',
};}
const hash=(text:string)=>Array.from(text).reduce((value,char)=>(Math.imul(value,31)+char.charCodeAt(0))>>>0,7);
const round=(n:number)=>Math.round(n*100)/100;
export type Period=7|30|90;
export type ProductStats={product:CatalogueProduct;views:number;orders:number;sales:number;conversion:number};
export function productStats(product:CatalogueProduct,period:Period=30,promoted=false):ProductStats{
 if(!product.live||product.packagingComplete===false)return {product,views:0,orders:0,sales:0,conversion:0};
 const seed=hash(product.id),scale=period===7?.25:period===90?2.7:1;
 const fixed=({'demo-honey':[2350,38,532],'demo-tea':[440,34,1328],'demo-kaya':[500,9,446.4]} as Record<string,number[]>)[product.id];
 const base=fixed||[80+seed%180,4+seed%9,(4+seed%9)*Number(product.price)*2];
 const views=Math.round(base[0]*scale*(promoted?1.24:1)),orders=Math.round(base[1]*scale*(promoted?1.12:1));
 return {product,views,orders,sales:round(base[2]*scale*(promoted?1.12:1)),conversion:views?round(orders/views*100):0};
}
export function dashboardStats(products:CatalogueProduct[],period:Period=30,promotions:string[]=[],focused=false){
 const stats=products.map(product=>productStats(product,period,promotions.includes(product.id)));
 const sum=(key:'views'|'orders'|'sales')=>round(stats.reduce((total,item)=>total+item[key],0));
 const orders=sum('orders'),sales=sum('sales'),populated=stats.some(s=>s.views>0);
 const fixture=products.some(p=>p.id==='demo-honey'&&p.live);
 const factor=period===7?.25:period===90?2.7:1;
 const customers=fixture?Math.round(orders*64/72):Math.max(0,orders-Math.floor(orders*.18));
 const repeats=fixture?Math.round(customers*12/64):Math.floor(customers*.2);
 const lifetime=round(products.reduce((total,p)=>{if(!p.live||p.packagingComplete===false)return total;const historical=({'demo-honey':3640,'demo-tea':8840} as Record<string,number>)[p.id];return total+(historical!==undefined?historical*(promotions.includes(p.id)?1.12:1):productStats(p,90,promotions.includes(p.id)).sales);},0));
 const strongest=[...stats].filter(s=>s.views>0).sort((a,b)=>b.sales-a.sales)[0];
 const weakest=[...stats].filter(p=>p.views>0).sort((a,b)=>a.conversion-b.conversion)[0];
 const reviews=orders?(focused?Math.max(1,Math.round(orders*.63)):fixture?Math.round(customers*.75):Math.max(1,Math.round(customers*.7))):0;
 const ratings=Array.from({length:reviews},(_,i)=>reviewRating(i,reviews,focused));
 return {stats,orders,sales,customers,repeats,lifetime,views:fixture?Math.round(sum('views')*1240/2790):sum('views'),followers:populated?(fixture?Math.round(86*factor):Math.max(1,Math.round(sum('views')*.07))):0,average:orders?round(sales/orders):0,weekly:[.14,.28,.25,.33].map(weight=>round(sales*weight)),reviews,rating:reviews?Math.round(ratings.reduce((a,b)=>a+b,0)/reviews*10)/10:0,positive:reviews?Math.round(ratings.filter(n=>n>=4).length/reviews*100):0,strongest,weakest,populated};
}
export const regions=[['Central',38],['East',27],['West',21],['North',14]] as const;
export const ages=[['18–24',12],['25–34',34],['35–44',28],['45+',26]] as const;
export const genders=[['Female',62],['Male',35],['Other',3]] as const;
function reviewRating(index:number,count:number,focused=false){return index>=count-Math.round(count*(focused?.04:.08))?3:index>=count-Math.round(count*(focused?.04:.08))-Math.round(count*(focused?.12:.24))?4:5;}
export function simulatedReviews(products:CatalogueProduct[],count:number,focused=false){
 const eligible=products.filter(p=>productStats(p).orders>0);
 if(!eligible.length)return [];
 const names=['Mei L.','Amir T.','Sarah W.','Kai C.','Priya S.','Daniel L.'];
 const quotes=['Tastes like the real thing — you can tell it comes from a small farm.','Lovely quality and thoughtful packaging. I will order again.','A fresh favourite for our family.','Happy to support a local farmer.'];
 return Array.from({length:count},(_,index)=>({id:index,name:names[index%names.length],product:eligible[index%eligible.length].name,rating:reviewRating(index,count,focused),quote:quotes[index%quotes.length]}));
}
export type NextAction={id:string;source:'insight'|'progress';kind:'profile'|'branding'|'add'|'publish'|'promote';title:string;description:string;productId?:string};
export function nextActions(products:CatalogueProduct[],profileReady:boolean,brandReady:boolean,hasPhoto:boolean,promotions:string[]=[]):NextAction[]{
 const a:NextAction[]=[];const d=dashboardStats(products,30,promotions);
 if(!profileReady)a.push({id:'profile',source:'progress',kind:'profile',title:'Set up your farm profile',description:'Introduce your farm and the products you grow.'});
 if(!brandReady)a.push({id:'brand',source:'progress',kind:'branding',title:'Create your brand identity',description:'Give your products a packaging design of their own.'});
 if(!products.length&&brandReady)a.push({id:'add',source:'progress',kind:'add',title:'Add your first product',description:'Your brand is ready. Create your first listing.'});
 if(d.weakest&&brandReady)a.push({id:'packaging',source:'insight',kind:'branding',title:'Create new packaging design',description:`${d.weakest.product.name} has ${d.weakest.conversion}% conversion. Try another design.`,productId:d.weakest.product.id});
 if(d.strongest&&!promotions.includes(d.strongest.product.id))a.push({id:'promote',source:'insight',kind:'promote',title:`Promote ${d.strongest.product.name} in the East`,description:'27% of simulated buyers live in the East. Try a local promotion.',productId:d.strongest.product.id});
 const unfinished=products.find(p=>p.packagingComplete===false);if(unfinished)a.push({id:'finish',source:'progress',kind:'publish',title:`Finish ${unfinished.name}`,description:'Complete its packaging before publishing.',productId:unfinished.id});
 const unpublished=products.find(p=>!p.live&&p.packagingComplete!==false);if(unpublished)a.push({id:'publish',source:'progress',kind:'publish',title:`Publish ${unpublished.name}`,description:'Packaging is ready — publish to your demo storefront.',productId:unpublished.id});
 if(!hasPhoto)a.push({id:'photo',source:'progress',kind:'profile',title:'Add a farm photo',description:'A photo helps customers get to know your farm.'});
 return a;
}

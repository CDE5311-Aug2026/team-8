import type {BriefTrial} from './briefV2.ts';

export const briefProductFacts={
 honey:{name:'Wildflower Honey',quantity:'250 g',price:14},
 kaya:{name:'Pandan Kaya',quantity:'200 g',price:9.5},
 tea:{name:'Lemongrass Tea',quantity:'20 bags',price:6},
};
export const sampleDeliveryFee=4;
export function offerSalesScenario(trial:BriefTrial){
 const price=Number.isFinite(trial.price)&&trial.price>0?trial.price:null;
 const jars=Number.isInteger(trial.jars)&&trial.jars>0?trial.jars:null;
 const weeks=trial.kind==='delivery'?(Number.isInteger(trial.weeks)&&trial.weeks>0&&trial.weeks<=52?trial.weeks:null):4;
 const separate=[...new Set(trial.products)].reduce((sum,id)=>sum+(briefProductFacts[id as keyof typeof briefProductFacts]?.price||0),0);
 const comparison=trial.kind==='bundle'?separate:briefProductFacts.honey.price;
 const gap=price===null?null:Math.round((comparison-price)*100)/100;
 const orders=jars===null?null:trial.kind==='delivery'?(weeks===null?null:jars*weeks):jars;
 const totalSales=price!==null&&orders!==null?Math.round(price*orders*100)/100:null;
 const mass=trial.size.trim().match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l)$/i);
 const unit=mass&&/g/i.test(mass[2])?'g':'ml';
 const portion=mass?Number(mass[1])*(/^(kg|l)$/i.test(mass[2])?1000:1):null;
 const stockNeeded=portion!==null&&portion>0&&jars!==null?{amount:Math.round(portion*jars*100)/100,unit}:null;
 return {price,units:jars,weeks,orders,separate,gap,totalSales,stockNeeded,feesWaived:orders===null?null:sampleDeliveryFee*orders,discountGiven:gap!==null&&orders!==null?Math.round(Math.max(0,gap)*orders*100)/100:null};
}

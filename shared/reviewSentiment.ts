export type FarmReview={id:string;rating:number;text:string;positiveThemes:string[];concerns:string[]};

// Reviews behind the Home review summary. They add up to the product reviews shoppers see:
// Wildflower Honey 21 (4.9) and Lemongrass Tea 109 (4.8), 130 in total, rating 4.8, 94% positive.
const groups=[
 {count:12,rating:5,text:'Light and floral, lovely in my morning tea.',positiveThemes:['Flavour','Quality'],concerns:[]},
 {count:7,rating:5,text:'Lovely quality honey, with thoughtful packaging that arrived in perfect condition.',positiveThemes:['Packaging','Quality'],concerns:[]},
 {count:2,rating:4,text:'Beautiful honey packaging. Delivery arrived a little later than expected.',positiveThemes:['Packaging'],concerns:['Delivery timing']},
 {count:56,rating:5,text:'Lovely flavour, you can really taste the difference.',positiveThemes:['Flavour','Freshness'],concerns:[]},
 {count:40,rating:5,text:'The lemongrass tea is fresh, fragrant and full of flavour.',positiveThemes:['Flavour','Freshness'],concerns:[]},
 {count:5,rating:4,text:'Great flavour in the tea. I would buy more often at a lower price.',positiveThemes:['Flavour'],concerns:['Price']},
 {count:5,rating:3,text:'The tea is nice, but the price feels high for 20 bags.',positiveThemes:[],concerns:['Price']},
 {count:3,rating:2,text:'The tea order was delivered late and the timing was unclear.',positiveThemes:[],concerns:['Delivery timing']},
];
export const homeSampleReviews:FarmReview[]=groups.flatMap((group,index)=>Array.from({length:group.count},(_,n)=>({id:`sample-review-${index}-${n}`,rating:group.rating,text:group.text,positiveThemes:group.positiveThemes,concerns:group.concerns})));
export function summarizeReviews(reviews:FarmReview[]){
 const usable=reviews.filter(review=>Number.isFinite(review.rating)&&review.rating>=1&&review.rating<=5&&review.text.trim());
 const total=usable.length,positive=usable.filter(review=>review.rating>=4).length,mixed=usable.filter(review=>review.rating===3).length,negative=total-positive-mixed;
 function themes(key:'positiveThemes'|'concerns'){
  const counts=new Map<string,number>();
  for(const review of usable)for(const theme of new Set(review[key]))counts.set(theme,(counts.get(theme)||0)+1);
  return [...counts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 }
 return {total,positive,mixed,negative,positivePercent:total?Math.round(positive/total*100):0,rating:total?Math.round(usable.reduce((sum,review)=>sum+review.rating,0)/total*10)/10:0,positiveThemes:themes('positiveThemes'),concerns:themes('concerns')};
}

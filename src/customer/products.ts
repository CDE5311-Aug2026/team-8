export type PhotoLabel='none'|'enhanced'|'generated';

export type Product={
 blurb:string;
 quantity:string;
 ingredients:string;
 allergenInfo:string;
 story:string;
 processCaptions:[string,string];
 id:string;
 name:string;
 farm:string;
 price:number;
 unit:string;
 allergens:string[];
 image:string;
 photoLabel:PhotoLabel;
};

const img=(file:string)=>`/images/customer/${file}`;

export const products:Product[]=[
 {id:'goat-milk',blurb:'Fresh from the morning milking.',quantity:'1 L',ingredients:'Goat milk',allergenInfo:'Contains milk',story:'Goat milk from Happy Hill Farm, bottled fresh by the farm team. It is mild and creamy, and easy to pour over cereal or into a coffee.',processCaptions:['Picking on the farm','Packing your order'],name:'Goat milk',farm:'Happy Hill Farm',price:6.5,unit:'1L',allergens:['milk'],image:img('goat-milk.png'),photoLabel:'enhanced'},
 {id:'wildflower-honey',blurb:'Raw and unfiltered.',quantity:'250 g',ingredients:'Raw wildflower honey',allergenInfo:'Not listed',story:'Raw wildflower honey from Bee Good Apiary, collected from hives near the farm. Spoon it onto toast or stir it into tea.',processCaptions:['Picking on the farm','Packing your order'],name:'Raw wildflower honey',farm:'Bee Good Apiary',price:12,unit:'250g',allergens:[],image:img('honey.png'),photoLabel:'none'},
 {id:'heirloom-tomatoes',blurb:'Freshly picked. Great for salads.',quantity:'1 lb',ingredients:'Heirloom tomatoes',allergenInfo:'May contain traces of peanuts and tree nuts',story:'Heirloom tomatoes from Green Valley Farm. Freshly picked and great for salads.',processCaptions:['Picking tomatoes','Packing tomatoes'],name:'Heirloom Tomatoes',farm:'Green Valley Farm',price:4.5,unit:'1 lb',allergens:['peanuts','tree nuts'],image:img('tomatoes.png'),photoLabel:'generated'},
 {id:'goat-cheese',blurb:'Soft and mild.',quantity:'150 g',ingredients:'Goat milk, salt',allergenInfo:'Contains milk',story:'Goat cheese from Happy Hill Farm, wrapped by hand in paper. It spreads well on bread and crumbles easily over salads.',processCaptions:['Picking on the farm','Packing your order'],name:'Goat cheese',farm:'Happy Hill Farm',price:9.8,unit:'150g',allergens:['milk'],image:img('goat-cheese.png'),photoLabel:'none'},
 {id:'sourdough-loaf',blurb:'Baked fresh this morning.',quantity:'1 loaf',ingredients:'Wheat flour, water, salt, sourdough starter',allergenInfo:'Contains wheat',story:'Sourdough loaf from Field and Flour, baked in small batches. It has a crisp crust and a soft inside, and is good with soup or butter.',processCaptions:['Picking on the farm','Packing your order'],name:'Sourdough loaf',farm:'Field and Flour',price:8,unit:'loaf',allergens:['wheat'],image:img('sourdough.png'),photoLabel:'none'},
 {id:'fresh-spinach',blurb:'Picked this morning.',quantity:'250 g',ingredients:'Fresh spinach',allergenInfo:'Not listed',story:'Fresh spinach from Riverbend Farm, picked in bunches. Toss it into a salad or wilt it into a hot dish.',processCaptions:['Picking on the farm','Packing your order'],name:'Fresh spinach',farm:'Riverbend Farm',price:3.2,unit:'250g',allergens:[],image:img('spinach.png'),photoLabel:'enhanced'},
 {id:'apricot-jam',blurb:'Small-batch, slow cooked.',quantity:'250 g',ingredients:'Apricots, sugar, lemon juice',allergenInfo:'Not listed',story:'Apricot jam from Orchard Lane, cooked in small jars. Spread it on bread or spoon it over yogurt.',processCaptions:['Picking on the farm','Packing your order'],name:'Apricot jam',farm:'Orchard Lane',price:7.5,unit:'250g',allergens:[],image:img('apricot-jam.png'),photoLabel:'enhanced'},
];

export const productById=(id:string)=>{
 const product=products.find(p=>p.id===id);
 if(!product)throw new Error(`Unknown product: ${id}`);
 return product;
};

export const formatPrice=(price:number)=>`$${price.toFixed(2)}`;

export const allergenLine=(allergens:string[])=>allergens.length?`Allergens: ${allergens.join(', ')}`:'Allergens: not listed';

export const photoLabelText:Record<Exclude<PhotoLabel,'none'>,string>={enhanced:'AI-enhanced photo',generated:'AI-generated image'};

export type Category={id:string;name:string;image:string};

export const categories:Category[]=[
 {id:'honey',name:'Honey',image:img('honey-drizzle.png')},
 {id:'preserves',name:'Preserves',image:img('preserves.png')},
 {id:'drinks',name:'Drinks',image:img('drinks.png')},
 {id:'bakery',name:'Bakery',image:img('bakery.png')},
 {id:'dairy',name:'Dairy',image:img('dairy.png')},
 {id:'eggs',name:'Eggs',image:img('eggs.png')},
];

export const bannerImage=img('banner.png');
export const aiPickIds=['fresh-spinach','sourdough-loaf','apricot-jam'];
export const seasonalIds=['goat-milk','wildflower-honey','heirloom-tomatoes','goat-cheese'];
export const aiPromptChips=['Breakfast ideas','Dinner vegetables','Compare products'];

export const interestOptions=['Honey','Preserves','Drinks','Baked','Snacks','Sauces & spices','Dried goods','Produce'];
export const interestLimit=3;

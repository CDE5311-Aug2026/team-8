// What a farmer sells, picked on "Let's plant your farm" (Figma: Farmer Side · v1 → Onboarding / Farm basics).
// Tap a type to see suggestions; Other (or "Add your own") takes free text.
// Products are still saved as one comma-separated string on the profile.
export const productTypes={
 Vegetables:['Tomatoes','Courgette','Leafy greens','Carrots','Potatoes','Peppers'],
 Fruit:['Apples','Berries','Citrus','Mangoes','Bananas','Melons'],
 Eggs:['Chicken eggs','Duck eggs','Quail eggs'],
 Dairy:['Milk','Cheese','Yoghurt','Butter'],
 Honey:['Raw honey','Honeycomb','Beeswax'],
 Meat:['Chicken','Beef','Pork','Lamb'],
 Bakery:['Bread','Cakes','Pastries','Cookies'],
 Herbs:['Basil','Mint','Coriander','Lemongrass'],
 Flowers:['Cut flowers','Bouquets','Edible flowers'],
} as const;
export type ProductType=keyof typeof productTypes|'Other';
export const productTypeNames=[...Object.keys(productTypes),'Other'] as ProductType[];

const lower=(name:string)=>name.trim().toLowerCase();

// The type a product belongs to; anything not in a suggestion list counts as Other.
export function productTypeOf(name:string):ProductType{
 const key=lower(name);
 for(const [type,items] of Object.entries(productTypes))if((items as readonly string[]).some(item=>lower(item)===key))return type as ProductType;
 return 'Other';
}

// How many picked products sit under each type, for the count on the type chip.
// ownFor maps a farmer's own product (lower case) to the type it was typed under.
export function productTypeCounts(products:string[],ownFor:Record<string,ProductType>={}):Record<ProductType,number>{
 const counts=Object.fromEntries(productTypeNames.map(type=>[type,0])) as Record<ProductType,number>;
 for(const name of products){const type=productTypeOf(name);counts[type==='Other'&&ownFor[lower(name)]?ownFor[lower(name)]:type]++;}
 return counts;
}

// Add or remove one product, keeping the rest in order and ignoring case for duplicates.
export function toggleProduct(products:string[],name:string):string[]{
 const key=lower(name);
 return products.some(item=>lower(item)===key)?products.filter(item=>lower(item)!==key):[...products,name.trim()];
}

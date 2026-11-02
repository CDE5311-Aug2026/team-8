export type CartLine={productId:string;quantity:number};
export type CartFarm={farm:string;lines:CartLine[]};

export const cartFarms:CartFarm[]=[
 {farm:'Green Valley Farm',lines:[{productId:'heirloom-tomatoes',quantity:1}]},
 {farm:'Happy Hill Farm',lines:[{productId:'goat-milk',quantity:1},{productId:'goat-cheese',quantity:1}]},
];

export const soldOutLine={farm:'Bee Good Apiary',productId:'wildflower-honey'};
export const cartCount=4;
export const alsoLikeIds=['fresh-spinach','apricot-jam'];

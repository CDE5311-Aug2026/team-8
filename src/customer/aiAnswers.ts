export type AiRow={productId:string;reason:string};

const dinnerVegetables:AiRow[]=[
 {productId:'fresh-spinach',reason:'Quick to cook and goes with most dinners'},
 {productId:'heirloom-tomatoes',reason:'Great for salads and sauces'},
];

const answers:Record<string,AiRow[]>={
 'Dinner vegetables':dinnerVegetables,
 'Breakfast ideas':[
  {productId:'sourdough-loaf',reason:'Toast it for a simple breakfast'},
  {productId:'apricot-jam',reason:'Spread it on warm toast'},
  {productId:'goat-milk',reason:'Fresh for your coffee or cereal'},
 ],
 'Compare products':[
  {productId:'goat-milk',reason:'Fresh and mild, best for drinking'},
  {productId:'goat-cheese',reason:'Soft and mild, best on toast'},
 ],
};

export const answerFor=(question:string):AiRow[]=>answers[question]??dinnerVegetables;
export const thinkingMs=1000;

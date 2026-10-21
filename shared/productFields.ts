export const allergenGroups=[
 {label:'Cereals containing gluten',options:['Wheat','Rye','Barley','Oats','Spelt']},
 {label:'Other major allergens',options:['Crustaceans','Eggs','Fish','Molluscs','Peanuts','Soy','Milk']},
 {label:'Tree nuts',options:['Almonds','Hazelnuts','Walnuts','Cashews','Pecans','Brazil nuts','Pistachios','Macadamias']},
 {label:'Sulphites',options:['Sulphites (10 mg/kg or more)']},
];
export type AllergenSelection={status:'label'|'selected'|'none'|'unknown';contains:string[];mayContain:string[];original:string;includeOriginal?:boolean};
export function validAllergenSelection(value:unknown):value is AllergenSelection{
 if(!value||typeof value!=='object')return false;const selection=value as AllergenSelection;
 return ['label','selected','none','unknown'].includes(selection.status)&&typeof selection.original==='string'&&selection.original.length<=2000&&[selection.contains,selection.mayContain].every(items=>Array.isArray(items)&&items.length<=50&&items.every(item=>typeof item==='string'&&!!item.trim()&&item.length<=200));
}
export function initialAllergens(statement:string):AllergenSelection{return {status:statement.trim()?'label':'unknown',contains:[],mayContain:[],original:statement};}
export function allergenStatement(value:AllergenSelection):string{
 if(value.status==='label')return value.original;
 if(value.status==='none')return 'None declared';
 if(value.status==='unknown')return '';
 return [value.includeOriginal?value.original:'',value.contains.length?`Contains: ${value.contains.join(', ')}.`:'',value.mayContain.length?`May contain: ${value.mayContain.join(', ')}.`:''].filter(Boolean).join(' ');
}
// Split only between ingredients; commas inside compound ingredient parentheses stay intact.
export function ingredientList(value:string):string[]{
 const result:string[]=[];let current='';let depth=0;let quoted=false;
 for(const char of value){if(char==='"')quoted=!quoted;if(!quoted){if(char==='('||char==='[')depth++;if(char===')'||char===']')depth=Math.max(0,depth-1);}
  if(!quoted&&!depth&&[',',';','\n'].includes(char)){if(current.trim())result.push(current.trim());current='';}else current+=char;
 }
 if(current.trim())result.push(current.trim());return result;
}
export function addIngredients(current:string,input:string){
 const values=ingredientList(current);
 for(const item of ingredientList(input))if(!values.some(existing=>existing.toLowerCase()===item.toLowerCase()))values.push(item);
 const result=values.join(', ');if(result.length>2000)throw new Error('Keep your ingredients under 2,000 characters.');return result;
}

import {useState} from 'react';
import SearchMultiSelect from './SearchMultiSelect';
import {ingredientList,addIngredients} from '../shared/productFields';
const suggestions=['Tomatoes','Basil','Olive oil','Salt','Sugar','Water','Milk','Eggs','Wheat flour','Butter','Garlic','Onion'];
export default function IngredientTags({value,pending,onPendingChange,onChange}:{value:string;pending:string;onPendingChange:(value:string)=>void;onChange:(value:string)=>void}){
 const [error,setError]=useState('');const values=ingredientList(value);
 const options=[...new Set([...values,...suggestions])].map(item=>({id:item.toLowerCase(),label:item}));
 return <><SearchMultiSelect label="Ingredients (optional)" helper="Leave blank for whole produce, such as tomatoes." placeholder="Search or add ingredients" query={pending} onQueryChange={onPendingChange} selected={values.map(item=>({id:item.toLowerCase(),label:item}))} options={options} customChoice={text=>({id:text.toLowerCase(),label:text})} onChange={items=>{try{const combined=items.reduce((current,item)=>addIngredients(current,item.label),'');onChange(combined);setError('');}catch(err){setError((err as Error).message);}}}/>{error&&<p className="scan-error" role="alert">{error}</p>}</>;
}

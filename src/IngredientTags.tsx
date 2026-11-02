import {useState} from 'react';
import SearchMultiSelect from './SearchMultiSelect';
import {ingredientList,addIngredients} from '../shared/productFields';
const suggestions=['Tomatoes','Basil','Olive oil','Salt','Sugar','Water','Milk','Eggs','Wheat flour','Butter','Garlic','Onion'];
export default function IngredientTags({value,pending,onPendingChange,onChange,notApplicable,onNotApplicableChange}:{value:string;pending:string;onPendingChange:(value:string)=>void;onChange:(value:string)=>void;notApplicable:boolean;onNotApplicableChange:(checked:boolean)=>void}){
 const [error,setError]=useState('');const values=ingredientList(value);
 const options=[...new Set([...values,...suggestions])].map(item=>({id:item.toLowerCase(),label:item}));
 return <><SearchMultiSelect required disabled={notApplicable} label="Ingredients" placeholder="Search or add ingredients" query={pending} onQueryChange={onPendingChange} selected={values.map(item=>({id:item.toLowerCase(),label:item}))} options={options} afterInput={<label className="pf-field-checkbox"><input type="checkbox" checked={notApplicable} onChange={event=>onNotApplicableChange(event.target.checked)}/><span>Not applicable</span></label>} customChoice={text=>({id:text.toLowerCase(),label:text})} onChange={items=>{try{const combined=items.reduce((current,item)=>addIngredients(current,item.label),'');onChange(combined);setError('');}catch(err){setError((err as Error).message);}}}/>{error&&<p className="scan-error" role="alert">{error}</p>}</>;
}

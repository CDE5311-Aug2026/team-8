import SearchMultiSelect,{type SelectChoice} from './SearchMultiSelect';
import {allergenGroups,setAllergenFree,type AllergenSelection} from '../shared/productFields';
const allergens=allergenGroups.flatMap(group=>group.options);
export default function AllergenPicker({value,onChange,labelEvidence}:{value:AllergenSelection;onChange:(value:AllergenSelection)=>void;labelEvidence?:string}){
 const none={id:'none',label:'None declared'};const unknown={id:'unknown',label:'Not sure yet'};
 const original={id:'label',label:value.original};
 const options:SelectChoice[]=[none,unknown,...allergens.map(item=>({id:`contains:${item}`,label:item})),...allergens.map(item=>({id:`may:${item}`,label:`May contain: ${item}`})),...(value.original?[original]:[])];
 const selected=value.status==='none'?[none]:value.status==='label'&&value.original?[original]:value.status==='selected'?[...(value.includeOriginal&&value.original?[original]:[]),...value.contains.map(item=>({id:`contains:${item}`,label:item})),...value.mayContain.map(item=>({id:`may:${item}`,label:`May contain: ${item}`}))]:[];
 function change(items:SelectChoice[]){
  const added=items.find(item=>!selected.some(existing=>existing.id===item.id));
  if(added?.id==='none'||added?.id==='unknown'){onChange({...value,status:added.id});return;}
  const regular=items.filter(item=>!['none','unknown','label'].includes(item.id));
  let contains=regular.filter(item=>item.id.startsWith('contains:')).map(item=>item.id.slice(9));
  let mayContain=regular.filter(item=>item.id.startsWith('may:')).map(item=>item.id.slice(4));
  if(added?.id.startsWith('may:'))contains=contains.filter(item=>item!==added.id.slice(4));else if(added?.id.startsWith('contains:'))mayContain=mayContain.filter(item=>item!==added.id.slice(9));
  const includeOriginal=items.some(item=>item.id==='label');
  onChange({...value,status:regular.length?'selected':includeOriginal?'label':'unknown',includeOriginal,contains,mayContain});
 }
 return <div className="pf-allergen-simple"><SearchMultiSelect required disabled={value.status==='free'} label="Allergens" placeholder="Search and select allergens" options={options} selected={selected} customChoice={text=>({id:text.toLowerCase().startsWith('may contain:')?`may:${text.slice(12).trim()}`:`contains:${text}`,label:text})} onChange={change} afterInput={<label className="pf-field-checkbox"><input type="checkbox" checked={value.status==='free'} onChange={event=>onChange(setAllergenFree(value,event.target.checked))}/><span>Allergen-free</span></label>}/>{labelEvidence&&<details className="pf-original-allergens"><summary>Original label wording</summary><blockquote>{labelEvidence}</blockquote></details>}{value.status==='none'&&<small>“None declared” does not mean allergen-free.</small>}</div>;
}

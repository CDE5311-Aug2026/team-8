import type {Category} from './products';

export default function CategoryCircle({category,onSelect}:{category:Category;onSelect:()=>void}){
 return <button type="button" className="cx-category" onClick={onSelect}>
  <div className="cx-category-image" style={{backgroundImage:`url(${category.image})`}} role="img" aria-label={category.name}/>
  <span className="cx-category-name">{category.name}</span>
 </button>;
}

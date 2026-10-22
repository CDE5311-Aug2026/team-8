import ProductCard from './ProductCard';
import AiAsk from './AiAsk';
import type {Product} from './products';

export default function AiPicksBlock({picks,onSelectProduct}:{picks:Product[];onSelectProduct:(id:string)=>void}){
 return <section className="cx-ai-block" aria-labelledby="cx-ai-title">
  <div className="cx-ai-heading">
   <h2 id="cx-ai-title" className="cx-section-title">Recommended for you</h2>
   <span className="cx-chip cx-chip-ai"><span className="cx-ai-mark">✦</span> AI Picks</span>
  </div>
  <div className="cx-ai-carousel">
   {picks.map(product=><ProductCard key={product.id} product={product} variant="carousel" onSelect={()=>onSelectProduct(product.id)}/>)}
  </div>
  <hr className="cx-ai-divider"/>
  <AiAsk onSelectProduct={onSelectProduct}/>
 </section>;
}

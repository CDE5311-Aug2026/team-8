import {Package,Plus} from 'lucide-react';

export default function ProductsEmptyState({brandReady,onContinue}:{brandReady:boolean;onContinue:()=>void}){
 return <div className="empty-products products-empty-state">
  <Package size={30}/>
  <p>{brandReady?'Your first product starts here.':'Create your brand identity first so we can use it for your product packaging.'}</p>
  <button type="button" className="button primary" onClick={onContinue}>
   <Plus size={16}/>{brandReady?'Add a product':'Create my brand identity'}
  </button>
 </div>;
}

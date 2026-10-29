import {useState} from 'react';
import ProductCard from './ProductCard';
import {alsoLikeIds,cartCount,cartFarms,soldOutLine} from './cart';
import {ArrowLeftIcon,ChatIcon,CheckIcon,ChevronRightIcon,MinusIcon,PlusIcon} from './icons';
import type {Go} from './navigation';
import {formatPrice,productById} from './products';

const farmAvatar='/images/customer/farm-avatar.png';
const allIds=cartFarms.flatMap(farm=>farm.lines.map(line=>line.productId));

function Checkbox({checked,label,onChange}:{checked:boolean;label:string;onChange:()=>void}){
 return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} className={`cx-checkbox${checked?' cx-checkbox-on':''}`} onClick={onChange}>{checked&&<CheckIcon size={16}/>}</button>;
}

function FarmChip({farm,onOpen}:{farm:string;onOpen:()=>void}){
 return <button type="button" className="cx-cart-farm-link" onClick={onOpen}>
  <span className="cx-farm-avatar" style={{backgroundImage:`url(${farmAvatar})`}}/>
  <span className="cx-farm-name">{farm}</span>
  <ChevronRightIcon/>
 </button>;
}

export default function CartScreen({go}:{go:Go}){
 const [selected,setSelected]=useState<string[]>(allIds);
 const [quantities,setQuantities]=useState<Record<string,number>>(()=>Object.fromEntries(cartFarms.flatMap(farm=>farm.lines.map(line=>[line.productId,line.quantity]))));
 const endOfDemo=()=>go('endOfDemo');
 const isOn=(id:string)=>selected.includes(id);
 const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 const toggleMany=(ids:string[])=>setSelected(s=>ids.every(id=>s.includes(id))?s.filter(x=>!ids.includes(x)):[...new Set([...s,...ids])]);
 const changeQuantity=(id:string,delta:number)=>setQuantities(q=>({...q,[id]:Math.max(1,q[id]+delta)}));
 const total=allIds.filter(isOn).reduce((sum,id)=>sum+productById(id).price*quantities[id],0);
 const count=selected.length;
 const soldOut=productById(soldOutLine.productId);
 return <div className="cx-cart">
  <header className="cx-product-header">
   <button type="button" className="cx-icon-button cx-back" aria-label="Back" onClick={()=>go('home')}><ArrowLeftIcon/></button>
   <h1 className="cx-end-brand">Farmily</h1>
   <div className="cx-cart-actions">
    <button type="button" className="cx-cart-edit" onClick={endOfDemo}>Edit</button>
    <button type="button" className="cx-icon-button" aria-label="Chat" onClick={endOfDemo}><ChatIcon/></button>
   </div>
  </header>
  <main className="cx-cart-body">
   <h2 className="cx-cart-title">Cart ({cartCount})</h2>
   {cartFarms.map(({farm,lines})=>{
    const ids=lines.map(line=>line.productId);
    return <section key={farm} className="cx-cart-card" aria-label={farm}>
     <div className="cx-cart-farm">
      <Checkbox checked={ids.every(isOn)} label={`Select all from ${farm}`} onChange={()=>toggleMany(ids)}/>
      <FarmChip farm={farm} onOpen={endOfDemo}/>
     </div>
     {lines.map(({productId})=>{
      const product=productById(productId);
      return <div key={productId} className="cx-cart-item">
       <Checkbox checked={isOn(productId)} label={`Select ${product.name}`} onChange={()=>toggle(productId)}/>
       <span className="cx-cart-photo" style={{backgroundImage:`url(${product.image})`}} role="img" aria-label={product.name}/>
       <div className="cx-cart-info">
        <h3 className="cx-cart-name">{product.name}</h3>
        <p className="cx-cart-unit">Unit: {product.unit}</p>
        <div className="cx-cart-price-row">
         <span className="cx-cart-price">{formatPrice(product.price)}</span>
         <div className="cx-stepper">
          <button type="button" aria-label={`Decrease ${product.name}`} disabled={quantities[productId]<=1} onClick={()=>changeQuantity(productId,-1)}><MinusIcon/></button>
          <span aria-live="polite">{quantities[productId]}</span>
          <button type="button" aria-label={`Increase ${product.name}`} onClick={()=>changeQuantity(productId,1)}><PlusIcon/></button>
         </div>
        </div>
       </div>
      </div>;
     })}
    </section>;
   })}
   <section className="cx-cart-card" aria-label="Sold out">
    <div className="cx-cart-farm"><FarmChip farm={soldOutLine.farm} onOpen={endOfDemo}/></div>
    <div className="cx-cart-item">
     <span className="cx-cart-photo cx-cart-photo-soldout" style={{backgroundImage:`url(${soldOut.image})`}} role="img" aria-label={soldOut.name}><span className="cx-soldout-pill">Sold out</span></span>
     <div className="cx-cart-info">
      <div className="cx-cart-dim">
       <h3 className="cx-cart-name">{soldOut.name}</h3>
       <p className="cx-cart-unit">Unit: {soldOut.unit}</p>
       <span className="cx-cart-price">{formatPrice(soldOut.price)}</span>
      </div>
      <button type="button" className="cx-outline-button" onClick={endOfDemo}>Find similar products</button>
     </div>
    </div>
   </section>
   <h2 className="cx-cart-title">You may also like</h2>
   <div className="cx-grid">
    {alsoLikeIds.map(id=><ProductCard key={id} product={productById(id)} variant="grid" onSelect={()=>go('product',id)}/>)}
   </div>
  </main>
  <div className="cx-cart-bar">
   <label className="cx-select-all"><Checkbox checked={selected.length===allIds.length} label="Select all" onChange={()=>toggleMany(allIds)}/>Select all</label>
   <div className="cx-cart-total">
    <p className="cx-total-text"><span>Total</span><strong>{formatPrice(total)}</strong></p>
    <button type="button" className="cx-button cx-button-block cx-checkout" disabled={count===0} onClick={endOfDemo}>Check out ({count})</button>
   </div>
  </div>
 </div>;
}

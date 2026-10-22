import {allergenLine,formatPrice,photoLabelText,type Product} from './products';

type ProductCardProps={product:Product;variant?:'carousel'|'grid';onSelect:()=>void};

export default function ProductCard({product,variant='grid',onSelect}:ProductCardProps){
 const label=product.photoLabel==='none'?null:photoLabelText[product.photoLabel];
 return <button type="button" className={`cx-product-card cx-product-card-${variant}`} onClick={onSelect}>
  <div className="cx-product-photo" style={{backgroundImage:`url(${product.image})`}} role="img" aria-label={product.name}>
   {label&&<span className="cx-chip cx-chip-photo"><span className="cx-ai-mark">✦</span> {label}</span>}
  </div>
  <div className="cx-product-info">
   <h3 className="cx-product-name">{product.name}</h3>
   <p className="cx-product-meta">{product.farm}</p>
   <p className="cx-product-meta">{allergenLine(product.allergens)}</p>
   <p className="cx-product-price">{formatPrice(product.price)} / {product.unit}</p>
  </div>
 </button>;
}

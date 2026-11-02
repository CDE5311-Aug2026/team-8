import {useState} from 'react';
import {ArrowLeftIcon,CartIcon,ChatIcon,ChevronRightIcon,HeartIcon,ShareIcon} from './icons';
import type {Back,Go,RequestAction} from './navigation';
import {formatPrice,photoLabelText,productById} from './products';

const farmAvatar='/images/customer/farm-avatar.png';
const farmStory='/images/customer/farm-story.png';
const processPhotos=['/images/customer/tomato-picking.png','/images/customer/tomato-sorting.png'];

function PhotoChip({text,size}:{text:string;size:'hero'|'story'|'gallery'}){
 return <span className={`cx-chip cx-chip-${size}`}><span className="cx-ai-mark">✦</span> {text}</span>;
}

export default function ProductScreen({productId,go,back,requestAction,notice}:{productId:string;go:Go;back:Back;requestAction:RequestAction;notice:string|null}){
 const product=productById(productId);
 const [saved,setSaved]=useState(false);
 const endOfDemo=()=>go('endOfDemo');
 const details=[['Quantity',product.quantity],['Ingredients',product.ingredients],['Allergens',product.allergenInfo]];
 const label=product.photoLabel==='none'?null:photoLabelText[product.photoLabel];
 return <>
  <header className="cx-product-header">
   <button type="button" className="cx-icon-button cx-back" aria-label="Back" onClick={back}><ArrowLeftIcon/></button>
   <h1 className="cx-end-brand">Farmily</h1>
  </header>
  <main className="cx-product-page">
   <div className="cx-hero" style={{backgroundImage:`url(${product.image})`}} role="img" aria-label={product.name}>
    {label&&<PhotoChip text={label} size="hero"/>}
   </div>
   <div className="cx-farm-bar">
    <button type="button" className="cx-farm-chip" onClick={endOfDemo}>
     <span className="cx-farm-avatar" style={{backgroundImage:`url(${farmAvatar})`}}/>
     <span className="cx-farm-name">{product.farm}</span>
     <ChevronRightIcon/>
    </button>
    <button type="button" className={`cx-icon-button${saved?' cx-saved':''}`} aria-label={saved?'Remove from saved':'Save'} aria-pressed={saved} onClick={()=>setSaved(s=>!s)}><HeartIcon filled={saved}/></button>
    <button type="button" className="cx-icon-button" aria-label="Share" onClick={endOfDemo}><ShareIcon/></button>
    <button type="button" className="cx-icon-button" aria-label="Cart" onClick={()=>go('cart')}><CartIcon/></button>
   </div>
   <div className="cx-product-content">
    <section className="cx-product-identity">
     <h2 className="cx-product-title">{product.name}</h2>
     <p className="cx-product-farm">{product.farm}</p>
     <p className="cx-product-price-large">{formatPrice(product.price)} / {product.unit}</p>
     <p className="cx-product-farm">{product.blurb}</p>
    </section>
    <hr className="cx-divider"/>
    <h2 className="cx-heading">Product information</h2>
    <dl className="cx-details">
     {details.map(([label,value])=><div key={label} className="cx-detail"><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <hr className="cx-divider"/>
    <h2 className="cx-heading">The story behind this product</h2>
    <p className="cx-product-farm">{product.story}</p>
    <div className="cx-story-photo" style={{backgroundImage:`url(${farmStory})`}} role="img" aria-label={`The people behind ${product.farm}`}>
     <PhotoChip text={photoLabelText.enhanced} size="story"/>
    </div>
    <p className="cx-caption">The people behind {product.farm}</p>
    <hr className="cx-divider"/>
    <h2 className="cx-heading">From picking to packing</h2>
    <div className="cx-gallery">
     {processPhotos.map((photo,index)=><figure key={photo} className="cx-gallery-item">
      <div className="cx-gallery-photo" style={{backgroundImage:`url(${photo})`}} role="img" aria-label={product.processCaptions[index]}>
       <PhotoChip text={photoLabelText.enhanced} size="gallery"/>
      </div>
      <figcaption className="cx-caption">{product.processCaptions[index]}</figcaption>
     </figure>)}
    </div>
    <hr className="cx-divider"/>
    <h2 className="cx-heading">Meet your farmer</h2>
    <button type="button" className="cx-farmer-card" onClick={endOfDemo}>
     <span className="cx-farm-avatar cx-farmer-avatar" style={{backgroundImage:`url(${farmAvatar})`}}/>
     <span className="cx-farmer-text"><span className="cx-farmer-name">{product.farm}</span><span className="cx-caption">View farm profile →</span></span>
    </button>
   </div>
  </main>
  {notice&&<p className="cx-toast" role="status">{notice}</p>}
  <div className="cx-action-bar">
   <button type="button" className="cx-icon-button" aria-label="Chat" onClick={endOfDemo}><ChatIcon/></button>
   <span className="cx-action-divider"/>
   <button type="button" className="cx-icon-button" aria-label="Add to cart" onClick={()=>requestAction('add',productId)}><CartIcon/></button>
   <button type="button" className="cx-button cx-button-block cx-buy" onClick={()=>requestAction('buy',productId)}>Buy now</button>
  </div>
 </>;
}

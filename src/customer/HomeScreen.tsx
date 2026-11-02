import AiPicksBlock from './AiPicksBlock';
import CategoryCircle from './CategoryCircle';
import ProductCard from './ProductCard';
import {BagIcon,CartIcon,ChatIcon,HeartIcon,HomeIcon,LocationIcon,SearchIcon,UserIcon} from './icons';
import type {Go} from './navigation';
import {aiPickIds,bannerImage,categories,productById,seasonalIds} from './products';

const tabs=[{label:'Home',Icon:HomeIcon,active:true},{label:'Saved',Icon:HeartIcon},{label:'Order',Icon:BagIcon},{label:'Profile',Icon:UserIcon}];

export default function HomeScreen({go}:{go:Go}){
 const endOfDemo=()=>go('endOfDemo');
 return <>
  <main className="cx-home">
   <header className="cx-header">
    <p className="cx-deliver"><LocationIcon/> Deliver to Singapore 560123</p>
    <div className="cx-search-row">
     <button type="button" className="cx-search" onClick={endOfDemo}><SearchIcon/><span>Search products, farms and more</span></button>
     <button type="button" className="cx-icon-button" aria-label="Chat" onClick={endOfDemo}><ChatIcon/></button>
     <button type="button" className="cx-icon-button" aria-label="Cart" onClick={()=>go('cart')}><CartIcon/></button>
    </div>
   </header>
   <section className="cx-banner" style={{backgroundImage:`linear-gradient(to left,var(--cx-gold-veil),var(--cx-background-veil)),url(${bannerImage})`}}>
    <h2 className="cx-banner-title">Farms close to you</h2>
    <p className="cx-banner-text">Meet the small farms growing near Singapore</p>
    <button type="button" className="cx-button" onClick={endOfDemo}>Explore farms</button>
   </section>
   <div className="cx-categories">
    {categories.map(category=><CategoryCircle key={category.id} category={category} onSelect={endOfDemo}/>)}
   </div>
   <AiPicksBlock picks={aiPickIds.map(productById)} onSelectProduct={id=>go('product',id)}/>
   <h2 className="cx-section-title">Seasonal &amp; New arrivals</h2>
   <div className="cx-grid">
    {seasonalIds.map(id=><ProductCard key={id} product={productById(id)} variant="grid" onSelect={()=>go('product',id)}/>)}
   </div>
  </main>
  <nav className="cx-tab-bar" aria-label="Main">
   {tabs.map(({label,Icon,active})=><button type="button" key={label} className={`cx-tab${active?' cx-tab-active':''}`} aria-current={active?'page':undefined} onClick={active?undefined:endOfDemo}><Icon/>{label}</button>)}
  </nav>
 </>;
}

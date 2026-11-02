import {ArrowRight,Leaf,ShoppingBasket,Sprout} from 'lucide-react';

export default function Welcome({onExplore,onSell,onSignIn}:{onExplore:()=>void;onSell:()=>void;onSignIn:()=>void}){
 return <div className="app-shell marketplace-welcome"><header className="farmer-header"><span className="farmily-logo"><Leaf size={22}/> Farmily</span><button type="button" className="text-button welcome-signin" onClick={onSignIn}>Sign in</button></header><main className="farmer-main">
  <div className="welcome-emblem" aria-hidden="true"><Sprout size={64}/></div><span className="eyebrow">FROM FARMERS TO FOOD LOVERS</span><h1>Good food starts with a connection.</h1><p className="intro">Discover the people behind your food. Share the story behind what you grow.</p>
  <div className="welcome-actions"><button className="button primary" onClick={onExplore}><ShoppingBasket size={19}/>Explore Farmily<ArrowRight size={18}/></button><button className="button secondary" onClick={onSell}><Sprout size={19}/>Start selling</button></div>
  <small className="welcome-reassurance">Take a look around. No account needed to explore.</small>
 </main></div>;
}

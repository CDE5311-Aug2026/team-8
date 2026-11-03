import WelcomeScreenV2 from './WelcomeScreenV2';
export default function Welcome({onExplore,onSell,onSignIn}:{onExplore:()=>void;onSell:()=>void;onSignIn:()=>void}){return <div className="app-shell v2"><WelcomeScreenV2 onBuy={onExplore} onSell={onSell} onSignIn={onSignIn}/></div>;}

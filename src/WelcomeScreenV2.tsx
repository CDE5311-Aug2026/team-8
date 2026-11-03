import {welcomeAssets as a} from './welcomeAssets';
import './welcome-v2.css';
export default function WelcomeScreenV2({onBuy,onSell,onSignIn}:{onBuy:()=>void;onSell:()=>void;onSignIn:()=>void}){
 return <main className="welcome-v2"><section className="welcome-v2-hero"><img src={a.imgSprout} alt="Sprout"/><h1>Good food starts with a connection</h1><p>Hi, I'm Sprout. What brings you here?</p></section><div className="welcome-v2-choices"><button type="button" onClick={onBuy}><img src={a.imgIcon} alt=""/><span><strong>I want to buy</strong><small>Fresh food from local farms</small></span><img src={a.imgArrow} alt=""/></button><button type="button" onClick={onSell}><img src={a.imgIcon1} alt=""/><span><strong>I want to sell</strong><small>Open your farm shop</small></span><img src={a.imgArrow1} alt=""/></button></div><div className="welcome-v2-signin"><span>Already on Farmily?</span><button type="button" onClick={onSignIn}>Sign in</button></div></main>;
}

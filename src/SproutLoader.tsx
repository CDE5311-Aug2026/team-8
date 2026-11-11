// Sprout loading animation, shared with the customer "Setting up your market" screen
// (Figma: Customer Side · v2 → "Get started / Loading" 1850:7849, Sprout variants Center, Left, Right, Blink).
import './sprout-loader.css';

// still: no animation, for a Sprout icon sitting on a dark card.
export default function SproutLoader({onDark=false,size=72,still=false}:{onDark?:boolean;size?:number;still?:boolean}){
 return <svg className={`sprout-loader${still?' is-still':''}`} viewBox="0 0 72 81" width={size} height={size*81/72} aria-hidden="true">
  <circle cx="36" cy="44.64" r="36" fill="#19A35A"/>
  <path d="M34.5601 15.84C34.5601 5.76 41.7601 0 53.2801 0C53.2801 10.08 46.0801 15.84 34.5601 15.84Z" fill={onDark?'#94D9AE':'#074226'}/>
  <g className="sprout-loader-eyes"><circle cx="27.72" cy="29.016" r="3.24" fill="white"/><circle cx="45" cy="29.016" r="3.24" fill="white"/></g>
 </svg>;
}

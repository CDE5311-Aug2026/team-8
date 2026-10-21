import RequiredMark from './RequiredMark';
import {parsePriceInput,normalisePrice} from '../shared/currency';
export default function CurrencyField({value,onChange}:{value:string;onChange:(value:string)=>void}){
 return <div className="pf-field"><label htmlFor="product-price">Price (SGD)<RequiredMark/></label><div className="pf-currency-input"><span className="pf-currency-code" aria-hidden="true">SGD</span><input id="product-price" name="price" required inputMode="decimal" autoComplete="off" autoCapitalize="none" enterKeyHint="done" maxLength={16} placeholder="0.00" value={value} onChange={event=>{const next=parsePriceInput(event.target.value);if(next!==null)onChange(next);}} onBlur={()=>{const formatted=normalisePrice(value);if(formatted!==value)onChange(formatted);}}/></div></div>;
}

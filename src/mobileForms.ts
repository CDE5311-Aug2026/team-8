import type {KeyboardEvent} from 'react';
import type {FieldName} from '../shared/analysis';

export const productPlaceholders:Record<FieldName,string>={
 name:'e.g. Tomatoes',category:'Choose a category',description:'Describe your product',
 brand:'Your product’s brand',ingredients:'List the ingredients',allergens:'Copy the allergen statement from your label',
 quantity:'e.g. 500 g or 1 litre',nutrition:'Copy the nutrition information from your label',
 storage:'How should this product be stored?',expiry:'Enter the date exactly as shown on the label',
 producer:'Producer name and details',origin:'e.g. Singapore',
};
export const multilineProductFields:FieldName[]=['description','ingredients','allergens','nutrition','storage','producer'];

// Let multiline fields keep Enter for new lines and list fields handle their own Add action.
export function advanceField(event:KeyboardEvent<HTMLElement>){
 if(event.defaultPrevented||event.key!=='Enter'||event.nativeEvent.isComposing)return;
 const target=event.target;
 if(!(target instanceof HTMLInputElement)||['checkbox','color','file','radio'].includes(target.type))return;
 const container=target.form||event.currentTarget;
 const fields=Array.from(container.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="color"]),textarea,select')).filter(field=>!field.disabled&&field.getClientRects().length>0);
 const index=fields.indexOf(target);const next=index>=0?fields[index+1]:undefined;
 if(next){event.preventDefault();next.focus();}
 else if(target.enterKeyHint==='done'){event.preventDefault();target.blur();}
}

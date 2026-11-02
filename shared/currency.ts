export function parsePriceInput(value:string):string|null{
 let amount=value.trim().replace(/^(S\$|SGD)\s*/i,'');
 if(/^\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(amount))amount=amount.replaceAll(',','');else amount=amount.replace(',','.');
 return /^\d*(\.\d{0,2})?$/.test(amount)?amount:null;
}
export function normalisePrice(value:string){const amount=Number(value);return value.trim()&&Number.isFinite(amount)?amount.toFixed(2):value;}
export function formatSgd(value:string){const amount=Number(value);return `S$${new Intl.NumberFormat('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(amount)?amount:0)}`;}

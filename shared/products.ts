export function addProducts(current:string,input:string){
 const products:string[]=[];
 for(const product of `${current},${input}`.split(',').map(item=>item.trim()).filter(Boolean)){
  if(!products.some(existing=>existing.toLowerCase()===product.toLowerCase()))products.push(product);
 }
 const joined=products.join(', ');
 if(joined.length>2500)throw new Error('Keep your product list under 2,500 characters.');
 return joined;
}

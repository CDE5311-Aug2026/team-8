// Wildflower Honey product page. The customer prototype has one product page (Lemongrass Tea,
// Figma "Product / Lemongrass Tea"). When a shopper opens a honey card, this fills that page
// with honey's details (Figma "Product / Wildflower Honey"). The photo then follows the
// farmer's current design through farmer-covers.js. Adding honey puts it in the basket and
// checkout in place of the tea (Figma "Basket / Wildflower Honey", "Checkout / Wildflower Honey").
(function(){
 var key='farmily-customer-product';
 // [section name, text on the tea page, text on the honey page]
 var honey=[
  ['Name','Lemongrass Tea','Wildflower Honey'],
  ['Farm','4.8 (109)','4.9 (21)'],
  ['Price','SGD 6.00','SGD 14.00'],['Price','/ 20 bags','/ 250 g'],
  ['Taste','Citrusy','Floral'],['Taste','Light','Sweet'],['Taste','Fresh','Smooth'],
  ['Product information','20 bags','250 g'],['Product information','Dried lemongrass','100% raw honey'],['Product information','None','None declared'],
  ['Chip','After meals','Tea'],['Chip','Iced tea','Toast'],['Chip','Hot days','Yoghurt'],
  ['Farm story card','A light, citrusy lemongrass infusion in 20 individually wrapped tea bags. Presented in a compact paperboard carton.','Raw honey from our hives, harvested by hand each season.'],
  ['Button','See all 109','See all 21'],['Rating summary','4.8','4.9'],['Detail','109 reviews','21 reviews'],
  ['Avatar','S','M'],['Who','sarah_k','mei_lin'],['Header','5 days ago','4 days ago'],
  ['Review card','Lovely flavour, you can really taste the difference.','Light and floral, lovely in my morning tea.'],
  ['Tags','Fresh','Floral'],['Helpful','Helpful (5)','Helpful (4)'],
  ['Avatar','D','R'],['Who','daniel88','raj.s'],['Header','3 days ago','1 week ago'],
  ['Review card','Good quality and nicely packed. A little smaller than I expected.','Smooth and not too sweet. The jar is pretty enough to gift.'],
  ['Reply',"Thanks, Daniel. We'll make the next batch a little more generous.",'Thanks, Raj. So glad it made a good gift.'],
  ['Helpful','Helpful (3)','Helpful (2)'],
  ['Button','Add for SGD 6.00','Add for SGD 14.00']
 ];
 // Basket and checkout with honey instead of tea: SGD 14.00 passes the free delivery minimum, so
 // Green Valley delivers free. Subtotal 30.30, welcome deal -1.40, delivery 1.50 (Happy Hill only).
 var order=[
  ['1270:779','SGD 4.20 more for free delivery','Free delivery unlocked'],
  ['I1447:3621;1091:388','Lemongrass Tea','Wildflower Honey'],['I1447:3621;1091:389','SGD 6.00 / 20 bags','SGD 14.00 / 250 g'],
  ['I1482:5063;1091:315','-SGD 0.60','-SGD 1.40'],['1447:3658','SGD 21.70','SGD 28.90'],
  ['I1447:3677;1091:302','Delivery SGD 1.50','Free delivery'],['1447:3695','SGD 22.30','SGD 30.30'],['1447:3697','Delivery (2 farms)','Delivery (1 farm)'],['1447:3698','SGD 3.00','SGD 1.50'],
  ['1482:5096','-SGD 0.60','-SGD 1.40'],['1447:3701','SGD 24.70','SGD 30.40'],['1447:3705','SGD 24.70','SGD 30.40']
 ];
 var map={};honey.forEach(function(r){map[r[0]+'|'+r[1]]=r[2];});
 var orderMap={};order.forEach(function(r){orderMap[r[0]+'|'+r[1]]=r[2];});
 // Taste dots: Floral 4, Sweet 5, Smooth 3 (tea: Citrusy 4, Light 3, Fresh 2).
 var dots={Floral:4,Sweet:5,Smooth:3};
 var on='var(--color-primary-500,#19a35a)',off='var(--color-neutral-200,#e0e0dc)';
 var basketKey='farmily-customer-basket';
 function picked(k){try{return sessionStorage.getItem(k||key)==='honey';}catch(e){return false;}}
 // Swap text inside root by rules keyed on the closest Figma layer name or node id.
 function swapText(root,rules,active){
  var walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
  while((n=walk.nextNode())){
   var el=n.parentElement;if(!el)continue;var cur=n.nodeValue.trim();if(!cur)continue;
   var orig=el.getAttribute('data-tea-text');var base=orig!=null?orig:cur;
   var named=el.closest('[data-name]'),noded=el.closest('[data-node-id]');
   var next=active?(rules[(named&&named.getAttribute('data-name'))+'|'+base]||rules[(noded&&noded.getAttribute('data-node-id'))+'|'+base]):null;
   if(next){if(orig==null)el.setAttribute('data-tea-text',cur);if(cur!==next)n.nodeValue=next;}
   else if(orig!=null){if(cur!==orig)n.nodeValue=orig;el.removeAttribute('data-tea-text');}
  }
 }
 function swapPhoto(img,isHoney,tea){if(!img)return;var want=isHoney?'/preset/honey-botanical-studio.jpg':tea;var preset=img.getAttribute('data-preset')||img.getAttribute('src');if(preset!==want){img.removeAttribute('data-preset');img.setAttribute('src',want);}}
 function page(){var name=document.querySelector('[data-node-id="1673:7018"]');return name?name.closest('[data-node-id="1447:3373"]')||document.body:null;}
 var busy=false;
 function apply(){
  if(busy)return;busy=true;
  try{
   var root=page();
   if(root){
    var isHoney=picked();swapText(root,map,isHoney);
    root.querySelectorAll('[data-name="Dots"]').forEach(function(row){
     var label=row.parentElement&&row.parentElement.querySelector('p');var level=isHoney&&label?dots[label.textContent.trim()]:null;
     Array.prototype.forEach.call(row.children,function(dot,i){
      if(dot.getAttribute('data-tea-bg')==null)dot.setAttribute('data-tea-bg',dot.style.background||'');
      dot.style.background=level?(i<level?on:off):dot.getAttribute('data-tea-bg');
     });
    });
    swapPhoto(root.querySelector('[data-name="Product photo"] img'),isHoney,'/preset/tea-minimal-studio.jpg');
   }
   var basket=document.querySelector('[data-name="Free delivery bar"],[data-node-id="1447:3695"]');
   if(basket){
    var inBasket=picked(basketKey);swapText(document.body,orderMap,inBasket);
    var bar=document.querySelector('[data-name="Free delivery bar"] [data-name="Bar"]');
    if(bar){if(bar.getAttribute('data-tea-width')==null)bar.setAttribute('data-tea-width',bar.style.width||'');bar.style.width=inBasket?'100%':bar.getAttribute('data-tea-width');}
    // The Green Valley item photo in the basket and its thumbnail in checkout.
    document.querySelectorAll('[data-node-id="I1447:3621;1091:382"] img,[data-node-id="1447:3676"] img,img[data-node-id="1447:3676"]').forEach(function(item){swapPhoto(item,inBasket,'/preset/tea-minimal-studio.jpg');});
   }
  }finally{busy=false;}
 }
 // Remember which product the shopper opened.
 document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  // Adding from the product page puts that product in the basket.
  var add=e.target.closest('[data-node-id="I1447:3411;1145:650"],[data-node-id="1447:3411"]');
  if(add){try{if(picked())sessionStorage.setItem(basketKey,'honey');else sessionStorage.removeItem(basketKey);}catch(err){}return;}
  var card=e.target.closest('[data-name="Product card"]');if(!card)return;
  var img=card.querySelector('img');var src=img?(img.getAttribute('data-preset')||img.getAttribute('src')||''):'';
  var isHoney=/Wildflower Honey|honey/i.test(card.textContent)||/\/preset\/honey-/.test(src);
  try{if(isHoney)sessionStorage.setItem(key,'honey');else sessionStorage.removeItem(key);}catch(err){}
 },true);
 var queued=false;
 new MutationObserver(function(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;apply();},0);}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 document.addEventListener('DOMContentLoaded',apply);
})();

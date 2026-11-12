// Ask Sprout AI as one running conversation (shown over the "as-" screens).
// - Your message appears first, Sprout "types" for a moment, then answers.
// - Every earlier chip and pick stays tappable, and you can type your own question.
// - Compare products asks which products first, then shows the comparison.
// - Back always returns to Home.
// Typed questions go to /api/sprout when it exists; if it is unavailable Sprout answers from
// the scripted replies below, so the demo never breaks.
(function(){
 var NAME='farmily-customer-name',PRODUCT='farmily-customer-product',FARM='farmily-customer-farm',BASKET='farmily-customer-basket';
 function get(k){try{var v=sessionStorage.getItem(k);return v?JSON.parse(v):'';}catch(e){return '';}}
 function setRaw(k,v){try{sessionStorage.setItem(k,v);}catch(e){}}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 function who(){return get(NAME)||'Minh';}

 var P={
  spinach:{name:'Fresh spinach',farm:'rb',farmName:'Riverbend Farm',price:3.2,img:'/preset/shop-spinach-studio.jpg'},
  lettuce:{name:'Butterhead lettuce',farm:'sg',farmName:'Sunrise Greens',price:3.8,img:'/preset/shop-lettuce-studio.jpg'},
  cheese:{name:'Goat cheese',farm:'hh',farmName:'Happy Hill Farm',price:9.8,img:'/preset/shop-cheese-studio.jpg'},
  sourdough:{name:'Sourdough loaf',farm:'ff',farmName:'Field and Flour',price:8,img:'/preset/shop-sourdough-studio.jpg'},
  jam:{name:'Apricot jam',farm:'bg',farmName:'Bee Good Apiary',price:7.5,img:'/preset/shop-jam-studio.jpg'},
  milk:{name:'Goat milk',farm:'hh',farmName:'Happy Hill Farm',price:6.5,img:'/preset/shop-milk-studio.jpg'},
  microgreens:{name:'Microgreens',farm:'sg',farmName:'Sunrise Greens',price:5.5,img:'/preset/shop-microgreens-studio.jpg'},
  'gv-honey':{name:'Wildflower Honey',farm:'gv',farmName:'Green Valley Farm',price:14,img:'/preset/honey-botanical-studio.jpg'},
  honey:{name:'Raw wildflower honey',farm:'bg',farmName:'Bee Good Apiary',price:12,img:'/preset/shop-honey-studio.jpg'},
  tea:{name:'Lemongrass Tea',farm:'gv',farmName:'Green Valley Farm',price:6,img:'/preset/tea-minimal-studio.jpg'},
  kaya:{name:'Pandan kaya',farm:'kp',farmName:'Kampung Pantry',price:6.5,img:'/preset/shop-kaya-studio.jpg'},
  sambal:{name:'Sambal belacan',farm:'kp',farmName:'Kampung Pantry',price:7,img:'/preset/shop-sambal-studio.jpg'}
 };
 var CHIPS=[['dinner','Dinner ideas'],['breakfast','Breakfast ideas'],['compare','Compare products']];
 var PICKS={
  dinner:{title:'Dinner, sorted',sub:'3 fresh picks you can cook tonight',items:[['spinach','Sauté it with garlic in minutes'],['lettuce','Toss it into a fresh salad'],['cheese','Crumble it over pasta']]},
  breakfast:{title:'Breakfast, sorted',sub:'3 easy picks for a slow morning',items:[['sourdough','Toast it for a simple breakfast'],['jam','Spread it on warm toast'],['milk','Fresh for your coffee or cereal']]},
  cheaper:{title:'Lighter on the wallet',sub:'3 picks under SGD 6',items:[['spinach','Sauté it with garlic in minutes'],['lettuce','A salad in one minute'],['microgreens','A fresh topping for anything']]}
 };
 var COMPARE={
  honey:{q:'Green Valley or Bee Good honey?',title:'Honey face-off',sub:'Here’s how these two stack up',
   a:{id:'gv-honey',rows:[['Price','SGD 14.00'],['Distance','4.2 km'],['Stock','In stock']]},
   b:{id:'honey',rows:[['Price','SGD 12.00'],['Distance','5 km'],['Stock','Sold out']]},
   pick:'My pick: Green Valley',why:'It’s in stock and closer. Bee Good’s is SGD 2 cheaper but sold out right now.',add:'Add Green Valley honey',addId:'gv-honey'},
  greens:{q:'Spinach or lettuce for a salad?',title:'Salad greens face-off',sub:'Here’s how these two stack up',
   a:{id:'spinach',rows:[['Price','SGD 3.20'],['Texture','Tender'],['Best for','Warm salads']]},
   b:{id:'lettuce',rows:[['Price','SGD 3.80'],['Texture','Soft, crisp'],['Best for','Fresh salads']]},
   pick:'My pick: Butterhead lettuce',why:'Soft and crisp for a fresh salad. Spinach saves you SGD 0.60 and works warm too.',add:'Add lettuce',addId:'lettuce'}
 };

 var ICON={back:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 19v3"/>',send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',chev:'<path d="m9 18 6-6-6-6"/>',up:'<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 3 3.9Z"/>',down:'<path d="M17 14V2"/><path d="M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.6 2H17v12l-4 8a3 3 0 0 1-3-3.9Z"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/>'};
 function svg(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[k]+'</svg>';}
 var SPROUT='<svg class="sc-av" viewBox="0 0 72 81" aria-hidden="true"><circle cx="36" cy="44.64" r="36" fill="#19A35A"/><path d="M34.56 15.84C34.56 5.76 41.76 0 53.28 0C53.28 10.08 46.08 15.84 34.56 15.84Z" fill="#074226"/><circle cx="27.72" cy="29" r="3.24" fill="#fff"/><circle cx="45" cy="29" r="3.24" fill="#fff"/></svg>';

 var css=document.createElement('style');
 css.textContent=[
  '.sc-screen{position:absolute;inset:0;z-index:40;background:#f5f5f2;display:flex;flex-direction:column;font-family:Figtree,sans-serif;color:#1a1a18}',
  '.sc-top{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #e6e6e1;background:#f5f5f2}',
  '.sc-top button{width:32px;height:32px;border:0;background:none;padding:4px;cursor:pointer;color:#1a1a18}',
  '.sc-top b{font:700 18px/24px "Bricolage Grotesque",sans-serif}',
  '.sc-list{flex:1;overflow-y:auto;padding:16px 16px 24px;display:flex;flex-direction:column;gap:14px}',
  '.sc-hello{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:8px 0 4px}',
  '.sc-hello .sc-av{width:64px;height:72px}',
  '.sc-hello h2{margin:6px 0 0;font:700 21px/27px "Bricolage Grotesque",sans-serif}',
  '.sc-hello p{margin:0;color:#6e6e69;font-size:15px}',
  '.sc-chips{display:flex;flex-wrap:wrap;gap:8px}',
  '.sc-chip{border:1.5px solid #19A35A;background:#fff;color:#0e6b3b;border-radius:999px;padding:8px 14px;font:600 14px/18px Figtree,sans-serif;cursor:pointer}',
  '.sc-chip:active{transform:scale(.97)}',
  '.sc-me{align-self:flex-end;max-width:80%;background:#074226;color:#fff;border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:15px;line-height:20px;animation:sc-in .25s ease-out}',
  '.sc-bot{display:flex;gap:8px;align-items:flex-start;animation:sc-in .3s ease-out}',
  '.sc-bot>.sc-av{width:28px;height:32px;flex-shrink:0;margin-top:2px}',
  '.sc-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}',
  '.sc-sticker{background:#19A35A;color:#fff;border-radius:16px;padding:12px 14px;transform:rotate(-1.2deg);box-shadow:0 4px 12px rgba(7,66,38,.15)}',
  '.sc-sticker b{display:block;font:700 16px/22px "Bricolage Grotesque",sans-serif}',
  '.sc-sticker span{display:block;font-size:13px;line-height:18px;opacity:.95;margin-top:2px}',
  '.sc-sticker .sc-act{margin-top:10px;border:0;background:#fff;color:#074226;border-radius:10px;padding:8px 14px;font:700 13px Figtree,sans-serif;cursor:pointer}',
  '.sc-text{background:#fff;border-radius:4px 16px 16px 16px;padding:10px 14px;font-size:15px;line-height:21px}',
  '.sc-item{display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:10px;cursor:pointer}',
  '.sc-item img{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0}',
  '.sc-item div{flex:1;min-width:0}',
  '.sc-item b{display:block;font-weight:600;font-size:15px}',
  '.sc-item i{display:block;font-style:normal;color:#6e6e69;font-size:13px}',
  '.sc-item em{display:block;font-style:normal;color:#0e6b3b;font-size:13px}',
  '.sc-item svg,.sc-cmp svg{width:18px;height:18px;color:#6e6e69;flex-shrink:0}',
  '.sc-note{display:flex;align-items:center;gap:6px;color:#6e6e69;font-size:13px}',
  '.sc-note svg{width:14px;height:14px}',
  '.sc-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:#6e6e69}',
  '.sc-why{background:none;border:0;padding:0;color:#0e6b3b;font:600 13px Figtree,sans-serif;text-decoration:underline;cursor:pointer}',
  '.sc-thumbs{display:flex;gap:8px}',
  '.sc-thumbs button{width:34px;height:34px;border-radius:999px;border:1px solid #e0e0dc;background:#fff;padding:7px;cursor:pointer;color:#3b3b38}',
  '.sc-thumbs button.on{background:#074226;color:#fff;border-color:#074226}',
  '.sc-cmps{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
  '.sc-cmp{background:#fff;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px;cursor:pointer;border:1.5px solid transparent}',
  '.sc-cmp.best{border-color:#19A35A}',
  '.sc-cmp img{width:100%;height:76px;object-fit:cover;border-radius:8px}',
  '.sc-cmp b{font-weight:600;font-size:14px;line-height:18px}',
  '.sc-cmp i{font-style:normal;color:#6e6e69;font-size:12px;margin-top:-4px}',
  '.sc-cmp dl{margin:0;border-top:1px solid #ecece8;padding-top:6px;display:grid;grid-template-columns:auto 1fr;gap:3px 6px;font-size:12px}',
  '.sc-cmp dt{color:#6e6e69}.sc-cmp dd{margin:0;text-align:right;font-weight:600}',
  '.sc-typing{align-self:flex-start;display:inline-flex;gap:4px;background:#fff;border-radius:4px 16px 16px 16px;padding:12px 14px}',
  '.sc-typing i{width:7px;height:7px;border-radius:999px;background:#19A35A;animation:sc-dot 1s infinite ease-in-out}',
  '.sc-typing i:nth-child(2){animation-delay:.15s}.sc-typing i:nth-child(3){animation-delay:.3s}',
  '@keyframes sc-dot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}',
  '@keyframes sc-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
  '.sc-input{padding:10px 16px 28px;background:#f5f5f2}',
  '.sc-field{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e0e0dc;border-radius:999px;padding:4px 4px 4px 16px}',
  '.sc-field input{flex:1;min-width:0;border:0;outline:0;background:none;font:16px Figtree,sans-serif;color:#1a1a18;padding:8px 0}',
  '.sc-field button{width:38px;height:38px;border-radius:999px;border:0;padding:9px;cursor:pointer;flex-shrink:0}',
  '.sc-mic{background:none;color:#3b3b38}.sc-mic.on{background:#e2f5e9;color:#0e6b3b;animation:sc-pulse 1s infinite}',
  '.sc-send{background:#19A35A;color:#fff}',
  '@keyframes sc-pulse{50%{box-shadow:0 0 0 6px rgba(25,163,90,.15)}}'
 ].join('\n');
 document.head.appendChild(css);

 var el=null,list=null,busy=false;
 function phone(){return document.querySelector('.phone');}
 function isChat(){return /^#as-/.test(location.hash);}
 function scroll(){if(list)setTimeout(function(){list.scrollTop=list.scrollHeight;},30);}
 function add(html){var d=document.createElement('div');d.innerHTML=html;var n=d.firstElementChild;list.appendChild(n);scroll();return n;}
 function me(text){add('<div class="sc-me">'+esc(text)+'</div>');}
 function bot(inner){return add('<div class="sc-bot">'+SPROUT+'<div class="sc-body">'+inner+'</div></div>');}
 function chips(items){return '<div class="sc-chips">'+items.map(function(c){return '<button class="sc-chip" data-sc="'+c[0]+'">'+esc(c[1])+'</button>';}).join('')+'</div>';}
 function money(n){return 'SGD '+n.toFixed(2);}
 // Sprout "types" for a moment before answering.
 function reply(build,ms){
  busy=true;var t=add('<div class="sc-bot">'+SPROUT+'<div class="sc-body"><span class="sc-typing"><i></i><i></i><i></i></span></div></div>');
  setTimeout(function(){t.remove();busy=false;build();},ms||1100+Math.random()*500);
 }

 function picks(key){var k=PICKS[key];
  bot('<div class="sc-sticker"><b>'+esc(k.title)+'</b><span>'+esc(k.sub)+'</span></div>'+
   k.items.map(function(it){var p=P[it[0]];return '<div class="sc-item" data-sc-product="'+it[0]+'"><img src="'+p.img+'" alt=""><div><b>'+esc(p.name)+'</b><i>'+esc(p.farmName)+', '+money(p.price)+'</i><em>'+esc(it[1])+'</em></div>'+svg('chev')+'</div>';}).join('')+
   '<div class="sc-note">'+svg('shield')+'Picked from farm-verified listings near you.</div>'+
   '<div class="sc-row"><button class="sc-why" data-sc="why">Why these picks?</button><span class="sc-thumbs">Was this helpful? <button data-sc="up" aria-label="Helpful">'+svg('up')+'</button><button data-sc="down" aria-label="Not helpful">'+svg('down')+'</button></span></div>');
 }
 function compare(key){var c=COMPARE[key];
  function card(side,best){var p=P[side.id];return '<div class="sc-cmp'+(best?' best':'')+'" data-sc-product="'+side.id+'"><img src="'+p.img+'" alt=""><b>'+esc(p.name)+'</b><i>'+esc(p.farmName)+'</i><dl>'+side.rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'</dl></div>';}
  bot('<div class="sc-sticker"><b>'+esc(c.title)+'</b><span>'+esc(c.sub)+'</span></div><div class="sc-cmps">'+card(c.a,c.addId===c.a.id)+card(c.b,c.addId===c.b.id)+'</div>'+
   '<div class="sc-sticker"><b>'+esc(c.pick)+'</b><span>'+esc(c.why)+'</span><button class="sc-act" data-sc-add="'+c.addId+'">'+esc(c.add)+'</button></div>');
 }
 function say(text,extra){bot('<div class="sc-text">'+esc(text)+'</div>'+(extra||''));}

 // What each chip or typed intent does.
 function act(key,label){
  if(busy)return;
  if(label)me(label);
  if(key==='dinner'||key==='breakfast'||key==='cheaper')return reply(function(){picks(key);});
  if(key==='compare')return reply(function(){say('Happy to compare. Which products do you have in mind?',chips([['cmp-honey',COMPARE.honey.q],['cmp-greens',COMPARE.greens.q]]));});
  if(key==='cmp-honey')return reply(function(){compare('honey');},1500);
  if(key==='cmp-greens')return reply(function(){compare('greens');},1500);
  if(key==='why')return reply(function(){say('Why I picked these: they match what you asked for, come from farms that deliver to Singapore 560123, and every detail is from the farms’ verified listings.');},800);
  if(key==='nope')return reply(function(){say('Got it. Tell me what you’re in the mood for, or try one of these.',chips(CHIPS));});
  if(key==='far')return reply(function(){say('All these farms are within 7 km of you, and most deliver tomorrow morning. Want me to stick to the closest ones next time?');});
  if(key==='fish')return reply(function(){say('No fish here, sorry. Our farms grow veggies, honey and dairy. I can help with these:',chips(CHIPS));});
  return reply(function(){say('I can help you find farm food near you. Try one of these:',chips(CHIPS));});
 }
 function intent(text){var t=text.toLowerCase();
  if(/fish|meat|chicken|beef|pork|prawn|seafood/.test(t))return 'fish';
  if(/compar|\bvs\b|versus|\bor\b/.test(t))return 'compare';
  if(/breakfast|morning|toast/.test(t))return 'breakfast';
  if(/cheap|budget|price|afford/.test(t))return 'cheaper';
  if(/dinner|cook|tonight|lunch|meal|recipe|salad|pasta/.test(t))return 'dinner';
  return null;
 }
 // Typed questions: try the real Sprout AI first, fall back to the scripted replies.
 function ask(text){
  if(busy||!text.trim())return;me(text);var key=intent(text);
  var done=false,t0=Date.now();
  busy=true;var typing=add('<div class="sc-bot">'+SPROUT+'<div class="sc-body"><span class="sc-typing"><i></i><i></i><i></i></span></div></div>');
  function fallback(){if(done)return;done=true;typing.remove();busy=false;act(key||'other');}
  var ctl=window.AbortController?new AbortController():null;var timer=setTimeout(function(){if(ctl)ctl.abort();fallback();},9000);
  fetch('/api/sprout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,name:who()}),signal:ctl&&ctl.signal})
   .then(function(r){return r.ok?r.json():null;})
   .then(function(j){clearTimeout(timer);if(done)return;if(!j||!j.reply)return fallback();
    var wait=Math.max(0,900-(Date.now()-t0));setTimeout(function(){if(done)return;done=true;typing.remove();busy=false;
     var ids=(j.products||[]).filter(function(i){return P[i];}).slice(0,3);
     say(j.reply,ids.map(function(i){var p=P[i];return '<div class="sc-item" data-sc-product="'+i+'"><img src="'+p.img+'" alt=""><div><b>'+esc(p.name)+'</b><i>'+esc(p.farmName)+', '+money(p.price)+'</i></div>'+svg('chev')+'</div>';}).join('')+
      (ids.length?'<div class="sc-note">'+svg('shield')+'From farm-verified listings near you.</div>':''));},wait);})
   .catch(function(){clearTimeout(timer);fallback();});
 }

 function build(){
  el=document.createElement('div');el.className='sc-screen';el.setAttribute('data-name','Sprout chat');
  el.innerHTML='<div class="sc-top"><button data-sc="back" aria-label="Back">'+svg('back')+'</button><b>Ask Sprout AI</b></div><div class="sc-list"></div>'+
   '<div class="sc-input"><div class="sc-field"><input type="text" placeholder="Ask Sprout anything" enterkeyhint="send" aria-label="Message Sprout"><button class="sc-mic" data-sc="mic" aria-label="Speak">'+svg('mic')+'</button><button class="sc-send" data-sc="send" aria-label="Send">'+svg('send')+'</button></div></div>';
  list=el.querySelector('.sc-list');
  add('<div class="sc-hello">'+SPROUT+'<h2>Hi '+esc(who())+', what are you cooking tonight?</h2><p>I’ll find it from farms near you</p></div>');
  add(chips(CHIPS));
  add('<div class="sc-note" style="justify-content:center">'+svg('shield')+'Picks come from farm-verified listings near you</div>');
  el.addEventListener('click',onClick);
  el.querySelector('input').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();send();}});
 }
 function send(){var i=el.querySelector('input');var v=i.value;i.value='';ask(v);}
 function open(product){setRaw(PRODUCT,product);var p=P[product];if(p)setRaw(FARM,p.farm);location.hash='#product';}
 function onClick(e){
  var t=e.target;e.stopPropagation();
  var b=t.closest('[data-sc]');var prod=t.closest('[data-sc-product]');var addB=t.closest('[data-sc-add]');
  if(addB){setRaw(BASKET,addB.getAttribute('data-sc-add'));location.hash='#basket';return;}
  if(prod)return open(prod.getAttribute('data-sc-product'));
  if(!b)return;var k=b.getAttribute('data-sc');
  if(k==='back'){location.hash='#home';return;}
  if(k==='send')return send();
  if(k==='mic'){if(busy||b.classList.contains('on'))return;var i=el.querySelector('input');b.classList.add('on');i.placeholder='Listening…';
   setTimeout(function(){i.value='Dinner ideas';},900);setTimeout(function(){b.classList.remove('on');i.placeholder='Ask Sprout anything';send();},1700);return;}
  if(k==='up'||k==='down'){var box=b.parentElement;if(box.querySelector('.on'))return;b.classList.add('on');
   if(k==='up')return reply(function(){say('Glad that helped. Tap a pick to see the farm’s details.');},700);
   return reply(function(){say('Oops, my bad. What was off?',chips([['nope','Not what I wanted'],['cheaper','Too pricey'],['far','Not nearby']]));},800);}
  if(k==='nope'||k==='cheaper'||k==='far'){return act(k,b.textContent);}
  act(k,b.textContent);
 }

 function sync(){
  var ph=phone();if(!ph)return;
  if(isChat()){if(!el)build();if(el.parentNode!==ph)ph.appendChild(el);el.style.display='';}
  else if(el){el.style.display='none';}
 }
 window.addEventListener('hashchange',function(){setTimeout(sync,0);});
 new MutationObserver(function(){if(isChat()&&(!el||!el.isConnected||el.style.display==='none'))sync();}).observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',sync);
})();

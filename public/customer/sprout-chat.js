// Ask Sprout AI and the farm chats as running conversations (shown over the "as-" and "ch-"
// screens, same layout as the Figma screens).
// - Your message appears first, Sprout "types" for a moment, then answers.
// - Every earlier chip and pick stays tappable, and you can type your own question.
// - Ask Sprout: Compare products asks which products first; Back returns to Home.
// - Farm chats: Sprout answers from the farm's verified info, and hands anything else to the
//   farmer, who replies a few seconds later.
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

 var ICON={clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',tag:'<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',back:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 19v3"/>',send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',chev:'<path d="m9 18 6-6-6-6"/>',up:'<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 3 3.9Z"/>',down:'<path d="M17 14V2"/><path d="M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.6 2H17v12l-4 8a3 3 0 0 1-3-3.9Z"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/>'};
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
  '.sc-chip{border:1px solid #e0e0dc;background:#fff;color:#3b3b38;border-radius:999px;padding:10px 18px;font:600 15px/20px Figtree,sans-serif;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04);animation:sc-pop .35s cubic-bezier(.3,1.4,.5,1) backwards}',
  '.sc-chip:nth-child(3n+1){transform:rotate(-2deg)}.sc-chip:nth-child(3n+2){transform:rotate(1.5deg);animation-delay:.08s}.sc-chip:nth-child(3n){transform:rotate(-1deg);animation-delay:.16s}',
  '.sc-chip:active{filter:brightness(.96)}',
  '.sc-hello+.sc-chips{justify-content:center;gap:10px 12px;padding:4px 8px}',
  '.sc-list.sc-empty{justify-content:center;padding-bottom:80px}',
  '@keyframes sc-pop{from{opacity:0;scale:.85}to{opacity:1;scale:1}}',
  '.sc-trust{display:flex;gap:8px;align-items:flex-start;background:#fff;border-radius:12px;padding:10px 12px;font-size:13px;line-height:18px;color:#3b3b38}',
  '.sc-trust svg{width:16px;height:16px;flex-shrink:0;margin-top:1px;color:#3b3b38}',
  '.sc-day{text-align:center;color:#6e6e69;font-size:13px}',
  '.sc-card{background:#fff;border:1px solid #ecece8;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;animation:sc-in .35s ease-out}',
  '.sc-card .sc-ch{display:flex;align-items:center;gap:10px}',
  '.sc-card .sc-ch img{width:40px;height:40px;border-radius:999px;object-fit:cover}',
  '.sc-card .sc-ch div{flex:1}.sc-card .sc-ch i{display:block;font-style:normal;color:#6e6e69;font-size:12px}.sc-card .sc-ch b{font-size:14px}',
  '.sc-card .sc-tag{width:32px;height:32px;border-radius:999px;background:#f97316;color:#fff;padding:7px}',
  '.sc-card h3{margin:0;font:700 20px/26px "Bricolage Grotesque",sans-serif}',
  '.sc-card p{margin:0;color:#6e6e69;font-size:13px;line-height:18px}',
  '.sc-card .sc-photo{width:100%;height:150px;object-fit:cover;border-radius:12px}',
  '.sc-card .sc-big{border:0;border-radius:12px;background:#074226;color:#fff;padding:14px;font:700 16px Figtree,sans-serif;cursor:pointer}',
  '.sc-card .sc-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
  '.sc-card .sc-two button{border:1px solid #c9c9c4;background:#fff;border-radius:10px;padding:9px;font:600 14px Figtree,sans-serif;cursor:pointer;color:#1a1a18}',
  '.sc-farmer{align-self:flex-start;max-width:85%;background:#fff;border-radius:4px 16px 16px 16px;padding:10px 14px;font-size:15px;line-height:21px;animation:sc-in .3s ease-out}',
  '.sc-farmer small{display:block;color:#6e6e69;font-size:12px;margin-top:4px}',
  '.sc-wait{display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:10px 12px;font-size:13px;margin-left:36px}',
  '.sc-wait svg{width:18px;height:18px}.sc-wait b{display:block;font-weight:600}.sc-wait i{font-style:normal;color:#6e6e69}',
  '.sc-green svg,.sc-card .sc-two svg{width:15px;height:15px;vertical-align:-3px;margin-right:6px}',
  '.sc-green{align-self:flex-start;border:0;border-radius:10px;background:#19A35A;color:#fff;padding:9px 14px;font:700 13px Figtree,sans-serif;cursor:pointer}',
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

 function money(n){return 'SGD '+n.toFixed(2);}
 var FARMS={
  gv:{name:'Green Valley Farm',who:'Alex',slot:'tomorrow, 9am – 12pm',logo:'a/18b50773-654f-40c8-a7d9-c73143231805.jpg',fresh:['tea','gv-honey'],
   allergens:'Lemongrass tea has no common allergens. Wildflower honey isn’t suitable for babies under 1.',
   chips:[['fresh','What’s fresh this week?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']]},
  hh:{name:'Happy Hill Farm',who:'Raj',slot:'tomorrow, 2pm – 6pm',fresh:['milk','cheese'],
   allergens:'The goat milk and goat cheese contain milk. Nothing else on the list.',
   chips:[['today','Is the goat milk in today?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']],
   today:'Yes, bottled this morning. 14 bottles left today.'},
  bg:{name:'Bee Good Apiary',who:'Nadia',slot:'tomorrow, 10am – 1pm',fresh:['jam','honey'],
   allergens:'Honey and apricot jam have no common allergens. Honey isn’t suitable for babies under 1.',
   chips:[['fresh','What’s fresh this week?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']]},
  rb:{name:'Riverbend Farm',who:'Wei Ling',slot:'tomorrow, 9am – 12pm',fresh:['spinach'],
   allergens:'Fresh greens only, so no common allergens.',
   chips:[['fresh','What’s fresh this week?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']]},
  ff:{name:'Field and Flour',who:'Farah',slot:'tomorrow, 7am – 10am',fresh:['sourdough'],
   allergens:'The sourdough contains wheat (gluten). Nothing else on the list.',
   chips:[['today','Is it baked today?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']],
   today:'Yes, baked before sunrise today. 9 loaves left.'},
  kp:{name:'Kampung Pantry',who:'Rosnah',slot:'tomorrow, 2pm – 6pm',fresh:['kaya','sambal'],
   allergens:'The kaya contains egg and coconut. The sambal contains shrimp.',
   chips:[['fresh','What’s fresh this week?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']]},
  sg:{name:'Sunrise Greens',who:'Jun Hao',slot:'tomorrow, 9am – 12pm',fresh:['microgreens','lettuce'],
   allergens:'Microgreens and lettuce, so no common allergens.',
   chips:[['fresh','What’s fresh this week?'],['deliver','Do you deliver to me?'],['allergens','Any allergens?']]}
 };

 // One conversation view. kind is 'sprout' (Ask Sprout AI) or a farm id.
 function Chat(kind){
  var self=this;this.kind=kind;var farm=FARMS[kind];var busy=false;
  var el=document.createElement('div');el.className='sc-screen';el.setAttribute('data-name',farm?'Farm chat':'Sprout chat');
  el.innerHTML='<div class="sc-top"><button data-sc="back" aria-label="Back">'+svg('back')+'</button><b>'+esc(farm?farm.name:'Ask Sprout AI')+'</b></div><div class="sc-list"></div>'+
   '<div class="sc-input"><div class="sc-field"><input type="text" placeholder="'+esc(farm?'Message '+farm.name:'Ask Sprout anything')+'" enterkeyhint="send" aria-label="Message"><button class="sc-mic" data-sc="mic" aria-label="Speak">'+svg('mic')+'</button><button class="sc-send" data-sc="send" aria-label="Send">'+svg('send')+'</button></div></div>';
  var list=el.querySelector('.sc-list');this.el=el;
  function scroll(){setTimeout(function(){list.scrollTop=list.scrollHeight;},30);}
  function add(html){var d=document.createElement('div');d.innerHTML=html;var n=d.firstElementChild;list.appendChild(n);scroll();return n;}
  function me(text){list.classList.remove('sc-empty');add('<div class="sc-me">'+esc(text)+'</div>');}
  function bot(inner){return add('<div class="sc-bot">'+SPROUT+'<div class="sc-body">'+inner+'</div></div>');}
  function say(text,extra){return bot('<div class="sc-text">'+esc(text)+'</div>'+(extra||''));}
  function sticker(t,sub,extra){return bot('<div class="sc-sticker"><b>'+esc(t)+'</b><span>'+esc(sub)+'</span>'+(extra||'')+'</div>');}
  function chips(items){return '<div class="sc-chips">'+items.map(function(c){return '<button class="sc-chip" data-sc="'+c[0]+'">'+esc(c[1])+'</button>';}).join('')+'</div>';}
  function item(id,tip){var p=P[id];return '<div class="sc-item" data-sc-product="'+id+'"><img src="'+p.img+'" alt=""><div><b>'+esc(p.name)+'</b><i>'+esc(p.farmName)+', '+money(p.price)+'</i>'+(tip?'<em>'+esc(tip)+'</em>':'')+'</div>'+svg('chev')+'</div>';}
  function typing(){return add('<div class="sc-bot">'+SPROUT+'<div class="sc-body"><span class="sc-typing"><i></i><i></i><i></i></span></div></div>');}
  // Sprout "types" for a moment before answering.
  function reply(build,ms){busy=true;var t=typing();setTimeout(function(){t.remove();busy=false;build();},ms||1100+Math.random()*500);}

  // ----- Ask Sprout AI -----
  function picks(key){var k=PICKS[key];
   bot('<div class="sc-sticker"><b>'+esc(k.title)+'</b><span>'+esc(k.sub)+'</span></div>'+k.items.map(function(it){return item(it[0],it[1]);}).join('')+
    '<div class="sc-note">'+svg('shield')+'Picked from farm-verified listings near you.</div>'+
    '<div class="sc-row"><button class="sc-why" data-sc="why">Why these picks?</button><span class="sc-thumbs">Was this helpful? <button data-sc="up" aria-label="Helpful">'+svg('up')+'</button><button data-sc="down" aria-label="Not helpful">'+svg('down')+'</button></span></div>');
  }
  function compare(key){var c=COMPARE[key];
   function card(side,best){var p=P[side.id];return '<div class="sc-cmp'+(best?' best':'')+'" data-sc-product="'+side.id+'"><img src="'+p.img+'" alt=""><b>'+esc(p.name)+'</b><i>'+esc(p.farmName)+'</i><dl>'+side.rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'</dl></div>';}
   bot('<div class="sc-sticker"><b>'+esc(c.title)+'</b><span>'+esc(c.sub)+'</span></div><div class="sc-cmps">'+card(c.a,c.addId===c.a.id)+card(c.b,c.addId===c.b.id)+'</div>'+
    '<div class="sc-sticker"><b>'+esc(c.pick)+'</b><span>'+esc(c.why)+'</span><button class="sc-act" data-sc-add="'+c.addId+'">'+esc(c.add)+'</button></div>');
  }
  function sproutAct(key){
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
  function sproutIntent(text){var t=text.toLowerCase();
   if(/fish|meat|chicken|beef|pork|prawn|seafood/.test(t))return 'fish';
   if(/compar|\bvs\b|versus|\bor\b/.test(t))return 'compare';
   if(/breakfast|morning|toast/.test(t))return 'breakfast';
   if(/cheap|budget|price|afford/.test(t))return 'cheaper';
   if(/dinner|cook|tonight|lunch|meal|recipe|salad|pasta/.test(t))return 'dinner';
   return 'other';
  }

  // ----- Farm chats -----
  function more(skip){return farm.chips.filter(function(c){return c[0]!==skip;}).concat([['farmer','Ask '+farm.who+' directly']]);}
  function verified(){return '<div class="sc-note">'+svg('shield')+'From '+esc(farm.name)+'’s verified info</div>';}
  function handoff(question,special){
   reply(function(){
    sticker('That one’s for '+farm.who,'I’ve passed it to '+farm.name+'. They usually reply within 3 hours, and I’ll ping you.');
    var w=add('<div class="sc-wait">'+svg('clock')+'<div><b>Waiting for '+esc(farm.name)+'</b><i>Sent just now</i></div></div>');
    busy=true;
    setTimeout(function(){busy=false;w.querySelector('i').textContent=farm.who+' replied';
     if(special==='cheese'){add('<div class="sc-farmer">Mild and creamy. My kids eat it on toast every morning. Only 8 left this week.<small>'+esc(farm.who+', '+farm.name)+'</small></div>');add('<button class="sc-green" data-sc-add="cheese">'+svg('plus')+'Add goat cheese, SGD 9.80</button>');}
     else add('<div class="sc-farmer">Hi! Thanks for asking. Let me check and I’ll get back to you today.<small>'+esc(farm.who+', '+farm.name)+'</small></div>');
    },4200);
   });
  }
  function farmAct(key,text){
   if(key==='deliver')return reply(function(){say('Yes, '+farm.name+' delivers to Singapore 560123. Next slot: '+farm.slot+'.',verified()+chips(more('deliver')));});
   if(key==='allergens')return reply(function(){say(farm.allergens,verified()+chips(more('allergens')));});
   if(key==='today')return reply(function(){say(farm.today,verified()+chips(more('today')));});
   if(key==='fresh')return reply(function(){say('Packed this week at '+farm.name+':',farm.fresh.map(function(i){return item(i);}).join('')+verified()+chips(more('fresh')));});
   if(key==='farmer')return reply(function(){say('Sure. Type your question below and I’ll pass it to '+farm.who+'.');},700);
   if(key==='cheese')return handoff(text,'cheese');
   return handoff(text);
  }
  function farmIntent(text){var t=text.toLowerCase();
   if(/deliver|delivery|ship|send to/.test(t))return 'deliver';
   if(/allerg|gluten|nut|dairy|vegan/.test(t))return 'allergens';
   if(farm.today&&/today|fresh today|baked|in stock/.test(t))return 'today';
   if(/fresh|this week|what do you (have|sell)/.test(t))return 'fresh';
   if(/goat cheese.*(mild|strong)|(mild|strong).*goat cheese/.test(t))return 'cheese';
   return 'other';
  }

  // ----- Start -----
  if(farm){
   add('<div class="sc-trust">'+svg('shield')+'<span>Sprout AI answers from the farm’s verified info. '+esc(farm.who)+' handles the rest and usually replies within 3 hours.</span></div>');
   add('<div class="sc-day">Today</div>');
   reply(function(){
    if(kind==='gv'){sticker(farm.name+' added to Liked','Message '+farm.who+' any time before you order. They left you a welcome deal.');
     add('<div class="sc-card"><div class="sc-ch"><img src="'+farm.logo+'" alt=""><div><i>Welcome deal</i><b>From '+esc(farm.name)+'</b></div><span class="sc-tag">'+svg('tag')+'</span></div><h3>10% off your first order</h3><p>Applied at checkout. Ends 16 Nov.</p><button class="sc-big" data-sc="shop">Shop Green Valley</button></div>');}
    else{sticker('Hi '+who()+', I’m Sprout AI','Ask me anything about '+farm.name);
     if(kind==='hh')add('<div class="sc-card"><div class="sc-row"><b style="color:#1a1a18;font-size:14px">Farm update</b><span>10:42</span></div><img class="sc-photo" src="/preset/shop-cheese-studio.jpg" alt=""><div><b>Just restocked goat cheese</b><p>8 left</p><p style="color:#3b3b38">Made from this week’s milk, mild and creamy.</p></div><div class="sc-two"><button data-sc-add="cheese">'+svg('cart')+'Add to basket</button><button data-sc="ask-cheese">'+svg('chat')+'Ask the farmer</button></div></div>');}
    add(chips(farm.chips));
   },900);
  }else{
   list.classList.add('sc-empty');
   add('<div class="sc-hello">'+SPROUT+'<h2>Hi '+esc(who())+', what are you cooking tonight?</h2><p>I’ll find it from farms near you</p></div>');
   add(chips(CHIPS));
  }

  function act(key,label){
   if(busy)return;if(label)me(label);
   if(farm)return farmAct(key,label);return sproutAct(key);
  }
  // Typed questions: try the real Sprout AI first, fall back to the scripted replies.
  function ask(text){
   if(busy||!text.trim())return;me(text);
   var key=farm?farmIntent(text):sproutIntent(text);
   if(farm&&key!=='other')return farmAct(key,text);
   var done=false,t0=Date.now();busy=true;var t=typing();
   function fallback(){if(done)return;done=true;t.remove();busy=false;if(farm)farmAct('other',text);else sproutAct(key);}
   var ctl=window.AbortController?new AbortController():null;var timer=setTimeout(function(){if(ctl)ctl.abort();fallback();},9000);
   fetch('/api/sprout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,name:who(),farm:farm?kind:null}),signal:ctl&&ctl.signal})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(j){clearTimeout(timer);if(done)return;if(!j||!j.reply)return fallback();
     if(farm&&j.handoff)return fallback();
     var wait=Math.max(0,900-(Date.now()-t0));setTimeout(function(){if(done)return;done=true;t.remove();busy=false;
      var ids=(j.products||[]).filter(function(i){return P[i];}).slice(0,3);
      say(j.reply,ids.map(function(i){return item(i);}).join('')+(ids.length||farm?(farm?verified():'<div class="sc-note">'+svg('shield')+'From farm-verified listings near you.</div>'):''));},wait);})
    .catch(function(){clearTimeout(timer);fallback();});
  }
  function send(){var i=el.querySelector('input');var v=i.value;i.value='';ask(v);}
  el.querySelector('input').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();send();}});
  el.addEventListener('click',function(e){
   var t=e.target;e.stopPropagation();
   var b=t.closest('[data-sc]');var prod=t.closest('[data-sc-product]');var addB=t.closest('[data-sc-add]');
   if(addB){setRaw(BASKET,addB.getAttribute('data-sc-add'));location.hash='#basket';return;}
   if(prod){var id=prod.getAttribute('data-sc-product');setRaw(PRODUCT,id);if(P[id])setRaw(FARM,P[id].farm);location.hash='#product';return;}
   if(!b)return;var k=b.getAttribute('data-sc');
   if(k==='back'){if(farm){var bk=document.querySelector('.screen [data-name="Back"]');if(bk)bk.click();else history.back();}else location.hash='#home';return;}
   if(k==='send')return send();
   if(k==='shop'){location.hash='#farm-'+kind;return;}
   if(k==='ask-cheese')return act('cheese','Is the goat cheese mild or strong?');
   if(k==='mic'){if(busy||b.classList.contains('on'))return;var i=el.querySelector('input');b.classList.add('on');var ph=i.placeholder;i.placeholder='Listening…';
    setTimeout(function(){i.value=farm?farm.chips[1][1]:'Dinner ideas';},900);setTimeout(function(){b.classList.remove('on');i.placeholder=ph;send();},1700);return;}
   if(k==='up'||k==='down'){var box=b.parentElement;if(box.querySelector('.on'))return;b.classList.add('on');
    if(k==='up')return reply(function(){say('Glad that helped. Tap a pick to see the farm’s details.');},700);
    return reply(function(){say('Oops, my bad. What was off?',chips([['nope','Not what I wanted'],['cheaper','Too pricey'],['far','Not nearby']]));},800);}
   act(k,b.textContent);
  });
 }

 // Which conversation belongs to the current screen. The app changes screens without a
 // hashchange, so we watch the screen name.
 var chats={},current=null,pendingFarm=null,returnTo=null,prevScreen='',lastScreen='';
 var SCREEN_FARM={'ch-gv':'gv','ch-hh':'hh','ch-ask':'hh','ch-wait':'hh','ch-replied':'hh','ch-sprout':'ff'};
 function scr(){var s=document.querySelector('.screen');return s?s.getAttribute('data-screen')||'':'';}
 function kindFor(s,prev){
  if(/^as-/.test(s))return 'sprout';
  if(!/^ch-/.test(s)||s==='ch-list')return null;
  if(pendingFarm){var f=pendingFarm;pendingFarm=null;return f;}
  if(returnTo&&returnTo.screen===s){var k=returnTo.kind;returnTo=null;return k;}
  var m=/^farm-(\w+)/.exec(prev);if(m&&FARMS[m[1]])return m[1];
  if(prev==='product'){try{var pf=sessionStorage.getItem(FARM);if(FARMS[pf])return pf;}catch(e){}}
  return SCREEN_FARM[s]||'gv';
 }
 function phone(){return document.querySelector('.phone');}
 function show(kind){
  var ph=phone();if(!ph)return;
  Object.keys(chats).forEach(function(k){if(k!==kind)chats[k].el.style.display='none';});
  if(!kind){current=null;return;}
  if(!chats[kind])chats[kind]=new Chat(kind);
  var c=chats[kind];if(c.el.parentNode!==ph)ph.appendChild(c.el);c.el.style.display='';current=kind;
 }
 function check(){
  var s=scr();if(!s)return;
  if(s!==lastScreen){
   // Leaving a chat for a product, basket or farm page: come back to the same chat.
   if(current&&/^(as|ch)-/.test(lastScreen)&&!/^(as|ch)-/.test(s))returnTo={screen:lastScreen,kind:current};
   prevScreen=lastScreen;lastScreen=s;show(kindFor(s,prevScreen));return;
  }
  if(current&&!chats[current].el.isConnected)show(current);
 }
 // Chat list rows open the right farm's chat.
 var ROW_FARM={'Green Valley Farm':'gv','Happy Hill Farm':'hh','Riverbend Farm':'rb','Bee Good Apiary':'bg','Field and Flour':'ff','Kampung Pantry':'kp','Sunrise Greens':'sg'};
 window.addEventListener('click',function(e){
  if(scr()!=='ch-list'||!e.target.closest)return;var row=e.target.closest('[data-name="Chat row"]');if(!row)return;
  for(var n in ROW_FARM)if(row.textContent.indexOf(n)>=0){pendingFarm=ROW_FARM[n];break;}
 },true);
 var queued=false;
 new MutationObserver(function(){if(queued)return;queued=true;setTimeout(function(){queued=false;check();},0);}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-screen']});
 document.addEventListener('DOMContentLoaded',check);
})();

// Showcase fixes for the shopper prototype (loaded after the other add-on scripts).
// - Onboarding: the name starts empty and is used everywhere "Minh" appears; food and
//   growing choices start unpicked; Sprout reacts to the growing choice the shopper picks.
// - Hearts on product cards and the product page work and are remembered for this visit.
// - Category screens use the same card size as Home.
// - Basket: nothing is ticked at first; ticking items updates the total, deal and checkout count.
// - Product and farm pages: "Hear Alex" plays the farmer's story aloud.
(function(){
 var NAME='farmily-customer-name',LIKES='farmily-customer-likes',PICKS='farmily-customer-picks',TICKS='farmily-customer-ticks';
 function get(k,d){try{var v=sessionStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
 function put(k,v){try{sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}}
 function scr(){var s=document.querySelector('.screen');return s?s.getAttribute('data-screen')||'':'';}
 function root(){return document.querySelector('.screen');}
 function setText(el,v){if(el&&el.textContent!==v)el.textContent=v;}
 function money(n){return 'SGD '+(Math.round(n*100)/100).toFixed(2);}
 var heart="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23074226' stroke='%23074226' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z'/%3E%3C/svg%3E";
 var tick="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E";
 var style=document.createElement('style');
 style.textContent=[
  '[data-screen="gs-name"] [data-name="Field"] p:empty::before{content:"Your name";color:#a3a39e}',
  '[data-screen="gs-name"] [data-name="Field"].fx-need{border-color:#c2410c!important;animation:fx-shake .3s}',
  '@keyframes fx-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}',
  // Hearts: the card's "Local favourite" ring no longer covers the heart button.
  '[data-name="Favourite ring"]{pointer-events:none}',
  '.fx-heart.fx-liked>*{opacity:0}',
  '.fx-heart.fx-liked::after{content:"";position:absolute;inset:0;margin:auto;width:58%;height:58%;background:url("'+heart+'") center/contain no-repeat;animation:fx-pop .25s ease-out}',
  '@keyframes fx-pop{50%{transform:scale(1.25)}}',
  // Category and search screens: same card size as Home (262px tall, 120px photo, price at the bottom).
  '.br-grid{align-items:stretch}',
  '.br-card{display:flex;flex-direction:column;height:262px}',
  '.br-img{height:120px;flex-shrink:0}',
  '.br-body{flex:1;min-height:0}',
  '.br-foot{margin-top:auto}',
  // Basket: our own tick boxes, and no "This basket feeds 2 farms" line.
  '[data-screen="basket"] [data-name="Feeds farms"]{display:none!important}',
  '.fx-cb{cursor:pointer}',
  '.fx-cb [data-name="Box"]{background:#fff!important;border:1.5px solid #c9c9c4!important}',
  '.fx-cb [data-name="Box"] *{display:none!important}',
  '.fx-cb.fx-on [data-name="Box"]{background:#074226 url("'+tick+'") center/14px no-repeat!important;border-color:#074226!important}',
  '.fx-cb.fx-off-limits{opacity:.4;cursor:default}',
  '.fx-blocked{opacity:.45;pointer-events:auto}',
  // Product photo: horizontal swipes go to the photo, not the page scroll.
  '.screen [data-name="Hero"]{touch-action:pan-y}'
 ].join('\n');
 document.head.appendChild(style);

 // ---------- Name ----------
 function field(){var r=root();return r&&r.querySelector('[data-name="Field"] p');}
 function nameFix(r){
  if(scr()==='gs-name'){var f=field();if(f&&!f.dataset.fxName){f.dataset.fxName='1';setText(f,get(NAME,''));}return;}
  var n=get(NAME,'');if(!n)return;
  var w=document.createTreeWalker(document.querySelector('.phone')||r,NodeFilter.SHOW_TEXT,null);var t;
  while((t=w.nextNode())){if(t.nodeValue.indexOf('Minh')>=0&&!(t.parentElement&&t.parentElement.isContentEditable))t.nodeValue=t.nodeValue.replace(/\bMinh\b/g,n);}
 }
 document.addEventListener('keydown',function(e){
  if(scr()!=='gs-name'||e.key!=='Enter'||!e.target.isContentEditable)return;
  e.preventDefault();var b=document.querySelector('.screen [data-node-id="1492:5183"]');if(b)b.click();
 },true);

 // ---------- Onboarding picks ----------
 var SPROUT={
  'Organic':'Organic, nice. I’ll look for farms with certified organic produce.',
  'Low waste':'Low waste? I’ll point you to farms that compost and skip the plastic.',
  'Sustainable':'Sustainable it is. I’ll favour farms that look after their land.',
  'Biodiversity friendly':'Biodiversity friendly? You like farms buzzing with life. Me too.',
  'Traditional':'Traditional ways? I know a few farms still doing it by hand.',
  'Ethical':'Ethical matters to you. I’ll show farms that treat people and animals well.',
  'Regenerative':'Regenerative too? You care about the soil. I like you already.',
  'Fresh and seasonal':'Fresh and seasonal? I’ll show you what’s picked this week.',
  'Community focused':'Community focused? I’ll find farms that give back to the neighbourhood.',
  'Natural methods':'Natural methods? I’ll look for farms that skip harsh chemicals.'
 };
 var START='Pick what matters to you. I’ll find farms that grow food your way.';
 var ORIGINAL='Regenerative too? You care about the soil. I like you already.';
 function opts(){
  var s=scr(),r=root();if(!r)return [];
  if(s==='gs-interests')return [].map.call(r.querySelectorAll('[data-name="Interest tile"]'),function(el){return {el:el,label:el.textContent.trim(),baked:/border-3/.test(el.className)};});
  if(s==='gs-values')return [].map.call(r.querySelectorAll('[data-name="Chip"]'),function(el){return {el:el,label:el.textContent.trim(),baked:/primary-900/.test(el.className)};});
  return [];
 }
 function on(o){return o.baked!==o.el.classList.contains('flip');}
 function picksInit(r){
  var s=scr();if(s!=='gs-interests'&&s!=='gs-values')return;
  var top=r.firstElementChild;if(!top||top.dataset.fxPicks)return;top.dataset.fxPicks='1';
  var saved=(get(PICKS,{})[s])||[];
  opts().forEach(function(o){var want=saved.indexOf(o.label)>=0;if(on(o)!==want)o.el.classList.toggle('flip');});
  if(s==='gs-values')say(saved.length?saved[saved.length-1]:null);
 }
 function bubble(){var r=root();if(!r)return null;var hit=r.querySelector('[data-fx-sprout]');if(hit)return hit;
  var ps=r.querySelectorAll('p');for(var i=0;i<ps.length;i++){var t=ps[i].textContent.trim();if(t===ORIGINAL||t===START){ps[i].setAttribute('data-fx-sprout','1');return ps[i];}}return null;}
 function say(label){var b=bubble();if(b)setText(b,label&&SPROUT[label]?SPROUT[label]:START);}
 function picksSave(clicked){
  var s=scr(),all=get(PICKS,{}),order=(all[s]||[]).slice();
  opts().forEach(function(o){var i=order.indexOf(o.label);if(on(o)&&i<0)order.push(o.label);if(!on(o)&&i>=0)order.splice(i,1);});
  if(clicked){var i=order.indexOf(clicked);if(i>=0){order.splice(i,1);order.push(clicked);}}
  all[s]=order;put(PICKS,all);
  if(s==='gs-values')say(order.length?order[order.length-1]:null);
 }

 // ---------- Hearts ----------
 var NAMES=['Raw wildflower honey','Wildflower Honey','Lemongrass Tea','Fresh spinach','Goat milk','Goat cheese','Sourdough loaf','Apricot jam','Pandan kaya','Sambal belacan','Microgreens','Butterhead lettuce'];
 var HEARTS='[data-name="Favourite"],.br-fav,.fp-heart,[data-node-id="1447:3377"]';
 function productOf(h){
  if(h.matches('[data-node-id="1447:3377"]')){var n=document.querySelector('.screen [data-node-id="1673:7018"]');return n?n.textContent.trim():null;}
  var card=h.closest('[data-name="Product card"],.br-card,[data-name="FP product"],[data-name="Swipe card"]');if(!card)return null;var t=card.textContent;
  for(var i=0;i<NAMES.length;i++)if(t.indexOf(NAMES[i])>=0)return NAMES[i];return null;
 }
 function heartsPaint(){
  var liked=get(LIKES,[]);
  document.querySelectorAll(HEARTS).forEach(function(h){var p=productOf(h);if(!p)return;h.classList.add('fx-heart');h.classList.toggle('fx-liked',liked.indexOf(p)>=0);});
 }

 // ---------- Basket ----------
 function basketItems(r){
  return [].map.call(r.querySelectorAll('[data-name="Item"]'),function(it){
   var farm=it.closest('[data-name^="Farm · "]');var t=it.textContent;
   var name=null;for(var i=0;i<NAMES.length;i++)if(t.indexOf(NAMES[i])>=0){name=NAMES[i];break;}
   var price=parseFloat((t.match(/SGD\s*(\d+(?:\.\d+)?)/)||[])[1]||'0');
   var q=it.querySelector('[data-name="Plus"]');q=q&&q.parentElement.querySelector('p');
   return {el:it,cb:it.querySelector('[data-name="Checkbox"]'),farm:farm,name:name||t.slice(0,24),price:price,qty:q?parseInt(q.textContent,10)||1:1,sold:!!(farm&&/Sold out/.test(farm.textContent))};
  });
 }
 function basketPaint(){
  var r=root();if(!r||scr()!=='basket')return;
  var phone=document.querySelector('.phone');var ticks=get(TICKS,[]);var items=basketItems(r);
  var total=0,count=0,gv=0,farms={};
  items.forEach(function(i){
   if(!i.cb)return;i.cb.classList.add('fx-cb');i.cb.classList.toggle('fx-off-limits',i.sold);
   var onNow=!i.sold&&ticks.indexOf(i.name)>=0;i.cb.classList.toggle('fx-on',onNow);
   var f=i.farm?i.farm.getAttribute('data-name'):'';farms[f]=farms[f]||{all:true,any:false,sold:i.sold};
   if(!i.sold){farms[f].all=farms[f].all&&onNow;farms[f].any=true;}
   if(onNow){total+=i.price*i.qty;count++;if(/Green Valley/.test(f))gv+=i.price*i.qty;}
  });
  r.querySelectorAll('[data-name="Farm header"] [data-name="Checkbox"]').forEach(function(cb){
   var f=cb.closest('[data-name^="Farm · "]');var st=farms[f?f.getAttribute('data-name'):'']||{all:false,any:false,sold:true};
   cb.classList.add('fx-cb');cb.classList.toggle('fx-off-limits',!st.any);cb.classList.toggle('fx-on',st.any&&st.all);
  });
  // Welcome deal: 10% off Green Valley items that are ticked.
  var deal=gv*0.1;total-=deal;
  r.querySelectorAll('[data-name="Welcome deal"] p').forEach(function(p){if(/^-SGD/.test(p.textContent.trim()))setText(p,'-'+money(deal));});
  // Free delivery bar (the design's target is SGD 25.90).
  var left=Math.max(0,25.9-total);
  r.querySelectorAll('[data-name="Free delivery bar"] p').forEach(function(p){if(/free delivery/i.test(p.textContent))setText(p,left>0?money(left)+' more for free delivery':'You get free delivery');});
  var bar=r.querySelector('[data-name="Free delivery bar"] [data-name="Bar"]');if(bar)bar.style.width=Math.min(100,total/25.9*100)+'%';
  var bottom=(phone||r).querySelector('[data-name="Checkout bar"]');
  if(bottom){
   var all=allBox(bottom);var avail=items.filter(function(i){return !i.sold;});
   if(all){all.classList.add('fx-cb');all.classList.toggle('fx-on',avail.length>0&&count===avail.length);}
   bottom.querySelectorAll('[data-name="Total"] p').forEach(function(p){if(/SGD/.test(p.textContent))setText(p,money(Math.max(0,total)));});
   var btn=bottom.querySelector('[data-name="Button"]');
   if(btn){btn.querySelectorAll('p').forEach(function(p){if(/Check out/.test(p.textContent))setText(p,'Check out ('+count+')');});btn.classList.toggle('fx-blocked',count===0);}
  }
 }
 function allBox(bar){var b=bar.querySelector('[data-name="Checkbox"]');if(b)return b;b=bar.querySelector('[data-name="Box"]');return b?b.parentElement:null;}
 function basketClick(cb){
  var r=root();var items=basketItems(r).filter(function(i){return !i.sold;});var ticks=get(TICKS,[]);
  function set(list,v){list.forEach(function(i){var k=ticks.indexOf(i.name);if(v&&k<0)ticks.push(i.name);if(!v&&k>=0)ticks.splice(k,1);});}
  if(cb.closest('[data-name="Checkout bar"]')){var allOn=items.length&&items.every(function(i){return ticks.indexOf(i.name)>=0;});set(items,!allOn);}
  else if(cb.closest('[data-name="Farm header"]')){var f=cb.closest('[data-name^="Farm · "]');var mine=items.filter(function(i){return i.farm===f;});var on2=mine.length&&mine.every(function(i){return ticks.indexOf(i.name)>=0;});set(mine,!on2);}
  else{var it=items.filter(function(i){return i.cb===cb;})[0];if(!it)return;set([it],ticks.indexOf(it.name)<0);}
  put(TICKS,ticks);basketPaint();
 }

 // ---------- Story voice ----------
 // Product pages play a natural recorded-style voice from /api/voice (cached after the first
 // play). Anywhere else, or if that fails, the browser's most natural voice reads the story.
 var STORY_IDS=['tea','gv-honey','honey','spinach','milk','sourdough','cheese','jam','kaya','sambal','microgreens','lettuce'];
 var speaking=null,audio=null;
 function stopVoice(){try{speechSynthesis.cancel();}catch(e){}if(audio){audio.pause();audio=null;}if(speaking)speaking.classList.remove('is-playing');speaking=null;}
 function bestVoice(){
  var vs=[];try{vs=speechSynthesis.getVoices()||[];}catch(e){}
  var en=vs.filter(function(v){return /^en/i.test(v.lang);});
  var prefs=[/natural/i,/neural/i,/premium|enhanced/i,/Samantha/,/Google UK English Female/,/Google US English/,/Daniel/,/Karen|Moira|Tessa/];
  for(var i=0;i<prefs.length;i++){var m=en.filter(function(v){return prefs[i].test(v.name);})[0];if(m)return m;}
  return en[0]||null;
 }
 function speak(v,text){
  if(!('speechSynthesis' in window)){stopVoice();return;}
  var u=new SpeechSynthesisUtterance(text);var b=bestVoice();if(b){u.voice=b;u.lang=b.lang;}else u.lang='en-GB';u.rate=0.98;u.pitch=1.02;
  u.onend=u.onerror=function(){if(speaking===v)stopVoice();};
  try{speechSynthesis.speak(u);}catch(e){stopVoice();}
 }
 function playVoice(v){
  var card=v.closest('[data-name="Farm story card"]')||v.parentElement;for(var up=0;up<4&&card.querySelectorAll('p').length<3&&card.parentElement;up++)card=card.parentElement;var best='';
  card.querySelectorAll('p').forEach(function(p){var t=p.textContent.trim();if(t.length>best.length&&!/^Hear /.test(t))best=t;});
  var who=(v.textContent.match(/Hear ([^,]+)/)||[])[1];best=best.replace(/[“”]/g,'');var text=(who?'Hi, I’m '+who+'. ':'')+best;
  stopVoice();speaking=v;v.classList.add('is-playing');
  var id=null;try{id=sessionStorage.getItem('farmily-customer-product');}catch(e){}
  var fm=/^farm-(\w+)/.exec(scr());if(fm)id='farm-'+fm[1];else if(scr()!=='product'||STORY_IDS.indexOf(id)<0)id=null;
  if(id&&window.Audio){
   var a=new Audio('/api/voice?id='+encodeURIComponent(id));audio=a;var started=false;
   a.onplaying=function(){started=true;};
   a.onended=function(){if(speaking===v)stopVoice();};
   a.onerror=function(){if(audio===a&&!started){audio=null;speak(v,text);}};
   var p=a.play();if(p&&p.catch)p.catch(function(){if(audio===a&&!started){audio=null;speak(v,text);}});
   return;
  }
  speak(v,text);
 }
 try{speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=function(){};}catch(e){}
 window.addEventListener('hashchange',stopVoice);

 // ---------- Product page: "Add to cart · SGD total" follows the quantity ----------
 function addPaint(){
  if(scr()!=='product')return;var r=root();
  var price=r.querySelector('[data-node-id="1673:7026"]');var btn=r.querySelector('[data-node-id="1447:3411"] p');
  if(!price||!btn||/Sold out/i.test(btn.textContent))return;
  var unit=parseFloat((price.textContent.match(/(\d+(?:\.\d+)?)/)||[])[1]||'0');
  var q=r.querySelector('[data-name="Action bar"] [data-name="Plus"]');q=q&&q.parentElement.querySelector('p');
  var n=q?parseInt(q.textContent,10)||1:1;
  if(unit)setText(btn,'Add to cart · '+money(unit*n));
 }

 // ---------- Explore, Liked tab, profile and the way back to the start ----------
 var FARM_LIKES='farmily-customer-farmlikes',CHAT_FILTER=false;
 var PID={'Raw wildflower honey':'honey','Wildflower Honey':'gv-honey','Lemongrass Tea':'tea','Fresh spinach':'spinach','Goat milk':'milk','Goat cheese':'cheese','Sourdough loaf':'sourdough','Apricot jam':'jam','Pandan kaya':'kaya','Sambal belacan':'sambal','Microgreens':'microgreens','Butterhead lettuce':'lettuce'};
 var PINFO={honey:['Bee Good Apiary','SGD 12.00','/preset/shop-honey-studio.jpg','bg'],'gv-honey':['Green Valley Farm','SGD 14.00','/preset/honey-botanical-studio.jpg','gv'],tea:['Green Valley Farm','SGD 6.00','/preset/tea-minimal-studio.jpg','gv'],spinach:['Riverbend Farm','SGD 3.20','/preset/shop-spinach-studio.jpg','rb'],milk:['Happy Hill Farm','SGD 6.50','/preset/shop-milk-studio.jpg','hh'],cheese:['Happy Hill Farm','SGD 9.80','/preset/shop-cheese-studio.jpg','hh'],sourdough:['Field and Flour','SGD 8.00','/preset/shop-sourdough-studio.jpg','ff'],jam:['Bee Good Apiary','SGD 7.50','/preset/shop-jam-studio.jpg','bg'],kaya:['Kampung Pantry','SGD 6.50','/preset/shop-kaya-studio.jpg','kp'],sambal:['Kampung Pantry','SGD 7.00','/preset/shop-sambal-studio.jpg','kp'],microgreens:['Sunrise Greens','SGD 5.50','/preset/shop-microgreens-studio.jpg','sg'],lettuce:['Sunrise Greens','SGD 3.80','/preset/shop-lettuce-studio.jpg','sg']};
 var FARMI={gv:['Green Valley Farm','a/18b50773-654f-40c8-a7d9-c73143231805.jpg','10% off your first order'],bg:['Bee Good Apiary','a/505fa549-b09d-4189-acfd-8b14e29c0ea4.jpg','Raw honey and jams'],hh:['Happy Hill Farm','a/38f4e780-cb48-45b3-83fa-71a2c057f3e2.jpg','Goat milk and cheese'],rb:['Riverbend Farm','/preset/shop-spinach-studio.jpg','Leafy greens'],ff:['Field and Flour','/preset/shop-sourdough-studio.jpg','Sourdough and bakes'],kp:['Kampung Pantry','/preset/shop-kaya-studio.jpg','Kaya and sambal'],sg:['Sunrise Greens','/preset/shop-microgreens-studio.jpg','Microgreens and lettuce']};
 var FID={};Object.keys(FARMI).forEach(function(k){FID[FARMI[k][0]]=k;});
 function exMode(){var on=document.querySelector('.screen .fp-tab.on');if(on)return /Farm/.test(on.textContent)?'farms':'products';var like=document.querySelector('.screen [data-name="Actions"] [data-name="Like"]');return like&&/cart/i.test(like.textContent)?'products':'farms';}
 function cardProduct(){var c=document.querySelector('.screen [data-name="Swipe card"]');if(!c)return null;var t=c.textContent;var best=null;Object.keys(PID).forEach(function(n){if(t.indexOf(n)>=0&&(!best||n.length>best.length))best=n;});return best?PID[best]:null;}
 function cardFarm(){var c=document.querySelector('.screen [data-name="Swipe card"]');if(!c)return null;var t=c.textContent;for(var n in FID)if(t.indexOf(n)>=0)return FID[n];return null;}
 function exPaint(){
  var s=scr(),r=root();if(!r||!/^ex-/.test(s))return;var mode=exMode();r.setAttribute('data-fx-mode',mode);
  // Liked tab count = what the shopper has liked in this mode.
  var n=mode==='products'?get(LIKES,[]).length:get(FARM_LIKES,[]).length;
  r.querySelectorAll('[data-name="Tabs"] [data-name="Segment 2"] [data-name="Count"]').forEach(function(c){var p=c.querySelector('p')||c;setText(p,String(n));});
  if(s!=='ex-likedtab'&&s!=='ex-likedempty')return;
  var host=r.querySelector('.fx-likedlist');
  if(!host){host=document.createElement('div');host.className='fx-likedlist';var anchor=r.querySelector('.fp-liked,[data-name="List"],[data-name="Empty state"]');if(!anchor)return;anchor.parentElement.insertBefore(host,anchor);}
  var html='';
  if(mode==='products'){var ids=get(LIKES,[]).map(function(nm){return PID[nm];}).filter(Boolean);
   html=ids.length?ids.map(function(id){var i=PINFO[id];var nm=Object.keys(PID).filter(function(k){return PID[k]===id;})[0];return '<div class="fx-lrow" data-fx-product="'+id+'"><img src="'+i[2]+'" alt=""><div><b>'+nm+'</b><span>'+i[0]+'</span><em>'+i[1]+'</em></div><span class="fx-lheart" data-fx-unlike="'+nm+'"></span></div>';}).join(''):
    '<div class="fx-lempty"><b>Products you save show up here</b><span>Tap the heart on a product to save it for later.</span></div>';}
  else{var fs=get(FARM_LIKES,[]);
   html=fs.length?fs.map(function(f){var i=FARMI[f];return '<div class="fx-lrow" data-fx-farm="'+f+'"><img class="round" src="'+i[1]+'" alt=""><div><b>'+i[0]+'</b><span>'+i[2]+'</span></div><span class="fx-lchat" data-fx-chat="'+f+'"></span></div>';}).join(''):
    '<div class="fx-lempty"><b>Farms you like show up here</b><span>Swipe right on a farm in Farm Match to save it.</span></div>';}
  if(host.getAttribute('data-html')!==html){host.innerHTML=html;host.setAttribute('data-html',html);}
 }
 // Me page: liked counts, and a Start over row for testers.
 function mePaint(){
  if(scr()!=='me')return;var r=root();
  var f=get(FARM_LIKES,[]).length,p=get(LIKES,[]).length;
  r.querySelectorAll('[data-name="Settings"] p').forEach(function(el){if(/saved from Explore|saved$/.test(el.textContent.trim()))setText(el,f+' farm'+(f===1?'':'s')+', '+p+' product'+(p===1?'':'s')+' saved');});
  var set=r.querySelector('[data-name="Settings"]');
  if(set&&!r.querySelector('.fx-restart')){var b=document.createElement('button');b.className='fx-restart';b.setAttribute('data-fx-restart','1');
   b.innerHTML='<span class="fx-ri"></span><span><b>Start over</b><i>Back to the buy or sell screen</i></span>';set.after(b);}
 }
 function startOver(){
  try{Object.keys(sessionStorage).forEach(function(k){if(/^farmily-customer/.test(k))sessionStorage.removeItem(k);});}catch(e){}
  if(window.parent!==window)window.parent.postMessage({type:'farmily-customer-exit'},location.origin);else location.href='/';
 }
 // Chat list: All / Unread filter.
 function chatListPaint(){
  if(scr()!=='ch-list')return;var r=root();
  var chips=r.querySelectorAll('[data-name="Filters"] [data-name="Chip"]');if(chips.length<2)return;
  chips[0].classList.toggle('flip',CHAT_FILTER);chips[1].classList.toggle('flip',CHAT_FILTER);
  r.querySelectorAll('[data-name="Chat row"]').forEach(function(row){var hide=CHAT_FILTER&&!row.querySelector('[data-name="Unread"]');row.style.display=hide?'none':'';
   var d=row.nextElementSibling;if(d&&d.getAttribute('data-name')==='Divider row')d.style.display=hide?'none':'';});
 }
 // Farm Match: a right swipe on a farm saves it to Liked.
 var lastToast='';
 function likeFromToast(){
  if(scr()!=='ex-liked')return;var t=document.querySelector('.phone').textContent;var f=null;for(var n in FID)if(t.indexOf(n+' added to Liked')>=0){f=FID[n];break;}
  if(!f||lastToast===f+t.length)return;lastToast=f+t.length;var fs=get(FARM_LIKES,[]);if(fs.indexOf(f)<0){fs.push(f);put(FARM_LIKES,fs);}
 }
 style.textContent+=[
  // Sprout's bubble on Fresh picks / Farm Match waits for its pop-in instead of showing twice.
  '[data-name="Sprout says"]:not(.fp-say-in):not(.fp-say-closed) [data-name="Sticker"]{opacity:0;transform:scale(.2)}',
  // Fresh picks: a right swipe adds to cart, so the stamp says so.
  '.screen[data-fx-mode="products"] [data-name="Swipe card"][data-swipe="right"]::after{content:"ADD TO CART"}',
  // Our Liked lists replace the fixed ones.
  '.screen[data-screen="ex-likedtab"] .fp-liked,.screen[data-screen="ex-likedtab"] [data-name="List"],.screen[data-screen="ex-likedempty"] [data-name="Empty state"]{display:none!important}',
  '.fx-likedlist{display:flex;flex-direction:column;gap:10px;width:100%;font-family:Figtree,sans-serif}',
  '.fx-lrow{display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:10px 12px;cursor:pointer}',
  '.fx-lrow img{width:56px;height:56px;border-radius:10px;object-fit:cover}.fx-lrow img.round{border-radius:999px}',
  '.fx-lrow div{flex:1;min-width:0}.fx-lrow b{display:block;font-size:15px;font-weight:600;color:#1a1a18}.fx-lrow span{display:block;font-size:13px;color:#6e6e69}.fx-lrow em{display:block;font-style:normal;font-size:13px;font-weight:600;color:#1a1a18}',
  '.fx-lheart,.fx-lchat{width:36px;height:36px;border-radius:999px;border:1px solid #e0e0dc;flex-shrink:0;background:#fff center/18px no-repeat}',
  '.fx-lheart{background-image:url("'+heart+'")}',
  '.fx-lchat{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233b3b38\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\'/%3E%3C/svg%3E")}',
  '.fx-lempty{background:#fff;border-radius:16px;padding:24px 16px;text-align:center}.fx-lempty b{display:block;font-size:16px;color:#1a1a18}.fx-lempty span{display:block;font-size:14px;color:#6e6e69;margin-top:4px}',
  '.fx-restart{display:flex;align-items:center;gap:12px;width:100%;background:#fff;border:1px solid #e0e0dc;border-radius:16px;padding:14px 16px;text-align:left;cursor:pointer;font-family:Figtree,sans-serif;margin-top:12px}',
  '.fx-restart b{display:block;font-size:15px;color:#1a1a18}.fx-restart i{display:block;font-style:normal;font-size:13px;color:#6e6e69}',
  '.fx-ri{width:36px;height:36px;border-radius:999px;background:#e2f5e9 url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230e6b3b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M3 12a9 9 0 1 0 3-6.7L3 8\'/%3E%3Cpath d=\'M3 3v5h5\'/%3E%3C/svg%3E") center/18px no-repeat;flex-shrink:0}',
  '.screen[data-screen="home"] [data-node-id="1447:3319"]{cursor:pointer}'
 ].join('\n');

 // ---------- Elastic end of scroll ----------
 // Scrolling past the end of a screen stretches a little, then springs back, so the shopper
 // feels where the content ends (iPhone already does this natively).
 var nativeBounce=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 var band={off:0,timer:null,sc:null};
 function bandParts(sc){var c=sc&&sc.firstElementChild;return c?[].filter.call(c.children,function(k){return !k.dataset.pinned;}):[];}
 function bandSet(sc,off,anim){band.off=off;band.sc=sc;bandParts(sc).forEach(function(k){k.style.transition=anim?'transform .5s cubic-bezier(.2,1.5,.4,1)':'none';k.style.transform=off?'translateY('+off+'px)':'';});}
 function bandRelease(){if(band.sc)bandSet(band.sc,0,true);}
 function edge(sc,dir){return dir>0?sc.scrollTop+sc.clientHeight>=sc.scrollHeight-1:sc.scrollTop<=0;}
 window.addEventListener('wheel',function(e){
  var sc=e.target.closest&&e.target.closest('.screen');if(!sc||!e.deltaY)return;var dir=e.deltaY>0?1:-1;
  if(!edge(sc,dir)&&!band.off)return;
  var next=band.off-e.deltaY*0.35*(1-Math.min(1,Math.abs(band.off)/90));next=Math.max(-72,Math.min(72,next));
  if((dir>0&&next>0)||(dir<0&&next<0))next=0;
  bandSet(sc,next,false);clearTimeout(band.timer);band.timer=setTimeout(bandRelease,120);
 },{passive:true});
 if(!nativeBounce){var ty=null;
  window.addEventListener('touchstart',function(e){var sc=e.target.closest&&e.target.closest('.screen');ty=sc?{y:e.touches[0].clientY,sc:sc}:null;},{passive:true});
  window.addEventListener('touchmove',function(e){if(!ty)return;var dy=e.touches[0].clientY-ty.y;var dir=dy<0?1:-1;if(!edge(ty.sc,dir)){ty.y=e.touches[0].clientY;return;}
   var off=dy*0.35;off=Math.max(-80,Math.min(80,off));bandSet(ty.sc,off,false);},{passive:true});
  window.addEventListener('touchend',function(){ty=null;bandRelease();},{passive:true});
 }
 style.textContent+='\n.screen[data-screen="me"]>div>[data-name="Settings"]~.fx-restart{margin-bottom:24px}';

 // ---------- Clicks ----------
 window.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;var s=scr();
  // Start over (profile) and the Farmily logo on Home go back to the buy or sell screen.
  if(t.closest('[data-fx-restart]')||(s==='home'&&t.closest('[data-node-id="1447:3319"]'))){e.stopPropagation();e.preventDefault();startOver();return;}
  // Chat list filter.
  if(s==='ch-list'){var fc=t.closest('[data-name="Filters"] [data-name="Chip"]');if(fc){e.stopPropagation();e.preventDefault();CHAT_FILTER=/Unread/.test(fc.textContent);chatListPaint();return;}}
  // Liked lists.
  var lr=t.closest('[data-fx-unlike]');if(lr){e.stopPropagation();e.preventDefault();var ls=get(LIKES,[]);var li=ls.indexOf(lr.getAttribute('data-fx-unlike'));if(li>=0)ls.splice(li,1);put(LIKES,ls);exPaint();return;}
  var lc=t.closest('[data-fx-chat]');if(lc){e.stopPropagation();e.preventDefault();if(window.farmilyChat)window.farmilyChat.open(lc.getAttribute('data-fx-chat'));return;}
  var lp=t.closest('[data-fx-product]');if(lp){e.stopPropagation();e.preventDefault();var id=lp.getAttribute('data-fx-product');try{sessionStorage.setItem('farmily-customer-product',id);sessionStorage.setItem('farmily-customer-farm',PINFO[id][3]);}catch(err){}location.hash='#product';return;}
  var lf=t.closest('[data-fx-farm]');if(lf){e.stopPropagation();e.preventDefault();location.hash='#farm-'+lf.getAttribute('data-fx-farm');return;}
  // Fresh picks: the up arrow opens the full product page, so details always match.
  if(/^ex-/.test(s)&&exMode()==='products'&&t.closest('[data-name="FP up"]')){var cp=cardProduct();if(cp&&PINFO[cp]){e.stopPropagation();e.preventDefault();try{sessionStorage.setItem('farmily-customer-product',cp);sessionStorage.setItem('farmily-customer-farm',PINFO[cp][3]);}catch(err){}location.hash='#product';return;}}
  // Explore: Ask the farmer carries the product (or farm) into the chat.
  if(/^ex-/.test(s)&&t.closest('[data-name="Ask the farmer"]')&&window.farmilyChat){var mp=exMode()==='products'?cardProduct():null;var mf=mp&&PINFO[mp]?PINFO[mp][3]:cardFarm();if(mf)window.farmilyChat.prepare(mf,mp);}
  // Name: Continue needs a name.
  if(s==='gs-name'&&t.closest('[data-node-id="1492:5183"]')){
   var f=field();var n=f?f.textContent.trim():'';
   if(!n){e.stopPropagation();e.preventDefault();var box=f&&f.closest('[data-name="Field"]');if(box){box.classList.remove('fx-need');void box.offsetWidth;box.classList.add('fx-need');}if(f)f.focus();return;}
   put(NAME,n.slice(0,30));return;
  }
  // Hearts.
  var h=t.closest(HEARTS);
  if(h){var p=productOf(h);if(p){e.stopPropagation();e.preventDefault();var liked=get(LIKES,[]);var i=liked.indexOf(p);if(i>=0)liked.splice(i,1);else liked.push(p);put(LIKES,liked);heartsPaint();exPaint();mePaint();return;}}
  // Basket tick boxes and an empty checkout.
  if(s==='basket'){
   var bar=t.closest('[data-name="Checkout bar"]');
   var cb=t.closest('[data-name="Checkbox"]')||(bar&&!t.closest('[data-name="Button"],[data-name="Total"]')?allBox(bar):null);if(cb){e.stopPropagation();e.preventDefault();basketClick(cb);return;}
   // Sold-out honey: Find similar and Show me open Recommended for you, with the similar honey first.
   var sim=t.closest('[data-name="Find similar"],[data-name="AI sticker"] [data-name="Action"],[data-name="AI sticker"] a,[data-name="AI sticker"] button');
   if(sim&&window.farmilyBrowse){e.stopPropagation();e.preventDefault();window.farmilyBrowse.recommended('gv-honey');return;}
   var btn=t.closest('[data-name="Checkout bar"] [data-name="Button"]');if(btn&&btn.classList.contains('fx-blocked')){e.stopPropagation();e.preventDefault();return;}
  }
  // Story voice.
  var play=t.closest('[data-name="Voice"] [data-name="Play"],[data-name="Player"] [data-name="Play"]');
  if(play){e.stopPropagation();e.preventDefault();var v=play.closest('[data-name="Voice"],[data-name="Player"]');if(speaking===v)stopVoice();else playVoice(v);return;}
  // Onboarding picks: save after the app toggles the choice.
  if((s==='gs-interests'&&t.closest('[data-name="Interest tile"]'))||(s==='gs-values'&&t.closest('[data-name="Chip"]'))){
   var el=t.closest('[data-name="Interest tile"],[data-name="Chip"]');var label=el.textContent.trim();setTimeout(function(){picksSave(label);},0);
  }
 },true);

 // ---------- Keep the screen in step ----------
 var busy=false,queued=false;
 function apply(){
  var r=root();if(!r)return;busy=true;
  try{nameFix(r);picksInit(r);heartsPaint();basketPaint();addPaint();exPaint();mePaint();chatListPaint();likeFromToast();}catch(err){}
  busy=false;
 }
 new MutationObserver(function(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;apply();},0);}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-screen']});
 document.addEventListener('DOMContentLoaded',apply);
})();

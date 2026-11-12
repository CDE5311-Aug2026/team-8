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
 var HEARTS='[data-name="Favourite"],.br-fav,[data-node-id="1447:3377"]';
 function productOf(h){
  if(h.matches('[data-node-id="1447:3377"]')){var n=document.querySelector('.screen [data-node-id="1673:7018"]');return n?n.textContent.trim():null;}
  var card=h.closest('[data-name="Product card"],.br-card,[data-name="FP product"]');if(!card)return null;var t=card.textContent;
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
 var speaking=null;
 function stopVoice(){try{speechSynthesis.cancel();}catch(e){}if(speaking)speaking.classList.remove('is-playing');speaking=null;}
 function playVoice(v){
  if(!('speechSynthesis' in window))return;
  var card=v.closest('[data-name="Farm story card"]')||v.parentElement;var best='';
  card.querySelectorAll('p').forEach(function(p){var t=p.textContent.trim();if(t.length>best.length&&!/^Hear /.test(t))best=t;});
  var who=(v.textContent.match(/Hear ([^,]+)/)||[])[1];
  var u=new SpeechSynthesisUtterance((who?'Hi, I’m '+who+'. ':'')+best);u.lang='en-SG';u.rate=0.95;
  u.onend=u.onerror=function(){if(speaking===v)stopVoice();};
  stopVoice();speaking=v;v.classList.add('is-playing');speechSynthesis.speak(u);
 }
 window.addEventListener('hashchange',stopVoice);

 // ---------- Clicks ----------
 window.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;var s=scr();
  // Name: Continue needs a name.
  if(s==='gs-name'&&t.closest('[data-node-id="1492:5183"]')){
   var f=field();var n=f?f.textContent.trim():'';
   if(!n){e.stopPropagation();e.preventDefault();var box=f&&f.closest('[data-name="Field"]');if(box){box.classList.remove('fx-need');void box.offsetWidth;box.classList.add('fx-need');}if(f)f.focus();return;}
   put(NAME,n.slice(0,30));return;
  }
  // Hearts.
  var h=t.closest(HEARTS);
  if(h){var p=productOf(h);if(p){e.stopPropagation();e.preventDefault();var liked=get(LIKES,[]);var i=liked.indexOf(p);if(i>=0)liked.splice(i,1);else liked.push(p);put(LIKES,liked);heartsPaint();return;}}
  // Basket tick boxes and an empty checkout.
  if(s==='basket'){
   var bar=t.closest('[data-name="Checkout bar"]');
   var cb=t.closest('[data-name="Checkbox"]')||(bar&&!t.closest('[data-name="Button"],[data-name="Total"]')?allBox(bar):null);if(cb){e.stopPropagation();e.preventDefault();basketClick(cb);return;}
   var btn=t.closest('[data-name="Checkout bar"] [data-name="Button"]');if(btn&&btn.classList.contains('fx-blocked')){e.stopPropagation();e.preventDefault();return;}
  }
  // Story voice.
  var play=t.closest('[data-name="Voice"] [data-name="Play"]');
  if(play){e.stopPropagation();e.preventDefault();var v=play.closest('[data-name="Voice"]');if(speaking===v)stopVoice();else playVoice(v);return;}
  // Onboarding picks: save after the app toggles the choice.
  if((s==='gs-interests'&&t.closest('[data-name="Interest tile"]'))||(s==='gs-values'&&t.closest('[data-name="Chip"]'))){
   var el=t.closest('[data-name="Interest tile"],[data-name="Chip"]');var label=el.textContent.trim();setTimeout(function(){picksSave(label);},0);
  }
 },true);

 // ---------- Keep the screen in step ----------
 var busy=false,queued=false;
 function apply(){
  var r=root();if(!r)return;busy=true;
  try{nameFix(r);picksInit(r);heartsPaint();basketPaint();}catch(err){}
  busy=false;
 }
 new MutationObserver(function(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;apply();},0);}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-screen']});
 document.addEventListener('DOMContentLoaded',apply);
})();

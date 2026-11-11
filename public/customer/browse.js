// Category, See all and search screens (Figma "3b Browse and search").
// Tapping a category tile, any See all link or the Search farm products bar opens one of these
// screens on top of the page. Product cards open the product page; farm rows open the farm.
(function(){
 var P={
  tea:{name:'Lemongrass Tea',farm:'gv',price:'SGD 6.00',old:'SGD 7.30',deal:'-18%',img:'/preset/tea-minimal-studio.jpg',ai:1,cat:'Tea',fav:1},
  'gv-honey':{name:'Wildflower Honey',farm:'gv',price:'SGD 14.00',img:'/preset/honey-botanical-studio.jpg',ai:1,cat:'Honey'},
  honey:{name:'Raw wildflower honey',farm:'bg',price:'SGD 12.00',img:'/preset/shop-honey-studio.jpg',ai:1,cat:'Honey',fav:1},
  spinach:{name:'Fresh spinach',farm:'rb',price:'SGD 3.20',old:'SGD 4.00',deal:'-20%',img:'/preset/shop-spinach-studio.jpg',ai:1,cat:'Vegetables',tag:'Low waste'},
  milk:{name:'Goat milk',farm:'hh',price:'SGD 6.50',old:'SGD 8.00',deal:'-19%',img:'/preset/shop-milk-studio.jpg',ai:1,cat:'Dairy',fav:1},
  sourdough:{name:'Sourdough loaf',farm:'ff',price:'SGD 8.00',img:'/preset/shop-sourdough-studio.jpg',ai:1,cat:'Bakery',tag:'Local'},
  cheese:{name:'Goat cheese',farm:'hh',price:'SGD 9.80',img:'/preset/shop-cheese-studio.jpg',ai:1,cat:'Dairy'},
  jam:{name:'Apricot jam',farm:'bg',price:'SGD 7.50',img:'/preset/shop-jam-studio.jpg',ai:1,cat:'Preserves'},
  kaya:{name:'Pandan kaya',farm:'kp',price:'SGD 6.50',img:'/preset/shop-kaya-studio.jpg',ai:1,cat:'Preserves'},
  sambal:{name:'Sambal belacan',farm:'kp',price:'SGD 7.00',img:'/preset/shop-sambal-studio.jpg',ai:1,cat:'Preserves'},
  microgreens:{name:'Microgreens',farm:'sg',price:'SGD 5.50',img:'/preset/shop-microgreens-studio.jpg',ai:1,cat:'Vegetables'},
  lettuce:{name:'Butterhead lettuce',farm:'sg',price:'SGD 3.80',img:'/preset/shop-lettuce-studio.jpg',ai:1,cat:'Vegetables'}
 };
 var FARMS={
  hh:{name:'Happy Hill Farm',rating:'4.7',reviews:'64',km:3,sells:'Goat milk and goat cheese',img:'a/ce7e15db-7862-44dd-8e7d-78630e16c7a3.jpg'},
  gv:{name:'Green Valley Farm',rating:'4.8',reviews:'130',km:4.2,sells:'Honey and tea',img:'a/fdc36305-3d40-4082-bca0-30ad51b1b921.jpg'},
  sg:{name:'Sunrise Greens',rating:'4.7',reviews:'39',km:4.8,sells:'Microgreens and butterhead lettuce',img:'a/76ec87a3-6302-4fb9-9f17-f6868198ff03.jpg'},
  bg:{name:'Bee Good Apiary',rating:'4.9',reviews:'86',km:5,sells:'Raw honey and apricot jam',img:'a/13b8ba08-357e-4212-ab9b-79c313fb7971.jpg'},
  kp:{name:'Kampung Pantry',rating:'4.8',reviews:'77',km:5.5,sells:'Pandan kaya and sambal belacan',img:'a/94ef5fbd-842f-4c39-af81-8f6f719cbaf8.jpg'},
  rb:{name:'Riverbend Farm',rating:'4.6',reviews:'51',km:6,sells:'Spinach, kale and herbs',img:'/preset/rb-farm.jpg'},
  ff:{name:'Field and Flour',rating:'4.9',reviews:'118',km:7,sells:'Sourdough, rye and focaccia',img:'/preset/ff-bakery.jpg'}
 };
 var CATS=['Honey','Preserves','Vegetables','Bakery','Dairy'];
 var LISTS={'Recommended for you':{sub:'Based on your top picks',sprout:1,ids:['spinach','tea','sourdough','milk']}};
 var ICON={
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  sprout:'<path d="M7 20h10M12 20v-8M12 12c0-3-2-5-6-5 0 3 2 5 6 5zM12 10c0-3 2-6 6-6 0 4-2 6-6 6z"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'
 };
 function svg(k,cls){return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[k]+'</svg>';}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

 // Farm photo on the Local favourite bar, the same one the farm page uses.
 var LOGO={gv:'a/18b50773-654f-40c8-a7d9-c73143231805.jpg',bg:'a/505fa549-b09d-4189-acfd-8b14e29c0ea4.jpg',hh:'a/38f4e780-cb48-45b3-83fa-71a2c057f3e2.jpg',rb:'/preset/shop-spinach-studio.jpg',ff:'/preset/shop-sourdough-studio.jpg',kp:'/preset/shop-kaya-studio.jpg',sg:'/preset/shop-microgreens-studio.jpg'};
 function card(id){var p=P[id];return '<div class="br-card" data-name="Product card" data-br-product="'+id+'">'+
  '<div class="br-img"><img src="'+p.img+'" alt="">'+(p.deal?'<span class="br-deal">'+p.deal+'</span>':'')+
  (p.tag?'<span class="br-tag">'+p.tag+'</span>':'')+'<span class="br-fav">'+svg('heart')+'</span>'+(p.ai?'<span class="br-ai">AI</span>':'')+'</div>'+
  (p.fav?'<div class="br-local">'+(LOGO[p.farm]?'<img src="'+LOGO[p.farm]+'" alt="">':'')+'Local favourite</div>':'')+
  '<div class="br-body"><div class="br-name">'+esc(p.name)+'</div><div class="br-meta">'+esc(FARMS[p.farm].name)+'</div>'+
  '<div class="br-foot"><span class="br-price">'+p.price+(p.old?' <s>'+p.old+'</s>':'')+'</span><span class="br-add">'+svg('cart')+'</span></div></div></div>';}
 function grid(ids){var h='<div class="br-grid">';ids.forEach(function(i){h+=card(i);});return h+'</div>';}
 function farmRow(id){var f=FARMS[id];return '<div class="br-farm" data-br-farm="'+id+'"><img src="'+f.img+'" alt=""><div class="br-ft"><div class="br-fn">'+esc(f.name)+'</div><div class="br-fm">'+f.rating+' from '+f.reviews+' neighbours, '+f.km+' km away</div></div><span class="br-chat" data-br-chat="'+id+'">'+svg('chat')+'</span></div>';}
 function topBar(title,sub,sprout){return '<div class="br-top"><button class="br-back" data-br-back aria-label="Back">'+svg('back')+'</button><div class="br-title">'+esc(title)+'</div>'+(sub?'<div class="br-sub">'+(sprout?svg('sprout','br-sp'):'')+esc(sub)+'</div>':'')+'</div>';}
 function catTiles(){var src=document.querySelector('[data-node-id="1447:3340"]');var h='<div class="br-cats">';
  CATS.forEach(function(c){var img='';if(src){var t=[].find.call(src.querySelectorAll('[data-name="Category tile"]'),function(x){return x.textContent.trim()===c;});var im=t&&t.querySelector('img');if(im)img=im.getAttribute('src');}
   h+='<button class="br-tile" data-br-cat="'+c+'">'+(img?'<img src="'+img+'" alt="">':'')+'<span>'+c+'</span></button>';});return h+'</div>';}
 function tip(title,body){return '<div class="br-tip"><button class="br-tipx" data-br-tipx aria-label="Close">'+svg('x')+'</button><div class="br-tipt">'+esc(title)+'</div><div class="br-tipb">'+esc(body)+'</div><button class="br-ask" data-br-ask>Ask Sprout AI</button></div>';}

 function inCat(c){return Object.keys(P).filter(function(i){return P[i].cat===c;});}
 function farmsOf(ids){var s={};ids.forEach(function(i){s[P[i].farm]=1;});return Object.keys(s).length;}
 function plural(n,w){return n+' '+w+(n===1?'':'s');}

 var view={
  cat:function(c){var ids=inCat(c);return topBar(c,plural(ids.length,'product')+' from '+plural(farmsOf(ids),'farm'))+
   '<div class="br-content"><div class="br-chips">'+CATS.map(function(x){return '<button class="br-chip'+(x===c?' on':'')+'" data-br-cat="'+x+'">'+x+'</button>';}).join('')+'</div>'+grid(ids)+'</div>';},
  list:function(title,ids,sub,sprout){return topBar(title,sub,sprout)+'<div class="br-content">'+grid(ids)+'</div>';},
  farms:function(){var ids=Object.keys(FARMS).sort(function(a,b){return FARMS[a].km-FARMS[b].km;});return topBar('Farms near you','Closest first')+'<div class="br-content br-rows">'+ids.map(farmRow).join('')+'</div>';},
  search:function(q){return '<div class="br-shead"><button class="br-back" data-br-back aria-label="Back">'+svg('back')+'</button><label class="br-field">'+svg('search')+
   '<input type="search" placeholder="Search farm products" value="'+esc(q||'')+'" data-br-q autocomplete="off" enterkeyhint="search"><button class="br-clear" data-br-clear aria-label="Clear"'+(q?'':' hidden')+'>'+svg('x')+'</button></label></div><div class="br-content" data-br-results>'+results(q)+'</div>';}
 };
 function results(q){q=(q||'').trim().toLowerCase();
  if(!q)return '<div class="br-h">Browse by category</div>'+catTiles()+tip('Not sure what to look for?','Tell Sprout AI what you are cooking and it finds the right farm products.');
  var words=q.split(/\s+/);function hit(s){s=s.toLowerCase();return words.every(function(w){return s.indexOf(w)>=0;});}
  var ids=Object.keys(P).filter(function(i){var p=P[i];return hit(p.name+' '+p.cat+' '+FARMS[p.farm].name);});
  var fs=Object.keys(FARMS).filter(function(i){var f=FARMS[i];return hit(f.name+' '+f.sells);});
  if(!ids.length&&!fs.length)return '<div class="br-empty"><span class="br-ei">'+svg('search')+'</span><div class="br-et">No match for '+esc(q)+'</div><div class="br-eb">Try another word, or ask Sprout AI to find something close.</div><button class="br-ask dark" data-br-ask>Ask Sprout AI</button></div><div class="br-h">Browse by category</div>'+catTiles();
  return (ids.length?'<div class="br-h">Products</div>'+grid(ids):'')+(fs.length?'<div class="br-h">Farms</div><div class="br-rows">'+fs.map(farmRow).join('')+'</div>':'')+tip('Not finding it?','Ask Sprout AI and it looks across every farm for you.');}

 // Screen stack shown over the page it was opened from.
 var stack=[],origin=null,el=null;
 function host(){return document.querySelector('.phone');}
 function render(){var h=host();if(!h)return;
  if(!stack.length){if(el){el.remove();el=null;}return;}
  if(!el){el=document.createElement('div');el.className='br-screen';el.setAttribute('data-name','Browse');}
  if(el.parentNode!==h)h.appendChild(el);
  var v=stack[stack.length-1];el.innerHTML=view[v[0]].apply(null,v.slice(1));el.scrollTop=0;
  var inp=el.querySelector('[data-br-q]');if(inp&&v[2]){setTimeout(function(){inp.focus();},50);v[2]=false;}}
 function open(){var v=[].slice.call(arguments);if(!stack.length)origin=location.hash||'#home';stack.push(v);render();}
 function back(){stack.pop();render();}
 function leave(hash){if(el)el.style.display='none';location.hash=hash;}
 window.addEventListener('hashchange',function(){if(!el)return;if(location.hash===origin)el.style.display='';else el.style.display='none';});

 function namesIn(sec){var out=[];sec.querySelectorAll('[data-name="Product card"]').forEach(function(c){var t=c.textContent;for(var i in P)if(t.indexOf(P[i].name)>=0&&out.indexOf(i)<0){out.push(i);break;}});return out;}
 function sectionOf(btn){var h=btn.closest('[data-name="Section heading"]');if(!h)return null;var s=h.parentElement;if(s.getAttribute('data-name')==='Heading group')s=s.parentElement;
  var title=(h.querySelector('p')||h).textContent.trim();return {title:title,el:s};}

 document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
  if(el&&el.contains(t)){
   var a;
   if(t.closest('[data-br-back]'))return back();
   if((a=t.closest('[data-br-clear]'))){stack[stack.length-1][1]='';render();var i=el.querySelector('[data-br-q]');if(i)i.focus();return;}
   if((a=t.closest('[data-br-cat]'))){var c=a.getAttribute('data-br-cat');if(stack[stack.length-1][0]==='cat'){stack[stack.length-1][1]=c;render();}else open('cat',c);return;}
   if(t.closest('[data-br-tipx]')){t.closest('.br-tip').remove();return;}
   if(t.closest('[data-br-ask]'))return leave('#as-start');
   if((a=t.closest('[data-br-chat]'))){e.stopPropagation();return leave('#ch-list');}
   if((a=t.closest('[data-br-farm]'))){var f=a.getAttribute('data-br-farm');leave('#farm-'+f);return;}
   if((a=t.closest('[data-br-product]'))){var id=a.getAttribute('data-br-product');try{sessionStorage.setItem('farmily-customer-product',id);sessionStorage.setItem('farmily-customer-farm',P[id].farm);}catch(err){}return leave('#product');}
   return;}
  // Category tiles on Home.
  var tile=t.closest('[data-name="Category tile"]');
  if(tile&&CATS.indexOf(tile.textContent.trim())>=0){e.stopPropagation();e.preventDefault();return open('cat',tile.textContent.trim());}
  // Search farm products bar (the Ask Sprout AI pill keeps its own action).
  if(t.closest('[data-node-id="1447:3337"] [data-node-id="1090:313"]')&&!t.closest('[data-name="Ask AI"]')){e.stopPropagation();e.preventDefault();return open('search','',true);}
  // See all.
  var b=t.closest('[data-name="Button"]');
  // Farm pages: the See all link next to "From this farm".
  var link=t.closest('[data-name="Section title"] [data-node-id]');
  if(!b&&link&&link.textContent.trim()==='See all'){var st=link.closest('[data-name="Section title"]');e.stopPropagation();e.preventDefault();
   var fid=(/^#farm-(\w+)/.exec(location.hash)||[])[1];var own=Object.keys(P).filter(function(i){return P[i].farm===fid;});
   return open('list',(st.querySelector('[data-node-id]')||st).textContent.trim(),own.length?own:namesIn(st.parentElement));}
  if(b&&b.textContent.trim()==='See all'){var s=sectionOf(b);if(!s)return;e.stopPropagation();e.preventDefault();
   if(/farms/i.test(s.title))return open('farms');
   var l=LISTS[s.title];return open('list',s.title,l?l.ids:namesIn(s.el),l&&l.sub,l&&l.sprout);}
 },true);
 document.addEventListener('input',function(e){if(!el||!e.target.matches||!e.target.matches('[data-br-q]'))return;var q=e.target.value;stack[stack.length-1][1]=q;
  el.querySelector('[data-br-results]').innerHTML=results(q);var c=el.querySelector('[data-br-clear]');if(c)c.hidden=!q;});
})();

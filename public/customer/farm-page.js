// One farm page for every farm. Riverbend Farm, Field and Flour, Kampung Pantry and Sunrise Greens
// use the Bee Good Apiary layout (Figma "3c More farm profiles"); this fills it with that farm's
// details. Going back to Bee Good puts its own details back.
(function(){
 var F={
  rb:{name:'Riverbend Farm',loc:'Neo Tiew, 6 km away',rating:'4.6 from 51 neighbours',reviews:'51',
   cover:'/preset/rb-farm.jpg',logo:'/preset/shop-spinach-studio.jpg',who:'Wei Ling',full:'Wei Ling Tan',role:'Vegetable grower for 9 years',
   quote:'“My father planted the first spinach here in 1998.”',dur:'0:16',portrait:'/preset/farmer-wei-ling.jpg',
   certs:['Good Agricultural Practice','Food safety certified'],chips:['Good Agricultural Practice','Low waste','Fresh and seasonal','Biodiversity friendly'],
   life:'“We pick at sunrise, before the heat.”',phil:'“Leaves we cannot sell go back to the soil.”',
   review:['L','lynn_c','3 days ago','Very fresh and lasted the whole week in the fridge.','Helpful (7)'],
   products:[['spinach','Fresh spinach','SGD 3.20','/preset/shop-spinach-studio.jpg','312 sold']],tip:'Wondering what to cook with fresh spinach?'},
  ff:{name:'Field and Flour',loc:'Bukit Timah, 7 km away',rating:'4.9 from 118 neighbours',reviews:'118',
   cover:'/preset/ff-bakery.jpg',logo:'/preset/shop-sourdough-studio.jpg',who:'Farah',full:'Farah Aziz',role:'Baker for 15 years',
   quote:'“I still feed the starter my mother gave me.”',dur:'0:21',portrait:'/preset/farmer-farah.jpg',
   certs:['Food safety certified','Halal certified'],chips:['Food safety certified','Traditional','Low waste','Community focused'],
   life:'“The ovens go on at four every morning.”',phil:'“Flour, water, salt and time. Nothing else.”',
   review:['T','tom.l','4 days ago','Proper crust and a soft, tangy inside. Gone in two days.','Helpful (6)'],
   products:[['sourdough','Sourdough loaf','SGD 8.00','/preset/shop-sourdough-studio.jpg','1.2k sold']],tip:'Not sure which bread goes with your soup?'},
  kp:{name:'Kampung Pantry',loc:'Kranji, 5.5 km away',rating:'4.8 from 77 neighbours',reviews:'77',
   cover:'a/94ef5fbd-842f-4c39-af81-8f6f719cbaf8.jpg',logo:'/preset/shop-kaya-studio.jpg',who:'Rosnah',full:'Rosnah Ismail',role:'Home cook for 30 years',
   quote:'“This is my grandmother’s kaya. Two hours of stirring.”',dur:'0:24',portrait:'/preset/farmer-rosnah.jpg',
   certs:['Food safety certified','Halal certified'],chips:['Food safety certified','Traditional','Community focused','Natural methods'],
   life:'“We cook in small pots so nothing burns.”',phil:'“No preservatives. Just coconut, eggs and pandan.”',
   review:['S','sharon_l','2 days ago','Tastes just like my grandmother’s. Not too sweet.','Helpful (5)'],
   products:[['kaya','Pandan kaya','SGD 6.50','/preset/shop-kaya-studio.jpg','86 sold'],['sambal','Sambal belacan','SGD 7.00','/preset/shop-sambal-studio.jpg','54 sold']],tip:'Curious how spicy the sambal is?'},
  sg:{name:'Sunrise Greens',loc:'Lim Chu Kang, 4.8 km away',rating:'4.7 from 39 neighbours',reviews:'39',
   cover:'a/76ec87a3-6302-4fb9-9f17-f6868198ff03.jpg',logo:'/preset/shop-microgreens-studio.jpg',who:'Jun Hao',full:'Jun Hao Lim',role:'Indoor grower for 6 years',
   quote:'“We grow up, not out. Ten shelves in one small room.”',dur:'0:17',portrait:'/preset/farmer-jun-hao.jpg',
   certs:['Good Agricultural Practice','Certified organic'],chips:['Good Agricultural Practice','Fresh and seasonal','Biodiversity friendly','Low waste'],
   life:'“Cut in the morning, at your door by dinner.”',phil:'“No sprays. The lights and water do the work.”',
   review:['A','amir.r','1 week ago','Crunchy and so fresh. My salads finally taste of something.','Helpful (4)'],
   products:[['microgreens','Microgreens','SGD 5.50','/preset/shop-microgreens-studio.jpg','120 sold'],['lettuce','Butterhead lettuce','SGD 3.80','/preset/shop-lettuce-studio.jpg','75 sold']],tip:'Wondering how to keep microgreens fresh?'}
 };
 var note={'Certified organic':'Control Union, valid until March 2027','Good Agricultural Practice':'Singapore Food Agency, valid until June 2026',
  'Food safety certified':'Singapore Food Agency, valid until May 2027','Halal certified':'MUIS, valid until January 2027','SFA licence':'Singapore Food Agency, valid until December 2026'};
 function farm(){var m=/^#farm-(\w+)/.exec(location.hash);return m?m[1]:null;}
 function q(id){return document.querySelector('.screen [data-node-id="'+id+'"]');}
 // Text: keep the Bee Good text so it can be put back.
 function setText(el,v){if(!el)return;var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n;while((n=w.nextNode()))if(n.nodeValue.trim())break;if(!n)return;
  if(!n.__orig)n.__orig=n.nodeValue;var want=v==null?n.__orig:v;if(n.nodeValue!==want)n.nodeValue=want;touched.add(n);}
 function setImg(img,v){if(!img)return;if(!img.hasAttribute('data-fp-orig'))img.setAttribute('data-fp-orig',img.getAttribute('src'));var want=v==null?img.getAttribute('data-fp-orig'):v;if(img.getAttribute('src')!==want)img.setAttribute('src',want);}
 function show(el,on){if(el)el.style.display=on?'':'none';}
 var touched=new Set();
 function restore(){touched.forEach(function(n){if(n.__orig&&n.nodeValue!==n.__orig)n.nodeValue=n.__orig;});
  document.querySelectorAll('.screen img[data-fp-orig]').forEach(function(i){if(i.getAttribute('src')!==i.getAttribute('data-fp-orig'))i.setAttribute('src',i.getAttribute('data-fp-orig'));});
  document.querySelectorAll('.screen [data-fp-hidden]').forEach(function(e){e.style.display='';e.removeAttribute('data-fp-hidden');});}
 function hide(el){if(el){el.style.display='none';el.setAttribute('data-fp-hidden','');}}
 var busy=false;
 function apply(){if(busy)return;var id=farm();if(!q('1447:3515'))return;busy=true;
  try{
   var d=F[id];if(!d){restore();return;}
   var hdr=q('1447:3515');
   setImg(hdr.querySelector(':scope > img')||hdr.querySelector('img'),d.cover);
   setImg(q('I1447:3515;1348:978')&&q('I1447:3515;1348:978').querySelector('img')||q('I1447:3515;1348:978'),d.logo);
   setText(q('I1447:3515;1358:1007'),d.name);setText(q('I1447:3515;1348:982'),d.loc);setText(q('I1447:3515;1539:4886;1447:7381'),d.certs[0]);setText(q('I1447:3515;1348:996'),d.rating);
   setText(q('1447:3519'),'Meet '+d.who);setText(q('I1447:3520;1322:970'),d.full);setText(q('I1447:3520;1322:971'),d.role);setText(q('I1447:3520;1322:972'),d.quote);
   var ph=q('I1447:3520;1322:968');setImg(ph&&(ph.tagName==='IMG'?ph:ph.querySelector('img')),d.portrait);
   ['1556:10649','1556:10650','1556:10651','1556:10652'].forEach(function(c,i){setText(q('I'+c+';1088:285'),d.chips[i]);});
   // Certifications list: one row per certificate.
   var certBox=[].find.call(document.querySelectorAll('.screen [data-node-id="1447:3516"] *'),function(e){return e.children.length&&/^Certifications/.test(e.textContent)&&e.textContent.indexOf('Checked by Farmily')>=0&&!e.querySelector('[data-name="How they grow"]');});
   if(certBox){var names=['Food safety certified','Halal certified','SFA licence'];var tw=document.createTreeWalker(certBox,NodeFilter.SHOW_TEXT),n,k=-1,list=[];while((n=tw.nextNode())){var t=(n.__orig||n.nodeValue).trim();if(!t)continue;list.push(n);}
    var rows=[];list.forEach(function(n){var t=(n.__orig||n.nodeValue).trim();if(names.indexOf(t)>=0)rows.push([n]);else if(rows.length&&rows[rows.length-1].length===1&&/valid until/.test(t))rows[rows.length-1].push(n);});
    rows.forEach(function(r,i){var c=d.certs[i];var row=r[0].parentElement;while(row&&row.parentElement&&!row.contains(r[1]))row=row.parentElement;
     if(c){if(row&&row.hasAttribute('data-fp-hidden')){row.style.display='';row.removeAttribute('data-fp-hidden');}setTextNode(r[0],c);if(r[1])setTextNode(r[1],note[c]);}else hide(row);});}
   setText(q('1447:3530'),'See all '+d.reviews);
   ['1317:930','1317:932','1317:944','1317:945','1317:961'].forEach(function(c,i){var e=document.querySelector('.screen [data-node-id="1447:3527"] [data-node-id="'+c+'"]')||q(c);setText(e,d.review[i]);});
   setText(q('I1447:3525;1348:999'),d.life);setText(q('I1447:3526;1348:999'),d.phil);
   ['1447:3537','1447:3538'].forEach(function(c,i){var card=q(c),p=d.products[i];if(!card)return;if(!p){hide(card);return;}
    if(card.hasAttribute('data-fp-hidden')){card.style.display='';card.removeAttribute('data-fp-hidden');}
    card.setAttribute('data-fp-product',p[0]);
    setText(q('I'+c+';1091:444'),p[1]);setText(q('I'+c+';1091:445'),d.name);setText(q('I'+c+';1091:448'),p[2]);setText(q('I'+c+';1282:717'),d.loc.split(', ')[1]);setText(q('I'+c+';1282:718'),p[4]);
    var im=q('I'+c+';1091:432');setImg(im&&(im.tagName==='IMG'?im:im.querySelector('img')),p[3]);
    hide(q('I'+c+';1447:7383'));});
   setText(q('I1447:3539;1317:986'),d.tip);
  }finally{busy=false;}
 }
 function setTextNode(n,v){if(!n.__orig)n.__orig=n.nodeValue;if(n.nodeValue!==v)n.nodeValue=v;touched.add(n);}
 // Remember which product a card on these pages is, before the product page opens.
 document.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('[data-fp-product]');if(!c||!F[farm()])return;
  try{sessionStorage.setItem('farmily-customer-product',c.getAttribute('data-fp-product'));sessionStorage.setItem('farmily-customer-farm',farm());}catch(err){}},true);
 var queued=false;
 new MutationObserver(function(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;apply();},0);}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 window.addEventListener('hashchange',function(){setTimeout(apply,0);});
})();

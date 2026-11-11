// One product page for every product. The customer prototype has one product page layout
// (Figma "Product / Lemongrass Tea"). When a shopper opens any product card, this fills that
// page with that product's details. Photos follow the farmer's current design through
// farmer-covers.js. Products with a touched-up photo also have the farmer's own photo: tap or
// swipe the photo to see it. Adding Wildflower Honey puts it in the basket and checkout in place
// of the tea (Figma "Basket / Wildflower Honey", "Checkout / Wildflower Honey").
(function(){
 var key='farmily-customer-product',farmKey='farmily-customer-farm',basketKey='farmily-customer-basket';
 var certNote={
  'Certified organic':'Control Union, valid until March 2027',
  'Good Agricultural Practice':'Singapore Food Agency, valid until June 2026',
  'Food safety certified':'Singapore Food Agency, valid until May 2027',
  'Halal certified':'MUIS, valid until January 2027',
  'SFA licence':'Singapore Food Agency, valid until December 2026'
 };
 var farms={
  gv:{name:'Green Valley Farm',km:'4.2 km away',who:'Alex',certs:['Certified organic','Good Agricultural Practice']},
  bg:{name:'Bee Good Apiary',km:'5 km away',who:'Nadia',certs:['Food safety certified','Halal certified']},
  hh:{name:'Happy Hill Farm',km:'3 km away',who:'Raj',certs:['Certified organic','SFA licence']},
  rb:{name:'Riverbend Farm',km:'6 km away',who:'Wei Ling',certs:['Good Agricultural Practice','Food safety certified']},
  ff:{name:'Field and Flour',km:'7 km away',who:'Farah',certs:['Food safety certified','Halal certified']},
  kp:{name:'Kampung Pantry',km:'5.5 km away',who:'Rosnah',certs:['Food safety certified','Halal certified']},
  sg:{name:'Sunrise Greens',km:'4.8 km away',who:'Jun Hao',certs:['Good Agricultural Practice','Certified organic']}
 };
 // photos: [touched-up photo, farmer's own photo]. ai: the card shows the AI mark.
 var products={
  tea:{match:'Lemongrass Tea',farm:'gv',name:'Lemongrass Tea',rating:'4.8',reviews:'109',price:'SGD 6.00',unit:'/ 20 bags',
   taste:[['Citrusy',4],['Light',3],['Fresh',2]],qty:'20 bags',ingredients:'Dried lemongrass',allergens:'None',chips:['After meals','Iced tea','Hot days'],
   story:'A light, citrusy lemongrass infusion in 20 individually wrapped tea bags. Presented in a compact paperboard carton.',voice:'0:20',
   photos:['/preset/tea-minimal-studio.jpg','/preset/tea-minimal-photo.jpg'],ai:true,
   process:[['/preset/farm-process.jpg','Harvest'],['/preset/farm-farm.jpg','On the farm']],
   r1:['S','sarah_k','5 days ago','Lovely flavour, you can really taste the difference.','Fresh','Helpful (5)'],
   r2:['D','daniel88','3 days ago','Good quality and nicely packed. A little smaller than I expected.','Good packaging','Helpful (3)',"Thanks, Daniel. We'll make the next batch a little more generous."]},
  'gv-honey':{match:'Wildflower Honey',farm:'gv',name:'Wildflower Honey',rating:'4.9',reviews:'21',price:'SGD 14.00',unit:'/ 250 g',
   taste:[['Floral',4],['Sweet',5],['Smooth',3]],qty:'250 g',ingredients:'100% raw honey',allergens:'None declared',chips:['Tea','Toast','Yoghurt'],
   story:'Raw honey from our hives, harvested by hand each season.',voice:'0:18',
   photos:['/preset/honey-botanical-studio.jpg','/preset/honey-botanical-photo.jpg'],ai:true,
   process:[['/preset/farm-process.jpg','Harvest'],['/preset/farm-farm.jpg','On the farm']],
   r1:['M','mei_lin','4 days ago','Light and floral, lovely in my morning tea.','Floral','Helpful (4)'],
   r2:['R','raj.s','1 week ago','Smooth and not too sweet. The jar is pretty enough to gift.','Good packaging','Helpful (2)','Thanks, Raj. So glad it made a good gift.']},
  honey:{match:'Raw wildflower honey',farm:'bg',name:'Raw wildflower honey',rating:'4.9',reviews:'64',price:'SGD 12.00',unit:'/ 250 g',
   taste:[['Floral',4],['Sweet',5],['Rich',4]],qty:'250 g',ingredients:'100% raw honey',allergens:'None declared',chips:['Tea','Yoghurt','Baking'],
   story:'Unheated honey from our Kranji hives. We only take what the bees can spare.',voice:'0:22',
   photos:['/preset/shop-honey-studio.jpg','/preset/shop-honey-photo.jpg'],ai:true,soldOut:true,
   process:[['/preset/honey-hives.jpg','Checking the hives'],['/preset/honey-jarring.jpg','Jarring the honey']],
   r1:['A','aisha_t','2 days ago','Thick and fragrant. You can tell it is raw.','Fresh','Helpful (6)'],
   r2:['K','kenji.w','1 week ago','Great taste. The lid was a bit sticky when it arrived.','Good value','Helpful (2)','Thanks, Kenji. We have changed how we seal the jars.']},
  spinach:{match:'Fresh spinach',farm:'rb',name:'Fresh spinach',rating:'4.6',reviews:'47',price:'SGD 3.20',unit:'/ 300 g',
   taste:[['Earthy',3],['Mild',4],['Tender',4]],qty:'300 g',ingredients:'Spinach',allergens:'None',chips:['Stir-fry','Soup','Smoothies'],
   story:'Picked the morning it ships and washed once. Leaves we cannot sell go to compost.',voice:'0:16',
   photos:['/preset/shop-spinach-studio.jpg','/preset/shop-spinach-photo.jpg'],ai:true,
   process:[['/preset/spinach-picking.jpg','Picking at dawn'],['/preset/spinach-washing.jpg','Washing and packing']],
   r1:['L','lynn_c','3 days ago','Very fresh and lasted the whole week in the fridge.','Fresh','Helpful (7)'],
   r2:['B','ben_ong','6 days ago','Tender leaves. A few were a little wilted at the bottom.','Good value','Helpful (1)','Thanks, Ben. We now pack the bags looser.']},
  milk:{match:'Goat milk',farm:'hh',name:'Goat milk',rating:'4.7',reviews:'58',price:'SGD 6.50',unit:'/ 1 L',
   taste:[['Creamy',4],['Mild',3],['Fresh',4]],qty:'1 L',ingredients:'Pasteurised goat milk',allergens:'Milk',chips:['Coffee','Cereal','Smoothies'],
   story:'Milked every morning and bottled the same day. Our goats graze outdoors.',voice:'0:19',
   photos:['/preset/shop-milk-studio.jpg','/preset/shop-milk-photo.jpg'],ai:true,
   process:[['/preset/milk-milking.jpg','Morning milking'],['/preset/milk-bottling.jpg','Bottled the same day']],
   r1:['P','priya_n','2 days ago','Creamy and not goaty at all. My kids love it.','Fresh','Helpful (5)'],
   r2:['J','jon_t','5 days ago','Lovely milk. Wish the bottle was a bit bigger.','Good packaging','Helpful (2)','Thanks, Jon. A 2 L bottle is coming soon.']},
  sourdough:{match:'Sourdough loaf',farm:'ff',name:'Sourdough loaf',rating:'4.9',reviews:'72',price:'SGD 8.00',unit:'/ 800 g',
   taste:[['Tangy',3],['Chewy',4],['Crusty',5]],qty:'800 g',ingredients:'Flour, water, salt',allergens:'Wheat (gluten)',chips:['Toast','Sandwiches','Soup'],
   story:'Slow proved for 24 hours and baked before sunrise on the day it ships.',voice:'0:21',
   photos:['/preset/shop-sourdough-studio.jpg','/preset/shop-sourdough-photo.jpg'],ai:true,
   process:[['/preset/sourdough-shaping.jpg','Shaping the dough'],['/preset/sourdough-baking.jpg','Out of the oven']],
   r1:['H','hana_y','1 day ago','Best crust I have had in Singapore.','Fresh','Helpful (9)'],
   r2:['M','marcus_l','4 days ago','Great loaf. Slightly too sour for my kids.','Good value','Helpful (3)','Thanks, Marcus. Try our milder rye next time.']},
  cheese:{match:'Goat cheese',farm:'hh',name:'Goat cheese',rating:'4.8',reviews:'33',price:'SGD 9.80',unit:'/ 150 g',
   taste:[['Tangy',3],['Creamy',5],['Salty',2]],qty:'150 g',ingredients:'Goat milk, salt, cultures',allergens:'Milk',chips:['Salads','Crackers','Pasta'],
   story:'Soft cheese made in small batches from our own goat milk.',voice:'0:17',
   photos:['/preset/shop-cheese-studio.jpg','/preset/shop-cheese-photo.jpg'],ai:true,
   process:[['/preset/cheese-curds.jpg','Making the curds'],['/preset/cheese-wrapping.jpg','Wrapping by hand']],
   r1:['E','eli_s','3 days ago','Fresh and creamy, perfect on crackers.','Fresh','Helpful (4)'],
   r2:['T','tom_k','1 week ago','Tasty, a bit salty for me.','Small batch','Helpful (1)','Thanks, Tom. Our next batch is less salty.']},
  jam:{match:'Apricot jam',farm:'bg',name:'Apricot jam',rating:'4.7',reviews:'41',price:'SGD 7.50',unit:'/ 220 g',
   taste:[['Fruity',5],['Tangy',3],['Sweet',4]],qty:'220 g',ingredients:'Apricots, sugar, lemon',allergens:'None declared',chips:['Toast','Scones','Cheese boards'],
   story:'Cooked in small pots with our own honey and ripe apricots.',voice:'0:15',
   photos:['/preset/shop-jam-studio.jpg','/preset/shop-jam-photo.jpg'],ai:true,
   process:[['/preset/jam-cooking.jpg','Cooking in small pots'],['/preset/jam-filling.jpg','Filling the jars']],
   r1:['G','grace_h','2 days ago','Not too sweet, real fruit pieces.','Fresh','Helpful (3)'],
   r2:['V','vik_r','5 days ago','Lovely jam. The jar is small for the price.','Good packaging','Helpful (2)','Thanks, Vik. A bigger jar is on the way.']}
,
  kaya:{match:'Pandan kaya',farm:'kp',name:'Pandan kaya',rating:'4.8',reviews:'52',price:'SGD 6.50',unit:'/ 250 g',
   taste:[['Fragrant',5],['Sweet',4],['Creamy',4]],qty:'250 g',ingredients:'Coconut milk, eggs, sugar, pandan',allergens:'Egg',chips:['Toast','Kueh','Breakfast'],
   story:'Stirred by hand for two hours over a low flame, the way Rosnah’s grandmother made it.',voice:'0:24',
   photos:['/preset/shop-kaya-studio.jpg','/preset/shop-kaya-photo.jpg'],ai:true,
   process:[['/preset/kaya-cooking.jpg','Stirring for two hours'],['/preset/kaya-jarring.jpg','Filling the jars']],
   r1:['S','sharon_l','2 days ago','Tastes just like my grandmother’s. Not too sweet.','Fresh','Helpful (5)'],
   r2:['W','wen.c','6 days ago','Smooth and fragrant. I wish the jar were bigger.','Good packaging','Helpful (2)','Thanks, Wen. A bigger jar is coming soon.']},
  sambal:{match:'Sambal belacan',farm:'kp',name:'Sambal belacan',rating:'4.7',reviews:'31',price:'SGD 7.00',unit:'/ 200 g',
   taste:[['Spicy',5],['Savoury',4],['Smoky',3]],qty:'200 g',ingredients:'Chillies, shallots, belacan, oil',allergens:'Shellfish (shrimp paste)',chips:['Rice','Noodles','Grilled fish'],
   story:'Pounded by hand in a stone mortar, then fried slowly until dark and fragrant.',voice:'0:19',
   photos:['/preset/shop-sambal-studio.jpg','/preset/shop-sambal-photo.jpg'],ai:true,
   process:[['/preset/sambal-pounding.jpg','Pounding by hand'],['/preset/sambal-frying.jpg','Frying slowly']],
   r1:['F','faiz_m','3 days ago','Properly spicy and full of flavour. Great with eggs.','Fresh','Helpful (6)'],
   r2:['C','clara_n','1 week ago','Delicious but too hot for my kids.','Good value','Helpful (2)','Thanks, Clara. A milder batch is on the way.']},
  microgreens:{match:'Microgreens',farm:'sg',name:'Microgreens',rating:'4.7',reviews:'28',price:'SGD 5.50',unit:'/ 50 g',
   taste:[['Crunchy',5],['Fresh',5],['Peppery',3]],qty:'50 g',ingredients:'Pea, radish and sunflower shoots',allergens:'None',chips:['Salads','Sandwiches','Garnish'],
   story:'Grown on shelves under soft lights and cut the morning they ship.',voice:'0:17',
   photos:['/preset/shop-microgreens-studio.jpg','/preset/shop-microgreens-photo.jpg'],ai:true,
   process:[['/preset/microgreens-trays.jpg','On the grow shelves'],['/preset/microgreens-cutting.jpg','Cut to order']],
   r1:['A','amir.r','1 week ago','Crunchy and so fresh. My salads finally taste of something.','Fresh','Helpful (4)'],
   r2:['J','joyce_t','4 days ago','Lovely, but they only last three days.','Small batch','Helpful (1)','Thanks, Joyce. Keep them dry in the fridge and they last longer.']},
  lettuce:{match:'Butterhead lettuce',farm:'sg',name:'Butterhead lettuce',rating:'4.6',reviews:'22',price:'SGD 3.80',unit:'/ 1 head',
   taste:[['Buttery',4],['Mild',4],['Crisp',3]],qty:'1 head',ingredients:'Butterhead lettuce',allergens:'None',chips:['Salads','Wraps','Burgers'],
   story:'Grown in water channels in our greenhouse and sold with the roots on so it stays fresh.',voice:'0:15',
   photos:['/preset/shop-lettuce-studio.jpg','/preset/shop-lettuce-photo.jpg'],ai:true,
   process:[['/preset/lettuce-picking.jpg','Lifting from the channel'],['/preset/lettuce-packing.jpg','Wrapped by hand']],
   r1:['N','nadia_k','2 days ago','Soft leaves, and it stays fresh with the roots on.','Fresh','Helpful (3)'],
   r2:['P','peter_w','5 days ago','Good lettuce, a little small this week.','Good value','Helpful (1)','Thanks, Peter. The next harvest is bigger.']}
 };
 var order=['Raw wildflower honey','Wildflower Honey','Lemongrass Tea','Fresh spinach','Goat milk','Sourdough loaf','Goat cheese','Apricot jam','Pandan kaya','Sambal belacan','Microgreens','Butterhead lettuce'];
 var byMatch={};for(var id in products)byMatch[products[id].match]=id;
 var tea=products.tea;
 function current(){try{return products[sessionStorage.getItem(key)]||tea;}catch(e){return tea;}}
 // [layer name or node id, text on the tea page, field] for every product field on the page.
 function rules(p){
  var f=farms[p.farm],t=tea,ft=farms.gv,m={};
  function add(layer,from,to){if(from!==to)m[layer+'|'+from]=to;}
  add('Name',t.name,p.name);add('Farm',ft.name+', '+ft.km,f.name+', '+f.km);add('Farm',t.rating+' ('+t.reviews+')',p.rating+' ('+p.reviews+')');
  add('Price',t.price,p.price);add('Price',t.unit,p.unit);
  for(var i=0;i<3;i++){add('Taste',t.taste[i][0],p.taste[i][0]);add('Chip',t.chips[i],p.chips[i]);}
  add('Product information',t.qty,p.qty);add('Product information',t.ingredients,p.ingredients);add('Product information',t.allergens,p.allergens);
  add('Farm story card',ft.who+', '+ft.name,f.who+', '+f.name);add('Farm story card',t.story,p.story);add('Voice','Hear '+ft.who+', '+t.voice,'Hear '+f.who+', '+p.voice);
  add('Button','See all '+t.reviews,'See all '+p.reviews);add('Rating summary',t.rating,p.rating);add('Detail',t.reviews+' reviews',p.reviews+' reviews');
  ['Avatar','Who','Header','Review card'].forEach(function(l,i){add(l,t.r1[i],p.r1[i]);add(l,t.r2[i],p.r2[i]);});
  add('Tags',t.r1[4],p.r1[4]);add('Tag',t.r2[4],p.r2[4]);add('Helpful',t.r1[5],p.r1[5]);add('Helpful',t.r2[5],p.r2[5]);
  add('Reply',ft.name+' replied',f.name+' replied');add('Reply',t.r2[6],p.r2[6]);
  ft.certs.forEach(function(c,i){add('Certified badge',c,f.certs[i]);add('Certified badge',certNote[c],certNote[f.certs[i]]);});
  add('Button','Add for '+t.price,p.soldOut?'Sold out':'Add for '+p.price);
  return m;
 }
 // Basket and checkout follow the product the shopper added (Figma "Basket", "Checkout").
 // The first farm group holds that product, with the welcome deal (10% off a first order from
 // that farm) and free delivery from SGD 10.20. Happy Hill's goat milk and goat cheese are
 // already in the basket, so adding one of them raises its count instead.
 var shortName={gv:'Green Valley',bg:'Bee Good',hh:'Happy Hill',rb:'Riverbend',ff:'Field and Flour',kp:'Kampung Pantry',sg:'Sunrise Greens'};
 var hhItems={milk:'I1447:3631;1091:388',cheese:'I1447:3634;1091:388'};
 function money(n){return 'SGD '+n.toFixed(2);}
 function num(p){return parseFloat(p.price.replace('SGD ',''));}
 function basketState(){
  var id='tea';try{id=sessionStorage.getItem(basketKey)||'tea';}catch(e){}
  if(id==='honey'&&!products.honey.soldOut)id='honey';else if(id==='honey')id='gv-honey';
  var added=products[id]||tea,slot=hhItems[id]?tea:added,extra=hhItems[id]?id:null;
  var sp=num(slot),hh=6.5+9.8+(extra?num(added):0),deal=Math.round(sp*10)/100,free=sp>=10.2;
  var delivery=(free?0:1.5)+1.5,items=3+(extra?1:0),f=farms[slot.farm];
  var m={};function add(node,from,to){if(from!==to)m[node+'|'+from]=to;}
  add('1270:779','SGD 4.20 more for free delivery',free?'Free delivery unlocked':money(10.2-sp)+' more for free delivery');
  add('1447:3616','Green Valley Farm',f.name);add('1447:3673','Green Valley Farm',f.name);
  add('I1447:3621;1091:388',tea.name,slot.name);add('I1447:3621;1091:389',tea.price+' '+tea.unit,slot.price+' '+slot.unit);
  add('I1482:5063;1091:314','Your first order from Green Valley','Your first order from '+shortName[slot.farm]);
  add('I1482:5063;1091:315','-SGD 0.60','-'+money(deal));add('1482:5095','Welcome deal, Green Valley','Welcome deal, '+shortName[slot.farm]);add('1482:5096','-SGD 0.60','-'+money(deal));
  add('1447:3658','SGD 21.70',money(sp-deal+hh));add('I1447:3659;1145:650','Check out (3)','Check out ('+items+')');
  add('I1447:3677;1091:302','Delivery SGD 1.50',free?'Free delivery':'Delivery SGD 1.50');
  add('1447:3682','2 items',extra?'3 items':'2 items');
  add('1447:3694','Subtotal (3 items)','Subtotal ('+items+' items)');add('1447:3695','SGD 22.30',money(sp+hh));
  add('1447:3697','Delivery (2 farms)',free?'Delivery (1 farm)':'Delivery (2 farms)');add('1447:3698','SGD 3.00',money(delivery));
  add('1447:3701','SGD 24.70',money(sp+hh+delivery-deal));add('1447:3705','SGD 24.70',money(sp+hh+delivery-deal));
  return {map:m,slot:slot,extra:extra,width:free?'100%':Math.round(sp/10.2*100)+'%',isTea:slot===tea&&!extra};
 }
 var on='var(--color-primary-500,#19a35a)',off='var(--color-neutral-200,#e0e0dc)';
 // Swap text inside root by rules keyed on the closest Figma layer name or node id.
 function swapText(root,map,skip){
  var walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
  while((n=walk.nextNode())){
   var el=n.parentElement;if(!el||(skip&&el.closest(skip)))continue;var cur=n.nodeValue.trim();if(!cur)continue;
   var orig=el.getAttribute('data-tea-text');var base=orig!=null?orig:cur;
   var named=el.closest('[data-name]'),noded=el.closest('[data-node-id]');
   var next=map?(map[(named&&named.getAttribute('data-name'))+'|'+base]||map[(noded&&noded.getAttribute('data-node-id'))+'|'+base]):null;
   // The certificate note names the farm inside a longer sentence.
   if(!next&&map&&map.__farm&&base.indexOf('This product is covered by '+farms.gv.name)===0)next=base.replace(farms.gv.name,map.__farm);
   if(next){if(orig==null)el.setAttribute('data-tea-text',cur);if(cur!==next)n.nodeValue=next;}
   else if(orig!=null){if(cur!==orig)n.nodeValue=orig;el.removeAttribute('data-tea-text');}
  }
 }
 function setSrc(img,want){if(!img)return;var preset=img.getAttribute('data-preset')||img.getAttribute('src');if(preset!==want){img.removeAttribute('data-preset');img.setAttribute('src',want);}}
 function page(){var name=document.querySelector('[data-node-id="1673:7018"]');return name?name.closest('[data-node-id="1447:3373"]')||document.body:null;}
 var shown=0,shownFor=null;
 function photo(root,p){
  var hero=root.querySelector('[data-name="Hero"]');if(!hero)return;
  if(shownFor!==p)shown=0;shownFor=p;if(shown>=p.photos.length)shown=0;
  setSrc(hero.querySelector('[data-name="Product photo"] img'),p.photos[shown]);
  var two=p.photos.length>1;
  // Label: touched up on the first photo, "Original photo" on the farmer's own photo.
  var label=null,w=document.createTreeWalker(hero,NodeFilter.SHOW_TEXT),n;
  while((n=w.nextNode()))if(/Photo touched up by Sprout AI|Original photo/.test(n.nodeValue)){label=n;break;}
  if(label){var box=label.parentElement.closest('[data-node-id]')||label.parentElement;
   var want=p.ai&&shown===0?'Photo touched up by Sprout AI':'Original photo';if(label.nodeValue!==want)label.nodeValue=want;
   var chip=box.parentElement&&box.parentElement!==hero?box.parentElement:box;chip.style.display=p.ai||two?'':'none';
   var icon=chip.querySelector('img,svg');if(icon)icon.style.display=want==='Original photo'?'none':'';}
  var d1=hero.querySelector('[data-node-id="1710:2417"]'),d2=hero.querySelector('[data-node-id="1710:2418"]');
  if(d1&&d2){var dots=d1.parentElement;dots.style.display=two?'':'none';
   [d1,d2].forEach(function(d,i){if(d.getAttribute('data-w')==null)d.setAttribute('data-w',d.getBoundingClientRect().width||(i?6:16));
    var on=i===shown;d.style.width=(on?16:6)+'px';d.style.opacity=on?'1':'0.6';});}
  hero.style.cursor=two?'pointer':'';
 }
 // Farmer photos with a caption (Figma component "Story photo"). Built once, then refilled.
 function photoRow(row,list){
  if(!row){row=document.createElement('div');row.setAttribute('data-name','Photos');row.className='story-photos';}
  if(row.getAttribute('data-for')!==JSON.stringify(list)){row.setAttribute('data-for',JSON.stringify(list));row.innerHTML='';
   list.forEach(function(it){var f=document.createElement('figure');f.setAttribute('data-name','Story photo');
    var img=document.createElement('img');img.src=it[0];img.alt=it[1];var c=document.createElement('figcaption');c.textContent=it[1];
    f.appendChild(img);f.appendChild(c);row.appendChild(f);});}
  return row;
 }
 // Product page: "From picking to packing", the photos the farmer added for this product.
 function process(root,p){
  var story=root.querySelector('[data-name="Story"]');if(!story)return;
  var sec=story.parentElement.querySelector(':scope > [data-name="Picking to packing"]');
  if(!p.process){if(sec)sec.style.display='none';return;}
  if(!sec){sec=document.createElement('div');sec.setAttribute('data-name','Picking to packing');sec.className='story-section';
   var head=story.querySelector('[data-node-id="1673:7095"]');var h=document.createElement('p');h.className=head?head.className:'';h.style.fontVariationSettings=head?head.style.fontVariationSettings:'';h.textContent='From picking to packing';
   sec.appendChild(h);story.after(sec);}
  sec.style.display='';var row=sec.querySelector('[data-name="Photos"]'),r=photoRow(row,p.process);if(!row)sec.appendChild(r);
 }
 // Farm page "Our story": the photos each farm added to its profile.
 var farmPhotos={gv:[['/preset/farm-products.jpg','Our products'],['/preset/farm-process.jpg','Harvesting lemongrass']],
  bg:[['/preset/bg-farm.jpg','Our honey and jam'],['/preset/bg-apiary.jpg','Our hives']],
  hh:[['/preset/hh-farm.jpg','Our milk and cheese'],['/preset/hh-goats.jpg','Our goats']],
  rb:[['/preset/rb-farm.jpg','Our fields'],['/preset/spinach-picking.jpg','Picking at dawn']],
  ff:[['/preset/ff-bakery.jpg','Our bakery'],['/preset/sourdough-shaping.jpg','Shaping the dough']],
  kp:[['a/94ef5fbd-842f-4c39-af81-8f6f719cbaf8.jpg','Our kitchen'],['/preset/kaya-cooking.jpg','Stirring the kaya']],
  sg:[['a/76ec87a3-6302-4fb9-9f17-f6868198ff03.jpg','Our greenhouse'],['/preset/microgreens-trays.jpg','Our grow room']]};
 function farmStory(){
  [['1447:3495',farmPhotos.gv],['1468:7115',farmPhotos.gv],['1447:3521',farmPhotos[(/^#farm-(\w+)/.exec(location.hash)||[])[1]]||farmPhotos.bg],['1447:3547',farmPhotos.hh]].forEach(function(f){
   var sec=document.querySelector('[data-node-id="'+f[0]+'"]');if(!sec)return;
   var row=sec.querySelector(':scope > [data-name="Photos"]');if(row){photoRow(row,f[1]);return;}
   var title=sec.querySelector(':scope > [data-name="Section title"]');var r=photoRow(null,f[1]);
   if(title)title.after(r);else sec.prepend(r);});
 }
 var busy=false;
 function apply(){
  if(busy)return;busy=true;
  try{
   var root=page();
   if(root){
    var p=current(),map=p===tea?null:rules(p);if(map)map.__farm=farms[p.farm].name;
    // "More like this" cards keep their own names.
    swapText(root,map,'[data-name="Product card"]');
    root.querySelectorAll('[data-name="Dots"]').forEach(function(row){
     var label=row.parentElement&&row.parentElement.querySelector('p');var name=label&&label.textContent.trim(),level=null;
     p.taste.forEach(function(t){if(t[0]===name)level=t[1];});
     Array.prototype.forEach.call(row.children,function(dot,i){
      if(dot.getAttribute('data-tea-bg')==null)dot.setAttribute('data-tea-bg',dot.style.background||'');
      dot.style.background=level&&p!==tea?(i<level?on:off):dot.getAttribute('data-tea-bg');
     });
    });
    photo(root,p);
    process(root,p);
    var addBtn=document.querySelector('[data-node-id="1447:3411"]');if(addBtn){addBtn.style.pointerEvents=p.soldOut?'none':'';addBtn.style.opacity=p.soldOut?'0.5':'';}
    // Hide the card for the product that is open.
    root.querySelectorAll('[data-name="Product card"]').forEach(function(card){card.style.display=card.textContent.indexOf(p.name)>=0?'none':'';});
   }
   farmStory();
   var basket=document.querySelector('[data-name="Free delivery bar"],[data-node-id="1447:3695"]');
   if(basket){
    var st=basketState();swapText(document.body,st.isTea?null:st.map);
    var bar=document.querySelector('[data-name="Free delivery bar"] [data-name="Bar"]');
    if(bar){if(bar.getAttribute('data-tea-width')==null)bar.setAttribute('data-tea-width',bar.style.width||'');bar.style.width=st.isTea?bar.getAttribute('data-tea-width'):st.width;}
    // The first farm's item photo in the basket and its thumbnail in checkout.
    document.querySelectorAll('[data-node-id="I1447:3621;1091:382"] img,[data-node-id="1447:3676"] img,img[data-node-id="1447:3676"]').forEach(function(item){setSrc(item,st.slot.photos[0]);});
    // Count for a Happy Hill item that was added again.
    for(var k in hhItems){var t=document.querySelector('[data-node-id="'+hhItems[k]+'"]');var row=t&&t.closest('[data-name="List row"]');var q=row&&row.querySelector('[data-node-id="1087:299"]');
     if(q){var qn=null,w=document.createTreeWalker(q,NodeFilter.SHOW_TEXT),x;while((x=w.nextNode()))if(x.nodeValue.trim()){qn=x;break;}
      if(qn){var want=st.extra===k?'2':'1';if(qn.nodeValue.trim()!==want)qn.nodeValue=want;}}}
   }
  }finally{busy=false;}
 }
 function productIn(el){
  var text=el.textContent||'';
  for(var i=0;i<order.length;i++)if(text.indexOf(order[i])>=0)return byMatch[order[i]];
  var img=el.querySelector('img');var src=img?(img.getAttribute('data-preset')||img.getAttribute('src')||''):'';
  if(/\/preset\/honey-/.test(src))return 'gv-honey';
  return 'tea';
 }
 // Remember which product the shopper opened.
 document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  // Adding from the product page puts that product in the basket.
  var add=e.target.closest('[data-node-id="I1447:3411;1145:650"],[data-node-id="1447:3411"]');
  if(add){try{sessionStorage.setItem(basketKey,sessionStorage.getItem(key)||'tea');}catch(err){}return;}
  // Tap the photo to see the next one.
  var hero=e.target.closest('[data-name="Hero"]');
  if(hero&&swiped){swiped=false;return;}
  if(hero&&!e.target.closest('[data-name="Icon button"]')&&page()){var p=current();if(p.photos.length>1){var r=hero.getBoundingClientRect();shown=e.clientX-r.left>r.width*0.4?Math.min(p.photos.length-1,shown+1):Math.max(0,shown-1);apply();}return;}
  var card=e.target.closest('[data-name="Product card"],[data-name="FP product"],[data-name="Answer item"],[data-name="Compare card"]');if(!card)return;
  var id=productIn(card);
  try{sessionStorage.setItem(key,id);sessionStorage.setItem(farmKey,products[id].farm);}catch(err){}
  shown=0;
 },true);
 // Swipe the photo.
 var sx=null,swiped=false;
 document.addEventListener('pointerdown',function(e){sx=e.target.closest&&e.target.closest('[data-name="Hero"]')?e.clientX:null;},true);
 document.addEventListener('pointerup',function(e){if(sx==null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)<40||!page())return;var p=current();if(p.photos.length<2)return;swiped=true;shown=dx<0?Math.min(p.photos.length-1,shown+1):Math.max(0,shown-1);apply();},true);
 var queued=false;
 new MutationObserver(function(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;apply();},0);}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 document.addEventListener('DOMContentLoaded',apply);
})();

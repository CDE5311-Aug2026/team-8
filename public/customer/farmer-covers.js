// Shows each product with the farmer's current design. The farmer app saves one picture per
// published product (farmily-shop-covers); this swaps the preset photos in the customer prototype.
(function(){
 var covers={};
 function load(){try{var raw=JSON.parse(localStorage.getItem('farmily-shop-covers')||'{}');covers={};for(var k in raw)if(raw[k]&&typeof raw[k].url==='string')covers[k]=raw[k].url;}catch(e){covers={};}}
 function keyOf(src){var m=/\/preset\/(honey|tea|kaya|jam)-[a-z]+-(studio|photo)\.jpg/.exec(src||'');return m?m[1]:null;}
 function swap(img){var cur=img.getAttribute('src');var original=keyOf(cur)?cur:img.getAttribute('data-preset');var key=keyOf(original);if(!key)return;
  var next=covers[key]||original;
  // A preset cover has a matching on-photo shot: use it where the shop shows the packed photo.
  if(/-photo\.jpg$/.test(original)&&/^\/preset\/.+-studio\.jpg$/.test(next))next=next.replace(/-studio\.jpg$/,'-photo.jpg');if(img.getAttribute('src')!==next){img.setAttribute('data-preset',original);img.setAttribute('src',next);}}
 function all(root){(root.querySelectorAll?root:document).querySelectorAll('img').forEach(swap);}
 load();
 new MutationObserver(function(list){list.forEach(function(m){if(m.type==='attributes'){if(m.target.tagName==='IMG'&&keyOf(m.target.getAttribute('src')))swap(m.target);}else m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.tagName==='IMG')swap(n);else all(n);});});}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 window.addEventListener('storage',function(e){if(e.key==='farmily-shop-covers'){load();all(document);}});
 document.addEventListener('DOMContentLoaded',function(){all(document);});
})();

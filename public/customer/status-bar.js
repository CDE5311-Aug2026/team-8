// The phone's top bar (Safari, or the home-screen app) takes the colour at the top of the page,
// so it turns orange under an orange header and back to light when the page scrolls on.
(function(){
 var meta=document.querySelector('meta[name="theme-color"]');if(!meta)return;
 var svgFill={},canvas=document.createElement('canvas');canvas.width=canvas.height=1;
 var ctx=canvas.getContext('2d',{willReadFrequently:true});
 function opaque(c){return c&&c!=='transparent'&&!/rgba\([^)]*,\s*0\)$/.test(c);}
 // Colour of an image at the given point: SVGs by their first fill, photos by the pixel.
 function imageColour(img,x,y){
  var src=img.currentSrc||img.src;
  if(/\.svg(\?|$)/.test(src)){
   if(!(src in svgFill)){svgFill[src]=null;fetch(src).then(function(r){return r.text();}).then(function(t){var m=/fill="(#[0-9a-fA-F]{3,8})"/.exec(t);svgFill[src]=m?m[1]:'';later();}).catch(function(){svgFill[src]='';});}
   return svgFill[src]||null;
  }
  try{var r=img.getBoundingClientRect();if(!img.naturalWidth||!r.width)return null;
   ctx.clearRect(0,0,1,1);ctx.drawImage(img,(x-r.left)/r.width*img.naturalWidth,(y-r.top)/r.height*img.naturalHeight,1,1,0,0,1,1);
   var d=ctx.getImageData(0,0,1,1).data;return d[3]>200?'rgb('+d[0]+', '+d[1]+', '+d[2]+')':null;}catch(e){return null;}
 }
 function colourAt(x,y){
  var list=document.elementsFromPoint(x,y);
  for(var i=0;i<list.length;i++){
   var el=list[i];
   if(el.tagName==='IMG'){var c=imageColour(el,x,y);if(c)return c;continue;}
   var bg=getComputedStyle(el).backgroundColor;if(opaque(bg))return bg;
  }
  return '#f5f5f2';
 }
 var timer=null;
 function update(){timer=null;var c=colourAt(window.innerWidth/2,2);if(meta.getAttribute('content')!==c)meta.setAttribute('content',c);}
 function later(){if(!timer)timer=setTimeout(update,60);}
 document.addEventListener('scroll',later,true);
 window.addEventListener('hashchange',function(){setTimeout(later,350);});
 new MutationObserver(later).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('load',later);
})();

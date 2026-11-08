import {useEffect,useRef,type RefObject} from 'react';
import {dismissDrawerDrag,drawerDragIntent} from '../shared/drawerGesture';
import './drawer-dismiss.css';
const controls='button,input,textarea,select,a,[contenteditable="true"],[role="slider"],[role="combobox"]';
type Drag={x:number;y:number;time:number;distance:number;locked:boolean;ignored:boolean;pointerId?:number};
export default function useDrawerDismiss(rootRef:RefObject<HTMLElement|null>,open:boolean,onDismiss:()=>void,selector:string){
 const dismiss=useRef(onDismiss);dismiss.current=onDismiss;
 useEffect(()=>{const root=rootRef.current,panel=root?.querySelector<HTMLElement>(selector);if(!open||!root||!panel)return;
  let drag:Drag|null=null,closing=false,outsideDown=false,suppressUntil=0,timer:ReturnType<typeof setTimeout>|undefined;
  const original={transform:panel.style.transform,transition:panel.style.transition,willChange:panel.style.willChange};
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reset(){panel!.style.transition=reduced()?'none':'transform 180ms ease-out';panel!.style.transform=original.transform;panel!.classList.remove('drawer-dragging');}
  function close(){if(closing)return;closing=true;suppressUntil=performance.now()+400;panel!.classList.remove('drawer-dragging');panel!.getAnimations().forEach(animation=>animation.cancel());panel!.style.transition=reduced()?'none':'transform 160ms ease-in';panel!.style.transform=`translate3d(0,${panel!.getBoundingClientRect().height+24}px,0)`;timer=setTimeout(()=>dismiss.current(),reduced()?0:160);}
  function scrollableAboveTop(target:Element){for(let node:Element|null=target;node&&node!==panel;node=node.parentElement){if(node.scrollHeight>node.clientHeight+1&&node.scrollTop>0)return true;}return false;}
  function begin(target:EventTarget|null,x:number,y:number,pointerId?:number){if(closing||!(target instanceof Element)||target.closest(controls)||scrollableAboveTop(target))return;drag={x,y,time:performance.now(),distance:0,locked:false,ignored:false,pointerId};}
  function move(x:number,y:number,event:Event){if(!drag||drag.ignored||closing)return;const dx=x-drag.x,dy=y-drag.y;if(!drag.locked){const intent=drawerDragIntent(dx,dy);if(intent==='ignore'){drag.ignored=true;return;}if(intent!=='down')return;drag.locked=true;panel!.getAnimations().forEach(animation=>animation.cancel());panel!.style.transition='none';panel!.style.willChange='transform';panel!.classList.add('drawer-dragging');}if(event.cancelable)event.preventDefault();drag.distance=Math.max(0,dy);panel!.style.transform=`translate3d(0,${drag.distance}px,0)`;}
  function finish(event:Event,cancelled=false){if(!drag)return;const current=drag;drag=null;if(current.locked){if(event.cancelable)event.preventDefault();suppressUntil=performance.now()+350;if(!cancelled&&dismissDrawerDrag(current.distance,performance.now()-current.time,panel!.getBoundingClientRect().height))close();else reset();}if(current.pointerId!==undefined&&panel!.hasPointerCapture(current.pointerId))panel!.releasePointerCapture(current.pointerId);}
  function pointerDown(event:PointerEvent){if(event.pointerType!=='mouse'||event.button!==0)return;const target=event.target;if(!(target instanceof Element)||!((target===panel)||target.closest('header,.v2-dialog-handle,.v2-handle,.brand-v2-handle,h2')))return;begin(target,event.clientX,event.clientY,event.pointerId);if(drag)panel!.setPointerCapture(event.pointerId);}
  function pointerMove(event:PointerEvent){if(event.pointerType==='mouse')move(event.clientX,event.clientY,event);}
  function pointerUp(event:PointerEvent){if(event.pointerType==='mouse')finish(event);}
  function pointerCancel(event:PointerEvent){if(event.pointerType==='mouse')finish(event,true);}
  function touchStart(event:TouchEvent){if(event.touches.length!==1){drag=null;reset();return;}const touch=event.touches[0];begin(event.target,touch.clientX,touch.clientY);}
  function touchMove(event:TouchEvent){if(event.touches.length!==1){finish(event,true);return;}const touch=event.touches[0];if(drag&&!drag.ignored&&touch.clientY>drag.y&&touch.clientY-drag.y>Math.abs(touch.clientX-drag.x)*1.2&&event.cancelable)event.preventDefault();move(touch.clientX,touch.clientY,event);}
  function touchEnd(event:TouchEvent){finish(event);}
  function touchCancel(event:TouchEvent){finish(event,true);}
  function outsideStart(event:PointerEvent){outsideDown=!panel!.contains(event.target as Node);}
  function click(event:MouseEvent){if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();return;}if(outsideDown&&!panel!.contains(event.target as Node)){event.preventDefault();event.stopImmediatePropagation();close();}}
  panel.addEventListener('pointerdown',pointerDown);panel.addEventListener('pointermove',pointerMove);panel.addEventListener('pointerup',pointerUp);panel.addEventListener('pointercancel',pointerCancel);
  panel.addEventListener('touchstart',touchStart,{passive:true});panel.addEventListener('touchmove',touchMove,{passive:false});panel.addEventListener('touchend',touchEnd,{passive:false});panel.addEventListener('touchcancel',touchCancel);
  root.addEventListener('pointerdown',outsideStart,true);root.addEventListener('click',click,true);
  return()=>{clearTimeout(timer);panel.removeEventListener('pointerdown',pointerDown);panel.removeEventListener('pointermove',pointerMove);panel.removeEventListener('pointerup',pointerUp);panel.removeEventListener('pointercancel',pointerCancel);panel.removeEventListener('touchstart',touchStart);panel.removeEventListener('touchmove',touchMove);panel.removeEventListener('touchend',touchEnd);panel.removeEventListener('touchcancel',touchCancel);root.removeEventListener('pointerdown',outsideStart,true);root.removeEventListener('click',click,true);Object.assign(panel.style,original);panel.classList.remove('drawer-dragging');};
 },[open,rootRef,selector]);
}

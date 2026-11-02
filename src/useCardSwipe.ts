import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
type Direction=-1|1;
export default function useCardSwipe(onSwipe:(direction:Direction)=>void){
 const [motion,setMotion]=useState<{x:number;y:number;phase:'rest'|'dragging'|'exit'|'enter';direction:Direction}>({x:0,y:0,phase:'rest',direction:1});
 const origin=useRef<{x:number;y:number;id:number}|null>(null);const busy=useRef(false);const dragged=useRef(false);const timers=useRef<ReturnType<typeof setTimeout>[]>([]);const action=useRef(onSwipe);action.current=onSwipe;
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
 function animate(direction:Direction,after=()=>action.current(direction)){
  if(busy.current)return;origin.current=null;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setMotion({x:0,y:0,phase:'rest',direction});after();return;}
  busy.current=true;setMotion(m=>({...m,phase:'exit',direction}));
  timers.current.push(setTimeout(()=>{after();setMotion({x:0,y:0,phase:'enter',direction});busy.current=false;timers.current.push(setTimeout(()=>setMotion(m=>m.phase==='enter'?{...m,phase:'rest'}:m),220));},280));
 }
 function onPointerDown(e:PointerEvent<HTMLElement>){if(busy.current||!e.isPrimary||e.button!==0||(e.target as HTMLElement).closest('button,input,textarea,select,a'))return;dragged.current=false;origin.current={x:e.clientX,y:e.clientY,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}
 function onPointerMove(e:PointerEvent<HTMLElement>){const p=origin.current;if(!p||p.id!==e.pointerId||busy.current)return;const x=e.clientX-p.x,y=e.clientY-p.y;if(Math.abs(x)>10&&Math.abs(x)>Math.abs(y)*1.15){dragged.current=true;e.preventDefault();setMotion({x,y:y*.12,phase:'dragging',direction:x>0?1:-1});}}
 function onPointerUp(e:PointerEvent<HTMLElement>){const p=origin.current;if(!p||p.id!==e.pointerId)return;origin.current=null;const x=e.clientX-p.x,y=e.clientY-p.y;if(Math.abs(x)>70&&Math.abs(x)>Math.abs(y)*1.2)animate(x>0?1:-1);else setMotion(m=>({...m,x:0,y:0,phase:'rest'}));}
 function onPointerCancel(){origin.current=null;setMotion(m=>m.phase==='exit'?m:{...m,x:0,y:0,phase:'rest'});}
 return {animate,busy:motion.phase==='exit',dragged,className:`swipe-card swipe-card-${motion.phase}`,style:{'--swipe-x':`${motion.x}px`,'--swipe-y':`${motion.y}px`,'--swipe-rotate':`${Math.max(-16,Math.min(16,motion.x*.035))}deg`,'--swipe-exit-rotate':`${motion.direction*16}deg`,'--swipe-exit':`${motion.direction*Math.max(520,window.innerWidth)}px`} as CSSProperties,handlers:{onPointerDown,onPointerMove,onPointerUp,onPointerCancel}};
}

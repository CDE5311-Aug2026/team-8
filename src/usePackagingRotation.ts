import {useId,useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import './packaging-rotation.css';
const clamp=(angle:number)=>Math.max(-60,Math.min(60,angle));
export default function usePackagingRotation(angle:number,onAngle:(angle:number)=>void){
 const descriptionId=useId();const drag=useRef<{id:number;x:number;y:number;angle:number;axis:'pending'|'horizontal'|'vertical'}|null>(null);const [dragging,setDragging]=useState(false);
 function finish(event:PointerEvent<HTMLDivElement>){if(drag.current?.id!==event.pointerId)return;drag.current=null;setDragging(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
 return {descriptionId,props:{tabIndex:0,role:'group','aria-label':'Rotate packaging','aria-describedby':descriptionId,'data-model-dragging':dragging,
  onPointerDown:(event:PointerEvent<HTMLDivElement>)=>{if(!event.isPrimary||event.button!==0||drag.current)return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,angle,axis:'pending'};event.currentTarget.setPointerCapture(event.pointerId);},
  onPointerMove:(event:PointerEvent<HTMLDivElement>)=>{const start=drag.current;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(start.axis==='pending'){if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;start.axis=Math.abs(dx)>Math.abs(dy)?'horizontal':'vertical';}if(start.axis!=='horizontal')return;event.preventDefault();setDragging(true);onAngle(clamp(start.angle+dx*.5));},
  onPointerUp:finish,onPointerCancel:finish,onLostPointerCapture:()=>{drag.current=null;setDragging(false);},onDragStart:(event:React.DragEvent<HTMLDivElement>)=>event.preventDefault(),
  onKeyDown:(event:KeyboardEvent<HTMLDivElement>)=>{if(event.target!==event.currentTarget)return;const next=event.key==='ArrowLeft'?angle-5:event.key==='ArrowRight'?angle+5:event.key==='Home'?0:null;if(next===null)return;event.preventDefault();onAngle(clamp(next));},
 }};
}

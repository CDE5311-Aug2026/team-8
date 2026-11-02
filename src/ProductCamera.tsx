import {useEffect,useRef,useState} from 'react';

import {addProductAssets} from './addProductAssets';
type CameraCapabilities=MediaTrackCapabilities&{zoom?:{min:number;max:number;step:number};torch?:boolean};
export default function ProductCamera({onCapture,onClose,variant='v2'}:{onCapture:(photo:string)=>void;onClose:()=>void;variant?:'legacy'|'v2'}){
 const video=useRef<HTMLVideoElement>(null);const stream=useRef<MediaStream|null>(null);
 const [error,setError]=useState('');const [ready,setReady]=useState(false);const [zoom,setZoom]=useState(1);const [flash,setFlash]=useState(false);const [capabilities,setCapabilities]=useState<CameraCapabilities>({});
 useEffect(()=>{
  let cancelled=false;
  async function open(){try{
   const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920}},audio:false});
   if(cancelled){next.getTracks().forEach(track=>track.stop());return;}
   stream.current=next;setCapabilities(next.getVideoTracks()[0].getCapabilities?.()||{});
   if(video.current){video.current.srcObject=next;await video.current.play();setReady(true);}
  }catch{if(!cancelled)setError('Camera access is unavailable. Allow camera access or close this view and upload a photo.');}}
  void open();return()=>{cancelled=true;stream.current?.getTracks().forEach(track=>track.stop());};
 },[]);
 async function adjust(value:number,torch=flash){
  const track=stream.current?.getVideoTracks()[0];if(!track)return;
  try{await track.applyConstraints({advanced:[{...(capabilities.zoom?{zoom:value}:{}),...(capabilities.torch?{torch}: {})} as MediaTrackConstraintSet]});setZoom(value);setFlash(torch);}catch{setError('This camera could not apply that setting. You can still take a photo.');}
 }
 function capture(){const source=video.current;if(!source?.videoWidth)return;const canvas=document.createElement('canvas');const scale=Math.min(1,1280/source.videoWidth);canvas.width=Math.round(source.videoWidth*scale);canvas.height=Math.round(source.videoHeight*scale);canvas.getContext('2d')?.drawImage(source,0,0,canvas.width,canvas.height);onCapture(canvas.toDataURL('image/jpeg',.85));}
 return <div className="ap-camera"><video ref={video} playsInline muted autoPlay aria-label="Live product camera"/><div className="ap-camera-top"><button aria-label="Close camera" onClick={onClose}><img alt="" src={addProductAssets['1142:2223_imgIconX']}/></button><span>Product photo</span><span className="ap-camera-spacer"/></div><div className="ap-camera-guide"><img alt="" src={addProductAssets['1142:2223_imgIconSparkle']}/>Move a little closer</div><div className="ap-camera-frame" aria-hidden="true"/>{error&&<p className="ap-camera-error" role="alert">{error}</p>}<div className="ap-camera-shutter">{[.5,1].map((value,index)=><button className={index?'ap-camera-zoom-right':'ap-camera-zoom-left'} key={value} disabled={!capabilities.zoom||value<capabilities.zoom.min||value>capabilities.zoom.max} aria-label={`Camera zoom ${value} times`} aria-pressed={zoom===value} onClick={()=>void adjust(value)}>{value===1?'1×':'.5×'}</button>)}<button className="ap-shutter" aria-label="Take product photo" disabled={!ready} onClick={capture}><img alt="" src={addProductAssets['1142:2223_imgShutter']}/></button></div></div>;

}

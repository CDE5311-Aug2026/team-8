import {useEffect,useRef,useState} from 'react';
import {productAsset as asset} from './productAssets';
type CameraCapabilities=MediaTrackCapabilities&{zoom?:{min:number;max:number;step:number};torch?:boolean};
export default function ProductCamera({onCapture,onClose}:{onCapture:(photo:string)=>void;onClose:()=>void}){
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
 return <div className="product-camera"><video ref={video} playsInline muted autoPlay aria-label="Live product camera"/><div className="pf-camera-status" aria-hidden="true"><b>9:41</b><span className="pf-island"/><img src={asset('status-light.svg')} alt=""/></div><div className="pf-camera-toolbar"><button type="button" aria-label="Close camera" onClick={onClose}><img src={asset('camera-close.svg')} alt=""/></button><span>Product photo</span><button type="button" aria-label="Toggle camera flash" aria-pressed={flash} disabled={!capabilities.torch} onClick={()=>void adjust(zoom,!flash)}><img src={asset('flash.svg')} alt=""/></button></div><p className="pf-camera-guide">✦ Move a little closer</p><div className="pf-viewfinder" aria-hidden="true"><i/><i/><i/><i/></div>{error&&<p className="pf-camera-error" role="alert">{error}</p>}<div className="pf-camera-bottom"><div className="pf-camera-zoom">{[.5,1,2].map(value=><button type="button" key={value} disabled={!capabilities.zoom||value<capabilities.zoom.min||value>capabilities.zoom.max} aria-label={`Camera zoom ${value} times`} aria-pressed={zoom===value} onClick={()=>void adjust(value)}>{value===1?'1×':value}</button>)}</div><button type="button" className="pf-shutter" disabled={!ready} aria-label="Take product photo" onClick={capture}><span/></button></div></div>;
}

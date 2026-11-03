import type {CSSProperties,ReactNode} from 'react';
import type {SamplePackaging} from '../shared/samplePackaging';
import './sample-packaging.css';
export default function SamplePackagingPreview({spec,label,mode,angle,onAngle}:{spec:SamplePackaging;label:ReactNode;mode:'photo'|'3d';angle:number;onAngle:(angle:number)=>void}){
 if(mode==='photo')return <div className="sample-packaging-photo"><img src={spec.image} alt={`Sample ${spec.name.toLowerCase()} packaging concept`}/><small>Generated sample packaging</small></div>;
 return <div className="sample-package-scene"><div className={`sample-package-model sample-package-${spec.kind}`} style={{'--package-angle':`${angle}deg`,'--package-fill':spec.fill} as CSSProperties} role="img" aria-label={`${spec.name}: ${spec.material}, ${spec.closure}`}><div className="sample-package-lid"/><div className="sample-package-body"><div className="sample-package-label">{label}</div></div><div className="sample-package-side"/></div><label className="sample-package-rotate">Rotate {spec.name.toLowerCase()}<input aria-label="Rotate packaging" type="range" min={-35} max={35} value={angle} onChange={e=>onAngle(Number(e.target.value))}/></label></div>;
}

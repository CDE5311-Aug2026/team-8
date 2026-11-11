import usePackagingRotation from './usePackagingRotation';
import type {CSSProperties,ReactNode} from 'react';
import type {SamplePackaging} from '../shared/samplePackaging';
import './sample-packaging.css';
export default function SamplePackagingPreview({spec,label,mode,angle,onAngle}:{spec:SamplePackaging;label:ReactNode;mode:'photo'|'3d';angle:number;onAngle:(angle:number)=>void}){
 const rotation=usePackagingRotation(angle,onAngle);
 if(mode==='photo')return <div className="sample-packaging-photo"><img src={spec.image} alt={`Sample ${spec.name.toLowerCase()} packaging concept`}/><small>Packaging made by Sprout AI</small></div>;
 return <div className="sample-package-scene model-rotation" {...rotation.props}><div className={`sample-package-model sample-package-${spec.kind}`} style={{'--package-angle':`${angle}deg`,'--package-fill':spec.fill} as CSSProperties} role="img" aria-label={`${spec.name}: ${spec.material}, ${spec.closure}`}><div className="sample-package-lid"/><div className="sample-package-body"><div className="sample-package-label">{label}</div></div><div className="sample-package-side"/></div><span className="packaging-rotate-hint" aria-hidden="true">Drag to rotate</span><span id={rotation.descriptionId} className="packaging-rotate-keyboard">Drag left or right to rotate. Use the left and right arrow keys, or Home to reset.</span></div>;
}

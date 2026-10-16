import {Leaf} from 'lucide-react';
import {imageDisclosure,type BrandKit,type FarmerProfile} from '../shared/branding';

export default function BrandPreview({brand,profile,productName}:{brand:BrandKit;profile:FarmerProfile;productName?:string}){
 const {concept}=brand;
 return <figure className="brand-preview" style={{background:concept.colors[1],color:concept.colors[0],fontFamily:concept.typography==='serif'?"'Bree Serif', Georgia, serif":"'Lato', sans-serif"}}>
  <div className="brand-art">{brand.image?<img src={brand.image} alt={brand.imageSource==='ai'?'AI-generated decorative illustration based on the written farm profile':'Original photo supplied by the farmer'}/>:<div className="brand-botanical" aria-hidden="true"><Leaf size={76}/><Leaf size={38}/></div>}</div>
  <div className="brand-wordmark"><small style={{color:concept.colors[0]}}>FARMILY · BRAND & PACKAGING CONCEPT</small><h2 style={{color:concept.colors[0]}}>{profile.farmName}</h2><p>{productName||concept.tagline}</p><span className="brand-rule" style={{background:concept.colors[2]}}/></div>
  <figcaption>{imageDisclosure(brand.imageSource)}</figcaption>
 </figure>;
}

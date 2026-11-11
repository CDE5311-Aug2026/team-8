// A product's cover image. Preset themes have finished photos; a product with its own design
// (changes made in Your brand) is drawn from the brand instead, so every screen shows the same design.
import ProductPackaging from './ProductPackaging';
import './product-cover.css';
import {coverPhoto,presetDesignPhotos} from '../shared/presetProduct';
import {hasDesignTweaks,validDesignTweaks} from '../shared/labelTemplates';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';
import type {CSSProperties} from 'react';
export function hasOwnDesign(product:{designTweaks?:unknown;brandIdentity?:unknown}){return !!product.brandIdentity&&validDesignTweaks(product.designTweaks)&&hasDesignTweaks(product.designTweaks);}
export default function ProductCover({product,profile,brand,alt='',scale=.5,className}:{product:ProductDraft;profile:FarmerProfile;brand?:BrandKit|null;alt?:string;scale?:number;className?:string}){
 const kit=product.brandIdentity||brand;
 if(kit&&hasOwnDesign({...product,brandIdentity:kit})&&!presetDesignPhotos(product))return <div className={`product-cover-art ${className||''}`} role="img" aria-label={alt} style={{'--cover-scale':scale} as CSSProperties}><ProductPackaging product={product} profile={profile} brand={kit} mode="3d" initialAngle={-18}/></div>;
 const src=coverPhoto(product);return src?<img className={className} src={src} alt={alt}/>:null;
}

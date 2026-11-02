import {Palette,Plus} from 'lucide-react';
import {sameDesign,type BrandDesign} from '../shared/brandLibrary';
import type {BrandKit} from '../shared/branding';
import BrandPreview from './BrandPreview';
import DevBadge from './DevBadge';

export default function BrandDesigns({designs,current,onCreate}:{designs:BrandDesign[];current:BrandKit|null;onCreate:()=>void}){
 return <section className="card profile-brand-designs" aria-labelledby="profile-designs-title">
  <div className="row"><h2 id="profile-designs-title">Brand designs</h2><span className="badge">{designs.length} saved</span></div>
  <p>Your saved identities and packaging styles, all in one place.</p>
  <div className="profile-design-list">{designs.map(design=><details className="profile-design" key={design.id}>
   <summary><span className="profile-design-swatch" aria-hidden="true">{design.brand.concept.colors.map(color=><i key={color} style={{background:color}}/>)}</span><span className="profile-design-name"><strong>{design.brand.concept.name}</strong><small>{design.brand.origin==='existing'?'Existing brand':design.brand.designStyle||'Brand identity'}{design.savedAt&&<> · {new Date(design.savedAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</>}</small></span>{current&&sameDesign(current,design.brand)&&<span className="badge">Current</span>}</summary>
   <div className="profile-design-details">{design.brand.origin==='sample'&&<small><DevBadge/> Sample design</small>}<BrandPreview brand={design.brand} profile={design.profile}/><p>{design.brand.concept.tagline}</p><p>{design.brand.concept.packaging}</p></div>
  </details>)}</div>
  {!designs.length&&<div className="profile-design-empty"><Palette size={28}/><p>No saved designs yet.</p></div>}
  <button type="button" className="button secondary" onClick={onCreate}><Plus size={18}/>Create new branding</button>
 </section>;
}

// One design editor for Your brand and Add product. A design is the label style only:
// theme, label colour, picture and layout. Colours, fonts and logo come from the main brand;
// shape, name and weight come from the product it's used on.
import {Check} from 'lucide-react';
import type {CSSProperties,ReactNode} from 'react';
import Sprout from './Sprout';
import {ProductLabel} from './ProductPackaging';
import {designArtNames,designLayoutNames,designPapers,hasDesignTweaks,labelTemplateNames,labelTemplates,labelTheme,type DesignArt,type DesignLayout,type DesignTweaks,type LabelTemplate} from '../shared/labelTemplates';
import type {BrandKit,FarmerProfile} from '../shared/branding';
import type {ProductDraft} from '../shared/productFlow';
import './design-editor.css';

export type DesignChoice={template:LabelTemplate;tweaks:DesignTweaks};
export type DesignOption={id:string;name:string;note:string;design:DesignChoice};

const blank=(name:string):ProductDraft=>({name,photo:'',price:'',story:'',live:false,quantity:''} as ProductDraft);

// A flat label at a fixed size, scaled down to fit a tile or thumbnail.
export function LabelThumb({design,brand,profile,name='Product name',scale=.5}:{design:DesignChoice;brand:BrandKit;profile:FarmerProfile;name?:string;scale?:number}){
 const product={...blank(name),labelTemplate:design.template,designTweaks:hasDesignTweaks(design.tweaks)?design.tweaks:undefined};
 return <span className="de-label-thumb" style={{'--thumb-scale':scale} as CSSProperties}><span><ProductLabel product={product} profile={profile} brand={brand}/></span></span>;
}

// The label on its own, for a design that isn't on a product yet.
export function FlatLabelPreview({design,brand,profile,name}:{design:DesignChoice;brand:BrandKit;profile:FarmerProfile;name?:string}){
 return <div className="de-flat"><LabelThumb design={design} brand={brand} profile={profile} name={name||'Product name'} scale={1}/><small>Label only</small></div>;
}

type Props={
 brand:BrandKit;profile:FarmerProfile;value:DesignChoice;onChange:(next:DesignChoice)=>void;
 // Theme tile picture for a product with finished theme photos; otherwise the tile shows the label.
 tileImage?:(template:LabelTemplate)=>string|undefined;
 options?:DesignOption[];picked?:string|null;onPick?:(option:DesignOption)=>void;
 suggestions?:{label:string;apply:()=>void}[];
 children?:ReactNode;
 // Preset products only have finished photos for the three themes, so they pick a theme and nothing else.
 themesOnly?:boolean;
};

export default function DesignEditor({brand,profile,value,onChange,tileImage,options=[],picked,onPick,suggestions=[],children,themesOnly=false}:Props){
 const {template,tweaks}=value;const own=hasDesignTweaks(tweaks);
 const theme=labelTheme(brand,template);const papers=designPapers(brand);
 const change=(next:DesignTweaks)=>onChange({template,tweaks:{...tweaks,...next}});
 return <>
  {!themesOnly&&!!options.length&&<section className="de-section"><h2>Your designs</h2><div className="de-designs" role="radiogroup" aria-label="Your designs">{options.map(option=>{const on=picked===option.id;return <button type="button" role="radio" aria-checked={on} key={option.id} className={on?'active':''} onClick={()=>onPick?.(option)}><LabelThumb design={option.design} brand={brand} profile={profile} name={option.name.replace(/^Like /,'')} scale={.36}/><strong>{option.name}</strong><small>{option.note}</small></button>;})}</div></section>}
  <section className="de-section"><h2>{options.length&&!themesOnly?'Or start from':'Start from'}</h2><div className="de-tiles" role="radiogroup" aria-label="Theme">{labelTemplates.map(item=>{const on=template===item&&!own&&!picked;const image=tileImage?.(item);return <button type="button" role="radio" aria-checked={on} key={item} className={on?'active':''} onClick={()=>onChange({template:item,tweaks:{}})}>{image?<img src={image} alt=""/>:<span className="de-tile-label"><LabelThumb design={{template:item,tweaks:{}}} brand={brand} profile={profile} scale={.42}/></span>}<span>{labelTemplateNames[item]}{on&&<Check size={16}/>}</span></button>;})}</div>{!themesOnly&&<small>{own?`Your own design, started from ${labelTemplateNames[template]}.`:'Pick a starting point, then make it yours below.'}</small>}</section>
  {!themesOnly&&<><section className="de-section"><h2>Label colour</h2><div className="de-swatches" role="radiogroup" aria-label="Label colour">{papers.map(color=>{const on=(tweaks.paper||theme.paper).toLowerCase()===color;return <button type="button" role="radio" key={color} aria-checked={on} aria-label={color} className={on?'active':''} style={{background:color}} onClick={()=>change({paper:color})}/>;})}</div></section>
  <section className="de-section"><h2>Picture</h2><div className="de-chips" role="radiogroup" aria-label="Picture">{(Object.keys(designArtNames) as DesignArt[]).map(item=>{const on=tweaks.art===item;return <button type="button" role="radio" key={item} aria-checked={on} className={on?'active':''} onClick={()=>change({art:item})}>{designArtNames[item]}</button>;})}</div></section>
  <section className="de-section"><h2>Layout</h2><div className="de-chips" role="radiogroup" aria-label="Layout">{(Object.keys(designLayoutNames) as DesignLayout[]).map(item=>{const on=(tweaks.layout||'centred')===item;return <button type="button" role="radio" key={item} aria-checked={on} className={on?'active':''} onClick={()=>change({layout:item})}>{designLayoutNames[item]}</button>;})}</div><small>Colours, fonts and logo always come from your main brand.</small></section></>}
  {!themesOnly&&!!suggestions.length&&<section className="de-section de-suggest"><h2><Sprout size="tiny"/>Sprout AI suggestions</h2><div className="de-chips">{suggestions.map(option=><button type="button" key={option.label} onClick={option.apply}>{option.label}</button>)}</div></section>}
  {children}
 </>;
}

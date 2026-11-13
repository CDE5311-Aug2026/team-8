import type {SamplePackaging} from './samplePackaging.ts';

// The physical fruit used at the showcase. Keep existing catalogue samples unchanged.
export const showcaseProductInfo={
 name:'Pomegranate',category:'Fruit',quantity:'1 fruit',ingredients:'Pomegranate',
 allergens:'No allergens declared',description:'A whole pomegranate with ruby-red seeds and a bright, sweet-tart flavour. Presented in a cream-and-green kraft box.',
 brand:'Green Valley Farm',nutrition:'',storage:'Keep in a cool, dry place. Refrigerate after cutting.',
 expiry:'Check freshness before eating.',producer:'Green Valley Farm',origin:'',
};
export const showcaseProductPrice='5.00';
export const showcasePackaging:SamplePackaging={kind:'carton',name:'Pomegranate box',material:'Kraft paperboard box with a cream botanical label',closure:'Tuck-top lid',image:'/sample-packaging/pomegranate.png',fill:'#8d263c',labelWidthMm:90,labelHeightMm:90};
export function isShowcaseProduct(product:{showcase?:string}){return product.showcase==='pomegranate';}
export const showcaseThemes={
 botanical:{studio:'/sample-packaging/pomegranate-packed.png',photo:showcasePackaging.image},
 minimal:{studio:'/sample-packaging/pomegranate-minimal.png',photo:'/sample-packaging/pomegranate-minimal.png'},
 market:{studio:'/sample-packaging/pomegranate-market.png',photo:'/sample-packaging/pomegranate-market.png'},
};
export function showcaseTheme(template?:string){return showcaseThemes[template==='minimal'||template==='market'?template:'botanical'];}
export function isShowcasePackagingPhoto(url:string){return Object.values(showcaseThemes).some(theme=>theme.studio===url||theme.photo===url);}
export function showcaseListingPhotos(photo?:string,template?:string){return [{url:showcaseTheme(template).photo,name:'Cover'},...(photo&&!isShowcasePackagingPhoto(photo)?[{url:photo,name:'Your photo'}]:[])];}
export function showcaseGallery(product:{photo?:string;labelTemplate?:string;listingPhotos?:{url:string;name?:string}[]},photos=product.listingPhotos){
 const input=photos||showcaseListingPhotos(product.photo,product.labelTemplate);
 return [...showcaseListingPhotos(undefined,product.labelTemplate),...input.filter(photo=>!isShowcasePackagingPhoto(photo.url)).map(photo=>({...photo,name:photo.name||'Your photo'})),...(input.some(photo=>photo.name==='Packed')?[{url:showcaseTheme(product.labelTemplate).studio,name:'Packed'}]:[])];
}

export const showcasePackedPhoto={url:'/sample-packaging/pomegranate-packed.png',name:'Packed'};
export const showcaseBehindPhotos=[{url:'/preset/pomegranate-orchard.png',name:'Our orchard'},{url:'/preset/pomegranate-harvest.png',name:'Harvest'}];

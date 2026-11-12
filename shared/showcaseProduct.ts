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
export function showcaseListingPhotos(photo?:string){return [{url:showcasePackaging.image,name:'Cover'},...(photo&&photo!==showcasePackaging.image?[{url:photo,name:'Your photo'}]:[])];}

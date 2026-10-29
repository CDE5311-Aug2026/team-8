export type StorySections={beginnings:string;dailyLife:string};
const prefix='Our beginnings\n';
const divider='\n\nLife on the farm\n';
export const storySectionOverhead=prefix.length+divider.length;
// Older free-form stories remain untouched until the farmer adds another section.
export function splitFarmStory(story:string):StorySections{
 const index=story.indexOf(divider,prefix.length);
 return story.startsWith(prefix)&&index>=0?{beginnings:story.slice(prefix.length,index),dailyLife:story.slice(index+divider.length)}:{beginnings:story,dailyLife:''};
}
export function joinFarmStory({beginnings,dailyLife}:StorySections){return dailyLife?prefix+beginnings+divider+dailyLife:beginnings;}

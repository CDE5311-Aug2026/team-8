import {test} from 'node:test';
import assert from 'node:assert/strict';
import {coverPhoto,presetDesignPhotos,themedListingPhotos} from '../shared/presetProduct.ts';

const honey=(designTweaks?:{paper?:string;art?:string;layout?:string},labelTemplate='botanical')=>({id:'demo-honey',labelTemplate,designTweaks});
test('honey design choices that match a preset use its finished photos',()=>{
 assert.equal(presetDesignPhotos(honey({paper:'#415B51',layout:'band',art:'sprig'}))?.studio,'/preset/honey-botanical-bold-studio.jpg');
 assert.equal(presetDesignPhotos(honey({paper:'#415c50',layout:'band',art:'sprig'}))?.studio,'/preset/honey-botanical-bold-studio.jpg');
 assert.equal(presetDesignPhotos(honey({paper:'#cfa255'}))?.studio,'/preset/honey-botanical-gold-studio.jpg');
 assert.equal(presetDesignPhotos(honey({paper:'#ffffff'}))?.photo,'/preset/honey-botanical-white-photo.jpg');
 assert.equal(presetDesignPhotos(honey({paper:'#f6ecd9',art:'none'}))?.studio,'/preset/honey-botanical-none-studio.jpg');
 assert.equal(presetDesignPhotos(honey({layout:'band'}))?.studio,'/preset/honey-botanical-band-studio.jpg');
 assert.equal(coverPhoto(honey({art:'sprig'})),'/preset/honey-botanical-sprig-studio.jpg');
 assert.deepEqual(themedListingPhotos(honey({paper:'#c9a35b'})).map(p=>p.name),['Cover','Packed']);
});
test('other combos and other products keep the drawn packaging',()=>{
 assert.equal(presetDesignPhotos(honey({paper:'#ffffff',layout:'band'})),null);
 assert.equal(presetDesignPhotos(honey({paper:'#ffffff'},'minimal')),null);
 assert.equal(presetDesignPhotos({id:'demo-tea',labelTemplate:'botanical',designTweaks:{paper:'#ffffff'}}),null);
 assert.equal(presetDesignPhotos(honey()),null);
 assert.equal(presetDesignPhotos(honey({paper:'#d03030'})),null);
 assert.deepEqual(themedListingPhotos(honey({paper:'#ffffff',layout:'band'})),[]);
});

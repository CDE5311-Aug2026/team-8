import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hammingHex,nearestProduct} from '../shared/photoMatch.ts';
test('a photo close to a product photo picks that product; an unknown photo picks none',()=>{
 assert.equal(hammingHex('ff00','ff01'),1);assert.equal(hammingHex('0000','ffff'),16);
 const refs={'demo-jam':['00ff00ff00ff00ff'],'demo-honey':['ffffffff00000000']};
 assert.equal(nearestProduct('00ff00ff00ff00fe',refs),'demo-jam');
 assert.equal(nearestProduct('fffffffe00000000',refs),'demo-honey');
 assert.equal(nearestProduct('0f0f0f0f0f0f0f0f',refs),null);
});

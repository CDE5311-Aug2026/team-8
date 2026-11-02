import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePriceInput,normalisePrice,formatSgd} from '../shared/currency.ts';
test('SGD entry supports decimal keyboards and pasted currency without storing symbols',()=>{
 assert.equal(parsePriceInput('4,50'),'4.50');
 assert.equal(parsePriceInput('S$1,234.50'),'1234.50');
 assert.equal(parsePriceInput('SGD 4.50'),'4.50');
 assert.equal(parsePriceInput(''),'');
 for(const value of ['-4.50','4.567','1e3','abc'])assert.equal(parsePriceInput(value),null);
 assert.equal(normalisePrice('.5'),'0.50');assert.equal(normalisePrice('4'),'4.00');assert.equal(normalisePrice(''),'');
 assert.equal(formatSgd('4.5'),'S$4.50');
});

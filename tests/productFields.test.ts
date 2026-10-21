import test from 'node:test';
import assert from 'node:assert/strict';
import {allergenStatement,initialAllergens,ingredientList,addIngredients,validAllergenSelection} from '../shared/productFields.ts';

test('contains and possible cross-contact remain separate and unknown makes no absence claim',()=>{
 const selection={status:'selected' as const,contains:['Milk','Eggs'],mayContain:['Peanuts'],original:''};
 assert.equal(allergenStatement(selection),'Contains: Milk, Eggs. May contain: Peanuts.');
 assert.equal(allergenStatement({...selection,status:'none'}),'None declared');
 assert.equal(allergenStatement({...selection,status:'unknown'}),'');
 assert.equal(initialAllergens('').status,'unknown');
});
test('imported label wording and qualifiers are retained without automatic classification',()=>{
 const statement='May contain traces of peanuts and tree nuts. Made in a facility that handles milk.';
 const selection=initialAllergens(statement);
 assert.equal(allergenStatement(selection),statement);
 assert.equal(allergenStatement({...selection,status:'selected',includeOriginal:true,contains:['Eggs']}),`${statement} Contains: Eggs.`);
 assert.deepEqual(selection.contains,[]);assert.deepEqual(selection.mayContain,[]);
 assert.equal(validAllergenSelection({...selection,contains:'milk'}),false);
});
test('ingredient badges preserve order and compound ingredient commas',()=>{
 assert.deepEqual(ingredientList('Tomato sauce (tomatoes, basil), olive oil, salt'),['Tomato sauce (tomatoes, basil)','olive oil','salt']);
 assert.equal(addIngredients('Tomatoes','Basil, olive oil, tomatoes'),'Tomatoes, Basil, olive oil');
 assert.equal(addIngredients('',''),'');
 assert.throws(()=>addIngredients('', 'a'.repeat(2001)));
});

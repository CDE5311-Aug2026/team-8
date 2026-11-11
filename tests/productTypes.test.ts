import test from 'node:test';
import assert from 'node:assert/strict';
import {productTypeCounts,productTypeOf,toggleProduct} from '../shared/productTypes.ts';

test('suggested products belong to their type, anything else is Other',()=>{
 assert.equal(productTypeOf('Tomatoes'),'Vegetables');
 assert.equal(productTypeOf(' raw honey '),'Honey');
 assert.equal(productTypeOf('Kaya'),'Other');
});

test('type counts follow the picked products',()=>{
 const counts=productTypeCounts(['Tomatoes','Courgette','Kaya']);
 assert.equal(counts.Vegetables,2);
 assert.equal(counts.Other,1);
 assert.equal(counts.Fruit,0);
 const typedUnder=productTypeCounts(['Tomatoes','Okra'],{okra:'Vegetables'});
 assert.equal(typedUnder.Vegetables,2);
 assert.equal(typedUnder.Other,0);
});

test('toggling adds once and removes regardless of case',()=>{
 assert.deepEqual(toggleProduct(['Tomatoes'],'Carrots'),['Tomatoes','Carrots']);
 assert.deepEqual(toggleProduct(['Tomatoes','Carrots'],'tomatoes'),['Carrots']);
});

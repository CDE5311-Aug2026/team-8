import {test} from 'node:test';
import assert from 'node:assert/strict';
import {homeSampleReviews,summarizeReviews,type FarmReview} from '../shared/reviewSentiment.ts';

test('Home sentiment agrees with the review totals, rating and theme evidence',()=>{
 const summary=summarizeReviews(homeSampleReviews);
 assert.equal(new Set(homeSampleReviews.map(review=>review.id)).size,130);
 assert.equal(summary.total,130);assert.equal(summary.rating,4.8);assert.equal(summary.positivePercent,94);
 assert.equal(summary.positive,122);assert.equal(summary.mixed,5);assert.equal(summary.negative,3);
 assert.deepEqual(summary.positiveThemes.slice(0,2),[{name:'Flavour',count:113},{name:'Freshness',count:96}]);
 assert.deepEqual(summary.concerns,[{name:'Price',count:10},{name:'Delivery timing',count:5}]);
});
test('sentiment counts each review once per theme and handles missing feedback',()=>{
 const review:FarmReview={id:'one',rating:5,text:'Fresh and tasty',positiveThemes:['Freshness','Freshness'],concerns:[]};
 assert.deepEqual(summarizeReviews([review]).positiveThemes,[{name:'Freshness',count:1}]);
 const empty=summarizeReviews([]);assert.equal(empty.total,0);assert.equal(empty.rating,0);assert.equal(empty.positivePercent,0);assert.deepEqual(empty.positiveThemes,[]);
 assert.equal(summarizeReviews([{...review,rating:NaN},{...review,rating:8},{...review,text:''}]).total,0);
});

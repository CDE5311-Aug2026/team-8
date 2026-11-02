import {test} from 'node:test';
import assert from 'node:assert/strict';
import {joinFarmStory,splitFarmStory,storySectionOverhead} from '../shared/farmStory.ts';
test('legacy farm stories survive opening and saving unchanged',()=>{for(const story of ['', 'Our family has farmed here since 1980.\nWe grow vegetables.', 'A story with trailing space '])assert.equal(joinFarmStory(splitFarmStory(story)),story);});
test('scaffolded answers keep their sections, whitespace and empty answers',()=>{for(const sections of [{beginnings:'A family farm ',dailyLife:'Hand-picked harvests '},{beginnings:'',dailyLife:'Seasonal produce'},{beginnings:'Family farm',dailyLife:''}])assert.deepEqual(splitFarmStory(joinFarmStory(sections)),sections);});
test('combined story length includes section headings for the existing limit',()=>{const sections={beginnings:'a'.repeat(1000),dailyLife:'b'.repeat(2500-storySectionOverhead-1000)};assert.equal(joinFarmStory(sections).length,2500);});

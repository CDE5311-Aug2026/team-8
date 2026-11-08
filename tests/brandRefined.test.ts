import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleProfile,signature,validConcept} from '../shared/branding.ts';
import {brandReason,brandReasonParts,brandLogoFonts,brandMarks,brandPalettes,brandPatterns,contrastRatio,isRefinedBrand,makeBrandLooks,makeRefinedBrand,newRefinedBrandWork,rankedBrandOptions,readableBrandInk,refinedBrandKey,restoreRefinedBrandWork,validBrandSelection} from '../shared/brandRefined.ts';
import {workspaceKey,workspaceKeys} from '../shared/access.ts';
import {farmBrandPrompts} from '../shared/brandFarmContext.ts';

test('farm philosophy and story change visual rankings, explanations and refinement prompts',()=>{
 const heritage={...sampleProfile,products:'Oranges',story:'Our family has tended this orchard for three generations.',philosophy:'We keep traditional methods alive.'};
 const ecology={...heritage,story:'We grow with the surrounding ecosystem.',philosophy:'Biodiversity and regenerative soil guide every decision.'};
 const a=makeBrandLooks(heritage),b=makeBrandLooks(ecology);
 assert.notDeepEqual(a.map(look=>look.selection),b.map(look=>look.selection));
 assert.deepEqual(a.map(look=>look.name),['Hand-picked','Market fresh','Clean greens']);
 assert.equal(a[0].reason,'You grow Oranges. A soft, hand-written look.');
 const parts=brandReasonParts(heritage,'Colour',1);
 assert.ok(parts.reference.includes(heritage.philosophy));assert.ok(!parts.suggestion.includes(heritage.philosophy));
 assert.ok(brandReason(heritage,'Colour',1).startsWith(parts.suggestion));
 assert.notDeepEqual(farmBrandPrompts(heritage),farmBrandPrompts(ecology));
 assert.ok(farmBrandPrompts(ecology).some(prompt=>prompt.includes('nature')));
 for(const tab of ['Colour','Type','Logo','Pattern'] as const){
  const reasons=rankedBrandOptions(ecology,tab).slice(0,2).map(index=>brandReason(ecology,tab,index));
  assert.ok(reasons.every(reason=>!reason.includes('approved')&&!reason.includes('was picked from')));
  assert.notEqual(reasons[0],reasons[1]);
 }
 const old={...newRefinedBrandWork(heritage),looks:a.map(look=>({...look,reason:'A warm friendly look'}))};
 const restored=restoreRefinedBrandWork(old,heritage)!;
 assert.deepEqual(restored.selection,old.selection);assert.equal(restored.looks[1].reason,'You grow Oranges. A warm, friendly market look.');
});

test('refined branding uses the exact approved inventory and three profile-grounded directions',()=>{
 assert.equal(brandPalettes.length,6);assert.equal(brandLogoFonts.length,6);assert.deepEqual(brandMarks,['Leaf','Sprout','Plant','Seed','Sun','Flower']);assert.deepEqual(brandPatterns,['Leaf line','Dots','Lines','Plain']);
 const looks=makeBrandLooks(sampleProfile);assert.equal(looks.length,3);assert.ok(looks.every(look=>validBrandSelection(look.selection)&&look.reason.includes(sampleProfile.products)));
 assert.notEqual(looks[0].selection.palette,looks[1].selection.palette);
 const unknownFacts=makeBrandLooks({...sampleProfile,products:'Honey',story:'Our bees live in an orchard.'});assert.ok(unknownFacts.every(look=>!look.reason.includes('2018')&&!look.reason.includes('kangkong')));
});
test('local requests re-rank only approved options and warmer matches the design',()=>{
 assert.deepEqual(rankedBrandOptions(sampleProfile,'Colour','Warmer').slice(0,2),[1,2]);assert.equal(rankedBrandOptions(sampleProfile,'Colour','Back to green')[0],0);
 assert.equal(rankedBrandOptions(sampleProfile,'Type','Easier to read')[0],5);assert.equal(rankedBrandOptions(sampleProfile,'Pattern','No pattern')[0],3);
 assert.ok(makeBrandLooks(sampleProfile,'Warmer colours').every(look=>validBrandSelection(look.selection)&&look.reason.includes('Warmer colours')));
});
test('every approved brand palette keeps readable text on main, light and white surfaces',()=>{
 for(const palette of brandPalettes){for(const [background,preferred] of [[palette.main,palette.light],[palette.light,palette.main],['#ffffff',palette.main]])assert.ok(contrastRatio(background,readableBrandInk(background,preferred))>=4.5);}
 assert.equal(readableBrandInk('#ffffff','#eeeeee'),'#1a1a18');
});
test('refined kit retains each independent choice, logo font, contrast and request without an AI claim',()=>{
 const work=newRefinedBrandWork(sampleProfile);work.selection={palette:2,font:4,mark:5,pattern:3};work.requests.Type='More classic';const kit=makeRefinedBrand(work,sampleProfile);
 assert.ok(isRefinedBrand(kit));assert.doesNotThrow(()=>validConcept(kit.concept));assert.equal(kit.origin,'sample');assert.equal(kit.imageSource,'none');assert.equal(kit.headingFont,'Oleo Script');assert.equal(kit.bodyFont,'Figtree');assert.deepEqual(kit.refined.selection,work.selection);assert.equal(kit.profileSignature,signature(sampleProfile));assert.match(kit.preferences,/More classic/);
 assert.equal(newRefinedBrandWork(sampleProfile,kit).stage,'kit');
});
test('refined draft resumes tabs, input and selections, while rejecting stale or malformed data',()=>{
 const work=newRefinedBrandWork(sampleProfile);work.stage='tune';work.tab='Logo';work.requests.Logo='Simpler';work.selection.mark=3;assert.deepEqual(restoreRefinedBrandWork(JSON.parse(JSON.stringify(work)),sampleProfile),work);
 assert.equal(restoreRefinedBrandWork(work,{...sampleProfile,farmName:'Different farm'}),null);
 for(const malformed of [null,{}, {...work,selection:{...work.selection,mark:6}}, {...work,requests:{Colour:1}}, {...work,selected:4}, {...work,looks:[]}])assert.equal(restoreRefinedBrandWork(malformed,sampleProfile),null);
});
test('refined work transfers with its workspace and remains isolated across accounts',()=>{
 assert.ok((workspaceKeys as readonly string[]).includes(refinedBrandKey));assert.notEqual(workspaceKey(refinedBrandKey,'demo-farmer'),workspaceKey(refinedBrandKey,null));
});

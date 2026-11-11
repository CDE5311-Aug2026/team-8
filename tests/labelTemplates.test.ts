import {test} from 'node:test';
import assert from 'node:assert/strict';
import {labelSvg,restoreProductWork} from '../shared/productFlow.ts';
import {demoProducts,demoProfile,demoBrand} from '../shared/demoDashboard.ts';
import {labelTemplates,labelTheme} from '../shared/labelTemplates.ts';
import {contrastRatio} from '../shared/brandRefined.ts';
test('every label template keeps brand contrast and escapes product declarations in exports',()=>{
 for(const labelTemplate of labelTemplates){const theme=labelTheme(demoBrand,labelTemplate);assert.ok(contrastRatio(theme.paper,theme.ink)>=4.5);const svg=labelSvg({...demoProducts[0],labelTemplate,name:'Honey <script> & cream',allergens:'May contain eggs'},demoProfile,demoBrand);assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(svg.includes('May contain eggs'));assert.ok(svg.includes(demoProfile.farmName));assert.ok(!svg.includes('organic certified'));}
});
test('label selection restores independently of product facts and rejects unknown templates',()=>{
 const draft={product:{...demoProducts[0],labelTemplate:'minimal'},profileSignature:demoBrand.profileSignature,screen:'packaging',reviewed:true,analysis:null};const restored=restoreProductWork(draft,demoProfile)!;assert.equal(restored.product.labelTemplate,'minimal');assert.equal(restored.product.ingredients,draft.product.ingredients);assert.equal(restoreProductWork({...draft,product:{...draft.product,labelTemplate:'invented'}},demoProfile)!.product.labelTemplate,undefined);
});
test('print files and shop covers use the product’s own design, not only the theme',()=>{
 const base={...demoProducts[1],labelTemplate:'minimal' as const};
 const plain=labelSvg(base,demoProfile,demoBrand);
 const own=labelSvg({...base,designTweaks:{paper:'#415b51',layout:'band',art:'sprig'}},demoProfile,demoBrand);
 assert.ok(!plain.includes('height="112"'));
 assert.match(own,/<rect width="960" height="\d+" fill="#415b51"\/>/);
 assert.match(own,/<rect width="960" height="112" fill=/);
 assert.match(own,/M20 46V4/);
 assert.equal(labelSvg({...base,designTweaks:{art:'none'}},demoProfile,demoBrand).includes('M444 125H516'),false);
});
test('saved designs made ahead keep their label colour, picture and layout',async()=>{
 const {restoreBrandPage}=await import('../shared/brandPage.ts');
 const page=restoreBrandPage({version:1,changesLeft:3,extras:[{id:'a',name:'Holiday tin',template:'botanical',tweaks:{paper:'#415b51',art:'sprig'}},{id:'b',name:'Bad',template:'botanical',tweaks:{paper:'red'}}]});
 assert.deepEqual(page.extras.map(e=>e.name),['Holiday tin']);assert.deepEqual(page.extras[0].tweaks,{paper:'#415b51',art:'sprig'});
});

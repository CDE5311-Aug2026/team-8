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

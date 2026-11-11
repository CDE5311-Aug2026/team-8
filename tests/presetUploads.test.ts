import {test} from 'node:test';
import assert from 'node:assert/strict';
import {migrateLegacySamplePhotos,presetBehindPhotos,presetCertificateFile,presetProductPhoto} from '../shared/presetProduct.ts';

function memory(data:Record<string,string>){const keys=()=>Object.keys(data);return {get length(){return keys().length;},key:(i:number)=>keys()[i]??null,getItem:(k:string)=>data[k]??null,setItem:(k:string,v:string)=>{data[k]=v;}};}
const big='data:image/jpeg;base64,'+'A'.repeat(5000);

test('old uploaded photos are swapped for presets so storage has room again',()=>{
  const data:Record<string,string>={'farmily-user:1:farmily-products':JSON.stringify([{photo:big,listingPhotos:[{url:big,caption:''}],certificate:{file:{name:'a.png',type:'image/png',size:9,dataUrl:big}}}]),'farmily-profile':JSON.stringify({photos:[{kind:'process',url:big}],portrait:{url:big}}),'other':big};
  migrateLegacySamplePhotos(memory(data));
  const [product]=JSON.parse(data['farmily-user:1:farmily-products']);
  assert.equal(product.photo,presetProductPhoto);
  assert.equal(product.listingPhotos[0].url,presetBehindPhotos[0].url);
  assert.deepEqual(product.certificate.file,presetCertificateFile);
  const profile=JSON.parse(data['farmily-profile']);
  assert.equal(profile.photos[0].url,'/preset/farm-process.jpg');
  assert.equal(profile.portrait.url,'/sample-profile/farmer.png');
  assert.equal(data.other,big);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {endSpeech,speechErrorMessage} from '../shared/speech.ts';

type Voice={text:string;review:boolean;seconds:number;error?:string}|null;
class MockRecognition {
 static failStart=false;
 onerror?:(event:{error:string})=>void;
 onend?:()=>void;
 onresult?:(event:unknown)=>void;
 start(){if(MockRecognition.failStart)throw new Error('start failed');}
 stop(){this.onend?.();}
 abort(){this.onerror?.({error:'aborted'});this.onend?.();}
}

// Exercise the actual component start handlers with synchronous mobile-style callbacks.
function recording(component:string,supported=true){
 const source=readFileSync(new URL(`../src/${component}.tsx`,import.meta.url),'utf8');
 const name=component==='VoiceField'?'start':'startVoice';
 const file=ts.createSourceFile(`${component}.tsx`,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let handler:ts.FunctionDeclaration|undefined;
 function visit(node:ts.Node){
  if(ts.isFunctionDeclaration(node)&&node.name?.text===name)handler=node;
  ts.forEachChild(node,visit);
 }
 visit(file);assert.ok(handler,`Missing ${name} handler`);
 const code=ts.transpile(handler.getText(file),{target:ts.ScriptTarget.ES2022});
 let voice:Voice=null;
 const recognition:{current:MockRecognition|null}={current:null};
 const setVoice=(value:Voice|((previous:Voice)=>Voice))=>{voice=typeof value==='function'?value(voice):value;};
 const start=new Function('window','recognition','setVoice','setError','onError','endSpeech','speechErrorMessage',`${code};return ${name};`)(
  supported?{webkitSpeechRecognition:MockRecognition}:{},recognition,setVoice,()=>{},undefined,endSpeech,speechErrorMessage,
 );
 return {start:()=>start(0),get voice(){return voice;},get rec(){return recognition.current!;}};
}

for(const component of ['VoiceField','OnboardingV2']){
 test(`${component}: immediate recognition errors keep the drawer open with retry feedback`,()=>{
  for(const error of ['no-speech','not-allowed','audio-capture','network','aborted']){
   const session=recording(component);session.start();const rec=session.rec;
   rec.onerror?.({error});rec.onend?.();
   assert.ok(session.voice);assert.equal(session.voice.review,true);
   assert.equal(session.voice.error,speechErrorMessage(error));
   session.start();assert.equal(session.voice?.review,false);assert.equal(session.voice?.error,undefined);
   rec.onerror?.({error:'network'});assert.equal(session.voice?.review,false);
  }
 });
 test(`${component}: captured words survive a failure`,()=>{
  const session=recording(component);session.start();
  session.rec.onresult?.({results:[{0:{transcript:'Fresh tomatoes'}}]});
  session.rec.onerror?.({error:'network'});
  assert.equal(session.voice?.text,'Fresh tomatoes');assert.equal(session.voice?.review,true);
 });
 test(`${component}: unsupported browsers and start exceptions leave feedback visible`,()=>{
  const unsupported=recording(component,false);unsupported.start();
  assert.equal(unsupported.voice?.error,speechErrorMessage('unsupported'));
  MockRecognition.failStart=true;
  try{const session=recording(component);session.start();assert.equal(session.voice?.review,true);assert.ok(session.voice?.error);}
  finally{MockRecognition.failStart=false;}
 });
 test(`${component}: restarting ignores synchronous abort callbacks from the old session`,()=>{
  const session=recording(component);session.start();session.start();
  assert.equal(session.voice?.review,false);assert.equal(session.voice?.error,undefined);
  session.rec.onend?.();assert.equal(session.voice?.review,true);
 });
}

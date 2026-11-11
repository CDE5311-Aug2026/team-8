import {test} from 'node:test';
import assert from 'node:assert/strict';
import {endSpeech} from '../shared/speech.ts';

test('ending speech never throws, even when the browser does',()=>{
 const calls:string[]=[];
 const angry={stop(){calls.push('stop');throw new Error('InvalidStateError');},abort(){calls.push('abort');throw new Error('InvalidStateError');}};
 assert.doesNotThrow(()=>endSpeech(angry));
 assert.doesNotThrow(()=>endSpeech(angry,'stop'));
 assert.doesNotThrow(()=>endSpeech(null));
 assert.deepEqual(calls,['abort','stop']);
});

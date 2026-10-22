import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import branding from '../api/branding.ts';
import analyze from '../api/analyze.ts';

test('only dev bypasses account and scan-code gates; input validation remains active',async()=>{
 const before={branch:process.env.VERCEL_GIT_COMMIT_REF,vercel:process.env.VERCEL,token:process.env.AI_SCAN_TOKEN};
 process.env.VERCEL='1';process.env.AI_SCAN_TOKEN='test-access-code';
 const server=createServer((req,res)=>void (req.url==='/branding'?branding:analyze)(req,res));
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();if(!address||typeof address==='string')throw new Error('No address');
 try{
  for(const branch of ['dev','main','feature/test','']){
   process.env.VERCEL_GIT_COMMIT_REF=branch;
   for(const path of ['branding','analyze']){
    const response:Response=await fetch(`http://127.0.0.1:${address.port}/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    assert.equal(response.status,branch==='dev'?400:401,`${branch}/${path}`);
   }
  }
 }finally{
  await new Promise<void>(resolve=>server.close(()=>resolve()));
  for(const [key,value] of Object.entries({VERCEL_GIT_COMMIT_REF:before.branch,VERCEL:before.vercel,AI_SCAN_TOKEN:before.token})){
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
 }
});

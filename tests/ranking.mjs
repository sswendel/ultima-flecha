import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import worker,{insert} from '../ranking-service/worker.mjs';
const env={ALLOWED_ORIGIN:'https://sswendel.github.io',GITHUB_REPO:'sswendel/ultima-flecha',GITHUB_PATH:'ranking.json',GITHUB_BRANCH:'main',GITHUB_TOKEN:'test-only',SESSION_SECRET:'test-secret-used-only-in-test'};
let state={version:1,entries:[],used:[]},sha=0;
const nativeFetch=globalThis.fetch,nativeNow=Date.now;let clock=nativeNow();Date.now=()=>clock;
globalThis.fetch=async(url,options)=>{
 if(options.method!=='PUT')return Response.json({sha:String(sha),content:Buffer.from(JSON.stringify(state)).toString('base64')});
 const body=JSON.parse(options.body);if(body.sha!==String(sha))return new Response('',{status:409});
 state=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));sha++;return Response.json({commit:{sha:String(sha)}});
};
const request=async(path,body,origin=env.ALLOWED_ORIGIN)=>worker.fetch(new Request('https://ranking.example'+path,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),env);
try{
 assert.equal((await request('/ranking',null,'https://bad.example')).status,403);
 assert.equal((await request('/start',{mode:'treino'})).status,400);assert.equal((await request('/start',{})).status,400);
 const legacyData=Buffer.from(JSON.stringify({id:'legacy',start:clock-30000})).toString('base64');const legacy=legacyData+'.'+createHmac('sha256',env.SESSION_SECRET).update(legacyData).digest('base64');assert.equal((await request('/finish',{ticket:legacy,name:'Teste',ms:20000,mode:'normal'})).status,400);
 const a=await(await request('/start',{mode:'normal'})).json(),b=await(await request('/start',{mode:'normal'})).json();clock+=30000;
 const result=await Promise.all([request('/finish',{ticket:a.ticket,name:'João',ms:20000,mode:'normal'}),request('/finish',{ticket:b.ticket,name:'Iure',ms:19000,mode:'normal'})]);
 assert.ok(result.every(r=>r.status===200));assert.equal(state.entries.length,2);assert.equal(state.entries[0].name,'Iure');
 assert.equal((await request('/finish',{ticket:a.ticket,name:'João',ms:20000,mode:'normal'})).status,409);
 assert.equal((await request('/finish',{ticket:'falso',name:'Teste',ms:20000,mode:'normal'})).status,400);
 assert.equal((await request('/finish',{ticket:b.ticket,name:'Teste',ms:20000,mode:'treino'})).status,400);
 const c=await(await request('/start',{mode:'normal'})).json();clock+=30000;
 assert.equal((await request('/finish',{ticket:c.ticket,name:'<script>',ms:20000,mode:'normal'})).status,400);
 const entries=Array.from({length:10},(_,i)=>({id:String(i),name:'N'+i,ms:15000+i*1000,date:'2026-01-01'}));
 assert.equal(insert(entries,{id:'slow',ms:99000,date:'2026-02-01'}).some(e=>e.id==='slow'),false);
 const next=insert(entries,{id:'fast',ms:14000,date:'2026-02-01'});assert.equal(next.length,10);assert.equal(next[0].id,'fast');
 assert.equal(insert(entries,{id:'tie',ms:24000,date:'2026-02-01'}).some(e=>e.id==='tie'),false);
 console.log('OK: ranking crescente, limite 10, empate, origem, sessão, treino, nome, repetição e gravações simultâneas.');
}finally{globalThis.fetch=nativeFetch;Date.now=nativeNow;}

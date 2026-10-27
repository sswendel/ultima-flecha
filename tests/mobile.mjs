import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function game(mobile=true){
 const all=new Map(),win={};let raf;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({},{get:(o,k)=>o[k]||(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(all.has(id))return all.get(id);const handlers={};const el={id,handlers,style:{},hidden:false,tagName:'DIV',classList:{toggle(){},add(){},remove(){}},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:id==='mobile-joy'?120:960,height:id==='mobile-joy'?120:600}),addEventListener:(n,f)=>(handlers[n]??=[]).push(f),setAttribute(){},blur(){},setPointerCapture(){},showModal(){this.open=true;},close(){this.open=false;},fire(n,extra={}){for(const f of handlers[n]||[])f({pointerId:1,pointerType:'touch',clientX:60,clientY:60,preventDefault(){},stopPropagation(){},...extra});}};all.set(id,el);return el;}
 const document={hidden:false,body:element('body'),getElementById:element,createElement:()=>element('canvas'+all.size),addEventListener:(n,f)=>(win[n]??=[]).push(f)};
 const sandbox={console:{log(){}},document,window:{},navigator:{maxTouchPoints:mobile?5:0},innerWidth:mobile?390:1366,matchMedia:()=>({matches:mobile}),localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},requestAnimationFrame:f=>raf=f,setTimeout(){},addEventListener:(n,f)=>(win[n]??=[]).push(f)};
 vm.createContext(sandbox);for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],sandbox);
 vm.runInContext(fs.readFileSync(new URL('../mobile.js',import.meta.url),'utf8'),sandbox);
 return {element,read:s=>vm.runInContext(s,sandbox),fire:n=>(win[n]||[]).forEach(f=>f()),frame:t=>raf(t)};
}
const g=game();assert.equal(g.read('fmt(83.456)'), '01:23.456');assert.equal(g.read('fmt(59.9996)'), '01:00.000');assert.equal(g.read('fmt(0)'), '00:00.000');g.element('entrada-iniciar').fire('click');assert.equal(g.read('estado'),'play');
g.element('mobile-joy').fire('pointerdown',{clientX:100,clientY:60});assert.ok(g.read('joy.x')>.9);
g.element('mobile-dash').fire('pointerdown',{pointerId:2});assert.equal(g.read('keys.shift'),true);
g.element('mobile-shot').fire('pointerdown',{pointerId:3});assert.equal(g.read('arrow.estado'),'voo');assert.ok(g.read('arrow.uy')<0);
g.element('mobile-joy').fire('pointercancel');assert.equal(g.read('joy.x'),0);assert.equal(g.read('keys.shift'),true);
g.element('mobile-dash').fire('pointercancel',{pointerId:2});assert.equal(g.read('keys.shift'),false);
g.read("arrow.estado='mao'");g.element('c').fire('pointerdown',{clientX:400,clientY:200,pointerId:4});assert.equal(g.read('arrow.estado'),'mao');g.element('c').fire('pointerup',{clientX:400,clientY:200,pointerId:4});assert.equal(g.read('arrow.estado'),'voo');
g.element('mobile-recall').fire('pointerdown',{pointerId:5});assert.equal(g.read('mouse.right'),true);g.fire('blur');assert.equal(g.read('mouse.right'),false);assert.equal(g.read('pausado'),true);
g.read("arrow.estado='mao'");g.element('mobile-shot').fire('pointerdown',{pointerId:6});assert.equal(g.read('pausado'),false);assert.equal(g.read('arrow.estado'),'mao');
g.read('novaPartida()');g.frame(200);assert.equal(g.read('runT'),.2);
g.fire('orientationchange');const before=g.read('runT');g.frame(500);assert.equal(g.read('runT'),before);
g.read('pausado=false;keys.shift=true;joy.x=joy.y=0;updJogador(.01)');assert.ok(g.read('player.dashT')>0);
const desktop=game(false);assert.equal(desktop.read('toque'),false);
console.log('OK: inicialização PC/celular, multitoque, cancelamento, mira, pausa, dash parado e cronômetro real.');

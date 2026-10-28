import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function game(mobile=true,ranking=false,fullscreen={}){
 const fullCalls=[];
 const requests=[];
 const all=new Map(),win={};let raf;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({},{get:(o,k)=>o[k]||(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(all.has(id))return all.get(id);const handlers={};const el={id,handlers,style:{},hidden:false,tagName:'DIV',classList:{toggle(){},add(){},remove(){}},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:id==='mobile-joy'?120:960,height:id==='mobile-joy'?120:600}),addEventListener:(n,f)=>(handlers[n]??=[]).push(f),setAttribute(){},focus(){},append(){},replaceChildren(){},querySelector:s=>element(s==='form'?'rank-form':s==='input'?'rank-name':s==='button'?'rank-save':s.replace(/^#/,'')),blur(){},setPointerCapture(){},showModal(){this.open=true;},close(){this.open=false;},fire(n,extra={}){return Promise.all((handlers[n]||[]).map(f=>f({pointerId:1,pointerType:'touch',clientX:60,clientY:60,preventDefault(){},stopPropagation(){},...extra})));}};all.set(id,el);return el;}
 const document={hidden:false,documentElement:{style:{setProperty(){}}},body:element('body'),getElementById:element,querySelector:element,createElement:()=>element('canvas'+all.size),addEventListener:(n,f)=>(win[n]??=[]).push(f)};
 const sandbox={console:{log(){}},document,window:{RANKING_API:ranking?'https://ranking.test':''},AbortSignal,fetch:async(url,options)=>{const path=new URL(url).pathname;requests.push({path,body:options.body?JSON.parse(options.body):null});return {ok:true,json:async()=>path==='/start'?{ticket:'session-'+requests.filter(r=>r.path==='/start').length}:path==='/finish'?{qualified:true,rank:1,entries:[]}:{entries:[]}};},navigator:{maxTouchPoints:mobile?5:0},innerWidth:mobile?390:1366,innerHeight:mobile?844:768,matchMedia:q=>({matches:q==='(pointer: coarse)'?mobile:false}),localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},requestAnimationFrame:f=>raf=f,setTimeout(){},clearTimeout(){},addEventListener:(n,f)=>(win[n]??=[]).push(f)};
 if(fullscreen.support){
  document.documentElement.requestFullscreen=async options=>{fullCalls.push(['enter',options]);if(fullscreen.reject)throw Error('denied');document.fullscreenElement=document.documentElement;(win.fullscreenchange||[]).forEach(f=>f());};
  document.exitFullscreen=async()=>{fullCalls.push(['exit']);document.fullscreenElement=null;(win.fullscreenchange||[]).forEach(f=>f());};
 }
 sandbox.window.screen={orientation:{lock:async value=>{fullCalls.push(['lock',value]);if(fullscreen.lockReject)throw Error('unsupported');},unlock:()=>fullCalls.push(['unlock'])}};
 if(fullscreen.noLock)delete sandbox.window.screen.orientation.lock;
 if(fullscreen.iphone)sandbox.navigator.userAgent='iPhone';
 vm.createContext(sandbox);for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],sandbox);
 vm.runInContext(fs.readFileSync(new URL('../mobile.js',import.meta.url),'utf8'),sandbox);
 if(ranking)vm.runInContext(fs.readFileSync(new URL('../ranking.js',import.meta.url),'utf8'),sandbox);
 return {requests,fullCalls,element,read:s=>vm.runInContext(s,sandbox),fire:n=>(win[n]||[]).forEach(f=>f()),frame:t=>raf(t)};
}
const g=game();assert.equal(g.read('W'),600);assert.equal(g.read('H'),850);assert.equal(g.read('fmt(83.456)'), '01:23.456');assert.equal(g.read('fmt(59.9996)'), '01:00.000');assert.equal(g.read('fmt(0)'), '00:00.000');g.element('entrada-iniciar').fire('click');assert.equal(g.read('estado'),'play');
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
g.read('innerWidth=844;innerHeight=390');g.fire('resize');assert.equal(g.read('W'),960);assert.equal(g.read('H'),600);assert.equal(g.read('pausado'),true);assert.ok(g.read('player.x>=L+10 && player.x<=R-10'));assert.ok(g.read('player.y>=T+10 && player.y<=B-10'));
const desktop=game(false);assert.equal(desktop.read('toque'),false);
console.log('OK: inicialização PC/celular, multitoque, cancelamento, mira, pausa, dash parado e cronômetro real.');

// Uma morte encerra a tentativa; esperar, recomeçar e pausar não herdam seu tempo.
const retry=game();retry.read('novaPartida()');retry.frame(1000);assert.equal(retry.read('runT'),1);
retry.read('fase=4;morrer()');assert.equal(retry.read('runT'),0);retry.frame(1500);assert.equal(retry.read('runT'),0);
retry.read('mortoT=.5;clique()');assert.equal(retry.read('fase'),1);assert.equal(retry.read('mortes'),1);assert.equal(retry.read('runT'),0);
retry.frame(1700);assert.ok(Math.abs(retry.read('runT')-.2)<1e-9);
retry.read('modoTreino=true;fase=3;runT=4;morrer();mortoT=.5;clique()');assert.equal(retry.read('fase'),3);assert.equal(retry.read('runT'),0);
retry.frame(1800);assert.equal(retry.read('runT'),0);retry.read('pausado=true');retry.frame(2500);assert.equal(retry.read('runT'),0);
// A vitória após morrer deve enviar uma nova sessão e somente o tempo da tentativa vencedora.
const ranked=game(true,true);ranked.read('novaPartida()');await new Promise(setImmediate);assert.equal(ranked.requests.filter(r=>r.path==='/start').length,1);
ranked.read('runT=80;fase=4;morrer();mortoT=.5;clique()');await new Promise(setImmediate);assert.equal(ranked.requests.filter(r=>r.path==='/start').length,2);assert.equal(ranked.read('runT'),0);
ranked.read("runT=29.265;estado='vitoria';update(0)");await new Promise(setImmediate);ranked.element('rank-name').value='Teste';ranked.element('rank-form').fire('submit');await new Promise(setImmediate);
const saved=ranked.requests.find(r=>r.path==='/finish');assert.equal(saved.body.ticket,'session-2');assert.equal(saved.body.ms,29265);
console.log('OK: morte zera imediatamente, espera não conta, treino preserva a fase e ranking recebe nova sessão com o tempo vencedor.');

// Treino não inicia sessão, não conta tempo, não mostra formulário e nem envia por submit residual.
const practice=game(true,true);practice.read('modoTreino=true;novaPartida()');practice.frame(1000);assert.equal(practice.read('runT'),0);assert.equal(practice.requests.length,0);
practice.read("estado='vitoria';update(0)");await new Promise(setImmediate);practice.element('rank-form').fire('submit');await new Promise(setImmediate);assert.equal(practice.requests.length,0);
// Mesmo se o modo for alterado durante a tentativa, a elegibilidade não volta ao desligá-lo.
const toggled=game(true,true);toggled.read('novaPartida()');await new Promise(setImmediate);toggled.read("modoTreino=true;update(0);modoTreino=false;runT=20;estado='vitoria';update(0)");await new Promise(setImmediate);toggled.element('rank-form').fire('submit');await new Promise(setImmediate);assert.equal(toggled.requests.filter(r=>r.path==='/finish').length,0);
console.log('OK: treino sem cronômetro, sem sessão elegível e sem envio de resultado ao ranking.');

// Tela cheia preserva o tempo e a fase, solicita horizontal e libera orientação ao sair.
const full=game(true,false,{support:true});full.read('novaPartida();fase=3;runT=10.123');await full.element('mobile-fullscreen').fire('click');
assert.equal(full.read('pausado'),true);assert.equal(full.read('fase'),3);assert.equal(full.read('runT'),10.123);assert.ok(full.fullCalls.some(c=>c[0]==='enter'));assert.ok(full.fullCalls.some(c=>c[0]==='lock'&&c[1]==='landscape'));
await full.element('mobile-fullscreen').fire('click');assert.ok(full.fullCalls.some(c=>c[0]==='exit'));assert.ok(full.fullCalls.some(c=>c[0]==='unlock'));
// Orientação negada não desfaz a tela cheia, e a interface oferece rotação manual.
const noLock=game(true,false,{support:true,lockReject:true});await noLock.element('entrada-tela-cheia').fire('click');await new Promise(setImmediate);assert.match(noLock.element('fullscreen-message').textContent,/manualmente/);assert.ok(noLock.read('Boolean(document.fullscreenElement)'));
const denied=game(true,false,{support:true,reject:true});await denied.element('entrada-tela-cheia').fire('click');assert.match(denied.element('fullscreen-message').textContent,/Não foi possível/);assert.equal(denied.read('Boolean(document.fullscreenElement)'),false);
const iphone=game(true,false,{iphone:true});await iphone.element('entrada-tela-cheia').fire('click');assert.match(iphone.element('fullscreen-message').textContent,/Adicionar à Tela de Início/);
console.log('OK: tela cheia, horizontal, saída e desbloqueio; recusa e iPhone exibem orientação sem interromper a partida.');

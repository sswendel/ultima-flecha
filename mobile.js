/* Multitoque com captura: mover, desviar e recuperar sem perder o dedo. */
(() => {
 const coarse = matchMedia('(pointer: coarse)');
 const panel = document.getElementById('mobile-controls'), top = document.getElementById('mobile-top');
 const pad = document.getElementById('mobile-joy'), stick = document.getElementById('mobile-stick');
 const shot = document.getElementById('mobile-shot'), dash = document.getElementById('mobile-dash'), recall = document.getElementById('mobile-recall');
 let manual = false, aimId = null, padId = null;
 const releases=[];
 const enable = () => {toque = true; document.body.classList.add('mobile-game');};
 if(coarse.matches || navigator.maxTouchPoints > 0 || innerWidth <= 900) enable();
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')enable();},{passive:true});
 function reset(){
  releases.forEach(fn=>fn());
  joy.id=null;joy.x=joy.y=0;padId=aimId=null;manual=false;keys.shift=false;mouse.right=false;
  stick.style.transform='';[shot,dash,recall].forEach(b=>b.classList.remove('pressed'));
 }
 function resume(){iniciarAudio();if(ac && ac.state==='suspended')ac.resume().catch(()=>{});}
 function aim(){if(boss && player && !manual){const c=coreXY();mouse.x=c.x;mouse.y=c.y;}}
 function tap(e){e.preventDefault();enable();resume();if(estado!=='play'){clique();return false;}if(pausado){pausado=false;return false;}return true;}
 function bind(button,down,up){
  const ids=new Set(); releases.push(()=>ids.clear());
  button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!tap(e))return;ids.add(e.pointerId);button.setPointerCapture(e.pointerId);button.classList.add('pressed');down();});
  const end=e=>{if(!ids.delete(e.pointerId))return;if(!ids.size){button.classList.remove('pressed');up();}};
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>button.addEventListener(n,end));
 }
 bind(shot,()=>{aim();atirar();},()=>{});
 bind(dash,()=>{keys.shift=true;},()=>{keys.shift=false;});
 bind(recall,()=>{mouse.right=true;},()=>{mouse.right=false;});
 function move(e){
  const r=pad.getBoundingClientRect(),radius=r.width*.34,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const d=Math.hypot(dx,dy),k=Math.min(d,radius)/(d||1);
  joy.x=dx*k/radius;joy.y=dy*k/radius;stick.style.transform=`translate(${dx*k}px,${dy*k}px)`;
 }
 pad.addEventListener('pointerdown',e=>{if(padId!==null)return;if(!tap(e))return;padId=e.pointerId;joy.id=e.pointerId;pad.setPointerCapture(e.pointerId);move(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId===padId){e.preventDefault();move(e);}});
 const endPad=e=>{if(e.pointerId!==padId)return;padId=null;joy.id=null;joy.x=joy.y=0;stick.style.transform='';};
 ['pointerup','pointercancel','lostpointercapture'].forEach(n=>pad.addEventListener(n,endPad));
 cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;e.preventDefault();enable();resume();
  if(pausado){pausado=false;return;}
  if(estado!=='play'){clique();return;}
  if(aimId!==null)return;aimId=e.pointerId;manual=true;cv.setPointerCapture(e.pointerId);posMouse(e);
 });
 cv.addEventListener('pointermove',e=>{if(e.pointerId===aimId){e.preventDefault();posMouse(e);}});
 cv.addEventListener('pointerup',e=>{if(e.pointerId!==aimId)return;posMouse(e);atirar();aimId=null;manual=false;});
 ['pointercancel','lostpointercapture'].forEach(n=>cv.addEventListener(n,e=>{if(e.pointerId===aimId){aimId=null;manual=false;}}));
 document.getElementById('mobile-pause').addEventListener('click',()=>{if(estado==='play'){pausado=!pausado;reset();resume();}});
 function suspend(){reset();if(estado==='play')pausado=true;}
 addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
 addEventListener('orientationchange',suspend);
 const baseUpdate=update;
 update=function(dt){if(toque)aim();baseUpdate(dt);};
 const baseDraw=desenhar;
 let signature='';
 desenhar=function(){
  baseDraw();
  const active=toque && estado!=='menu';panel.hidden=!active;top.hidden=!active;
  if(!active)return;
  const s=[fase,Math.floor(runT*1000),pausado,estado,arrow.estado].join('|');
  if(s!==signature){signature=s;document.getElementById('mobile-status').textContent=`Fase ${fase}/${FASES} · ${fmt(runT)}${modoTreino?' · treino':''}`;document.getElementById('mobile-pause').textContent=pausado?'Continuar':'Pausar';shot.textContent=arrow.estado==='mao'?'ATIRAR':'SEM FLECHA';}
  dash.classList.toggle('cooling',player.dashCd>0);
 };
})();


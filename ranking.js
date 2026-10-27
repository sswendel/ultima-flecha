(() => {
 const api=String(window.RANKING_API||'').replace(/\/$/,'');
 if(!/^https:\/\//.test(api))return; // Só anuncia o ranking quando o serviço estiver conectado.
 const menuButton=document.createElement('button');menuButton.type='button';menuButton.textContent='Top 10 · melhores tempos';menuButton.className='entrada-opcao';
 document.querySelector('.entrada-botoes').append(menuButton);
 const dialog=document.createElement('dialog');dialog.className='ajuda-modal ranking-modal';
 dialog.innerHTML='<h2>TOP 10 DO ECLIPSE</h2><p id="rank-status" role="status"></p><ol id="rank-list"></ol><form id="rank-form" hidden><label for="rank-name">Seu tempo entrou no top 10! Como quer aparecer?</label><input id="rank-name" name="name" maxlength="24" autocomplete="nickname" required placeholder="Seu nome ou apelido"><p>Seu apelido e tempo ficarão públicos.</p><button type="submit">Salvar meu tempo</button></form><button id="rank-close" type="button">Fechar</button>';
 document.body.append(dialog);
 const status=dialog.querySelector('#rank-status'),list=dialog.querySelector('#rank-list'),form=dialog.querySelector('form'),input=dialog.querySelector('input'),save=form.querySelector('button');
 const victoryButton=document.createElement('button');victoryButton.type='button';victoryButton.id='ranking-victory';victoryButton.textContent='Ver top 10 / salvar tempo';victoryButton.hidden=true;document.body.append(victoryButton);
 let ticket=null,session=0,finished=false,submitted=false,result=null;
 const precise=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
 async function request(path,body){const response=await fetch(api+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Ranking indisponível.');return data;}
 function render(entries){list.replaceChildren();for(const e of entries){const li=document.createElement('li');li.textContent=`${e.name} — ${precise(e.ms)}`;list.append(li);}if(!entries.length)status.textContent='Seja a primeira pessoa no ranking!';}
 async function open(){
  if(!dialog.open)dialog.showModal();status.textContent='Carregando tempos…';form.hidden=true;
  try{const data=await request('/ranking');render(data.entries);const qualified=result && !submitted && !modoTreino && (data.entries.length<10 || result.ms<data.entries[9].ms);status.textContent=result?`Seu tempo: ${precise(result.ms)}${modoTreino?' · treino não participa do ranking.':''}`:data.entries.length?'As 10 conclusões mais rápidas, do menor para o maior tempo.':status.textContent;
   if(qualified){if(await ticket){form.hidden=false;input.focus();}else status.textContent+=' · Sem conexão no início desta partida. Jogue novamente para registrar um tempo.';}
  }catch{status.textContent='Não foi possível carregar o ranking. Feche e tente novamente.';}
 }
 menuButton.addEventListener('click',open);victoryButton.addEventListener('click',open);dialog.querySelector('#rank-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('keydown',e=>e.stopPropagation());
 form.addEventListener('submit',async e=>{e.preventDefault();if(!result || submitted)return;save.disabled=true;status.textContent='Salvando…';
  try{const token=await ticket;if(!token)throw Error('Partida sem conexão inicial.');const data=await request('/finish',{ticket:token,ms:result.ms,name:input.value,mode:'normal',device:toque?'touch':'desktop'});render(data.entries);submitted=true;form.hidden=true;status.textContent=data.qualified?`Registrado! Você ficou em ${data.rank}º lugar.`:'Outro jogador foi mais rápido: seu tempo ficou fora do top 10.';}
  catch(error){status.textContent=error.name==='TimeoutError'?'Conexão demorou. Tente novamente.':error.message;}finally{save.disabled=false;}
 });
 const baseNew=novaPartida;novaPartida=function(){session++;const id=session;finished=false;submitted=false;result=null;victoryButton.hidden=true;ticket=modoTreino?null:request('/start',{}).then(data=>id===session?data.ticket:null).catch(()=>null);baseNew();};
 const baseUpdate=update;update=function(dt){baseUpdate(dt);if(estado==='vitoria'&&!finished){finished=true;result={ms:Math.round(runT*1000)};victoryButton.hidden=false;if(!modoTreino)open();}if(estado!=='vitoria')victoryButton.hidden=true;};
})();

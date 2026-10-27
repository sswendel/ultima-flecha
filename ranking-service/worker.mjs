// Cloudflare Worker: arquivo JSON no GitHub, sem banco de dados.
const encoder = new TextEncoder();
export function insert(entries, entry) {
 return [...entries, entry].sort((a,b)=>a.ms-b.ms || a.date.localeCompare(b.date) || a.id.localeCompare(b.id)).slice(0,10);
}
const b64 = text => btoa(String.fromCharCode(...encoder.encode(text)));
const unb64 = text => new TextDecoder().decode(Uint8Array.from(atob(text),c=>c.charCodeAt(0)));
async function key(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function sign(payload,secret){const data=b64(JSON.stringify(payload));const sig=await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(data));return data+'.'+btoa(String.fromCharCode(...new Uint8Array(sig)));}
async function verify(token,secret){
 try{const [data,sig]=token.split('.');if(!await crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(atob(sig),c=>c.charCodeAt(0)),encoder.encode(data)))return null;return JSON.parse(unb64(data));}catch{return null;}
}
export default { async fetch(request, env) {
 const headers={'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Vary':'Origin'};
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.headers.get('Origin')!==env.ALLOWED_ORIGIN)return reply({error:'Origem não permitida.'},403);
 if(!env.GITHUB_TOKEN || !env.SESSION_SECRET)return reply({error:'Ranking temporariamente indisponível.'},503);
 const ghHeaders={Authorization:`Bearer ${env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','User-Agent':'ultima-flecha-ranking','X-GitHub-Api-Version':'2022-11-28'};
 const endpoint=`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${env.GITHUB_PATH}`;
 async function read(){const r=await fetch(endpoint+'?ref='+encodeURIComponent(env.GITHUB_BRANCH),{headers:ghHeaders,cache:'no-store'});if(!r.ok)throw Error('github');const file=await r.json();return {sha:file.sha,data:JSON.parse(unb64(file.content.replace(/\s/g,'')))};}
 try{
  const path=new URL(request.url).pathname;
  if(path==='/ranking' && request.method==='GET'){const {data}=await read();return reply({entries:data.entries});}
  if(request.method!=='POST')return reply({error:'Rota não encontrada.'},404);
  if(Number(request.headers.get('Content-Length'))>2048)return reply({error:'Pedido muito grande.'},413);
  const raw=await request.text();if(raw.length>2048)return reply({error:'Pedido muito grande.'},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:'Pedido inválido.'},400);}
  if(path==='/start'){
   if(body.mode!=='normal')return reply({error:'Somente partidas normais podem participar do ranking.'},400);
   return reply({ticket:await sign({id:crypto.randomUUID(),start:Date.now(),mode:'normal',rules:2},env.SESSION_SECRET)});
  }
  if(path!=='/finish')return reply({error:'Rota não encontrada.'},404);
  const ticket=await verify(String(body.ticket||''),env.SESSION_SECRET);
  const elapsed=ticket?(Date.now()-ticket.start):0;
  if(!ticket || ticket.mode!=='normal' || ticket.rules!==2 || elapsed<12000 || elapsed>86400000 || !Number.isInteger(body.ms) || body.ms<12000 || body.ms>elapsed+1000 || body.mode!=='normal')return reply({error:'Partida inválida ou expirada.'},400);
  const name=String(body.name||'').normalize('NFC').trim().replace(/\s+/g,' ');
  if(!/^[\p{L}\p{N} ._-]{1,24}$/u.test(name))return reply({error:'Use de 1 a 24 letras, números, espaços, ponto, hífen ou sublinhado.'},400);
  const entry={id:ticket.id,name,ms:body.ms,date:new Date().toISOString(),device:body.device==='touch'?'touch':'desktop',mode:'normal',rules:2};
  // SHA evita sobrescrever um recorde simultâneo; conflitos relêem o arquivo.
  for(let retry=0;retry<4;retry++){
   const {sha,data}=await read();
   if(data.used?.includes(ticket.id))return reply({error:'Esta partida já foi registrada.'},409);
   const entries=insert(data.entries,entry),rank=entries.findIndex(e=>e.id===entry.id)+1;
   if(!rank)return reply({qualified:false,entries:data.entries});
   const next={version:1,entries,used:[...(data.used||[]),ticket.id].slice(-2000)};
   const r=await fetch(endpoint,{method:'PUT',headers:{...ghHeaders,'Content-Type':'application/json'},body:JSON.stringify({message:`Registra tempo no top 10 [skip ci]`,content:b64(JSON.stringify(next,null,2)+'\n'),sha,branch:env.GITHUB_BRANCH})});
   if(r.status===409 || r.status===422)continue;
   if(!r.ok)throw Error('write');
   return reply({qualified:true,rank,entries});
  }
  return reply({error:'Outro tempo chegou junto. Tente salvar novamente.'},409);
 }catch{return reply({error:'Não foi possível acessar o ranking. Tente novamente.'},503);}
}};

/* CC Player TEST: verified match-sheet viewer, authenticated team-scoped RPC. */
(function(root){
'use strict';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function attach(host,options){
 const {eventId,db}=options||{};
 if(!host||!uuid.test(String(eventId||''))||!db||typeof db.rpc!=='function')return false;
 const box=document.createElement('section'),button=document.createElement('button'),output=document.createElement('div');
 button.type='button';button.textContent='CC jegyzőkönyv megtekintése';button.className='ghost-btn';
 output.setAttribute('role','status');box.append(button,output);host.append(box);
 button.addEventListener('click',async()=>{
  button.disabled=true;output.textContent='Jegyzőkönyv betöltése…';
  try{
   const {data,error}=await db.rpc('cc_player_match_sheet_read_v1',{p_event_id:eventId});
   if(error)throw error;
   if(!box.isConnected)return;
   const result=typeof data==='string'?JSON.parse(data):data;
   output.replaceChildren();
   if(!result?.sheet){output.textContent='Ehhez a meccshez még nincs közzétett CC jegyzőkönyv.';return}
   const heading=document.createElement('h3');
   heading.textContent=[result.sheet.homeTeamName,result.sheet.awayTeamName].filter(Boolean).join(' – ');
   output.append(heading);
   const info=document.createElement('p');info.textContent=[result.sheet.venue,result.sheet.matchStatus].filter(Boolean).join(' · ');output.append(info);
   const sets=document.createElement('p');sets.textContent=(result.sets||[]).map(s=>s.setNo+'. szett: '+(s.homePoints??'–')+':'+(s.awayPoints??'–')).join(' | ')||'Nincs szetteredmény';output.append(sets);
   const list=document.createElement('ul');
   (result.roster||[]).forEach(p=>{const li=document.createElement('li');li.textContent=(p.side==='home'?'Hazai':'Vendég')+' #'+(p.jerseyNo??'–')+' '+(p.playerName||'')+(p.isCaptain?' (C)':'')+(p.isLibero?' (L)':'');list.append(li)});
   output.append(list);
  }catch(error){if(box.isConnected)output.textContent='A jegyzőkönyv nem érhető el: '+String(error?.message||error)}
  finally{button.disabled=false}
 });return true;
}
root.CCPlayerMatchSheet=Object.freeze({attach});
})(typeof globalThis!=='undefined'?globalThis:this);

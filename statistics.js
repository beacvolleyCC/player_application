/* Club Control Player – competition statistics from recorded league results.
   Only completed, de-duplicated saved matches count. No invented standings points
   or playing time; the protocol K/CS fields are roster status codes. */
'use strict';
let ccStatsTab_='overview';
let ccStatsTeam_='';
let ccStatsCompare_=['',''];

function ccStatsSource_(){
  const league=ccPlayerLeagueCurrent_();
  const all=ccMrszPlayerAllLeagueMatches_(league,false).filter(m=>!ccMrszPlayerUnverifiedSelfFixture_(m));
  const played=all.filter(m=>{
    const h=Number(m.homeSets),a=Number(m.awaySets);
    return Number.isInteger(h)&&Number.isInteger(a)&&((h===3&&a>=0&&a<=2)||(a===3&&h>=0&&h<=2));
  }).sort((a,b)=>String(a.startsAt||'').localeCompare(String(b.startsAt||'')));
  const records=new Map();
  const ensure=name=>{
    const id=ccPlayerMatchTeamKey_(name);
    if(!id)return null;
    if(!records.has(id))records.set(id,{id,name:String(name||''),won:0,lost:0,played:0,
      setsFor:0,setsAgainst:0,homeWon:0,homeLost:0,awayWon:0,awayLost:0,results:[]});
    return records.get(id);
  };
  const photo=(ccMrszPlayerPhoto_.tables||[]).find(t=>t.competitionLabel===league);
  (photo?.rows||[]).forEach(r=>ensure(r.teamName));
  played.forEach(m=>{
    const home=ensure(m.homeName),away=ensure(m.awayName);
    if(!home||!away||home.id===away.id)return;
    const hs=Number(m.homeSets),as=Number(m.awaySets),date=String(m.startsAt||'');
    const add=(team,own,opp,isHome)=>{
      const win=own>opp;
      team.played++;team[win?'won':'lost']++;
      team.setsFor+=own;team.setsAgainst+=opp;
      const homeAway=isHome?'home':'away';
      team[homeAway+(win?'Won':'Lost')]++;
      team.results.push({win,date,opponent:isHome?m.awayName:m.homeName,score:own+'–'+opp,home:isHome});
    };
    add(home,hs,as,true);add(away,as,hs,false);
  });
  const teams=Array.from(records.values()).sort((a,b)=>b.won-a.won||b.setsFor-b.setsAgainst-(a.setsFor-a.setsAgainst)||a.name.localeCompare(b.name,'hu'));
  return {league,played,teams,partial:true};
}
function ccStatsRecent_(team){return team.results.slice(-5)}
function ccStatsTrend_(team){
  const r=team.results;
  if(r.length<6)return null;
  const last=r.slice(-3),before=r.slice(-6,-3);
  return last.filter(x=>x.win).length-before.filter(x=>x.win).length;
}
function ccStatsFormHtml_(team){
  const recent=ccStatsRecent_(team);
  if(!recent.length)return '<span class="cc-stats-empty">–</span>';
  return '<span class="cc-stats-form" aria-label="Utolsó öt mérkőzés">'+recent.map(r=>'<i class="'+(r.win?'win':'loss')+'" title="'+(r.win?'Győzelem':'Vereség')+'"></i>').join('')+'</span>';
}
function ccStatsRatio_(team){
  return team.played ? (team.setsAgainst?Number(team.setsFor/team.setsAgainst).toFixed(3):'–') : '–';
}
function ccStatsSummaryCard_(label,team,value){
  return '<div class="cc-stats-metric"><span>'+label+'</span><b>'+escapeHtml_(team?.name||'–')+'</b><small>'+escapeHtml_(value||'Nincs elég adat')+'</small></div>';
}
function ccStatsOverview_(data){
  const active=data.teams.filter(t=>t.played>0);
  const byForm=active.slice().sort((a,b)=>b.results.slice(-5).filter(x=>x.win).length-a.results.slice(-5).filter(x=>x.win).length||b.won-a.won);
  const rising=active.filter(t=>ccStatsTrend_(t)>0).sort((a,b)=>ccStatsTrend_(b)-ccStatsTrend_(a));
  const falling=active.filter(t=>ccStatsTrend_(t)<0).sort((a,b)=>ccStatsTrend_(a)-ccStatsTrend_(b));
  const ratio=active.filter(t=>t.setsAgainst>0).sort((a,b)=>(b.setsFor/b.setsAgainst)-(a.setsFor/a.setsAgainst));
  let historyHtml='<div class="cc-stats-metrics">'+ccStatsSummaryCard_('Legnagyobb feljövő',null,'')+ccStatsSummaryCard_('Legnagyobb visszaeső',null,'')+'</div><p class="cc-stats-muted">Helyezésváltozás csak több, összehasonlítható tabellafrissítésből számítható.</p>';
  const current=competitionLeagueInsights?.data||{};
  if(current.competitionLabel===data.league&&Array.isArray(current.teams)){
    const deltas=current.teams.map(t=>({name:t.teamName,delta:insightPositionDelta_(t.history,t.current?.position,t.current?.played)}));
    const up=deltas.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta)[0];
    const down=deltas.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta)[0];
    if(up||down)historyHtml='<div class="cc-stats-metrics">'+ccStatsSummaryCard_('Legnagyobb feljövő',up,up?'↑ '+up.delta+' hely':'')+ccStatsSummaryCard_('Legnagyobb visszaeső',down,down?'↓ '+Math.abs(down.delta)+' hely':'')+'</div>';
  }
  return '<div class="cc-stats-pane"><div class="cc-stats-metrics">'+
    ccStatsSummaryCard_('Forma',byForm[0],byForm[0]?byForm[0].results.slice(-5).filter(x=>x.win).length+'/'+Math.min(5,byForm[0].played)+' győzelem':'')+
    ccStatsSummaryCard_('Javuló forma',rising[0],rising[0]?'+'+ccStatsTrend_(rising[0])+' győzelem / 3 meccs':'')+
    ccStatsSummaryCard_('Romló forma',falling[0],falling[0]?ccStatsTrend_(falling[0])+' győzelem / 3 meccs':'')+
    ccStatsSummaryCard_('Szettarány',ratio[0],ratio[0]?ccStatsRatio_(ratio[0]):'')+
    '</div><section class="cc-stats-panel"><h4>Forma és helyezés</h4><p>Az elérhető eredmények alapján · legutóbbi 5 mérkőzés</p>'+
    ccStatsTeamsTable_(data.teams)+'</section><section class="cc-stats-panel"><h4>Helyezésváltozás</h4>'+historyHtml+'</section></div>';
}
function ccStatsTeamsTable_(teams){
  if(!teams.length)return '<p class="cc-stats-muted">Még nincs rögzített csapatadat.</p>';
  return '<div class="cc-stats-team-list">'+teams.map(team=>
    '<button class="cc-stats-team-row" type="button" data-cc-stats-team="'+escapeHtml_(team.id)+'">'+
    '<span class="cc-stats-team-name">'+standingsTeamLogoHtml_(team.name,'league-logo')+'<b>'+escapeHtml_(team.name)+'</b></span>'+
    ccStatsFormHtml_(team)+'<span class="cc-stats-record">'+(team.played?team.won+'–'+team.lost:'–')+'</span></button>'
  ).join('')+'</div>';
}
function ccStatsTeams_(data){
  const t=data.teams.find(x=>x.id===ccStatsTeam_)||data.teams.find(x=>x.played)||data.teams[0];
  if(!t)return '<p class="cc-stats-muted">Még nincs csapatadat.</p>';
  const matches=t.results.slice().reverse().slice(0,5).map(r=>
    '<div class="cc-stats-recent-match"><span>'+escapeHtml_(r.opponent)+'</span><b class="'+(r.win?'win':'loss')+'">'+escapeHtml_(r.score)+'</b></div>').join('');
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Csapatok</h4>'+
    ccStatsTeamsTable_(data.teams)+'</section><section class="cc-stats-panel"><h4>'+escapeHtml_(t.name)+'</h4>'+
    '<div class="cc-stats-metrics"><div class="cc-stats-metric"><span>Mérleg</span><b>'+t.won+'–'+t.lost+'</b><small>'+t.played+' mérkőzés</small></div>'+
    '<div class="cc-stats-metric"><span>Szettarány</span><b>'+ccStatsRatio_(t)+'</b><small>'+t.setsFor+'–'+t.setsAgainst+' szett</small></div>'+
    '<div class="cc-stats-metric"><span>Hazai</span><b>'+t.homeWon+'–'+t.homeLost+'</b></div>'+
    '<div class="cc-stats-metric"><span>Idegen</span><b>'+t.awayWon+'–'+t.awayLost+'</b></div></div>'+
    '<h5>Legutóbbi 5</h5>'+ (matches||'<p class="cc-stats-muted">Nincs eredmény.</p>')+'</section></div>';
}
function ccStatsMatches_(data){
  if(!data.played.length)return '<p class="cc-stats-muted">Nincs rögzített, befejezett mérkőzés.</p>';
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Meccsek</h4><p>'+data.played.length+' rögzített eredmény</p><div class="cc-stats-match-list">'+
    data.played.slice().reverse().map(m=>{
      const hasSheet=!!m.matchCode&&Array.isArray(m.protocol?.teams)&&m.protocol.teams.length===2;
      const kickoff=ccMrszPlayerLocalKickoff_(m.startsAt);
      return '<div class="cc-stats-match-row"><span>'+escapeHtml_(kickoff.date||'–')+'</span><span>'+escapeHtml_(m.homeName)+' – '+escapeHtml_(m.awayName)+'</span><b>'+escapeHtml_(m.homeSets+' – '+m.awaySets)+'</b>'+
      (hasSheet?'<button type="button" data-cc-stats-protocol="'+escapeHtml_(m.matchCode)+'" aria-label="Jegyzőkönyv megnyitása">Jegyzőkönyv ↗</button>':'')+'</div>';
    }).join('')+'</div></section></div>';
}
function ccStatsPlayers_(data){
  const registry=new Map();
  data.played.forEach(m=>{
    if(!Array.isArray(m.protocol?.teams))return;
    m.protocol.teams.forEach(team=>(team.players||[]).forEach(p=>{
      const name=String(p.name||'').trim(),code=String(p.code||'').trim();
      if(!name)return;
      const teamKey=ccPlayerMatchTeamKey_(team.name);
      const id=code?'id:'+code:'name:'+teamKey+':'+name.toLocaleLowerCase('hu');
      if(!registry.has(id))registry.set(id,{name,code,team:team.name,shirts:new Set(),nominated:0,starts:0,substitutes:0,latest:'',profileUrl:''});
      const row=registry.get(id);
      row.nominated++;
      if(p.designation==='K')row.starts++;
      if(p.designation==='CS')row.substitutes++;
      if(p.number)row.shirts.add(String(p.number));
      row.latest=String(m.startsAt||'')>row.latest?String(m.startsAt||''):row.latest;
      if(ccPlayerProtocolProfileUrl_(p.profileUrl))row.profileUrl=p.profileUrl;
    }));
  });
  const players=[...registry.values()].sort((a,b)=>b.nominated-a.nominated||b.starts-a.starts||a.name.localeCompare(b.name,'hu'));
  if(!players.length)return '<p class="cc-stats-muted">Nincs mentett játékosjegyzőkönyv ehhez a bajnoksághoz.</p>';
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Játékosstatisztikák</h4>'+
    '<p>A mentett jegyzőkönyvek alapján. A nevezés nem azonos a pályára lépéssel.</p><div class="cc-stats-player-scroll"><table><thead><tr><th>Játékos</th><th>Nevezés</th><th>K</th><th>CS</th><th>Utolsó nevezés</th></tr></thead><tbody>'+
    players.map(p=>'<tr><td><b>'+ccPlayerProtocolNameHtml_(p)+'</b><small>'+escapeHtml_(p.team)+'</small></td><td>'+p.nominated+'</td><td>'+p.starts+'</td><td>'+p.substitutes+'</td><td>'+escapeHtml_(p.latest?ccMrszPlayerLocalKickoff_(p.latest).date:'–')+'</td></tr>').join('')+
    '</tbody></table></div></section></div>';
}
function ccStatsComparison_(data){
  if(data.teams.length<2)return '<p class="cc-stats-muted">Az összehasonlításhoz legalább két csapat szükséges.</p>';
  const a=data.teams.find(t=>t.id===ccStatsCompare_[0])||data.teams[0];
  const b=data.teams.find(t=>t.id===ccStatsCompare_[1]&&t.id!==a.id)||data.teams.find(t=>t.id!==a.id);
  const selector=(side,selected)=>'<label><span>Csapat '+(side==='a'?'1':'2')+'</span><select data-cc-stats-compare="'+side+'">'+data.teams.map(t=>'<option value="'+escapeHtml_(t.id)+'" '+(t.id===selected.id?'selected':'')+'>'+escapeHtml_(t.name)+'</option>').join('')+'</select></label>';
  const row=(label,v1,v2)=>'<tr><th>'+label+'</th><td>'+v1+'</td><td>'+v2+'</td></tr>';
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Összehasonlítás</h4><div class="cc-stats-compare-pickers">'+selector('a',a)+selector('b',b)+'</div><div class="cc-stats-player-scroll"><table class="cc-stats-compare-table"><thead><tr><th>Mutató</th><th>'+escapeHtml_(a.name)+'</th><th>'+escapeHtml_(b.name)+'</th></tr></thead><tbody>'+
    row('Mérleg',a.won+'–'+a.lost,b.won+'–'+b.lost)+row('Szettarány',ccStatsRatio_(a),ccStatsRatio_(b))+
    row('Hazai',a.homeWon+'–'+a.homeLost,b.homeWon+'–'+b.homeLost)+row('Idegen',a.awayWon+'–'+a.awayLost,b.awayWon+'–'+b.awayLost)+
    row('Legutóbbi 5',a.results.slice(-5).filter(x=>x.win).length+'/'+Math.min(5,a.played),b.results.slice(-5).filter(x=>x.win).length+'/'+Math.min(5,b.played))+
    '</tbody></table></div></section></div>';
}
function ccRenderStatisticsPage_(){
  const view=document.getElementById('statisticsView'),host=document.getElementById('statisticsContent');
  if(!view||!host||!view.classList.contains('active'))return;
  const data=ccStatsSource_();
  const catalog=ccPlayerLeagueCatalog_();
  const selector=catalog.length>1?'<label class="cc-stats-league"><span>Bajnokság / csoport</span><select id="ccStatsLeagueSelect">'+catalog.map(c=>'<option value="'+escapeHtml_(c.competitionLabel)+'" '+(c.competitionLabel===data.league?'selected':'')+'>'+escapeHtml_(c.competitionLabel)+'</option>').join('')+'</select></label>':'';
  const tabs=[['overview','Áttekintés'],['teams','Csapatok'],['matches','Meccsek'],['players','Játékosok'],['compare','Összehasonlítás']];
  const nav='<div class="cc-stats-tab-scroll"><div class="cc-stats-tabs" role="tablist" aria-label="Statisztikai nézet">'+
    tabs.map(([id,label])=>'<button type="button" role="tab" data-cc-stats-tab="'+id+'" aria-selected="'+(ccStatsTab_===id)+'" class="'+(ccStatsTab_===id?'active':'')+'">'+label+'</button>').join('')+
    '</div></div>';
  const views={overview:ccStatsOverview_,teams:ccStatsTeams_,matches:ccStatsMatches_,players:ccStatsPlayers_,compare:ccStatsComparison_};
  const pane=(views[ccStatsTab_]||views.overview)(data);
  host.innerHTML=selector+nav+(ccMrszPlayerPhoto_.loaded?pane:'<div class="cc-stats-panel">Statisztikák betöltése…</div>')+
    '<p class="cc-stats-source-note">A kimutatás a rendelkezésre álló mentett eredményekből és jegyzőkönyvekből készült; nem teljes hivatalos bajnoki statisztika.</p>';
}
document.getElementById('statisticsContent')?.addEventListener('click',event=>{
  const tab=event.target.closest('[data-cc-stats-tab]');
  if(tab){ccStatsTab_=tab.dataset.ccStatsTab;ccRenderStatisticsPage_();return}
  const team=event.target.closest('[data-cc-stats-team]');
  if(team){ccStatsTeam_=team.dataset.ccStatsTeam;ccStatsTab_='teams';ccRenderStatisticsPage_();return}
  const protocol=event.target.closest('[data-cc-stats-protocol]');
  if(protocol){ccPlayerOpenProtocol_(protocol.dataset.ccStatsProtocol,ccPlayerLeagueCurrent_());return}
});
document.getElementById('statisticsContent')?.addEventListener('change',event=>{
  if(event.target.id==='ccStatsLeagueSelect'){
    const league=String(event.target.value||'');
    if(!ccPlayerLeagueCatalog_().some(c=>c.competitionLabel===league))return;
    ccPlayerLeagueSelection_=league;ccStatsTeam_='';ccStatsCompare_=['',''];
    try{localStorage.setItem('cc-player-league-context-v1',league)}catch(_){}
    renderPlanner();return;
  }
  if(event.target.matches('[data-cc-stats-compare]')){
    const side=event.target.dataset.ccStatsCompare==='a'?0:1;
    ccStatsCompare_[side]=event.target.value;
    ccRenderStatisticsPage_();
  }
});

/* Club Control Player – competition statistics from recorded league results.
   Only completed, de-duplicated saved matches count. No invented standings points
   or playing time; the protocol K/CS fields are roster status codes. */
'use strict';
let ccStatsTab_='overview';
let ccStatsExpanded_=false;
let ccStatsTeam_='';
let ccStatsCompare_=['',''];
let ccStatsPlayersTeam_='all';

function ccStatsSource_(){
  const league=ccPlayerLeagueCurrent_();
  const all=ccMrszPlayerAllLeagueMatches_(league,false)
    .filter(m=>!ccMrszPlayerUnverifiedSelfFixture_(m)&&!m.__ccResultConflict);
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
  // A partial screenshot is not evidence of a complete competition ranking.
  // A league-wide form comparison is valid only when the saved official
  // table is explicitly complete and every played count matches our results.
  const verifiedComplete=!!photo&&photo.partial===false
    &&Array.isArray(photo.rows)&&photo.rows.length>1
    &&photo.rows.length===teams.length
    &&photo.rows.every(row=>{
      const team=records.get(ccPlayerMatchTeamKey_(row.teamName));
      // A manually corrected score must not leave old official rankings marked
      // as verified. Compare all available counters, not only matches played.
      const fields=[['played','played'],['wins','won'],['losses','lost'],
        ['setsFor','setsFor'],['setsAgainst','setsAgainst']];
      return !!team&&fields.every(([stored,actual])=>{
        const n=row[stored];
        return n!==null&&n!==undefined&&String(n).trim()!==''
          &&Number.isInteger(Number(n))&&Number(n)===team[actual];
      });
    });
  return {league,played,teams,partial:!verifiedComplete,verifiedComplete};
}
function ccStatsRecent_(team){return team.results.slice(-5)}
function ccStatsTrend_(team){
  const r=team.results;
  if(r.length<6)return null;
  const last=r.slice(-3),before=r.slice(-6,-3);
  return last.filter(x=>x.win).length-before.filter(x=>x.win).length;
}
function ccStatsFormHtml_(team){
  // Chronological from left to right, exactly the last five played games.
  // Unavailable results have a neutral dash rather than a fictional loss.
  const recent=ccStatsRecent_(team);
  const missing=Math.max(0,5-recent.length);
  const results=recent.map(r=>{
    const kind=r.win?'win':'loss';
    const label=r.win?'Győzelem':'Vereség';
    const detail=[label,r.opponent,r.score].filter(Boolean).join(' · ');
    return '<span class="cc-stats-form-result '+kind+'" title="'+escapeHtml_(detail)+'" aria-label="'+escapeHtml_(detail)+'">'+(r.win?'W':'L')+'</span>';
  }).join('');
  const empty=Array.from({length:missing},()=>'<span class="cc-stats-form-result no-data" aria-label="Nincs rögzített eredmény">–</span>').join('');
  return '<span class="cc-stats-form" aria-label="Utolsó öt mérkőzés, időrendben">'+empty+results+'</span>';
}
function ccStatsRatio_(team){
  return team.played ? (team.setsAgainst?Number(team.setsFor/team.setsAgainst).toFixed(3):'–') : '–';
}
function ccStatsSummaryCard_(label,team,value){
  return '<div class="cc-stats-metric"><span>'+label+'</span><b>'+escapeHtml_(team?.name||'–')+'</b>'+(value?'<strong class="cc-stats-metric-value">'+escapeHtml_(value)+'</strong>':'')+'</div>';
}
function ccStatsOverview_(data){
  const active=data.teams.filter(t=>t.played>0);
  // Never name a league-wide best or worst from an incomplete results sample.
  const eligible=data.verifiedComplete&&data.teams.length>1&&data.teams.every(t=>t.results.length>=5)
    ?data.teams
    :[];
  const top=eligible.slice().sort((a,b)=>
    b.results.slice(-5).filter(x=>x.win).length-a.results.slice(-5).filter(x=>x.win).length)[0];
  const bottom=eligible.slice().sort((a,b)=>
    a.results.slice(-5).filter(x=>x.win).length-b.results.slice(-5).filter(x=>x.win).length)[0];
  const formText=team=>team?team.results.slice(-5).filter(x=>x.win).length+'/5 győzelem':'';
  const own=active.find(t=>ccLeaguePlayerHasBeac_(t.name))||null;
  let historyHtml='<span class="cc-stats-empty">–</span>';
  const current=competitionLeagueInsights?.data||{};
  if(current.competitionLabel===data.league&&Array.isArray(current.teams)){
    const team=current.teams.find(t=>ccLeaguePlayerHasBeac_(t.teamName));
    if(team){
      const delta=insightPositionDelta_(team.history,team.current?.position,team.current?.played);
      if(delta!==null)historyHtml='<span class="cc-stats-history">'+escapeHtml_(team.teamName)+' · '+(delta>0?'↑ '+delta+' hely':delta<0?'↓ '+Math.abs(delta)+' hely':'Nincs változás')+'</span>';
    }
  }
   return '<div class="cc-stats-pane"><div class="cc-stats-metrics">'+
    ccStatsSummaryCard_('Legjobb forma'+(eligible.length?'':' (nem igazolt)'),top,formText(top))+
    ccStatsSummaryCard_('Legrosszabb forma'+(eligible.length?'':' (nem igazolt)'),bottom,formText(bottom))+
    ccStatsSummaryCard_('Mérleg',own,own?own.won+'–'+own.lost:'')+
    ccStatsSummaryCard_('Szettarány',own,own?ccStatsRatio_(own):'')+
    '</div>'+
    '<section class="cc-stats-panel"><h4>Csapatok formája</h4>'+
    ccStatsTeamsTable_(data.teams)+'</section><section class="cc-stats-panel"><h4>Helyezésváltozás</h4>'+historyHtml+'</section></div>';
}
function ccStatsTeamsTable_(teams){
  if(!teams.length)return '<p class="cc-stats-muted">Még nincs rögzített csapatadat.</p>';
  return '<div class="cc-stats-team-list"><div class="cc-stats-team-list-head"><span>Csapat</span><span>Utolsó 5 mérkőzés</span><span>Mérleg</span></div>'+teams.map(team=>
    '<button class="cc-stats-team-row" type="button" data-cc-stats-team="'+escapeHtml_(team.id)+'">'+
    '<span class="cc-stats-team-name">'+standingsTeamLogoHtml_(team.name,'league-logo')+'<b>'+escapeHtml_(team.name)+'</b></span>'+
    ccStatsFormHtml_(team)+'<span class="cc-stats-record">'+(team.played?team.won+'–'+team.lost:'–')+'</span></button>'
  ).join('')+'</div>';
}
function ccStatsTeams_(data){
  const t=data.teams.find(x=>x.id===ccStatsTeam_)||data.teams.find(x=>x.played)||data.teams[0];
  if(!t)return '<p class="cc-stats-muted">Még nincs csapatadat.</p>';
  const matches=t.results.slice().reverse().slice(0,5).map(r=>
    '<div class="cc-stats-recent-match"><span>'+escapeHtml_(r.opponent)+'</span><span class="cc-stats-recent-result"><b class="'+(r.win?'win':'loss')+'">'+(r.win?'W':'L')+'</b><strong>'+escapeHtml_(r.score)+'</strong></span></div>').join('');
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Csapatok</h4>'+
    ccStatsTeamsTable_(data.teams)+'</section><section class="cc-stats-panel"><h4>'+escapeHtml_(t.name)+'</h4>'+
    '<div class="cc-stats-metrics"><div class="cc-stats-metric"><span>Mérleg</span><b>'+t.won+'–'+t.lost+'</b><strong class="cc-stats-metric-value">'+t.played+' mérkőzés</strong></div>'+
    '<div class="cc-stats-metric"><span>Szettarány</span><b>'+ccStatsRatio_(t)+'</b><strong class="cc-stats-metric-value">'+t.setsFor+'–'+t.setsAgainst+' szett</strong></div>'+
    '<div class="cc-stats-metric"><span>Hazai</span><b>'+t.homeWon+'–'+t.homeLost+'</b></div>'+
    '<div class="cc-stats-metric"><span>Idegen</span><b>'+t.awayWon+'–'+t.awayLost+'</b></div></div>'+
    '<h5>Legutóbbi 5</h5>'+ (matches||'<p class="cc-stats-muted">Nincs eredmény.</p>')+'</section></div>';
}
function ccStatsMatches_(data){
  if(!data.played.length)return '<p class="cc-stats-muted">Nincs rögzített, befejezett mérkőzés.</p>';
  return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Meccsek</h4><div class="cc-stats-match-list">'+
    data.played.slice().reverse().map(m=>{
      const hasSheet=!!m.matchCode&&Array.isArray(m.protocol?.teams)&&m.protocol.teams.length===2;
      const kickoff=ccMrszPlayerLocalKickoff_(m.startsAt);
      return '<div class="cc-stats-match-row"><span>'+escapeHtml_(kickoff.date||'–')+'</span><span>'+escapeHtml_(m.homeName)+' – '+escapeHtml_(m.awayName)+'</span><b>'+escapeHtml_(m.homeSets+' – '+m.awaySets)+'</b>'+
      (hasSheet?'<button type="button" data-cc-stats-protocol="'+escapeHtml_(m.matchCode)+'" aria-label="Jegyzőkönyv megnyitása">Jegyzőkönyv ↗</button>':'')+'</div>';
    }).join('')+'</div></section></div>';
}
function ccStatsPlayerRows_(data){
  // Only a verified player ID on the correct side of a completed saved match
  // supports a player-specific nomination-based W/L record. K/CS are protocol
  // markings, not evidence of individual court time.
  const registry=new Map(),conflicted=new Set(),seenMatches=new Set();
  for(const m of data.played||[]){
    const home=ccPlayerMatchTeamKey_(m.homeName),away=ccPlayerMatchTeamKey_(m.awayName);
    const h=Number(m.homeSets),a=Number(m.awaySets);
    if(!home||!away||home===away||!((h===3&&a>=0&&a<=2)||(a===3&&h>=0&&h<=2)))continue;
    if(!Array.isArray(m.protocol?.teams))continue;
    const fixture=String(m.matchCode||'')||ccMrszPlayerLocalKickoff_(m.startsAt).date+'|'+home+'|'+away;
    const matchKey=String(data.league||'')+'|'+fixture;
    if(seenMatches.has(matchKey))continue;
    seenMatches.add(matchKey);
    const processedSides=new Set();
    for(const team of m.protocol.teams){
      const key=ccPlayerMatchTeamKey_(team.name);
      if(!key||(key!==home&&key!==away)||processedSides.has(key)||!Array.isArray(team.players))continue;
      processedSides.add(key);
      const sideIds=team.players.map(p=>String(p.code||'').trim()).filter(Boolean);
      // No reliable player attribution from a broken duplicate-ID roster.
      if(new Set(sideIds).size!==sideIds.length)continue;
      for(const p of team.players){
        const name=String(p.name||'').trim(),code=String(p.code||'').trim();
        if(!name||!/^\d{4,6}$/.test(code))continue;
        const id=key+'|'+code;
        const norm=n=>String(n).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu').replace(/\s+/g,' ').trim();
        const previous=registry.get(id);
        if(previous&&norm(previous.name)!==norm(name)){conflicted.add(id);continue}
        if(!previous)registry.set(id,{id,name,code,team:team.name,teamKey:key,
          nominated:0,won:0,lost:0,starts:0,substitutes:0,unmarked:0,
          latest:'',profileUrl:''});
        const row=registry.get(id);
        row.nominated++;
        row[key===home?(h===3?'won':'lost'):(a===3?'won':'lost')]++;
        if(p.designation==='K')row.starts++;
        else if(p.designation==='CS')row.substitutes++;
        else row.unmarked++;
        row.latest=String(m.startsAt||'')>row.latest?String(m.startsAt||''):row.latest;
        if(ccPlayerProtocolProfileUrl_(p.profileUrl))row.profileUrl=p.profileUrl;
      }
    }
  }
  return [...registry.values()].filter(row=>!conflicted.has(row.id))
    .sort((a,b)=>b.nominated-a.nominated||b.won-a.won||a.name.localeCompare(b.name,'hu'));
}
function ccStatsPlayers_(data){
  const players=ccStatsPlayerRows_(data);
  if(!players.length)return '<div class="cc-stats-pane"><section class="cc-stats-panel"><h4>Játékosok</h4><p>Nincs ellenőrzött játékosnévsor a mentett jegyzőkönyvekben.</p></section></div>';
  const teams=[...new Map(players.map(p=>[p.teamKey,p.team])).entries()]
    .sort((a,b)=>a[1].localeCompare(b[1],'hu'));
  const current=ccStatsPlayersTeam_==='all'||teams.some(([key])=>key===ccStatsPlayersTeam_)
    ?ccStatsPlayersTeam_:'all';
  const listed=current==='all'?players:players.filter(p=>p.teamKey===current);
  const choose='<label class="cc-stats-players-filter">Csapat<select data-cc-stats-player-team aria-label="Játékosok csapat szerinti szűrése">'
    +'<option value="all" '+(current==='all'?'selected':'')+'>Összes csapat</option>'
    +teams.map(([key,name])=>'<option value="'+escapeHtml_(key)+'" '+(current===key?'selected':'')+'>'+escapeHtml_(name)+'</option>').join('')
    +'</select></label>';
  return '<div class="cc-stats-pane"><section class="cc-stats-panel cc-stats-player-panel"><div class="cc-stats-player-toolbar"><h4>Játékosok</h4>'+choose+'</div>'
    +'<div class="cc-stats-player-scroll"><table class="cc-stats-player-table"><thead><tr>'
    +'<th>Játékos</th><th title="Mérkőzések, amelyek jegyzőkönyvében a játékos szerepel">Nev.</th>'
    +'<th title="A játékos nevezett csapatának győzelmei ezeken a mérkőzéseken">Gy.</th>'
    +'<th title="A játékos nevezett csapatának vereségei ezeken a mérkőzéseken">V.</th>'
    +'<th title="K jelölés a jegyzőkönyvben">K</th>'
    +'<th title="CS jelölés a jegyzőkönyvben; nem bizonyít tényleges pályára lépést">CS</th>'
    +'<th title="K/CS nélküli jegyzőkönyvi sor; nem bizonyítja, hogy a játékos nem lépett pályára">–</th>'
    +'</tr></thead><tbody>'+listed.map(p=>
      '<tr><td><b>'+ccPlayerProtocolNameHtml_(p)+'</b><small>'+escapeHtml_(p.team)+'</small></td>'
      +'<td>'+p.nominated+'</td><td class="cc-stats-won">'+p.won+'</td>'
      +'<td class="cc-stats-lost">'+p.lost+'</td><td>'+p.starts+'</td>'
      +'<td>'+p.substitutes+'</td><td>'+p.unmarked+'</td></tr>'
    ).join('')+'</tbody></table></div></section></div>';
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
function ccMountStatisticsAccordion_(){
  const view=document.getElementById('standingsView');
  const page=document.getElementById('standingsContent');
  if(!view||!page)return;
  // The statistics panel follows the same competition table and precedes
  // the normal match cards for both default and alternate leagues.
  const matches=page.querySelector('.cc-mrsz-player-league-matches');
  const table=page.querySelector('.standings-split');
  // Even a league with no saved table or fixtures must keep the statistics entry visible.
  // Show explicit missing-data coverage rather than silently hiding the whole module.
  const details=document.createElement('details');
  details.id='ccStatsAccordion';
  details.className='cc-stats-accordion';
  details.open=ccStatsExpanded_;
  details.innerHTML='<summary title="Mentett eredmények alapján; egyes bajnoki adatok részlegesek lehetnek."><span>Statisztikák</span><span class="cc-stats-chevron" aria-hidden="true"></span></summary>'+
    '<div id="statisticsContent" class="cc-statistics-page-content"></div>';
  if(matches)matches.before(details);
  else if(table)table.insertAdjacentElement('afterend',details);
  else page.appendChild(details);
  details.addEventListener('toggle',()=>{
    if(!details.isConnected)return;
    ccStatsExpanded_=details.open;
    if(details.open)ccRenderStatisticsPage_();
  });
  if(details.open)ccRenderStatisticsPage_();
}
function ccRenderStatisticsPage_(){
  const details=document.getElementById('ccStatsAccordion');
  const view=document.getElementById('standingsView'),host=document.getElementById('statisticsContent');
  if(!view?.classList.contains('active')||!details?.open||!host)return;
  const data=ccStatsSource_();
  // Matches stay in the normal league list; verified player nominations are a separate tab.
  const tabs=[['overview','Áttekintés'],['teams','Csapatok'],['players','Játékosok'],['compare','Összehasonlítás']];
  if(!tabs.some(([id])=>id===ccStatsTab_))ccStatsTab_='overview';
  const nav='<div class="cc-stats-tab-scroll"><div class="cc-stats-tabs" role="tablist" aria-label="Statisztikai nézet">'+
    tabs.map(([id,label])=>'<button type="button" role="tab" data-cc-stats-tab="'+id+'" aria-selected="'+(ccStatsTab_===id)+'" class="'+(ccStatsTab_===id?'active':'')+'">'+label+'</button>').join('')+
    '</div></div>';
  const views={overview:ccStatsOverview_,teams:ccStatsTeams_,matches:ccStatsMatches_,players:ccStatsPlayers_,compare:ccStatsComparison_};
  const pane=(views[ccStatsTab_]||views.overview)(data);
  const matchCount=data.played.length;
  const sheetCount=data.played.filter(m=>Array.isArray(m?.protocol?.teams)&&m.protocol.teams.length===2).length;
  const coverage='<p class="cc-stats-source-note cc-stats-coverage">'+
    'Rögzített eredmények: <b>'+matchCount+'</b> · jegyzőkönyvvel: <b>'+sheetCount+'</b>'+
    (data.partial?' · <strong>Részleges forrás</strong>: a nem igazolt, bajnokságszintű mutatók „–” jellel szerepelnek.':
      ' · A mentett eredmények egyeznek a teljes rögzített tabellával.')+
    '</p>';
  host.innerHTML=nav+coverage+(ccMrszPlayerPhoto_.loaded?pane:'<div class="cc-stats-panel">Statisztikák betöltése…</div>');
}
document.getElementById('standingsView')?.addEventListener('click',event=>{
  if(!event.target.closest('#statisticsContent'))return;
  const tab=event.target.closest('[data-cc-stats-tab]');
  if(tab){
    if(!['overview','teams','players','compare'].includes(tab.dataset.ccStatsTab))return;
    ccStatsTab_=tab.dataset.ccStatsTab;ccRenderStatisticsPage_();return;
  }
  const team=event.target.closest('[data-cc-stats-team]');
  if(team){ccStatsTeam_=team.dataset.ccStatsTeam;ccStatsTab_='teams';ccRenderStatisticsPage_();return}
  const protocol=event.target.closest('[data-cc-stats-protocol]');
  if(protocol){ccPlayerOpenProtocol_(protocol.dataset.ccStatsProtocol,ccPlayerLeagueCurrent_());return}
});
document.getElementById('standingsView')?.addEventListener('change',event=>{
  if(!event.target.closest('#statisticsContent'))return;
  if(event.target.matches('[data-cc-stats-player-team]')){
    ccStatsPlayersTeam_=event.target.value;
    ccRenderStatisticsPage_();return;
  }
  if(event.target.matches('[data-cc-stats-compare]')){
    const side=event.target.dataset.ccStatsCompare==='a'?0:1;
    ccStatsCompare_[side]=event.target.value;
    ccRenderStatisticsPage_();
  }
});

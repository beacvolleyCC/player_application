const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const start=js.indexOf('function ccMrszPlayerIsWomenI_(){'),end=js.indexOf('function ccMrszPlayerPhotoHtml_(){',start);
assert.ok(start>0&&end>start);
const w1='Női Budapest I. osztály',w2='Női Budapest II. osztály – B csoport',menA='Férfi Budapest I. osztály – A csoport',menB='Férfi Budapest I. osztály – B csoport';
const fixtures=[
 {competitionLabel:w1,startsAt:'2026-10-13T19:30:00',homeName:'Semmelweis Egyetem',awayName:'Emericus SE',homeSets:null,awaySets:null},
 {competitionLabel:w2,startsAt:'2026-10-13T18:20:00',homeName:'MTK kék',awayName:'RKSK felnőtt női',homeSets:null,awaySets:null},
 {competitionLabel:menA,startsAt:'2026-10-13T19:00:00',homeName:'MAFC-Kármán',awayName:'Ráckeve',homeSets:null,awaySets:null},
 {competitionLabel:menB,startsAt:'2026-11-02T20:00:00',homeName:'BEAC',awayName:'PDSE',homeSets:null,awaySets:null}
];
const matches=[
 {competitionLabel:w1,startsAt:'2026-10-13T19:30:00+02:00',homeName:'Semmelweis Egyetem Sport Klub',awayName:'EMERICUS SE',homeSets:3,awaySets:1,setScores:[{home:25,away:20}]},
 {competitionLabel:w2,startsAt:'2026-10-13T18:20:00+02:00',homeName:'MTK Budapest kék',awayName:'RKSK felnőtt női',homeSets:3,awaySets:0},
 {competitionLabel:menA,startsAt:'2026-10-13T19:00:00+02:00',homeName:'MAFC-Kármán',awayName:'Ráckeve',homeSets:3,awaySets:0}
];
const context={ URL,document:{getElementById:()=>null},
 currentTeamData:{id:'10000000-0000-4000-8000-000000000001',teamName:'BEAC Női I.'},
 ccMrszPlayerPhoto_:{loaded:true,error:'',matches,fixtures,tables:[{
 competitionLabel:w1,partial:true,rows:[{position:1,teamName:'Semmelweis Egyetem',played:1,wins:1,losses:0,tablePoints:2,setsFor:3,setsAgainst:1,pointsFor:100,pointsAgainst:82}]
 }]},competitionLeagueInsights:{data:{matches:[]}},
 escapeHtml_:x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
 standingsTeamLogoHtml_:()=>'<i class="standing-logo"></i>',
 ccMrszPlayerMenGroup_:'B',ccMrszPlayerIsMensTeam_:()=>false,ccMrszPlayerIsWomen2_:()=>false,
 ccMrszPlayerMenGroupButtonsHtml_:()=>'<div class="group-controls"></div>'
};
vm.createContext(context);
vm.runInContext(js.slice(start,end)+ '\nthis.qa={merge:ccMrszPlayerAllLeagueMatches_,html:ccMrszPlayerLeagueScheduleHtml_,table:ccMrszPlayerMainScreenshotHtml_,setScope:(x)=>{ccLeaguePlayerMatchScope_=x}};',context);
test('photo scores take precedence over BRSZ fixture with team-name aliases',()=>{
 const rows=context.qa.merge(w1,false);
 assert.equal(rows.length,1);
 assert.equal(rows[0].homeSets,3);
 assert.equal(context.qa.merge(w2,false).length,1);
 assert.equal(context.qa.merge(menA,false).length,1);
});
test('BEAC-only scope is default and all-league switch is visible',()=>{
 const initial=context.qa.html(w1,false);
 assert.ok(initial.includes('BEAC meccsek'));
 assert.ok(initial.includes('Összes bajnoki meccs'));
 assert.ok(initial.includes('data-league-player-scope="beac"'));
 assert.ok(!initial.includes('player-match-scoreboard'));
});
test('all leagues keep old styled match rows when all-league is selected',()=>{
 context.qa.setScope('all');
 for(const league of [w1,w2,menA,menB]){
  const html=context.qa.html(league,false);
  assert.ok(html.includes('player-match-scoreboard'),league);
  assert.ok(html.includes('standings-match-list'));
  assert.ok(html.includes('1 / 1 meccs'));
 }
 assert.ok(context.qa.html(menB,false).includes('BEAC'));
 assert.ok(!context.qa.html(menB,false).includes('MAFC-Kármán'));
 context.qa.setScope('beac');
});
test('unplayed fixture does not invent a 0:0 score',()=>{
 const html=context.qa.html(menB,false);
 assert.ok(html.includes('player-match-vs'));
 assert.ok(html.includes('>VS.</span>'));
 assert.ok(!html.includes('0–0'));
});
test('persisted women I data is a partial standings source, with scored match details',()=>{
 context.qa.setScope('all');
 const html=context.qa.table();
 assert.ok(html.includes('részleges, eredményekből számított'));
 assert.ok(html.includes('Semmelweis Egyetem'));
 assert.ok(html.includes('standings-match-list'));
 assert.ok(html.includes('25:20'));
 context.qa.setScope('beac');
});
test('canonical feed and fixture matching do not double-count',()=>{
 context.competitionLeagueInsights.data.matches=[{...fixtures[0],homeSets:null}];
 const rows=context.qa.merge(w1,true);
 assert.equal(rows.length,1);
 assert.equal(rows[0].homeSets,3);
});
test("standings use men's full league schedule, not only BEAC matches",()=>{
 assert.ok(js.includes("ccMrszPlayerLeagueScheduleHtml_(label,!requiresPhoto)"));
 assert.ok(css.includes('.player-match-scoreboard'));
});

test('existing Player main table is used rather than rendering another photo table',()=>{
 const start=js.indexOf('function renderCompetitionStandings_(){'),end=js.indexOf('\nfunction syncPlannerSectionUi_()',start);
 const view=js.slice(start,end);
 assert.ok(view.includes('const baseRows=hasPhoto?ccPlayerPhotoStandingRows_'));
 assert.ok(view.includes('ccPlayerResultsOnlyStandings_(label,baseRows)'))
 assert.ok(!view.includes('const photoMain=ccMrszPlayerMainScreenshotHtml_()'));
 assert.ok(view.includes('ccMrszPlayerLeagueScheduleHtml_(label,!requiresPhoto)'));
});

test('mobile league match cards display readable set points on their own grid row',()=>{
 const styles=fs.readFileSync('styles.css','utf8');
 assert.ok(styles.includes('.player-match-sets{grid-column:1/-1;'));
 assert.ok(styles.includes('.player-match-sets{font-size:10px'));
 assert.ok(styles.includes('.player-match-scoreboard.has-protocol{cursor:pointer'));
});

test('PWA cache and HTML assets are versioned for the mobile match-row fix',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.ok(html.includes('styles.css?v=20261017-player-league-nav-v10'));
 assert.ok(html.includes('app.js?v=20261017-player-league-nav-v10'));
 assert.ok(html.includes('competition-context-catalog.js?v=20261015-lc1'));
 assert.ok(sw.includes("club-control-player-20261017-player-league-nav-v10"));
});

test('official UTC kickoff is shown in Budapest time and not duplicated against fixture',()=>{
 const fixture={competitionLabel:w1,startsAt:'2026-10-16T19:30:00',homeName:'BEAC',awayName:'MAFC-ÉPK',homeSets:null,awaySets:null};
 const official={...fixture,startsAt:'2026-10-16T17:30:00+00:00'};
 context.ccMrszPlayerPhoto_.fixtures.push(fixture);
 context.competitionLeagueInsights.data.matches=[official];
 try{
  const merged=context.qa.merge(w1,true);
  assert.equal(merged.filter(x=>x.homeName==='BEAC'&&x.awayName==='MAFC-ÉPK').length,1);
  const html=context.qa.html(w1,true);
  assert.ok(html.includes('19:30'));
  assert.ok(!html.includes('17:30'));
  assert.equal(vm.runInContext("ccMrszPlayerLocalKickoff_('2026-11-01T23:30:00+00:00').date",context),'2026-11-02');
 }finally{context.ccMrszPlayerPhoto_.fixtures.pop();context.competitionLeagueInsights.data.matches=[];}
});

test('hidden Player team switcher cannot display a persisted different team league',()=>{
 const st=js.indexOf('function activeStandingsContext_(){');
 const en=js.indexOf('function standingsPair_(',st);
 assert.ok(st>0 && en>st);
 const teams=[
  {contextTeamId:'10000000-0000-4000-8000-000000000001',teamName:'Női I.'},
  {contextTeamId:'10000000-0000-4000-8000-000000000003',teamName:'Férfi I.'}
 ];
 const mock={competitionStandings:{contexts:teams},selectedStandingTeamId:teams[0].contextTeamId,
   currentTeamData:{id:teams[1].contextTeamId},PLAYER_STANDINGS_TEAM_SWITCHER_ENABLED:false,
   localStorage:{setItem(){}}};
 vm.createContext(mock);
 vm.runInContext(js.slice(st,en)+'\nthis.getCurrent=activeStandingsContext_;',mock);
 const active=mock.getCurrent();
 assert.equal(active.contextTeamId,teams[1].contextTeamId);
 assert.equal(mock.selectedStandingTeamId,teams[1].contextTeamId);
 mock.PLAYER_STANDINGS_TEAM_SWITCHER_ENABLED=true;
 mock.selectedStandingTeamId=teams[0].contextTeamId;
 assert.equal(mock.getCurrent().contextTeamId,teams[0].contextTeamId);
});

test('unconfirmed BEAC self-fixtures do not appear on either Player match scope',()=>{
 const league=menB;
 const records=[
  {competitionLabel:league,startsAt:'2027-01-13T20:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null},
  {competitionLabel:league,startsAt:'2027-03-04T19:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null}
 ];
 fixtures.push(...records);
 try{
  for(const scope of ['beac','all']){
   context.qa.setScope(scope);
   const html=context.qa.html(league,false);
   assert.ok(html.includes('1 / 1 meccs'),scope);
   assert.ok(html.includes('PDSE'),scope);
   assert.ok(!html.includes('2027-01-13'),scope);
   assert.ok(!html.includes('2027-03-04'),scope);
  }
  assert.equal(vm.runInContext('ccMrszPlayerUnverifiedSelfFixture_',context)({...records[1],homeSets:3,awaySets:1}),false);
 }finally{
  fixtures.splice(fixtures.length-records.length);
  context.qa.setScope('beac');
 }
});
test('women I self-fixture does not appear while other women results remain accessible',()=>{
 const s={competitionLabel:w1,startsAt:'2026-11-10T19:30:00',homeName:'BEAC',awayName:'BEAC',homeSets:null,awaySets:null};
 fixtures.push(s);
 try{
  context.qa.setScope('all');
  const html=context.qa.html(w1,false);
  assert.ok(!html.includes('2026-11-10'));
  assert.ok(html.includes('3 – 1'));
  assert.ok(html.includes('1 / 1 meccs'));
 }finally{fixtures.pop();context.qa.setScope('beac');}
});

test('Player opens saved protocol from whole card and preserves verified-only link policy',()=>{
 const item={competitionLabel:w1,matchCode:'2330',startsAt:'2026-10-16T19:30:00+02:00',homeName:'BEAC',awayName:'MAFC-ÉPK',
  homeSets:3,awaySets:1,setScores:[{home:25,away:21},{home:23,away:25},{home:25,away:18},{home:25,away:13}],
  protocol:{teams:[{name:'BEAC',players:[{number:'1',name:'Imre Eszter',designation:'K',captain:true}]},
   {name:'MAFC-ÉPK',players:[{number:'5',name:'Stéger Babett',designation:'K'}]}],
   officials:[{role:'I. játékvezető',name:'Juták Lili'}]}};
 matches.push(item);context.qa.setScope('all');
 try{
  const card=context.qa.html(w1,false);
  assert.ok(card.includes('data-player-protocol="2330"'));
  assert.ok(card.includes('role="button" tabindex="0"'));
  const detail=vm.runInContext('ccPlayerProtocolDetailHtml_',context)(item);
  assert.ok(detail.includes('Kapitány'));
  assert.ok(detail.includes('Imre Eszter'));
  assert.ok(detail.includes('Juták Lili'));
  const link=vm.runInContext('ccPlayerProtocolProfileUrl_',context);
  assert.equal(link('https://hunvolley.hu/athlete/123'),'https://hunvolley.hu/athlete/123');
  assert.equal(link('https://hunvolley.hu.evil.example/athlete/123'),'');
 }finally{matches.pop();context.qa.setScope('beac');}
});
test('saved results update a separately labeled partial standings model without guessing rank',()=>{
 const table=[{teamName:'Semmelweis Egyetem Sport Klub',position:1},
  {teamName:'EMERICUS SE',position:2}];
 const fn=vm.runInContext('ccPlayerResultsOnlyStandings_',context);
 const model=fn(w1,table,[{...matches[0],setScores:[{home:25,away:20}]}]);
 assert.equal(model.matched,1);
 assert.equal(model.rows.find(x=>x.teamName==='Semmelweis Egyetem Sport Klub').wins,1);
 assert.equal(model.rows.find(x=>x.teamName==='EMERICUS SE').losses,1);
 assert.ok(model.rows.every(x=>x.position===null));
 const view=js.slice(js.indexOf('function renderCompetitionStandings_(){'),js.indexOf('function syncPlannerSectionUi_()'));
 assert.ok(view.includes('nem hivatalos tabella'));
});

test('fourth bottom nav has independent standings content and schedule controls remain in Menetrend',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert.ok(html.includes('id="standingsContent"'));
 assert.ok(html.includes('data-view="standingsView" class="nav-btn"'));
 assert.ok(!html.includes('id="plannerStandingsBtn"'));
 assert.ok(js.includes('standingsContent.innerHTML=ccPlayerLeagueSelectorHtml_()+renderCompetitionStandings_()'));
 assert.ok(js.includes("const nextSection=viewId==='standingsView'?'standings':'schedule'"));
 assert.ok(js.includes("plannerSection='schedule'"));
});

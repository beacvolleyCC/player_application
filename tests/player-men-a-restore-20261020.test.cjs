'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const A='Férfi Budapest I. osztály – A csoport';
const teams=['BTDSE Taksony','Dág KSE','Kispest SE','KÖZGÁZ','MAFC Kármán','Óbudai Egyetem-Kandó SC','Ráckeve'];
function imported(){
 const rows=[];
 for(let a=0;a<teams.length;a++)for(let b=0;b<teams.length;b++){
  if(a===b)continue;
  const i=rows.length,played=i<2;
  rows.push({competitionLabel:A,season:'2026/27',_ccSourceSystem:'user',_ccUserSupplied:true,
   sourceMatchKey:'ui20261018:menA:test:'+i,_ccSourceKey:'ui20261018:menA:test:'+i,
   _ccSourceKind:played?'result':'fixture',homeName:teams[a],awayName:teams[b],
   startsAt:new Date(Date.UTC(2026,9,20+i)).toISOString().slice(0,10)+'T19:30:00',
   status:played?'played':'scheduled',homeSets:played?3:null,awaySets:played?1:null});
 }
 return rows;
}
function section(start,end){
 const i=app.indexOf(start),j=app.indexOf(end,i+start.length);
 assert.ok(i>=0&&j>i,'Missing app section '+start);
 return app.slice(i,j);
}
const ctx=vm.createContext({Date,Map,Set,Intl,Number,String,Array,Object,JSON,
 ccMrszPlayerPhoto_:{userMatches:[],sourceMatches:[],matches:[],tables:[]},
 escapeHtml_:s=>String(s??''),standingsTeamLogoHtml_:s=>'<span>'+String(s)+'</span>',
 ccMrszPlayerLeagueScheduleHtml_:label=>'<div data-qa-league="'+label+'">schedule</div>',
 competitionLeagueInsights:{data:{matches:[]}}});
vm.runInContext(section('function ccMrszPlayerLocalKickoff_(', 'function ccMrszPlayerFixtureKey_('),ctx);
vm.runInContext(section('function ccPlayerMatchTeamKey_(', 'function ccPlayerResultsOnlyStandings_('),ctx);
vm.runInContext(section('function ccPlayerBudapestToday_(', 'function ccMrszPlayerAllLeagueMatches_('),ctx);
vm.runInContext('this.qa={source:ccPlayerMenAImportedRows_,view:ccPlayerMenACurrentView_,matches:ccPlayerMenBMatches_};',ctx);
test('Real men A source: 42 matches, seven different squads, two results and no BEAC',()=>{
 const rows=imported();ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[],sourceMatches:[]};
 assert.equal(ctx.qa.source().length,42);
 assert.equal(new Set(rows.flatMap(r=>[r.homeName,r.awayName])).size,7);
 assert.equal(rows.filter(r=>r._ccSourceKind==='result').length,2);
 assert.equal(ctx.qa.matches(ctx.qa.source(),A).length,42);
});
test('Men A view includes all seven teams and the imported fixture list without fake places',()=>{
 ctx.ccMrszPlayerPhoto_={userMatches:imported(),matches:[],sourceMatches:[]};
 const html=ctx.qa.view();
 assert.ok(html.includes('Dág KSE')&&html.includes('MAFC Kármán'));
 assert.ok(html.includes('data-qa-league="'+A+'"'));
 assert.ok(html.includes('nem hivatalos tabella'));
 assert.equal((html.match(/<td class="pos">–<\/td>/g)||[]).length,7);
 assert.ok(app.includes('if(men&&label===CC_PLAYER_MEN_A_LABEL_)'));
 assert.ok(app.includes('if(competitionLabel===CC_PLAYER_MEN_A_LABEL_)'));
});
test('Missing, duplicate, fake or partial men A import cannot override the legacy fallback',()=>{
 for(const rows of [imported().slice(0,41),(()=>{let r=imported();r[2].sourceMatchKey=r[1].sourceMatchKey;return r})(),
 (()=>{let r=imported();r[2].awayName=r[2].homeName;return r})(),
 (()=>{let r=imported();r[0].homeSets=4;return r})()]){
  ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[],sourceMatches:[]};
  assert.equal(ctx.qa.source(),null);
 }
});
test('Men B existing complete import and score functionality are unchanged',()=>{
 assert.ok(app.includes("if(competitionLabel===CC_PLAYER_MEN_B_LABEL_)"));
 assert.ok(app.includes('return results>=1&&postponed===1&&beac===12&&teams.size===7?rows:null;'));
 assert.ok(app.includes('function ccPlayerMenBCurrentView_(source=ccPlayerMenBImportedRows_()'));
});

test('A and B shared preview avoids large blank info panels and restores readable horizontal stats',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 assert.match(css,/#standingsView \.cc-player-men-b-current>\.standings-state\{[^}]*min-height:0 !important/);
 assert.match(css,/#standingsView \.cc-player-men-b-current \.standings-table-stats\{[^}]*min-width:420px !important/);
 assert.match(css,/#standingsView \.cc-player-men-b-current \.standings-scroll\{[^}]*overflow-x:auto !important/);
});

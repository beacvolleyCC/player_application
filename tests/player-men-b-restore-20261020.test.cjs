'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const MEN='Férfi Budapest I. osztály – B csoport';
const names=['BEAC','Corvinus','MAFC-Schönherz','MAFC-Vásárhelyi','Mozdulj SE','PDSE','Semmelweis Egyetem'];
function imported(){
 let rows=[];
 for(let i=0;i<names.length;i++)for(let j=0;j<names.length;j++){
  if(i===j)continue;
  const index=rows.length;
  const isScore=names[i]==='MAFC-Vásárhelyi'&&names[j]==='MAFC-Schönherz';
  const isPost=names[i]==='PDSE'&&names[j]==='Corvinus';
  const isPdse=names[i]==='BEAC'&&names[j]==='PDSE';
  const key=isPdse?'ui20261018:menB:beac:pdse:1':'ui20261018:test:menB:'+index;
  const date=new Date(Date.UTC(2026,10,1+index)).toISOString().slice(0,10);
  rows.push({competitionLabel:MEN,sourceMatchKey:key,_ccSourceKey:key,_ccSourceSystem:'user',
   _ccUserSupplied:true,_ccSourceKind:isScore?'result':'fixture',season:'2026/27',
   homeName:names[i],awayName:names[j],
   startsAt:isScore?'2026-10-15':isPost?null:isPdse?'2026-10-19T19:30:00':date+'T20:00:00',
   status:isScore?'played':isPost?'postponed':'scheduled',
   homeSets:isScore?3:null,awaySets:isScore?0:null,venue:isPdse?'Bogdánfy':'Teszt'});
 }
 return rows;
}
function section(start,end){
 const i=app.indexOf(start),j=app.indexOf(end,i+start.length);
 assert.ok(i>=0&&j>i,'App JS section missing: '+start);
 return app.slice(i,j);
}
const ctx=vm.createContext({Date,Map,Set,Array,Object,String,Number,Intl,JSON,
 ccMrszPlayerPhoto_:{userMatches:[],sourceMatches:[],matches:[],fixtures:[],tables:[]},
 standingsTeamLogoHtml_:name=>'<span>'+name+'</span>',
 escapeHtml_:name=>String(name??''),
 ccMrszPlayerLeagueScheduleHtml_:()=>'<div id="fixture-result">Schedule placeholder</div>'
});
vm.runInContext(section('function ccMrszPlayerLocalKickoff_(', 'function ccMrszPlayerFixtureKey_('),ctx);
vm.runInContext(section('function ccPlayerMatchTeamKey_(', 'function ccPlayerResultsOnlyStandings_('),ctx);
vm.runInContext(section('function ccPlayerBudapestToday_(', 'function ccMrszPlayerAllLeagueMatches_('),ctx);
vm.runInContext(section('const CC_PLAYER_OFFICIAL_PROTOCOLS_', 'function ccMrszPlayerLeagueScheduleHtml_('),ctx);
vm.runInContext('this.qa={check:ccPlayerMenBImportedRows_,matches:ccPlayerMenBMatches_,view:ccPlayerMenBCurrentView_,score:ccPlayerScoreboardHtml_};',ctx);
const qa=ctx.qa;
test('42 unique men B rows, 12 BEAC matches, seven distinct squads',()=>{
 const source=imported();
 assert.equal(source.length,42);
 ctx.ccMrszPlayerPhoto_={userMatches:source,sourceMatches:[],matches:[]};
 assert.equal(qa.check().length,42);
 assert.equal(qa.matches(source).length,42);
 assert.equal(new Set(source.flatMap(m=>[m.homeName,m.awayName])).size,7);
 assert.equal(source.filter(m=>m.homeName==='BEAC'||m.awayName==='BEAC').length,12);
});
test('The table visibly contains Mozdulj SE and all 7 teams, with no fabricated rank',()=>{
 ctx.ccMrszPlayerPhoto_={userMatches:imported(),sourceMatches:[],matches:[]};
 const view=qa.view();
 assert.ok(view.includes('Mozdulj SE'));
 assert.equal((view.match(/<td class="pos">–<\/td>/g)||[]).length,7);
 assert.ok(view.includes('nem hivatalos tabella'));
 assert.ok(view.includes('7 csapat'));
 assert.ok(view.includes('fixture-result'));
});
test('Invalid or partial men B schedule cannot replace existing sources',()=>{
 const data=imported();
 ctx.ccMrszPlayerPhoto_={userMatches:data.slice(0,41)};
 assert.equal(qa.check(),null);
 const dup=imported();dup[0].sourceMatchKey=dup[1].sourceMatchKey;
 ctx.ccMrszPlayerPhoto_={userMatches:dup};
 assert.equal(qa.check(),null);
 const wrong=imported();wrong[3].awayName=wrong[3].homeName;
 ctx.ccMrszPlayerPhoto_={userMatches:wrong};
 assert.equal(qa.check(),null);
});
test('Official protocol-backed score wins only same-day, exact-direction matchup',()=>{
 const data=imported();
 const fixture=data.find(m=>m.homeName==='BEAC'&&m.awayName==='PDSE');
 const official={competitionLabel:MEN,homeName:'BEAC',awayName:'PDSE',startsAt:fixture.startsAt,
  homeSets:3,awaySets:1,matchCode:'MR123',protocol:{teams:[{},{}]}};
 ctx.ccMrszPlayerPhoto_={userMatches:data,sourceMatches:[],matches:[official]};
 const matches=qa.matches(qa.check());
 assert.equal(matches.length,42);
 assert.ok(matches.some(m=>m.matchCode==='MR123'&&m.startsAt===fixture.startsAt));
 assert.ok(!matches.some(m=>m.homeName==='BEAC'&&m.awayName==='PDSE'&&m.homeSets==null));
});
test('A contradictory saved result does not enter the provisional win count',()=>{
 const data=imported();
 const result=data.find(m=>m._ccSourceKind==='result');
 ctx.ccMrszPlayerPhoto_={userMatches:data,sourceMatches:[],
  matches:[{...result,homeSets:0,awaySets:3,matchCode:'MR999'}]};
 const matches=qa.matches(data);
 assert.equal(matches.length,42);
 assert.ok(matches.some(m=>m.__ccResultConflict));
 const resultText=qa.score(matches.find(m=>m.__ccResultConflict));
 assert.ok(resultText.includes('Ellenőrzendő'));
 assert.ok(!resultText.includes('3 – 0'));
});
test('Undated postponed RPC record is accepted without inventing a match time',()=>{
 const data=imported(),item=data.find(m=>m.status==='postponed');
 assert.equal(item.startsAt,null);
 ctx.ccMrszPlayerPhoto_={userMatches:data,sourceMatches:[],matches:[]};
 assert.equal(qa.check().length,42);
 assert.ok(qa.score(item).includes('Halasztva'));
 assert.ok(qa.score(item).includes('Időpont nélkül'));
 assert.ok(!qa.score(item).includes('0 – 0'));
 const unsafe=imported();unsafe.find(m=>m.status==='postponed').status='scheduled';
 ctx.ccMrszPlayerPhoto_={userMatches:unsafe,sourceMatches:[],matches:[]};
 assert.equal(qa.check(),null,'An undated scheduled fixture must be rejected');
});
test('Other competitions keep existing standings and matching paths',()=>{
 assert.ok(app.includes("if(men&&label===CC_PLAYER_MEN_B_LABEL_)"));
 assert.ok(app.includes("if(competitionLabel===CC_PLAYER_MEN_B_LABEL_)"));
 assert.ok(app.includes("const men=['Férfi Budapest I. osztály – A csoport','Férfi Budapest I. osztály – B csoport']"));
});
test('PWA cache version matches script and worker',()=>{
 const version=/app\.js\?v=([^"]+)/.exec(html)?.[1];
 assert.ok(version,'Player app must have a PWA cache version');
 for(const name of ['styles.css','statistics.css','app.js','statistics.js'])
  assert.ok(html.includes(name+'?v='+version),'missing matching cache version for '+name);
 if(html.includes('CC TEST · DEMÓ · NEM ÉLES')){
  assert.ok(sw.includes('cc-player-test-'+version),'test cache must be independent');
 }else assert.ok(sw.includes('club-control-player-'+version));
 assert.ok(sw.includes('app.js?v='+version));
 assert.ok(app.includes('sw.js?v='+version));
});

test("Two real men's B results must not make the seven-team league disappear",()=>{
 const data=imported(),second=data.find(m=>m.homeName==='BEAC'&&m.awayName==='PDSE');
 assert.ok(second);
 second.status='played';second._ccSourceKind='result';second.homeSets=3;second.awaySets=0;
 second.setScores=[{home:25,away:18},{home:25,away:23},{home:25,away:20}];
 ctx.ccMrszPlayerPhoto_={userMatches:data,sourceMatches:[],matches:[]};
 assert.equal(qa.check().length,42);
 const h=qa.score(second);
 assert.ok(h.includes('3 – 0'));
 assert.ok(h.includes('25:18 · 25:23 · 25:20'));
 assert.ok(h.includes('Jegyzőkönyv'));
 const changed={...second,homeSets:0,awaySets:3};
 assert.ok(!qa.score(changed).includes('Jegyzőkönyv'));
});

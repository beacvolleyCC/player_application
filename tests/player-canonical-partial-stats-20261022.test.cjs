'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const stats=fs.readFileSync('statistics.js','utf8');

function section(source,start,end){
 const first=source.indexOf(start),last=source.indexOf(end,first+start.length);
 assert.ok(first!==-1&&last>first,'Source contract absent: '+start);
 return source.slice(first,last);
}
const league='Férfi Budapest I. osztály – B csoport';
const game=(homeSets,awaySets,extra={})=>({
 competitionLabel:league,homeName:'BEAC',awayName:'PDSE',
 startsAt:'2026-10-22T19:30:00',homeSets,awaySets,
 setScores:homeSets===3&&awaySets===1?[
  {home:25,away:20},{home:25,away:18},{home:18,away:25},{home:25,away:23}
 ]:[],
 ...extra
});

test('partial standings preserve actual won and lost sets (without inventing a rank)',()=>{
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{fixtures:[],matches:[]},
  ccMrszPlayerUnverifiedSelfFixture_:()=>false,
  ccMrszPlayerLocalKickoff_:x=>({date:String(x||'').slice(0,10)}),
  JSON,Map,Array,Number,String,Intl
 });
 vm.runInContext(section(app,'function ccPlayerMatchTeamKey_(','function ccPlayerPhotoStandingRows_('),ctx);
 const result=ctx.ccPlayerResultsOnlyStandings_(league,[],[game(3,1)]);
 assert.ok(result&&result.partial,'saved match results are always partial');
 assert.equal(result.matched,1);
 const beac=result.rows.find(x=>x.teamName==='BEAC');
 const pdse=result.rows.find(x=>x.teamName==='PDSE');
 assert.deepEqual([beac.played,beac.wins,beac.losses,beac.setsFor,beac.setsAgainst,
                   beac.pointsFor,beac.pointsAgainst,beac.position,beac.tablePoints],
                  [1,1,0,3,1,93,86,null,null]);
 assert.deepEqual([pdse.played,pdse.wins,pdse.losses,pdse.setsFor,pdse.setsAgainst,
                   pdse.pointsFor,pdse.pointsAgainst,pdse.position,pdse.tablePoints],
                  [1,0,1,1,3,86,93,null,null]);
});

test('conflicted result remains visible in source but never counts for partial statistics',()=>{
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{fixtures:[],matches:[]},
  ccMrszPlayerUnverifiedSelfFixture_:()=>false,
  ccMrszPlayerLocalKickoff_:x=>({date:String(x||'').slice(0,10)}),
  JSON,Map,Array,Number,String,Intl
 });
 vm.runInContext(section(app,'function ccPlayerMatchTeamKey_(','function ccPlayerPhotoStandingRows_('),ctx);
 assert.equal(ctx.ccPlayerResultsOnlyStandings_(league,[],[game(3,1,{__ccResultConflict:true})]),null);
});

test('Player form/statistics excludes disputed scores while retaining normal games',()=>{
 const ctx=vm.createContext({
  ccPlayerLeagueCurrent_:()=>league,
  ccMrszPlayerPhoto_:{tables:[]},
  ccMrszPlayerUnverifiedSelfFixture_:()=>false,
  ccPlayerMatchTeamKey_:x=>String(x||'').toLowerCase(),
  ccMrszPlayerAllLeagueMatches_:()=>[
    game(3,1),game(0,3,{startsAt:'2026-10-23T19:00:00',__ccResultConflict:true})
  ],
  JSON,Map,Array,Number,String
 });
 vm.runInContext(section(stats,'function ccStatsSource_()','function ccStatsRecent_('),ctx);
 const d=ctx.ccStatsSource_();
 assert.equal(d.played.length,1);
 assert.equal(d.partial,true);
 const b=d.teams.find(x=>x.name==='BEAC');
 const p=d.teams.find(x=>x.name==='PDSE');
 assert.deepEqual([b.played,b.won,b.lost,b.setsFor,b.setsAgainst],[1,1,0,3,1]);
 assert.deepEqual([p.played,p.won,p.lost,p.setsFor,p.setsAgainst],[1,0,1,1,3]);
});

test('canonical 298 match source remains first, stale legacy 300 cannot replace it',()=>{
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{
   canonicalMatches:[game(3,1,{matchId:'CANONICAL-UUID',matchCode:'2686'}),...Array.from({length:297},(_,i)=>({competitionLabel:'Another league',matchId:'X'+i}))],
   userMatches:Array.from({length:300},(_,i)=>({competitionLabel:league,
    sourceMatchKey:'ui20261018:'+i,homeName:'BEAC',awayName:'PDSE',homeSets:0,awaySets:3})),
   matches:[],sourceMatches:[],fixtures:[]
  },
  ccPlayerMatchListSort_:(a,b)=>String(a.startsAt||'').localeCompare(String(b.startsAt||'')),
  JSON,Map,Array,Number,String
 });
 vm.runInContext(section(app,'function ccMrszPlayerAllLeagueMatches_(',
   '// Preserve unconfirmed BEAC self-fixtures'),ctx);
 const list=ctx.ccMrszPlayerAllLeagueMatches_(league,false);
 assert.equal(list.length,1);
 assert.equal(list[0].matchId,'CANONICAL-UUID');
 assert.equal(list[0].matchCode,'2686');
 assert.deepEqual([list[0].homeSets,list[0].awaySets],[3,1]);
});

test('legacy 300-match requirement is not an enabled canonical identity gate',()=>{
 const merged=section(app,'function ccMrszPlayerAllLeagueMatches_(',
   '// Preserve unconfirmed BEAC self-fixtures');
 assert.match(merged,/const shared=ccMrszPlayerPhoto_\.canonicalMatches/);
 assert.ok(merged.indexOf('if(Array.isArray(shared)&&shared.length)')<
           merged.indexOf('if(competitionLabel===CC_PLAYER_MEN_A_LABEL_)'));
 const form=section(stats,'function ccStatsSource_()','function ccStatsRecent_(');
 assert.match(form,/!m\.__ccResultConflict/);
});


test('Player canonical results isolate BEAC–Mozdulj between male B and female I',()=>{
 const women='Női Budapest I. osztály';
 const men='Férfi Budapest I. osztály – B csoport';
 const base={homeName:'BEAC',awayName:'Mozdulj SE',
   startsAt:'2026-11-19T19:00:00+01:00',homeSets:3,awaySets:0};
 const male={...base,competitionLabel:men,matchId:'MENS',matchCode:'A'};
 const female={...base,competitionLabel:women,matchId:'WOMENS',matchCode:'B',homeSets:0,awaySets:3};
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{canonicalMatches:[male,female]},
  ccPlayerMatchListSort_:()=>0,JSON,Array,String
 });
 vm.runInContext(section(app,'function ccMrszPlayerAllLeagueMatches_(',
   '// Preserve unconfirmed BEAC self-fixtures'),ctx);
 assert.deepEqual(ctx.ccMrszPlayerAllLeagueMatches_(men,false).map(x=>x.matchId),['MENS']);
 assert.deepEqual(ctx.ccMrszPlayerAllLeagueMatches_(women,false).map(x=>x.matchId),['WOMENS']);
});
test('Player legacy fallback cannot leak cross-division official reports or federation feed matches',()=>{
 const women='Női Budapest I. osztály',men='Férfi Budapest I. osztály – B csoport';
 const target='Női Budapest II. osztály – A csoport';
 const root={homeName:'BEAC',awayName:'Mozdulj SE',
  startsAt:'2026-11-19T19:00:00+01:00',homeSets:3,awaySets:0};
 const valid={...root,competitionLabel:target,matchId:'TARGET',_ccSourceSystem:'user'};
 const wrongOfficial={...root,competitionLabel:women,matchId:'WOMENS-REPORT',verified:true};
 const wrongOther={...root,competitionLabel:men,matchId:'MENS-REPORT',verified:true};
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{
   canonicalMatches:[],fixtures:[valid],matches:[wrongOfficial],sourceMatches:[wrongOther],
   userMatches:[wrongOfficial,wrongOther]
  },
  competitionLeagueInsights:{data:{matches:[wrongOfficial,wrongOther]}},
  CC_PLAYER_MEN_A_LABEL_:'Férfi Budapest I. osztály – A csoport',
  CC_PLAYER_MEN_B_LABEL_:men,
  ccPlayerVerifiedReschedule_:()=>null,
  ccPlayerOfficialMatchReportUrl_:m=>m.verified?'https://source.example/protocol':'',
  ccMrszPlayerFixtureKey_:m=>String(m.startsAt).slice(0,10)+'|'+m.homeName+'|'+m.awayName,
  ccPlayerMatchListSort_:()=>0,JSON,Array,String
 });
 vm.runInContext(section(app,'function ccMrszPlayerAllLeagueMatches_(',
   '// Preserve unconfirmed BEAC self-fixtures'),ctx);
 const rows=ctx.ccMrszPlayerAllLeagueMatches_(target,true);
 assert.equal(rows.length,1,'cross-league result must never replace or append to target fixture');
 assert.equal(rows[0].matchId,'TARGET');
 assert.ok(rows.every(x=>x.competitionLabel===target));
});
test('Player provisional win/loss stats never count same-named teams in another division',()=>{
 const women='Női Budapest I. osztály';
 const male={...game(3,1),matchId:'MEN-B'};
 const female={...game(0,3),matchId:'WOMEN-I',competitionLabel:women};
 const ctx=vm.createContext({
  ccMrszPlayerPhoto_:{fixtures:[],matches:[]},
  ccMrszPlayerUnverifiedSelfFixture_:()=>false,
  ccMrszPlayerLocalKickoff_:x=>({date:String(x||'').slice(0,10)}),
  JSON,Map,Array,Number,String,Intl
 });
 vm.runInContext(section(app,'function ccPlayerMatchTeamKey_(',
   'function ccPlayerPhotoStandingRows_('),ctx);
 const result=ctx.ccPlayerResultsOnlyStandings_(league,[],[male,female]);
 assert.equal(result.matched,1);
 const beac=result.rows.find(x=>x.teamName==='BEAC');
 assert.deepEqual([beac.played,beac.wins,beac.losses,beac.setsFor,beac.setsAgainst],[1,1,0,3,1]);
});

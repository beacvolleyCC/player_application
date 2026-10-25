'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
function section(start,end){
 const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
 assert.ok(a>=0 && b>a,'Missing Player source section '+start);
 return app.slice(a,b);
}
const womenI='Női Budapest I. osztály';
const womenIIB='Női Budapest II. osztály – B csoport';
const menIB='Férfi Budapest I. osztály – B csoport';
const contexts={
 ccMrszPlayerPhoto_:{matches:[],fixtures:[],sourceMatches:[],canonicalMatches:[]},
 ccMrszPlayerLocalKickoff_:stamp=>({date:String(stamp||'').slice(0,10),time:String(stamp||'').slice(11,16)}),
 ccMrszPlayerUnverifiedSelfFixture_:()=>false,
 ccPlayerMatchListSort_:(a,b)=>String(a.startsAt||'').localeCompare(String(b.startsAt||'')),
 ccPlayerOfficialMatchReportUrl_:()=>'',escapeHtml_:s=>String(s||''),
 standingsTeamLogoHtml_:()=>'<span class="team-logo"></span>'
};
vm.createContext(contexts);
vm.runInContext(
 section('function ccPlayerMatchTeamKey_(', 'function ccPlayerPhotoStandingRows_(')
 +section('function ccMrszPlayerAllLeagueMatches_(', '// Preserve unconfirmed BEAC self-fixtures')
 +section('function ccPlayerScoreboardHtml_(', 'function ccMrszPlayerLeagueScheduleHtml_(')
 +String.raw`
this.getPartial=ccPlayerResultsOnlyStandings_;
this.getCanonical=ccMrszPlayerAllLeagueMatches_;
this.getScoreboard=ccPlayerScoreboardHtml_;
`,contexts);
const sampleSets=[{home:25,away:20},{home:25,away:18},{home:19,away:25},{home:25,away:23}];
const match={competitionLabel:womenI,startsAt:'2026-10-21T20:00:00',
 homeName:'BEAC',awayName:'KRE SC-A',homeSets:3,awaySets:1,
 setScores:sampleSets,sourceKey:'mrsz:2026/27:protocol:9901'};
function find(rows,team){return rows.find(r=>r.teamName===team)}
test('a saved 3–1 result increments all set totals, not just W/L counters',()=>{
 const out=contexts.getPartial(womenI,[{teamName:'BEAC'},{teamName:'KRE SC-A'}],[match]);
 assert.equal(out.matched,1);
 assert.equal(find(out.rows,'BEAC').played,1);
 assert.equal(find(out.rows,'BEAC').wins,1);
 assert.equal(find(out.rows,'BEAC').setsFor,3);
 assert.equal(find(out.rows,'BEAC').setsAgainst,1);
 assert.equal(find(out.rows,'KRE SC-A').setsFor,1);
 assert.equal(find(out.rows,'KRE SC-A').setsAgainst,3);
 assert.equal(find(out.rows,'BEAC').pointsFor,94);
 assert.equal(find(out.rows,'BEAC').pointsAgainst,86);
 assert.equal(find(out.rows,'KRE SC-A').pointsFor,86);
 assert.equal(find(out.rows,'KRE SC-A').pointsAgainst,94);
 assert.ok(out.rows.every(r=>r.position===null&&r.tablePoints===null),'Cannot infer official table rank or league points');
});
test('3–0 without individual set scores tracks sets, leaves point totals unknown',()=>{
 const score={competitionLabel:menIB,startsAt:'2026-10-23T19:30:00',
  homeName:'BEAC',awayName:'PDSE',homeSets:3,awaySets:0};
 const out=contexts.getPartial(menIB,[{teamName:'BEAC'},{teamName:'PDSE'}],[score]);
 assert.equal(out.matched,1);
 assert.equal(find(out.rows,'BEAC').setsFor,3);
 assert.equal(find(out.rows,'BEAC').setsAgainst,0);
 assert.equal(find(out.rows,'BEAC').pointsFor,null);
 assert.equal(find(out.rows,'PDSE').setsFor,0);
 assert.equal(find(out.rows,'PDSE').setsAgainst,3);
 assert.equal(find(out.rows,'PDSE').pointsAgainst,null);
});
test('invalid set-point lists do not contaminate verified partial statistics',()=>{
 const broken={...match,setScores:[{home:25,away:20},{home:25,away:20},
   {home:25,away:20},{home:25,away:20}]};
 const out=contexts.getPartial(womenI,[{teamName:'BEAC'},{teamName:'KRE SC-A'}],[broken]);
 assert.equal(out,null);
});
test('same fixture reappearing twice in source is only counted once',()=>{
 const out=contexts.getPartial(womenI,[{teamName:'BEAC'},{teamName:'KRE SC-A'}],[match,{...match}]);
 assert.equal(out.matched,1);
 assert.equal(find(out.rows,'BEAC').setsFor,3);
});
test('same-date conflicting saved results are quarantined',()=>{
 const other={...match,homeSets:3,awaySets:0,setScores:null};
 const out=contexts.getPartial(womenI,[{teamName:'BEAC'},{teamName:'KRE SC-A'}],[match,other]);
 assert.equal(out,null);
});
test('women I, women II/B, and men I/B canonical fixtures are filtered by exact competition',()=>{
 const matches=[
  {matchId:'11111111-1111-4111-8111-111111111111',sourceKey:'userofficial:women1',competitionLabel:womenI,
   homeName:'MTK Budapest',awayName:'BEAC',startsAt:'2026-11-10T19:00:00',homeSets:null,awaySets:null},
  {matchId:'22222222-2222-4222-8222-222222222222',sourceKey:'userofficial:women2b',competitionLabel:womenIIB,
   homeName:'MTK Budapest kék',awayName:'BEAC II.',startsAt:'2026-11-17T19:30:00',homeSets:null,awaySets:null},
  {matchId:'33333333-3333-4333-8333-333333333333',sourceKey:'userofficial:men1b',competitionLabel:menIB,
   homeName:'BEAC',awayName:'Mozdulj SE',startsAt:'2027-02-08T19:30:00',homeSets:null,awaySets:null}
 ];
 contexts.ccMrszPlayerPhoto_.canonicalMatches=matches;
 contexts.ccMrszPlayerPhoto_.fixtures=[{competitionLabel:womenI,homeName:'BEAC',awayName:'DO NOT OVERRIDE',
   startsAt:'2026-12-01T20:00:00',homeSets:null,awaySets:null}];
 try{
  const w1=contexts.getCanonical(womenI,false);
  const w2=contexts.getCanonical(womenIIB,true);
  const men=contexts.getCanonical(menIB,true);
  assert.equal(w1.length,1);assert.equal(w2.length,1);assert.equal(men.length,1);
  assert.equal(w1[0].sourceKey,'userofficial:women1');
  assert.equal(w2[0].homeName,'MTK Budapest kék');
  assert.equal(men[0].awayName,'Mozdulj SE');
  assert.ok(!w1.some(x=>x.awayName==='DO NOT OVERRIDE'));
  assert.ok(!w2.some(x=>x.homeName==='MTK Budapest'));
  assert.equal(contexts.ccMrszPlayerPhoto_.fixtures.length,1,'no writes to source events');
 }finally{contexts.ccMrszPlayerPhoto_.canonicalMatches=[];contexts.ccMrszPlayerPhoto_.fixtures=[];}
});
test('canonical fixture shows VS.; official score card shows completed sets',()=>{
 const pending={...match,homeSets:null,awaySets:null,setScores:null,startsAt:'2026-11-11T20:00:00'};
 const pendingHtml=contexts.getScoreboard(pending);
 const playedHtml=contexts.getScoreboard(match);
 assert.match(pendingHtml,/player-match-vs[^>]*>VS\./);
 assert.doesNotMatch(pendingHtml,/0\s*[–-]\s*0/);
 assert.match(playedHtml,/3 – 1/);
 assert.match(playedHtml,/25:20 · 25:18 · 19:25 · 25:23/);
});

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
const context={
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
 assert.ok(!initial.includes('standings-match-row'));
});
test('all leagues keep old styled match rows when all-league is selected',()=>{
 context.qa.setScope('all');
 for(const league of [w1,w2,menA,menB]){
  const html=context.qa.html(league,false);
  assert.ok(html.includes('standings-match-row'),league);
  assert.ok(html.includes('standings-match-list'));
  assert.ok(html.includes('1 / 1 meccs'));
 }
 assert.ok(context.qa.html(menB,false).includes('BEAC'));
 assert.ok(!context.qa.html(menB,false).includes('MAFC-Kármán'));
 context.qa.setScope('beac');
});
test('unplayed fixture does not invent a 0:0 score',()=>{
 const html=context.qa.html(menB,false);
 assert.ok(html.includes('standings-match-score '));
 assert.ok(html.includes('>–</div>'));
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
 assert.ok(css.includes('.standings-match-row'));
});

test('existing Player main table is used rather than rendering another photo table',()=>{
 const start=js.indexOf('function renderCompetitionStandings_(){'),end=js.indexOf('\nfunction syncPlannerSectionUi_()',start);
 const view=js.slice(start,end);
 assert.ok(view.includes('const allRows=hasPhoto?ccPlayerPhotoStandingRows_'));
 assert.ok(!view.includes('const photoMain=ccMrszPlayerMainScreenshotHtml_()'));
 assert.ok(view.includes('ccMrszPlayerLeagueScheduleHtml_(label,!requiresPhoto)'));
});

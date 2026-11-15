'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const statsCss=fs.readFileSync('statistics.css','utf8');
const statsJs=fs.readFileSync('statistics.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
function fragment(start,end){
 const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing function section: '+start);
 return app.slice(a,b);
}
const ctx=vm.createContext({Intl,Date,Array,Map,Number,String,JSON,
 escapeHtml_:x=>String(x??'').replace(/&/g,'&amp;'),
 competitionLeagueInsights:{data:{matches:[]}},
 ccMrszPlayerPhoto_:{matches:[],fixtures:[],sourceMatches:[],userMatches:[]}});
vm.runInContext(fragment('function ccPlayerProtocolBadgesHtml_(', 'function ccPlayerProtocolRosterHtml_('),ctx);
vm.runInContext(fragment('function ccMrszPlayerLocalKickoff_(', '// Preserve unconfirmed BEAC self-fixtures'),ctx);
vm.runInContext(fragment('function ccPlayerMatchTeamKey_(', 'function ccPlayerResultsOnlyStandings_('),ctx);
test('substitute always appears at the right edge after captain and libero',()=>{
 const html=ctx.ccPlayerProtocolBadgesHtml_({designation:'CS',captain:true,libero:'L1'});
 assert.ok(html.indexOf('is-captain')<html.indexOf('is-libero'));
 assert.ok(html.indexOf('is-libero')<html.indexOf('is-subs'));
 assert.ok(html.includes('aria-label="Csere"'));
 assert.ok(css.includes('.player-protocol-badges .player-roster-marker.is-subs{margin-left:3px;order:99}'));
 assert.ok(css.includes('display:flex;width:100%;gap:5px;align-items:center;justify-content:flex-end;min-height:22px'));
});
test('2026 Oct 19 belongs first, following days next, older dates at end',()=>{
 const rows=['2026-10-10T20:00:00','2026-10-22T20:00:00','2026-10-19T19:30:00','2026-10-18T20:00:00']
  .map(startsAt=>({startsAt}));
 const sorted=rows.sort((a,b)=>ctx.ccPlayerMatchListSort_(a,b,'2026-10-19')).map(x=>x.startsAt.slice(0,10));
 assert.deepEqual(sorted,['2026-10-19','2026-10-22','2026-10-18','2026-10-10']);
});
test('confirmed 19 Oct BEAC-PDSE supersedes old unplayed 12 Oct fixture without losing scored results',()=>{
 const league='Férfi Budapest I. osztály – B csoport',oldDate='2026-10-12T19:30:00';
 ctx.ccMrszPlayerPhoto_={
  matches:[],fixtures:[{competitionLabel:league,homeName:'BEAC',awayName:'PDSE',startsAt:oldDate,homeSets:null,awaySets:null}],
  sourceMatches:[{competitionLabel:league,homeName:'BEAC',awayName:'PDSE',startsAt:oldDate,homeSets:null,awaySets:null}],
  userMatches:[{source:'user_brsz_20261018',season:'2026/27',sourceMatchKey:'ui20261018:menB:beac:pdse:1',
    _ccSourceKey:'ui20261018:menB:beac:pdse:1',_ccUserSupplied:true,
    competitionLabel:league,homeName:'BEAC',awayName:'PDSE',startsAt:'2026-10-19T19:30:00',
    homeSets:null,awaySets:null}]
 };
 const list=ctx.ccMrszPlayerAllLeagueMatches_(league,false);
 assert.equal(list.length,1);
 assert.equal(ctx.ccMrszPlayerLocalKickoff_(list[0].startsAt).date,'2026-10-19');
 const earlierResult={competitionLabel:league,homeName:'BEAC',awayName:'PDSE',
  startsAt:oldDate,homeSets:3,awaySets:1};
 ctx.ccMrszPlayerPhoto_.matches=[earlierResult];
 const withResult=ctx.ccMrszPlayerAllLeagueMatches_(league,false);
 assert.equal(withResult.length,2,'a completed result must never be silently discarded');
});
test('other team and source cannot trigger reschedule',()=>{
 const league='Férfi Budapest I. osztály – B csoport';
 const invalid={season:'2026/27',sourceMatchKey:'ui20261018:menB:beac:pdse:1',_ccUserSupplied:true,
   competitionLabel:league,homeName:'PDSE',awayName:'BEAC',startsAt:'2026-10-19T19:30:00'};
 assert.equal(ctx.ccPlayerVerifiedReschedule_(invalid,league),null);
});
test('statistics tabs and missing-data explanations are visible, not silently omitted',()=>{
 assert.ok(statsCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
 assert.ok(statsJs.includes('Rögzített eredmények:'));
 assert.ok(statsJs.includes('Részleges forrás'));
 assert.ok(statsJs.includes('jegyzőkönyvvel:'));
 assert.ok(statsJs.includes('else page.appendChild(details);'));
 assert.ok(!statsJs.includes('if(!matches&&!table)return;'));

 assert.ok(statsJs.includes("['players','Játékosok']"));
 assert.ok(statsJs.includes("['compare','Összehasonlítás']"));
 assert.ok(!app.includes('cc_player_competition_match_full_save'));
});
test('PWA version is changed and equal for all Player assets',()=>{
 const matches=[...index.matchAll(/(?:styles|app|statistics)\.(?:css|js)\?v=([^"]+)/g)].map(x=>x[1]);
 assert.ok(matches.length>=4);
 assert.equal(new Set(matches).size,1,'HTML file versions need same cache token');
 assert.ok(sw.includes('club-control-player-'+matches[0]));
 assert.ok(app.includes('sw.js?v='+matches[0]));
});

test('compact Player match indicator comes from the central form snapshot with limited-data rank',()=>{
 const isolated=vm.createContext({
  ccMrszPlayerPhoto_:{canonicalFormCards:[
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamName:'BEAC',rank:1,trend:'up',trendBasis:'last_match_vs_previous_match_limited',lastFive:['W','L','W']},
   {competitionLabel:'Férfi Budapest I. osztály – B csoport',teamName:'MAFC-Vásárhelyi',rank:4,trend:'down',trendBasis:'last_match_vs_previous_match_limited',lastFive:['W','L']}
  ]},
  ccPlayerMatchTeamKey_:ctx.ccPlayerMatchTeamKey_,
  escapeHtml_:ctx.escapeHtml_,
  ccMrszPlayerLocalKickoff_:ctx.ccMrszPlayerLocalKickoff_,
  standingsTeamLogoHtml_:()=>'<span class="match-logo"></span>',
  ccPlayerOfficialMatchReportUrl_:()=>''
 });
 vm.runInContext(fragment('function ccPlayerFormTeam_(', 'function ccMrszPlayerLeagueScheduleHtml_('),isolated);
 const fixture={homeName:'BEAC',awayName:'MAFC-Vásárhelyi',
  competitionLabel:'Férfi Budapest I. osztály – B csoport',
  startsAt:'2026-11-23T19:30:00',homeSets:null,awaySets:null};
 const upcoming=isolated.ccPlayerScoreboardHtml_(fixture);
 assert.ok(upcoming.includes('1.'));
 assert.ok(upcoming.includes('4.'));
 assert.ok(upcoming.includes('cc-form-arrow up'));
 assert.ok(upcoming.includes('cc-form-arrow down'));
 assert.ok(upcoming.includes('cc-form-trend-icon'));
 assert.ok(!upcoming.includes('1.*'));
 assert.ok(!upcoming.includes('4.*'));
 assert.ok(upcoming.includes('M3 17 L9 10 L13 14 L21 5'));
 assert.ok(upcoming.includes('M3 7 L9 14 L13 10 L21 19'));
 assert.ok(upcoming.includes('player-match-teamcopy'));
 assert.ok(!upcoming.includes('1. helyen áll'));
 const played=isolated.ccPlayerScoreboardHtml_({...fixture,homeSets:3,awaySets:0});
 assert.ok(!played.includes('cc-form-mini'));
 assert.ok(css.includes('.player-match-teamcopy{'));
});

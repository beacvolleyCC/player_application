'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const escapeHtml_=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fnSection(from,to){
 const a=app.indexOf(from),b=app.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Expected Player function contract not found: '+from);
 return app.slice(a,b);
}
const scope={
  escapeHtml_,
  ccMrszPlayerLocalKickoff_:iso=>({date:String(iso).slice(0,10),time:String(iso).slice(11,16)}),
  ccPlayerProtocolNameHtml_:person=>escapeHtml_(person?.name||''),
  ccPlayerProtocolProfileUrl_:url=>(/^https:\/\/www\.hunvolley\.info\//.test(String(url||''))?url:''),
  ccPlayerOfficialMatchReportUrl_:()=>'', // no unverified link is guessed
  standingsTeamLogoHtml_:()=>'<i class="logo"></i>',
  window:{},Intl,Date,Array,Number,String
};
vm.createContext(scope);
vm.runInContext(fnSection('function ccPlayerProtocolBadgesHtml_(', 'function ccPlayerOpenProtocol_('),scope);
vm.runInContext(fnSection('function ccPlayerScoreboardHtml_(', 'function ccMrszPlayerLeagueScheduleHtml_('),scope);
const sample=(code)=>({
  competitionLabel:code===2686?'Női Budapest I. osztály':'Férfi Budapest I. osztály – B csoport',
  matchCode:String(code),
  homeName:code===2686?'MTK':'Mozdulj SE',
  awayName:code===2686?'Panoráma SE':'MAFC-Vásárhelyi',
  startsAt:code===2686?'2026-10-21T21:00:00':'2026-10-21T20:00:00',
  homeSets:3,awaySets:code===2686?1:2,status:'played',
  setScores:code===2686?
   [[25,20],[25,9],[20,25],[25,15]].map(([home,away])=>({home,away})):
   [[25,18],[25,23],[21,25],[18,25],[15,11]].map(([home,away])=>({home,away})),
  protocol:{
    teams:code===2686?[
      {name:'MTK',players:[
        {name:'KISS VIRÁG BARBARA',number:'5',code:'21303',designation:'K',captain:true},
        {name:'DELI-GERMANN OLGA',number:'13',code:'21482',designation:'CS',libero:'L1'},
        {name:'PUSKÁS IVETT',number:'11',code:'21232',designation:null}
      ],staff:[{name:'PUENTES RIVERY YULIEL',role:'vezetőedző'}]},
      {name:'Panoráma SE',players:[
        {name:'RÉDEY LUCA JULIANNA',number:'17',code:'23161',designation:'K',captain:true}
      ],staff:[{name:'RÉDEY LUCA JULIANNA',role:'vezetőedző'}]}
    ]:[
      {name:'Mozdulj SE',players:[
        {name:'STARK SÁNDOR',number:'12',code:'77930',designation:'K',captain:true},
        {name:'RAB LEVENTE RÓBERT',number:'8',code:'75203',designation:'CS',libero:'L1'},
        {name:'BALÁZSI KRISZTIÁN',number:'7',code:'61342',designation:null}
      ],staff:[{name:'HACKL SZILVIA',role:'vezetőedző'}]},
      {name:'MAFC-Vásárhelyi',players:[
        {name:'DOBOS VIKTOR',number:'2',code:'23320',designation:'K',captain:true},
        {name:'FARNADY ERNŐ',number:'14',code:'22046',designation:'CS',libero:'L1'}
      ],staff:[]}
    ],
    officials:code===2686?
      [{name:'HERR ZSUZSANNA',role:'Játékvezető'},{name:'SELMECZI VANDA',role:'Jegyzőkönyvvezető'}]:
      [{name:'VIG DIÁNA',role:'Játékvezető'}]
  }
});
test('Player renders new official scoreboards with clickable internal report, never fictional external PDF links',()=>{
 for(const code of [2686,2700]){
  const match=sample(code),html=scope.ccPlayerScoreboardHtml_(match);
  assert.ok(html.includes('data-player-protocol="'+code+'"'));
  assert.ok(html.includes('has-protocol'));
  assert.ok(html.includes(code===2686?'3 – 1':'3 – 2'));
  assert.ok(html.includes('2026-10-21'));
  assert.ok(!html.includes('data-player-external-report'));
  assert.ok(!html.includes('hunvolley.info/pr_00/'));
  assert.ok(html.includes('player-match-sets'));
 }
});
test('Player report keeps captain/libero/substitute and unmarked labels, matching canonical output',()=>{
 const m=sample(2700),html=scope.ccPlayerProtocolDetailHtml_(m);
 assert.ok(html.includes('Meccskód: 2700'));
 assert.ok(html.includes('STARK SÁNDOR'));
 assert.ok(html.includes('aria-label="Kapitány"'));
 assert.ok(html.includes('aria-label="Libero"'));
 assert.ok(html.includes('aria-label="Csere"'));
 assert.ok(html.includes('Nincs pályára lépési jelölés'));
 assert.ok(html.includes('HACKL SZILVIA'));
 assert.ok(html.includes('VIG DIÁNA'));
 assert.ok(html.includes('FARNADY ERNŐ'));
 assert.ok(!html.includes('Hunvolley-forrás ↗'));
});
test('Women I protocol keeps scorekeeper, both coaches, and official 4-set result',()=>{
 const m=sample(2686),html=scope.ccPlayerProtocolDetailHtml_(m);
 for(const item of ['Meccskód: 2686','PUENTES RIVERY YULIEL','RÉDEY LUCA JULIANNA','SELMECZI VANDA','HERR ZSUZSANNA','25 : 9','20 : 25']){
  assert.ok(html.includes(item),'Missing '+item);
 }
 assert.ok(html.includes('KISS VIRÁG BARBARA'));
 assert.ok(html.includes('DELI-GERMANN OLGA'));
 assert.ok(html.includes('PUSKÁS IVETT'));
 assert.ok(!html.includes('Hunvolley-forrás ↗'));
});
test('Player only marks actual verified K/CS state and never invents participation',()=>{
 const html=scope.ccPlayerProtocolBadgesHtml_({designation:null});
 assert.ok(html.includes('Nincs pályára lépési jelölés'));
 assert.ok(!html.includes('aria-label="Csere"'));
 const libero=scope.ccPlayerProtocolBadgesHtml_({designation:'CS',libero:'L1',captain:true});
 const i=['is-captain','is-libero','is-subs'].map(x=>libero.indexOf(x));
 assert.ok(i[0]>=0&&i[0]<i[1]&&i[1]<i[2]);
});
test('Shared feed remains top-level canonical, no duplicate local fixture/protocol substitution when populated',()=>{
 const source=fnSection('function ccMrszPlayerAllLeagueMatches_(', 'function ccPlayerResultsOnlyStandings_(');
 assert.ok(source.includes('ccMrszPlayerPhoto_.canonicalMatches'));
 assert.ok(source.includes('shared.filter('));
 assert.ok(!/matchCode\s*\+\s*sourceKey/.test(source));
});

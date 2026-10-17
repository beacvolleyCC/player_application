'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const js=fs.readFileSync('statistics.js','utf8');
function harness(){
 const scope={
  document:{getElementById:()=>null},
  escapeHtml_:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),
  ccPlayerMatchTeamKey_:n=>{const k=String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');return k==='budapestiegyetemiatletikaiclub'?'beac':k},
  ccMrszPlayerLocalKickoff_:s=>({date:String(s).slice(0,10)}),
  ccPlayerProtocolProfileUrl_:url=>typeof url==='string'&&url.startsWith('https://'),
  ccPlayerProtocolNameHtml_:p=>String(p.name||'')
 };
 vm.createContext(scope);vm.runInContext(js,scope);
 return scope;
}
const row=(code,name,designation,profileUrl)=>({code,name,designation,profileUrl});
const match=(code,home,away,homeSets,awaySets,teams)=>({
 matchCode:code,startsAt:'2026-10-'+String(11+Number(code.slice(-1))).padStart(2,'0')+'T19:30:00',
 homeName:home,awayName:away,homeSets,awaySets,protocol:{teams}
});
const team=(name,players)=>({name,players});
function evaluate(scope,matches){scope.data={league:'Női Budapest I. osztály',played:matches};
 return vm.runInContext('ccStatsPlayerRows_(data)',scope)}
function normalMatches(){
 return [
  match('99101','BEAC','EMERICUS SE',3,1,[
   team('Budapesti Egyetemi Atlétikai Club',[
    row('27101','Uhri Sára','K','https://www.hunvolley.info/player/27101'),
    row('32910','Iglói Nóra','CS'),
    row('30317','Diószegi Réka',null)
   ]),
   team('EMERICUS SE',[row('28111','Other Player','K')])]),
  match('99102','EMERICUS SE','BEAC',3,0,[
   team('EMERICUS SE',[row('28111','Other Player','K')]),
   team('BEAC',[row('27101','Uhri Sára','CS'),row('32910','Iglói Nóra','K'),row('30317','Diószegi Réka','')])])
 ];
}
test('Player shows recorded W/L for matches in each official roster, split into K, CS, unmarked',()=>{
 const scope=harness(),rows=evaluate(scope,normalMatches());
 assert.equal(rows.length,4);
 const byCode=new Map(Array.from(rows,p=>[p.code,p]));
 const uhri=byCode.get('27101');
 assert.equal(uhri.nominated,2);
 assert.equal(uhri.won,1);
 assert.equal(uhri.lost,1);
 assert.equal(uhri.starts,1);
 assert.equal(uhri.substitutes,1);
 assert.equal(uhri.unmarked,0);
 assert.equal(uhri.profileUrl,'https://www.hunvolley.info/player/27101');
 const dio=byCode.get('30317');
 assert.equal(dio.nominated,2);
 assert.equal(dio.starts,0);
 assert.equal(dio.substitutes,0);
 assert.equal(dio.unmarked,2);
 assert.equal(dio.won+dio.lost,dio.nominated);
 const body=vm.runInContext('ccStatsPlayers_(data)',scope);
 for(const header of ['Játékosok','>Nev.</th>','>Gy.</th>','>V.</th>','>K</th>','>CS</th>','>–</th>']){
  assert.ok(body.includes(header),'Missing '+header);
 }
 assert.ok(!body.includes('Nem játszott</th>'),'Unmarked must not be displayed as confirmed non-participation');
});
test('unfinished matches, broken team matches and incomplete player IDs are ignored',()=>{
 const scope=harness();
 const valid=normalMatches()[0];
 const unfinished=match('99103','BEAC','EMERICUS SE',null,null,[team('BEAC',[row('27101','Uhri Sára','K')])]);
 const thirdTeam=match('99104','BEAC','EMERICUS SE',3,0,[team('BEAC II.',[row('27101','Uhri Sára','K')])]);
 const noId=match('99105','BEAC','EMERICUS SE',3,0,[team('BEAC',[row('', 'Unknown Player','K')])]);
 const rows=evaluate(scope,[valid,unfinished,thirdTeam,noId]);
 assert.equal(rows.find(p=>p.code==='27101').nominated,1);
 assert.equal(rows.some(p=>p.name==='Unknown Player'),false);
 assert.ok(rows.every(p=>p.won+p.lost===p.nominated));
});
test('duplicate ID inside one match and conflicting names cannot inflate statistics',()=>{
 const scope=harness(),duplicated=match('99106','BEAC','EMERICUS SE',3,0,[
  team('BEAC',[row('27101','Uhri Sára','K'),row('27101','Uhri Sára','CS')])
 ]);
 let rows=evaluate(scope,[duplicated]);
 assert.equal(rows.length,0);
 const naming=match('99107','BEAC','EMERICUS SE',3,1,[team('BEAC',[row('27101','Different Person','K')])]);
 rows=evaluate(scope,[normalMatches()[0],naming]);
 assert.equal(rows.some(p=>p.code==='27101'),false);
});
test('the same person code in two different teams is never silently merged',()=>{
 const scope=harness();
 const a=match('99108','BEAC','EMERICUS SE',3,0,[team('BEAC',[row('27101','Uhri Sára','K')])]);
 const b=match('99109','BEAC','EMERICUS SE',0,3,[team('EMERICUS SE',[row('27101','Uhri Sára','CS')])]);
 const rows=evaluate(scope,[a,b]);
 assert.equal(rows.length,2);
 assert.ok(rows.every(p=>p.nominated===1));
});
test('navigation includes Játékosok but does not reinstate a duplicate matches tab',()=>{
 assert.ok(js.includes("['players','Játékosok']"));
 assert.ok(js.includes("['overview','Áttekintés']"));
 assert.ok(js.includes("['teams','Csapatok']"));
 assert.ok(js.includes("['compare','Összehasonlítás']"));
 assert.ok(!js.includes("['matches','Meccsek']];"));
 assert.ok(js.includes("'players','compare'].includes(tab.dataset.ccStatsTab)"));
 assert.ok(js.includes('data-cc-stats-player-team'));
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const stats=fs.readFileSync('statistics.js','utf8');
const labels=[
 ['Férfi Budapest I. osztály – A csoport',42,2],
 ['Férfi Budapest I. osztály – B csoport',42,1],
 ['Női Budapest I. osztály',131,5],
 ['Női Budapest II. osztály – A csoport',42,0],
 ['Női Budapest II. osztály – B csoport',43,0]
];
function full(){
 const rows=[];
 labels.forEach(([competitionLabel,count,results],group)=>{
  for(let i=0;i<count;i++){
   const result=i<results,key='ui20261018:test:'+group+':'+i;
   rows.push({competitionLabel,season:'2026/27',sourceMatchKey:key,_ccSourceKey:key,
     _ccSourceSystem:'user',_ccUserSupplied:true,_ccSourceKind:result?'result':'fixture',
     homeName:'HOME '+group+' '+i,awayName:'AWAY '+group+' '+i,
     startsAt:result?'2026-10-13':'2026-11-04T20:00:00',
     homeSets:result?3:null,awaySets:result?1:null});
  }
 });
 const match=rows.find(x=>x.competitionLabel===labels[1][0]&&x._ccSourceKind==='fixture');
 match.sourceMatchKey='ui20261018:menB:beac:pdse:1';
 match._ccSourceKey=match.sourceMatchKey;
 match.homeName='BEAC';match.awayName='PDSE';match.startsAt='2026-10-19T19:30:00';
 return rows;
}
const part=(start,end)=>{
 const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing UI component '+start);
 return app.slice(a,b);
};
const ctx=vm.createContext({Intl,Date,Map,Set,Array,Number,String,Object,JSON,
 competitionLeagueInsights:{data:{matches:[]}},
 ccMrszPlayerPhoto_:{userMatches:[],matches:[],fixtures:[],sourceMatches:[],tables:[]}});
vm.runInContext(part('function ccMrszPlayerLocalKickoff_(', '// Preserve unconfirmed BEAC self-fixtures'),ctx);
vm.runInContext(part('function ccPlayerMatchTeamKey_(', 'function ccPlayerResultsOnlyStandings_('),ctx);
const group=labels[1][0];
test('Exactly 300 source rows covering all 5 official groups pass safety gate',()=>{
 const rows=full();
 assert.equal(rows.length,300);
 assert.equal(ctx.ccPlayerVerifiedUserSchedule_(rows),true);
 assert.equal(ctx.ccPlayerVerifiedUserSchedule_(rows.slice(0,20)),false);
 const duplicate=full();duplicate[1].sourceMatchKey=duplicate[0].sourceMatchKey;
 assert.equal(ctx.ccPlayerVerifiedUserSchedule_(duplicate),false);
 const unsafe=full();unsafe[0]._ccUserSupplied=false;
 assert.equal(ctx.ccPlayerVerifiedUserSchedule_(unsafe),false);
});
test('The entire group is displayed, and old uns cored BRSZ fixtures are superseded',()=>{
 const rows=full(),legacy={competitionLabel:group,homeName:'BEAC',awayName:'PDSE',
 startsAt:'2026-10-12T19:30:00',homeSets:null,awaySets:null};
 ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[],fixtures:[legacy],sourceMatches:[legacy],tables:[]};
 const matches=ctx.ccMrszPlayerAllLeagueMatches_(group,false);
 assert.equal(matches.length,42);
 assert.ok(matches.some(x=>x.homeName==='BEAC'&&x.awayName==='PDSE'&&
  ctx.ccMrszPlayerLocalKickoff_(x.startsAt).date==='2026-10-19'));
 assert.ok(!matches.some(x=>x.homeName==='BEAC'&&x.awayName==='PDSE'&&
  ctx.ccMrszPlayerLocalKickoff_(x.startsAt).date==='2026-10-12'));
});
test('Same-date scored MRSZ sheet supersedes an unscored import fixture',()=>{
 const rows=full(),fixture=rows.find(x=>x.competitionLabel===group&&x._ccSourceKind==='fixture');
 const official={competitionLabel:group,homeName:fixture.homeName,awayName:fixture.awayName,
  startsAt:fixture.startsAt,homeSets:3,awaySets:1,matchCode:'mrsz01',
  protocol:{teams:[{name:fixture.homeName,players:[]},{name:fixture.awayName,players:[]}]}};
 ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[official],fixtures:[],sourceMatches:[],tables:[]};
 const selected=ctx.ccMrszPlayerAllLeagueMatches_(group,false);
 assert.equal(selected.length,42);
 assert.ok(selected.some(m=>m.matchCode==='mrsz01'));
});
test('Inconsistent completed result is flagged for human review, not auto-counted',()=>{
 const rows=full(),m=rows.find(x=>x.competitionLabel===group&&x._ccSourceKind==='result');
 ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[{competitionLabel:group,
  homeName:m.homeName,awayName:m.awayName,startsAt:m.startsAt,
  homeSets:0,awaySets:3}],fixtures:[],sourceMatches:[],tables:[]};
 const selected=ctx.ccMrszPlayerAllLeagueMatches_(group,false);
 assert.ok(selected.some(x=>x.__ccResultConflict===true));
 assert.ok(stats.includes('!m.__ccResultConflict'));
});
test('Partial payload preserves previously verified October 19 move even when the full feed fails',()=>{
 const rows=full().slice(0,80),legacy={competitionLabel:group,
  homeName:'BEAC',awayName:'PDSE',startsAt:'2026-10-12T19:30:00',
  homeSets:null,awaySets:null};
 ctx.ccMrszPlayerPhoto_={userMatches:rows,matches:[],fixtures:[legacy],sourceMatches:[],tables:[]};
 const selected=ctx.ccMrszPlayerAllLeagueMatches_(group,false);
 assert.equal(selected.length,1);
 assert.equal(ctx.ccMrszPlayerLocalKickoff_(selected[0].startsAt).date,'2026-10-19');
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
// Test-only copy of Manager #74 staged PDF extraction, pinned to the commit
// SHA of that artifact. Source of truth remains Manager draft PR #74.
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/official-protocols-20261021-manager74-snapshot.json','utf8'));
const source=fs.readFileSync('app.js','utf8');
const section=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing live Player function '+start);return source.slice(a,b)};
const escapeHtml_=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const views={body:{innerHTML:''},sheet:{scrollTop:73},dialog:{scrollTop:12,querySelector(selector){return selector==='.player-protocol-dialog-card'?views.sheet:null}},opened:0,closed:0,closeButton:{handlers:{},addEventListener(name,fn){this.handlers[name]=fn}},cards:[]};
const ctx={
 URL,Intl,Date,
 document:{
  getElementById:kind=>kind==='playerProtocolDialog'?views.dialog:
    kind==='playerProtocolContent'?views.body:
    kind==='closePlayerProtocolDialog'?views.closeButton:null,
  querySelectorAll:query=>query==='[data-player-protocol]'?views.cards:[]
 },
 ccOpenDialog_:()=>{views.opened++},ccCloseDialog_:()=>{views.closed++},
 ccMrszPlayerPhoto_:{canonicalMatches:[],matches:[]},
 ccMrszPlayerLocalKickoff_:v=>({date:String(v||'').slice(0,10),time:String(v||'').slice(11,16)}),
 ccPlayerOfficialMatchReportUrl_:()=>'',escapeHtml_,standingsTeamLogoHtml_:()=>'<i class="club-icon"></i>'
};
vm.createContext(ctx);
vm.runInContext(
 section('function ccPlayerProtocolProfileUrl_(', '// Two official match records supplied')
 +section('function ccPlayerScoreboardHtml_(', 'function ccMrszPlayerLeagueScheduleHtml_(')
 +String.raw`
this.report=ccPlayerProtocolDetailHtml_;
this.card=ccPlayerScoreboardHtml_;
this.open=ccPlayerOpenProtocol_;
this.nameHtml=ccPlayerProtocolNameHtml_;
this.bind=ccPlayerBindProtocols_;
`,ctx);
const ids={'2686':'04eaceee-57e2-7563-a618-beb933c0ffc0',
 '2700':'25a14406-2887-62fc-086c-ad770d160a6b'};
const mapped=fixture.matches.map(({data:d,canonicalFixtureSourceKey:sourceKey})=>({
 sourceKey,matchId:ids[String(d.matchCode)],matchCode:String(d.matchCode),season:d.season,
 competitionLabel:d.competitionLabel,homeName:d.homeName,awayName:d.awayName,
 startsAt:d.startsAt.slice(0,19),homeSets:d.homeSets,awaySets:d.awaySets,
 setScores:d.setScores,venue:d.venue,status:'played',protocolUrl:null,
 homeSourceTeamId:d.homeSourceTeamId,awaySourceTeamId:d.awaySourceTeamId,
 protocol:{
  sourceUrl:null,
  teams:['home','away'].map(side=>({
   name:d[side+'Name'],
   players:d.rosters[side].map(p=>({name:p.name,number:String(p.jersey),
     code:String(p.registrationId),designation:p.designation==='Cs'?'CS':p.designation,
     captain:p.captain||false,libero:p.libero||null})),
   staff:(d.officials?.[side]||[]).map(s=>({name:s.name,role:s.designation,code:String(s.registrationId)}))
  })),
  officials:[['Játékvezető',d.referee],['Jegyzőkönyvvezető',d.scorekeeper]]
   .filter(([,item])=>!!item).map(([role,p])=>({name:p.name,role,code:String(p.registrationId)}))
 }
}));
ctx.ccMrszPlayerPhoto_.canonicalMatches=mapped;
test('pinned source is exactly two official fixture overlays, with 38 distinct athlete entries',()=>{
 assert.equal(fixture.deployment,'staged_only');
 assert.equal(mapped.length,2);
 assert.equal(new Set(mapped.map(x=>x.matchId)).size,2);
 assert.equal(new Set(mapped.map(x=>x.sourceKey)).size,2);
 assert.deepEqual(mapped.map(x=>x.matchCode).sort(),['2686','2700']);
 assert.deepEqual(mapped.map(x=>x.protocol.teams.reduce((a,t)=>a+t.players.length,0)),[19,19]);
 assert.equal(mapped.reduce((n,x)=>n+x.protocol.teams.reduce((a,t)=>a+t.players.length,0),0),38);
 assert.ok(mapped.every(x=>x.season==='2026/27'));
});
for(const m of mapped)test('Player official '+m.matchCode+' score, full roster, badges and opened internal dialog',()=>{
 const html=ctx.card(m);
 assert.ok(html.includes('has-protocol'));
 assert.ok(html.includes('data-player-protocol="'+m.matchCode+'"'));
 assert.ok(html.includes(m.homeSets+' – '+m.awaySets));
 assert.ok(html.includes('2026-10-21'));
 assert.ok(html.includes(m.setScores.map(s=>s.home+':'+s.away).join(' · ')));
 assert.ok(!html.includes('data-player-external-report'));
 const protocol=ctx.report(m);
 assert.ok(protocol.includes('Meccskód: '+m.matchCode));
 assert.ok(protocol.includes(m.homeName));
 assert.ok(protocol.includes(m.awayName));
 assert.ok(protocol.includes('aria-label="Kapitány"'));
 assert.ok(protocol.includes('aria-label="Libero"'));
 assert.ok(protocol.includes('aria-label="Csere"'));
 assert.ok(protocol.includes('Nincs pályára lépési jelölés'));
 assert.ok(!protocol.includes('Hunvolley-forrás ↗'));
 for(const side of m.protocol.teams){
  for(const p of side.players){
   assert.ok(protocol.includes(p.name),'Missing athlete '+p.name);
   assert.ok(protocol.includes(p.code)===false,'Do not fabricate federation athlete URL from registration code');
  }
 }
 views.sheet.scrollTop=90;
 views.dialog.scrollTop=22;
 const before=views.opened;
 ctx.open(m.matchCode,m.competitionLabel);
 assert.equal(views.opened,before+1,'valid canonical protocol modal must open');
 assert.equal(views.sheet.scrollTop,0,'reopened protocol must start at top');
 assert.equal(views.dialog.scrollTop,0,'dialog root must reset scroll');
 assert.ok(views.body.innerHTML.includes('Meccskód: '+m.matchCode));
});
test('MRSZ number cannot open a different competition or a duplicate same-league result',()=>{
 const before=views.opened;
 ctx.open('2686','Női Budapest II. osztály – B csoport');
 assert.equal(views.opened,before);
 const duplicate={...mapped[0],matchId:'e1111111-1111-4111-8111-111111111111'};
 ctx.ccMrszPlayerPhoto_.canonicalMatches.push(duplicate);
 ctx.open('2686',mapped[0].competitionLabel);
 assert.equal(views.opened,before,'do not select ambiguous official report by list position');
 ctx.ccMrszPlayerPhoto_.canonicalMatches.pop();
});
test('Official protocol source ID must not imply a guessed individual athlete profile',()=>{
 const example=mapped[1].protocol.teams[0].players[0];
 assert.ok(example.code);
 assert.ok(!example.profileUrl);
 assert.equal(ctx.nameHtml(example),example.name);
});

test('mobile tap/keyboard event binder opens exact internal protocol and respects nested actions',()=>{
 const events={};
 const card={
  dataset:{playerProtocol:'2686',playerProtocolLeague:'Női Budapest I. osztály'},
  addEventListener:(type,callback)=>{events[type]=callback}
 };
 views.cards=[card];
 ctx.bind();
 assert.equal(typeof events.click,'function');
 assert.equal(typeof events.keydown,'function');
 const target=(nested=false)=>({closest:()=>nested?{tagName:'A'}:null});
 let before=views.opened;
 events.click({target:target()});
 assert.equal(views.opened,before+1,'touch/click opens PDF-derived in-app report');
 assert.ok(views.body.innerHTML.includes('Meccskód: 2686'));
 before=views.opened;
 events.click({target:target(true)});
 assert.equal(views.opened,before,'nested link/button must not double-open report');
 let prevented=0;
 events.keydown({key:'Enter',target:target(),preventDefault(){prevented++}});
 events.keydown({key:' ',target:target(),preventDefault(){prevented++}});
 assert.equal(prevented,2,'Enter and Space remain keyboard accessible');
 assert.equal(views.opened,before+2);
 events.keydown({key:'Escape',target:target(),preventDefault(){prevented++}});
 events.keydown({key:'Enter',target:target(true),preventDefault(){prevented++}});
 assert.equal(prevented,2,'irrelevant or nested-key input remains untouched');
 const beforeClose=views.closed;
 assert.equal(typeof views.closeButton.handlers.click,'function','modal close handler must bind');
 views.closeButton.handlers.click();
 assert.equal(views.closed,beforeClose+1,'close button closes the report');
 views.cards=[];
});
test('a completed report cannot open without active canonical matchCode+league and exactly one record',()=>{
 const old=ctx.ccMrszPlayerPhoto_.canonicalMatches;
 try{
  ctx.ccMrszPlayerPhoto_.canonicalMatches=[];
  const before=views.opened;
  ctx.open('2686','Női Budapest I. osztály');
  assert.equal(views.opened,before,'no fabricated report from schedule-only state');
 }finally{ctx.ccMrszPlayerPhoto_.canonicalMatches=old}
});

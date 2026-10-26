'use strict';
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const code=fs.readFileSync('app.js','utf8');
const a=code.indexOf('function ccIsFutureArchivedMatch_(e,now=ccNow_()){');
const b=code.indexOf('\n}',a)+2;
assert.ok(a>=0&&b>a,'future archived match predicate exists');
const sandbox={Date,Number,eventStart:e=>new Date(e.startsAt),ccNow_:()=>new Date('2026-10-26T13:00:00+01:00')};
vm.createContext(sandbox);vm.runInContext(code.slice(a,b),sandbox);
const previous={type:'Meccs',title:'BEAC II. – Corvinus',startsAt:'2026-11-03T19:30:00+01:00',archived:true};
const current={type:'Meccs',title:'Corvinus – BEAC II.',startsAt:'2026-11-25T19:30:00+01:00',archived:false};
test('November 3 archived BB2 Corvinus is not an upcoming match',()=>{
 assert.equal(sandbox.ccIsFutureArchivedMatch_(previous),true);
 assert.equal(sandbox.ccIsFutureArchivedMatch_(current),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...previous,archived:false}),false);
});
test('played games, training and invalid dates are not confused with retired future matches',()=>{
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...previous,startsAt:'2026-10-12T19:30:00+02:00'}),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...previous,type:'Edzés'}),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...previous,startsAt:'invalid'}),false);
});
test('upcoming and calendar are clean; explicit archives retain provenance and old RSVPs',()=>{
 assert.match(code,/ccIsFutureArchivedMatch_\(e\) && homeFilters\.period!=='past'/);
 assert.match(code,/ccIsFutureArchivedMatch_\(e\) && pf!=='past'/);
 assert.match(code,/const visible=rows\.filter\(e=>\{\s*if\(ccIsFutureArchivedMatch_\(e\)\) return false/);
 assert.match(code,/Archivált időpont – már nem aktuális mérkőzés/);
 assert.match(code,/archived && !retiredFuture && e\.status===null/);
 assert.doesNotMatch(code,/delete from availability/);
});
test('iOS app, styles, statistics and service worker use the same release version',()=>{
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
 const releases=[...html.matchAll(/(?:styles|app|statistics)\.(?:css|js)\?v=([^"]+)/g)].map(x=>x[1]);
 assert.ok(releases.length>=4);
 assert.deepEqual([...new Set(releases)],['20261026-bb2-archived-v1']);
 assert.match(sw,/club-control-player-20261026-bb2-archived-v1/);
 assert.match(code,/sw\.js\?v=20261026-bb2-archived-v1/);
});

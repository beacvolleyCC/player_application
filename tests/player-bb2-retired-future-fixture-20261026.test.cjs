'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('app.js','utf8');
const a=code.indexOf('function ccIsFutureArchivedMatch_(e,now=ccNow_()){');
const b=code.indexOf('\n}',a)+2;
assert.ok(a>=0&&b>a);
const sandbox={Date,Number,eventStart:e=>new Date(e.startsAt),ccNow_:()=>new Date('2026-10-26T13:00:00+01:00')};
vm.createContext(sandbox);vm.runInContext(code.slice(a,b),sandbox);
const old={type:'Meccs',title:'BEAC II. – Corvinus',startsAt:'2026-11-03T19:30:00+01:00',archived:true};
const active={type:'Meccs',title:'Corvinus – BEAC II.',startsAt:'2026-11-25T19:30:00+01:00',archived:false};
test('November 3 superseded BB2 event is future archived; November 25 is active',()=>{
 assert.equal(sandbox.ccIsFutureArchivedMatch_(old),true);
 assert.equal(sandbox.ccIsFutureArchivedMatch_(active),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...old,archived:false}),false);
});
test('real past games, trainings, and invalid dates are not false positives',()=>{
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...old,startsAt:'2026-10-12T19:30:00+02:00'}),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...old,type:'Edzés'}),false);
 assert.equal(sandbox.ccIsFutureArchivedMatch_({...old,startsAt:'bad date'}),false);
});
test('all actionable lists hide future archived games, explicit archive retains them',()=>{
 assert.match(code,/ccIsFutureArchivedMatch_\(e\) && homeFilters\.period!=='past'/);
 assert.match(code,/ccIsFutureArchivedMatch_\(e\) && pf!=='past'/);
 assert.match(code,/const visible=rows\.filter\(e=>\{\s*if\(ccIsFutureArchivedMatch_\(e\)\)return false/);
 assert.match(code,/Archivált időpont – már nem aktuális mérkőzés/);
 assert.match(code,/archived && !retiredFuture && e\.status===null/);
});

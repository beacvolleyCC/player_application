'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','rsvp-reliability.js'),'utf8');
const next=()=>new Promise(done=>setImmediate(done));
function makeHarness(remote=true){
 const saved={},records=[],alerts=new Map(), counters={events:0,planner:0,stats:0,old:0};
 let writes=[];
 const event={id:'sample-event',status:null,note:'',yes:[],no:[],unknown:['Te']};
 const save=(e,status,note)=>new Promise((resolve,reject)=>writes.push({event:e,status,note,resolve,reject}));
 const storage={setItem(k,v){records.push({k,data:JSON.parse(v)});}};
 const document={
  getElementById(id){return alerts.get(id)||null;},
  createElement(){return {setAttribute(){},hidden:true,textContent:''};},
  body:{appendChild(el){alerts.set(el.id,el);}}
 };
 const raw=(e,status,note)=>{
  e.status=status;e.note=note;
  e.yes=status==='yes'?['Te']:[];
  e.no=status==='no'?['Te']:[];
  e.unknown=status==='yes'||status==='no'?[]:['Te'];
  saved[e.id]={status,note};
  storage.setItem('cc-demo-state-v2',JSON.stringify(saved));
 };
 const ctx={
  saved,document,console:{error(){}},Map,Promise,
  ccMobileTestStorage_:storage,SUPABASE_ENABLED:remote,ccSupabase:remote?{}:null,
  _persistLocal:raw,ccSaveAvailabilitySupabase_:save,
  persist(e,status,note){counters.old++;raw(e,status,note);},
  renderEvents(){counters.events++;},renderPlanner(){counters.planner++;},
  renderProfileStats_(){counters.stats++;}
 };
 vm.runInNewContext(source,ctx);
 return {ctx,event,writes,records,alerts,counters};
}
test('successful remote RSVP is saved and remains on screen',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','a');await next();
 assert.equal(h.writes.length,1);
 assert.equal(h.writes[0].status,'yes');
 h.writes[0].resolve();await next();
 assert.equal(h.event.status,'yes');
 assert.equal(h.alerts.size,0);
});
test('remote refusal reverts optimistic state even without an online reload',async()=>{
 const h=makeHarness();
 h.event.status='no';h.event.note='old';h.event.no=['Te'];h.event.unknown=[];
 h.ctx.persist(h.event,'yes','pending');await next();
 h.writes[0].reject(new Error('network unavailable'));
 await next();await next();
 assert.equal(h.event.status,'no');
 assert.equal(h.event.note,'old');
 assert.deepEqual(Array.from(h.event.no),['Te']);
 assert.equal(h.saved?.value,undefined);
 assert.equal(h.alerts.get('ccRsvpSaveError')?.hidden,false);
 assert.equal(h.counters.events,1);
});
test('rapid changes before first request starts send only latest desired status',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','first');
 h.ctx.persist(h.event,'no','last');
 await next();
 assert.equal(h.writes.length,1);
 assert.equal(h.writes[0].status,'no');
 h.writes[0].resolve();await next();
 assert.equal(h.event.status,'no');
});
test('first in-flight success followed by latest failure restores last acknowledged value',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','first');await next();
 h.ctx.persist(h.event,'no','second');
 h.writes[0].resolve();await next();
 assert.equal(h.writes.length,2);
 h.writes[1].reject(new Error('RLS'));
 await next();await next();
 assert.equal(h.event.status,'yes');
 assert.equal(h.event.note,'first');
});
test('older failed in-flight request cannot undo the most recent selection',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','old');await next();
 h.ctx.persist(h.event,'no','new');
 h.writes[0].reject(new Error('old request failed'));await next();
 assert.equal(h.event.status,'no');
 assert.equal(h.writes.length,2);
 h.writes[1].resolve();await next();
 assert.equal(h.event.status,'no');
 assert.equal(h.alerts.size,0);
});
test('non-remote/demo still calls the original persistence without network access',()=>{
 const h=makeHarness(false);
 h.ctx.persist(h.event,'yes','demo');
 assert.equal(h.counters.old,1);
 assert.equal(h.writes.length,0);
 assert.equal(h.event.status,'yes');
});
test('different events may save concurrently without waiting for each other',async()=>{
 const h=makeHarness();
 const other={id:'other-event',status:null,note:'',yes:[],no:[],unknown:[]};
 h.ctx.persist(h.event,'yes','');
 h.ctx.persist(other,'no','');
 await next();
 assert.equal(h.writes.length,2);
 h.writes[0].resolve();h.writes[1].resolve();await next();
 assert.equal(h.event.status,'yes');
 assert.equal(other.status,'no');
});

test('a later confirmed RSVP clears the warning only after its save succeeds',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','first');await next();
 h.writes[0].reject(new Error('offline'));await next();await next();
 assert.equal(h.alerts.get('ccRsvpSaveError').hidden,false);
 h.ctx.persist(h.event,'no','retried');await next();
 assert.equal(h.alerts.get('ccRsvpSaveError').hidden,false);
 h.writes[1].resolve();await next();await next();
 assert.equal(h.event.status,'no');
 assert.equal(h.alerts.get('ccRsvpSaveError').hidden,true);
});
test('a failed event does not roll back a successfully saved different event',async()=>{
 const h=makeHarness();
 const other={id:'other-event',status:null,note:'',yes:[],no:[],unknown:[]};
 h.ctx.persist(h.event,'yes','failed');
 h.ctx.persist(other,'no','confirmed');
 await next();
 assert.equal(h.writes.length,2);
 h.writes[0].reject(new Error('permission denied'));
 h.writes[1].resolve();
 await next();await next();
 assert.equal(h.event.status,null);
 assert.equal(other.status,'no');
 assert.equal(h.saved['other-event'].status,'no');
 assert.equal(h.alerts.get('ccRsvpSaveError').hidden,false);
});
test('superseded queued edits discard intermediate statuses and keep the final note',async()=>{
 const h=makeHarness();
 h.ctx.persist(h.event,'yes','original');await next();
 h.ctx.persist(h.event,'no','intermediate');
 h.ctx.persist(h.event,'yes','final note');
 h.writes[0].resolve();await next();
 assert.equal(h.writes.length,2);
 assert.equal(h.writes[1].status,'yes');
 assert.equal(h.writes[1].note,'final note');
 h.writes[1].resolve();await next();await next();
 assert.equal(h.event.status,'yes');
 assert.equal(h.event.note,'final note');
 assert.equal(h.saved[h.event.id].note,'final note');
});

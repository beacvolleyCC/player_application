'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('async function ccLoadMrszPlayerPhoto_(){');
const end=app.indexOf('let ccMrszPlayerMenGroup_=',start);
assert.ok(start>=0&&end>start,'Missing exact Player competition loader');
const block=app.slice(start,end);
const A='Férfi Budapest I. osztály – A csoport';
function thenable(value,rejectInstead=false){
  // Actual Supabase PostgrestBuilder is PromiseLike (has then, not catch).
  return {then(resolve,reject){
    if(rejectInstead) return reject(value);
    return resolve(value);
  }};
}
function harness(userResult=thenable({data:[{competitionLabel:A}],error:null})){
 const snapshot={data:{matches:[],fixtures:[{competitionLabel:A}],tables:[{competitionLabel:A,rows:[{teamName:'A team'}]}]},error:null};
 const requests=[],renders=[];
 const ctx=vm.createContext({
  Promise,
  ccSupabase:{rpc(name){
    requests.push(name);
    switch(name){
      case 'cc_player_competition_mrsz_snapshot_v2':return thenable(snapshot);
      case 'cc_player_competition_source_matches_effective_v1':return thenable({data:[{competitionLabel:A}],error:null});
      case 'cc_player_competition_user_schedule_v1':return userResult;
      default:throw Error('Unexpected RPC '+name);
    }
  }},
  SUPABASE_ENABLED:true,
  ccMrszPlayerPhoto_:{loaded:false,loading:false,error:'',matches:[],fixtures:[],tables:[],sourceMatches:[],userMatches:[]},
  plannerSection:'standings',
  renderPlanner:()=>renders.push('render')
 });
 vm.runInContext(block+';this.runCompetitionLoader=ccLoadMrszPlayerPhoto_;',ctx);
 return {ctx,requests,renders,run:ctx.runCompetitionLoader};
}
test('All competition panels load from Supabase thenables without .catch()',async()=>{
 const h=harness();
 await h.run();
 assert.equal(h.ctx.ccMrszPlayerPhoto_.error,'');
 assert.equal(h.ctx.ccMrszPlayerPhoto_.loaded,true);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.loading,false);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.tables[0].competitionLabel,A);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.fixtures[0].competitionLabel,A);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.userMatches[0].competitionLabel,A);
 assert.deepEqual(h.requests,[
  'cc_player_competition_mrsz_snapshot_v2',
  'cc_player_competition_source_matches_effective_v1',
  'cc_player_competition_user_schedule_v1'
 ]);
 assert.equal(h.renders.length,1);
});
test('An optional user fixture RPC rejection retains official A-group standings',async()=>{
 const h=harness(thenable(new Error('network connection lost'),true));
 await h.run();
 assert.equal(h.ctx.ccMrszPlayerPhoto_.error,'');
 assert.equal(h.ctx.ccMrszPlayerPhoto_.loaded,true);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.tables[0].competitionLabel,A);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.sourceMatches.length,1);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.userMatches.length,0);
});
test('An RPC error response preserves fallback official competition data',async()=>{
 const h=harness(thenable({data:null,error:{message:'permission denied'}}));
 await h.run();
 assert.equal(h.ctx.ccMrszPlayerPhoto_.error,'');
 assert.equal(h.ctx.ccMrszPlayerPhoto_.tables[0].competitionLabel,A);
 assert.equal(h.ctx.ccMrszPlayerPhoto_.userMatches.length,0);
});

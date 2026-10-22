import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../calendar-subscription.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function fixture({configured=true,failStatus=false,flag=true}={}){
  const nodes={};
  for(const id of ['calendarSubscriptionPanel','ccCalendarScope','ccCalendarGenerate',
    'ccCalendarCopy','ccCalendarRevoke','ccCalendarApple','ccCalendarSubscriptionStatus',
    'openSettingsBtn','settingsDialog']) {
    const node={id,disabled:false,hidden:false,href:'',textContent:'',dataset:{},listeners:{},
      addEventListener(type,fn){this.listeners[type]=fn;},
      removeAttribute(name){if(name==='href')this.href='';},
      querySelector(selector){return selector==='option[value="team"]'?this.teamOption:null;},
      teamOption:{disabled:false},
      async fire(type){return await this.listeners[type]?.({type,target:this});}
    };
    nodes[id]=node;
  }
  nodes.ccCalendarScope.value='mine';
  const calls=[], copied=[],teamId='10000000-0000-4000-8000-000000000001',token='a'.repeat(64);
  const client={rpc:async(name,args)=>{
    calls.push({name,args});
    if(name==='cc_player_calendar_token_status_v1')return failStatus?{error:{message:'not deployed'}}:{data:{active:false}};
    if(name==='cc_player_calendar_token_rotate_v1')return {data:{token}};
    if(name==='cc_player_calendar_token_revoke_v1')return {data:true};
    throw Error('unexpected '+name);
  }};
  const context={
    document:{getElementById:id=>nodes[id]||null},
    navigator:{clipboard:{async writeText(x){copied.push(x);}}},
    window:{confirm:()=>true,CLUB_CONTROL_CONFIG:{CALENDAR_SUBSCRIPTION_ENABLED:flag}},
    URL,ccSupabase:configured?client:null,
    ccSupabaseConfigured_:()=>configured,
    ccConfig_:()=>({SUPABASE_URL:'https://example.supabase.co'}),
    currentTeamData:{id:teamId}
  };
  vm.runInNewContext(code,context,{filename:'calendar-subscription.js'});
  return {nodes,calls,copied,teamId,token};
}
test('separate subscription does not remove legacy one-off export',()=>{
 assert.match(html,/id="calendarExportAppleBtn"/);
 assert.match(html,/id="calendarExportGoogleBtn"/);
 assert.match(html,/id="calendarSubscriptionPanel"/);
 assert.match(html,/calendar-subscription\.js\?v=/);
 assert.ok(!/localStorage|sessionStorage|console\.|document\.cookie/.test(code),'never persist/log bearer token');
});
test('create, real webcal URL, copy, close clears secret',async()=>{
 const {nodes,calls,copied,token}=fixture();
 await nodes.openSettingsBtn.fire('click');
 assert.equal(nodes.ccCalendarGenerate.disabled,false);
 await nodes.ccCalendarGenerate.fire('click');
 assert.equal(calls.at(-1).name,'cc_player_calendar_token_rotate_v1');
 assert.equal(calls.at(-1).args.p_scope,'mine');
 assert.equal(nodes.ccCalendarApple.hidden,false);
 assert.equal(nodes.ccCalendarApple.href,'webcal://example.supabase.co/functions/v1/cc-calendar?token='+token);
 await nodes.ccCalendarCopy.fire('click');
 assert.equal(copied[0],'https://example.supabase.co/functions/v1/cc-calendar?token='+token);
 await nodes.settingsDialog.fire('close');
 assert.equal(nodes.ccCalendarApple.hidden,true);
 assert.equal(nodes.ccCalendarApple.href,'');
});
test('team choice uses real team UUID, revoke removes link',async()=>{
 const {nodes,calls,teamId}=fixture();
 nodes.ccCalendarScope.value='team';
 await nodes.ccCalendarScope.fire('change');
 await nodes.ccCalendarGenerate.fire('click');
 assert.equal(calls.at(-1).args.p_team_id,teamId);
 await nodes.ccCalendarRevoke.fire('click');
 assert.equal(calls.at(-1).name,'cc_player_calendar_token_revoke_v1');
 assert.equal(nodes.ccCalendarApple.hidden,true);
});
test('unavailable backend must disable issuing tokens; legacy export still present',async()=>{
 const {nodes}=fixture({failStatus:true});
 await nodes.openSettingsBtn.fire('click');
 assert.equal(nodes.ccCalendarGenerate.disabled,true);
 assert.match(nodes.ccCalendarSubscriptionStatus.textContent,/nem érhető el/);
 assert.match(html,/calendarExportAppleBtn/);
});

test('subscription is hidden by default until explicit backend release flag',async()=>{
 const config=fs.readFileSync(new URL('../config.js',import.meta.url),'utf8');
 assert.match(config,/CALENDAR_SUBSCRIPTION_ENABLED: false/);
 assert.match(html,/id="calendarSubscriptionPanel" hidden/);
 const {nodes,calls}=fixture({flag:false});
 assert.equal(nodes.calendarSubscriptionPanel.hidden,true);
 assert.equal(Object.keys(nodes.ccCalendarGenerate.listeners).length,0);
 assert.equal(calls.length,0);
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
const expected=[
 'cc_player_competition_standings_v1',
 'cc_player_competition_league_insights_v1',
 'cc_player_competition_insights_v1'
];
test('Player TEST calls all three competition read RPC contracts',()=>{
 for(const fn of expected)
  assert.ok(app.includes(".rpc('"+fn+"'"),'missing Player RPC caller '+fn);
});
test('Player sends both selected contextTeamId and sourceTeamId when drilling into one team',()=>{
 assert.match(app,/p_context_team_id:target\.contextTeamId/);
 assert.match(app,/p_source_team_id:target\.sourceTeamId/);
 assert.match(app,/p_context_team_id:ctx\.contextTeamId/);
});
test('Player remains isolated in demo mode until separate staging Auth and RLS sign-in pass',()=>{
 assert.match(config,/DATA_BACKEND:'demo'/);
 assert.match(config,/SUPABASE_URL:''/);
 assert.match(config,/SUPABASE_PUBLISHABLE_KEY:''/);
 assert.match(config,/PUSH_ENABLED:false/);
 assert.doesNotMatch(config,/snqsxlyhontaepembaic|service_role|sb_secret_/i);
});

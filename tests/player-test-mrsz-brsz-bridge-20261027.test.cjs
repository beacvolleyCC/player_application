'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const cfg=fs.readFileSync(path.join(root,'config.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('Player has three independent competition bridge RPC callers',()=>{
  for(const fn of [
    'cc_player_competition_mrsz_snapshot_v2',
    'cc_player_competition_source_matches_effective_v1',
    'cc_player_competition_user_schedule_v1'
  ]) assert.ok(js.includes(".rpc('"+fn+"'"), 'missing TEST contract '+fn);
});
test('MRSZ source, BRSZ source and user schedule are kept separate',()=>{
  assert.match(js,/sourceMatches:Array\.isArray\(sourceMatches\)\?sourceMatches:\[\]/);
  assert.match(js,/userMatches:!userError&&Array\.isArray\(userMatches\)\?userMatches:\[\]/);
  assert.match(js,/canonicalMatches:Array\.isArray\(p\.canonicalMatches\)\?p\.canonicalMatches:\[\]/);
  assert.match(js,/if\(error\)throw error/);
  assert.match(js,/if\(sourceError\)throw sourceError/);
});
test('TEST PWA remains DEMO and cannot use LIVE or push',()=>{
  assert.match(cfg,/DATA_BACKEND:'demo'/);
  assert.match(cfg,/SUPABASE_URL:''/);
  assert.match(cfg,/SUPABASE_PUBLISHABLE_KEY:''/);
  assert.match(cfg,/PUSH_ENABLED:false/);
  assert.match(html,/CC TEST · DEMÓ · NEM ÉLES/);
  assert.doesNotMatch(cfg,/snqsxlyhontaepembaic|service_role|sb_secret_/i);
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','match-sheet-player.js'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
test('Player calls its own read-only RPC',()=>{
 assert.match(source,/cc_player_match_sheet_read_v1/);
 assert.doesNotMatch(source,/cc_manager_match_sheet_/);
});
test('Player renders text safely',()=>{
 assert.match(source,/textContent/);
 assert.doesNotMatch(source,/innerHTML/);
});
test('Match action requires authenticated Supabase connection',()=>{
 assert.match(app,/e\.type==='Meccs'&&window\.CCPlayerMatchSheet&&SUPABASE_ENABLED&&ccSupabase/);
});

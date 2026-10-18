'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('app.js','utf8');
test('Player loads new source independently and retains current fallback',()=>{
 const start=js.indexOf('async function ccLoadMrszPlayerPhoto_');
 const end=js.indexOf('let ccMrszPlayerMenGroup_',start);
 const code=js.slice(start,end);
 assert.match(code,/cc_player_competition_user_schedule_v1/);
 assert.match(code,/try\s*\{/);
 assert.match(code,/userSchedule/);
 assert.match(code,/sourceMatches/);
});
test('Player league uses revised full schedule and preserves manual source overrides',()=>{
 const start=js.indexOf('function ccMrszPlayerAllLeagueMatches_');
 const end=js.indexOf('// Preserve unconfirmed BEAC',start);
 const code=js.slice(start,end);
 assert.ok(code.includes("user.filter(m=>m._ccSourceKind==='fixture')"));
 assert.ok(code.includes("oldManual"));
 assert.ok(code.includes("m._ccManualOverride"));
 assert.ok(code.includes("ccPlayerMatchTeamKey_"));
 assert.ok(code.includes("localSort"));
});
test('Meeting and optional player notes only appear on BEAC fixtures, and output is escaped',()=>{
 const start=js.indexOf('function ccPlayerScoreboardHtml_(');
 const end=js.indexOf('function ccMrszPlayerLeagueScheduleHtml_(',start);
 const code=js.slice(start,end);
 assert.ok(code.includes("beac&&note?"));
 assert.ok(code.includes("beac&&m.status!=='played'&&meeting.time?"));
 assert.ok(code.includes("escapeHtml_(note)"));
 assert.ok(code.includes("escapeHtml_(m.meetingPlace)"));
});

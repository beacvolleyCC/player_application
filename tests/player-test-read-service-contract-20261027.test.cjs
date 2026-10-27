'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repo=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const app=read('app.js'),conf=read('config.js'),html=read('index.html');
const newReadRpcs=[
  'cc_player_avatar_team_directory_v1',
  'cc_player_profile_data',
  'cc_player_notifications_v1',
  'cc_player_medical_status_v1'
];
test('all four new TEST read-service contracts have matching Player callers',()=>{
 for(const fn of newReadRpcs){
   assert.ok(app.includes(".rpc('"+fn+"'"),"Player call missing: "+fn);
 }
});
test('TEST frontend remains disconnected until Auth and backend acceptance',()=>{
 assert.match(conf,/DATA_BACKEND:'demo'/);
 assert.match(conf,/SUPABASE_URL:''/);
 assert.match(conf,/PUSH_ENABLED:false/);
 assert.doesNotMatch(conf,/snqsxlyhontaepembaic|service_role|sb_secret_/i);
 assert.match(html,/CC TEST · DEMÓ · NEM ÉLES/);
});
test('read services remain separate from writes and external push registration',()=>{
 assert.match(app,/cc_player_notification_read_v1/);
 assert.match(app,/cc_player_notification_dismiss_v1/);
 assert.match(app,/cc_player_medical_appointment_save_v1/);
 assert.match(app,/cc_player_push_register_v1/);
 assert.match(conf,/PUSH_ENABLED:false/);
});

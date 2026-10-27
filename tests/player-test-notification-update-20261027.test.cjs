'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
test('Player calls user-scoped TEST notification read and dismiss RPCs',()=>{
 assert.match(app,/\.rpc\('cc_player_notification_read_v1',\{p_notification_id:id\}\)/);
 assert.match(app,/\.rpc\('cc_player_notification_dismiss_v1',\{p_notification_id:id\}\)/);
});
test('TEST remains DEMO-only until real TEST Auth accounts and app acceptance',()=>{
 assert.match(config,/DATA_BACKEND:'demo'/);
 assert.match(config,/PUSH_ENABLED:false/);
 assert.match(config,/SUPABASE_URL:''/);
 assert.match(config,/SUPABASE_PUBLISHABLE_KEY:''/);
 assert.doesNotMatch(config,/snqsxlyhontaepembaic|service_role|sb_secret_/i);
});
test('TEST update RPCs are independent from outbound notification registration',()=>{
 assert.match(app,/cc_player_notifications_v1/);
 assert.match(app,/cc_player_notification_read_v1/);
 assert.match(app,/cc_player_notification_dismiss_v1/);
});

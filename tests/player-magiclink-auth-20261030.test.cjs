'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'scripts/build-cloudflare-test.cjs'),'utf8');
const origin='https://cc-player-test-beac.elteroplabda.workers.dev';
const start=app.indexOf('function ccPlayerMagicLinkRedirect_(){');
const end=app.indexOf('function showLoginStep(step){',start);
assert.ok(start>=0 && end>start);
const funcs=app.slice(start,end);
function harness(host=origin,enabled=true){
 const map={};for(const k of ['loginEmailStep','loginCodeStep','requestCodeBtn','loginCode','verifyCodeBtn','resendCodeBtn']) map[k]={textContent:'',hidden:false,querySelector(selector){const key=this===map.loginEmailStep?'email':'sent';return (map[key+selector] ||= {textContent:'',hidden:false})}};
 const ctx={location:{origin:host},SUPABASE_ENABLED:enabled,document:{getElementById:k=>map[k]||null}};
 const api=vm.runInNewContext(funcs+'\n({ccPlayerMagicLinkRedirect_,ccPlayerLoginPresentation_})',ctx);
 return {api,map};
}
test('default Supabase Magic Link callback is exact and TEST-only',()=>{
 const h=harness();
 assert.equal(h.api.ccPlayerMagicLinkRedirect_(),origin+'/');
 assert.throws(()=>harness('https://example.org').api.ccPlayerMagicLinkRedirect_(),/csak a külön Player TEST/);
});
test('request/resend both set explicit redirect and never create new Auth users',()=>{
 assert.equal((app.match(/emailRedirectTo:ccPlayerMagicLinkRedirect_\(\)/g)||[]).length,2);
 assert.equal((app.match(/shouldCreateUser:false,emailRedirectTo:ccPlayerMagicLinkRedirect_\(\)/g)||[]).length,2);
 assert.doesNotMatch(app,/shouldCreateUser:true/);
});
test('Supabase flow shows link rather than numeric code, preserving authentication',()=>{
 const {api,map}=harness();api.ccPlayerLoginPresentation_();
 assert.equal(map.requestCodeBtn.textContent,'Belépési link kérése');
 assert.equal(map.verifyCodeBtn.hidden,true);
 assert.equal(map.loginCode.hidden,true);
 assert.match(map['sentp'].textContent,/Sign in/);
 assert.match(map.resendCodeBtn.textContent,/Új link/);
 assert.match(app,/auth.getSession\(\)/);
 assert.match(app,/cc_player_bootstrap_filtered_v1/);
});
test('legacy non-Supabase mode unchanged',()=>{
 const {api,map}=harness(origin,false);api.ccPlayerLoginPresentation_();
 assert.equal(map.verifyCodeBtn.hidden,false);
 assert.equal(map.loginCode.hidden,false);
});
test('TEST Player build remains isolated and disables outbound push',()=>{
 assert.match(builder,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.match(builder,/PUSH_ENABLED:false/);
 assert.match(builder,/DATA_BACKEND:'supabase'/);
 assert.doesNotMatch(builder,/https:\/\/snqsxlyhontaepembaic\.supabase\.co/);
});
test('Player TEST PWA shell and SW cache use matching fresh Magic Link version',()=>{
 const version='test-20261030-player-magiclink-v1';
 assert.ok(html.includes('app.js?v='+version));
 assert.ok(html.includes('styles.css?v='+version));
 assert.ok(html.includes('statistics.js?v='+version));
 assert.ok(sw.includes("const CACHE='cc-player-test-"+version+"'"));
 assert.ok(sw.includes('app.js?v='+version));
});

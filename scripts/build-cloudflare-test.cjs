'use strict';
// Minimal, allowlisted static site for Cloudflare Pages Free; no external dependencies.
// Invoke: node scripts/build-cloudflare-test.cjs ; build output: dist-test
const fs=require('node:fs');
const path=require('node:path');
const source=path.resolve(__dirname,'..');
const dest=path.join(source,'dist-test');
const files=["index.html","config.js","app.js","sw.js","manifest.webmanifest","styles.css","statistics.css","statistics.js","competition-context-catalog.js"];
const dirs=['assets','icons'];
const mediaExt=new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif']);
const assert=(truth,msg)=>{if(!truth)throw Error('CC PLAYER TEST build blocked: '+msg)};
const read=p=>fs.readFileSync(path.join(source,p),'utf8');
const conf=read('config.js');
const html=read('index.html');
const sw=read('sw.js');
const app=read('app.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
assert(!/snqsxlyhontaepembaic|sb_secret_|service_role/i.test(conf+html+sw+app),'production ref or privileged credentials detected');
assert(manifest.short_name==='CC TEST','missing unique TEST app identity');
assert(/test/i.test(manifest.name),'TEST missing from PWA name');
assert(/test/i.test(html),'TEST missing from HTML banner');
assert(/DATA_BACKEND:'demo'/.test(conf)&&/PUSH_ENABLED:false/.test(conf),"Player must stay isolated DEMO without push");
assert(/SUPABASE_URL:''/.test(conf)&&/SUPABASE_PUBLISHABLE_KEY:''/.test(conf)&&/API_URL:''/.test(conf),"Player TEST must not have DB or API credentials");
assert(/cc-player-test-|cc-test-/i.test(sw),"Player test-only service worker cache not found");
assert(!/window\.location\s*=\s*['"]https?:|https?:\/\/snqsxlyhontaepembaic\.supabase\.co/i.test(app+html),'redirect or LIVE endpoint');
if(fs.existsSync(dest))fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
let count=0,bytes=0;
function copyFile(relative){
  const src=path.join(source,relative);
  const stat=fs.lstatSync(src);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'unexpected nonfile: '+relative);
  assert(stat.size<25*1024*1024,'asset larger than Pages Free limit: '+relative);
  const target=path.join(dest,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(src,target);
  count++;bytes+=stat.size;
}
for(const f of files)copyFile(f);
function visit(folder){
  for(const dirent of fs.readdirSync(path.join(source,folder),{withFileTypes:true})){
    const sub=folder+'/'+dirent.name;
    assert(!dirent.isSymbolicLink(),'symlinks not allowed: '+sub);
    if(dirent.isDirectory())visit(sub);
    else{
      assert(dirent.isFile()&&mediaExt.has(path.extname(dirent.name).toLowerCase()),'only approved public images allowed: '+sub);
      copyFile(sub);
    }
  }
}
for(const d of dirs)visit(d);
const refs=[...html.matchAll(/(?:src|href)\s*=\s*["'](\.\/[A-Za-z0-9._/?=&%-]+)["']/g)].map(m=>m[1]);
for(const href of refs){
  const relative=href.slice(2).split('?')[0].split('#')[0];
  assert(fs.existsSync(path.join(dest,relative)),'missing HTML dependency: '+relative);
}
for(const entry of manifest.icons||[]){
  const name=entry.src.replace(/^\.\//,'').split('?')[0];
  assert(fs.existsSync(path.join(dest,name)),'missing PWA icon: '+name);
}
fs.writeFileSync(path.join(dest,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n','utf8');
fs.writeFileSync(path.join(dest,'robots.txt'),'User-agent: *\nDisallow: /\n','utf8');
assert(!fs.existsSync(path.join(dest,'data'))&&!fs.existsSync(path.join(dest,'supabase'))
 &&!fs.existsSync(path.join(dest,'docs'))&&!fs.existsSync(path.join(dest,'tests'))
 &&!fs.existsSync(path.join(dest,'.github')),'unexpected developer/private data copied');

// Publish only the isolated TEST bundle as connected STAGING.
// The source stays in offline DEMO mode for safe local inspection.
const STAGING_URL='https://szzoubvhlwnojtzqjebc.supabase.co';
const stageConfig="// BUILT FOR CC PLAYER TEST. Public/publishable API key, not a server secret.\nwindow.CLUB_CONTROL_CONFIG=Object.freeze({\n API_URL:'', DATA_BACKEND:'supabase', SUPABASE_URL:'https://szzoubvhlwnojtzqjebc.supabase.co',\n SUPABASE_PUBLISHABLE_KEY:'sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB', PUSH_ENABLED:false, VAPID_PUBLIC_KEY:''\n});\n";
assert(/^sb_publishable_/.test("sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB"),'TEST publishable key missing');
assert(stageConfig.includes(STAGING_URL)&&!stageConfig.includes('snqsxlyhontaepembaic'),'TEST endpoint invariant');
fs.writeFileSync(path.join(dest,'config.js'),stageConfig,'utf8');
let stageHtml=fs.readFileSync(path.join(dest,'index.html'),'utf8');
assert(stageHtml.includes("script-src 'self';")&&stageHtml.includes("connect-src 'none';"),'offline CSP baseline modified');
stageHtml=stageHtml.replace("script-src 'self';","script-src 'self' https://cdn.jsdelivr.net;");
stageHtml=stageHtml.replace("connect-src 'none';",`connect-src 'self' ${STAGING_URL} wss://szzoubvhlwnojtzqjebc.supabase.co;`);
assert(stageHtml.includes('<script src="./config.js'),'config script insertion point missing');
stageHtml=stageHtml.replace('<script src="./config.js', '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0"></script>\n  <script src="./config.js');
assert(stageHtml.includes('CC TEST · DEMÓ · NEM ÉLES'),'source TEST banner missing');
stageHtml=stageHtml.replace('CC TEST · DEMÓ · NEM ÉLES','CC TEST · STAGING · NEM ÉLES');
fs.writeFileSync(path.join(dest,'index.html'),stageHtml,'utf8');
assert(stageHtml.includes('CC TEST · STAGING · NEM ÉLES'),'TEST banner not visible');
assert(!/https?:\/\/snqsxlyhontaepembaic\.supabase\.co/.test(stageHtml+stageConfig),'production endpoint in publish output');

console.log('PASS: PLAYER TEST static-only Pages bundle:',count,'files,',bytes,'bytes; target=dist-test');

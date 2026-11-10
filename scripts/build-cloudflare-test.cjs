/* Build an isolated static Player preview for Cloudflare Pages TEST only.
 * Cloudflare Pages: build command "node scripts/build-cloudflare-test.cjs", output "dist-test".
 * Never publish this directory on the LIVE project: its config points at the TEST database. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'dist-test');
const files=[
 'index.html','config.js','app.js','statistics.js','competition-context-catalog.js',
 'i18n.js','i18n-static.js','i18n-dom.js',
 'styles.css','statistics.css','sw.js','manifest.webmanifest'
];
const dirs=['icons','assets'];
const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
if(!config.includes('szzoubvhlwnojtzqjebc.supabase.co'))throw Error('TEST Supabase URL is missing');
if(config.includes('snqsxlyhontaepembaic.supabase.co'))throw Error('Refusing to build against LIVE Supabase');
if(!/PUSH_ENABLED:\s*false/.test(config))throw Error('TEST push notifications must remain disabled during translation QA');
if(!/API_URL:\s*''/.test(config))throw Error('Legacy LIVE API must remain disabled');
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
for(const relative of files){
 const source=path.join(root,relative);
 if(!fs.existsSync(source))throw Error('Missing site asset: '+relative);
 fs.copyFileSync(source,path.join(target,relative));
}
for(const dir of dirs){
 const source=path.join(root,dir);
 if(!fs.existsSync(source))throw Error('Missing asset directory: '+dir);
 fs.cpSync(source,path.join(target,dir),{recursive:true});
}
const html=fs.readFileSync(path.join(target,'index.html'),'utf8');
for(const file of ['config.js','app.js','statistics.js','i18n.js','i18n-static.js','i18n-dom.js']){
 if(!html.includes('./'+file+'?v='))throw Error('HTML does not load versioned '+file);
}
console.log('Isolated Player TEST site ready:',target);

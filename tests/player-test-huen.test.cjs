'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const i18n=require('../i18n.js');
const ui=require('../i18n-static.js');
test('Player TEST has an enabled English selector and all scripts loaded in order',()=>{
 const html=read('index.html');
 assert.match(html,/<option value="en">English<\/option>/);
 assert.doesNotMatch(html,/value="en"\s+disabled/);
 const files=['i18n.js','i18n-static.js','app.js','rsvp-reliability.js','statistics.js','i18n-dom.js'];
 for(const name of files)assert.ok(html.includes('src="./'+name),name+' missing from TEST page');
 assert.ok(html.indexOf('i18n.js?v=')<html.indexOf('app.js?v='));
 assert.ok(html.indexOf('i18n-static.js?v=')<html.indexOf('app.js?v='));
 assert.ok(html.indexOf('i18n-dom.js?v=')>html.indexOf('statistics.js?v='));
 assert.match(html,/CC TEST · DEMÓ · NEM ÉLES/);
});
test('Login, training, matches, roster, stats and test-only match sheet translate',()=>{
 const examples={
  'Belépés':'Sign in',
  'Jövök':"I'll attend",
  'Nem jövök':"I can't attend",
  'Névsor':'Team roster',
  'Mérkőzések':'Matches',
  'Tabella':'League standings',
  'Statisztikák':'Statistics',
  'CC jegyzőkönyv megtekintése':'View CC match report',
  'Jegyzőkönyv betöltése…':'Loading match report…',
  'A jelentkezés mentése sikertelen volt. Az előző állapotot visszaállítottuk.':'Could not save your attendance response. Your previous response has been restored.',
  '15 fő':'15 players',
  'Jönnek (5)':'Attending (5)',
  '3 / 12 meccs':'3 / 12 matches',
  '1. szett: 25:22':'Set 1: 25:22',
  'Vendég #17 Kiss Anna':'Away #17 Kiss Anna'
 };
 for(const [hu,en] of Object.entries(examples))assert.equal(ui.translateStatic(hu,'en'),en,'Untranslated: '+hu);
 assert.equal(ui.translateStatic('Névsor','hu'),'Névsor');
 assert.equal(ui.translateStatic('Ferencz Petra','en'),'Ferencz Petra');
 assert.equal(i18n.normalizeLanguage('en-GB'),'en');
 assert.match(i18n.formatDate('2026-11-10T12:00:00Z','en',{dateStyle:'long',timeZone:'UTC'}),/10 November 2026/);
});
test('English language persists only within TEST storage and re-renders dynamic components',()=>{
 const app=read('app.js'),dom=read('i18n-dom.js');
 assert.match(app,/ccMobileTestStorage_\.getItem\('cc-player-language'\)/);
 assert.match(app,/ccMobileTestStorage_\.setItem\('cc-player-language',settings\.language\)/);
 assert.match(dom,/cc-mobile-test-20261026:cc-player-language/);
 assert.match(app,/cc-player-language-changed/);
 assert.match(app,/DateTimeFormat\(ccDisplayLocale_\(\)/);
 assert.match(app,/renderEvents\(\);[\s\S]*renderPlanner\(\);[\s\S]*renderProfileStats_\(\)/);
});
test('Built Cloudflare STAGING includes i18n assets and retains protective boundary',()=>{
 const build=read('scripts/build-cloudflare-test.cjs');
 const config=read('config.js'),sw=read('sw.js'),html=read('index.html');
 for(const file of ['i18n.js','i18n-static.js','i18n-dom.js']) {
  assert.ok(build.includes('"'+file+'"'),'builder does not allow '+file);
  assert.ok(sw.includes("'./"+file+'?v='),'offline cache missing '+file);
 }
 assert.match(config,/DATA_BACKEND:'demo'/);
 assert.match(config,/SUPABASE_URL:''/);
 assert.match(build,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.doesNotMatch(config+html+sw,/snqsxlyhontaepembaic/);
 assert.match(build,/CC TEST · STAGING · NEM ÉLES/);
 assert.match(read('rsvp-reliability.js'),/const oldPersist=persist/);
});

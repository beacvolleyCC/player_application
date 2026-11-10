'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const translate=require('../i18n.js');
const ui=require('../i18n-static.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('British English, Hungarian fallback and source-language preservation',()=>{
 assert.equal(translate.normalizeLanguage('en-GB'),'en');
 assert.equal(translate.normalizeLanguage('hu-HU'),'hu');
 assert.equal(ui.translateStatic('Jövök','en'),"I'll attend");
 assert.equal(ui.translateStatic('Nem jövök','en'),"I can't attend");
 assert.equal(ui.translateStatic('Nem jövök','hu'),'Nem jövök');
 assert.equal(ui.translateStatic('Ferencz Petra','en'),'Ferencz Petra');
 assert.equal(ui.translateStatic('BEAC – MAFC','en'),'BEAC – MAFC');
 assert.equal(ui.translateStatic('Bogdánfy Sportcsarnok','en'),'Bogdánfy Sportcsarnok');
 assert.match(translate.formatDate('2026-11-10T12:00:00Z','en',{timeZone:'UTC',dateStyle:'long'}),/10 November 2026/);
});

test('Login, profile, training, fixtures and protocol text is translated',()=>{
 const labels={
  'Fiók ellenőrzése':'Checking your account',
  'Belépés':'Sign in',
  'Személyes adatok':'Personal details',
  'Díjak és fizetések':'Fees and payments',
  'Edzések':'Training sessions',
  'Rács és naptár a teljes szezonhoz.':'List and calendar for the full season.',
  'Jönnek':'Attending',
  'Nem jönnek':'Not attending',
  'Tabella':'League standings',
  'Bajnoki mérkőzések':'League matches',
  'Statisztikák':'Statistics',
  'Jegyzőkönyv megnyitása':'Open match report',
  'Játékosok':'Players',
  'Összehasonlítás':'Comparison'
 };
 for(const [hu,en] of Object.entries(labels))
  assert.equal(ui.translateStatic(hu,'en'),en,'Missing '+hu);
});

test('Dynamic data, count inflections, dates and composite labels',()=>{
 const examples={
  '16 fő':'16 players',
  '14 meccs':'14 matches',
  'Jönnek (5)':'Attending (5)',
  'Nem jönnek (1)':'Not attending (1)',
  'Még nem jelzett (3)':'No response yet (3)',
  '3 / 12 meccs':'3 / 12 matches',
  '2. szett:':'Set 2:',
  '3–2 szett':'3–2 sets',
  '2026.11.04. · Kedd · 20:00':'04/11/2026 · Tuesday · 20:00',
  '2026. október':'October 2026',
  'Vizsgálat: holnap':'Examination: holnap'
 };
 for(const [hu,en] of Object.entries(examples))
  assert.equal(ui.translateStatic(hu,'en'),en,'Dynamic translation missing '+hu);
});

test('Live DOM language switching translates updated nodes and restores Hungarian',()=>{
 const events=[];
 const textNode={nodeType:3,nodeValue:'Jönnek (7)',parentElement:{closest:()=>null}};
 const input={nodeType:1,attrs:{placeholder:'Írd ide röviden az okát…'},
  hasAttribute(a){return Object.prototype.hasOwnProperty.call(this.attrs,a)},
  getAttribute(a){return this.attrs[a]},
  setAttribute(a,v){this.attrs[a]=v}};
 const body={nodeType:1,hasAttribute(){return false}};
 const selected={value:'hu',listeners:{},addEventListener(type,fn){this.listeners[type]=fn}};
 const store=new Map();
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}};
 const document={title:'Club Control – Versenycsapat',documentElement:{lang:'hu'},readyState:'complete',body,
  getElementById(id){return id==='settingsLanguage'?selected:null},
  createTreeWalker(){const nodes=[textNode,input];let i=-1;return {currentNode:null,nextNode(){i++;this.currentNode=nodes[i];return i<nodes.length}}}};
 let observer;
 class MutationObserver{constructor(fn){this.fn=fn;observer=this}observe(target,opts){this.options=opts}}
 class CustomEvent{constructor(name,opts){this.type=name;this.detail=opts.detail}}
 const root={CCPlayerI18n:translate,CCPlayerStaticI18n:ui,dispatchEvent(e){events.push(e.detail.language)}};
 vm.runInNewContext(read('i18n-dom.js'),{
  globalThis:root,document,localStorage,navigator:{language:'hu-HU'},
  NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},MutationObserver,CustomEvent
 });
 root.CCPlayerLanguage.setLanguage('en');
 assert.equal(textNode.nodeValue,'Attending (7)');
 assert.equal(input.attrs.placeholder,'Briefly explain why…');
 assert.equal(document.title,'Club Control – Competition team');
 assert.equal(document.documentElement.lang,'en');
 assert.equal(store.get('cc-player-language'),'en');
 textNode.nodeValue='17 fő';
 observer.fn([{type:'characterData',target:textNode}]);
 assert.equal(textNode.nodeValue,'17 players');
 input.attrs.placeholder='Nincs rögzített adat';
 observer.fn([{type:'attributes',target:input}]);
 assert.equal(input.attrs.placeholder,'No recorded data');
 root.CCPlayerLanguage.setLanguage('hu');
 assert.equal(textNode.nodeValue,'17 fő');
 assert.equal(input.attrs.placeholder,'Nincs rögzített adat');
 assert.equal(document.title,'Club Control – Versenycsapat');
 assert.deepEqual(events,['en','hu']);
 assert.equal(observer.options.attributes,true);
});

test('Persist language preference without changing stored competition enums',()=>{
 const script=read('app.js');
 assert.match(script,/language:settings\.language/);
 assert.match(script,/window\.CCPlayerLanguage\.setLanguage\(settings\.language\|\|'hu'\)/);
 assert.match(script,/cc-player-language-changed/);
 assert.match(script,/DateTimeFormat\(ccDisplayLocale_\(\)/);
 assert.match(script,/type==='Meccs'/);
 assert.match(script,/type==='Edzés'/);
 const index=read('index.html');
 assert.match(index,/<select id="settingsLanguage">/);
 assert.ok(index.indexOf('i18n.js?')<index.indexOf('i18n-static.js?'));
 assert.ok(index.indexOf('i18n-static.js?')<index.indexOf('i18n-dom.js?'));
});

test('TEST branch configuration never connects to LIVE database',()=>{
 const config=read('config.js');
 assert.match(config,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.doesNotMatch(config,/snqsxlyhontaepembaic/);
 assert.match(config,/PUSH_ENABLED:\s*false/);
 assert.match(config,/API_URL:\s*''/);
});

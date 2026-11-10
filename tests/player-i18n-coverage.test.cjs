'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ui=require('../i18n-static.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const hungarian=/[ÁÉÍÓÖŐÚÜŰáéíóöőúüű]/;
const preserved=new Set([
 '1123 Budapest, Alkotás u. 44.',
 'Bogdánfy Sportcsarnok',
 'Dr. Koltai Jenő Sportközpont',
 'Dóri','Nóri','Réka','Sára','Zsófi'
]);
test('Hungarian accented static UI literals are translated or protected proper names',()=>{
 const candidates=new Set();
 const stringLiterals=/(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/gs;
 for(const source of [read('app.js'),read('statistics.js')]){
  for(const match of source.matchAll(stringLiterals)){
   const value=(match[1]??match[2]).trim();
   if(value.length>0&&value.length<135&&hungarian.test(value)&&!/[{}<>=]/.test(value))candidates.add(value);
  }
  for(const match of source.matchAll(/>([^<>\n]{2,150})</g)){
   const value=match[1].trim();
   if(value.length<140&&hungarian.test(value)&&!value.includes('$'+'{')&&!value.includes('=>')&&!value.includes('='))candidates.add(value);
  }
 }
 const html=read('index.html');
 for(const match of html.matchAll(/>([^<>\n]{2,150})</g)){
  const value=match[1].trim();
  if(hungarian.test(value))candidates.add(value);
 }
 const missing=[...candidates].filter(value=>{
  if(preserved.has(value))return false;
  if(value.startsWith('MGR019 Player finance bridge'))return false;
  if(value.includes("'+")||value.includes("+'"))return false; // source-code concatenation, not a rendered text node
  if(value.includes('.trim().replace(')||value.includes('||/férfi/')||value.includes('|| /^BEAC Női I'))return false;
  return ui.translateStatic(value,'en')===value;
 });
 assert.deepEqual(missing.sort(),[], 'Untranslated Hungarian UI literals');
});

/* Club Control league selection behavior: real application helper execution. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const catalog=require('../competition-context-catalog.js');
const women='Női Budapest I. osztály',womenB='Női Budapest II. osztály – B csoport';
const menA='Férfi Budapest I. osztály – A csoport',menB='Férfi Budapest I. osztály – B csoport';
const matches=[women,womenB,menA,menB].map((competitionLabel,n)=>({
 competitionLabel,homeName:'Hazai '+n,awayName:'Vendég '+n,homeSourceTeamId:String(100+n*2),awaySourceTeamId:String(101+n*2)
}));
const snapshot={fixtures:matches,matches:[],tables:[{competitionLabel:menA,rows:[{position:1,teamName:'Hazai 2'}]},{competitionLabel:womenB,rows:[{position:1,teamName:'Hazai 1'}]}]};
function memory(){const x=new Map();return {getItem:k=>x.get(k)||null,setItem:(k,v)=>x.set(k,String(v)),removeItem:k=>x.delete(k)}}
test('The same observed league catalog is available to both apps',()=>{
 assert.deepEqual(catalog.build({season:'2026/27',...snapshot}).map(x=>x.competitionLabel).sort(),[women,womenB,menA,menB].sort());
});
test('Shared browser code is loaded before app and gets a fresh service-worker cache',()=>{
 assert.match(html,/competition-context-catalog\.js\?v=20261015-lc1/);
 assert.ok(html.indexOf('competition-context-catalog.js')<html.indexOf('app.js?v='));
 assert.match(sw,/competition-context-catalog\.js/);
});

function buildPlayer(mens=true){
 const begin=app.indexOf('let ccPlayerLeagueSelection_=');
 const end=app.indexOf('async function ccLoadMrszPlayerPhoto_(',begin);
 assert.ok(begin>=0&&end>begin);
 const storage=memory();
 const funcs=new Function('window','localStorage','escapeHtml_','ccMrszPlayerPhoto_','ccMrszPlayerIsMensTeam_','ccMrszPlayerIsWomen2_',
   "let ccMrszPlayerMenGroup_='B';"+app.slice(begin,end)+
   ';return {ccPlayerLeagueCatalog_,ccPlayerLeagueCurrent_,ccPlayerLeagueDefault_,ccPlayerLeagueSelectorHtml_,ccPlayerClearLeagueSelection_};')(
  {CCCompetitionContextCatalog:catalog},storage,x=>String(x??''),snapshot,()=>mens,()=>!mens);
 return{funcs,storage};
}
test('Player presents four groups and uses actual team as default',()=>{
 const {funcs}=buildPlayer();
 const picker=funcs.ccPlayerLeagueSelectorHtml_();
 assert.equal((picker.match(/<option value=/g)||[]).length,4);
 assert.equal(funcs.ccPlayerLeagueCurrent_(),menB);
});
test('Player selected competition is independent of signed-in team',()=>{
 const {funcs,storage}=buildPlayer();
 storage.setItem('cc-player-league-context-v1',menA);
 const restored=buildPlayerFromStorage(storage);
 assert.equal(restored.ccPlayerLeagueCurrent_(),menA);
});
function buildPlayerFromStorage(storage){
 const begin=app.indexOf('let ccPlayerLeagueSelection_='),end=app.indexOf('async function ccLoadMrszPlayerPhoto_(',begin);
 return new Function('window','localStorage','escapeHtml_','ccMrszPlayerPhoto_','ccMrszPlayerIsMensTeam_','ccMrszPlayerIsWomen2_',
  "let ccMrszPlayerMenGroup_='B';"+app.slice(begin,end)+';return {ccPlayerLeagueCurrent_};')(
  {CCCompetitionContextCatalog:catalog},storage,x=>String(x??''),snapshot,()=>true,()=>false);
}
test('Player never makes alphabetical sorting an official position',()=>{
 assert.match(app,/return list\.map\(row=>\(\{\.\.\.row,position:null,provisionalAlphabetical:true\}\)\)/);
 assert.match(app,/if\(externalLeague\)/);
 assert.match(app,/ccMrszPlayerMainScreenshotHtml_\(label\)/);
});

/* Club Control league selection behavior: real application helper execution. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const catalog=require('../competition-context-catalog.js');
const women='Női Budapest I. osztály',womenA='Női Budapest II. osztály – A csoport',womenB='Női Budapest II. osztály – B csoport';
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

function buildPlayer(kind='men',storage=memory()){
 const begin=app.indexOf('let ccPlayerLeagueSelection_=');
 const end=app.indexOf('async function ccLoadMrszPlayerPhoto_(',begin);
 assert.ok(begin>=0&&end>begin);
 const funcs=new Function('window','localStorage','escapeHtml_','ccMrszPlayerPhoto_','ccMrszPlayerIsMensTeam_','ccMrszPlayerIsWomen2_',
   "let ccMrszPlayerMenGroup_='B';"+app.slice(begin,end)+
   ';return {ccPlayerLeagueCatalog_,ccPlayerLeagueCurrent_,ccPlayerLeagueDefault_,ccPlayerLeagueSelectorHtml_,ccPlayerClearLeagueSelection_};')(
  {CCCompetitionContextCatalog:catalog},storage,x=>String(x??''),snapshot,()=>kind==='men',()=>kind==='women2');
 return{funcs,storage};
}
test('Men see only Budapest I/A and I/B groups and start on their group B',()=>{
 const {funcs}=buildPlayer('men');
 assert.deepEqual(funcs.ccPlayerLeagueCatalog_().map(x=>x.competitionLabel),[menA,menB]);
 const picker=funcs.ccPlayerLeagueSelectorHtml_();
 assert.equal((picker.match(/<option value=/g)||[]).length,2);
 assert.ok(!picker.includes(women));
 assert.equal(funcs.ccPlayerLeagueCurrent_(),menB);
});
test('Women I have only their own league and no unnecessary picker',()=>{
 const {funcs}=buildPlayer('women1');
 assert.deepEqual(funcs.ccPlayerLeagueCatalog_().map(x=>x.competitionLabel),[women]);
 assert.equal(funcs.ccPlayerLeagueSelectorHtml_(),'');
 assert.equal(funcs.ccPlayerLeagueCurrent_(),women);
});
test('Women II show A/B, with missing A marked as empty source (not invented standings)',()=>{
 const {funcs}=buildPlayer('women2');
 const groups=funcs.ccPlayerLeagueCatalog_();
 assert.deepEqual(groups.map(x=>x.competitionLabel),[womenA,womenB]);
 assert.equal(groups[0].standingsStatus,'missing');
 assert.equal(groups[0].fixtureCount,0);
 assert.equal(funcs.ccPlayerLeagueCurrent_(),womenB);
 assert.equal((funcs.ccPlayerLeagueSelectorHtml_().match(/<option value=/g)||[]).length,2);
});
test('Saved selections from another BEAC team cannot show an unauthorised competition',()=>{
 const saved=memory();
 saved.setItem('cc-player-league-context-v1',menA);
 assert.equal(buildPlayer('men',saved).funcs.ccPlayerLeagueCurrent_(),menA);
 assert.equal(buildPlayer('women1',saved).funcs.ccPlayerLeagueCurrent_(),women);
 assert.equal(buildPlayer('women2',saved).funcs.ccPlayerLeagueCurrent_(),womenB);
 saved.setItem('cc-player-league-context-v1',womenA);
 assert.equal(buildPlayer('men',saved).funcs.ccPlayerLeagueCurrent_(),menB);
 assert.equal(buildPlayer('women2',saved).funcs.ccPlayerLeagueCurrent_(),womenA);
});
test('Tabella is third, statistics fourth and profile last; all are main views',()=>{
 const nav=html.slice(html.indexOf('<nav class="bottom-nav">'),html.indexOf('</nav>',html.indexOf('<nav class="bottom-nav">')));
 const order=[...nav.matchAll(/data-view="([^"]+)" class="nav-btn/g)].map(x=>x[1]);
 assert.deepEqual(order,['homeView','plannerView','standingsView','statisticsView','profileView']);
 assert.ok(html.includes('id="standingsView" class="view'));
 assert.ok(html.includes('id="standingsContent"'));
 assert.ok(nav.includes('cc-icon-standings'));
  assert.ok(nav.includes('cc-icon-statistics'));
  assert.ok(html.includes('id="statisticsContent"'));
  assert.ok(html.includes('id="statisticsView"'));
 assert.ok(!html.includes('id="plannerStandingsBtn"'));
 assert.ok(app.includes("const CC_PAGE_VIEWS=['homeView','plannerView','standingsView','statisticsView','profileView']"));
 assert.ok(app.includes("if(viewId==='standingsView'||viewId==='statisticsView'||viewId==='plannerView')renderPlanner();"));
 assert.ok(app.includes("if(viewId==='standingsView'&&previousView!=='standingsView')"));
 assert.ok(app.includes("selectedStandingsRowTeamId='all';"));
 assert.ok(app.includes('standingsContent.innerHTML=ccPlayerLeagueSelectorHtml_()+renderCompetitionStandings_()'));
 assert.ok(!app.includes("document.getElementById('plannerStandingsBtn')"));
});
test('Player never makes alphabetical sorting an official position',()=>{
 assert.match(app,/return list\.map\(row=>\(\{\.\.\.row,position:null,provisionalAlphabetical:true\}\)\)/);
 assert.match(app,/if\(externalLeague\)/);
 assert.match(app,/ccMrszPlayerMainScreenshotHtml_\(label\)/);
});

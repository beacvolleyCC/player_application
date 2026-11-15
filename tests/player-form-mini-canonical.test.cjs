const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const start=src.indexOf('function ccPlayerFormTeam_(');
const end=src.indexOf('function ccPlayerScoreboardHtml_(',start);
assert.ok(start>=0&&end>start);
const ctx={
 ccMrszPlayerPhoto_:{canonicalFormCards:[]},
 ccPlayerMatchTeamKey_:name=>String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''),
 escapeHtml_:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
};
vm.createContext(ctx);
vm.runInContext(src.slice(start,end)+'\nthis.lookup=ccPlayerFormTeam_;this.draw=ccPlayerFormLine_;',ctx);
const women='Női Budapest II. osztály – B csoport';
const men='Férfi Budapest I. osztály – B csoport';
test('Player form uses only its one shared league-specific canonical record',()=>{
 ctx.ccMrszPlayerPhoto_.canonicalFormCards=[
  {competitionLabel:women,teamName:'BEAC II.',rank:2,played:2,trend:'flat',trendBasis:'last_match_vs_previous_match_limited',lastFive:['W','W']},
  {competitionLabel:men,teamName:'BEAC',rank:1,played:3,trend:'up',trendBasis:'last_match_vs_previous_match_limited',lastFive:['W','L','W']}
 ];
 assert.equal(ctx.lookup(women,'BEAC II.').rank,2);
 assert.equal(ctx.lookup(men,'BEAC').rank,1);
 assert.equal(ctx.lookup(women,'BEAC'),null);
 assert.equal(ctx.draw(women,'BEAC'),'');
 assert.ok(ctx.draw(women,'BEAC II.').includes('2.'));
});
test('Player last-five displays reference-style dots under the team name with accessible labels',()=>{
 const html=ctx.draw(men,'BEAC');
 assert.ok(html.includes('1.'));
 assert.ok(html.includes('cc-form-arrow up'));
 assert.ok(html.includes('<svg class="cc-form-trend-icon"'));
 assert.ok(html.includes('M3 17 L9 10 L13 14 L21 5'));
 assert.ok(!html.includes('1.*'));
 assert.ok(!html.includes('↗'));
 assert.match(html,/cc-form-dot is-win[^>]*aria-hidden="true"><\/i>/);
 assert.match(html,/cc-form-dot is-loss[^>]*aria-hidden="true"><\/i>/);
 assert.ok(html.includes('aria-label'));
 assert.ok(html.indexOf('cc-form-rank')<html.indexOf('cc-form-team-name'));
 assert.ok(html.indexOf('cc-form-arrow up')<html.indexOf('cc-form-rank'));
 assert.ok(css.includes('.cc-form-arrow{grid-column:1'));
 assert.ok(css.includes('.cc-form-rank{grid-column:2'));
 assert.ok(css.includes('padding:0!important;border:0!important')||css.includes('padding:0!important;min-height:0!important;border:0!important'));

 assert.ok(html.indexOf('cc-form-arrow')<html.indexOf('cc-form-team-name'));
 assert.ok(html.indexOf('cc-form-team-name')<html.indexOf('cc-form-dots'));
 assert.ok(!html.includes('↗'));
 assert.ok(css.includes('.cc-form-mini{'));
 assert.ok(css.includes('@media(max-width:480px)'));
});
test('Null/unplayed ranks are never presented as official placements',()=>{
 ctx.ccMrszPlayerPhoto_.canonicalFormCards=[{competitionLabel:women,teamName:'PDSE',rank:null,played:0,lastFive:[],trend:'flat',trendBasis:'insufficient'}];
 const html=ctx.draw(women,'PDSE');
 assert.ok(html.includes('cc-form-rank'));
 assert.ok(!html.includes('0.*'));
 assert.ok(!html.includes('1.'));
 assert.ok(html.includes('cc-form-arrow flat'));
 assert.ok(html.includes('M3 12 H21 M16 7 L21 12 L16 17'));
 assert.ok(css.includes('background:transparent!important'));
 assert.ok(css.includes('.cc-form-arrow::before,.cc-form-arrow::after{content:none!important'));
 assert.ok(!html.includes('0.'));
 assert.ok(!html.includes('1.'));

});

test('Player standings form icon precedes the name and uses the same current canonical card',()=>{
 ctx.ccMrszPlayerPhoto_.canonicalFormCards=[
  {competitionLabel:men,teamName:'BEAC',rank:3,lastFive:['W','L','W','W','L'],trend:'down',trendBasis:'rolling'}
 ];
 const js=src.slice(start,src.indexOf('function ccPlayerScoreboardHtml_(',start));
 const isolated={
  ccMrszPlayerPhoto_:ctx.ccMrszPlayerPhoto_,
  ccPlayerMatchTeamKey_:ctx.ccPlayerMatchTeamKey_,
  escapeHtml_:ctx.escapeHtml_,
  standingsTeamLogoHtml_:n=>'<img alt="'+n+'">'
 };
 vm.createContext(isolated);
 vm.runInContext(js+'\nthis.team=ccPlayerStandingTeamHtml_;this.parts=ccPlayerCurrentStandingsFormParts_;',isolated);
 const html=isolated.team(men,'BEAC');
 assert.ok(html.includes('cc-standings-form-arrow down'));
 assert.ok(html.includes('cc-standings-team-name-block'));
 assert.equal((html.match(/cc-form-dot /g)||[]).length,5);
 assert.ok(html.indexOf('cc-standings-form-arrow')<html.indexOf('standings-team-name'));
 assert.ok(html.indexOf('standings-team-name')<html.indexOf('cc-standings-dots'));
 assert.ok(!html.includes('3.</span>'),'Rank belongs in the existing first pinned column');
 assert.ok(isolated.team('Női Budapest I. osztály','BEAC').includes('BEAC'));
 assert.ok(!isolated.team('Női Budapest I. osztály','BEAC').includes('cc-standings-form-arrow'));
});

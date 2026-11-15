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
 assert.ok(ctx.draw(women,'BEAC II.').includes('2.*'));
});
test('Player last-five displays reference-style dots under the team name with accessible labels',()=>{
 const html=ctx.draw(men,'BEAC');
 assert.ok(html.includes('1.*'));
 assert.ok(html.includes('cc-form-arrow up'));
 assert.match(html,/cc-form-dot is-win[^>]*aria-hidden="true"><\/i>/);
 assert.match(html,/cc-form-dot is-loss[^>]*aria-hidden="true"><\/i>/);
 assert.ok(html.includes('aria-label'));
 assert.ok(html.indexOf('cc-form-rank')<html.indexOf('cc-form-team-name'));
 assert.ok(html.indexOf('cc-form-arrow')<html.indexOf('cc-form-team-name'));
 assert.ok(html.indexOf('cc-form-team-name')<html.indexOf('cc-form-dots'));
 assert.ok(html.includes('↗'));
 assert.ok(css.includes('.cc-form-mini{'));
 assert.ok(css.includes('@media(max-width:480px)'));
});
test('Null/unplayed ranks are never presented as official placements',()=>{
 ctx.ccMrszPlayerPhoto_.canonicalFormCards=[{competitionLabel:women,teamName:'PDSE',rank:null,played:0,lastFive:[],trend:'flat',trendBasis:'insufficient'}];
 const html=ctx.draw(women,'PDSE');
 assert.ok(html.includes('cc-form-rank'));
 assert.ok(!html.includes('0.*'));
 assert.ok(!html.includes('1.*'));
 assert.ok(html.includes('cc-form-arrow flat'));
});

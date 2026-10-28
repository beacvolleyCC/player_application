'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const h=fs.readFileSync('index.html','utf8'),c=fs.readFileSync('config.js','utf8'),sw=fs.readFileSync('sw.js','utf8');
const m=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.match(h,/CC TEST · DEMÓ · NEM ÉLES/);
assert.match(h,/connect-src 'none'/);assert.match(h,/script-src 'self'/);
assert.doesNotMatch(h,/cdn\.jsdelivr\.net|script\.google\.com|\.supabase\.co/);
assert.match(c,/DATA_BACKEND:'demo'/);assert.match(c,/API_URL:''/);assert.match(c,/SUPABASE_URL:''/);assert.match(c,/PUSH_ENABLED:false/);
assert.doesNotMatch(c,/https?:\/\//);
assert.match(sw,/cc-player-test-20261028-rsvp-v1/);
assert.doesNotMatch(sw,/['"]push['"]|cc-player-20261025/);
assert.equal(m.short_name,'CC TEST');assert.ok(m.id.includes('cc-test-id'));
console.log('PASS: CC TEST is offline/demo-only, with no production API config.');

const src=fs.readFileSync('app.js','utf8');
assert.match(src,/ccMobileTestStorage_=Object\.freeze/);
assert.match(src,/window\.localStorage\.getItem\('cc-mobile-test-20261026:/);
assert.doesNotMatch(src,/(?<!window\.)\blocalStorage\.(?:getItem|setItem|removeItem)\(/);

const exportScript=fs.readFileSync('scripts/export-player-test-pages.ps1','utf8');
assert.match(exportScript,/Target must be empty except the .git directory/);
assert.match(exportScript,/Copy-Item -LiteralPath \$in -Destination \$to/);
assert.doesNotMatch(exportScript,/Copy-Item.+data\/|Copy-Item.+supabase\/migrations/);

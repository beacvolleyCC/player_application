/* Run with: node tests/i18n.test.js */
'use strict';
const assert = require('node:assert/strict');
const i18n = require('../i18n.js');
assert.equal(i18n.normalizeLanguage('en-GB'), 'en');
assert.equal(i18n.normalizeLanguage('hu-HU'), 'hu');
assert.equal(i18n.normalizeLanguage('fr-FR'), 'hu');
assert.equal(i18n.translate('attendance.yes', 'hu'), 'Jövök');
assert.equal(i18n.translate('attendance.yes', 'en'), "I'll attend");
assert.equal(i18n.translate('notifications.payment', 'en'), 'Payment reminder');
assert.equal(i18n.translate('missing.key', 'en'), 'missing.key');
assert.match(i18n.formatDate('2026-11-10T12:00:00Z', 'en', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}), /10 November 2026/);
for (const key of Object.keys(i18n.dictionaries.hu)) {
  assert.ok(i18n.dictionaries.en[key], 'Missing English translation: ' + key);
}
console.log('HU/EN foundation tests passed');

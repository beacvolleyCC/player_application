/* Club Control Player localization foundation. Hungarian remains the source language. */
(function (root) {
  'use strict';
  const dictionaries = Object.freeze({
    hu: Object.freeze({
      'attendance.yes': 'Jövök',
      'attendance.no': 'Nem jövök',
      'attendance.pending': 'Még nem jelöltem',
      'navigation.training': 'Edzések',
      'navigation.matches': 'Mérkőzések',
      'navigation.profile': 'Profil',
      'navigation.settings': 'Beállítások',
      'navigation.notifications': 'Értesítések',
      'navigation.standings': 'Tabella',
      'settings.language': 'Felület nyelve',
      'settings.language.help': 'Válaszd ki az alkalmazás nyelvét.',
      'notifications.new_training': 'Új edzés',
      'notifications.training_change': 'Edzés módosult vagy törlődött',
      'notifications.weekly_response_reminder': 'Heti visszajelzés emlékeztető',
      'notifications.same_day_response_reminder': 'Edzésnapi emlékeztető',
      'notifications.new_match': 'Új meccs',
      'notifications.match_change': 'Meccs módosult',
      'notifications.payment': 'Fizetési emlékeztető',
      'notifications.medical_expiry': 'Sportorvosi lejárat',
      'notifications.medical_appointment': 'Sportorvosi időpont',
      'notifications.test': 'Tesztértesítés',
      'notifications.fallback': 'Új értesítés érkezett.'
    }),
    en: Object.freeze({
      'attendance.yes': "I'll attend",
      'attendance.no': "I can't attend",
      'attendance.pending': 'No response yet',
      'navigation.training': 'Training sessions',
      'navigation.matches': 'Matches',
      'navigation.profile': 'Profile',
      'navigation.settings': 'Settings',
      'navigation.notifications': 'Notifications',
      'navigation.standings': 'League standings',
      'settings.language': 'Display language',
      'settings.language.help': 'Choose the language used in the app.',
      'notifications.new_training': 'New training session',
      'notifications.training_change': 'Training session updated or cancelled',
      'notifications.weekly_response_reminder': 'Weekly attendance reminder',
      'notifications.same_day_response_reminder': 'Training day reminder',
      'notifications.new_match': 'New match',
      'notifications.match_change': 'Match updated',
      'notifications.payment': 'Payment reminder',
      'notifications.medical_expiry': 'Medical clearance expiry',
      'notifications.medical_appointment': 'Medical appointment',
      'notifications.test': 'Test notification',
      'notifications.fallback': 'You have a new notification.'
    })
  });
  function normalizeLanguage(language) {
    return /^en(?:-|$)/i.test(String(language || '')) ? 'en' : 'hu';
  }
  function translate(key, language, params) {
    const locale = normalizeLanguage(language);
    const template = dictionaries[locale][key] || dictionaries.hu[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(params && Object.prototype.hasOwnProperty.call(params, name) ? params[name] : '{' + name + '}'));
  }
  function formatDate(date, language, options) {
    return new Intl.DateTimeFormat(normalizeLanguage(language) === 'en' ? 'en-GB' : 'hu-HU', options || {dateStyle: 'medium'}).format(new Date(date));
  }
  const api = Object.freeze({ dictionaries, normalizeLanguage, translate, formatDate });
  root.CCPlayerI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

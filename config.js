/* Club Control Manager PWA V1.1 – configuration.
 * These IDs are identifiers, not secrets. Never put a client secret in this frontend.
 */
window.CLUB_CONTROL_PWA_CONFIG = {
  version: '1.1.0',

  // Apps Script -> Deploy -> Manage deployments -> API executable -> Deployment ID
  deploymentId: 'PASTE_API_EXECUTABLE_DEPLOYMENT_ID_HERE',

  // Google Auth Platform -> Clients -> Web application -> Client ID
  oauthClientId: 'PASTE_GOOGLE_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com',

  // The Apps Script API caller token must cover the scopes used by the script.
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/script.send_mail',
    'https://www.googleapis.com/auth/userinfo.email'
  ],

  // true: script owner runs the most recently saved code.
  // false: use the version attached to the API executable deployment.
  devMode: true
};

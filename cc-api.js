(function(){
  'use strict';

  let accessToken='';
  let expiresAt=0;
  let tokenClient=null;

  function cfg(){ return window.CLUB_CONTROL_PWA_CONFIG || {}; }
  function scopes(){ return Array.isArray(cfg().scopes) ? cfg().scopes.join(' ') : ''; }
  function configured(){
    return cfg().deploymentId &&
      String(cfg().deploymentId).indexOf('PASTE_')!==0 &&
      cfg().oauthClientId &&
      String(cfg().oauthClientId).indexOf('PASTE_')!==0;
  }

  function waitForGIS(timeoutMs){
    timeoutMs=timeoutMs||15000;
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      (function tick(){
        if(window.google && google.accounts && google.accounts.oauth2){ resolve(); return; }
        if(Date.now()-started>timeoutMs){ reject(new Error('A Google OAuth könyvtár nem töltődött be.')); return; }
        setTimeout(tick,100);
      })();
    });
  }

  async function authorize(){
    if(!configured()) throw new Error('A PWA Cloud/OAuth azonosítói még nincsenek beállítva a config.js fájlban.');
    await waitForGIS();

    return new Promise((resolve,reject)=>{
      tokenClient=google.accounts.oauth2.initTokenClient({
        client_id: cfg().oauthClientId,
        scope: scopes(),
        callback: function(resp){
          if(resp && resp.error){ reject(new Error(resp.error_description || resp.error)); return; }
          accessToken=String(resp && resp.access_token || '');
          const seconds=Number(resp && resp.expires_in || 3600);
          expiresAt=Date.now()+Math.max(60,seconds-120)*1000;
          if(!accessToken){ reject(new Error('Nem érkezett OAuth access token.')); return; }
          resolve(resp);
        },
        error_callback: function(err){
          reject(new Error((err && (err.message || err.type)) || 'Google OAuth hiba.'));
        }
      });
      tokenClient.requestAccessToken({prompt: accessToken ? '' : 'consent'});
    });
  }

  function hasToken(){ return !!accessToken && Date.now()<expiresAt; }

  async function run(action,args){
    if(!hasToken()){
      const err=new Error('AUTH_REQUIRED');
      err.code='AUTH_REQUIRED';
      throw err;
    }

    const deploymentId=String(cfg().deploymentId || '').trim();
    const url='https://script.googleapis.com/v1/scripts/'+encodeURIComponent(deploymentId)+':run';
    const res=await fetch(url,{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+accessToken,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        function:'managerApiCall',
        parameters:[String(action||''), Array.isArray(args)?args:[]],
        devMode:cfg().devMode===true
      })
    });

    let data={};
    try{ data=await res.json(); }catch(_){}

    if(res.status===401){
      accessToken=''; expiresAt=0;
      const err=new Error('AUTH_REQUIRED'); err.code='AUTH_REQUIRED'; throw err;
    }

    if(!res.ok){
      const msg=(data && data.error && data.error.message) || ('Google API HTTP '+res.status);
      throw new Error(msg);
    }

    if(data && data.error){
      let msg=data.error.message || 'Apps Script futási hiba.';
      try{
        const d=data.error.details && data.error.details[0];
        if(d && d.errorMessage) msg=d.errorMessage;
      }catch(_){}
      throw new Error(msg);
    }

    if(data && data.response && Object.prototype.hasOwnProperty.call(data.response,'result')){
      return data.response.result;
    }
    return null;
  }

  window.CCApi={
    authorize,
    run,
    hasToken,
    clearToken:function(){accessToken='';expiresAt=0;},
    configured
  };
})();
(function(){
  'use strict';

  const READS=new Set([
    'getAdminTrainings',
    'getTrainingRoster',
    'getAdminAddAthleteContext',
    'searchAthletesForAdmin',
    'lookupAdminPassByEmail',
    'getAdminLevelOverride',
    'getAthleteHistoryForAdmin',
    'getAdminAthleteDirectoryPeriods',
    'getAdminAthleteDirectory',
    'getBeacImportStatus'
  ]);

  const BOOTSTRAP_KEYS={
    getAdminTrainings:'read:getAdminTrainings:[]',
    getAdminAthleteDirectoryPeriods:'read:getAdminAthleteDirectoryPeriods:[]',
    getBeacImportStatus:'read:getBeacImportStatus:[]'
  };

  let forceNext=false;
  let authQueue=[];
  let loginOverlay=null;
  let loginMessage=null;
  let statusEl=null;

  function keyFor(action,args){
    let encoded='[]';
    try{ encoded=JSON.stringify(Array.isArray(args)?args:[]); }catch(_){}
    return 'read:'+action+':'+encoded;
  }

  function setStatus(kind,text){
    if(!statusEl) return;
    statusEl.className='cc-pwa-status '+kind;
    const t=statusEl.querySelector('.cc-pwa-status-text');
    if(t) t.textContent=text;
  }

  window.ccPwaForceNextRead=function(){ forceNext=true; };

  async function invalidateAfterWrite(){
    if(window.CCDB) await CCDB.clear();
    setStatus(navigator.onLine?'online':'offline', navigator.onLine?'Mentve · frissítés szükséges':'Offline');
  }

  async function cachedOrNetwork(action,args){
    const read=READS.has(action);
    const key=keyFor(action,args);
    const forced=forceNext;
    if(forced) forceNext=false;

    if(read && !forced && window.CCDB){
      const cached=await CCDB.get(key);
      if(typeof cached!=='undefined'){
        setStatus(navigator.onLine?'online':'offline', navigator.onLine?'Helyi adat':'Offline · helyi adat');
        return cached;
      }
    }

    try{
      const result=await CCApi.run(action,args);
      if(read && window.CCDB) await CCDB.set(key,result);
      if(!read) await invalidateAfterWrite();
      setStatus('online','Naprakész');
      return result;
    }catch(err){
      if(err && err.code==='AUTH_REQUIRED') throw err;
      if(read && window.CCDB){
        const cached=await CCDB.get(key);
        if(typeof cached!=='undefined'){
          setStatus('offline','Offline · helyi adat');
          return cached;
        }
      }
      throw err;
    }
  }

  function showLogin(message){
    if(loginMessage) loginMessage.textContent=message||'A Manager használatához jelentkezz be a Google-fiókoddal.';
    if(loginOverlay) loginOverlay.classList.add('open');
  }

  function hideLogin(){
    if(loginOverlay) loginOverlay.classList.remove('open');
  }

  function queueAuth(job){
    authQueue.push(job);
    setStatus('pending','Belépés szükséges');
    showLogin();
  }

  async function primeBootstrap(){
    try{
      const data=await CCApi.run('getManagerBootstrap',[]);
      if(data && window.CCDB){
        if(Object.prototype.hasOwnProperty.call(data,'trainings')) await CCDB.set(BOOTSTRAP_KEYS.getAdminTrainings,data.trainings);
        if(Object.prototype.hasOwnProperty.call(data,'athletePeriods')) await CCDB.set(BOOTSTRAP_KEYS.getAdminAthleteDirectoryPeriods,data.athletePeriods);
        if(Object.prototype.hasOwnProperty.call(data,'importStatus')) await CCDB.set(BOOTSTRAP_KEYS.getBeacImportStatus,data.importStatus);
        await CCDB.set('meta:lastBootstrap',{serverTime:data.serverTime||'',localTime:new Date().toISOString()});
      }
      setStatus('online','Naprakész');
      return data;
    }catch(e){
      setStatus(navigator.onLine?'pending':'offline', navigator.onLine?'Szinkronhiba':'Offline');
      throw e;
    }
  }

  async function flushQueue(){
    const jobs=authQueue.slice();
    authQueue=[];
    for(const job of jobs){
      try{
        const result=await cachedOrNetwork(job.action,job.args);
        if(typeof job.success==='function') job.success(result);
      }catch(e){
        if(e && e.code==='AUTH_REQUIRED'){ authQueue.push(job); showLogin(); break; }
        if(typeof job.failure==='function') job.failure(e);
      }
    }
  }

  async function doLogin(){
    const btn=document.getElementById('ccPwaLoginButton');
    if(btn){btn.disabled=true;btn.textContent='BELÉPÉS…';}
    if(loginMessage) loginMessage.textContent='Google-fiók engedélyezése…';
    try{
      await CCApi.authorize();
      if(loginMessage) loginMessage.textContent='Adatok frissítése…';
      await primeBootstrap();
      hideLogin();
      await flushQueue();
    }catch(e){
      showLogin((e && e.message) || 'A belépés nem sikerült.');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='BELÉPÉS GOOGLE-FIÓKKAL';}
    }
  }

  function dispatch(action,args,success,failure){
    (async()=>{
      try{
        const result=await cachedOrNetwork(action,args);
        if(typeof success==='function') success(result);
      }catch(e){
        if(e && e.code==='AUTH_REQUIRED'){
          queueAuth({action,args,success,failure});
          return;
        }
        if(typeof failure==='function') failure(e);
        else console.error(e);
      }
    })();
  }

  function makeRunner(success,failure){
    const target={};
    return new Proxy(target,{
      get:function(_,prop){
        if(prop==='withSuccessHandler') return function(fn){ return makeRunner(fn,failure); };
        if(prop==='withFailureHandler') return function(fn){ return makeRunner(success,fn); };
        if(prop==='withUserObject') return function(){ return makeRunner(success,failure); };
        if(prop==='then') return undefined;
        return function(){
          dispatch(String(prop),Array.prototype.slice.call(arguments),success,failure);
        };
      }
    });
  }

  // Must exist before the legacy Manager inline scripts execute.
  window.google=window.google||{};
  window.google.script=window.google.script||{};
  Object.defineProperty(window.google.script,'run',{
    configurable:true,
    get:function(){ return makeRunner(null,null); }
  });

  function buildUi(){
    document.documentElement.classList.add('cc-pwa-standalone');

    loginOverlay=document.createElement('div');
    loginOverlay.className='cc-pwa-login-overlay';
    loginOverlay.innerHTML=
      '<div class="cc-pwa-login-card">'+
        '<h2>Club Control Manager</h2>'+
        '<p>A PWA a meglévő Google Sheets adatbázishoz az Apps Script backenden keresztül kapcsolódik.</p>'+
        '<button id="ccPwaLoginButton" class="cc-pwa-login-button" type="button">BELÉPÉS GOOGLE-FIÓKKAL</button>'+
        '<div id="ccPwaLoginMessage" class="cc-pwa-login-message"></div>'+
      '</div>';
    document.body.appendChild(loginOverlay);
    loginMessage=document.getElementById('ccPwaLoginMessage');
    document.getElementById('ccPwaLoginButton').addEventListener('click',doLogin);

    statusEl=document.createElement('div');
    statusEl.className='cc-pwa-status '+(navigator.onLine?'online':'offline');
    statusEl.innerHTML='<span class="cc-pwa-status-dot"></span><span class="cc-pwa-status-text">'+(navigator.onLine?'Helyi adat':'Offline')+'</span>';

    const headerActions=document.querySelector('.admin-header-actions');
    if(headerActions) headerActions.insertBefore(statusEl,headerActions.firstChild);

    if(!CCApi.configured()){
      showLogin('Előbb töltsd ki a config.js fájlban a Deployment ID-t és az OAuth Client ID-t.');
    }

    window.addEventListener('online',()=>setStatus('online','Online'));
    window.addEventListener('offline',()=>setStatus('offline','Offline · helyi adat'));

    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Service worker:',err));
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildUi);
  else buildUi();
})();
/* Club Control subscribed calendar, separate from the existing one-time .ics export.
   The raw bearer URL is never persisted to storage or logged. */
(() => {
  'use strict';
  const panel=document.getElementById('calendarSubscriptionPanel');
  if(!panel)return;
  const scopeEl=document.getElementById('ccCalendarScope');
  const generate=document.getElementById('ccCalendarGenerate');
  const copy=document.getElementById('ccCalendarCopy');
  const revoke=document.getElementById('ccCalendarRevoke');
  const apple=document.getElementById('ccCalendarApple');
  const status=document.getElementById('ccCalendarSubscriptionStatus');
  let liveUrl='',active=false,busy=false,version=0;
  function message(s,tone='info') {
    status.textContent=s;status.dataset.tone=tone;
  }
  function getTeamId(){
    // This is only a UI hint; the server performs independent membership checks.
    const id=String(typeof currentTeamData!=='undefined' ? currentTeamData?.id||'' : '');
    return /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(id)?id:null;
  }
  function args(){
    const scope=scopeEl.value==='team'?'team':'mine';
    return {p_scope:scope,p_team_id:scope==='team'?getTeamId():null};
  }
  function ready(){
    return typeof ccSupabase!=='undefined' && !!ccSupabase &&
      typeof ccSupabaseConfigured_==='function' && ccSupabaseConfigured_();
  }
  function draw(){
    const teamId=getTeamId();
    const teamOption=scopeEl.querySelector('option[value="team"]');
    if(teamOption)teamOption.disabled=!teamId;
    if(!teamId && scopeEl.value==='team')scopeEl.value='mine';
    const valid=ready() && (scopeEl.value!=='team'||!!teamId);
    scopeEl.disabled=busy||!ready();
    generate.disabled=busy||!valid;
    copy.disabled=busy||!liveUrl;
    revoke.disabled=busy||!valid||!active;
    apple.hidden=!liveUrl;
    if(liveUrl){
      const parsed=new URL(liveUrl);
      parsed.protocol='webcal:';
      apple.href=parsed.toString();
    }else{
      apple.removeAttribute('href');
    }
    generate.textContent=active?'Előfizetési hivatkozás megújítása':'Privát hivatkozás létrehozása';
  }
  function forget(){
    liveUrl='';version++;draw();
  }
  async function refresh(){
    forget();
    if(!ready()){active=false;message('A naptár-előfizetés csak bejelentkezett Club Control-fiókkal érhető el.');draw();return;}
    const id=version;
    try{
      const {data,error}=await ccSupabase.rpc('cc_player_calendar_token_status_v1',args());
      if(id!==version)return;
      if(error)throw error;
      active=!!data?.active;
      message(active
        ? 'Van aktív előfizetésed. A korábbi hivatkozás nem olvasható vissza; megújításakor a régi megszűnik.'
        : 'Hozz létre egy személyes hivatkozást, és iratkozz fel rá az Apple Naptárban.');
    }catch(_){
      active=false;
      message('Az élő naptár-előfizetési szolgáltatás még nem érhető el. Az egyszeri export továbbra is használható.','error');
      generate.disabled=true;
    }
    draw();
  }
  scopeEl.addEventListener('change',()=>{active=false;refresh();});
  document.getElementById('openSettingsBtn')?.addEventListener('click',()=>{refresh();});
  document.getElementById('settingsDialog')?.addEventListener('close',()=>{forget();});
  generate.addEventListener('click',async()=>{
    if(busy||!ready())return;
    if(active && !window.confirm('Az új hivatkozás azonnal érvényteleníti a régit az Apple Naptárban is. Megújítod?'))return;
    busy=true;draw();
    try{
      const {data,error}=await ccSupabase.rpc('cc_player_calendar_token_rotate_v1',args());
      if(error)throw error;
      if(!/^[0-9a-f]{64}$/.test(String(data?.token||'')))throw Error('TOKEN_RESPONSE_INVALID');
      const base=String(ccConfig_().SUPABASE_URL||'');
      const feed=new URL('/functions/v1/cc-calendar',base);
      if(feed.protocol!=='https:')throw Error('HTTPS_REQUIRED');
      feed.searchParams.set('token',data.token);
      liveUrl=feed.toString();
      active=true;
      message('Privát hivatkozás létrehozva. Most feliratkozhatsz, vagy kimásolhatod. Kezeld jelszóként!','ok');
    }catch(_){
      liveUrl='';
      message('Nem sikerült létrehozni a privát naptárhivatkozást. Próbáld újra később.','error');
    }finally{busy=false;draw();}
  });
  copy.addEventListener('click',async()=>{
    if(!liveUrl)return;
    try{
      await navigator.clipboard.writeText(liveUrl);
      message('A privát HTTPS-hivatkozás a vágólapra került. Ne oszd meg másokkal!','ok');
    }catch(_){
      message('A böngésző nem engedélyezte a másolást. Használd az Apple Naptár gombot.','error');
    }
  });
  revoke.addEventListener('click',async()=>{
    if(busy||!ready()||!active)return;
    if(!window.confirm('Visszavonod a naptár-előfizetést? Az Apple-ben a korábbi események törléséhez az előfizetett naptárt is el kell távolítanod.'))return;
    busy=true;draw();
    try{
      const {error}=await ccSupabase.rpc('cc_player_calendar_token_revoke_v1',args());
      if(error)throw error;
      active=false;forget();
      message('Hivatkozás visszavonva. A régi feed többé nem olvasható.','ok');
    }catch(_){
      message('Nem sikerült visszavonni. A régi hivatkozást továbbra is aktívnak kell tekinteni.','error');
    }finally{busy=false;draw();}
  });
  draw();
})();

/* Club Control TEST: persistent RSVP UI reliability, no LIVE code changes. */
(function(){
  'use strict';
  const oldPersist=persist;
  const waiting=new Map();
  const has=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
  function snapshot(event){
    return {
      status:event.status??null,
      note:event.note??'',
      yes:[...(event.yes||[])],
      no:[...(event.no||[])],
      unknown:[...(event.unknown||[])],
      hasSaved:has(saved,event.id),
      saved:has(saved,event.id)?{...saved[event.id]}:null
    };
  }
  function rollback(event,previous){
    event.status=previous.status;
    event.note=previous.note;
    event.yes=[...previous.yes];
    event.no=[...previous.no];
    event.unknown=[...previous.unknown];
    if(previous.hasSaved)saved[event.id]={...previous.saved};
    else delete saved[event.id];
    ccMobileTestStorage_.setItem('cc-demo-state-v2',JSON.stringify(saved));
    renderEvents();
    renderPlanner();
    renderProfileStats_();
  }
  function errorMessage(){
    let el=document.getElementById('ccRsvpSaveError');
    if(!el){
      el=document.createElement('div');
      el.id='ccRsvpSaveError';
      el.className='cc-rsvp-save-error';
      el.setAttribute('role','alert');
      el.setAttribute('aria-live','assertive');
      document.body.appendChild(el);
    }
    el.textContent='A jelentkezés mentése sikertelen volt. Az előző állapotot visszaállítottuk.';
    el.hidden=false;
  }
  persist=function(event,status,note=''){
    if(!(SUPABASE_ENABLED&&ccSupabase))return oldPersist(event,status,note);
    const key=String(event.id);
    let state=waiting.get(key);
    if(!state){
      state={version:0,chain:Promise.resolve(),confirmed:snapshot(event)};
      waiting.set(key,state);
    }
    const version=++state.version;
    _persistLocal(event,status,note);
    renderProfileStats_();
    const desired=snapshot(event);
    const work=state.chain.catch(()=>{}).then(async()=>{
      // Skip a queued choice that has already been superseded by the user.
      if(version!==state.version)return;
      try{
        await ccSaveAvailabilitySupabase_(event,status,note);
        // Keep only acknowledged state for rollback of newer pending edits.
        state.confirmed=desired;
        // A subsequent acknowledged save resolves the previous visible failure.
        // Only the most recent choice may clear the warning.
        if(version===state.version){
          const warning=document.getElementById('ccRsvpSaveError');
          if(warning)warning.hidden=true;
        }
      }catch(err){
        console.error('TEST RSVP mentési hiba:',err);
        // A stale response must not revert a newer choice.
        if(version!==state.version)return;
        rollback(event,state.confirmed);
        errorMessage();
      }
    });
    state.chain=work;
    void work.finally(()=>{
      if(state.version===version&&waiting.get(key)===state)waiting.delete(key);
    });
  };
})();

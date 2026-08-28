
const DEMO_NOW = new Date('2026-09-05T12:00:00');

let events = [
  {id:'ev-2026-08-30',archived:true,date:'2026.08.30.',day:'Vasárnap',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 1. pálya',month:'Aug',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:['Viki'],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-01',archived:true,date:'2026.09.01.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Réka','Juli','Kata','Sára','Nóri','Eszter'],no:['Dóri','Viki'],unknown:['Te','Fanni','Lili','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':3,'Center':2,'Liberó':1}},
  {id:'ev-2026-09-04',archived:true,date:'2026.09.04.',day:'Péntek',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Corvinus',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Szept',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:[],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-08',date:'2026.09.08.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Fanni','Réka','Juli','Kata','Lili','Sára','Nóri'],no:['Dóri'],unknown:['Te','Eszter','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':2,'Négyes':3,'Center':2,'Liberó':2}},
  {id:'ev-2026-09-10',date:'2026.09.10.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 1. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca'],no:['Dóri'],unknown:['Te','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-02',date:'2026.10.02.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Okt',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':0,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-14',date:'2026.10.14.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'away',title:'TFSE – BEAC',place:'Dr. Koltai Jenő Sportközpont',address:'1123 Budapest, Alkotás u. 44.',meeting:'18:15 • helyszíni bejárat',month:'Okt',status:null,yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri'],no:['Viki'],unknown:['Te','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':2,'Center':1,'Liberó':1}},
  {id:'ev-2026-11-04',date:'2026.11.04.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Budai IX. C',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Nov',status:null,yes:['Anna','Dóri','Petra'],no:[],unknown:['Te','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-11-18',date:'2026.11.18.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Corvinus',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Nov',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':0,'Center':0,'Liberó':0}},
  {id:'ev-2026-12-03',date:'2026.12.03.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Dec',status:null,yes:['Anna'],no:[],unknown:['Te','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':0,'Négyes':0,'Center':0,'Liberó':0}},
];

const saved = JSON.parse(localStorage.getItem('cc-demo-state-v2')||'{}');
events.forEach(e => {
  if (saved[e.id] !== undefined) {
    e.status = saved[e.id].status ?? null;
    e.note = saved[e.id].note || '';
  }
});

const eventList = document.getElementById('eventList');
const plannerList = document.getElementById('plannerList');
const cancelDialog = document.getElementById('cancelDialog');
let pendingCancel = null;
let missingOnly = false;
let detailedMode = localStorage.getItem('cc-detailed-mode') === 'true';


function persist(event, status, note='') {
  event.status = status;
  event.note = note;
  saved[event.id] = {status, note, at:new Date().toISOString()};
  localStorage.setItem('cc-demo-state-v2', JSON.stringify(saved));
}


function eventStart(e){
  const parts=e.date.replace(/\.$/,'').split('.').filter(Boolean).map(Number);
  const [y,m,d]=parts;
  const timePart=(e.time.match(/(\d{1,2}):(\d{2})/)||[]).slice(1);
  const hh=Number(timePart[0]||23), mm=Number(timePart[1]||59);
  return new Date(y,m-1,d,hh,mm,0);
}
function isPast(e){
  return e.archived===true || eventStart(e) < DEMO_NOW;
}

function cardClass(e){
  if(e.status==='yes') return 'status-yes';
  if(e.status==='no') return 'status-no';
  return 'status-none';
}

function attendanceCountClass(n){
  if(n >= 10) return 'count-good';
  if(n >= 6) return 'count-warn';
  return 'count-low';
}
function typeIcon(e){
  if(e.type==='Edzés') return '🏐';
  if(e.matchKind==='home') return '⌂';
  return '⌖';
}
function typeLabel(e){
  if(e.type==='Edzés') return 'EDZÉS';
  return e.matchKind==='home' ? 'HAZAI MECCS' : 'IDEGENBELI MECCS';
}
function mapLink(e){
  if(e.matchKind!=='away' || !e.address) return '';
  const q=encodeURIComponent(e.address);
  return `<a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Megnyitás Google Mapsben ↗</a>`;
}
function eventCard(e){
  const archived=isPast(e);
  const detailClass=detailedMode?'show-detail':'compact-detail';
  const awayLine = e.matchKind==='away' && e.address
    ? `<div class="event-extra ${detailClass}"><span>${e.address}</span>${mapLink(e)}</div>` : '';
  const meetingLine = e.meeting
    ? `<div class="meeting-note ${detailClass}"><b>Találkozó:</b> ${e.meeting}</div>` : '';
  const autoAbsence = archived && e.status===null
    ? `<div class="auto-absence ${detailClass}">Automatikus hiányzás a lezáráskor</div>` : '';

  return `<article class="event-card ${cardClass(e)} ${archived?'archived-card':''}">
    <div class="event-collapsed">
      <div class="event-top centered-card">
        <div class="event-icon">${typeIcon(e)}</div>
        <div class="event-main">
          <div class="event-type">${typeLabel(e)}</div>
          <div class="event-title">${e.date} • ${e.time}</div>
          <div class="event-meta">${e.day} • ${e.title}</div>
          <div class="event-place ${detailClass}">${e.place}</div>
          ${awayLine}
          ${meetingLine}
          ${autoAbsence}
        </div>
        <div class="head-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong><span>jön</span></div>
      </div>

      <div class="slider-wrap">
        <div class="attendance-slider ${e.status||'none'}" data-slider="${e.id}">
          <button class="slider-zone left" data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>Jövök</button>
          <button class="slider-zone center" data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>Nincs jelzés</button>
          <button class="slider-zone right" data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>Nem jövök</button>
          <span class="slider-thumb"></span>
        </div>
      </div>
    </div>

    <button class="roster-toggle" data-roster="${e.id}">Részletek megnyitása ▾</button>
    <div class="roster" id="roster-${e.id}">
      <div class="roster-group"><b>Jönnek (${e.yes.length})</b><div class="chips">${e.yes.map(n=>`<span class="chip">${n}</span>`).join('')}</div></div>
      <div class="roster-group"><b>Nem jönnek (${e.no.length})</b><div class="chips">${e.no.map(n=>`<span class="chip no">${n}</span>`).join('')||'<span class="muted">–</span>'}</div></div>
      <div class="roster-group"><b>Még nem jelzett (${e.unknown.length})</b><div class="chips">${e.unknown.map(n=>`<span class="chip">${n}</span>`).join('')}</div></div>
    </div>
  </article>`;
}

function renderEvents(){
  const upcoming = events.filter(e=>!isPast(e)).slice(0,4);
  eventList.innerHTML = upcoming.length
    ? upcoming.map(eventCard).join('')
    : `<div class="empty-state">Nincs közelgő alkalom.</div>`;
  bindSliderDrag();
}

let plannerMode='cards';
function plannerStatusControls(e, archived){
  return `<div class="attendance-slider planner-slider ${e.status||'none'}" data-slider="${e.id}">
    <button class="slider-zone left" data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>✓</button>
    <button class="slider-zone center" data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>–</button>
    <button class="slider-zone right" data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>✕</button>
    <span class="slider-thumb"></span>
  </div>`;
}
function renderPlanner(){
  const mf = document.getElementById('monthFilter').value;
  const tf = document.getElementById('typeFilter').value;
  let rows = events.filter(e => {
    if(mf!=='all' && e.month!==mf) return false;
    if(tf!=='all' && e.type!==tf) return false;
    if(missingOnly && e.status!==null) return false;
    return true;
  });

  document.getElementById('detailModeBtn')?.classList.toggle('active', detailedMode);
  const settingsToggle=document.getElementById('settingsDetailToggle');
  if(settingsToggle) settingsToggle.checked=detailedMode;

  if(plannerMode==='grid'){
    plannerList.innerHTML = `<div class="grid-list">${rows.map(e=>{
      const archived=isPast(e);
      const detail = detailedMode ? `
        <div class="grid-detail">
          <span>${typeLabel(e)}</span>
          <span>${e.day} • ${e.time}</span>
          <span>${e.place}</span>
          ${e.meeting?`<span><b>Találkozó:</b> ${e.meeting}</span>`:''}
          ${e.matchKind==='away' && e.address ? `<span>${e.address} ${mapLink(e)}</span>` : ''}
          ${archived?'<span class="archive-badge">Lezárt</span>':''}
        </div>` : '';
      return `<div class="grid-event-card ${cardClass(e)} ${archived?'archived-grid-row':''}">
        <div class="grid-event-id">
          <span class="grid-event-icon">${typeIcon(e)}</span>
          <div>
            <b>${e.date} · ${e.title}</b>
            ${detail}
          </div>
        </div>
        <div class="grid-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></div>
        ${plannerStatusControls(e,archived)}
      </div>`;
    }).join('')}</div>`;
  } else {
    plannerList.innerHTML = rows.map(e=>{
      const archived=isPast(e);
      const detail = detailedMode ? `
        <small>${e.day} • ${e.time} • ${e.place}</small>
        ${e.meeting?`<small><b>Találkozó:</b> ${e.meeting}</small>`:''}
        ${e.matchKind==='away' && e.address ? `<small>${e.address}</small>${mapLink(e)}` : ''}
        ${archived?'<span class="archive-badge">Lezárt</span>':''}
      ` : '';
      return `<div class="planner-row ${cardClass(e)} ${archived?'archived-row':''}">
        <div class="planner-icon">${typeIcon(e)}</div>
        <div class="planner-main">
          <b>${e.date} · ${e.title}</b>
          ${detail}
        </div>
        <div class="planner-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></div>
        ${plannerStatusControls(e,archived)}
      </div>`;
    }).join('') || `<div class="empty-state">Nincs találat a szűrésre.</div>`;
  }

  bindSliderDrag();
}

function askCancel(event){
  pendingCancel = event;
  document.getElementById('cancelEventTitle').textContent = `${event.date} • ${event.time} • ${event.title}`;
  document.getElementById('cancelNote').value = event.note || '';
  cancelDialog.showModal();
}

function setYes(event){
  persist(event,'yes','');
  renderEvents();
  renderPlanner();
}

function neutralizeEvent(ev){
  if(ev.status==='yes'){
    const ok = confirm('Már jelezted, hogy jössz. Biztosan visszaállítod „Nincs jelzés” állapotra?');
    if(!ok) return;
  }
  persist(ev,null,'');
  renderEvents();
  renderPlanner();
}

eventList.addEventListener('click',e=>{
  const s=e.target.closest('[data-slider-action]');
  if(s){
    const ev=events.find(x=>x.id===s.dataset.id);
    if(isPast(ev)) return;
    if(s.dataset.sliderAction==='yes') setYes(ev);
    else if(s.dataset.sliderAction==='no') askCancel(ev);
    else neutralizeEvent(ev);
    return;
  }
  const rt=e.target.closest('[data-roster]');
  if(rt){
    const box=document.getElementById('roster-'+rt.dataset.roster);
    box.classList.toggle('open');
    rt.textContent=box.classList.contains('open')?'Részletek bezárása ▴':'Részletek megnyitása ▾';
  }
});

plannerList.addEventListener('click',e=>{
  const b=e.target.closest('[data-slider-action]');
  if(!b) return;
  const ev=events.find(x=>x.id===b.dataset.id);
  if(isPast(ev)) return;
  if(b.dataset.sliderAction==='yes') setYes(ev);
  else if(b.dataset.sliderAction==='no') askCancel(ev);
  else neutralizeEvent(ev);
});

document.getElementById('confirmCancel').addEventListener('click',ev=>{
  ev.preventDefault();
  if(!pendingCancel) return;
  const note=document.getElementById('cancelNote').value.trim();
  if(!note){
    document.getElementById('cancelNote').focus();
    return;
  }
  persist(pendingCancel,'no',note);
  cancelDialog.close();
  pendingCancel=null;
  renderEvents();
  renderPlanner();
});

['monthFilter','typeFilter'].forEach(id=>{
  document.getElementById(id).addEventListener('change',()=>{
    missingOnly=false;
    document.getElementById('missingOnlyBtn').classList.remove('active-filter');
    renderPlanner();
  });
});

document.getElementById('missingOnlyBtn').addEventListener('click',e=>{
  missingOnly=!missingOnly;
  e.currentTarget.classList.toggle('active-filter',missingOnly);
  renderPlanner();
});

function switchView(viewId){
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===viewId));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===viewId));
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
document.querySelectorAll('[data-view-jump]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.viewJump)));

const themeBtn=document.getElementById('themeBtn');
if(localStorage.getItem('cc-theme')==='dark') document.body.classList.add('dark');
themeBtn.addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('cc-theme',document.body.classList.contains('dark')?'dark':'light');
});


renderEvents();
renderPlanner();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}





document.querySelectorAll('.view-mode-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    plannerMode=btn.dataset.mode;
    document.querySelectorAll('.view-mode-btn').forEach(x=>x.classList.toggle('active',x===btn));
    renderPlanner();
  });
});


document.getElementById('homeRefreshBtn').addEventListener('click',e=>{
  const old=e.currentTarget.textContent;
  e.currentTarget.textContent='✓';
  renderEvents();
  renderPlanner();
  setTimeout(()=>e.currentTarget.textContent=old,900);
});


function applySliderState(ev, state){
  if(isPast(ev)) return;
  if(state==='yes') setYes(ev);
  else if(state==='no') askCancel(ev);
  else neutralizeEvent(ev);
}

function bindSliderDrag(){
  document.querySelectorAll('.attendance-slider').forEach(slider=>{
    if(slider.dataset.dragBound==='1') return;
    slider.dataset.dragBound='1';

    let startX=0, dragging=false;
    const id=slider.dataset.slider;
    const event=events.find(x=>x.id===id);
    if(!event || isPast(event)) return;

    slider.addEventListener('pointerdown', e=>{
      if(e.target.closest('button')) return;
      dragging=true; startX=e.clientX;
      slider.setPointerCapture?.(e.pointerId);
    });

    slider.addEventListener('pointerup', e=>{
      if(!dragging) return;
      dragging=false;
      const dx=e.clientX-startX;
      const threshold=Math.max(24, slider.clientWidth*0.12);
      if(dx < -threshold) applySliderState(event,'yes');
      else if(dx > threshold) applySliderState(event,'no');
      else applySliderState(event,'none');
    });
  });
}


const settingsDialog=document.getElementById('settingsDialog');
document.getElementById('openSettingsBtn')?.addEventListener('click',()=>settingsDialog.showModal());
document.getElementById('closeSettingsBtn')?.addEventListener('click',()=>settingsDialog.close());
document.getElementById('settingsDetailToggle')?.addEventListener('change',e=>{
  detailedMode=e.target.checked;
  localStorage.setItem('cc-detailed-mode', detailedMode ? 'true' : 'false');
  renderEvents();
  renderPlanner();
});
document.getElementById('settingsRefreshBtn')?.addEventListener('click',e=>{
  const old=e.currentTarget.textContent;
  e.currentTarget.textContent='✓ Frissítve';
  renderEvents(); renderPlanner();
  setTimeout(()=>e.currentTarget.textContent=old,900);
});
document.getElementById('detailModeBtn')?.addEventListener('click',()=>{
  detailedMode=!detailedMode;
  localStorage.setItem('cc-detailed-mode', detailedMode ? 'true' : 'false');
  renderEvents();
  renderPlanner();
});


/* V10 remote Google Sheet / Apps Script data source */
const API_URL = (window.CLUB_CONTROL_CONFIG && window.CLUB_CONTROL_CONFIG.API_URL || '').trim();
let currentUserEmail = localStorage.getItem('cc-user-email') || '';

function normalizeApiEvent(x){
  return {
    id:x.eventId,
    date:x.dateLabel || x.date,
    day:x.day || '',
    time:x.timeLabel || `${x.startTime||''}${x.endTime?'–'+x.endTime:''}`,
    type:x.type==='match'?'Meccs':'Edzés',
    matchKind:x.homeAway||'',
    title:x.title||'Csapatedzés',
    place:x.venue||'',
    address:x.address||'',
    meeting:x.meetingTime ? `${x.meetingTime}${x.meetingPlace?' • '+x.meetingPlace:''}` : '',
    month:x.monthKey||'',
    status:x.myStatus || null,
    note:x.myNote||'',
    yes:x.yesNames||[], no:x.noNames||[], unknown:x.unknownNames||[],
    archived:!!x.archived
  };
}

async function apiGet(action, params={}){
  const u=new URL(API_URL); u.searchParams.set('action',action);
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
  const r=await fetch(u.toString());
  if(!r.ok) throw new Error('API '+r.status);
  const j=await r.json();
  if(!j.ok) throw new Error(j.error||'Ismeretlen API hiba');
  return j;
}

async function apiPost(payload){
  const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  const j=await r.json();
  if(!j.ok) throw new Error(j.error||'Mentési hiba');
  return j;
}

function applyBootstrap(j){
  if(j.team){ document.getElementById('teamTitle').textContent=j.team.teamName; }
  if(j.player){
    document.getElementById('profileName').textContent=j.player.name;
    const meta=[j.player.position, j.player.jerseyNo ? '#'+j.player.jerseyNo : ''].filter(Boolean).join(' • ');
    document.getElementById('profileMeta').textContent=meta;
    document.getElementById('profileInitials').textContent=(j.player.name||'JT').split(/\\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  }
  events=(j.events||[]).map(normalizeApiEvent);
  renderEvents(); renderPlanner();
}

async function loadBootstrap(email){
  const msg=document.getElementById('loginMsg');
  try{
    const j=await apiGet('bootstrap',{email});
    currentUserEmail=email; localStorage.setItem('cc-user-email',email);
    applyBootstrap(j); document.getElementById('loginOverlay').classList.add('hidden');
    return true;
  }catch(err){ if(msg) msg.textContent=err.message; return false; }
}

if(API_URL){
  const overlay=document.getElementById('loginOverlay');
  if(currentUserEmail){ overlay.classList.remove('hidden'); loadBootstrap(currentUserEmail); }
  else overlay.classList.remove('hidden');
  document.getElementById('loginBtn')?.addEventListener('click',async()=>{
    const email=document.getElementById('loginEmail').value.trim().toLowerCase();
    if(!email){document.getElementById('loginMsg').textContent='Adj meg egy email címet.';return;}
    document.getElementById('loginMsg').textContent='Betöltés…';
    await loadBootstrap(email);
  });
  document.getElementById('loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginBtn').click();});
}

document.getElementById('logoutBtn')?.addEventListener('click',()=>{localStorage.removeItem('cc-user-email'); location.reload();});

// Remote save wraps the existing local state functions.
const _persistLocal = persist;
persist = function(event,status,note=''){
  _persistLocal(event,status,note);
  if(API_URL && currentUserEmail){
    apiPost({action:'setAvailability',email:currentUserEmail,eventId:event.id,status:status||'',note:note||''})
      .then(()=>loadBootstrap(currentUserEmail))
      .catch(err=>console.error(err));
  }
};

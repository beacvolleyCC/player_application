
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
let currentPlayerName = 'Te';


function persist(event, status, note='') {
  event.status = status;
  event.note = note;
  const aliases=new Set(['Te',currentPlayerName].filter(Boolean));
  event.yes=(event.yes||[]).filter(n=>!aliases.has(n));
  event.no=(event.no||[]).filter(n=>!aliases.has(n));
  event.unknown=(event.unknown||[]).filter(n=>!aliases.has(n));
  const label=currentPlayerName && currentPlayerName!=='Te' ? currentPlayerName : 'Te';
  if(status==='yes') event.yes.push(label);
  else if(status==='no') event.no.push(label);
  else event.unknown.push(label);
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
  const liveApi = !!(window.CLUB_CONTROL_CONFIG && window.CLUB_CONTROL_CONFIG.API_URL);
  const now = liveApi ? new Date() : DEMO_NOW;
  return e.archived===true || eventStart(e) < now;
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
function typeIconClass(e){
  if(e.type==='Edzés') return 'training';
  if(e.matchKind==='home') return 'home';
  return 'away';
}
function typeIcon(e){
  const cls=typeIconClass(e);
  if(cls==='training') return `<svg class="event-symbol training" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"></circle><path d="M8.2 5.1c2.8 2.1 4.7 4.4 5.4 7.1M16.9 6.5c-2.8.7-5.1 2.2-6.9 4.4M5 13.5c3.2-.2 6 .6 8.3 2.4M10.1 19.7c.5-3.1 1.9-5.7 4.4-7.7"></path></svg>`;
  if(cls==='home') return `<svg class="event-symbol home" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 4l8 7.2"></path><path d="M6.5 10v9h11v-9M10 19v-5h4v5"></path><circle cx="18.2" cy="6.2" r="2.1"></circle></svg>`;
  return `<svg class="event-symbol away" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17c2.7-4.7 5.4-7 8.2-7 2.1 0 3.8 1.1 5.8 3.5"></path><path d="m16.2 12.3 3 1.2-1 3"></path><path d="M7.2 5.2a3 3 0 1 0 0 6c1.9 0 3-1.7 3-3 0-1.7-1.3-3-3-3Z"></path><circle cx="7.2" cy="8.2" r=".7"></circle></svg>`;
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
        <div class="event-icon bare-icon">${typeIcon(e)}</div>
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

let plannerMode=localStorage.getItem('cc-planner-mode') || 'cards';
let calendarCursor=null;
function plannerStatusControls(e, archived){
  return `<div class="attendance-slider planner-slider ${e.status||'none'}" data-slider="${e.id}">
    <button class="slider-zone left" data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>✓</button>
    <button class="slider-zone center" data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>–</button>
    <button class="slider-zone right" data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>✕</button>
    <span class="slider-thumb"></span>
  </div>`;
}
function filteredPlannerEvents(){
  const mf = document.getElementById('monthFilter').value;
  const tf = document.getElementById('typeFilter').value;
  return events.filter(e => {
    if(mf!=='all' && e.month!==mf) return false;
    if(tf!=='all' && e.type!==tf) return false;
    if(missingOnly && e.status!==null) return false;
    return true;
  });
}

function personStatusForEvent(e,name){
  if(name==='__ME__') return e.status || null;
  if((e.yes||[]).includes(name)) return 'yes';
  if((e.no||[]).includes(name)) return 'no';
  return null;
}

function teamPeople(rows){
  const set=new Set();
  rows.forEach(e=>[...(e.yes||[]),...(e.no||[]),...(e.unknown||[])].forEach(n=>{
    if(n && n!=='Te' && n!==currentPlayerName) set.add(n);
  }));
  return ['__ME__', ...Array.from(set).sort((a,b)=>a.localeCompare(b,'hu'))];
}

function matrixOwnControl(e, archived){
  return `<div class="matrix-control ${e.status||'none'}" data-matrix="${e.id}">
    <button data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>✓</button>
    <button data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>–</button>
    <button data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>✕</button>
  </div>`;
}

function renderGridMatrix(rows){
  const people=teamPeople(rows);
  return `<div class="matrix-scroll"><table class="season-matrix">
    <thead><tr><th class="matrix-name sticky-matrix-col">Játékos</th>${rows.map(e=>`<th class="matrix-event-head" title="${typeLabel(e)} · ${e.title} · ${e.date}"><button class="matrix-event-open" data-open-event="${e.id}">${typeIcon(e)}<b>${e.date.slice(5,10)}</b><small>${e.time.split('–')[0]}</small></button></th>`).join('')}</tr></thead>
    <tbody>${people.map(name=>{
      const mine=name==='__ME__';
      const label=mine?'Én':name;
      return `<tr class="${mine?'my-matrix-row':''}"><th class="matrix-name sticky-matrix-col">${label}</th>${rows.map(e=>{
        const st=personStatusForEvent(e,name);
        const archived=isPast(e);
        if(mine) return `<td class="matrix-cell ${st?'matrix-'+st:'matrix-none'}">${matrixOwnControl(e,archived)}</td>`;
        return `<td class="matrix-cell ${st?'matrix-'+st:'matrix-none'}"><span class="matrix-status">${st==='yes'?'✓':st==='no'?'✕':'·'}</span></td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function eventDateObj(e){
  const p=e.date.replace(/\.$/,'').split('.').filter(Boolean).map(Number);
  return new Date(p[0],p[1]-1,p[2]);
}
function monthKeyFromDate(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function calendarMonthLabel(d){
  return d.toLocaleDateString('hu-HU',{year:'numeric',month:'long'});
}
function initialCalendarCursor(rows){
  const mf=document.getElementById('monthFilter').value;
  if(mf!=='all'){
    const match=rows.find(e=>e.month===mf) || events.find(e=>e.month===mf);
    if(match) return eventDateObj(match);
  }
  const upcoming=rows.find(e=>!isPast(e)) || rows[0] || events[0];
  return upcoming ? eventDateObj(upcoming) : new Date();
}

function calendarEventChip(e){
  return `<button class="calendar-event ${cardClass(e)}" data-open-event="${e.id}" title="${typeLabel(e)} · ${e.title}">${typeIcon(e)}<span>${e.time.split('–')[0]}</span><b>${e.type==='Edzés'?'Edzés':(e.matchKind==='home'?'Hazai':'Idegen')}</b></button>`;
}
function renderCalendar(rows){
  if(!calendarCursor) calendarCursor=initialCalendarCursor(rows);
  const y=calendarCursor.getFullYear(), m=calendarCursor.getMonth();
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const startOffset=(first.getDay()+6)%7; // Monday first
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=last.getDate();d++) cells.push(new Date(y,m,d));
  while(cells.length%7) cells.push(null);
  const visible=rows.filter(e=>{const d=eventDateObj(e); return d.getFullYear()===y && d.getMonth()===m;});
  return `<div class="calendar-shell">
    <div class="calendar-head"><button class="calendar-nav" data-cal-nav="prev" aria-label="Előző hónap">‹</button><h4>${calendarMonthLabel(calendarCursor)}</h4><button class="calendar-nav" data-cal-nav="next" aria-label="Következő hónap">›</button></div>
    <div class="calendar-weekdays">${['H','K','Sze','Cs','P','Szo','V'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="calendar-grid">${cells.map(d=>{
      if(!d) return '<div class="calendar-day empty"></div>';
      const key=monthKeyFromDate(d)+'-'+String(d.getDate()).padStart(2,'0');
      const dayEvents=visible.filter(e=>{
        const ed=eventDateObj(e); return ed.getDate()===d.getDate();
      });
      return `<div class="calendar-day ${dayEvents.length?'has-events':''}" data-calendar-date="${key}"><div class="calendar-day-no">${d.getDate()}</div><div class="calendar-events">${dayEvents.map(calendarEventChip).join('')}</div></div>`;
    }).join('')}</div>
  </div>`;
}

function renderCardSchedule(rows){
  return rows.map(e=>{
    const archived=isPast(e);
    const detail = detailedMode ? `
      <small>${e.day} • ${e.time} • ${e.place}</small>
      ${e.meeting?`<small><b>Találkozó:</b> ${e.meeting}</small>`:''}
      ${e.matchKind==='away' && e.address ? `<small>${e.address}</small>${mapLink(e)}` : ''}
      ${archived?'<span class="archive-badge">Lezárt</span>':''}
    ` : '';
    return `<div class="planner-row ${cardClass(e)} ${archived?'archived-row':''}">
      <div class="planner-icon bare-icon">${typeIcon(e)}</div>
      <div class="planner-main"><b>${e.date} · ${e.title}</b>${detail}</div>
      <div class="planner-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></div>
      ${plannerStatusControls(e,archived)}
    </div>`;
  }).join('') || `<div class="empty-state">Nincs találat a szűrésre.</div>`;
}

function renderPlanner(){
  const rows=filteredPlannerEvents();
  const settingsToggle=document.getElementById('settingsDetailToggle');
  if(settingsToggle) settingsToggle.checked=detailedMode;
  const defaultView=document.getElementById('settingsDefaultView');
  if(defaultView) defaultView.value=localStorage.getItem('cc-planner-mode') || 'cards';

  document.querySelectorAll('.view-mode-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===plannerMode));

  if(plannerMode==='grid') plannerList.innerHTML=renderGridMatrix(rows);
  else if(plannerMode==='calendar') plannerList.innerHTML=renderCalendar(rows);
  else plannerList.innerHTML=renderCardSchedule(rows);

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
  const open=e.target.closest('[data-open-event]');
  if(open){ openEventDialog(open.dataset.openEvent); return; }
  const nav=e.target.closest('[data-cal-nav]');
  if(nav){
    if(!calendarCursor) calendarCursor=initialCalendarCursor(filteredPlannerEvents());
    calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+(nav.dataset.calNav==='next'?1:-1),1);
    renderPlanner(); return;
  }
  const b=e.target.closest('[data-slider-action]');
  if(!b) return;
  const ev=events.find(x=>x.id===b.dataset.id);
  if(!ev || isPast(ev)) return;
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
    if(plannerMode==='calendar') calendarCursor=initialCalendarCursor(filteredPlannerEvents());
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
    localStorage.setItem('cc-planner-mode',plannerMode);
    if(plannerMode==='calendar') calendarCursor=initialCalendarCursor(filteredPlannerEvents());
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
document.getElementById('settingsDefaultView')?.addEventListener('change',e=>{
  plannerMode=e.target.value;
  localStorage.setItem('cc-planner-mode',plannerMode);
  if(plannerMode==='calendar') calendarCursor=initialCalendarCursor(filteredPlannerEvents());
  renderPlanner();
});
document.getElementById('settingsRefreshBtn')?.addEventListener('click',e=>{
  const old=e.currentTarget.textContent;
  e.currentTarget.textContent='✓ Frissítve';
  renderEvents(); renderPlanner();
  setTimeout(()=>e.currentTarget.textContent=old,900);
});



const eventDialog=document.getElementById('eventDialog');
function eventDialogRoster(e){
  return `<div class="dialog-roster"><div><b>Jönnek (${(e.yes||[]).length})</b><div class="chips">${(e.yes||[]).map(n=>`<span class="chip">${n}</span>`).join('')}</div></div><div><b>Nem jönnek (${(e.no||[]).length})</b><div class="chips">${(e.no||[]).map(n=>`<span class="chip no">${n}</span>`).join('')||'<span class="muted">–</span>'}</div></div><div><b>Még nem jelzett (${(e.unknown||[]).length})</b><div class="chips">${(e.unknown||[]).map(n=>`<span class="chip">${n}</span>`).join('')}</div></div></div>`;
}
function openEventDialog(eventId){
  const e=events.find(x=>x.id===eventId); if(!e) return;
  const archived=isPast(e);
  document.getElementById('eventDialogContent').innerHTML=`<div class="event-dialog-title"><div class="bare-icon large-symbol">${typeIcon(e)}</div><div><div class="event-type">${typeLabel(e)}</div><h3>${e.title}</h3><p>${e.date} • ${e.day} • ${e.time}</p></div><strong class="${attendanceCountClass((e.yes||[]).length)}">${(e.yes||[]).length} fő</strong></div>${detailedMode?`<div class="event-dialog-details"><p><b>Helyszín:</b> ${e.place||'–'}</p>${e.address?`<p>${e.address} ${mapLink(e)}</p>`:''}${e.meeting?`<p><b>Találkozó:</b> ${e.meeting}</p>`:''}</div>`:''}<div class="event-dialog-slider">${plannerStatusControls(e,archived)}</div>${eventDialogRoster(e)}`;
  if(!eventDialog.open) eventDialog.showModal();
  bindSliderDrag();
}
document.getElementById('closeEventDialogBtn')?.addEventListener('click',()=>eventDialog.close());
document.getElementById('eventDialogContent')?.addEventListener('click',e=>{
  const b=e.target.closest('[data-slider-action]'); if(!b) return;
  const ev=events.find(x=>x.id===b.dataset.id); if(!ev || isPast(ev)) return;
  if(b.dataset.sliderAction==='yes') setYes(ev);
  else if(b.dataset.sliderAction==='no'){ eventDialog.close(); askCancel(ev); return; }
  else neutralizeEvent(ev);
  setTimeout(()=>openEventDialog(ev.id),0);
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
    currentPlayerName=j.player.name||'Te';
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

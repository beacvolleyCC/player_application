
const DEMO_NOW = new Date('2026-09-05T12:00:00');

const events = [
  {id:'ev-2026-08-30',archived:true,date:'2026.08.30.',day:'Vasárnap',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 1. pálya',month:'Aug',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:['Viki'],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-01',archived:true,date:'2026.09.01.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Réka','Juli','Kata','Sára','Nóri','Eszter'],no:['Dóri','Viki'],unknown:['Te','Fanni','Lili','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':3,'Center':2,'Liberó':1}},
  {id:'ev-2026-09-04',archived:true,date:'2026.09.04.',day:'Péntek',time:'19:30',type:'Meccs',title:'BEAC – Corvinus',place:'BEAC',month:'Szept',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:[],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-08',date:'2026.09.08.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Fanni','Réka','Juli','Kata','Lili','Sára','Nóri'],no:['Dóri'],unknown:['Te','Eszter','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':2,'Négyes':3,'Center':2,'Liberó':2}},
  {id:'ev-2026-09-10',date:'2026.09.10.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 1. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca'],no:['Dóri'],unknown:['Te','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-02',date:'2026.10.02.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Csapatedzés',place:'Bogdánfy • 2. pálya',month:'Okt',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':0,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-14',date:'2026.10.14.',day:'Kedd',time:'19:30',type:'Meccs',title:'BEAC – TFSE',place:'BEAC',month:'Okt',status:null,yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri'],no:['Viki'],unknown:['Te','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':2,'Center':1,'Liberó':1}},
  {id:'ev-2026-11-04',date:'2026.11.04.',day:'Kedd',time:'19:30',type:'Meccs',title:'BEAC – Budai IX. C',place:'BEAC',month:'Nov',status:null,yes:['Anna','Dóri','Petra'],no:[],unknown:['Te','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-11-18',date:'2026.11.18.',day:'Kedd',time:'19:30',type:'Meccs',title:'BEAC – Corvinus',place:'BEAC',month:'Nov',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':0,'Center':0,'Liberó':0}},
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

function eventCard(e){
  const positions = Object.entries(e.positions).map(([k,v])=>`<span><b>${k}</b> ${v}</span>`).join('');
  return `<article class="event-card ${cardClass(e)}">
    <div class="event-top centered-card">
      <div class="event-main">
        <div class="event-type">${e.type}</div>
        <div class="event-title">${e.date} • ${e.time}</div>
        <div class="event-meta">${e.day} • ${e.title} • ${e.place}</div>
      </div>
      <div class="count-badge">${e.yes.length} fő jön</div>
    </div>

    <div class="event-actions">
      <button class="status-btn yes ${e.status==='yes'?'active':''}" data-action="yes" data-id="${e.id}">✓ Jövök</button>
      <button class="status-btn no ${e.status==='no'?'active':''}" data-action="no" data-id="${e.id}">✕ Nem jövök</button>
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
}

function renderPlanner(){
  const mf = document.getElementById('monthFilter').value;
  const tf = document.getElementById('typeFilter').value;
  const sf = document.getElementById('statusFilter').value;
  let rows = events.filter(e => {
    if(mf!=='all' && e.month!==mf) return false;
    if(tf!=='all' && e.type!==tf) return false;
    if(missingOnly && e.status!==null) return false;
    if(sf==='yes' && e.status!=='yes') return false;
    if(sf==='no' && e.status!=='no') return false;
    if(sf==='none' && e.status!==null) return false;
    return true;
  });

  plannerList.innerHTML = rows.map(e=>{
    const archived=isPast(e);
    return `<div class="planner-row ${cardClass(e)} ${archived?'archived-row':''}">
      <div class="planner-date">${e.date}</div>
      <div class="planner-main">
        <b>${e.title}</b>
        <small>${e.day} • ${e.time} • ${e.type}</small>
        ${archived?'<span class="archive-badge">Lezárt</span>':''}
      </div>
      <div class="segmented ${archived?'disabled-segmented':''}">
        <button class="${e.status==='yes'?'sel-yes':''}" data-pid="${e.id}" data-pstatus="yes" ${archived?'disabled':''}>✓</button>
        <button class="${e.status==='no'?'sel-no':''}" data-pid="${e.id}" data-pstatus="no" ${archived?'disabled':''}>✕</button>
        <button class="${e.status===null?'sel-none':''}" data-pid="${e.id}" data-pstatus="" ${archived?'disabled':''}>–</button>
      </div>
    </div>`;
  }).join('') || `<div class="empty-state">Nincs találat a szűrésre.</div>`;
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

eventList.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]');
  if(btn){
    const ev=events.find(x=>x.id===btn.dataset.id);
    btn.dataset.action==='yes' ? setYes(ev) : askCancel(ev);
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
  const b=e.target.closest('[data-pid]');
  if(!b) return;
  const ev=events.find(x=>x.id===b.dataset.pid);
  if(isPast(ev)) return;
  if(b.dataset.pstatus==='yes') setYes(ev);
  else if(b.dataset.pstatus==='no') askCancel(ev);
  else {
    persist(ev,null,'');
    renderEvents();
    renderPlanner();
  }
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

['monthFilter','typeFilter','statusFilter'].forEach(id=>{
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


const manualReloadBtn = document.getElementById('manualReloadBtn');
if (manualReloadBtn) {
  manualReloadBtn.addEventListener('click', () => {
    const old = manualReloadBtn.textContent;
    manualReloadBtn.textContent = '✓ Frissítve';
    renderEvents();
    renderPlanner();
    setTimeout(() => manualReloadBtn.textContent = old, 1100);
  });
}

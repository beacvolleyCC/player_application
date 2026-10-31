'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const start=app.indexOf('function bindSliderDrag(){');
const end=app.indexOf('// ---------------------------------------------------------------------------\n// Player V2.3.9.2',start);
assert.ok(start>=0 && end>start,'Slider implementation must be present');
const sliderSource=app.slice(start,end);

function harness(initial=null){
  const listeners=new Map(), classes=new Set(['attendance-slider',initial||'none']);
  const pending=[];
  const event={id:'ev-rsvp',status:initial,note:''};
  let captures=0, releases=0, confirms=0;
  const thumb={getBoundingClientRect:()=>({width:90})};
  const slider={
    dataset:{slider:event.id},
    clientWidth:300,
    classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x))},
    style:{setProperty:()=>{},removeProperty:()=>{}},
    querySelector:sel=>sel==='.slider-thumb'?thumb:null,
    contains:()=>true,
    closest:()=>null,
    addEventListener:(type,fn)=>listeners.set(type,fn),
    setPointerCapture:()=>{captures++},
    releasePointerCapture:()=>{releases++}
  };
  const stateButton=action=>({
    dataset:{sliderAction:action},
    closest:selector=>selector==='[data-slider-action]'?stateButtonObject:null
  });
  let stateButtonObject=null;
  const env={
    document:{querySelectorAll:()=>[slider]},
    events:[event],isPast:()=>false,
    performance:{now:()=>100},
    CC_MOTION_V1:{directionLock:8,snap:200,tapSnap:140},
    ccPrefersReducedMotion_:()=>false,
    window:{setTimeout:fn=>{pending.push(fn);return pending.length;}},
    eventDialog:null,
    setYes:ev=>{ev.status='yes'},
    askCancel:ev=>{ev.status='no'},
    neutralizeEvent:ev=>{ev.status=null},
    persist:(ev,status)=>{ev.status=status},
    renderEvents:()=>{},renderPlanner:()=>{},
    confirm:()=>{confirms++;return true}
  };
  vm.runInNewContext(sliderSource+';bindSliderDrag()',env);
  const ptr=(type,x,y)=>{const fn=listeners.get(type);assert.ok(fn,type+' listener');fn({
    pointerId:1,button:0,clientX:x,clientY:y,preventDefault:()=>{}
  })};
  const click=action=>{
    stateButtonObject=stateButton(action);
    const handler=listeners.get('click');
    assert.ok(handler,'click handler');
    handler({target:stateButtonObject,preventDefault:()=>{},stopPropagation:()=>{},stopImmediatePropagation:()=>{}});
    flush();
  };
  function flush(){while(pending.length)pending.shift()()}
  return {event,ptr,click,flush,captureCount:()=>captures,releaseCount:()=>releases,confirmCount:()=>confirms};
}

test('tap on state button does not capture pointer; it commits the clicked choice',()=>{
  const h=harness();
  h.ptr('pointerdown',50,10);
  assert.equal(h.captureCount(),0,'pointerdown must not steal button click');
  h.ptr('pointerup',50,10);
  assert.equal(h.captureCount(),0);
  h.click('yes');
  assert.equal(h.event.status,'yes');
});

test('tapping a distant choice moves only one state, including confirmation for YES -> neutral',()=>{
  const h=harness('yes');
  h.ptr('pointerdown',270,10);
  h.ptr('pointerup',270,10);
  h.click('no');
  assert.equal(h.event.status,null);
  assert.equal(h.confirmCount(),1);
});

test('vertical scroll intent does not capture; horizontal dragging still captures and commits',()=>{
  const vertical=harness();
  vertical.ptr('pointerdown',150,10);
  vertical.ptr('pointermove',153,42);
  assert.equal(vertical.captureCount(),0);
  vertical.ptr('pointerup',153,42);
  assert.equal(vertical.event.status,null);

  const drag=harness();
  drag.ptr('pointerdown',150,10);
  drag.ptr('pointermove',240,11);
  assert.equal(drag.captureCount(),1,'horizontal drag should capture pointer');
  drag.ptr('pointerup',240,11);
  drag.flush();
  assert.equal(drag.event.status,'no');
  assert.equal(drag.releaseCount(),1);
});

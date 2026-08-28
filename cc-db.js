(function(){
  'use strict';
  const DB_NAME='club-control-manager-pwa';
  const DB_VERSION=1;
  const STORE='kv';

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){ reject(new Error('IndexedDB unavailable')); return; }
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error || new Error('IndexedDB open failed'));
    });
  }

  async function withStore(mode, fn){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,mode);
      const store=tx.objectStore(STORE);
      let result;
      try{ result=fn(store); }catch(e){ db.close(); reject(e); return; }
      tx.oncomplete=()=>{ db.close(); resolve(result && result.result); };
      tx.onerror=()=>{ db.close(); reject(tx.error || new Error('IndexedDB transaction failed')); };
      tx.onabort=()=>{ db.close(); reject(tx.error || new Error('IndexedDB transaction aborted')); };
    });
  }

  window.CCDB={
    async get(key){
      try{
        const db=await openDb();
        return await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,'readonly');
          const req=tx.objectStore(STORE).get(key);
          req.onsuccess=()=>{ const v=req.result; db.close(); resolve(v); };
          req.onerror=()=>{ db.close(); reject(req.error); };
        });
      }catch(e){
        try{ const raw=localStorage.getItem('ccdb:'+key); return raw ? JSON.parse(raw) : undefined; }catch(_){ return undefined; }
      }
    },
    async set(key,value){
      try{ await withStore('readwrite', store=>store.put(value,key)); }
      catch(e){ try{ localStorage.setItem('ccdb:'+key,JSON.stringify(value)); }catch(_){} }
      return value;
    },
    async del(key){
      try{ await withStore('readwrite', store=>store.delete(key)); }catch(e){ try{ localStorage.removeItem('ccdb:'+key); }catch(_){} }
    },
    async clear(){
      try{ await withStore('readwrite', store=>store.clear()); }
      catch(e){
        try{ Object.keys(localStorage).filter(k=>k.indexOf('ccdb:')===0).forEach(k=>localStorage.removeItem(k)); }catch(_){}
      }
    }
  };
})();
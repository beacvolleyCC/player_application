/* Non-destructive UI translation: keeps the original Hungarian source nodes. */
(function(root){
'use strict';
const source=new WeakMap();
const attrs=new WeakMap();
let language='hu', observer=null, busy=false;
const trans=()=>root.CCPlayerStaticI18n;
function translateText(node){
 if(!node||!node.parentElement||node.parentElement.closest('script,style,textarea,[contenteditable="true"]'))return;
 const original=source.has(node)?source.get(node):node.nodeValue;
 if(!source.has(node))source.set(node,original);
 const translated=trans()?.translateStatic(original,language)||original;
 if(node.nodeValue!==translated)node.nodeValue=translated;
}
function translateElement(el){
 if(!el||el.nodeType!==1)return;
 for(const attr of ['placeholder','title','aria-label','alt']){
  if(!el.hasAttribute(attr))continue;
  let saved=attrs.get(el);
  if(!saved){saved={};attrs.set(el,saved);}
  if(!(attr in saved))saved[attr]=el.getAttribute(attr);
  const translated=trans()?.translateStatic(saved[attr],language)||saved[attr];
  if(el.getAttribute(attr)!==translated)el.setAttribute(attr,translated);
 }
}
function visit(rootNode){
 if(!rootNode)return;
 if(rootNode.nodeType===3){translateText(rootNode);return;}
 if(rootNode.nodeType!==1&&rootNode.nodeType!==9)return;
 if(rootNode.nodeType===1)translateElement(rootNode);
 const walker=document.createTreeWalker(rootNode,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  if(walker.currentNode.nodeType===3)translateText(walker.currentNode);
  else translateElement(walker.currentNode);
 }
}
function setLanguage(next){
 language=root.CCPlayerI18n?.normalizeLanguage(next)||'hu';
 document.documentElement.lang=language;
 try{localStorage.setItem('cc-player-language',language);}catch(_){}
 busy=true;
 try{visit(document.body);}finally{busy=false;}
 return language;
}
function start(){
 const selected=document.getElementById('settingsLanguage');
 const saved=(()=>{try{return localStorage.getItem('cc-player-language');}catch(_){return null;}})();
 setLanguage(saved||selected?.value||navigator.language||'hu');
 if(selected){selected.value=language;selected.addEventListener('change',()=>setLanguage(selected.value));}
 observer=new MutationObserver(records=>{
  if(busy)return;
  busy=true;
  try{
   for(const record of records){
    if(record.type==='childList'){
     for(const node of record.addedNodes)visit(node);
    }else if(record.type==='characterData'){
     const node=record.target;
     const old=source.get(node);
     if(old!==undefined&&node.nodeValue!==trans()?.translateStatic(old,language))source.set(node,node.nodeValue);
     translateText(node);
    }
   }
  }finally{busy=false;}
 });
 observer.observe(document.body,{childList:true,characterData:true,subtree:true});
}
root.CCPlayerLanguage=Object.freeze({setLanguage,getLanguage:()=>language,start});
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
})(typeof globalThis!=='undefined'?globalThis:this);

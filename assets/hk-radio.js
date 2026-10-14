/* Hayakkom — "Cairo on the dial": a small floating radio button.
   Plays a Cairo radio channel for ~10 s, then fades slowly into the next, like turning a dial.
   - Nothing is downloaded until the visitor's first tap/click (browsers block sound before that).
   - On by default; one tap on the button mutes it, and the choice is remembered.
   - Pauses while the tab is hidden, while a form field is focused and while other media plays.
   Station list: edit CHANNELS below (official stream addresses only). Empty list = no button. */
(function(){
"use strict";
var CHANNELS=[
  /* Favourites first, in this order: Umm Kulthum, Amr Diab, then Tamer Hosny (when added), Sherine.
     Then the other Cairo stations. A stream that does not play is skipped automatically for a while and retried later.
     Remove a line to remove a station. Only https:// streams work on an https:// website. */
  {n:"Umm Kulthum",u:"https://stream.zeno.fm/hp0vu6c0pnhvv"}, /* dedicated Umm Kulthum channel; spares if it ever dies: https://stream.zeno.fm/y70e5x46kd5tv , https://stream.zeno.fm/vdws5ggv24zuv */
  {n:"Amr Diab",u:"https://stream.zeno.fm/pet0ex02qa0uv"},
  /* 3rd: Tamer Hosny. Paste his https stream link below, then Sherine moves to 4th:
  {n:"Tamer Hosny",u:"PASTE-LINK-HERE"}, */
  {n:"Sherine",u:"https://stream.zeno.fm/njscyudhthkvv"},
  {n:"Radio Hits 88.2",u:"https://radiohits882.radioca.st/;"},
  {n:"Nogoum FM",u:"https://stream.zeno.fm/qb1zvsykm98uv"},
  {n:"Radio 9090",u:"https://9090streaming.mobtada.com/9090FMEGYPT"},
  {n:"Mix FM 87.8",u:"https://stream-29.zeno.fm/na3vpvn10qruv"},
  {n:"Nogoum FM Mix",u:"https://stream.zeno.fm/0ms1g2tgr18uv"},
  {n:"90s FM",u:"https://eu1.fastcast4u.com/proxy/prontofm?mp=/1"},
  {n:"NRJ Egypt",u:"https://nrjstreaming.ahmed-melege.com/nrjegypt"},
  {n:"Nagham FM",u:"https://ahmsamir.radioca.st/stream/;"}
];
var CH=(window.HK_RADIO_CHANNELS&&window.HK_RADIO_CHANNELS.length)?window.HK_RADIO_CHANNELS:CHANNELS;
if(!CH.length||window.__hkRadioLoaded)return;
window.__hkRadioLoaded=1;

var SLOT=(window.HK_RADIO_SLOT||15000), FADE=(window.HK_RADIO_FADE||1000), PRE=2500, VOL=.28; /* volume 0-1: change here to make it louder or quieter */
try{if(window.matchMedia&&matchMedia("(pointer:coarse)").matches)VOL=.55}catch(e){} /* phone speakers are small: louder than on a desktop */
var AR=/^ar/i.test(document.documentElement.lang||"")||document.documentElement.dir==="rtl";
var TX=AR?{
  mute:"كتم إذاعة القاهرة",unmute:"تشغيل إذاعة القاهرة",
  pill:"من القاهرة على الهواء · اضغط للكتم",pillWait:"اضغط في أي مكان للتشغيل · أو هنا للكتم",pillOff:"الصوت مكتوم · اضغط للتشغيل",pillRetry:"تعذّر التشغيل الآن · اضغط للمحاولة",
  tip:"إذاعات القاهرة تعمل الآن 🎧 اضغط الزر في أي وقت لكتم الصوت.",
  tip2:"اضغط في أي مكان لتسمع إذاعات القاهرة 🎧 والزر لكتم الصوت.",close:"إغلاق"
}:{
  mute:"Mute Cairo radio",unmute:"Play Cairo radio",
  pill:"On air from Cairo · tap to mute",pillWait:"Tap anywhere to start · or here to mute",pillOff:"Sound off · tap to play",pillRetry:"Could not play just now · tap to retry",
  tip:"Cairo radio is on 🎧 Tap this button any time to mute.",
  tip2:"Tap anywhere to hear Cairo radio 🎧 Use this button to mute.",close:"Close"
};
var DBG=/[?&]radiodebug=1/.test(location.search),dbgEl=null;
function dbg(m){
  if(!DBG)return;
  if(!dbgEl){dbgEl=document.createElement("pre");dbgEl.style.cssText="position:fixed;top:0;left:0;right:0;max-height:45vh;overflow:auto;margin:0;padding:6px 8px;background:rgba(0,0,0,.85);color:#9fe;font:11px/1.4 monospace;z-index:2147483647;white-space:pre-wrap";document.body.appendChild(dbgEl)}
  dbgEl.textContent+=((performance.now()/1000).toFixed(1)+"s "+m+"\n");dbgEl.scrollTop=dbgEl.scrollHeight;
}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}

var on=get("hkRadio")!=="off";
var playing=false,suspended=false,gaveUp=false,armed=false;
var cur=0,act=0,nextIdx=0,timer=0,raf=0,fails=0,tipTimer=0,resumeTimer=0;
var els=[],dead={},rafs={},muteTok=0;
function isDead(i){return dead[i]&&Date.now()-dead[i]<420000}
function markDead(i){dead[i]=Date.now()}
function nextOk(i){var n=CH.length,k;for(k=1;k<=n;k++){var j=(i+k)%n;if(!isDead(j))return j}dead={};return (i+1)%n}
function firstOk(){var k;for(k=0;k<CH.length;k++)if(!isDead(k))return k;dead={};return 0}
var canVol=true;

/* ---------- UI ---------- */
var css=".hkr{position:fixed;left:32px;bottom:96px;z-index:997;transition:opacity .2s,bottom .25s}"+
".hkr-btn{width:44px;height:44px;border-radius:50%;border:2px solid #B8922A;background:#0A2E36;color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 6px 18px rgba(10,46,54,.28);position:relative;-webkit-tap-highlight-color:transparent}"+
".hkr-btn:hover{background:#0E4A57}.hkr-btn:focus-visible{outline:3px solid #F1D98B;outline-offset:2px}"+
".hkr-btn svg{width:22px;height:22px;display:block}.hkr-btn .off{display:none}.hkr-btn[aria-pressed=false] .on{display:none}.hkr-btn[aria-pressed=false] .off{display:block}"+
".hkr-btn[data-state=playing]:after{content:'';position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(184,146,42,.55);animation:hkrp 2.4s ease-out infinite}"+
"@keyframes hkrp{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.25);opacity:0}}"+
"@media(prefers-reduced-motion:reduce){.hkr-btn[data-state=playing]:after{animation:none;opacity:.6}}"+
".hkr-tip{position:absolute;left:0;bottom:calc(100% + 14px);width:220px;background:#fff;color:#0A2E36;border:1px solid #D7E5E4;border-radius:14px;padding:10px 30px 10px 12px;font:13.5px/1.6 Inter,system-ui,sans-serif;box-shadow:0 10px 28px rgba(10,46,54,.22);opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s;pointer-events:none}"+
".hkr-tip.show{opacity:1;transform:none;pointer-events:auto}.hkr-tip[hidden]{display:none}"+
".hkr-tip:before{content:'';position:absolute;left:16px;bottom:-7px;width:12px;height:12px;background:#fff;border-right:1px solid #D7E5E4;border-bottom:1px solid #D7E5E4;transform:rotate(45deg)}"+
".hkr-pill{position:absolute;left:calc(100% + 10px);top:50%;margin-top:-16px;height:32px;display:flex;align-items:center;white-space:nowrap;background:linear-gradient(90deg,#B8922A,#E8C964);color:#0A2E36;font:600 12.5px/1 Inter,system-ui,sans-serif;padding:0 14px;border-radius:999px;box-shadow:0 6px 16px rgba(10,46,54,.28);opacity:0;transform:translateX(-8px);transition:opacity .35s,transform .35s;pointer-events:none;cursor:pointer;border:0}"+
".hkr-pill.show{opacity:1;transform:none;pointer-events:auto}.hkr-pill:before{content:'';position:absolute;left:-5px;top:11px;width:10px;height:10px;background:#B8922A;transform:rotate(45deg)}"+
".hkr-pill.show.bounce{animation:hkrnudge 1s ease-in-out infinite}"+
"@keyframes hkrnudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}"+
".hkr-btn.flash{animation:hkrflash 1s ease-in-out infinite}"+
"@keyframes hkrflash{0%,100%{transform:translateY(0);box-shadow:0 6px 18px rgba(10,46,54,.28)}50%{transform:translateY(-5px);box-shadow:0 0 0 6px rgba(232,201,100,.5),0 10px 22px rgba(10,46,54,.3)}}"+
"@media(prefers-reduced-motion:reduce){.hkr-pill.show.bounce,.hkr-btn.flash{animation:none}}"+
".hkr-tip[dir=rtl]{padding:10px 12px 10px 30px}"+
".hkr-x{position:absolute;top:4px;right:6px;border:0;background:none;color:#4B656C;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.hkr-tip[dir=rtl] .hkr-x{right:auto;left:6px}"+
"body.form-active .hkr{opacity:.4}body.form-active .hkr:hover{opacity:1}"+
"body.menu-open .hkr{opacity:0;visibility:hidden;pointer-events:none}body.hk-ai-open .hkr,body.cc-open .hkr-tip{display:none}"+
"@media(max-width:600px){.hkr{left:22px;bottom:84px}.hkr-btn{width:42px;height:42px}.hkr-tip{width:190px}.hkr-pill{font-size:12px;padding:0 11px}}";
var wrap,btn,tip,pill,pillTimer=0,flashTimer=0;
function build(){
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  wrap=document.createElement("div");wrap.className="hkr";wrap.id="hkRadioWrap";
  wrap.innerHTML='<button id="hkRadio" class="hkr-btn" type="button" aria-pressed="true">'+
   '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'+
   '<svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg></button>'+
   '<button class="hkr-pill" type="button" tabindex="-1" aria-hidden="true"></button><div class="hkr-tip" role="status" hidden><span class="hkr-msg"></span><button class="hkr-x" type="button">×</button></div>';
  document.body.appendChild(wrap);
  btn=wrap.querySelector(".hkr-btn");tip=wrap.querySelector(".hkr-tip");pill=wrap.querySelector(".hkr-pill");
  pill.addEventListener("click",onBtn);
  tip.setAttribute("dir",AR?"rtl":"ltr");tip.querySelector(".hkr-x").setAttribute("aria-label",TX.close);
  btn.addEventListener("click",onBtn);
  place();window.addEventListener("resize",place);
  try{new MutationObserver(place).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(e){}
  [400,1200,2500,5000].forEach(function(t){setTimeout(place,t)});
  setInterval(place,800);
  tip.querySelector(".hkr-x").addEventListener("click",hideTip);
  ui();
}
/* Sit directly above the WhatsApp button, centred on it, wherever the rest of the site puts it
   (it lifts when the cookie bar is open). Falls back to the CSS position if it is not found. */
function place(){
  if(!wrap)return;
  if(!wrap.isConnected&&document.body)document.body.appendChild(wrap);
  var list=document.querySelectorAll(".fab-wa"),w=null,i,r;
  for(i=0;i<list.length;i++){r=list[i].getBoundingClientRect();if(r.width>0&&r.height>0){w=r;break}}
  if(!w)return;
  var bw=btn.offsetWidth||44;
  wrap.style.left=Math.max(8,Math.round(w.left+w.width/2-bw/2))+"px";
  wrap.style.bottom=Math.max(8,Math.round(window.innerHeight-w.top+12))+"px";
}
function ui(){
  if(!btn)return;
  wrap.style.display="";
  btn.setAttribute("aria-pressed",on?"true":"false");
  btn.setAttribute("aria-label",on?TX.mute:TX.unmute);btn.title=on?TX.mute:TX.unmute;
  btn.setAttribute("data-state",!on?"muted":(playing?"playing":(gaveUp?"error":"waiting")));
  btn.setAttribute("data-ch",playing&&CH[cur]?CH[cur].n:"");
}
/* a bouncing, flashing label next to the button that says how to mute; it settles after a few seconds */
function attention(msg,ms,flash){
  if(!pill)return;
  pill.textContent=msg;pill.classList.add("show");
  pill.classList.toggle("bounce",!!flash);btn.classList.toggle("flash",!!flash);
  clearTimeout(pillTimer);clearTimeout(flashTimer);
  if(flash)flashTimer=setTimeout(function(){btn.classList.remove("flash");pill.classList.remove("bounce")},Math.min(ms,9000));
  if(ms>0)pillTimer=setTimeout(function(){pill.classList.remove("show","bounce");btn.classList.remove("flash")},ms); /* ms=0: label stays until the state changes */
}
function showTip(msg){
  if(get("hkRadioTip")==="1"||!tip||!on)return;
  if(document.body.classList.contains("cc-open"))return;
  tip.querySelector(".hkr-msg").textContent=msg;tip.hidden=false;
  requestAnimationFrame(function(){tip.classList.add("show")});
  set("hkRadioTip","1");clearTimeout(tipTimer);tipTimer=setTimeout(hideTip,9000);
}
function hideTip(){if(!tip)return;tip.classList.remove("show");clearTimeout(tipTimer);setTimeout(function(){tip.hidden=true},350)}

/* ---------- audio engine ---------- */
function mk(){
  var a=document.createElement("audio");a.preload="none";a.setAttribute("playsinline","");a.setAttribute("aria-hidden","true");a.style.display="none";
  a.addEventListener("error",function(){onStreamError(a)});
  a.addEventListener("ended",function(){if(a.getAttribute("src")){dbg("stream ended (live streams should not)");onStreamError(a)}});
  document.body.appendChild(a);return a;
}
function sv(el,v){if(canVol){try{el.volume=Math.max(0,Math.min(1,v))}catch(e){}}}
function fade(list,ms,done,kind){
  kind=kind||"m";cancelAnimationFrame(rafs[kind]);
  if(!canVol||ms<=0){list.forEach(function(x){sv(x.el,x.to)});if(done)done();return}
  var t0=performance.now();
  (function step(t){
    var k=Math.min(1,(t-t0)/ms),e=k*k*(3-2*k);
    list.forEach(function(x){sv(x.el,x.from+(x.to-x.from)*e)});
    if(k<1)rafs[kind]=requestAnimationFrame(step);else if(done)done();
  })(t0);
}
function release(el){try{el.pause();el.removeAttribute("src");el.load()}catch(e){}}
function stopAll(){
  busy=false;clearTimeout(timer);cancelAnimationFrame(raf);cancelAnimationFrame(rafs.m);cancelAnimationFrame(rafs.x);playing=false;
  els.forEach(function(el){release(el)});ui();
}
var tS=0,Ct=0; /* tS = when the current station became audible; Ct = when the next crossfade must start */
function load(el,i){el.src=CH[i].u;sv(el,0);var p=el.play();return p&&p.catch?p:Promise.resolve()}

function resumeIdx(){var r=null;try{r=JSON.parse(sessionStorage.getItem("hkRadioResume")||"null");sessionStorage.removeItem("hkRadioResume")}catch(e){}
  if(r&&typeof r.i==="number"&&r.i>=0&&r.i<CH.length&&Date.now()-r.t<30000&&!isDead(r.i))return r.i;return firstOk()}
function saveResume(){try{if(on&&(playing||armed))sessionStorage.setItem("hkRadioResume",JSON.stringify({i:cur,t:Date.now()}))}catch(e){}}
var stallT=0,stallN=0;
function stallCheck(){var el=els[act];if(!playing||!el||busy||suspended||document.hidden){stallN=0;return}
  if(el.paused){if(++stallN>=2){stallN=0;try{var pr=el.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){}}return}
  if(el.currentTime===stallT){if(++stallN>=5){stallN=0;clearTimeout(timer);if(canVol)prepare();else hard()}}else{stallN=0;stallT=el.currentTime}}
function begin(){
  dbg("begin on="+on+" playing="+playing+" suspended="+suspended+" gaveUp="+gaveUp+" hidden="+document.hidden);
  if(!on||playing||suspended||gaveUp||document.hidden)return;
  els.forEach(function(x){release(x)});act=0;clearTimeout(timer);cancelAnimationFrame(rafs.x);
  if(!els.length){
    els=[mk()];
    try{els[0].volume=.5;canVol=els[0].volume===.5}catch(e){canVol=false}
    dbg("canVol="+canVol+" VOL="+VOL+" UA="+navigator.userAgent.slice(0,90));
    if(canVol)els.push(mk()); /* phones that cannot fade (iPhone) use one element and cut between channels */
  }
  var el=els[act];cur=resumeIdx();
  load(el,cur).then(function(){
    if(!on||suspended){release(el);return}
    dbg("PLAYING "+CH[cur].n);playing=true;armed=false;sv(el,0);ui();
    fade([{el:el,from:0,to:VOL}],FADE);
    if(!canVol)sv(el,1);
    tS=performance.now();schedule();watch(el);attention(TX.pill,6000,true);showTip(TX.tip);
  }).catch(function(err){
    dbg("play failed: "+(err&&err.name)+" "+(err&&err.message||"")+" ("+CH[cur].n+")");
    release(el);
    if(err&&err.name==="NotAllowedError"){arm();attention(TX.pillWait,0,true);showTip2()}
    else{markDead(cur);fails++;if(fails>CH.length*2){giveUp()}else setTimeout(begin,150)}
  });
}
var retryT=0;
function giveUp(){gaveUp=true;stopAll();ui();attention(TX.pillRetry,0,false);clearTimeout(retryT);retryT=setTimeout(function(){if(on&&gaveUp&&!document.hidden){gaveUp=false;fails=0;dead={};begin()}},20000)}
function showTip2(){clearTimeout(tipTimer);setTimeout(function(){if(!playing)showTip(TX.tip2)},2500)}
function schedule(){
  if(CH.length<2)return;
  clearTimeout(timer);
  var left=Math.max(0,tS+SLOT-performance.now());
  Ct=tS+SLOT; /* every station gets exactly SLOT ms, measured from when it became audible */
  if(!canVol)timer=setTimeout(hard,left);
  else timer=setTimeout(prepare,Math.max(300,left-5000));
}
/* single-element mode: straight cut to the next channel (the same element stays "unlocked" on iPhone) */
var busy=false;
function hard(){
  if(!playing||busy)return;
  busy=true;clearTimeout(timer);
  cur=nextOk(cur);var el=els[0];
  load(el,cur).then(function(){busy=false;sv(el,1);fails=0;ui();tS=performance.now();schedule();watch(el)}).catch(function(){
    busy=false;markDead(cur);fails++;if(fails>CH.length*3){giveUp();return}hard();
  });
}
/* a stream that "plays" but delivers no audio within 6 s is treated as dead */
function watch(el){
  setTimeout(function(){
    if(!playing||el!==els[act]||el.paused||el.currentTime>=.5)return;
    markDead(cur);fails++;if(fails>CH.length*3){giveUp();return}
    clearTimeout(timer);if(canVol)prepare();else hard();
  },12000);
}
function prepare(){
  if(!playing)return;
  nextIdx=nextOk(cur);
  var nx=els[1-act];
  load(nx,nextIdx).catch(function(){});
  timer=setTimeout(function(){waitReady(nx,Date.now())},300);
}
function waitReady(nx,t0){
  if(!playing)return;
  var rdy=nx.readyState>=3||(nx.readyState>=2&&Date.now()-t0>1200);
  if(rdy&&performance.now()>=Ct-1)return cross(nx);
  if(rdy){timer=setTimeout(function(){waitReady(nx,t0)},Math.min(250,Math.max(20,Ct-performance.now())));return}
  if(performance.now()>Ct+4000||Date.now()-t0>12000){markDead(nextIdx);fails++;release(nx);
    if(fails>CH.length*3){giveUp();return}
    return prepare()}
  timer=setTimeout(function(){waitReady(nx,t0)},250);
}
function cross(nx){
  var old=els[act];tS=performance.now();
  fade([{el:old,from:VOL,to:0},{el:nx,from:0,to:VOL}],FADE,function(){
    if(!playing)return;release(old);act=1-act;cur=nextIdx;fails=0;ui();schedule();watch(els[act]);
  },"x");
  if(!canVol){sv(nx,1);setTimeout(function(){release(old)},FADE)}
}
function onStreamError(el){
  dbg("stream error code="+(el.error&&el.error.code)+" src="+(el.getAttribute("src")||"").slice(0,60));
  if(!playing)return;
  if(el!==els[act]&&canVol&&!busy&&el.getAttribute("src")){ /* the NEXT station failed while preparing: skip it at once */
    markDead(nextIdx);fails++;release(el);clearTimeout(timer);if(fails>CH.length*3){giveUp();return}prepare();return}
  if(el===els[act]){ /* current channel died: jump to the next straight away */
    markDead(cur);fails++;if(fails>CH.length*3){giveUp();return}
    clearTimeout(timer);if(canVol)prepare();else hard();
  }
}

/* ---------- user intent ---------- */
function onBtn(){
  hideTip();pill&&pill.classList.remove("bounce");btn.classList.remove("flash");
  if(on&&gaveUp){clearTimeout(retryT);gaveUp=false;fails=0;dead={};suspended=false;begin();return} /* retry after a failure */
  if(on&&!playing&&!gaveUp){begin();return} /* "on" but sound still waiting for a first tap */
  on=!on;set("hkRadio",on?"on":"off");
  if(on){gaveUp=false;fails=0;begin()}
  else{
    /* mute: take effect at once (timers and cross-fades stop), then let the sound fade out; a quick re-tap can never leave it half-on */
    var el=els[act],tok=++muteTok,was=playing;
    clearTimeout(timer);cancelAnimationFrame(rafs.x);busy=false;playing=false;
    if(was&&el&&canVol)fade([{el:el,from:el.volume,to:0}],250,function(){if(tok===muteTok&&!on)stopAll()});else stopAll();
    attention(TX.pillOff,3500,false);
  }
  ui();
}
function arm(){
  if(armed)return;armed=true;
  var evs=["pointerup","click","keydown","touchend"];
  function go(e){
    if(wrap&&wrap.contains(e.target))return;
    evs.forEach(function(n){document.removeEventListener(n,go,true)});
    armed=false;begin();
  }
  evs.forEach(function(n){document.addEventListener(n,go,true)});
}
function suspend(){dbg("suspend");if(suspended)return;suspended=true;if(playing)stopAll();}
function resume(){
  clearTimeout(resumeTimer);
  resumeTimer=setTimeout(function(){
    var a=document.activeElement;
    if(document.hidden||otherMedia||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=="button"&&a.type!=="submit"&&a.type!=="checkbox"&&a.type!=="radio"))return;
    suspended=false;if(on&&!armed)begin();
  },700);
}
var otherMedia=0;
function init(){
  build();
  document.addEventListener("visibilitychange",function(){document.hidden?suspend():resume()});
  window.addEventListener("pagehide",function(){saveResume();stopAll()});setInterval(stallCheck,3000);
  document.addEventListener("focusin",function(e){var t=e.target;if(t&&(/^(TEXTAREA|SELECT)$/.test(t.tagName)||(t.tagName==="INPUT"&&!/^(button|submit|checkbox|radio)$/.test(t.type))||t.isContentEditable))suspend()});
  document.addEventListener("focusout",function(){resume()});
  window.addEventListener("blur",function(){setTimeout(function(){if(document.activeElement&&document.activeElement.tagName==="IFRAME")suspend()},0)});
  window.addEventListener("focus",function(){resume()});
  document.addEventListener("play",function(e){if(els.indexOf(e.target)<0){otherMedia++;suspend()}},true);
  var back=function(e){if(els.indexOf(e.target)<0&&otherMedia){otherMedia--;if(!otherMedia)resume()}};
  document.addEventListener("pause",back,true);document.addEventListener("ended",back,true);
  document.addEventListener("keydown",function(e){if(e.key==="Escape")hideTip()});
  /* keep the radio labels from covering the "Powered by" line at the bottom of the page */
  try{var pw=null,fl=document.querySelectorAll(".footer-legal");for(var q=0;q<fl.length;q++){if(/Powered by|تشغيل|بدعم|Cairo Town/i.test(fl[q].textContent)&&!fl[q].classList.contains("footer-legal-links")){pw=fl[q]}}
    if(pw&&window.IntersectionObserver){new IntersectionObserver(function(en){document.documentElement.classList.toggle("hkr-away",!!en[0].isIntersecting)},{threshold:.2}).observe(pw);
      var st=document.createElement("style");st.textContent=".hkr-away .hkr-pill,.hkr-away .hkr-tip{opacity:0!important;pointer-events:none!important;transition:opacity .2s}";document.head.appendChild(st)}}catch(e){}
  if(on)begin();
}
if(document.body)init();else document.addEventListener("DOMContentLoaded",init);
})();

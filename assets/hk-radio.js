/* Hayakkom — "Cairo on the dial": a small floating radio button.
   Plays a Cairo radio channel for ~10 s, then fades slowly into the next, like turning a dial.
   - Nothing is downloaded until the visitor's first tap/click (browsers block sound before that).
   - On by default; one tap on the button mutes it, and the choice is remembered.
   - Pauses while the tab is hidden, while a form field is focused and while other media plays.
   Station list: edit CHANNELS below (official stream addresses only). Empty list = no button. */
(function(){
"use strict";
var CHANNELS=[
  /* Candidates found in public directories, NOT yet confirmed with the stations.
     A stream that does not play is skipped automatically; if none play, the button hides itself.
     Remove a line to remove a station. */
  {n:"Radio 9090",u:"https://9090streaming.mobtada.com/9090FMEGYPT"},
  {n:"Mix FM 87.8",u:"https://stream-29.zeno.fm/na3vpvn10qruv"},
  {n:"Nogoum FM Mix",u:"https://stream.zeno.fm/0ms1g2tgr18uv"}
];
var CH=(window.HK_RADIO_CHANNELS&&window.HK_RADIO_CHANNELS.length)?window.HK_RADIO_CHANNELS:CHANNELS;
if(!CH.length||window.__hkRadioLoaded)return;
window.__hkRadioLoaded=1;

var SLOT=(window.HK_RADIO_SLOT||10000), FADE=(window.HK_RADIO_FADE||2500), PRE=1500, VOL=.3;
var AR=/^ar/i.test(document.documentElement.lang||"")||document.documentElement.dir==="rtl";
var TX=AR?{
  mute:"كتم إذاعة القاهرة",unmute:"تشغيل إذاعة القاهرة",
  tip:"إذاعات القاهرة تعمل الآن 🎧 اضغط الزر لكتم الصوت.",
  tip2:"اضغط في أي مكان لتسمع إذاعات القاهرة 🎧 والزر لكتم الصوت.",close:"إغلاق"
}:{
  mute:"Mute Cairo radio",unmute:"Play Cairo radio",
  tip:"Cairo radio is on 🎧 Tap this button any time to mute.",
  tip2:"Tap anywhere to hear Cairo radio 🎧 Use this button to mute.",close:"Close"
};
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}

var saver=false;try{saver=!!(navigator.connection&&navigator.connection.saveData)}catch(e){}
var on=get("hkRadio")==="off"?false:(get("hkRadio")==="on"?true:!saver);
var playing=false,suspended=false,gaveUp=false,armed=false;
var cur=0,act=0,nextIdx=0,timer=0,raf=0,fails=0,tipTimer=0,resumeTimer=0;
var els=[];
var canVol=true;

/* ---------- UI ---------- */
var css=".hkr{position:fixed;left:32px;bottom:96px;z-index:997;transition:opacity .2s,bottom .25s}"+
".hkr-btn{width:44px;height:44px;border-radius:50%;border:2px solid #B8922A;background:#0A2E36;color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 6px 18px rgba(10,46,54,.28);position:relative;-webkit-tap-highlight-color:transparent}"+
".hkr-btn:hover{background:#0E4A57}.hkr-btn:focus-visible{outline:3px solid #F1D98B;outline-offset:2px}"+
".hkr-btn svg{width:22px;height:22px;display:block}.hkr-btn .off{display:none}.hkr-btn[aria-pressed=false] .on{display:none}.hkr-btn[aria-pressed=false] .off{display:block}"+
".hkr-btn[data-state=playing]:after{content:'';position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(184,146,42,.55);animation:hkrp 2.4s ease-out infinite}"+
"@keyframes hkrp{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.25);opacity:0}}"+
"@media(prefers-reduced-motion:reduce){.hkr-btn[data-state=playing]:after{animation:none;opacity:.6}}"+
".hkr-tip{position:absolute;left:calc(100% + 14px);bottom:-2px;width:220px;background:#fff;color:#0A2E36;border:1px solid #D7E5E4;border-radius:14px;padding:10px 30px 10px 12px;font:13.5px/1.6 Inter,system-ui,sans-serif;box-shadow:0 10px 28px rgba(10,46,54,.22);opacity:0;transform:translateX(-6px);transition:opacity .3s,transform .3s;pointer-events:none}"+
".hkr-tip.show{opacity:1;transform:none;pointer-events:auto}.hkr-tip[hidden]{display:none}"+
".hkr-tip:before{content:'';position:absolute;left:-7px;bottom:15px;width:12px;height:12px;background:#fff;border-left:1px solid #D7E5E4;border-bottom:1px solid #D7E5E4;transform:rotate(45deg)}"+
".hkr-tip[dir=rtl]{padding:10px 12px 10px 30px}"+
".hkr-x{position:absolute;top:4px;right:6px;border:0;background:none;color:#4B656C;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.hkr-tip[dir=rtl] .hkr-x{right:auto;left:6px}"+
"body.form-active .hkr{opacity:.4}body.form-active .hkr:hover{opacity:1}"+
"body.menu-open .hkr{opacity:0;visibility:hidden;pointer-events:none}body.hk-ai-open .hkr,body.cc-open .hkr-tip{display:none}"+
"@media(max-width:600px){.hkr{left:22px;bottom:84px}.hkr-btn{width:42px;height:42px}.hkr-tip{width:190px}}";
var wrap,btn,tip;
function build(){
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  wrap=document.createElement("div");wrap.className="hkr";wrap.id="hkRadioWrap";
  wrap.innerHTML='<button id="hkRadio" class="hkr-btn" type="button" aria-pressed="true">'+
   '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'+
   '<svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg></button>'+
   '<div class="hkr-tip" role="status" hidden><span class="hkr-msg"></span><button class="hkr-x" type="button">×</button></div>';
  document.body.appendChild(wrap);
  btn=wrap.querySelector(".hkr-btn");tip=wrap.querySelector(".hkr-tip");
  tip.setAttribute("dir",AR?"rtl":"ltr");tip.querySelector(".hkr-x").setAttribute("aria-label",TX.close);
  btn.addEventListener("click",onBtn);
  place();window.addEventListener("resize",place);
  try{new MutationObserver(place).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(e){}
  [400,1200,2500,5000].forEach(function(t){setTimeout(place,t)});
  tip.querySelector(".hkr-x").addEventListener("click",hideTip);
  ui();
}
/* Sit directly above the WhatsApp button, centred on it, wherever the rest of the site puts it
   (it lifts when the cookie bar is open). Falls back to the CSS position if it is not found. */
function place(){
  if(!wrap)return;
  var list=document.querySelectorAll(".fab-wa"),w=null,i,r;
  for(i=0;i<list.length;i++){r=list[i].getBoundingClientRect();if(r.width>0&&r.height>0){w=r;break}}
  if(!w)return;
  var bw=btn.offsetWidth||44;
  wrap.style.left=Math.max(8,Math.round(w.left+w.width/2-bw/2))+"px";
  wrap.style.bottom=Math.max(8,Math.round(window.innerHeight-w.top+12))+"px";
}
function ui(){
  if(!btn)return;
  wrap.style.display=gaveUp?"none":"";
  btn.setAttribute("aria-pressed",on?"true":"false");
  btn.setAttribute("aria-label",on?TX.mute:TX.unmute);btn.title=on?TX.mute:TX.unmute;
  btn.setAttribute("data-state",!on?"muted":(playing?"playing":"waiting"));
  btn.setAttribute("data-ch",playing&&CH[cur]?CH[cur].n:"");
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
  document.body.appendChild(a);return a;
}
function sv(el,v){if(canVol){try{el.volume=Math.max(0,Math.min(1,v))}catch(e){}}}
function fade(list,ms,done){
  cancelAnimationFrame(raf);
  if(!canVol||ms<=0){list.forEach(function(x){sv(x.el,x.to)});if(done)done();return}
  var t0=performance.now();
  (function step(t){
    var k=Math.min(1,(t-t0)/ms),e=k*k*(3-2*k);
    list.forEach(function(x){sv(x.el,x.from+(x.to-x.from)*e)});
    if(k<1)raf=requestAnimationFrame(step);else if(done)done();
  })(t0);
}
function release(el){try{el.pause();el.removeAttribute("src");el.load()}catch(e){}}
function stopAll(){
  clearTimeout(timer);cancelAnimationFrame(raf);playing=false;
  els.forEach(function(el){release(el)});ui();
}
function load(el,i){el.src=CH[i].u;sv(el,0);var p=el.play();return p&&p.catch?p:Promise.resolve()}

function begin(){
  if(!on||playing||suspended||gaveUp||document.hidden)return;
  if(!els.length){els=[mk(),mk()];try{els[0].volume=.5;canVol=els[0].volume===.5}catch(e){canVol=false}}
  var el=els[act];cur=Math.floor(Math.random()*CH.length);
  load(el,cur).then(function(){
    if(!on||suspended){release(el);return}
    playing=true;armed=false;sv(el,0);ui();
    fade([{el:el,from:0,to:VOL}],FADE);
    if(!canVol)sv(el,1);
    schedule();showTip(TX.tip);
  }).catch(function(err){
    release(el);
    if(err&&err.name==="NotAllowedError"){arm();showTip2()}
    else{fails++;if(fails>CH.length*2){gaveUp=true;ui()}else begin()}
  });
}
function showTip2(){clearTimeout(tipTimer);setTimeout(function(){if(!playing)showTip(TX.tip2)},2500)}
function schedule(){
  if(CH.length<2)return;
  clearTimeout(timer);timer=setTimeout(prepare,Math.max(1000,SLOT-FADE-PRE));
}
function prepare(){
  if(!playing)return;
  nextIdx=(cur+1)%CH.length;
  var nx=els[1-act];
  load(nx,nextIdx).catch(function(){});
  timer=setTimeout(function(){waitReady(nx,Date.now())},PRE);
}
function waitReady(nx,t0){
  if(!playing)return;
  if(nx.readyState>=3||(nx.readyState>=2&&Date.now()-t0>1200))return cross(nx);
  if(Date.now()-t0>4000){fails++;release(nx);
    if(fails>CH.length*3){gaveUp=true;stopAll();return}
    cur=nextIdx;return prepare()}
  timer=setTimeout(function(){waitReady(nx,t0)},250);
}
function cross(nx){
  var old=els[act];
  fade([{el:old,from:VOL,to:0},{el:nx,from:0,to:VOL}],FADE,function(){
    release(old);act=1-act;cur=nextIdx;fails=0;ui();schedule();
  });
  if(!canVol){sv(nx,1);setTimeout(function(){release(old)},FADE)}
}
function onStreamError(el){
  if(!playing)return;
  if(el===els[act]){ /* current channel died: jump to the next straight away */
    fails++;if(fails>CH.length*3){gaveUp=true;stopAll();return}
    clearTimeout(timer);prepare();
  }
}

/* ---------- user intent ---------- */
function onBtn(){
  hideTip();
  if(on&&!playing&&!gaveUp){begin();return} /* "on" but sound still waiting for a first tap */
  on=!on;set("hkRadio",on?"on":"off");
  if(on){gaveUp=false;fails=0;begin()}
  else{
    var el=els[act];
    if(playing&&el&&canVol)fade([{el:el,from:el.volume,to:0}],250,function(){stopAll()});else stopAll();
    ui();
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
function suspend(){if(suspended)return;suspended=true;if(playing)stopAll();}
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
  window.addEventListener("pagehide",function(){stopAll()});
  document.addEventListener("focusin",function(e){var t=e.target;if(t&&(/^(TEXTAREA|SELECT)$/.test(t.tagName)||(t.tagName==="INPUT"&&!/^(button|submit|checkbox|radio)$/.test(t.type))||t.isContentEditable))suspend()});
  document.addEventListener("focusout",function(){resume()});
  window.addEventListener("blur",function(){setTimeout(function(){if(document.activeElement&&document.activeElement.tagName==="IFRAME")suspend()},0)});
  window.addEventListener("focus",function(){resume()});
  document.addEventListener("play",function(e){if(els.indexOf(e.target)<0){otherMedia++;suspend()}},true);
  var back=function(e){if(els.indexOf(e.target)<0&&otherMedia){otherMedia--;if(!otherMedia)resume()}};
  document.addEventListener("pause",back,true);document.addEventListener("ended",back,true);
  document.addEventListener("keydown",function(e){if(e.key==="Escape")hideTip()});
  if(on)begin();
}
if(document.body)init();else document.addEventListener("DOMContentLoaded",init);
})();

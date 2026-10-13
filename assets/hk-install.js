/* Hayakkom: "install the app or skip" popup. Android/Chrome native prompt; iPhone shows Add-to-Home-Screen steps. */
(function(){
  "use strict";
  var KEY="hkInstallSkip",DAYS=14,dp=null,shown=false;
  function ls(f){try{return f()}catch(e){return null}}
  var standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||window.navigator.standalone===true;
  if(standalone)return;
  var t=ls(function(){return +localStorage.getItem(KEY)});
  if(t&&Date.now()-t<DAYS*864e5)return;
  if(ls(function(){return localStorage.getItem("hkInstalled")}))return;
  var ar=(document.documentElement.lang||"").slice(0,2)==="ar";
  var ua=navigator.userAgent||"";
  var ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var T=ar?{h:"ثبّت تطبيق حياكم",p:"وصول أسرع إلى الباقات والتواصل على واتساب، من شاشتك الرئيسية.",i:"تثبيت",s:"تخطّي",ios:"في سفاري: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».",ok:"حسناً"}
           :{h:"Install the Hayakkom app",p:"Faster access to packages and WhatsApp from your home screen.",i:"Install",s:"Skip",ios:"In Safari tap the Share button, then “Add to Home Screen”.",ok:"Got it"};
  function skip(){ls(function(){localStorage.setItem(KEY,String(Date.now()))});close()}
  function close(){var e=document.getElementById("hkInst");if(e)e.remove()}
  function show(){
    if(shown||document.getElementById("hkInst"))return;shown=true;
    var d=document.createElement("div");d.id="hkInst";d.setAttribute("role","dialog");d.setAttribute("aria-label",T.h);d.dir=ar?"rtl":"ltr";
    d.style.cssText="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483000;width:min(94vw,420px);box-sizing:border-box;background:#0A2E36;color:#fff;border:1px solid rgba(232,200,119,.5);border-radius:16px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:15px/1.5 system-ui,-apple-system,Segoe UI,Tahoma,sans-serif";
    var h=document.createElement("strong");h.textContent=T.h;h.style.cssText="display:block;font-size:16px;margin-bottom:2px";
    var p=document.createElement("div");p.textContent=ios?T.ios:T.p;p.style.cssText="color:#D7E5E4;font-size:14px";
    var r=document.createElement("div");r.style.cssText="display:flex;gap:10px;margin-top:12px;justify-content:flex-end";
    function b(txt,main,fn){var x=document.createElement("button");x.type="button";x.textContent=txt;x.onclick=fn;x.style.cssText="cursor:pointer;border-radius:999px;padding:9px 18px;font:600 14px system-ui,sans-serif;min-height:40px;"+(main?"background:#E8C877;color:#0A2E36;border:0":"background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)");return x}
    r.appendChild(b(T.s,false,skip));
    r.appendChild(b(ios?T.ok:T.i,true,ios?skip:install));
    d.appendChild(h);d.appendChild(p);d.appendChild(r);document.body.appendChild(d);
  }
  function install(){
    if(!dp){skip();return}
    var e=dp;dp=null;
    try{e.prompt();e.userChoice.then(function(c){if(c&&c.outcome==="accepted")ls(function(){localStorage.setItem("hkInstalled","1")});else ls(function(){localStorage.setItem(KEY,String(Date.now()))});close()},close)}catch(x){close()}
  }
  window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();dp=e;if(document.body)show();else document.addEventListener("DOMContentLoaded",show)});
  window.addEventListener("appinstalled",function(){ls(function(){localStorage.setItem("hkInstalled","1")});close()});
  if("serviceWorker" in navigator&&location.protocol==="https:"){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}
  if(ios){function go(){setTimeout(show,900)}if(document.readyState!=="loading")go();else document.addEventListener("DOMContentLoaded",go)}
})();

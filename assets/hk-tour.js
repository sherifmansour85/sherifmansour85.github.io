/* Hayakkom — quick guide: a short walkthrough of the homepage, in English and Arabic.
   Dims the page, spotlights one part at a time and shows what happens when you tap it.
   Every step can be skipped. Offered once per visitor, after the cookie choice; replay it from
   "Quick guide" at the bottom of the homepage, or open the homepage with #tour.
   It never clicks anything on the page and removes itself completely when closed. */
(function(){
"use strict";
var path=location.pathname.replace(/index\.html$/,"");
if(path!=="/"&&path!=="/ar/")return;
if(window.__hkTour)return;window.__hkTour=1;

var KEY="hkTourDone",WA="https://wa.me/+201031567949";
var AR=(document.documentElement.lang||"").slice(0,2)==="ar";
var reduce=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
function ls(f){try{return f()}catch(e){return null}}
function seen(){return ls(function(){return localStorage.getItem(KEY)})||ls(function(){return sessionStorage.getItem(KEY)})}
function markDone(){var v=String(Date.now());ls(function(){localStorage.setItem(KEY,v)});ls(function(){sessionStorage.setItem(KEY,v)})}
function ev(n,p){try{if(typeof window.gtag==="function")window.gtag("event",n,p||{})}catch(e){}}
function vis(e){if(!e||!e.getBoundingClientRect)return false;var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;var s=getComputedStyle(e);return s.display!=="none"&&s.visibility!=="hidden"}
function q(sel,root){var a=(root||document).querySelectorAll(sel);for(var i=0;i<a.length;i++)if(vis(a[i]))return a[i];return null}

/* ---------- words ---------- */
var W=AR?{
  step:function(i,n){return "الخطوة "+i+" من "+n},
  skip:"تخطَّ الجولة",back:"السابق",next:"التالي",done:"إنهاء",close:"إغلاق الدليل",
  tap:function(x){return "إذا ضغطت «"+x+"»"},tip:"نصيحة",
  hi:{eb:"دليل سريع · 30 ثانية",t:"أهلاً بك في حياكم",b:"دعنا نعرّفك على الموقع في جولة قصيرة: من أين تبدأ، وكيف ترى الأسعار، وكيف تتواصل مع منسّق.",go:"ابدأ الجولة",no:"تخطَّ، سأتصفّح بنفسي"},
  end:{eb:"انتهت الجولة",t:"أنت جاهز للتخطيط",b:"أخبرنا بما تحتاجه، وسيردّ عليك منسّق عبر واتساب ويرسل لك تقديراً مكتوباً ومفصّلاً قبل أن تدفع أي شيء.",go:"راسلنا على واتساب",no:"سأتصفّح بنفسي",ft:"يمكنك إعادة هذا الدليل في أي وقت من «الدليل السريع» أسفل الصفحة.",msg:"مرحباً حياكم، شاهدت الدليل السريع في الموقع وأودّ المساعدة في تخطيط رحلتي."},
  again:"الدليل السريع: كيف يعمل الموقع",
  paths:{t:"ابدأ بما تحتاجه",b:"اختر طريقك: الرعاية الطبية، أو العلاج مع السياحة، أو السياحة وحدها، أو رحلات الأعمال والتعليم.",x:"الرعاية الطبية في مصر",r:"تنتقل إلى صفحة العلاجات مع أسعار تقديرية لعام 2026 بالريال السعودي."},
  cats:{t:"اختر فئة ثم خدمة",b:"اضغط على فئة لتظهر خدماتها. كل بطاقة خدمة تفتح دليلاً كاملاً بأسعار تقديرية بالريال السعودي.",r:function(n){return "تظهر "+n+" أسفلها؛ اضغط أي بطاقة لترى دليلها الكامل."}},
  services:{t:"لكل خدمة دليلها الخاص",b:"كل بطاقة تفتح صفحة كاملة عن هذا العلاج أو هذه الرحلة.",x:"الأسنان وابتسامة هوليوود",r:"تجد أسعاراً تقديرية لزراعة الأسنان والقشور وابتسامة هوليوود بالريال السعودي."},
  calc:{t:"اعرف التكلفة في ثوانٍ",b:"اختر العلاج وعدد المسافرين والفندق ومدينة السفر، ويظهر لك فوراً تقدير للرحلة كاملة بالريال السعودي.",x:"أرسل التقدير عبر واتساب",r:"يصل اختيارك إلى منسّق يردّ عليك بتقدير مكتوب ومفصّل قبل أن تدفع أي شيء."},
  holidays:{t:"عطلات ننسّقها لك بالكامل",b:"باقات عائلية للبحر الأحمر والرحلات النيلية والقاهرة والساحل الشمالي بأسعار تقديرية. الإقامة والتنقلات تقدّمها شركات سياحة مصرية مسجّلة.",x:"فلل الساحل الشمالي",r:"تجد الفلل والشاليهات بأسعار الليلة بالريال (تقديرية، بدون الطيران)."},
  trust:{t:"جهات مرخّصة فقط",b:"يقدّم العلاج مستشفيات وعيادات مرخّصة ومستقلة. تنسّق حياكم مواعيدك وإقامتك وتنقّلاتك، ولا تقدّم العلاج بنفسها.",r:"اسحب الشعارات جانباً لترى الشبكة كاملة."},
  menuM:{t:"كل شيء في القائمة",b:"العلاجات والعطلات والأدلة وحاسبة التكلفة وبيانات التواصل، كلها في قائمة واحدة.",x:"زر القائمة",r:"تُفتح قائمة الصفحات كاملة؛ اضغط أي صفحة للانتقال إليها."},
  menuD:{t:"كل شيء في الأعلى",b:"العطلات والعلاجات والأسعار والإرشادات وبيانات التواصل موجودة دائماً أعلى الصفحة."},
  help:{t:"المساعدة على بُعد ضغطة",wa:"واتساب",ai:"المساعد",ra:"الراديو",
    waL:"راسل منسّقاً بالعربية أو الإنجليزية.",aiL:"محادثة تجيب عن الأسئلة الشائعة في أي وقت.",raL:"محطات من القاهرة أثناء التصفّح، اضغط لكتم الصوت.",
    r:"يُفتح واتساب على رقمنا، جاهزاً لرسالتك."}
}:{
  step:function(i,n){return "Step "+i+" of "+n},
  skip:"Skip tour",back:"Back",next:"Next",done:"Finish",close:"Close guide",
  tap:function(x){return "If you tap “"+x+"”"},tip:"Tip",
  hi:{eb:"Quick guide · 30 seconds",t:"Welcome to Hayakkom",b:"Let us show you around in a few short steps: where to start, how to see prices, and how to reach a coordinator.",go:"Show me around",no:"Skip, I’ll explore"},
  end:{eb:"All set",t:"You’re ready to plan",b:"Tell us what you need. A coordinator replies on WhatsApp and sends a written, itemised estimate before you pay anything.",go:"Message us on WhatsApp",no:"Explore on my own",ft:"You can replay this guide any time from “Quick guide” at the bottom of the page.",msg:"Hello Hayakkom, I watched the quick guide on your website and would like help planning my trip."},
  again:"Quick guide: how this site works",
  paths:{t:"Start with what you need",b:"Pick your path: medical care, treatment combined with a holiday, a holiday on its own, or business and education trips.",x:"Medical Care in Egypt",r:"You reach the treatments page, with indicative 2026 prices in SAR."},
  cats:{t:"Pick a category, then a service",b:"Tap a category to show its services. Each service card opens a full guide with indicative prices in SAR.",r:function(n){return "Its "+n+" appear below; tap any card for its full guide."}},
  services:{t:"Every service has its own guide",b:"Each card opens a full page about that treatment or trip.",x:"Dental & Hollywood Smile",r:"You see indicative prices in SAR for implants, veneers and a Hollywood smile."},
  calc:{t:"See your cost in seconds",b:"Pick a treatment, the number of travellers, your hotel and the city you fly from. An indicative estimate in SAR for the whole trip appears instantly.",x:"Send on WhatsApp",r:"Your selection goes to a coordinator, who replies with a written, itemised estimate before you pay anything."},
  holidays:{t:"Holidays, fully coordinated",b:"Family packages for the Red Sea, Nile cruises, Cairo and the North Coast, with indicative prices. Stays and transport are provided by registered Egyptian tourism companies.",x:"North Coast villas",r:"You see villas and chalets with nightly prices in SAR (indicative, excluding flights)."},
  trust:{t:"Licensed providers only",b:"Treatment is delivered by independent licensed hospitals and clinics. Hayakkom coordinates your appointments, stay and transfers; it does not provide treatment itself.",r:"Drag the logos sideways to see the whole network."},
  menuM:{t:"Everything is in the menu",b:"Treatments, holidays, guides, the cost calculator and contact details, all in one list.",x:"the menu button",r:"The full list of pages opens; tap any page to go there."},
  menuD:{t:"Everything is at the top",b:"Holidays, treatments, costs and guides, and contact details are always at the top of the page."},
  help:{t:"Help is one tap away",wa:"WhatsApp",ai:"Assistant",ra:"Radio",
    waL:"message a coordinator in Arabic or English.",aiL:"a chat that answers common questions, any time.",raL:"Cairo stations while you browse; tap to mute.",
    r:"WhatsApp opens with our number, ready for your message."}
};

/* ---------- steps: each finds its own targets; a step whose target is missing is left out ---------- */
function top(f){f.top=1;return f}
var STEPS=[
  function(){var t=q(".hero-actions");if(!t)return null;var c=W.paths;return {holes:[t],tap:q(".hk-cta-med",t),t:c.t,b:c.b,ex:[W.tap(c.x),c.r]}},
  function(){var bar=q(".hk-svc-tabs"),c;
    if(bar){var tile=q(".hk-svc-tab",bar),nm=tile&&q(".hk-svc-t",tile),ct=tile&&q(".hk-svc-n",tile),ask=bar.previousElementSibling;c=W.cats;
      return {holes:ask&&ask.classList.contains("hk-svc-ask")?[ask,bar]:[bar],union:true,tap:tile,t:c.t,b:c.b,
        ex:nm&&ct?[W.tap(nm.textContent.trim()),c.r(ct.textContent.trim())]:null}}
    var t=q("a.svc-sm[href$='/dental/']")||q("a.svc-sm");if(!t)return null;c=W.services;return {holes:[t],tap:t,t:c.t,b:c.b,ex:[W.tap(c.x),c.r]}},
  function(){var t=q("#hk-mini-calc .hk-mc");if(!t)return null;var c=W.calc,w=q("#hkMcW",t),x=w&&(w.innerText||"").replace(/\s+/g," ").trim();var i=q(".hk-mc-in",t),f=q(".hk-mc-foot",t),hs=(!mobile()&&i&&f)?[i,f]:[t]; /* on wide screens leave out the heading so the card fits underneath */
    return {holes:hs,union:true,tap:w,t:c.t,b:c.b,ex:[W.tap(x&&x.length<40?x:c.x),c.r]}},
  function(){var t=q("#hk-holi .hk-spot-home");if(!t)return null;var c=W.holidays;return {holes:[t],tap:q("a[href$='north-coast-villas/']",t)||q(".hk-spot-card",t),t:c.t,b:c.b,ex:[W.tap(c.x),c.r]}},
  function(){var w=q(".pm-wrap");if(!w)return null;var s=w.closest("section"),h=s&&q(".sec-title",s),c=W.trust;return {holes:h?[h,w]:[w],union:true,t:c.t,b:c.b,ex:[W.tip,c.r],isTip:true}},
  top(function(){var b=q("#enBurger")||q("#arBurger"),c;if(b){c=W.menuM;return {holes:[b],tap:b,t:c.t,b:c.b,ex:[W.tap(c.x),c.r]}}
    var n=AR?q("header.arnav"):q("nav.nav");if(!n)return null;c=W.menuD;return {holes:[n],t:c.t,b:c.b}}),
  top(function(){var c=W.help,h=[],chips=[],li=[],wa=q(".fab-wa"),ai=q("#hkAi"),ra=q("#hkRadioWrap");
    if(wa){h.push(wa);chips.push([wa,c.wa]);li.push([c.wa,c.waL])}
    if(ai){h.push(ai);chips.push([ai,c.ai]);li.push([c.ai,c.aiL])}
    if(ra){h.push(ra);chips.push([ra,c.ra]);li.push([c.ra,c.raL])}
    if(!h.length)return null;return {holes:h,chips:chips,list:li,tap:wa,t:c.t,ex:wa?[W.tap(c.wa),c.r]:null}})
];

/* ---------- styles ---------- */
var CSS=
"#hkTour{position:fixed;inset:0;z-index:2147483200;color:#fff;font:15px/1.55 Inter,system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}"+
"#hkTour[dir=rtl]{font-family:Tajawal,'Noto Sans Arabic',system-ui,sans-serif;line-height:1.7}"+
"#hkTour *{box-sizing:border-box}"+
"#hkTour .hkt-svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .35s ease}"+
"#hkTour.hkt-on .hkt-svg{opacity:1}"+
"#hkTour .hkt-ring{position:absolute;left:0;top:0;border:2px solid #E8C877;box-shadow:0 0 0 5px rgba(232,200,119,.16),0 0 28px rgba(232,200,119,.38);pointer-events:none}"+
"#hkTour .hkt-chip{position:absolute;left:0;top:0;background:#E8C877;color:#0A2E36;font-weight:700;font-size:12.5px;line-height:1;padding:7px 10px;border-radius:999px;white-space:nowrap;pointer-events:none;box-shadow:0 6px 16px rgba(0,0,0,.3)}"+
"#hkTour .hkt-tap{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}"+
"#hkTour .hkt-tap i{position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;border:2px solid #E8C877;opacity:0;animation:hktRip 1.8s ease-out infinite}"+
"#hkTour .hkt-tap i+i{animation-delay:.6s}"+
"#hkTour .hkt-tap b{position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;background:#E8C877;box-shadow:0 0 0 4px rgba(232,200,119,.3);animation:hktDot 1.8s ease-in-out infinite}"+
"#hkTour .hkt-tap svg{position:absolute;left:2px;top:4px;width:30px;height:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45));animation:hktPress 1.8s ease-in-out infinite}"+
"@keyframes hktRip{0%{transform:scale(.35);opacity:.95}100%{transform:scale(1.6);opacity:0}}"+
"@keyframes hktDot{0%,100%{transform:scale(1)}45%{transform:scale(.7)}}"+
"@keyframes hktPress{0%,100%{transform:translate(6px,6px)}45%{transform:translate(0,0) scale(.92)}}"+
"#hkTour .hkt-card{position:absolute;left:0;top:0;width:min(384px,calc(100vw - 24px));background:linear-gradient(160deg,#10404B 0%,#0A2E36 62%);border:1px solid rgba(232,200,119,.4);border-radius:20px;padding:20px 20px 16px;box-shadow:0 26px 70px rgba(0,0,0,.5);opacity:1;transition:opacity .22s ease}"+
"#hkTour .hkt-card.hkt-out{opacity:0}"+
"#hkTour .hkt-card.hkt-center{left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100vw - 32px));padding:28px 26px 22px;text-align:center}"+
"#hkTour .hkt-card.hkt-sheet{left:12px;right:12px;width:auto;padding:16px 16px 12px}"+
"#hkTour .hkt-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#D7E5E4;font:400 22px/34px system-ui,sans-serif;cursor:pointer;padding:0;margin:0;text-align:center}"+
"#hkTour[dir=rtl] .hkt-x{right:auto;left:10px}"+
"#hkTour .hkt-x:hover{background:rgba(255,255,255,.08);color:#fff}"+
"#hkTour .hkt-mark{display:block;width:46px;height:46px;margin:0 auto 12px;border-radius:50%;border:1px solid rgba(232,200,119,.55);background:rgba(232,200,119,.08)}"+
"#hkTour .hkt-eb{color:#E8C877;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px;padding-inline-end:34px}"+
"#hkTour[dir=rtl] .hkt-eb{letter-spacing:0;font-size:13px}"+
"#hkTour .hkt-center .hkt-eb{padding:0}"+
"#hkTour .hkt-bar{height:3px;border-radius:3px;background:rgba(255,255,255,.12);margin:0 0 14px;overflow:hidden}"+
"#hkTour .hkt-bar i{display:block;height:100%;background:linear-gradient(90deg,#C9A24A,#E8C877);border-radius:3px;transition:width .45s ease}"+
"#hkTour .hkt-t{margin:0 0 6px;color:#fff;font:600 26px/1.15 'Cormorant Garamond',Georgia,serif;letter-spacing:.005em}"+
"#hkTour[dir=rtl] .hkt-t{font:700 21px/1.4 Tajawal,'Noto Sans Arabic',system-ui,sans-serif}"+
"#hkTour .hkt-center .hkt-t{font-size:31px}"+
"#hkTour[dir=rtl] .hkt-center .hkt-t{font-size:24px}"+
"#hkTour .hkt-b{margin:0;color:#D7E5E4;font-size:14.5px}"+
"#hkTour .hkt-li{list-style:none;margin:2px 0 0;padding:0;color:#D7E5E4;font-size:14px}"+
"#hkTour .hkt-li li{margin:3px 0;padding:0;color:#D7E5E4}"+
"#hkTour .hkt-li strong{color:#fff;font-weight:700}"+
"#hkTour .hkt-ex{display:flex;gap:10px;align-items:flex-start;margin:12px 0 0;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.06);border-inline-start:2px solid #E8C877;text-align:start}"+
"#hkTour .hkt-ex svg{flex:none;width:22px;height:22px;margin-top:1px}"+
"#hkTour .hkt-exl{color:#E8C877;font-size:12.5px;font-weight:700;margin:0 0 1px}"+
"#hkTour .hkt-exr{color:#fff;font-size:13.5px;margin:0}"+
"#hkTour .hkt-nav{display:flex;align-items:center;gap:8px;margin-top:14px}"+
"#hkTour .hkt-center .hkt-nav{flex-direction:column;gap:6px;margin-top:20px}"+
"#hkTour .hkt-sp{flex:1}"+
"#hkTour .hkt-btn{appearance:none;-webkit-appearance:none;margin:0;cursor:pointer;border-radius:999px;font-weight:700;font-size:14px;line-height:1;font-family:inherit;min-height:42px;padding:0 18px;border:1px solid rgba(255,255,255,.35);background:transparent;color:#fff;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background .15s ease,transform .15s ease}"+
"#hkTour .hkt-btn:hover{background:rgba(255,255,255,.08)}"+
"#hkTour .hkt-btn:active{transform:scale(.97)}"+
"#hkTour .hkt-main{background:#E8C877;border-color:#E8C877;color:#0A2E36}"+
"#hkTour .hkt-main:hover{background:#F0D48E}"+
"#hkTour .hkt-center .hkt-btn{width:100%;min-height:48px;font-size:15px}"+
"#hkTour .hkt-link{appearance:none;-webkit-appearance:none;margin:0;border:0;background:transparent;color:#B9CFCD;font-weight:600;font-size:13.5px;line-height:1;font-family:inherit;cursor:pointer;padding:12px 4px;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(185,207,205,.45)}"+
"#hkTour .hkt-link:hover{color:#fff}"+
"#hkTour .hkt-ft{margin:12px 0 0;color:#9FB8B6;font-size:12.5px}"+
"#hkTour button:focus-visible,#hkTour a:focus-visible{outline:2px solid #E8C877;outline-offset:3px}"+
"@media (max-width:699px){#hkTour .hkt-t{font-size:23px}#hkTour[dir=rtl] .hkt-t{font-size:19px}#hkTour .hkt-b{font-size:14px}#hkTour .hkt-ex{margin-top:10px;padding:8px 10px}#hkTour .hkt-nav{margin-top:12px}#hkTour .hkt-btn{min-height:40px;padding:0 15px}}"+
"@media (prefers-reduced-motion:reduce){#hkTour .hkt-svg,#hkTour .hkt-card,#hkTour .hkt-bar i{transition:none}#hkTour .hkt-tap i,#hkTour .hkt-tap b,#hkTour .hkt-tap svg{animation:none}#hkTour .hkt-tap i{opacity:.6}}"+
".hkt-again{display:block;margin:0 auto 22px;appearance:none;-webkit-appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(232,200,119,.55);color:inherit;border-radius:999px;padding:9px 18px;font-weight:600;font-size:13.5px;line-height:1.2;font-family:inherit}"+
".hkt-again:hover{background:rgba(232,200,119,.12)}";

var HAND='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" stroke="#0A2E36" stroke-width="1.2" stroke-linejoin="round" d="M9 11.2V4.6a1.6 1.6 0 0 1 3.2 0v5.2l.5-.1a1.6 1.6 0 0 1 2 1.1l.1.3.4-.1a1.6 1.6 0 0 1 2 1.2l.1.4h.3a1.6 1.6 0 0 1 1.9 1.6v2.4c0 3-2.2 5.4-5.2 5.4h-1.6c-1.7 0-3.2-.8-4.2-2.2L5 15.3a1.6 1.6 0 0 1 2.5-2l1.5 1.6z"/></svg>';
var TAPI='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#E8C877" stroke-width="1.2" opacity=".55"/><circle cx="12" cy="12" r="4" fill="#E8C877"/></svg>';
var TIPI='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="#E8C877" stroke-width="1.6" stroke-linecap="round" d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';
var MARK='<svg class="hkt-mark" viewBox="0 0 46 46" aria-hidden="true"><path fill="none" stroke="#E8C877" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M16 13v20M30 13v20M16 23h14"/></svg>';

/* ---------- state ---------- */
var GAP=12,EDGE=8; /* space between a section and its card, and from the card to the screen edge */
var root,svg,holeG,card,tapEl,rings=[],chipEls=[],steps=[],cur=-1,st=null,disp=[],tw=null,raf=0,tok=0,lastFocus=null,side="bottom",cardW="",plan=null;

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function mobile(){return innerWidth<700}
function isFixed(e){for(;e&&e!==document.body;e=e.parentElement){var p=getComputedStyle(e).position;if(p==="fixed"||p==="sticky")return true}return false}
function boxes(s){return s.holes.map(function(e){var r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}}).filter(function(o){return o.w>=1||o.h>=1})}
function unionOf(a){if(!a.length)return null;var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;a.forEach(function(o){x0=Math.min(x0,o.x);y0=Math.min(y0,o.y);x1=Math.max(x1,o.x+o.w);y1=Math.max(y1,o.y+o.h)});return {x:x0,y:y0,w:x1-x0,h:y1-y0}}

function rectsOf(s){
  if(!s||!s.holes)return [];
  var pad=mobile()?6:9,vw=innerWidth,vh=innerHeight,out=boxes(s);
  if(s.union&&out.length>1)out=[unionOf(out)];
  return out.map(function(o){var x0=Math.max(o.x-pad,4),y0=Math.max(o.y-pad,4),x1=Math.min(o.x+o.w+pad,vw-4),y1=Math.min(o.y+o.h+pad,vh-4),w=Math.max(0,x1-x0),h=Math.max(0,y1-y0);
    return {x:x0,y:y0,w:w,h:h,r:Math.min(18,w/2,h/2)}});
}
function lerp(a,b,k){return a+(b-a)*k}
function mix(from,to,k){return to.map(function(t,i){var f=from[i]||{x:t.x+t.w/2,y:t.y+t.h/2,w:0,h:0,r:0};return {x:lerp(f.x,t.x,k),y:lerp(f.y,t.y,k),w:lerp(f.w,t.w,k),h:lerp(f.h,t.h,k),r:lerp(f.r,t.r,k)}})}

function draw(d){
  while(holeG.childNodes.length>d.length)holeG.removeChild(holeG.lastChild);
  while(holeG.childNodes.length<d.length)holeG.appendChild(document.createElementNS("http://www.w3.org/2000/svg","rect"));
  while(rings.length>d.length)root.removeChild(rings.pop());
  while(rings.length<d.length){var g=el("div","hkt-ring");root.insertBefore(g,tapEl);rings.push(g)}
  d.forEach(function(o,i){var h=holeG.childNodes[i];h.setAttribute("x",o.x);h.setAttribute("y",o.y);h.setAttribute("width",o.w);h.setAttribute("height",o.h);h.setAttribute("rx",o.r);h.setAttribute("fill","#000");
    var g=rings[i].style;g.transform="translate("+o.x+"px,"+o.y+"px)";g.width=o.w+"px";g.height=o.h+"px";g.borderRadius=o.r+"px"});
}

function setMode(m){var out=card.classList.contains("hkt-out");card.className="hkt-card"+(m?" "+m:"")+(out?" hkt-out":"")}
function placeCard(tg){
  var cs=card.style;
  if(!st||!tg.length){setMode("hkt-center");cs.left=cs.top=cs.bottom=cs.right=cs.width="";return}
  if(mobile()){setMode("hkt-sheet");cs.left=cs.right=cs.width="";
    if(side==="top"){cs.top="calc(12px + env(safe-area-inset-top))";cs.bottom="auto"}else{cs.top="auto";cs.bottom="calc(12px + env(safe-area-inset-bottom))"}return}
  setMode("");cs.bottom=cs.right="";if(cs.width!==cardW)cs.width=cardW;
  /* while the page is still scrolling to the section, choose the card's side from where the section will end up */
  if(plan&&(performance.now()-plan.t>1400||Math.abs(scrollY-plan.top)<1))plan=null;
  var dy=plan?scrollY-plan.top:0,ua=unionOf(tg),u={x:ua.x,y:ua.y+dy,w:ua.w,h:ua.h},vw=innerWidth,vh=innerHeight,cw=card.offsetWidth,ch=card.offsetHeight,g=GAP,m=12,x,y;
  var startX=AR?u.x+u.w-cw:u.x;
  if(u.y+u.h+g+ch<=vh-EDGE){y=u.y+u.h+g;x=startX}
  else if(u.y-g-ch>=m){y=u.y-g-ch;x=startX}
  else{var right=u.x+u.w+g+cw<=vw-m,left=u.x-g-cw>=m;
    if(AR?left:(!right&&left))x=u.x-g-cw;else if(right)x=u.x+u.w+g;else x=vw-cw-m;
    y=u.y+u.h/2-ch/2}
  x=Math.max(m,Math.min(x,vw-cw-m));y=Math.max(m,Math.min(y,vh-ch-m))-dy;
  cs.left=Math.round(x)+"px";cs.top=Math.round(y)+"px";
}

function placeExtras(){
  var t=st&&st.tap,r=t&&t.getBoundingClientRect();
  if(r&&r.width>0&&r.bottom>0&&r.top<innerHeight){tapEl.style.display="block";tapEl.style.transform="translate("+(r.left+r.width/2)+"px,"+(r.top+r.height/2)+"px)"}
  else tapEl.style.display="none";
  var ch=(st&&st.chips)||[];
  while(chipEls.length>ch.length)root.removeChild(chipEls.pop());
  while(chipEls.length<ch.length){var c=el("div","hkt-chip");root.insertBefore(c,tapEl);chipEls.push(c)}
  ch.forEach(function(c,i){var e=chipEls[i],b=c[0].getBoundingClientRect(),vw=innerWidth,cy=b.top+b.height/2;if(e.textContent!==c[1])e.textContent=c[1];
    if(b.right<vw*.25)e.style.transform="translate("+(b.right+16)+"px,"+cy+"px) translate(0,-50%)";
    else if(b.left>vw*.75)e.style.transform="translate("+(b.left-16)+"px,"+cy+"px) translate(-100%,-50%)";
    else{var below=b.top<60;e.style.transform="translate("+(b.left+b.width/2)+"px,"+(below?b.bottom+14:b.top-14)+"px) translate(-50%,"+(below?"0":"-100%")+")"}});
}

function frame(now){
  raf=requestAnimationFrame(frame);
  var tg=rectsOf(st),d;
  if(tw){var k=tw.dur?Math.min(1,(now-tw.t0)/tw.dur):1;k=1-Math.pow(1-k,3);d=mix(tw.from,tg,k);if(k>=1)tw=null}else d=tg;
  disp=d;draw(d);placeCard(tg);placeExtras();
}

/* ---------- card content ---------- */
function btn(cls,txt,fn){var b=el("button","hkt-btn"+(cls?" "+cls:""));b.type="button";b.textContent=txt;b.addEventListener("click",fn);return b}
function link(txt,fn){var b=el("button","hkt-link");b.type="button";b.textContent=txt;b.addEventListener("click",fn);return b}
function focusMain(){var f=card&&card.querySelector(".hkt-main");if(f)try{f.focus({preventScroll:true})}catch(e){}}
function render(i){
  var n=steps.length,h="";
  card.innerHTML="";
  var x=el("button","hkt-x","&times;");x.type="button";x.setAttribute("aria-label",W.close);x.addEventListener("click",function(){close(i>=n?"done":"skip")});card.appendChild(x);
  if(i<0||i>=n){
    var c=i<0?W.hi:W.end,nav=el("div","hkt-nav");
    card.insertAdjacentHTML("beforeend",MARK+'<p class="hkt-eb">'+esc(c.eb)+'</p><p class="hkt-t" id="hkTourT" role="heading" aria-level="2">'+esc(c.t)+'</p><p class="hkt-b" id="hkTourP">'+esc(c.b)+'</p>');
    if(i<0){nav.appendChild(btn("hkt-main",c.go,function(){ev("tour_start");go(0,1)}));nav.appendChild(link(c.no,function(){close("skip")}))}
    else{var a=el("a","hkt-btn hkt-main");a.href=WA+"?text="+encodeURIComponent(c.msg);a.target="_blank";a.rel="noopener";a.textContent=c.go;
      a.addEventListener("click",function(){ev("tour_whatsapp");setTimeout(function(){close("done")},50)});
      nav.appendChild(a);nav.appendChild(link(c.no,function(){close("done")}))}
    card.appendChild(nav);
    if(i>=n)card.insertAdjacentHTML("beforeend",'<p class="hkt-ft">'+esc(c.ft)+'</p>');
    return;
  }
  h+='<p class="hkt-eb">'+esc(W.step(i+1,n))+'</p><div class="hkt-bar" aria-hidden="true"><i style="width:'+Math.round(i/n*100)+'%"></i></div>';
  h+='<p class="hkt-t" id="hkTourT" role="heading" aria-level="2">'+esc(st.t)+'</p>';
  if(st.list){h+='<ul class="hkt-li" id="hkTourP">';st.list.forEach(function(l){h+='<li><strong>'+esc(l[0])+'</strong>: '+esc(l[1])+'</li>'});h+='</ul>'}
  else h+='<p class="hkt-b" id="hkTourP">'+esc(st.b)+'</p>';
  if(st.ex)h+='<div class="hkt-ex">'+(st.isTip?TIPI:TAPI)+'<div><p class="hkt-exl">'+esc(st.ex[0])+'</p><p class="hkt-exr">'+(st.isTip?"":(AR?"← ":"→ "))+esc(st.ex[1])+'</p></div></div>';
  card.insertAdjacentHTML("beforeend",h);
  var bar=card.querySelector(".hkt-bar i");setTimeout(function(){if(bar)bar.style.width=Math.round((i+1)/n*100)+"%"},30);
  var nv=el("div","hkt-nav");
  nv.appendChild(link(W.skip,function(){close("skip")}));nv.appendChild(el("span","hkt-sp"));
  if(i>0)nv.appendChild(btn("",W.back,function(){go(cur-1,-1)}));
  nv.appendChild(btn("hkt-main",i===n-1?W.done:W.next,function(){go(cur+1,1)}));
  card.appendChild(nv);
}

/* ---------- moving between steps ---------- */
function scrollFor(s){
  if(!s||!s.holes)return;
  var b=boxes(s);if(!b.length)return;
  var u=unionOf(b),fixed=s.holes.every(isFixed),vh=innerHeight,mob=mobile();
  plan=null;side=(mob&&fixed&&u.y+u.h/2>vh*.5)?"top":"bottom";
  cardW=(!mob&&u.w>=600)?Math.round(Math.min(560,u.w))+"px":""; /* a wide section gets a wider, shorter card that fits under it */
  placeCard(rectsOf(s));
  if(fixed)return;
  var cardH=mob?card.offsetHeight+24:0,zt=mob?76:76,zb=mob?vh-cardH-8:vh-24,zh=zb-zt,want,need=u.h+18+GAP+card.offsetHeight+EDGE+6;
  if(!mob&&need<=vh-zt)want=zt+9+(vh-zt-need)/2; /* room for the section and the card under it */
  else if(u.h+20<=zh)want=zt+(zh-u.h)/2;
  else{want=zt+10;if(s.tap){var tr=s.tap.getBoundingClientRect(),off=tr.bottom-u.y;if(want+off>zb-10)want=zb-10-off}}
  var top=Math.max(0,Math.round(scrollY+u.y-want));
  if(Math.abs(top-scrollY)>2){if(!reduce)plan={top:Math.min(top,document.documentElement.scrollHeight-innerHeight),t:performance.now()};try{window.scrollTo({top:top,behavior:reduce?"auto":"smooth"})}catch(e){window.scrollTo(0,top)}}
}
function go(i,dir){
  var my=++tok,n=steps.length;
  if(i>=0&&i<n&&steps[i].top&&scrollY>2&&!dir.up){card.classList.add("hkt-out");try{window.scrollTo({top:0,behavior:reduce?"auto":"smooth"})}catch(e){window.scrollTo(0,0)}
    setTimeout(function(){if(my===tok&&root)go(i,{d:dir,up:1})},reduce?60:650);return}
  if(typeof dir==="object")dir=dir.d;
  while(i>=0&&i<n){var f=null;try{f=steps[i]()}catch(e){}if(f){st=f;break}steps.splice(i,1);n--;if(dir<0)i--}
  if(i<0){st=null;i=-1}else if(i>=n){st=null;i=n}
  var from=disp.slice();cur=i;
  card.classList.add("hkt-out");
  setTimeout(function(){
    if(my!==tok||!root)return;
    render(i);
    if(st)ev("tour_step",{step:i+1});
    scrollFor(st);
    tw={from:from,t0:performance.now(),dur:reduce?0:520};
    card.classList.remove("hkt-out");
    focusMain();
  },reduce?0:170);
}

/* ---------- open / close ---------- */
function onKey(e){
  if(!root)return;
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close(cur>=steps.length?"done":"skip");return}
  var fwd=AR?"ArrowLeft":"ArrowRight",bwd=AR?"ArrowRight":"ArrowLeft";
  if(cur>=0&&cur<steps.length){if(e.key===fwd){e.preventDefault();go(cur+1,1);return}if(e.key===bwd&&cur>0){e.preventDefault();go(cur-1,-1);return}}
  if(e.key==="Tab"){var f=card.querySelectorAll("button,a[href]");if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(!card.contains(document.activeElement)){e.preventDefault();a.focus();return}
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
}
function stop(e){if(card&&card.contains(e.target))return;e.preventDefault();e.stopPropagation()}
function css(){if(!document.getElementById("hkTourCss")){var s=el("style");s.id="hkTourCss";s.textContent=CSS;document.head.appendChild(s)}}
function start(manual){
  if(root||!document.body)return;
  css();
  steps=STEPS.slice();cur=-1;st=null;disp=[];tw=null;rings=[];chipEls=[];side="bottom";
  lastFocus=document.activeElement;
  root=el("div");root.id="hkTour";root.dir=AR?"rtl":"ltr";root.lang=AR?"ar":"en";
  root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","hkTourT");root.setAttribute("aria-describedby","hkTourP");
  root.innerHTML='<svg class="hkt-svg" aria-hidden="true"><defs><mask id="hktMask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect x="0" y="0" width="100%" height="100%" fill="#fff"/><g></g></mask></defs><rect x="0" y="0" width="100%" height="100%" fill="rgba(4,22,27,.74)" mask="url(#hktMask)"/></svg>';
  svg=root.firstChild;holeG=svg.querySelector("mask g");
  tapEl=el("div","hkt-tap","<i></i><i></i><b></b>"+HAND);tapEl.style.display="none";root.appendChild(tapEl);
  card=el("div","hkt-card hkt-center hkt-out");root.appendChild(card);
  ["click","pointerdown","pointerup","mousedown","mouseup","touchstart","touchend"].forEach(function(t){root.addEventListener(t,stop,false)});
  document.body.appendChild(root);
  document.addEventListener("keydown",onKey,true);
  render(-1);
  requestAnimationFrame(function(){if(!root)return;root.classList.add("hkt-on");card.classList.remove("hkt-out");focusMain()});
  raf=requestAnimationFrame(frame);
  ev("tour_offer",{manual:manual?1:0});
}
function close(why){
  if(!root)return;
  tok++;cancelAnimationFrame(raf);raf=0;
  document.removeEventListener("keydown",onKey,true);
  var r=root;root=null;
  r.style.transition="opacity .25s ease";r.style.opacity="0";r.style.pointerEvents="none";
  setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r)},reduce?0:260);
  markDone();
  ev(why==="done"?"tour_complete":"tour_skip",{step:cur<0?0:cur+1});
  try{if(lastFocus&&lastFocus.focus&&lastFocus!==document.body&&document.contains(lastFocus))lastFocus.focus({preventScroll:true})}catch(e){}
  try{window.dispatchEvent(new Event("hk-tour-end"))}catch(e){}
}
window.hkTour=function(){start(true)};

/* ---------- "Quick guide" button at the bottom of the homepage (the footer can be re-drawn, so keep it there) ---------- */
function ensureAgain(){
  var f=document.querySelector("footer");if(!f||f.querySelector(".hkt-again"))return;
  css();
  var b=el("button","hkt-again");b.type="button";b.textContent=W.again;b.addEventListener("click",function(){start(true)});
  f.insertBefore(b,f.firstChild);
}
ensureAgain();setTimeout(ensureAgain,1500);setTimeout(ensureAgain,5000);
try{var mt=0;new MutationObserver(function(){if(mt)return;mt=setTimeout(function(){mt=0;ensureAgain()},400)}).observe(document.getElementById("root")||document.body,{childList:true,subtree:true})}catch(e){}

/* ---------- when to offer it: once, after the cookie choice, never on top of another popup or a form ---------- */
function calm(){
  if(!q("section.hero"))return false;
  var cc=document.getElementById("hkCc");if(cc&&vis(cc))return false;
  if(document.getElementById("hkInst"))return false;
  var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return false;
  var p=document.getElementById("hkAiPanel");if(p&&vis(p))return false;
  return true;
}
var want=/^#tour$/i.test(location.hash);
if(!want&&seen())return;
var t0=Date.now(),okSince=0;
(function wait(){
  if(root||Date.now()-t0>120000)return;
  if(calm()){if(!okSince)okSince=Date.now();if(Date.now()-okSince>=(want?300:1800)){start(want);return}}else okSince=0;
  setTimeout(wait,400);
})();
})();

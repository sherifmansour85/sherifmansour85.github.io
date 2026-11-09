/* HK-MINI-CALC: a compact "instant estimate" on the English and Arabic homepages, placed right after the service
   tabs. Same indicative SAR ranges and arithmetic as /calculator/ (treatment, flights per traveller and trip, hotel
   nights, transfers); the full calculator stays the place for holidays and every option. A ring chart shows how the
   estimate splits, and the totals count up when an option changes. */
(function(){
  if(window.__hkMiniCalc)return;window.__hkMiniCalc=1;
  var path=location.pathname.replace(/index\.html$/,"");
  if(path!=="/"&&path!=="/ar/")return;
  var ar=path==="/ar/";
  var T=ar?{
    eyebrow:"تقدير فوري",title:"كم تكلّف رحلتك العلاجية؟",treat:"العلاج",from:"السفر من",trav:"المسافرون",hotel:"الإقامة",
    star4:"4 نجوم",star5:"5 نجوم",sar:"ريال",perTrip:"تقدير الرحلة كاملة",days:"أيام في مصر",trip1:"رحلة واحدة",trips2:"رحلتان بفاصل أشهر",
    parts:["العلاج","الطيران","الإقامة","الاستقبال والتنقلات"],full:"التفاصيل الكاملة",fullHref:"/ar/calculator/",wa:"أرسل التقدير عبر واتساب",
    
    waMsg:"مرحباً حياكم، استخدمت التقدير الفوري:",waShort:"واتساب",travN:"مسافرين",ind:"تقديري",teeth:"عدد الأسنان",people:"عدد الأشخاص",minus:"إنقاص",plus:"زيادة"
  }:{
    eyebrow:"Instant estimate",title:"What would your treatment trip cost?",treat:"Treatment",from:"Flying from",trav:"Travellers",hotel:"Stay",
    star4:"4-star",star5:"5-star",sar:"SAR",perTrip:"estimate for the whole trip",days:"days in Egypt",trip1:"one trip",trips2:"two trips, months apart",
    parts:["Treatment","Flights","Stay","Reception & transfers"],full:"Full breakdown",fullHref:"/calculator/",wa:"Send on WhatsApp",
    
    waMsg:"Hello Hayakkom, I used the instant estimate:",waShort:"WhatsApp",travN:"travellers",ind:"indicative",teeth:"Teeth",people:"People",minus:"Fewer",plus:"More"
  };
  /* Same figures as /calculator/ (D, C and H there). */
  var D=[
    {k:"implant",en:"Dental implants",ar:"زراعة الأسنان",lo:940,hi:2300,trips:2,days:[3,5],nights:5,q:2,qmax:32,ql:"teeth"},
    {k:"veneer",en:"Porcelain veneers",ar:"قشور البورسلين (الفينير)",lo:340,hi:680,trips:1,days:[5,7],nights:6,q:8,qmax:32,ql:"teeth"},
    {k:"hollywood",en:"Hollywood smile",ar:"ابتسامة هوليوود",lo:6800,hi:12000,trips:1,days:[7,10],nights:8},
    {k:"hair",en:"Hair transplant",ar:"زراعة الشعر",lo:4500,hi:11300,trips:1,days:[4,6],nights:5},
    {k:"sleeve",en:"Gastric sleeve",ar:"تكميم المعدة",lo:10100,hi:16900,trips:1,days:[7,10],nights:9},
    {k:"rhino",en:"Rhinoplasty",ar:"تجميل الأنف",lo:8300,hi:13900,trips:1,days:[8,12],nights:10},
    {k:"lipo",en:"Liposuction / VASER",ar:"شفط الدهون / الفيزر",lo:6800,hi:13900,trips:1,days:[7,10],nights:8},
    {k:"checkup",en:"Full health check-up",ar:"الفحص الصحي الشامل",lo:900,hi:1700,trips:1,days:[2,3],nights:3,q:1,qmax:6,ql:"people"}
  ];
  var C=[{k:"riyadh",en:"Riyadh",ar:"الرياض",fly:[950,1900]},{k:"jeddah",en:"Jeddah",ar:"جدة",fly:[800,1700]},{k:"dammam",en:"Dammam",ar:"الدمام",fly:[1050,2050]},
         {k:"dubai",en:"Dubai",ar:"دبي",fly:[1100,2200],cur:"AED"},{k:"kuwait",en:"Kuwait",ar:"الكويت",fly:[900,1850],cur:"KWD"}];
  /* Totals are worked out in SAR and shown in the currency of the city flown from, at the site's rates (per USD: SAR 3.75, AED 3.67, KWD 0.31). */
  var CUR={SAR:{r:1,step:50,en:"SAR",ar:"ريال"},AED:{r:3.67/3.75,step:50,en:"AED",ar:"درهم"},KWD:{r:.31/3.75,step:5,en:"KWD",ar:"دينار"}};
  function cur(){return CUR[C[S.c].cur||"SAR"]}
  var H={4:[190,300],5:[330,560]};
  var S={d:0,q:2,c:0,t:2,h:4};
  var COL=["#E8C877","#5FB8BF","#C9A23A","#F3E2AE"];
  var css=
    "html body #hk-mini-calc{padding:40px 16px!important;margin:0!important;position:relative;z-index:1;background:linear-gradient(180deg,#F4F1EA 0%,#EEE6D3 100%)!important}"+
    "#hk-mini-calc .hk-mc-head{padding:22px 32px 0}"+
    "html body #hk-mini-calc .hk-mc h2{color:#fff!important}"+
    "html body #hk-mini-calc .hk-mc-l{color:rgba(255,255,255,.72)!important}html body #hk-mini-calc .hk-mc-eb{color:#E8C877!important}"+
    ".hk-mc-s{display:none}"+
    ".hk-mc{position:relative;max-width:980px;margin:0 auto;border-radius:26px;overflow:hidden;color:#fff;isolation:isolate;"+
      "background:linear-gradient(145deg,#0A2E36 0%,#0E3F49 55%,#123F3A 100%);box-shadow:0 24px 60px rgba(10,46,54,.28),inset 0 0 0 1px rgba(232,200,119,.22)}"+
    ".hk-mc::before{content:'';position:absolute;inset:-40%;z-index:-1;background:radial-gradient(closest-side,rgba(232,200,119,.22),transparent 70%) 20% 30%/55% 55% no-repeat,"+
      "radial-gradient(closest-side,rgba(95,184,191,.20),transparent 70%) 80% 70%/50% 50% no-repeat;animation:hkMcAura 14s ease-in-out infinite alternate}"+
    "@keyframes hkMcAura{to{transform:translate3d(6%,-4%,0) rotate(8deg)}}"+
    ".hk-mc::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.07) 50%,transparent 60%);transform:translateX(-100%)}"+
    ".hk-mc.hk-in::after{animation:hkMcSheen 1.6s .2s ease-out 1}"+
    "@keyframes hkMcSheen{to{transform:translateX(100%)}}"+
    ".hk-mc-in{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:24px;padding:10px 32px 14px}.hk-mc-ctrl{min-width:0}"+
    "html body #hk-mini-calc .hk-mc-hot{display:flex!important;flex-wrap:nowrap!important;gap:6px}html body #hk-mini-calc .hk-mc-hot .hk-mc-pill{white-space:nowrap;flex:none}.hk-mc-row>.hk-mc-f:last-child{flex:0 0 auto}"+
    "html body #hk-mini-calc .hk-mc h2{margin:8px 0 4px!important;padding:0!important}"+
    ".hk-mc-eb{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#E8C877}"+
    "[dir=rtl] .hk-mc-eb{letter-spacing:0;font-size:13px}"+
    ".hk-mc-eb::before{content:'';width:8px;height:8px;border-radius:50%;background:#E8C877;box-shadow:0 0 0 0 rgba(232,200,119,.6);animation:hkMcDot 2.4s ease-out infinite}"+
    "@keyframes hkMcDot{70%{box-shadow:0 0 0 9px rgba(232,200,119,0)}100%{box-shadow:0 0 0 0 rgba(232,200,119,0)}}"+
    ".hk-mc h2{margin:8px 0 18px!important;font-family:'Cormorant Garamond',serif;font-size:clamp(24px,3.2vw,32px)!important;line-height:1.2!important;color:#fff!important;font-weight:700}"+
    "[dir=rtl] .hk-mc h2{font-family:inherit;font-size:clamp(22px,3vw,28px)!important;line-height:1.5!important}"+
    ".hk-mc-l{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.7);margin:0 0 7px;letter-spacing:.02em}"+
    ".hk-mc-f{margin-bottom:14px}"+
    ".hk-mc-sel{position:relative}"+
    ".hk-mc-sel select{appearance:none;-webkit-appearance:none;width:100%;font:inherit;font-size:15px;font-weight:600;color:#fff;background:rgba(255,255,255,.08);"+
      "border:1px solid rgba(232,200,119,.45);border-radius:14px;padding:12px 40px 12px 14px;cursor:pointer;transition:border-color .2s,background .2s}"+
    "[dir=rtl] .hk-mc-sel select{padding:12px 14px 12px 40px}"+
    ".hk-mc-sel select:focus-visible{outline:2px solid #E8C877;outline-offset:2px}"+
    ".hk-mc-sel select option{color:#0A2E36;background:#fff}"+
    ".hk-mc-sel::after{content:'';position:absolute;top:50%;inset-inline-end:16px;width:8px;height:8px;border:solid #E8C877;border-width:0 2px 2px 0;transform:translateY(-70%) rotate(45deg);pointer-events:none}"+
    ".hk-mc-pills{display:flex;flex-wrap:wrap;gap:6px}"+
    ".hk-mc-pill{font:inherit;font-size:13px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);color:#fff;cursor:pointer;transition:all .2s}"+
    ".hk-mc-pill[aria-checked=true]{background:#E8C877;border-color:#E8C877;color:#0A2E36;box-shadow:0 0 16px rgba(232,200,119,.45)}"+
    ".hk-mc-pill:focus-visible,.hk-mc-step button:focus-visible{outline:2px solid #E8C877;outline-offset:2px}"+
    ".hk-mc-row{display:flex;gap:14px;flex-wrap:wrap}"+
    ".hk-mc-row>.hk-mc-f{flex:1 1 140px}"+
    ".hk-mc-step{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.05)}"+
    ".hk-mc-step button{font:inherit;width:36px;height:36px;border:0;background:none;color:#E8C877;font-size:20px;line-height:1;cursor:pointer;border-radius:50%}"+
    ".hk-mc-step button:disabled{opacity:.3;cursor:default}"+
    ".hk-mc-step output{min-width:30px;text-align:center;font-weight:700;font-size:15px}"+
    ".hk-mc-dial{display:flex;flex-direction:column;align-items:center;justify-content:center}"+
    ".hk-mc-ring{position:relative;width:min(100%,210px);aspect-ratio:1}"+
    ".hk-mc-ring svg{width:100%;height:100%;transform:rotate(-90deg);overflow:visible}"+
    ".hk-mc-ring circle{fill:none;stroke-width:14;transition:stroke-dasharray .8s cubic-bezier(.3,.8,.3,1),stroke-dashoffset .8s cubic-bezier(.3,.8,.3,1)}"+
    ".hk-mc-ring .bg{stroke:rgba(255,255,255,.08)}"+
    ".hk-mc-ring::before{content:'';position:absolute;inset:8%;border-radius:50%;box-shadow:0 0 38px 8px rgba(232,200,119,.55),inset 0 0 26px rgba(232,200,119,.35);opacity:0;pointer-events:none}"+
    ".hk-live .hk-mc-ring{animation:hkMcPulse 4s ease-in-out infinite}.hk-live .hk-mc-ring::before{animation:hkMcGlow 4s ease-in-out infinite}"+
    "@keyframes hkMcPulse{0%,24%,100%{transform:scale(1)}6%{transform:scale(1.04)}12%{transform:scale(.99)}17%{transform:scale(1.01)}}"+
    "@keyframes hkMcGlow{0%,34%,100%{opacity:0}7%{opacity:1}}"+
    ".hk-mc-mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 22%}"+
    ".hk-mc-cur{font-size:12px;font-weight:700;color:#E8C877;letter-spacing:.08em}"+
    ".hk-mc-num{font-size:clamp(17px,2vw,21px);font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;direction:ltr;white-space:nowrap}"+
    ".hk-mc-num small{display:block;font-size:.62em;font-weight:600;opacity:.75}"+
    ".hk-mc-per{font-size:11px;color:rgba(255,255,255,.65);margin-top:4px;line-height:1.3}"+
    ".hk-mc-meta{margin-top:12px;font-size:13px;color:#F3E2AE;text-align:center}"+
    ".hk-mc-leg{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin-top:12px;font-size:12px;color:rgba(255,255,255,.8)}"+
    ".hk-mc-leg span{display:flex;align-items:center;gap:6px}.hk-mc-leg i{width:9px;height:9px;border-radius:3px;flex:none}"+
    ".hk-mc-foot{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:12px 32px 18px;border-top:1px solid rgba(255,255,255,.08)}"+
    
    ".hk-mc-cta{display:flex;gap:10px;flex-wrap:wrap}"+
    ".hk-mc-cta a{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:700;padding:11px 18px;border-radius:999px;text-decoration:none!important;transition:transform .2s,box-shadow .2s}"+
    ".hk-mc-cta a:hover{transform:translateY(-2px)}"+
    ".hk-mc-full{background:linear-gradient(135deg,#E8C877,#C9A23A);color:#0A2E36!important;box-shadow:0 8px 22px rgba(201,162,58,.35)}"+
    ".hk-mc-wa{border:1px solid rgba(255,255,255,.3);color:#fff!important}"+
    "@media(max-width:760px){html body #hk-mini-calc{padding:20px 10px!important}#hk-mini-calc .hk-mc-head{padding:14px 16px 0}.hk-mc{border-radius:22px}"+
      ".hk-mc-in{grid-template-columns:minmax(0,1fr);gap:4px;padding:8px 16px 4px}"+
      ".hk-mc-dial{order:-1;flex-direction:row;gap:12px;align-items:center;margin-bottom:4px}.hk-mc-ring{width:118px;flex:none}"+
      ".hk-mc-num{font-size:15px}.hk-mc-per{display:none}.hk-mc-cur{font-size:10px}.hk-mc-mid{padding:0 16%}.hk-mc-ring circle{stroke-width:15}"+
      ".hk-mc-side{flex:1;min-width:0}.hk-mc-leg{grid-template-columns:1fr;gap:3px;margin-top:6px;font-size:11px}.hk-mc-meta{text-align:start;margin-top:0;font-size:12px}"+
      "html body #hk-mini-calc .hk-mc h2{margin:4px 0 6px!important;font-size:21px!important}"+
      ".hk-mc-f{margin-bottom:8px}.hk-mc-l{margin-bottom:5px;font-size:11.5px}.hk-mc-sel select{padding-top:10px;padding-bottom:10px;font-size:14.5px}"+
      ".hk-mc-row{gap:8px;flex-wrap:nowrap}.hk-mc-row>.hk-mc-f{flex:0 1 auto;min-width:0}.hk-mc-row>.hk-mc-f:last-child{margin-inline-start:auto}"+
      ".hk-mc-step button{width:32px;height:32px}.hk-mc-step output{min-width:22px}.hk-mc-w{display:none}.hk-mc-s{display:inline}"+
      ".hk-mc-hot{flex-wrap:nowrap}.hk-mc-hot .hk-mc-pill{padding:7px 10px}"+
      ".hk-mc-cities{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:2px 16px 4px;scroll-padding:16px}.hk-mc-cities::-webkit-scrollbar{display:none}.hk-mc-cities .hk-mc-pill{flex:none}"+
      ".hk-mc-foot{padding:8px 16px 14px;gap:10px}.hk-mc-cta{width:100%;flex-wrap:nowrap}.hk-mc-cta a{flex:1;justify-content:center;padding:11px 12px}}"+
    "@media(min-width:761px){.hk-mc-side{width:100%}}"+
    "@media (prefers-reduced-motion:reduce){.hk-mc::before,.hk-mc-eb::before,.hk-mc.hk-in::after{animation:none}.hk-mc-ring circle{transition:none}.hk-live .hk-mc-ring,.hk-live .hk-mc-ring::before{animation:none}}";
  var R=52,CIRC=2*Math.PI*R;
  function fmt(n){var c=cur();return Math.round(n*c.r/c.step)*c.step}
  function num(n){return fmt(n).toLocaleString("en-US")}
  function nm(o){return ar?o.ar:o.en}
  function calc(){
    var d=D[S.d],c=C[S.c],q=d.q?S.q:1,tr=d.trips,t=S.t,rooms=Math.ceil(t/2),h=H[S.h];
    var parts=[[d.lo*q,d.hi*q],[c.fly[0]*t*tr,c.fly[1]*t*tr],[h[0]*d.nights*rooms*tr,h[1]*d.nights*rooms*tr],[320*tr,520*tr]];
    var lo=0,hi=0;parts.forEach(function(p){lo+=p[0];hi+=p[1]});
    return {d:d,parts:parts,lo:lo,hi:hi,q:q};
  }
  var el={},shown={lo:0,hi:0},raf=0;
  function count(lo,hi){
    cancelAnimationFrame(raf);var a={lo:shown.lo,hi:shown.hi},t0=performance.now(),dur=matchMedia("(prefers-reduced-motion:reduce)").matches?0:700;
    function step(now){var k=dur?Math.min(1,(now-t0)/dur):1,e=1-Math.pow(1-k,3);
      shown.lo=a.lo+(lo-a.lo)*e;shown.hi=a.hi+(hi-a.hi)*e;
      el.txt.data=num(shown.lo)+" – "+num(shown.hi);
      if(k<1)raf=requestAnimationFrame(step)}
    raf=requestAnimationFrame(step);
  }
  function render(){
    var r=calc(),mids=r.parts.map(function(p){return (p[0]+p[1])/2}),tot=mids.reduce(function(a,b){return a+b},0),off=0,gap=3;
    el.segs.forEach(function(s,i){var len=Math.max(0,CIRC*mids[i]/tot-gap);s.setAttribute("stroke-dasharray",len.toFixed(1)+" "+CIRC.toFixed(1));s.setAttribute("stroke-dashoffset",(-off).toFixed(1));off+=CIRC*mids[i]/tot});
    var cc=cur();el.cur.textContent=(ar?cc.ar:cc.en)+" · "+T.ind;
    if(el.lastCur!==cc){shown={lo:0,hi:0};el.lastCur=cc}
    count(r.lo,r.hi);
    var d=r.d;el.meta.textContent=d.days[0]+"–"+d.days[1]+" "+T.days+" · "+(d.trips>1?T.trips2:T.trip1);
    el.qf.hidden=!d.q;if(d.q){el.ql.textContent=d.ql==="teeth"?T.teeth:T.people;el.qo.value=el.qo.textContent=S.q;el.qm.disabled=S.q<=1;el.qp.disabled=S.q>=d.qmax}
    el.to.value=el.to.textContent=S.t;el.tm.disabled=S.t<=1;el.tp.disabled=S.t>=6;
    [].forEach.call(el.city.children,function(b,i){b.setAttribute("aria-checked",i===S.c?"true":"false");b.tabIndex=i===S.c?0:-1});
    [].forEach.call(el.hot.children,function(b){var on=+b.dataset.h===S.h;b.setAttribute("aria-checked",on?"true":"false");b.tabIndex=on?0:-1});
    var msg=T.waMsg+" "+nm(d)+(d.q?" ×"+S.q:"")+" · "+nm(C[S.c])+" · "+S.t+" "+T.travN+" · "+(S.h===5?T.star5:T.star4)+" → "+(ar?cc.ar:cc.en)+" "+num(r.lo)+" – "+num(r.hi)+" ("+T.ind+")";
    el.wa.href="https://wa.me/201031567949?text="+encodeURIComponent(msg);
  }
  function stepper(id,label){
    return '<div class="hk-mc-f" id="'+id+'f"><span class="hk-mc-l" id="'+id+'l">'+label+'</span><div class="hk-mc-step" role="group" aria-labelledby="'+id+'l">'+
      '<button type="button" id="'+id+'m" aria-label="'+T.minus+'">−</button><output id="'+id+'o" aria-live="polite"></output><button type="button" id="'+id+'p" aria-label="'+T.plus+'">+</button></div></div>';
  }
  function build(){
    var sec=document.createElement("section");sec.id="hk-mini-calc";sec.className="section section-sand2";sec.setAttribute("aria-labelledby","hkMcT");if(ar)sec.setAttribute("dir","rtl");
    var segs="";for(var i=0;i<4;i++)segs+='<circle class="seg" cx="60" cy="60" r="'+R+'" stroke="'+COL[i]+'" stroke-linecap="butt" stroke-dasharray="0 '+CIRC.toFixed(1)+'"/>';
    sec.innerHTML='<div class="hk-mc"><div class="hk-mc-head"><span class="hk-mc-eb">'+T.eyebrow+'</span><h2 id="hkMcT">'+T.title+'</h2></div>'+
      '<div class="hk-mc-in"><div class="hk-mc-ctrl">'+
      '<div class="hk-mc-f"><label class="hk-mc-l" for="hkMcD">'+T.treat+'</label><div class="hk-mc-sel"><select id="hkMcD">'+
        D.map(function(d,i){return '<option value="'+i+'">'+nm(d)+'</option>'}).join("")+'</select></div></div>'+
      '<div class="hk-mc-row">'+stepper("hkMcQ",T.teeth)+stepper("hkMcT2",T.trav)+
      '<div class="hk-mc-f"><span class="hk-mc-l" id="hkMcHl">'+T.hotel+'</span><div class="hk-mc-pills hk-mc-hot" role="radiogroup" aria-labelledby="hkMcHl" id="hkMcH">'+
        '<button type="button" class="hk-mc-pill" role="radio" data-h="4">4★<span class="hk-mc-w"> '+T.star4+'</span></button><button type="button" class="hk-mc-pill" role="radio" data-h="5">5★<span class="hk-mc-w"> '+T.star5+'</span></button></div></div>'+
      '</div>'+
      '<div class="hk-mc-f"><span class="hk-mc-l" id="hkMcCl">'+T.from+'</span><div class="hk-mc-pills hk-mc-cities" role="radiogroup" aria-labelledby="hkMcCl" id="hkMcC">'+
        C.map(function(c,i){return '<button type="button" class="hk-mc-pill" role="radio" data-i="'+i+'">'+nm(c)+'</button>'}).join("")+'</div></div>'+
      '</div><div class="hk-mc-dial"><div class="hk-mc-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="'+R+'"/>'+segs+'</svg>'+
        '<div class="hk-mc-mid"><span class="hk-mc-cur" id="hkMcCur"></span><div class="hk-mc-num" id="hkMcN" aria-live="polite"> </div><span class="hk-mc-per">'+T.perTrip+'</span></div></div>'+
        '<div class="hk-mc-side"><div class="hk-mc-meta" id="hkMcM"></div><div class="hk-mc-leg">'+
        T.parts.map(function(p,i){return '<span><i style="background:'+COL[i]+'"></i>'+p+'</span>'}).join("")+'</div></div></div></div>'+
      '<div class="hk-mc-foot"><div class="hk-mc-cta"><a class="hk-mc-full" href="'+T.fullHref+'">'+T.full+(ar?" ←":" →")+'</a>'+
        '<a class="hk-mc-wa" id="hkMcW" target="_blank" rel="noopener"><span class="hk-mc-w">'+T.wa+'</span><span class="hk-mc-s">'+T.waShort+'</span></a></div></div></div>';
    var $=function(id){return sec.querySelector("#"+id)};
    el={txt:null,cur:sec.querySelector("#hkMcCur"),segs:[].slice.call(sec.querySelectorAll("circle.seg")),num:$("hkMcN"),meta:$("hkMcM"),wa:$("hkMcW"),city:$("hkMcC"),hot:$("hkMcH"),
        qf:$("hkMcQf"),ql:$("hkMcQl"),qo:$("hkMcQo"),qm:$("hkMcQm"),qp:$("hkMcQp"),to:$("hkMcT2o"),tm:$("hkMcT2m"),tp:$("hkMcT2p")};
    el.txt=el.num.firstChild;
    $("hkMcD").addEventListener("change",function(e){S.d=+e.target.value;S.q=D[S.d].q||1;render()});
    el.qm.addEventListener("click",function(){if(S.q>1){S.q--;render()}});
    el.qp.addEventListener("click",function(){if(S.q<(D[S.d].qmax||1)){S.q++;render()}});
    el.tm.addEventListener("click",function(){if(S.t>1){S.t--;render()}});
    el.tp.addEventListener("click",function(){if(S.t<6){S.t++;render()}});
    function radios(box,attr,key,conv){
      box.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;S[key]=conv(b.dataset[attr]);render()});
      box.addEventListener("keydown",function(e){var bs=[].slice.call(box.children),i=bs.indexOf(document.activeElement);if(i<0)return;
        var n=/Arrow(Right|Down)/.test(e.key)?1:/Arrow(Left|Up)/.test(e.key)?-1:0;if(!n)return;if(ar&&/Left|Right/.test(e.key))n=-n;
        var j=(i+n+bs.length)%bs.length;S[key]=conv(bs[j].dataset[attr]);render();bs[j].focus();e.preventDefault()});
    }
    radios(el.city,"i","c",Number);radios(el.hot,"h","h",Number);
    render();
    /* First time it scrolls into view: the sheen sweeps across and the ring and totals fill from zero. */
    if(window.IntersectionObserver){var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();
      sec.firstChild.classList.add("hk-in");el.segs.forEach(function(s){s.setAttribute("stroke-dasharray","0 "+CIRC.toFixed(1))});shown={lo:0,hi:0};
      requestAnimationFrame(function(){requestAnimationFrame(render)})},{threshold:.35});io.observe(sec)}
    if(window.IntersectionObserver)new IntersectionObserver(function(es){sec.firstChild.classList.toggle("hk-live",es[0].isIntersecting)},{threshold:.4}).observe(sec);
    return sec;
  }
  var node=null;
  function place(){
    var grid=document.querySelector(".grid-sm");if(!grid)return;
    var svc=grid.closest("section");if(!svc||!svc.parentNode)return;
    if(!node){var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);node=build()}
    if(svc.nextElementSibling!==node)svc.parentNode.insertBefore(node,svc.nextSibling);
  }
  var tq;function soon(){clearTimeout(tq);tq=setTimeout(place,120)}
  function boot(){place();var r=document.getElementById("root")||document.body;if(window.MutationObserver)new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)if(!node||!node.contains(ms[i].target)){soon();return}}).observe(r,{childList:true,subtree:true});[600,1800,4000].forEach(function(t){setTimeout(place,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* HK-ESTIMATE: the "Your estimate" page that opens after a Jotform enquiry is sent.
   Jotform redirects to /estimate/ (or /ar/estimate/) with the visitor's answers in the URL (one letter per answer,
   see the URL keys below). This script turns them into an itemised, indicative price range in SAR.
   Excursion prices are read from the option text itself, e.g. "Luxor balloon (190–480 SAR)", so editing a form's
   options in Jotform updates the estimate automatically. Stay, add-on and treatment ranges are in the tables below.
   URL keys: f form, x choices/excursions, v extra excursions, e already in Egypt, n nights, w who, t travellers,
   s stay, b bedrooms, a add-ons, m treatments, h hotel level, k what they want to know, r rooms, y nightly budget,
   d dental services. */
(function(){
  var root=document.getElementById("hk-est");if(!root)return;
  var AR=document.documentElement.lang==="ar";
  function T(en,ar){return AR?ar:en}
  // break out of the form box / pop-up so the estimate gets the whole page (same site, so this is allowed)
  try{if(window.top!==window.self&&window.top.location.host===location.host){window.top.location.replace(location.href);return}}catch(e){}
  var KEYS="fxventwsbamhkryd";
  function parse(){
    var q=location.search.replace(/^\?/,""),out={},re=/(?:^|&)([a-z])=/g,m,marks=[];
    while((m=re.exec(q))){if(KEYS.indexOf(m[1])>=0)marks.push({k:m[1],i:m.index,v:m.index+m[0].length})}
    for(var j=0;j<marks.length;j++){
      var raw=q.slice(marks[j].v,j+1<marks.length?marks[j+1].i:q.length);
      try{raw=decodeURIComponent(raw.replace(/\+/g," "))}catch(e){raw=raw.replace(/\+/g," ")}
      raw=raw.replace(/<br\s*\/?>/gi,"\n").trim();
      if(/^\{[^}]*\}$/.test(raw))raw="";
      if(!(marks[j].k in out))out[marks[j].k]=raw;
    }
    return out;
  }
  function num(v){var s=String(v||"").replace(/[٠-٩]/g,function(d){return "٠١٢٣٤٥٦٧٨٩".indexOf(d)});var m=s.match(/\d+/);return m?parseInt(m[0],10):0}
  function int(s){return parseInt(String(s).replace(/,/g,""),10)}
  function r10(x){return Math.round(x/10)*10}
  function fmt(x){return r10(x).toLocaleString("en-US")}

  // ---- tables (indicative SAR) ----
  var STAY=[ // regex, low, high, unit: room (per room per night), unit (whole villa/apartment per night), person (per person per night)
    [/villa|فيلا/i,1200,4000,"unit"],
    [/apartment|chalet|شقة|شاليه/i,300,900,"unit"],
    [/nile cruise ship|باخرة/i,410,1100,"person"],
    [/5-star|5 نجوم|spa resort|سبا/i,800,2000,"room"],
    [/all-inclusive|شامل كلياً|family resort|منتجع عائلي|beach resort|منتجع شاطئي/i,700,1800,"room"],
    [/4-star|4 نجوم|eco-lodge|نُزُل|نزل بيئي/i,400,800,"room"],
    [/3-star|3 نجوم|guesthouse|ضيافة|camp|مخيّم|مخيم/i,250,450,"room"]
  ];
  var ADD=[ // regex, low, high, unit: once, day (low 1 day, high every day), person, room (one night)
    [/airport|المطار/i,150,350,"once","Airport pick-up","الاستقبال من المطار"],
    [/driver|سائق/i,450,900,"day","Private car with driver","سيارة خاصة مع سائق"],
    [/interpreter|مترجم/i,300,600,"day","Medical interpreter","مترجم طبي"],
    [/guide|مرشد/i,300,600,"day","Private guide","مرشد خاص"],
    [/doctor or nurse|طبيب أو ممرض/i,600,1200,"once","Doctor or nurse on call","طبيب أو ممرض عند الطلب"],
    [/spa|سبا/i,250,800,"person","Spa or wellness day","يوم سبا واستجمام"],
    [/check-up or treatment|فحص طبي أو علاج/i,200,200,"once","Initial medical check-up","الفحص الطبي الأولي"],
    [/sightseeing|جولات/i,160,530,"person","Sightseeing day","جولة سياحية"],
    [/hotel before or after|فندق قبل/i,400,2000,"room","Hotel night before or after the cruise","ليلة فندقية قبل الرحلة أو بعدها"],
    [/companion|carer|مرافق|رعاية/i,null,null,"once","Companion or carer","مرافق أو مقدّم رعاية"],
    [/relaxation stay|إقامة للاسترخاء/i,null,null,"once","Relaxation stay after treatment","إقامة للاسترخاء بعد العلاج"]
  ];
  var TREAT=[ // regex, low, high, min days, max days, en, ar (null price = priced after the doctor's review)
    [/cosmetic and plastic|جراحة التجميل/i,6800,18800,7,14,"Cosmetic and plastic surgery","جراحة التجميل"],
    [/hair transplant|زراعة الشعر/i,4500,11300,4,6,"Hair transplant","زراعة الشعر"],
    [/weight-loss|إنقاص الوزن/i,10100,18800,7,12,"Weight-loss surgery","جراحات إنقاص الوزن"],
    [/dental treatment|علاج الأسنان/i,940,12000,3,10,"Dental treatment","علاج الأسنان"],
    [/full health check-up|فحص طبي شامل/i,900,1700,2,3,"Full health check-up","الفحص الطبي الشامل"],
    [/longevity|طول العمر/i,900,1700,2,3,"Preventive and longevity check-up","فحص وقائي وفحص طول العمر"],
    [/orthopaedics|knee|الركبة/i,26250,28100,10,14,"Knee or hip replacement (from)","استبدال الركبة أو الورك (يبدأ من)"],
    [/lasik|الليزك/i,1050,3900,4,7,"LASIK and eye care","الليزك وطب العيون"],
    [/physiotherapy|العلاج الطبيعي/i,250,1100,7,21,"Physiotherapy (about 10 sessions)","العلاج الطبيعي (نحو 10 جلسات)"],
    [/doctor visit at my hotel|زيارة طبيب في فندقي/i,600,1200,0,0,"Doctor visit at your hotel","زيارة طبيب في فندقك"],
    [/children's doctor|طبيب أطفال/i,600,1200,0,0,"Children's doctor at your hotel","طبيب أطفال في فندقك"],
    [/nurse|تمريض/i,null,null,0,0,"Nurse visit","زيارة تمريض"],
    [/urgent dentist|طبيب أسنان عاجل/i,null,null,0,0,"Urgent dentist","طبيب أسنان عاجل"],
    [/video consultation|بالفيديو/i,0,0,0,0,"Video consultation (covered by the check-up fee)","استشارة بالفيديو (ضمن رسوم الفحص)"],
    [/recovery and wellness stay|إقامة للتعافي/i,0,0,5,7,"Recovery and wellness stay","إقامة للتعافي والاستجمام"],
    [/fertility|الخصوبة/i,null,null,0,0,"Fertility treatment","علاج الخصوبة"],
    [/cardiology|القلب/i,null,null,0,0,"Cardiology","أمراض القلب"],
    [/oncology|الأورام/i,null,null,0,0,"Oncology","الأورام"],
    [/neurology|الأعصاب/i,null,null,0,0,"Neurology","الأعصاب"],
    [/gastroenterology|الهضمي/i,null,null,0,0,"Gastroenterology","الجهاز الهضمي"],
    [/dermatology|الجلدية/i,null,null,0,0,"Dermatology","الأمراض الجلدية"]
  ];
  var DENTAL=[
    [/implant|زراعة/i,940,11300,3,5,"Dental implants (one implant to a full jaw)","زراعة الأسنان (من زرعة واحدة إلى فك كامل)"],
    [/cosmetic dentistry|hollywood|تجميل|ابتسامة/i,2720,12000,5,10,"Cosmetic dentistry (veneers to a Hollywood smile)","تجميل الأسنان (من القشور إلى ابتسامة هوليوود)"],
    [/fillings|root canal|حشو|عصب/i,null,null,2,4,"Dental treatment (fillings, root canal)","علاج الأسنان (حشو، علاج عصب)"],
    [/laser|whitening|تبييض/i,null,null,1,2,"Laser whitening and gum cleaning","تبييض الأسنان بالليزر وتنظيف اللثة"],
    [/children|أطفال/i,null,null,1,3,"Children's dentistry","طب أسنان الأطفال"]
  ];
  var NIGHTLY=[[/under 400|أقل من 400/i,250,400],[/^\s*400.?800/,400,800],[/800.?1,?500/,800,1500],[/over 1,?500|أكثر من 1,?500/i,1500,2500]];

  // ---- calculation ----
  var P=parse(),rows=[],onreq=[],lo=0,hi=0,notes=[];
  function add(label,l,h,detail){rows.push([label,l,h,detail||""]);lo+=l;hi+=h}
  function each(n){return n>1?T("per person × ","للشخص × ")+n:T("per person","للشخص")}
  function travellers(){
    var w=P.w||"",t=num(P.t);
    if(/just me|only the patient|أنا فقط|المريض فقط/i.test(w))return 1;
    if(/couple|one companion|زوجان|مرافق واحد/i.test(w))return 2;
    if(/family|group|العائلة|عائلة|مجموعة/i.test(w))return t||(/group|مجموعة/i.test(w)?6:4);
    return t||1;
  }
  var inEgypt=/yes|نعم/i.test(P.e||"");
  function priced(txt,people){ // options like "Name (170–530 SAR)"
    var re=/([^()\n]*?)\s*\(([^()]*)\)/g,m;
    while((m=re.exec(txt||""))){
      var name=m[1].replace(/^[\s,،;|]+/,"").trim(),inner=m[2],r;
      if(!name)continue;
      if(/request|الطلب/i.test(inner)){onreq.push(name);continue}
      if((r=inner.match(/(\d[\d,]*)\s*[–-]\s*(\d[\d,]*)/))){add(name,int(r[1])*people,int(r[2])*people,each(people));continue}
      if((r=inner.match(/(?:about|نحو)\s*(\d[\d,]*)/i))){var c=int(r[1]);add(name,c*people,c*people,each(people));continue}
      if((r=inner.match(/(?:up to|حتى)\s*(\d[\d,]*)/i))){add(name,0,int(r[1])*people,T("up to, ","حتى، ")+each(people));continue}
    }
  }
  function stay(text,nLo,nHi,people,beds){
    if(!text||/already have|arrange it myself|لدي إقامة|سأرتّب|سأرتب/i.test(text))return;
    for(var i=0;i<STAY.length;i++){var s=STAY[i];if(!s[0].test(text))continue;
      var units=s[3]==="room"?Math.max(1,Math.ceil(people/2)):(s[3]==="person"?people:1);
      var what=s[3]==="room"?units+" "+T(units>1?"rooms":"room",units>1?"غرف":"غرفة"):(s[3]==="person"?people+" "+T(people>1?"people":"person",people>1?"أشخاص":"شخص"):(beds?beds+" "+T("bedrooms","غرف نوم"):T("whole unit","الوحدة كاملة")));
      add(T("Stay: ","الإقامة: ")+text.replace(/\s*\(.*$/,""),s[1]*units*nLo,s[2]*units*nHi,
        what+" · "+(nLo===nHi?nLo:nLo+"–"+nHi)+" "+T("nights","ليالٍ")+" · "+fmt(s[1])+"–"+fmt(s[2])+" "+T("SAR a night","ريال لليلة"));
      return}
  }
  function addons(text,days,people,rooms){
    if(!text)return;
    for(var i=0;i<ADD.length;i++){var a=ADD[i];if(!a[0].test(text))continue;
      var name=T(a[4],a[5]);days=Math.max(1,days);
      if(a[1]===null){onreq.push(name);continue}
      if(a[3]==="day")add(name,a[1],a[2]*days,fmt(a[1])+"–"+fmt(a[2])+" "+T("SAR a day, 1 to ","ريال لليوم، من يوم إلى ")+days+" "+T("days","أيام"));
      else if(a[3]==="person")add(name,a[1]*people,a[2]*people,each(people));
      else if(a[3]==="room")add(name,a[1]*rooms,a[2]*rooms,"");
      else add(name,a[1],a[2],"");
    }
  }
  var f=P.f||"",people=travellers(),hasData=!!f;
  if(f==="medical"){
    add(T("Initial check-up and doctor’s review","الفحص الأولي ومراجعة الطبيب"),200,200,T("fixed fee","رسوم ثابتة"));
    var dlo=0,dhi=0;
    TREAT.forEach(function(t){if(!t[0].test(P.m||""))return;var name=T(t[5],t[6]);
      if(t[1]===null)onreq.push(name);else if(t[2]>0)add(name,t[1],t[2],T("indicative, set by the treating doctor","تقديري، ويحدده الطبيب المعالج"));
      dlo=Math.max(dlo,t[3]);dhi=Math.max(dhi,t[4])});
    var rm=Math.max(1,Math.ceil(people/2));
    if(!inEgypt){
      var sv=P.s||"";if(/hotel near|فندق قريب/i.test(sv))sv=AR?"فندق "+(P.h||"4 نجوم"):(P.h||"4-star")+" hotel";
      stay(sv,dlo||5,dhi||7,people,0);
      addons(P.a,dhi||5,people,rm);
    }else addons(P.a,3,people,1);
    notes.push(T("Treatment prices are indicative ranges from published Egyptian price lists. The treating doctor sets the treatment plan and the final price after the check-up.","أسعار العلاج نطاقات تقديرية من قوائم أسعار مصرية منشورة، ويحدد الطبيب المعالج خطة العلاج والسعر النهائي بعد الفحص."));
    if(/cost|التكلفة/i.test(P.k||""))notes.push(T("You asked about the cost: your coordinator will send a written, itemised quotation.","سألت عن التكلفة: سيرسل لك المنسّق عرض سعر مكتوباً ومفصّلاً."));
  }else if(f==="dental"){
    add(T("Initial check-up and dentist’s review","الفحص الأولي ومراجعة طبيب الأسنان"),200,200,T("fixed fee","رسوم ثابتة"));
    var a1=0,b1=0;
    DENTAL.forEach(function(t){if(!t[0].test(P.m||""))return;var name=T(t[5],t[6]);
      if(t[1]===null)onreq.push(name);else add(name,t[1],t[2],T("indicative, set by the dentist after examination","تقديري، ويحدده الطبيب بعد الفحص"));
      a1=Math.max(a1,t[3]);b1=Math.max(b1,t[4])});
    a1=a1||3;b1=b1||7;
    if(/hotel|apartment|فندق|شقة/i.test(P.d||"")){
      var rooms=num(P.r)||Math.max(1,Math.ceil(people/2)),nb=null;
      NIGHTLY.forEach(function(x){if(!nb&&x[0].test(P.y||""))nb=x});
      if(nb)add(T("Stay","الإقامة"),nb[1]*rooms*a1,nb[2]*rooms*b1,rooms+" "+T(rooms>1?"rooms":"room",rooms>1?"غرف":"غرفة")+" · "+a1+"–"+b1+" "+T("nights","ليالٍ"));
      else stay(P.s||"4-star",a1,b1,people,0);
    }
    addons(P.d,b1,people,1);
    notes.push(T("Dental prices are indicative ranges. Implants often need two trips a few months apart. The dentist confirms the plan and price after examination.","أسعار الأسنان نطاقات تقديرية، وغالباً ما تحتاج الزراعة إلى رحلتين بينهما بضعة أشهر، ويؤكد الطبيب الخطة والسعر بعد الفحص."));
  }else if(f){
    priced(P.x,people);priced(P.v,people);
    var n=num(P.n),nl=n||3,nh=n||7;
    if(!inEgypt)stay(P.s,nl,nh,people,num(P.b));
    addons(P.a,inEgypt?3:nh,people,Math.max(1,Math.ceil(people/2)));
    if(!n&&!inEgypt&&P.s&&!/already|لدي إقامة/i.test(P.s))notes.push(T("You did not give a number of nights, so the stay is shown for 3–7 nights.","لم تحدد عدد الليالي، لذا احتسبنا الإقامة من 3 إلى 7 ليالٍ."));
    notes.push(T("Excursion prices come from public listings (November 2026). The registered tourism company confirms the final price in writing.","أسعار الرحلات من قوائم منشورة (نوفمبر 2026)، وتؤكد شركة السياحة المسجّلة السعر النهائي كتابياً."));
  }

  // ---- render ----
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  var h;
  if(!hasData||(!rows.length&&!onreq.length)){
    h='<div class="hk-est-card"><h2>'+T("Your request has reached our team","وصل طلبك إلى فريقنا")+'</h2><p>'+
      T("A Hayakkom coordinator will contact you on WhatsApp within 12 hours with a written estimate.","سيتواصل معك منسّق من حياكم على واتساب خلال 12 ساعة بعرض سعر مكتوب.")+'</p><p><a href="'+T("/calculator/","/ar/calculator/")+'">'+
      T("Try the cost calculator →","جرّب حاسبة التكلفة ←")+'</a></p></div>';
  }else{
    h='<div class="hk-est-card"><p class="hk-est-ok">✓ '+T("Your request has reached our team. Here is your indicative estimate.","وصل طلبك إلى فريقنا، وهذا تقديرك المبدئي.")+'</p>'+
      '<p class="hk-est-meta">'+people+" "+T(people>1?"travellers":"traveller",people>1?"مسافرين":"مسافر")+(inEgypt?" · "+T("already in Egypt","في مصر الآن"):"")+'</p>'+
      '<table class="hk-est-t"><thead><tr><th>'+T("Item","البند")+'</th><th>'+T("Estimate (SAR)","التقدير (ريال)")+'</th></tr></thead><tbody>';
    rows.forEach(function(r){h+='<tr><td><strong>'+esc(r[0])+'</strong>'+(r[3]?'<small>'+esc(r[3])+'</small>':'')+'</td><td class="n">'+(r[1]===r[2]?fmt(r[1]):fmt(r[1])+"–"+fmt(r[2]))+'</td></tr>'});
    h+='</tbody><tfoot><tr><td>'+T("Estimated total","الإجمالي التقديري")+'</td><td class="n">'+(lo===hi?fmt(lo):fmt(lo)+"–"+fmt(hi))+' '+T("SAR","ريال")+'</td></tr></tfoot></table>';
    if(onreq.length)h+='<p class="hk-est-req"><strong>'+T("Priced after review (not in the total):","تُسعَّر بعد المراجعة (غير مشمولة في الإجمالي):")+'</strong> '+onreq.map(esc).join(T(", ","، "))+'</p>';
    h+='<ul class="hk-est-notes"><li>'+T("Indicative estimate in Saudi riyals, excluding flights. It is not a quotation.","تقدير مبدئي بالريال السعودي لا يشمل الطيران، وليس عرض سعر.")+'</li>';
    notes.forEach(function(x){h+='<li>'+esc(x)+'</li>'});
    h+='<li>'+T("A coordinator will contact you on WhatsApp within 12 hours. You receive a written, itemised quotation before you pay.","سيتواصل معك منسّق على واتساب خلال 12 ساعة، وتستلم عرض سعر مكتوباً ومفصّلاً قبل الدفع.")+'</li></ul></div>';
  }
  root.innerHTML=h;
  // count the lead once (Jotform's own "submitted" signal may not reach the page when it redirects here)
  try{var key="hk_est_"+location.search.slice(0,120);
    if(hasData&&!sessionStorage.getItem(key)){sessionStorage.setItem(key,"1");
      if(typeof window.gtag==="function"){window.gtag("event","generate_lead",{form_source:"jotform_estimate",form_key:f});
        window.gtag("event","conversion",{send_to:"AW-16686203605/FU0DCM-orNgZENWFzZQ-"})}}}catch(e){}
})();

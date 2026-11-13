/* Hayakkom Gateway: one place to build a whole Egypt plan.
   Mounted on the home pages (EN/AR) and on /gateway/ and /ar/gateway/. Any element with id="hk-gateway" becomes the
   planner; on the home page it is placed right after the hero. Prices are the site's indicative ranges in SAR
   (see /excursions/, /holidays/, /kunooz/, /dental/ and the estimate page), excluding flights. Nothing is booked here:
   the plan is sent to a coordinator by WhatsApp or the enquiry form, and a written quote follows before any payment. */
(function () {
  if (window.__hkGateway) return; window.__hkGateway = 1;
  var AR = document.documentElement.lang === 'ar' || /^\/ar(\/|$)/.test(location.pathname);
  var WA = '201031567949';

  // ---- catalogue: [id, group, region(s), EN, AR, low, high, unit, link]
  // units: item (once), pp (per person), night (per room per night), day (per day), trip (per transfer)
  var C = [
    ['den-imp', 'treat', '*', 'Dental implant (one)', 'زراعة سن واحدة', 940, 2300, 'item', '/dental/'],
    ['den-ven', 'treat', '*', 'Porcelain veneers (per tooth)', 'قشرة خزفية (للسن)', 340, 680, 'item', '/dental/'],
    ['den-hol', 'treat', '*', 'Hollywood smile (16–20 teeth)', 'ابتسامة هوليوود (16–20 سناً)', 6800, 12000, 'item', '/dental/'],
    ['den-all', 'treat', '*', 'All-on-4 (per jaw)', 'All-on-4 (للفك)', 8300, 11300, 'item', '/blog/dental-implants-cost-egypt-saudi-patients/'],
    ['hair', 'treat', 'cairo', 'Hair transplant', 'زراعة الشعر', 4500, 11300, 'item', '/hair-transplant/'],
    ['wl', 'treat', 'cairo', 'Weight-loss surgery', 'جراحة السمنة', 10100, 18800, 'item', '/weight-loss/'],
    ['cos', 'treat', 'cairo', 'Cosmetic surgery', 'جراحة التجميل', 6800, 18800, 'item', '/cosmetic-surgery/'],
    ['lasik', 'treat', 'cairo', 'LASIK (both eyes)', 'الليزك (للعينين)', 1050, 3900, 'item', '/eyes-lasik/'],
    ['chk', 'treat', '*', 'Full health check-up', 'فحص شامل', 900, 1700, 'item', '/full-checkup/'],
    ['physio', 'treat', '*', 'Physiotherapy session', 'جلسة علاج طبيعي', 250, 1100, 'item', '/physiotherapy/'],
    ['hdoc', 'treat', '*', 'Doctor at your hotel', 'طبيب في الفندق', 600, 1200, 'item', '/hotel-doctor/'],
    ['h3', 'stay', '*', '3-star hotel', 'فندق 3 نجوم', 250, 450, 'night', '/packages/'],
    ['h4', 'stay', '*', '4-star hotel', 'فندق 4 نجوم', 400, 800, 'night', '/packages/'],
    ['h5', 'stay', '*', '5-star hotel', 'فندق 5 نجوم', 800, 2000, 'night', '/sharm-5-star-hotels/'],
    ['hai', 'stay', 'redsea sinai', 'All-inclusive resort', 'منتجع شامل كلياً', 700, 1800, 'night', '/holidays/'],
    ['apt', 'stay', '*', 'Serviced apartment', 'شقة فندقية', 300, 900, 'night', '/packages/'],
    ['villa', 'stay', 'north redsea', 'Private villa', 'فيلا خاصة', 1200, 4000, 'night', '/north-coast-villas/'],
    ['x-pyr', 'trip', 'cairo', 'Pyramids, Sphinx & Grand Egyptian Museum', 'الأهرامات وأبو الهول والمتحف المصري الكبير', 170, 530, 'pp', '/excursions/#cairo'],
    ['x-din', 'trip', 'cairo', 'Nile dinner cruise with show', 'عشاء على النيل مع عرض', 190, 270, 'pp', '/excursions/#cairo'],
    ['x-bal', 'trip', 'nile', 'Luxor sunrise balloon', 'منطاد الأقصر عند الشروق', 190, 480, 'pp', '/excursions/'],
    ['x-abu', 'trip', 'nile', 'Abu Simbel by road', 'أبو سمبل براً', 150, 360, 'pp', '/excursions/'],
    ['x-isl', 'trip', 'redsea sinai', 'Red Sea island boat day', 'رحلة بحرية إلى الجزر', 110, 260, 'pp', '/excursions/'],
    ['x-cru', 'trip', 'nile', 'Nile cruise Luxor–Aswan (4 nights)', 'رحلة نيلية الأقصر–أسوان (4 ليالٍ)', 1650, 4400, 'pp', '/nile-cruise/'],
    ['k1', 'kunooz', 'cairo', 'Kunooz 1 · Tunis Village & Wadi El Rayan', 'كنز 1 · قرية تونس ووادي الريان', 380, 950, 'pp', '/kunooz/#gem-1'],
    ['k2', 'kunooz', 'desert cairo', 'Kunooz 2 · A night in the White Desert', 'كنز 2 · ليلة في الصحراء البيضاء', 600, 1700, 'pp', '/kunooz/#gem-2'],
    ['k3', 'kunooz', 'desert', 'Kunooz 3 · Siwa salt lakes (3 nights)', 'كنز 3 · بحيرات الملح في سيوة (3 ليالٍ)', 730, 7500, 'pp', '/kunooz/#gem-3'],
    ['k4', 'kunooz', 'nile', 'Kunooz 4 · A night in a Nubian village', 'كنز 4 · ليلة في قرية نوبية', 300, 900, 'pp', '/kunooz/#gem-4'],
    ['k5', 'kunooz', 'nile', 'Kunooz 5 · Dendera & Abydos', 'كنز 5 · دندرة وأبيدوس', 400, 950, 'pp', '/kunooz/#gem-5'],
    ['k6', 'kunooz', 'north cairo', 'Kunooz 6 · Ottoman Rosetta', 'كنز 6 · رشيد العثمانية', 350, 800, 'pp', '/kunooz/#gem-6'],
    ['k7', 'kunooz', 'sinai', 'Kunooz 7 · Mount Sinai sunrise', 'كنز 7 · شروق جبل موسى', 350, 850, 'pp', '/kunooz/#gem-7'],
    ['k8', 'kunooz', 'redsea', 'Kunooz 8 · Sea turtles & Wadi El Gemal', 'كنز 8 · السلاحف ووادي الجمال', 300, 750, 'pp', '/kunooz/#gem-8'],
    ['k9', 'kunooz', 'cairo', 'Kunooz 9 · Al-Muizz Street by night', 'كنز 9 · شارع المعز ليلاً', 200, 550, 'pp', '/kunooz/#gem-9'],
    ['k10', 'kunooz', 'desert', 'Kunooz 10 · Al-Qasr, Dakhla (3–4 days)', 'كنز 10 · مدينة القصر في الداخلة (3–4 أيام)', 3000, 7500, 'pp', '/kunooz/#gem-10'],
    ['e-air', 'extra', '*', 'Private airport pick-up', 'استقبال خاص من المطار', 150, 350, 'trip', '/packages/'],
    ['e-drv', 'extra', '*', 'Private car & driver', 'سيارة خاصة مع سائق', 450, 900, 'day', '/packages/'],
    ['e-gui', 'extra', '*', 'Arabic-speaking guide', 'مرشد يتحدث العربية', 300, 600, 'day', '/excursions/'],
    ['e-spa', 'extra', '*', 'Spa & wellness day', 'يوم سبا واستجمام', 250, 800, 'pp', '/wellness-retreats/'],
    ['e-ivt', 'extra', '*', 'Interpreter at the clinic', 'مترجم في العيادة', 300, 600, 'day', '/medical/']
  ];
  var P = [
    ['p-sharm', 'sinai redsea', 'Sharm el-Sheikh family holiday · 5 nights', 'عطلة عائلية في شرم الشيخ · 5 ليالٍ', 3500, 9700, 'room', '/holidays/#sharm-family'],
    ['p-cairo', 'cairo', 'Cairo family stay · 5 nights', 'إقامة عائلية في القاهرة · 5 ليالٍ', 2700, 6200, 'family', '/holidays/'],
    ['p-nile', 'nile', 'Nile cruise Luxor–Aswan · 4 nights', 'رحلة نيلية الأقصر–أسوان · 4 ليالٍ', 1650, 4400, 'pp', '/nile-cruise/'],
    ['p-north', 'north', 'North Coast summer · 5 nights', 'صيف الساحل الشمالي · 5 ليالٍ', 4250, 10500, 'room', '/north-coast/'],
    ['p-kun8', 'cairo nile desert redsea', 'Kunooz 8-day journey', 'رحلة كنوز في 8 أيام', 7500, 16000, 'pp', '/kunooz/8-day-journey/'],
    ['p-vip', 'cairo', 'VIP Cairo & the Pyramids · 3 nights', 'VIP القاهرة والأهرامات · 3 ليالٍ', 7800, 12400, 'couple', '/vip-trip/'],
    ['p-rec', '*', 'Treat & recover by the sea', 'علاج ثم نقاهة على البحر', 2700, 5650, 'stay', '/treatment-with-tourism/']
  ];
  var REG = [['any', 'anywhere in Egypt', 'أي مكان في مصر'], ['cairo', 'Cairo, Giza & Fayoum', 'القاهرة والجيزة والفيوم'],
    ['redsea', 'the Red Sea (Hurghada, El Gouna, Marsa Alam)', 'البحر الأحمر (الغردقة والجونة ومرسى علم)'], ['sinai', 'Sinai (Sharm & Dahab)', 'سيناء (شرم الشيخ ودهب)'],
    ['nile', 'Luxor, Aswan & the Nile', 'الأقصر وأسوان والنيل'], ['north', 'Alexandria & the North Coast', 'الإسكندرية والساحل الشمالي'],
    ['desert', 'the oases (Siwa, White Desert)', 'الواحات (سيوة والصحراء البيضاء)']];
  var GOAL = [['both', 'treatment and a holiday', 'علاجاً وعطلة'], ['holiday', 'a holiday', 'عطلة'], ['treat', 'medical or dental treatment', 'علاجاً طبياً أو أسنان'],
    ['kunooz', 'Egypt\'s hidden gems (Kunooz)', 'كنوز مصر الخفية'], ['now', 'help now — I\'m in Egypt', 'مساعدة الآن — أنا في مصر'], ['biz', 'business, study or investment', 'أعمال أو دراسة أو استثمار']];
  var STAY = [['h4', '4-star hotel', 'فندق 4 نجوم'], ['h3', '3-star hotel', 'فندق 3 نجوم'], ['h5', '5-star hotel', 'فندق 5 نجوم'], ['hai', 'all-inclusive resort', 'منتجع شامل'], ['apt', 'apartment', 'شقة'], ['villa', 'villa', 'فيلا'], ['none', 'no hotel needed', 'بدون فندق']];
  var T = AR ? {
    eyebrow: 'بوابة مصر', title: 'خطّط مصر كلها من مكان واحد', sub: 'اختر ما تريد، ونبني لك خطة بالأسعار التقديرية فوراً. أضف أو احذف، ثم أرسلها لمنسّق — عرض مكتوب قبل أي دفع.',
    s1: 'أريد', s2: 'في', s3: 'لـ', s4: 'لمدة', s5: 'ليالٍ، والإقامة', adults: 'بالغين', kids: 'أطفال', comma: '، ',
    ask: 'أو اسأل أي سؤال… (مثلاً: كم سعر زراعة الأسنان؟)', g: { treat: 'العلاجات', stay: 'الإقامة', trip: 'رحلات كلاسيكية', kunooz: 'كنوز مصر الخفية', extra: 'خدمات إضافية', pack: 'باقات جاهزة' },
    add: 'أضف', added: 'مضاف ✓', more: 'التفاصيل', plan: 'خطتي', empty: 'أضف عناصر لتظهر خطتك وسعرها التقديري هنا.', total: 'الإجمالي التقديري',
    note: 'أسعار تقديرية بالريال لا تشمل الطيران. الرحلات عبر شركات سياحة مصرية مسجّلة والعلاج لدى مؤسسات طبية مرخّصة.', send: 'أرسل خطتي على واتساب', quote: 'أرسل خطتي بالبريد الإلكتروني', share: 'انسخ رابط الخطة', copied: 'تم نسخ الرابط ✓', install: 'ثبّت التطبيق', clear: 'ابدأ من جديد',
    units: { item: '', pp: 'للشخص', night: 'لليلة', day: 'لليوم', trip: 'للتوصيلة', room: 'للغرفة', family: 'للعائلة', couple: 'للزوجين', stay: 'للإقامة' }, sar: 'ريال',
    now: 'نحن معك الآن: طبيب في الفندق أو طبيب أسنان أو رحلة لليوم التالي. يرد منسّق خلال 12 ساعة.',
    biz: 'رحلات الأعمال والدراسة والاستثمار والمؤتمرات الطبية ننسّقها حسب الطلب.', bizL: [['/ar/business/', 'رحلات العقار والأعمال'], ['/ar/educational/', 'الدراسة في مصر'], ['/ar/conferences/', 'المؤتمرات الطبية']]
  } : {
    eyebrow: 'Egypt Gateway', title: 'Plan all of Egypt in one place', sub: 'Tell us what you want and see a plan with indicative prices instantly. Add or remove anything, then send it to a coordinator — a written quote comes before you pay.',
    s1: 'I want', s2: 'in', s3: 'for', s4: 'for', s5: 'nights, staying in a', adults: 'adults', kids: 'children', comma: ', ',
    ask: 'Or ask anything… (e.g. how much are dental implants?)', g: { treat: 'Treatments', stay: 'Stays', trip: 'Classic trips', kunooz: 'Kunooz · hidden gems', extra: 'Extras', pack: 'Ready-made packages' },
    add: 'Add', added: 'Added ✓', more: 'Details', plan: 'My plan', empty: 'Add items to see your plan and its indicative total here.', total: 'Indicative total',
    note: 'Indicative prices in SAR, excluding flights. Trips by registered Egyptian tourism companies; treatment by licensed medical institutions.', send: 'Send my plan on WhatsApp', quote: 'Email my plan for a written quote', share: 'Copy plan link', copied: 'Link copied ✓', install: 'Install the app', clear: 'Start again',
    units: { item: '', pp: 'per person', night: 'per night', day: 'per day', trip: 'per transfer', room: 'per room', family: 'per family', couple: 'per couple', stay: 'per stay' }, sar: 'SAR',
    now: 'We\'re with you now: a doctor at your hotel, a dentist or a trip for tomorrow. A coordinator replies within 12 hours.',
    biz: 'Business, study, investment and medical-conference trips are coordinated on request.', bizL: [['/business/', 'Property & business trips'], ['/educational/', 'Study in Egypt'], ['/conferences/', 'Medical conferences']]
  };
  var pre = AR ? '/ar' : '';
  function L(x) { return AR ? x[4] : x[3]; }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function rng(a, b) { return '<bdi dir="ltr">' + fmt(a) + '–' + fmt(b) + '</bdi>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var DEF = function () { return { goal: 'both', reg: 'any', ad: 2, ch: 0, n: 5, st: 'h4', sel: { h4: 1 } }; };
  var S = DEF();
  try { var sv = JSON.parse(localStorage.getItem('hkGateway') || 'null'); if (sv && sv.sel) S = Object.assign(S, sv); } catch (e) {}
  var qp = location.search.match(/[?&]plan=([^&]+)/);
  if (qp) { try { S = Object.assign(DEF(), JSON.parse(decodeURIComponent(atob(decodeURIComponent(qp[1]))))); } catch (e) {} }
  var gp = location.search.match(/[?&]g=([a-z]+)/), rp = location.search.match(/[?&]r=([a-z]+)/);
  if (gp) S.goal = gp[1]; if (rp) S.reg = rp[1];
  var MORE = {}, TEASER = false;
  /* accept only known values from links and saved plans */
  (function clean() {
    function ok(list, v, d) { return list.some(function (o) { return o[0] === v; }) ? v : d; }
    function num(v, a, b, d) { v = parseInt(v, 10); return isNaN(v) ? d : Math.min(b, Math.max(a, v)); }
    S.goal = ok(GOAL, S.goal, 'both'); S.reg = ok(REG, S.reg, 'any'); S.st = ok(STAY, S.st, 'h4');
    S.ad = num(S.ad, 1, 12, 2); S.ch = num(S.ch, 0, 8, 0); S.n = num(S.n, 1, 21, 5);
    var ids = {}; C.forEach(function (c) { ids[c[0]] = 1; }); P.forEach(function (x) { ids[x[0]] = 1; });
    var sel = {}; Object.keys(S.sel || {}).forEach(function (k) { if (ids[k]) sel[k] = 1; }); S.sel = sel;
  })();
  function save() { try { localStorage.setItem('hkGateway', JSON.stringify(S)); } catch (e) {} }

  function qty(unit) {
    var rooms = Math.max(1, Math.ceil(S.ad / 2)), people = S.ad + S.ch;
    if (unit === 'pp') return people;
    if (unit === 'night') return rooms * S.n;
    if (unit === 'day') return Math.max(1, Math.min(S.n, 3));
    if (unit === 'trip') return 2;
    return 1;
  }
  function inReg(r) { return S.reg === 'any' || r === '*' || r.split(' ').indexOf(S.reg) >= 0; }
  function show(g) {
    var gl = S.goal;
    if (gl === 'now') return g === 'treat' || g === 'trip' || g === 'kunooz' || g === 'extra';
    if (gl === 'treat') return g === 'treat' || g === 'stay' || g === 'extra';
    if (gl === 'holiday') return g === 'stay' || g === 'trip' || g === 'kunooz' || g === 'extra';
    if (gl === 'kunooz') return g === 'kunooz' || g === 'stay' || g === 'extra';
    if (gl === 'biz') return g === 'stay' || g === 'extra';
    return true;
  }
  function items() {
    var out = [];
    C.forEach(function (c) { if (S.sel[c[0]]) { var q = qty(c[7]); out.push({ id: c[0], name: L(c), lo: c[5] * q, hi: c[6] * q, q: q }); } });
    P.forEach(function (p) {
      if (!S.sel[p[0]]) return;
      var m = p[6] === 'pp' ? S.ad + S.ch : p[6] === 'room' ? Math.max(1, Math.ceil(S.ad / 2)) : 1;
      out.push({ id: p[0], name: AR ? p[3] : p[2], lo: p[4] * m, hi: p[5] * m, q: m });
    });
    return out;
  }

  var root = null, css = '#hk-gateway{position:relative;z-index:3;margin:0 auto;max-width:1160px;padding:0 16px;box-sizing:border-box;text-align:start;color:#0A2E36}#hk-gateway *{box-sizing:border-box}' +
    '.hkg{background:#FBF8F1;border:1px solid #EADFC6;border-radius:22px;padding:24px 20px;margin:28px 0;box-shadow:0 18px 40px -28px rgba(10,46,54,.35)}' +
    '.hkg-e{color:#A8842F;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800}.hkg h2{color:#0A2E36!important;font-size:clamp(22px,3.6vw,32px);margin:6px 0;line-height:1.25}' +
    '.hkg-sub{color:#4A5B5E;line-height:1.7;margin:0 0 14px;max-width:720px}' +
    '.hkg-sent{font-size:clamp(16px,2.2vw,19px);line-height:2.5;color:#0A2E36}' +
    '.hkg-sent select{appearance:none;-webkit-appearance:none;background-color:#fff;color:#0A2E36;border:1px solid #E2D6B8;border-radius:12px;padding:4px 28px 4px 10px;font:inherit;font-weight:700;margin:0 2px;max-width:100%;cursor:pointer;line-height:1.6;' +
    'background-image:linear-gradient(45deg,transparent 50%,#A8842F 50%),linear-gradient(135deg,#A8842F 50%,transparent 50%);background-position:calc(100% - 14px) 55%,calc(100% - 9px) 55%;background-size:5px 5px;background-repeat:no-repeat}' +
    '[dir=rtl] .hkg-sent select{padding:4px 10px 4px 28px;background-position:14px 55%,19px 55%}' +
    '.hkg-go{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;width:100%;min-height:72px;margin-top:16px;padding:12px 18px;border-radius:20px;' +
    'background:linear-gradient(135deg,#F3D98B 0%,#D4A843 45%,#B8862A 100%);color:#0A2E36!important;text-decoration:none;border:1px solid rgba(255,255,255,.55);' +
    'box-shadow:0 14px 30px -12px rgba(184,134,42,.75),inset 0 1px 0 rgba(255,255,255,.6);transition:transform .2s,box-shadow .2s;animation:hkgGlow 2.6s ease-in-out infinite}' +
    '.hkg-go:hover{transform:translateY(-2px);box-shadow:0 20px 36px -12px rgba(184,134,42,.9),inset 0 1px 0 rgba(255,255,255,.6)}.hkg-go:active{transform:translateY(1px)}' +
    '.hkg-go:focus-visible{outline:3px solid #0A2E36;outline-offset:3px}' +
    '.hkg-go:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:hkgShine 4s ease-in-out infinite}' +
    '.hkg-go-i{flex:0 0 46px;width:46px;height:46px;border-radius:50%;background:#0A2E36;color:#F3D98B;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 0 4px rgba(255,255,255,.35)}' +
    '.hkg-go-t{flex:1;display:flex;flex-direction:column;line-height:1.25;text-align:start}.hkg-go-t b{font-size:clamp(18px,2.6vw,22px);font-weight:800}.hkg-go-t small{font-size:13px;font-weight:600;opacity:.82;margin-top:3px}' +
    '.hkg-go-a{flex:0 0 auto;font-size:26px;font-weight:800;animation:hkgNudge 1.6s ease-in-out infinite}[dir=rtl] .hkg-go-a{animation-name:hkgNudgeR}' +
    '@keyframes hkgShine{0%,55%{left:-60%}100%{left:130%}}@keyframes hkgGlow{0%,100%{box-shadow:0 14px 30px -12px rgba(184,134,42,.75),0 0 0 0 rgba(212,168,67,.45),inset 0 1px 0 rgba(255,255,255,.6)}50%{box-shadow:0 14px 30px -12px rgba(184,134,42,.75),0 0 0 8px rgba(212,168,67,0),inset 0 1px 0 rgba(255,255,255,.6)}}' +
    '@keyframes hkgNudge{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}@keyframes hkgNudgeR{0%,100%{transform:translateX(0)}50%{transform:translateX(-5px)}}' +
    '@media (prefers-reduced-motion:reduce){.hkg-go,.hkg-go:after,.hkg-go-a{animation:none}}' +
    '.hkg-ask{display:flex;align-items:center;gap:10px;margin:12px 0 0;padding:11px 16px;border-radius:999px;background:#fff;border:1px solid #EADFC6;color:#6B7B7E;cursor:text;font-size:15px}.hkg-ask svg{width:18px;height:18px;color:#A8842F;flex:0 0 18px}' +
    '.hkg-msg{margin:12px 0 0;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid #EADFC6;line-height:1.7}.hkg-msg a{color:#0A2E36;font-weight:700}' +
    '.hkg-body{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;margin-top:16px}@media(max-width:900px){.hkg-body{grid-template-columns:minmax(0,1fr)}}' +
    '.hkg-grp h3{color:#A8842F!important;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin:18px 0 8px}' +
    '.hkg-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}' +
    '.hkg-c{background:#fff;border:1px solid #EEE5CF;border-radius:14px;padding:10px 12px;display:flex;align-items:center;gap:10px}' +
    '.hkg-c.on{border-color:#D4A843;background:#FFFBEF}.hkg-c .tx{flex:1;min-width:0}.hkg-c b{display:block;font-size:14.5px;line-height:1.35;color:#0A2E36;font-weight:700}' +
    '.hkg-c .pr{font-size:12.5px;color:#6B7B7E}.hkg-c .pr strong{color:#0A2E36;font-weight:700}' +
    '.hkg-c button{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid #0A2E36;background:#fff;color:#0A2E36;font-size:20px;line-height:1;cursor:pointer}.hkg-c.on button{background:#D4A843;border-color:#D4A843;color:#0A2E36}' +
    '.hkg-c a{font-size:12px;color:#6B7B7E}.hkg-more{margin-top:8px;border:0;background:none;color:#0A2E36;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;padding:4px 0}' +
    '.hkg-plan{background:#0A2E36;color:#fff;border-radius:18px;padding:16px;position:sticky;top:84px;align-self:start}' +
    '.hkg-plan h3{margin:0 0 8px;font-size:17px;color:#D4A843!important}.hkg-plan ul{list-style:none;margin:0;padding:0;max-height:280px;overflow:auto}' +
    '.hkg-plan li{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:13.5px}.hkg-plan li span:last-child{white-space:nowrap;font-weight:700}' +
    '.hkg-plan li button{border:0;background:none;color:#F3B3B3;cursor:pointer;font-size:15px;padding:0 4px}' +
    '.hkg-tot{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:12px 0 4px;font-weight:800}.hkg-tot strong{font-size:20px;color:#D4A843;white-space:nowrap}' +
    '.hkg-plan small{display:block;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:10px;font-size:12px}' +
    '.hkg-act{display:grid;gap:8px}.hkg-act a,.hkg-act button{display:block;width:100%;text-align:center;border:0;border-radius:999px;padding:12px;font:inherit;font-weight:800;cursor:pointer;text-decoration:none}' +
    '.hkg-wa{background:#25D366;color:#fff!important}.hkg-q{background:#D4A843;color:#0A2E36!important}' +
    '.hkg-tabs{display:flex;gap:6px;flex-wrap:wrap}.hkg-tabs button{flex:1 1 auto;width:auto!important;background:rgba(255,255,255,.1);color:#fff;font-size:12.5px!important;padding:8px!important;font-weight:600!important}' +
    '.hkg-mbar{display:none}@media(max-width:900px){.hkg-mbar{display:flex;justify-content:space-between;align-items:center;gap:10px;position:sticky;bottom:12px;z-index:5;margin-top:14px;padding:12px 16px;border-radius:999px;background:#0A2E36;color:#fff!important;font-weight:800;text-decoration:none;box-shadow:0 10px 24px rgba(0,0,0,.25)}.hkg-mbar strong{color:#D4A843}}' +
    '@media(max-width:600px){#hk-gateway{padding:0 12px}.hkg{padding:18px 14px;border-radius:18px}.hkg-plan{position:static}.hkg-cards{grid-template-columns:1fr}}';

  function opt(list, val) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === String(val) ? ' selected' : '') + '>' + esc(AR ? o[2] : o[1]) + '</option>'; }).join(''); }
  function nums(a, b, val) { var s = ''; for (var i = a; i <= b; i++) s += '<option value="' + i + '"' + (i === +val ? ' selected' : '') + '>' + i + '</option>'; return s; }
  function card(id, name, lo, hi, unit, link) {
    var on = S.sel[id];
    return '<div class="hkg-c' + (on ? ' on' : '') + '"><div class="tx"><b>' + esc(name) + '</b><span class="pr"><strong>' + rng(lo, hi) + ' ' + T.sar + '</strong> ' + esc(T.units[unit] || '') +
      ' · <a href="' + pre + link + '">' + esc(T.more) + '</a></span></div><button type="button" data-t="' + id + '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(on ? T.added : T.add) + ' ' + esc(name) + '">' + (on ? '✓' : '+') + '</button></div>';
  }
  function group(key, title, cards) {
    var all = MORE[key], shown = all ? cards : cards.slice(0, 4);
    return '<div class="hkg-grp"><h3>' + esc(title) + '</h3><div class="hkg-cards">' + shown.join('') + '</div>' +
      (cards.length > 4 ? '<button type="button" class="hkg-more" data-more="' + key + '">' + (all ? (AR ? 'عرض أقل' : 'Show less') : (AR ? 'عرض الكل (' + cards.length + ')' : 'Show all (' + cards.length + ')')) + '</button>' : '') + '</div>';
  }
  function teaser() {
    return '<div class="hkg" dir="' + (AR ? 'rtl' : 'ltr') + '"><div class="hkg-e">🧭 ' + esc(T.eyebrow) + '</div><h2>' + esc(AR ? 'خطّط مصر في ثوانٍ' : 'Plan your Egypt in seconds') + '</h2>' +
      '<div class="hkg-sent">' + esc(T.s1) + ' <select data-k="goal" aria-label="' + esc(T.s1) + '">' + opt(GOAL, S.goal) + '</select> ' + esc(T.s2) +
      ' <select data-k="reg" aria-label="' + esc(T.s2) + '">' + opt(REG, S.reg) + '</select></div>' +
      '<a class="hkg-go" data-go="" href="' + pre + '/gateway/?g=' + S.goal + '&r=' + S.reg + '"><span class="hkg-go-i" aria-hidden="true">🧭</span><span class="hkg-go-t"><b>' + esc(AR ? 'ابنِ خطتي بالأسعار' : 'Build my plan with prices') + '</b><small>' + esc(AR ? 'مجاناً · أسعار تقديرية بالريال' : 'Free · indicative prices in SAR') + '</small></span><span class="hkg-go-a" aria-hidden="true">' + (AR ? '←' : '→') + '</span></a></div>';
  }
  function render() {
    if (TEASER) { root.innerHTML = teaser(); return; }
    var h = '<div class="hkg" dir="' + (AR ? 'rtl' : 'ltr') + '"><div class="hkg-e">' + esc(T.eyebrow) + '</div><h2>' + esc(T.title) + '</h2><p class="hkg-sub">' + esc(T.sub) + '</p>' +
      '<div class="hkg-sent">' + esc(T.s1) + ' <select data-k="goal" aria-label="' + esc(T.s1) + '">' + opt(GOAL, S.goal) + '</select> ' + esc(T.s2) +
      ' <select data-k="reg" aria-label="' + esc(T.s2) + '">' + opt(REG, S.reg) + '</select>' + T.comma + esc(T.s3) +
      ' <select data-k="ad" aria-label="' + esc(T.adults) + '">' + nums(1, 12, S.ad) + '</select> ' + esc(T.adults) +
      ' <select data-k="ch" aria-label="' + esc(T.kids) + '">' + nums(0, 8, S.ch) + '</select> ' + esc(T.kids) + T.comma + esc(T.s4) +
      ' <select data-k="n" aria-label="nights">' + nums(1, 21, S.n) + '</select> ' + esc(T.s5) +
      ' <select data-k="st" aria-label="stay">' + opt(STAY, S.st) + '</select></div>' +
      '<div class="hkg-ask" role="button" tabindex="0" data-ask=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>' + esc(T.ask) + '</span></div>';
    if (S.goal === 'now') h += '<div class="hkg-msg">' + esc(T.now) + ' <a href="' + pre + '/tourists/">→</a></div>';
    if (S.goal === 'biz') h += '<div class="hkg-msg">' + esc(T.biz) + ' ' + T.bizL.map(function (l) { return '<a href="' + l[0] + '">' + esc(l[1]) + '</a>'; }).join(' · ') + '</div>';
    h += '<div class="hkg-body"><div>';
    var packs = P.filter(function (p) { return inReg(p[1]) && (S.goal === 'both' || S.goal === 'holiday' || (S.goal === 'kunooz' && p[0] === 'p-kun8') || (S.goal === 'treat' && p[0] === 'p-rec')); });
    if (packs.length) h += group('pack', T.g.pack, packs.map(function (p) { return card(p[0], AR ? p[3] : p[2], p[4], p[5], p[6], p[7]); }));
    ['treat', 'stay', 'kunooz', 'trip', 'extra'].forEach(function (g) {
      if (!show(g) || (g === 'stay' && S.st === 'none')) return;
      var list = C.filter(function (c) { return c[1] === g && inReg(c[2]); });
      if (!list.length) return;
      h += group(g, T.g[g], list.map(function (c) { return card(c[0], L(c), c[5], c[6], c[7], c[8]); }));
    });
    var it0 = items(), l0 = 0, h0 = 0; it0.forEach(function (x) { l0 += x.lo; h0 += x.hi; });
    h += '<a class="hkg-mbar" href="#hkg-plan"><span>🧭 ' + esc(T.plan) + ' · ' + it0.length + '</span><strong>' + rng(l0, h0) + ' ' + T.sar + '</strong></a>';
    h += '</div><aside class="hkg-plan" id="hkg-plan" aria-live="polite">' + planHTML() + '</aside></div></div>';
    root.innerHTML = h;
    if (deferred) { var ib = root.querySelector('[data-install]'); if (ib) ib.hidden = false; }
  }
  function planHTML() {
    var it = items(), lo = 0, hi = 0;
    it.forEach(function (x) { lo += x.lo; hi += x.hi; });
    var h = '<h3>🧭 ' + esc(T.plan) + '</h3>';
    if (!it.length) h += '<small>' + esc(T.empty) + '</small>';
    else h += '<ul>' + it.map(function (x) {
      return '<li><span>' + esc(x.name) + (x.q > 1 ? ' ×' + x.q : '') + ' <button type="button" data-t="' + x.id + '" aria-label="remove">×</button></span><span>' + fmt(x.lo) + '–' + fmt(x.hi) + '</span></li>';
    }).join('') + '</ul><div class="hkg-tot"><span>' + esc(T.total) + '</span><strong>' + rng(lo, hi) + ' ' + T.sar + '</strong></div>';
    return h + '<small>' + esc(T.note) + '</small><div class="hkg-act">' +
      '<a class="hkg-wa" target="_blank" rel="noopener" href="' + waLink(it, lo, hi) + '">' + esc(T.send) + '</a>' +
      '<a class="hkg-q" data-quote="" href="' + mailLink(it, lo, hi) + '">' + esc(T.quote) + '</a>' +
      '<div class="hkg-tabs"><button type="button" data-share="">' + esc(T.share) + '</button><button type="button" data-install=""' + (((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone) ? ' hidden' : '') + '>' + esc(T.install) + '</button><button type="button" data-clear="">' + esc(T.clear) + '</button></div></div>';
  }
  function planText(it, lo, hi) {
    var g = GOAL.filter(function (x) { return x[0] === S.goal; })[0], r = REG.filter(function (x) { return x[0] === S.reg; })[0];
    var head = AR ? ('مرحباً حياكم 👋\nخطتي من بوابة مصر:\nأريد: ' + g[2] + ' — ' + r[2] + '\n' + S.ad + ' بالغين، ' + S.ch + ' أطفال، ' + S.n + ' ليالٍ\n')
      : ('Hello Hayakkom 👋\nMy plan from the Egypt Gateway:\nI want: ' + g[1] + ' — ' + r[1] + '\n' + S.ad + ' adults, ' + S.ch + ' children, ' + S.n + ' nights\n');
    var body = it.map(function (x) { return '• ' + x.name + (x.q > 1 ? ' ×' + x.q : '') + ': ' + fmt(x.lo) + '–' + fmt(x.hi) + ' ' + T.sar; }).join('\n');
    var tail = it.length ? ('\n' + (AR ? 'الإجمالي التقديري: ' : 'Indicative total: ') + fmt(lo) + '–' + fmt(hi) + ' ' + T.sar) : '';
    return head + body + tail + '\n' + (AR ? 'رابط الخطة: ' : 'Plan link: ') + shareURL();
  }
  function mailLink(it, lo, hi) {
    var subj = AR ? 'طلب عرض سعر من بوابة مصر' : 'Quote request from the Egypt Gateway';
    var body = planText(it, lo, hi) + '\n\n' + (AR ? 'الاسم:\nرقم الهاتف أو واتساب:\nموعد السفر المتوقع:\n' : 'Name:\nPhone or WhatsApp:\nExpected travel dates:\n');
    return 'mailto:support@hayakkom.com?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
  }
  function waLink(it, lo, hi) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(planText(it, lo, hi)); }
  function shareURL() {
    var base = location.origin + (AR ? '/ar/gateway/' : '/gateway/');
    try { return base + '?plan=' + encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return base; }
  }
  function track(n, p) { try { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); } catch (e) {} }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { deferred = e; });

  function wire(el) {
    el.addEventListener('change', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k) return;
      S[k] = (k === 'ad' || k === 'ch' || k === 'n') ? +e.target.value : e.target.value;
      if (k === 'st') { STAY.forEach(function (s) { delete S.sel[s[0]]; }); if (S.st !== 'none') S.sel[S.st] = 1; }
      save(); render(); track('gateway_change', { field: k, value: String(S[k]) });
    });
    el.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-t]');
      if (t) { var id = t.getAttribute('data-t'); if (S.sel[id]) delete S.sel[id]; else S.sel[id] = 1; save(); var y = window.scrollY; render(); window.scrollTo(0, y); track('gateway_add', { item: id }); return; }
      var mo = e.target.closest && e.target.closest('[data-more]');
      if (mo) { var k2 = mo.getAttribute('data-more'); MORE[k2] = !MORE[k2]; var y2 = window.scrollY; render(); window.scrollTo(0, y2); return; }
      if (e.target.closest('[data-go]')) { save(); track('gateway_teaser_go', { goal: S.goal, region: S.reg }); return; }
      if (e.target.closest('[data-ask]')) { if (window.hkSearchOpen) window.hkSearchOpen(); return; }
      if (e.target.closest('.hkg-wa')) { track('gateway_send', { channel: 'whatsapp', items: Object.keys(S.sel).length }); return; }
      if (e.target.closest('[data-quote]')) { track('gateway_send', { channel: 'email', items: Object.keys(S.sel).length }); return; }
      if (e.target.closest('[data-share]')) { var b = e.target.closest('[data-share]'); try { navigator.clipboard.writeText(shareURL()); b.textContent = T.copied; } catch (x) { window.prompt('', shareURL()); } track('gateway_share'); return; }
      if (e.target.closest('[data-install]')) { track('gateway_install'); if (window.hkInstall) window.hkInstall(); else if (deferred) { deferred.prompt(); deferred = null; } return; }
      if (e.target.closest('[data-clear]')) { S = DEF(); save(); render(); }
    });
    el.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-ask')) { e.preventDefault(); if (window.hkSearchOpen) window.hkSearchOpen(); } });
  }
  var styled = false;
  function mount() {
    var el = document.getElementById('hk-gateway');
    if (!el) {
      if (!/^\/(ar\/?)?$/.test(location.pathname)) return false;
      var hero = document.querySelector('main .hero, section.hero');
      if (!hero) return false;
      el = document.createElement('section'); el.id = 'hk-gateway'; el.setAttribute('aria-label', T.eyebrow); el.setAttribute('data-teaser', '1');
      hero.parentNode.insertBefore(el, hero.nextSibling);
    }
    if (el.getAttribute('data-ready')) return true;
    if (!styled) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); styled = true; }
    TEASER = el.getAttribute('data-teaser') === '1';
    root = el; el.setAttribute('data-ready', '1'); render(); wire(el);
    return true;
  }
  function boot() {
    if (!mount()) { setTimeout(boot, 400); return; }
    // the English home page is re-rendered by the React app: put the planner back if it is removed
    try { new MutationObserver(function () { var el = document.getElementById('hk-gateway'); if (!el || !el.getAttribute('data-ready')) mount(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

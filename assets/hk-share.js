/* Hayakkom: "Add to your phone" + "Recommend to a friend".
   No app store app exists: the site installs from the browser (web app manifest).
   Lives outside the React root so SPA re-renders never remove it. */
(function () {
  if (window.__hkShare) return; window.__hkShare = 1;

  function isAr() {
    var l = '';
    try { l = localStorage.getItem('hk-lang') || ''; } catch (e) {}
    return document.documentElement.lang === 'ar' || /^\/ar(\/|$)/.test(location.pathname) ||
      /[?&]lang=ar/.test(location.search) || l === 'ar';
  }
  var T = {
    en: {
      title: 'Take Hayakkom with you',
      sub: 'Keep us one tap away on your phone, or send us to someone planning a trip to Egypt.',
      install: 'Add to your phone', share: 'Recommend to a friend',
      shareTitle: 'Recommend Hayakkom', more: 'More apps…', copy: 'Copy link', copied: 'Link copied ✓',
      close: 'Close', email: 'Email',
      msg: 'Salam! I found Hayakkom — they arrange holidays, stays and treatment in Egypt for Gulf families, in Arabic and English. Have a look:',
      iosT: 'Add Hayakkom to your iPhone',
      ios: ['Tap the Share button <b>⎋</b> at the bottom of Safari.', 'Scroll and choose <b>Add to Home Screen</b>.', 'Tap <b>Add</b>. Hayakkom opens like an app.'],
      andT: 'Add Hayakkom to your phone',
      and: ['Open your browser menu <b>⋮</b>.', 'Choose <b>Install app</b> or <b>Add to Home screen</b>.', 'Confirm. Hayakkom opens like an app.'],
      done: 'Hayakkom is already on your phone ✓'
    },
    ar: {
      title: 'خلّ حياكم معك دائماً',
      sub: 'أضف حياكم إلى شاشة جوالك، أو أرسلنا لمن يخطط لرحلة إلى مصر.',
      install: 'أضف إلى جوالك', share: 'أرسل لصديق',
      shareTitle: 'أرسل حياكم لصديق', more: 'تطبيقات أخرى…', copy: 'نسخ الرابط', copied: 'تم نسخ الرابط ✓',
      close: 'إغلاق', email: 'البريد',
      msg: 'السلام عليكم! تعرّفت على حياكم — ينسّقون العطلات والإقامة والعلاج في مصر للعائلات الخليجية، بالعربي والإنجليزي. شوفهم هنا:',
      iosT: 'أضف حياكم إلى الآيفون',
      ios: ['اضغط زر المشاركة <b>⎋</b> أسفل متصفح سفاري.', 'اختر <b>إضافة إلى الشاشة الرئيسية</b>.', 'اضغط <b>إضافة</b>، وسيفتح حياكم كأنه تطبيق.'],
      andT: 'أضف حياكم إلى جوالك',
      and: ['افتح قائمة المتصفح <b>⋮</b>.', 'اختر <b>تثبيت التطبيق</b> أو <b>الإضافة إلى الشاشة الرئيسية</b>.', 'أكّد، وسيفتح حياكم كأنه تطبيق.'],
      done: 'حياكم موجود على جوالك ✓'
    }
  };

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  function standalone() {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function isMobile() { return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent); }

  var css = '' +
    '.hk-take{position:relative;z-index:5;max-width:1100px;margin:0 auto;padding:34px 5% 30px;text-align:center}' +
    '.hk-take-card{background:linear-gradient(135deg,#0A2E36 0%,#0E5E6B 100%);color:#fff;border-radius:22px;padding:26px 22px;box-shadow:0 10px 30px rgba(10,46,54,.18)}' +
    '.hk-take h2{font-size:21px;margin:0 0 6px;color:#fff;font-weight:700}' +
    '.hk-take p{margin:0 auto 16px;max-width:520px;font-size:14px;line-height:1.7;color:rgba(255,255,255,.82)}' +
    '.hk-take-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}' +
    '.hk-take-btns button{font:inherit;font-size:14px;font-weight:600;border-radius:999px;padding:12px 20px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;border:0}' +
    '.hk-tb-install{background:#fff;color:#0A2E36}' +
    '.hk-tb-share{background:#B8922A;color:#fff}' +
    '.hk-sheet-bg{position:fixed;inset:0;background:rgba(6,30,36,.55);z-index:2147483000;display:flex;align-items:flex-end;justify-content:center}' +
    '.hk-sheet{background:#fff;color:#173B44;width:100%;max-width:460px;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.2);max-height:86vh;overflow:auto}' +
    '@media(min-width:700px){.hk-sheet-bg{align-items:center}.hk-sheet{border-radius:22px}}' +
    '.hk-sheet h3{margin:4px 0 14px;font-size:17px;text-align:center}' +
    '.hk-sheet-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 6px;margin-bottom:12px}' +
    '.hk-sheet-grid a,.hk-sheet-grid button{display:flex;flex-direction:column;align-items:center;gap:6px;font:inherit;font-size:11.5px;color:#173B44;text-decoration:none;background:none;border:0;cursor:pointer;padding:4px 0}' +
    '.hk-ic{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}' +
    '.hk-sheet ol{margin:0 0 14px;padding-inline-start:22px;line-height:1.9;font-size:14.5px}' +
    '.hk-sheet-close{display:block;width:100%;font:inherit;font-size:14px;font-weight:600;border:0;border-radius:999px;padding:12px;background:#E6EEED;color:#0A2E36;cursor:pointer}' +
    '.hk-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0A2E36;color:#fff;padding:10px 16px;border-radius:999px;font-size:13.5px;z-index:2147483001}';

  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function toast(t) { var x = el('<div class="hk-toast" role="status"></div>'); x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.remove(); }, 2200); }
  function closeSheet() { var s = document.querySelector('.hk-sheet-bg'); if (s) s.remove(); }
  function sheet(inner, dir) {
    closeSheet();
    var bg = el('<div class="hk-sheet-bg" role="dialog" aria-modal="true"><div class="hk-sheet" dir="' + dir + '">' + inner + '</div></div>');
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('.hk-sheet-close')) closeSheet(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { closeSheet(); document.removeEventListener('keydown', k); } });
    document.body.appendChild(bg);
    var c = bg.querySelector('.hk-sheet-close'); if (c) c.focus();
    return bg;
  }

  function shareUrl() {
    var u = location.origin + location.pathname;
    return u + (u.indexOf('?') < 0 ? '?' : '&') + 'utm_source=friend&utm_medium=share';
  }

  function openShare(L, ar) {
    var url = shareUrl(), msg = L.msg + ' ' + url, e = encodeURIComponent;
    var items = [
      ['WhatsApp', '#25D366', 'https://wa.me/?text=' + e(msg), 'W'],
      ['Telegram', '#229ED9', 'https://t.me/share/url?url=' + e(url) + '&text=' + e(L.msg), 'T'],
      ['Facebook', '#1877F2', 'https://www.facebook.com/sharer/sharer.php?u=' + e(url), 'f'],
      ['X', '#111111', 'https://x.com/intent/post?text=' + e(L.msg) + '&url=' + e(url), 'X'],
      [L.email, '#0E7C86', 'mailto:?subject=' + e('Hayakkom — حياكم') + '&body=' + e(msg), '@']
    ];
    if (isMobile()) items.splice(3, 0, ['Messenger', '#0084FF', 'fb-messenger://share/?link=' + e(url), 'm']);
    var g = items.map(function (i) {
      return '<a href="' + i[2] + '" target="_blank" rel="noopener"><span class="hk-ic" style="background:' + i[1] + '">' + i[3] + '</span>' + i[0] + '</a>';
    }).join('');
    g += '<button type="button" class="hk-copy"><span class="hk-ic" style="background:#6A8389">⧉</span>' + L.copy + '</button>';
    if (navigator.share) g += '<button type="button" class="hk-more"><span class="hk-ic" style="background:#B8922A">⋯</span>' + L.more + '</button>';
    var bg = sheet('<h3>' + L.shareTitle + '</h3><div class="hk-sheet-grid">' + g + '</div><button type="button" class="hk-sheet-close">' + L.close + '</button>', ar ? 'rtl' : 'ltr');
    var cp = bg.querySelector('.hk-copy');
    cp.addEventListener('click', function () {
      var done = function () { toast(L.copied); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
      else { var t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); done(); }
    });
    var mo = bg.querySelector('.hk-more');
    if (mo) mo.addEventListener('click', function () { navigator.share({ title: 'Hayakkom — حياكم', text: L.msg, url: url }).catch(function () {}); });
    try { if (window.gtag) gtag('event', 'share_open', { page: location.pathname }); } catch (x) {}
  }

  function openInstall(L, ar) {
    if (standalone()) { toast(L.done); return; }
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; });
      return;
    }
    var ios = isIOS();
    var steps = (ios ? L.ios : L.and).map(function (s) { return '<li>' + s + '</li>'; }).join('');
    sheet('<h3>' + (ios ? L.iosT : L.andT) + '</h3><ol>' + steps + '</ol><button type="button" class="hk-sheet-close">' + L.close + '</button>', ar ? 'rtl' : 'ltr');
  }

  function mount() {
    if (document.querySelector('.hk-take')) return;
    var ar = isAr(), L = ar ? T.ar : T.en;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = el('<section class="hk-take" aria-label="' + L.title + '" dir="' + (ar ? 'rtl' : 'ltr') + '"><div class="hk-take-card">' +
      '<h2>' + L.title + '</h2><p>' + L.sub + '</p><div class="hk-take-btns">' +
      (standalone() ? '' : '<button type="button" class="hk-tb-install">📲 ' + L.install + '</button>') +
      '<button type="button" class="hk-tb-share">💬 ' + L.share + '</button></div></div></section>');
    var root = document.getElementById('root');
    var foot = document.querySelector('footer');
    // Buttons work through one delegated listener, so copies made after app redraws keep working.
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      if (t.closest('.hk-tb-install')) { e.preventDefault(); openInstall(L, ar); }
      else if (t.closest('.hk-tb-share')) { e.preventDefault(); openShare(L, ar); }
    });
    if (foot && root && root.contains(foot)) {
      // App-rendered page: keep the box above the footer (above the marketing and plan-your-trip blocks).
      var keep = box.cloneNode(true), home = location.pathname;
      var place = function () {
        if (location.pathname !== home) return;
        var f = root.querySelector('footer'); if (!f) return;
        var cur = document.querySelector('.hk-take') || keep.cloneNode(true);
        var m = document.getElementById('hk-mkt'), r = document.getElementById('hk-road');
        var target = (m && m.parentNode === f.parentNode) ? m : ((r && r.parentNode === f.parentNode) ? r : f);
        if (cur.nextElementSibling !== target || cur.parentNode !== f.parentNode) f.parentNode.insertBefore(cur, target);
      };
      place();
      if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(root, { childList: true, subtree: true });
      [400, 1200, 3000].forEach(function (t) { setTimeout(place, t); });
    }
    else if (foot) foot.parentNode.insertBefore(box, foot);
    else document.body.appendChild(box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(mount, 300); });
  else setTimeout(mount, 300);
})();

/* HK-ROAD-MOVE: on app-rendered pages, show the static "Plan your trip" block above the
   footer instead of below it, and drop it if the visitor navigates inside the app. */
(function () {
  var road = document.getElementById('hk-road');
  var root = document.getElementById('root');
  if (!road || !root) return;
  var home = location.pathname, keep = road.cloneNode(true);
  function place() {
    var cur = document.getElementById('hk-road');
    if (location.pathname !== home) { if (cur && cur.parentNode) cur.parentNode.removeChild(cur); return; }
    var foot = root.querySelector('footer');
    if (!foot) return;
    if (!cur) { cur = keep.cloneNode(true); }
    if (cur.nextElementSibling !== foot) foot.parentNode.insertBefore(cur, foot);
  }
  if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(root, { childList: true, subtree: true });
  [200, 900, 2500].forEach(function (t) { setTimeout(place, t); });
  window.addEventListener('popstate', function () { setTimeout(place, 50); });
})();

/* HK-AR-LINKS: on Arabic pages, keep every internal link in Arabic (the app draws some links in English). */
(function(){
  var P=location.pathname; if(P.indexOf('/ar/')!==0&&P!=='/ar')return;
  var S={};["about","adventure","alexandria","aswan","blog","blog/about-hayakkom-who-we-are","blog/bariatric-surgery-egypt-saudi-patients","blog/cairo-day-trips-guide","blog/cosmetic-surgery-egypt-how-long-before-flying","blog/dental-implants-cost-egypt-saudi-patients","blog/dental-tourism-egypt","blog/hair-transplant-egypt-cost-guide","blog/hair-transplant-egypt-or-turkey","blog/how-long-stay-egypt-medical-treatment","blog/medical-tourism-egypt-gulf","blog/nile-cruise-planning-guide","blog/physiotherapy-sessions-egypt","blog/pre-travel-consultation","blog/questions-before-choosing-clinic-abroad","blog/saudi-insurance-treatment-egypt","business","cairo","calculator","careers","coastal","conferences","contact","cosmetic-surgery","cultural","dental","dentist-urgent","doctor-children","doctor-gp","educational","eyes-lasik","full-checkup","first-time-in-egypt","honeymoon-egypt","hair-transplant","heritage","holidays","hotel-doctor","how-to-choose","hurghada","luxor","medical","nile-cruise","north-coast","north-coast-villas","nile-cruise-events","nurse-visit","sharm-5-star-hotels","orthopedics","packages","partners","physiotherapy","privacy","religious","saudi-arabia","saudi-arabia/dammam","saudi-arabia/jeddah","saudi-arabia/riyadh","safaga","services","sharm","terms","tourists","travel-guide","video-consultation","vip-trip","weight-loss","wellness","who-we-are"].forEach(function(s){S[s]=1});
  function isEn(a){return a.hasAttribute('data-hk-en')||/(^|\s)(arlang|enlang)(\s|$)/.test(a.className||'')||(a.textContent||'').trim()==='English';}
  function map(h){
    if(!h||h.charAt(0)!=='/'||h.charAt(1)==='/')return null;
    var hs='',i=h.indexOf('#'); if(i>=0){hs=h.slice(i);h=h.slice(0,i);}
    var p=h.split('?')[0]; if(p==='/'||p.indexOf('/ar/')===0||p==='/ar'||p.indexOf('/assets/')===0)return null;
    var s=p.replace(/^\/+|\/+$/g,''); return S[s]?'/ar/'+s+'/'+hs:null;
  }
  function fix(){var a=document.querySelectorAll('a[href^="/"]');for(var i=0;i<a.length;i++){if(isEn(a[i]))continue;var n=map(a[i].getAttribute('href'));if(n)a[i].setAttribute('href',n);}}
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest?e.target.closest('a[href^="/"]'):null; if(!a||isEn(a)||a.target==='_blank')return;
    var h=a.getAttribute('href'),n=map(h)||(h.indexOf('/ar/')===0&&h.split('#')[0]!==P?h:null);
    if(n){e.preventDefault();e.stopPropagation();location.href=n;}
  },true);
  var t;function later(){clearTimeout(t);t=setTimeout(fix,60);}
  if(document.readyState!=='loading')fix();else document.addEventListener('DOMContentLoaded',fix);
  try{new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
})();

/* HK-FULL-NAV: open internal pages with a full page load so every page keeps its own content (FAQ, plan-your-trip block, titles). */
(function(){
  var P=location.pathname; if(P.indexOf('/ar/')===0||P==='/ar')return;
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest?e.target.closest('a[href^="/"]'):null; if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    var h=a.getAttribute('href'); if(h.charAt(1)==='/')return;
    var path=h.split('#')[0].split('?')[0]; var norm=function(x){return x.replace(/\/+$/,'')||'/';};
    if(norm(path)===norm(P)&&h.indexOf('?')<0)return;
    e.preventDefault();e.stopPropagation();location.href=h;
  },true);
})();

/* HK-CONVERSIONS: tell Google Ads/Analytics when a visitor contacts us.
   Events: whatsapp_click, phone_click, email_click, generate_lead (Jotform form submitted).
   To count them as Google Ads conversions, paste each conversion label below (from Google Ads > Goals > Conversions). */
(function(){
  var ADS='AW-16686203605';
  var LABELS={whatsapp:'G8FvCOiJtNgZENWFzZQ-',lead:'FU0DCM-orNgZENWFzZQ-',phone:'obQRCMP2ss4ZENWFzZQ-'}; // Google Ads conversion actions: Whatsapp Click, Home Form, Phone Call
  var last={};
  function fire(name,kind,extra){
    var now=Date.now(); if(last[name]&&now-last[name]<1500)return; last[name]=now;
    var p={page_path:location.pathname,page_lang:(location.pathname.indexOf('/ar')===0?'ar':'en')};
    for(var k in extra)p[k]=extra[k];
    try{
      window.dataLayer=window.dataLayer||[]; window.dataLayer.push({event:name,hk_page:p.page_path});
      if(typeof window.gtag==='function'){
        window.gtag('event',name,p);
        if(kind&&LABELS[kind])window.gtag('event','conversion',{send_to:ADS+'/'+LABELS[kind]});
      }
    }catch(e){}
  }
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null; if(!a)return;
    var h=(a.getAttribute('href')||'').toLowerCase();
    if(h.indexOf('wa.me/')>=0||h.indexOf('whatsapp.com/send')>=0||h.indexOf('whatsapp://')===0)fire('whatsapp_click','whatsapp',{link_url:h.split('?')[0]});
    else if(h.indexOf('tel:')===0)fire('phone_click','phone',{});
    else if(h.indexOf('mailto:')===0)fire('email_click','',{});
  },true);
  window.addEventListener('message',function(e){
    if(!e||!/jotform\.(com|eu)$/.test((e.origin||'').replace(/^https?:\/\//,'').split('/')[0].split('.').slice(-2).join('.')))return;
    var d=e.data,s=typeof d==='string'?d:(d&&(d.action||d.type||d.event))||'';
    if(String(s).indexOf('submission-completed')===0||s==='submit'||s==='form-submit')fire('generate_lead','lead',{form_source:'jotform'});
  });
})();

/* HK-MKT-MOVE: keep the static "marketing for doctors" block above the footer on app-rendered pages. */
(function(){
  var blk=document.getElementById('hk-mkt'),root=document.getElementById('root');
  if(!blk||!root)return;
  var home=location.pathname,keep=blk.cloneNode(true);
  function place(){
    var cur=document.getElementById('hk-mkt');
    if(location.pathname!==home){if(cur&&cur.parentNode)cur.parentNode.removeChild(cur);return;}
    var foot=root.querySelector('footer'); if(!foot)return;
    if(!cur)cur=keep.cloneNode(true);
    var road=document.getElementById('hk-road'),before=(road&&road.parentNode===foot.parentNode)?road:foot;
    if(cur.nextElementSibling!==before)foot.parentNode.insertBefore(cur,before);
  }
  if(window.MutationObserver)new MutationObserver(function(){place();}).observe(root,{childList:true,subtree:true});
  [200,900,2500].forEach(function(t){setTimeout(place,t);});
})();

/* HK-KEEP: static page sections marked data-hk-keep (FAQ, partner lists, ...) sit outside the app root so the
   app does not wipe them; show them, in page order, above the share box / marketing / plan-your-trip blocks. */
(function(){
  var root=document.getElementById('root'),list=document.querySelectorAll('section[data-hk-keep]');
  if(!root||!list.length)return;
  var home=location.pathname,keep=[].map.call(list,function(s){return s.cloneNode(true);});
  function place(){
    var cur=keep.map(function(k){return document.getElementById(k.id);});
    if(location.pathname!==home){cur.forEach(function(c){if(c&&c.parentNode)c.parentNode.removeChild(c);});return;}
    var foot=root.querySelector('footer'); if(!foot)return;
    var par=foot.parentNode,before=foot;
    ['hk-road','hk-mkt'].forEach(function(id){var b=document.getElementById(id);if(b&&b.parentNode===par)before=b;});
    var take=document.querySelector('.hk-take'); if(take&&take.parentNode===par)before=take;
    for(var i=cur.length-1;i>=0;i--){
      var c=cur[i]||keep[i].cloneNode(true);
      if(c.nextElementSibling!==before||c.parentNode!==par)par.insertBefore(c,before);
      before=c;
    }
  }
  if(window.MutationObserver)new MutationObserver(function(){place();}).observe(root,{childList:true,subtree:true});
  [200,900,2500].forEach(function(t){setTimeout(place,t);});
})();

/* HK-ZOOM-OK: a third-party widget injects a viewport tag that blocks pinch-zoom; undo it so visitors can always zoom (accessibility). */
(function(){
  function fix(){
    var m=document.querySelectorAll('meta[name="viewport"]');
    for(var i=0;i<m.length;i++){
      var c=m[i].getAttribute('content')||'';
      if(/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?(\s*[,;]|$)/i.test(c)){
        if(m.length>1&&i>0){m[i].parentNode.removeChild(m[i]);}
        else m[i].setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');
      }
    }
  }
  fix();
  try{new MutationObserver(fix).observe(document.head,{childList:true,subtree:true,attributes:true,attributeFilter:['content']});}catch(e){}
})();

/* Cairo radio button: loaded after the page has finished loading, so it never delays the site. */
(function(){function L(){var e=document.createElement("script");e.src="/assets/hk-radio.js?v=20261025b";e.async=true;document.head.appendChild(e)}
function Q(){if(window.requestIdleCallback){window.requestIdleCallback(L,{timeout:4000})}else{setTimeout(L,2000)}}
if(document.readyState==="complete"){setTimeout(Q,1200)}else{window.addEventListener("load",function(){setTimeout(Q,800)})}})();

/* Quick guide (homepage walkthrough, English and Arabic): loaded after the page has finished loading. */
(function(){var p=location.pathname.replace(/index\.html$/,"");if(p!=="/"&&p!=="/ar/")return;
function L(){var e=document.createElement("script");e.src="/assets/hk-tour.js?v=20261025b";e.async=true;document.head.appendChild(e)}
if(document.readyState==="complete"){setTimeout(L,500)}else{window.addEventListener("load",function(){setTimeout(L,500)})}})();

/* Install-or-skip app popup: starts as early as possible. */
(function(){var e=document.createElement("script");e.src="/assets/hk-install.js?v=20261025a";e.async=true;document.head.appendChild(e)})();

/* HK-QA-MOVE: keep the static "what people search for" block (.hk-qa) above the "Plan your trip" block on app-rendered pages. */
(function () {
  var qa = document.querySelector('.hk-qa');
  var root = document.getElementById('root');
  if (!qa || !root) return;
  var home = location.pathname, keep = qa.cloneNode(true);
  function place() {
    var cur = document.querySelector('.hk-qa');
    if (location.pathname !== home) { if (cur && cur.parentNode) cur.parentNode.removeChild(cur); return; }
    var foot = root.querySelector('footer');
    if (!foot) return;
    if (!cur) cur = keep.cloneNode(true);
    var road = document.getElementById('hk-road');
    var target = (road && road.parentNode === foot.parentNode) ? road : foot;
    var ok = cur.parentNode === foot.parentNode && (cur.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (!ok) foot.parentNode.insertBefore(cur, target);
  }
  if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(root, { childList: true, subtree: true });
  [300, 1100, 2800].forEach(function (t) { setTimeout(place, t); });
  window.addEventListener('popstate', function () { setTimeout(place, 50); });
})();

/* HK-SLASH: GitHub Pages answers /dental with a redirect to /dental/. Make every internal link point straight at the final URL. */
(function(){
  var D={};["/about", "/adventure", "/alexandria", "/ar", "/ar/about", "/ar/adventure", "/ar/alexandria", "/ar/aswan", "/ar/blog", "/ar/blog/about-hayakkom-who-we-are", "/ar/blog/bariatric-surgery-egypt-saudi-patients", "/ar/blog/cairo-day-trips-guide", "/ar/blog/cosmetic-surgery-egypt-how-long-before-flying", "/ar/blog/dental-implants-cost-egypt-saudi-patients", "/ar/blog/dental-tourism-egypt", "/ar/blog/doctor-in-egypt-for-gulf-visitors", "/ar/blog/egypt-family-holiday-guide-gulf", "/ar/blog/hair-transplant-egypt-cost-guide", "/ar/blog/hair-transplant-egypt-or-turkey", "/ar/blog/holiday-and-treatment-in-egypt", "/ar/blog/how-long-stay-egypt-medical-treatment", "/ar/blog/medical-tourism-egypt-gulf", "/ar/blog/nile-cruise-planning-guide", "/ar/blog/physiotherapy-sessions-egypt", "/ar/blog/pre-travel-consultation", "/ar/blog/questions-before-choosing-clinic-abroad", "/ar/blog/saudi-insurance-treatment-egypt", "/ar/business", "/ar/cairo", "/ar/calculator", "/ar/careers", "/ar/coastal", "/ar/conferences", "/ar/contact", "/ar/cosmetic-surgery", "/ar/cultural", "/ar/dental", "/ar/dentist-urgent", "/ar/doctor-children", "/ar/doctor-gp", "/ar/educational", "/ar/eyes-lasik", "/ar/first-time-in-egypt", "/ar/full-checkup", "/ar/hair-transplant", "/ar/heritage", "/ar/holidays", "/ar/honeymoon-egypt", "/ar/hotel-doctor", "/ar/how-to-choose", "/ar/hurghada", "/ar/luxor", "/ar/medical", "/ar/medical-marketing", "/ar/nile-cruise", "/ar/nile-cruise-events", "/ar/north-coast", "/ar/north-coast-villas", "/ar/nurse-visit", "/ar/orthopedics", "/ar/packages", "/ar/partners", "/ar/physiotherapy", "/ar/privacy", "/ar/religious", "/ar/safaga", "/ar/saudi-arabia", "/ar/saudi-arabia/dammam", "/ar/saudi-arabia/jeddah", "/ar/saudi-arabia/riyadh", "/ar/services", "/ar/sharm", "/ar/sharm-5-star-hotels", "/ar/terms", "/ar/tourists", "/ar/travel-guide", "/ar/video-consultation", "/ar/vip-trip", "/ar/weight-loss", "/ar/wellness", "/ar/who-we-are", "/aswan", "/blog", "/blog/about-hayakkom-who-we-are", "/blog/bariatric-surgery-egypt-saudi-patients", "/blog/cairo-day-trips-guide", "/blog/cosmetic-surgery-egypt-how-long-before-flying", "/blog/dental-implants-cost-egypt-saudi-patients", "/blog/dental-tourism-egypt", "/blog/doctor-in-egypt-for-gulf-visitors", "/blog/egypt-family-holiday-guide-gulf", "/blog/hair-transplant-egypt-cost-guide", "/blog/hair-transplant-egypt-or-turkey", "/blog/holiday-and-treatment-in-egypt", "/blog/how-long-stay-egypt-medical-treatment", "/blog/medical-tourism-egypt-gulf", "/blog/nile-cruise-planning-guide", "/blog/physiotherapy-sessions-egypt", "/blog/pre-travel-consultation", "/blog/questions-before-choosing-clinic-abroad", "/blog/saudi-insurance-treatment-egypt", "/business", "/cairo", "/calculator", "/careers", "/coastal", "/conferences", "/contact", "/cosmetic-surgery", "/cultural", "/dental", "/dentist-urgent", "/doctor-children", "/doctor-gp", "/educational", "/eyes-lasik", "/first-time-in-egypt", "/full-checkup", "/hair-transplant", "/heritage", "/holidays", "/honeymoon-egypt", "/hotel-doctor", "/how-to-choose", "/hurghada", "/luxor", "/medical", "/medical-marketing", "/nile-cruise", "/nile-cruise-events", "/north-coast", "/north-coast-villas", "/nurse-visit", "/orthopedics", "/packages", "/partners", "/physiotherapy", "/privacy", "/religious", "/safaga", "/saudi-arabia", "/saudi-arabia/dammam", "/saudi-arabia/jeddah", "/saudi-arabia/riyadh", "/services", "/sharm", "/sharm-5-star-hotels", "/terms", "/tourists", "/travel-guide", "/video-consultation", "/vip-trip", "/weight-loss", "/wellness", "/who-we-are"].forEach(function(p){D[p]=1;});
  function fix(){var a=document.querySelectorAll('a[href^="/"]');for(var i=0;i<a.length;i++){var h=a[i].getAttribute('href');if(!h||h.charAt(1)==='/')continue;var m=h.match(/^([^?#]*)([?#].*)?$/);var p=m[1];if(p&&p.slice(-1)!=='/'&&D[p])a[i].setAttribute('href',p+'/'+(m[2]||''));}}
  fix();
  if(window.MutationObserver){var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(fix,60);}).observe(document.documentElement,{childList:true,subtree:true});}
  [300,1200,3000].forEach(function(x){setTimeout(fix,x);});
})();
/* HK-HERO-CTA-TRACK: count which hero button people press (Google Analytics event, only if analytics is loaded) */
(function(){document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("[data-hk-cta]");if(!a)return;try{if(window.gtag)window.gtag("event","hero_cta",{cta:a.getAttribute("data-hk-cta")})}catch(x){}},true)})();
/* HK-PRICE-NOTE: one short note on pages that quote SAR prices (guide estimates; final price and payment currency in a written quote) */
(function(){
  var AR=/^\/ar(\/|$)/.test(location.pathname)||document.documentElement.lang==="ar";
  var TXT=AR?"الأسعار بالريال السعودي تقديرية للاسترشاد فقط. يُؤكَّد السعر النهائي وعملة الدفع في عرض مكتوب قبل الحجز.":"Prices in SAR are guide estimates only. The final price and the payment currency are confirmed in a written quote before you book.";
  function hasPrices(){var m=document.querySelector("main")||document.body;var t=m?m.innerText||"":"";return AR?/\d[\d,٬.]*\s*(ريال|SAR)|(?:ريال|SAR)\s*\d/.test(t):/\d[\d,]*\s*(SAR|riyal)|SAR\s*\d/i.test(t)}
  function put(){
    try{
      if(document.getElementById("hkPriceNote")||!hasPrices())return;
      var target=document.querySelector(".hk-qa")||document.getElementById("hk-road")||document.querySelector("section.hk-road")||document.querySelector("footer");
      if(!target||!target.parentNode)return;
      var p=document.createElement("p");p.id="hkPriceNote";p.dir=AR?"rtl":"ltr";
      p.style.cssText="box-sizing:border-box;max-width:min(1120px,92%);margin:16px auto;padding:10px 16px;font-size:13.5px;line-height:1.6;color:#2F4A52;background:rgba(255,255,255,.94);border:1px solid #D7E5E4;border-radius:12px;text-align:center;position:relative;z-index:2";
      p.textContent=TXT;target.parentNode.insertBefore(p,target);
    }catch(e){}
  }
  [900,2200,4500].forEach(function(t){setTimeout(put,t)});
  if(document.readyState==="complete")put();else window.addEventListener("load",function(){setTimeout(put,300)});
})();
/* HK-TOP-MOVE: keep the static "choose your treatment" / "packages at a glance" cards (data-hk-top) directly under the page hero on app-rendered pages. */
(function(){
  var blk=document.querySelector('[data-hk-top]'),root=document.getElementById('root'),tpl=document.getElementById('hkTopTpl');
  var keep=blk?blk.cloneNode(true):(tpl&&tpl.content&&tpl.content.firstElementChild?tpl.content.firstElementChild.cloneNode(true):null);
  if(!keep||!root)return;
  var home=location.pathname;
  function place(){
    var cur=document.querySelector('[data-hk-top]');
    if(location.pathname!==home){if(cur&&cur.parentNode)cur.parentNode.removeChild(cur);return}
    var hero=root.querySelector('.page-hero');if(!hero||!hero.parentNode)return;
    if(!cur)cur=keep.cloneNode(true);
    if(hero.nextElementSibling!==cur)hero.parentNode.insertBefore(cur,hero.nextSibling);
  }
  if(window.MutationObserver)new MutationObserver(function(){place()}).observe(root,{childList:true,subtree:true});
  [200,900,2500].forEach(function(t){setTimeout(place,t)});
  window.addEventListener("popstate",function(){setTimeout(place,50)});
})();

/* HK-TOP-JUMP: "Jump to details" cards on /packages/ scroll to the recovery-stay and transport cards further down the page. */
(function(){
  var RX={stay:/Recovery Accommodation|إقامة التعافي/,transport:/Sedan with Driver|سيدان مع سائق/};
  document.addEventListener("click",function(e){
    var a=e.target&&e.target.closest?e.target.closest("[data-hk-jump]"):null;if(!a)return;
    e.preventDefault();e.stopPropagation();
    var rx=RX[a.getAttribute("data-hk-jump")],list=document.querySelectorAll("main .pkg-name"),t=null,i;
    for(i=0;i<list.length;i++){if(rx.test(list[i].textContent)){t=list[i];break}}
    if(!t)return;
    var card=t.closest(".pkg-card")||t.parentElement.parentElement||t;
    var y=card.getBoundingClientRect().top+window.pageYOffset-90;
    try{window.scrollTo({top:y,behavior:"smooth"})}catch(x){window.scrollTo(0,y)}
  },true);
})();
/* HK-STAY-MOVE: keep the static "where you stay and how you get around" block (data-hk-bottom) just above the "what people search for" block on app-rendered treatment pages. */
(function(){
  var blk=document.querySelector('[data-hk-bottom]'),root=document.getElementById('root'),tpl=document.getElementById('hkStayTpl');
  var keep=blk?blk.cloneNode(true):(tpl&&tpl.content&&tpl.content.firstElementChild?tpl.content.firstElementChild.cloneNode(true):null);
  if(!keep||!root)return;
  var home=location.pathname;
  function place(){
    var cur=document.querySelector('[data-hk-bottom]');
    if(location.pathname!==home){if(cur&&cur.parentNode)cur.parentNode.removeChild(cur);return}
    var foot=root.querySelector('footer');if(!foot||!foot.parentNode)return;
    if(!cur)cur=keep.cloneNode(true);
    var qa=document.querySelector('.hk-qa'),road=document.getElementById('hk-road'),par=foot.parentNode;
    var target=(qa&&qa.parentNode===par)?qa:((road&&road.parentNode===par)?road:foot);
    var ok=cur.parentNode===par&&(cur.compareDocumentPosition(target)&Node.DOCUMENT_POSITION_FOLLOWING); /* only needs to come before the target, never fight other blocks for the exact slot */
    if(!ok)par.insertBefore(cur,target);
  }
  if(window.MutationObserver)new MutationObserver(function(){place()}).observe(root,{childList:true,subtree:true});
  [300,1100,2800].forEach(function(t){setTimeout(place,t)});
})();
/* HK-GO: /packages/?go=stay or ?go=transport scrolls to the recovery-stay or car-with-driver card once the page has drawn. */
(function(){
  var m=/[?&]go=(stay|transport)/.exec(location.search);if(!m||location.pathname.replace(/^\/ar/,"").indexOf("/packages")!==0)return;
  var RX=m[1]==="stay"?/Recovery Accommodation|إقامة التعافي/:/Sedan with Driver|سيدان مع سائق/,tries=0;
  function go(){
    var list=document.querySelectorAll("main .pkg-name"),i;
    for(i=0;i<list.length;i++){if(RX.test(list[i].textContent)){var c=list[i].closest(".pkg-card")||list[i].parentElement.parentElement;var y=c.getBoundingClientRect().top+window.pageYOffset-90;window.scrollTo(0,y);return}}
    if(++tries<12)setTimeout(go,400);
  }
  setTimeout(go,900);
})();
/* HK-WA-TEXT: WhatsApp links with no message open the chat pre-filled with the page the visitor was reading,
   so the coordinator knows what they want and enquiries arrive ready to answer. Links that already carry ?text= are left alone. */
(function(){
  var RX=/^https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send)\/?\+?(\d{8,15})?\/?(?:\?phone=\+?(\d{8,15}))?$/;
  function msg(){
    var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
    var home=/^\/(ar\/?)?$/.test(location.pathname);
    var t=(document.title||"").split(/\s[|–—]\s/)[0].trim().slice(0,90);
    if(ar)return home||!t?"مرحباً حياكم، أرغب في التخطيط لرحلة إلى مصر.":"مرحباً حياكم، أتصفح صفحة «"+t+"» على موقعكم وأرغب في الاستفسار.";
    return home||!t?"Hello Hayakkom, I would like to plan a trip to Egypt.":"Hello Hayakkom, I am reading “"+t+"” on your website and would like to ask about it.";
  }
  function fix(e){
    var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;
    var m=RX.exec(a.getAttribute("href")||"");if(!m)return;
    var n=m[1]||m[2];if(!n)return;
    a.setAttribute("href","https://wa.me/"+n+"?text="+encodeURIComponent(msg()));
  }
  document.addEventListener("pointerdown",fix,true);
  document.addEventListener("click",fix,true);
  document.addEventListener("keydown",function(e){if(e.key==="Enter")fix(e)},true);
})();
/* HK-POLISH: cards fade up as they scroll into view, hover lift on cards that had none, a reading bar on blog
   articles, and a slim WhatsApp / Send-my-case bar on phones once the visitor scrolls past the first screen.
   Only elements below the fold at load are animated, so the first screen and LCP are untouched; anything never
   tagged simply stays visible. Floating buttons (WhatsApp, radio, assistant) move up while the bar shows. */
(function(){
  if(window.__hkPolish)return;window.__hkPolish=1;
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css=""+
  ".hk-rv{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}"+
  ".hk-rv.hk-in{opacity:1;transform:none}"+
  "@media (hover:hover){.why-card,.jrn-card,.route-card,.hk-card,.contact-card,.svc-sm,.hours-card,.hk-road a{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}"+
  ".why-card:hover,.jrn-card:hover,.route-card:hover,.hk-card:hover,.contact-card:hover,.svc-sm:hover,.hours-card:hover,.hk-road a:hover{transform:translateY(-3px);border-color:#D4A843;box-shadow:0 12px 32px rgba(14,124,134,.12)}}"+
  "html{scroll-behavior:smooth}"+
  ":focus-visible{outline:2px solid #D4A843;outline-offset:2px}"+
  ".hk-prog{position:fixed;top:0;left:0;right:0;height:3px;z-index:1001;pointer-events:none;background:linear-gradient(90deg,#B8922A,#F0C96A);transform-origin:0 50%;transform:scaleX(0)}"+
  "[dir=rtl] .hk-prog,html[lang=ar] .hk-prog{transform-origin:100% 50%}"+
  ".hk-bar{position:fixed;left:0;right:0;bottom:0;z-index:996;display:flex;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(10,46,54,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:1px solid rgba(212,168,67,.35);transform:translateY(110%);transition:transform .3s ease}"+
  ".hk-bar.on{transform:none}"+
  ".hk-bar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border-radius:999px;font:600 15px/1 Inter,'Noto Sans Arabic',system-ui,sans-serif;text-decoration:none!important}"+
  ".hk-bar .w{background:#25D366;color:#fff!important}.hk-bar .c{background:linear-gradient(135deg,#D4A843,#F0C96A);color:#0A2E36!important}"+
  ".hk-bar svg{width:20px;height:20px;fill:currentColor}"+
  ".hk-up{translate:0 -66px;transition:translate .3s ease}"+
  "body.hk-bar-on .fab-wa,body.hk-bar-on .fab-stack a[href*='wa.me']{opacity:0;visibility:hidden;pointer-events:none}"+
  "@media (min-width:769px){.hk-bar{display:none}}"+
  "@media print{.hk-bar,.hk-prog{display:none}}";
  if(still)css=css.replace(/\.hk-rv\{[^}]*\}/,"").replace("html{scroll-behavior:smooth}","");
  var st=document.createElement("style");st.id="hk-polish";st.textContent=css;(document.head||document.documentElement).appendChild(st);

  /* Fade-up on scroll */
  var SEL=".pkg-card,.svc-card,.svc-sm,.why-card,.jrn-card,.route-card,.city-card,.tourist-svc-card,.contact-card,.hk-card,.hk-spot-card,.hk-road a,.blog-card,.hours-card,.sec-title,.sec-eyebrow";
  var io=!still&&"IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("hk-in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -40px 0px"}):null;
  function tag(){
    if(!io)return;var vh=innerHeight,list=document.querySelectorAll(SEL),i,el,r,k;
    for(i=0;i<list.length;i++){el=list[i];if(el.__hkRv)continue;el.__hkRv=1;
      if(el.closest("#hkCc,.hk-bar,nav,header,footer,template"))continue;
      r=el.getBoundingClientRect();if(r.top<vh||r.height===0)continue;
      k=Array.prototype.indexOf.call(el.parentNode.children,el);el.style.transitionDelay=Math.min(k%4*80,240)+"ms";
      el.classList.add("hk-rv");io.observe(el)}
  }
  var tq;function soon(){clearTimeout(tq);tq=setTimeout(tag,120)}
  function boot(){tag();var root=document.getElementById("root")||document.body;if(window.MutationObserver)new MutationObserver(soon).observe(root,{childList:true,subtree:true})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();

  /* Reading bar on blog articles */
  var prog=null;
  if(/^\/(ar\/)?blog\/[^\/]+\/?$/.test(location.pathname)){prog=document.createElement("div");prog.className="hk-prog";prog.setAttribute("aria-hidden","true");document.documentElement.appendChild(prog)}

  /* Mobile contact bar */
  var onContact=/^\/(ar\/)?contact\/?$/.test(location.pathname);
  var WA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';
  var bar=document.createElement("div");bar.className="hk-bar";bar.setAttribute("role","region");bar.setAttribute("aria-label",ar?"تواصل سريع":"Quick contact");
  bar.innerHTML='<a class="w" href="https://wa.me/201031567949">'+WA+(ar?"واتساب":"WhatsApp")+'</a>'+(onContact?"":'<a class="c" href="'+(ar?"/ar/contact/":"/contact/")+'">'+(ar?"أرسل حالتك":"Send my case")+'</a>');
  var shown=false,moved=[];
  function blocked(){
    var b=document.body;if(!b)return true;var cc=document.getElementById("hkCc");
    if(cc&&!cc.hidden&&cc.getClientRects().length&&getComputedStyle(cc).visibility!=="hidden")return true;
    if(/(^|\s)(menu-open|hk-ai-open|form-active)(\s|$)/.test(b.className))return true;
    var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  function lift(on){
    var i,radio=document.querySelector(".hkr"),ai=document.getElementById("hkAi")||document.querySelector(".fab-ai-own,.fab-ai");
    for(i=0;i<moved.length;i++)moved[i].classList.remove("hk-up");moved=[];
    if(radio)radio.style.translate="";
    if(!on)return;
    var all=document.body.querySelectorAll("body > *, .fab-stack"),vh=innerHeight,el,cs,r;
    for(i=0;i<all.length;i++){el=all[i];if(el===bar||el.id==="hkCc"||el===prog||el===radio)continue;cs=getComputedStyle(el);
      if(cs.position!=="fixed")continue;r=el.getBoundingClientRect();if(r.height&&r.bottom>vh-150&&r.top>vh*.4){el.classList.add("hk-up");moved.push(el)}}
    /* The radio sits level with the AI agent while the bar shows (the floating WhatsApp under it is hidden then). */
    if(radio&&ai){var ra=radio.getBoundingClientRect(),aa=ai.getBoundingClientRect();
      if(ra.height&&aa.height){var aiUp=ai.classList.contains("hk-up")||(ai.parentNode&&ai.parentNode.classList&&ai.parentNode.classList.contains("hk-up"))?66:0;
        radio.style.transition="translate .3s ease";radio.style.translate="0 "+Math.round((aa.top+aa.height/2-aiUp)-(ra.top+ra.height/2))+"px"}}
  }
  var ticking=false;
  function frame(){ticking=false;
    var y=pageYOffset,h=document.documentElement.scrollHeight-innerHeight;
    if(prog)prog.style.transform="scaleX("+(h>0?Math.min(1,y/h):0)+")";
    if(!bar.parentNode){if(!document.body)return;document.body.appendChild(bar)} /* the React pages' body clean-up can remove it */
    var want=innerWidth<=768&&y>innerHeight*.6&&!blocked();
    if(want!==shown){shown=want;bar.classList.toggle("on",want);document.body.classList.toggle("hk-bar-on",want);lift(want)}
  }
  /* Keep the radio level with the agent if either moves while the bar is up (the radio re-places itself every 800ms). */
  setInterval(function(){
    if(!shown)return;var radio=document.querySelector(".hkr"),ai=document.getElementById("hkAi")||document.querySelector(".fab-ai-own,.fab-ai");if(!radio||!ai)return;
    var ra=radio.getBoundingClientRect(),aa=ai.getBoundingClientRect();if(!ra.height||!aa.height)return;
    var cur=parseFloat((radio.style.translate||"0 0").split(" ")[1])||0,want=Math.round(cur+(aa.top+aa.height/2)-(ra.top+ra.height/2));
    if(Math.abs(want-cur)>1)radio.style.translate="0 "+want+"px";
  },900);
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  function mount(){if(document.body&&!bar.parentNode)document.body.appendChild(bar);frame()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll);
  document.addEventListener("focusin",onScroll);document.addEventListener("focusout",function(){setTimeout(onScroll,50)});
  if(window.MutationObserver)new MutationObserver(onScroll).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:["class","hidden"]});
})();
/* HK-LEGAL: legal notice on every page and a short note on every package / service card.
   Accommodation, hotels, villa and chalet rentals, trips and transport are provided by registered Egyptian tourism
   companies; medical treatment and operations are performed by registered medical institutions. The footer notice is
   also in each page's HTML; this re-adds it where the React pages redraw their footer, and stamps cards (re-stamped
   after React re-renders). */
(function(){
  if(window.__hkLegal)return;window.__hkLegal=1;
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var FOOT=ar
    ?"تنبيه: الإقامة وحجوزات الفنادق وتأجير الفلل والشاليهات والرحلات والجولات وجميع وسائل النقل تقدّمها شركات سياحة مصرية مسجّلة. وجميع العلاجات والعمليات الطبية تُجرى في مؤسسات طبية مسجّلة ومرخّصة. ينطبق ذلك على كل الباقات والعروض في هذا الموقع، وتقتصر مهمة حياكم على تنسيق هذه الخدمات دون تقديمها بنفسها."
    :"Important: accommodation, hotel bookings, villa and chalet rentals, trips, tours and all transport are provided by registered Egyptian tourism companies. All medical treatment and operations are performed by registered, licensed medical institutions. This applies to every package and offer on this site; Hayakkom coordinates these services and does not provide them itself.";
  var NOTE=ar
    ?{t:"ⓘ عبر شركات سياحة مسجّلة",m:"ⓘ العلاج لدى مؤسسات طبية مرخّصة",b:"ⓘ عيادات مرخّصة وشركات سياحة مسجّلة"}
    :{t:"ⓘ Via registered tourism companies",m:"ⓘ Treatment at licensed medical institutions",b:"ⓘ Licensed clinics & registered tourism companies"};
  var st=document.createElement("style");
  st.textContent=".hk-legal-foot{max-width:900px;margin:12px auto 0;padding:0 5%;font-size:12px;line-height:1.7;opacity:.85;text-align:center}"+
    ".hk-card-note{display:block;margin-top:8px;font-size:11px;line-height:1.5;font-style:normal;font-weight:400;opacity:.8;letter-spacing:0;text-transform:none}"+
    ".hk-spot-card .hk-card-note{font-size:11px!important;line-height:1.35!important;margin-top:4px!important;font-weight:400!important}"+
    ".featured-wrap .hk-card-note,.tourist-svc-card.urgent .hk-card-note{opacity:1}.featured-wrap .hk-card-note{color:rgba(255,255,255,.78)!important}";
  (document.head||document.documentElement).appendChild(st);
  var MED=/wellness|rehab|recovery|تعافي|التعافي|تعافٍ|تأهيل|استجمام|dental|teeth|implant|veneer|smile|hair|weight|bariatric|cosmetic|surgery|surgeon|medical|treatment|treat|clinic|hospital|doctor|nurse|dentist|orthop|lasik|eye|check-?up|physio|consult|علاج|طب|أسنان|اسنان|جراح|زراعة|تجميل|سمنة|تكميم|عيادة|مستشفى|طبيب|ممرض|فحص|ليزك|عظام|استشارة/i;
  var TOUR=/wellness|recovery|tourism|travel|investment|business|study|student|سياحة|السياحة|سفر|استثمار|أعمال|الأعمال|الدراسة|طلاب|التعليمية|تعافي|التعافي|تعافٍ|استجمام|holiday|villa|chalet|hotel|stay|resort|cruise|nile|sharm|hurghada|gouna|safaga|cairo|luxor|aswan|alexandria|coast|sahel|siwa|trip|tour|transfer|transport|driver|car\b|vip|heritage|cultural|adventure|religious|honeymoon|package|nights?\b|إقامة|اقامة|فندق|فنادق|فلل|فيلا|شاليه|منتجع|رحلة|رحلات|نيل|نيلية|شرم|غردقة|جونة|سفاجا|ساحل|سيوة|سيارة|سائق|تنقل|عطلة|عطلات|باقة|باقات|ليال/i;
  var SKIP=/\/(ar\/)?(contact|partners|careers|blog|about|how-to-choose|who-we-are|calculator|conferences|medical-marketing|privacy|terms)\//;
  var CARDS=[
    [".pkg-card",".pkg-body",".pkg-btn,a[href*='wa.me'],a.btn-gold,a.btn-outline"],
    [".hk-spot-card",".hk-spot-txt","em"],
    [".svc-card",".svc-card-body",".svc-link"],
    [".svc-sm",".svc-sm-body",null],
    [".tourist-svc-card",null,"a"],
    [".hk-card",null,"em"],
    [".featured-wrap","div",null]
  ];
  function kind(el){
    var a=el.matches("a[href]")?el:el.querySelector("a[href]"),href=a?a.getAttribute("href")||"":"";
    if(SKIP.test(href))return "";
    var t=(el.textContent||"")+" "+href,m=MED.test(t),o=TOUR.test(t);
    return m&&o?"b":m?"m":o?"t":"";
  }
  function stamp(){
    var i,j,list,card,host,before,k,n;
    for(i=0;i<CARDS.length;i++){
      list=document.querySelectorAll(CARDS[i][0]);
      for(j=0;j<list.length;j++){
        card=list[j];if(card.querySelector(".hk-card-note")||card.closest("template"))continue;
        k=kind(card);if(!k)continue;
        host=CARDS[i][1]?card.querySelector(CARDS[i][1]):card;if(!host)continue;
        n=document.createElement("small");n.className="hk-card-note";n.textContent=NOTE[k];
        before=CARDS[i][2]?host.querySelector(CARDS[i][2]):null;
        if(CARDS[i][0]===".featured-wrap"){before=host.querySelector(".featured-sub");if(before){before.insertAdjacentElement("afterend",n);continue}}
        if(before&&before.parentNode===host)host.insertBefore(n,before);else host.appendChild(n);
      }
    }
  }
  var FEE=ar?"تحصل حياكم على رسوم تسويق تدفعها لها شركتها الشريكة السعودية المرخّصة فقط. تستلم عرض سعر مكتوباً ومفصّلاً قبل الدفع، وتدفع العائلات المقيمة في السعودية داخل المملكة بالريال عبر الشركة الشريكة السعودية المرخّصة لحياكم، ويصدر مقدّمو الخدمة فواتير خدماتهم.":"Hayakkom earns marketing fees, paid only by its licensed Saudi partner company. You receive an itemised written estimate before you pay. Families in Saudi Arabia pay in Saudi Arabia, in riyals, through Hayakkom’s licensed Saudi partner company; providers issue the invoices for their services.";
  function foot(){
    var f0=document.querySelector("footer");
    if(f0&&!document.querySelector(".hk-fee-foot")){var e=document.createElement("p");e.className="hk-fee hk-fee-foot";e.textContent=FEE;e.style.cssText="max-width:900px;margin:14px auto 0;padding:0 5%;font-size:12px;line-height:1.7;opacity:.8;text-align:center";f0.appendChild(e)}
    if(document.querySelector(".hk-legal-foot"))return;
    var f=document.querySelector("footer");if(!f)return;
    var p=document.createElement("p");p.className="hk-legal-foot";p.textContent=FOOT;f.appendChild(p);
  }
  function run(){stamp();foot()}
  var q;function soon(){clearTimeout(q);q=setTimeout(run,200)}
  function boot(){run();if(window.MutationObserver)new MutationObserver(soon).observe(document.body,{childList:true,subtree:true});[600,1500,3000].forEach(function(t){setTimeout(run,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* HK-FAB-DODGE: the floating assistant, WhatsApp and radio buttons step aside for forms. When a form reaches the
   bottom of the screen where they sit, each tucks into its own screen edge with a springy bounce, leaving a
   small tappable peek; while a field is being filled in they slide fully away; once the form has scrolled
   past they bounce back. IntersectionObserver plus transform-only motion: no scroll handler, no layout work. */
(function(){
  if(window.__hkDodge||!("IntersectionObserver" in window))return;window.__hkDodge=1;
  var FAB=".fab-ai-own,.fab-wa,.hkr",FORMS='.jf-wrap,iframe[src*="jotform"],iframe[src*="jotfor.ms"],form,.enquiry-box,#hk-mini-calc .hk-mc';
  var X=".hk-fab-d.hk-fab-d",R='[data-hk-side="r"]',L='[data-hk-side="l"]';
  var st=document.createElement("style");
  st.textContent="html body "+X+"{transition:transform .6s cubic-bezier(.34,1.56,.64,1),opacity .3s ease!important}"+
    "html body.hk-dock "+X+R+"{transform:translateX(calc(100% - 16px)) scale(.84)!important}"+
    "html body.hk-dock "+X+L+"{transform:translateX(calc(-100% + 16px)) scale(.84)!important}"+
    "html body.hk-dock "+X+":hover,html body.hk-dock "+X+":focus-visible{transform:none!important}"+
    "html body.hk-type "+X+R+"{transform:translateX(calc(100% + 40px))!important;opacity:0;pointer-events:none}"+
    "html body.hk-type "+X+L+"{transform:translateX(calc(-100% - 40px))!important;opacity:0;pointer-events:none}"+
    "html body.hk-dock .hkr .hkr-pill,html body.hk-dock .hkr .hkr-tip,html body.hk-type .hkr .hkr-pill,html body.hk-type .hkr .hkr-tip{opacity:0!important;visibility:hidden!important;transition:opacity .2s}"+"html body.hk-dock .to-top,html body.hk-type .to-top{opacity:0!important;pointer-events:none!important;transition:opacity .3s}"+"@media (prefers-reduced-motion:reduce){html body "+X+"{transition:opacity .2s ease!important}}";
  document.head.appendChild(st);
  var b=document.body,fabs=[],inBand=new Set(),seen=new WeakSet(),io;
  function cls(c,on){if(b)b.classList.toggle(c,on)}
  function sync(){var on=inBand.size>0&&!b.classList.contains("hk-ai-open");if(on&&!b.classList.contains("hk-dock"))fabs.forEach(side);cls("hk-dock",on)}
  function side(el){var r=el.getBoundingClientRect();if(r.width)el.setAttribute("data-hk-side",r.left+r.width/2>innerWidth/2?"r":"l")}
  function scan(){
    b=document.body;if(!b)return;
    var f=document.querySelectorAll(FAB),i;
    for(i=0;i<f.length;i++)if(!f[i].classList.contains("hk-fab-d")){f[i].classList.add("hk-fab-d");side(f[i]);fabs.push(f[i])}
    if(!io)io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)inBand.add(e.target);else inBand.delete(e.target)});sync()},{rootMargin:"-78% 0px 0px 0px"});
    var fm=document.querySelectorAll(FORMS);
    for(i=0;i<fm.length;i++){var el=fm[i];if(seen.has(el)||el.closest("#hkAiPanel,.ai-own,nav,header,.hk-bar"))continue;seen.add(el);io.observe(el)}
  }
  /* Typing: a field on the page, or focus moving into a form iframe (the window blurs). */
  function field(a){return a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||(a.tagName==="IFRAME"&&a.id!=="hkAiFrame"))&&!a.closest("#hkAiPanel,.ai-own")}
  var tt;function typing(){clearTimeout(tt);tt=setTimeout(function(){cls("hk-type",field(document.activeElement))},60)}
  document.addEventListener("focusin",typing);document.addEventListener("focusout",typing);
  addEventListener("blur",typing);addEventListener("focus",typing);
  addEventListener("resize",function(){if(b&&!b.classList.contains("hk-dock"))fabs.forEach(side)});
  var sq;function soon(){clearTimeout(sq);sq=setTimeout(scan,400)}
  function boot(){scan();if(window.MutationObserver)new MutationObserver(soon).observe(document.body,{childList:true,subtree:true});[1500,4000].forEach(function(t){setTimeout(scan,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* HK-SVC-TABS: the grouped service grid becomes category tabs, one group of 3-6 services at a time
   (Hick's law / progressive disclosure), while the tab labels still show the full range of what Hayakkom
   coordinates. Phones get a compact two-column grid. Without JavaScript every card stays visible under its
   group heading. */
(function(){
  if(window.__hkTabs)return;window.__hkTabs=1;
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var st=document.createElement("style");
  st.textContent=".hk-svc-tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 auto 22px;max-width:780px;contain:layout paint;padding:8px 6px;isolation:isolate}"+
    ".hk-svc-ask{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 auto 12px;color:#0B6B73;font-size:14.5px;font-weight:700;letter-spacing:.01em;text-align:center}"+
    ".hk-svc-ask svg{width:18px;height:18px;flex:none;animation:hkAskNudge 2s ease-in-out infinite}"+
    "@keyframes hkAskNudge{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(3px)}}"+
    "html body .hk-svc-tabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px!important;max-width:980px;padding:10px 8px 14px}"+
    ".hk-svc-tabs.hk-call .hk-svc-tab{will-change:transform}"+
    ".hk-svc-tab{position:relative;font:inherit;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:11px;text-align:start;padding:11px 14px;border-radius:16px;border:1.5px solid #E4CF8E;background:linear-gradient(180deg,#fff 0%,#FBF7EC 100%);color:#0A2E36;cursor:pointer;box-shadow:0 2px 10px rgba(10,46,54,.06);transition:background .2s,color .2s,border-color .2s,transform .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent}"+
    ".hk-svc-tx{display:flex;flex-direction:column;align-items:flex-start;gap:2px;flex:1;min-width:0}"+
    ".hk-svc-ico{flex:none;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(201,162,58,.14);color:#9A7A22;transition:background .2s,color .2s}"+
    ".hk-svc-ico svg{width:22px;height:22px}"+
    ".hk-svc-t{display:block;font-size:14.5px;font-weight:700;line-height:1.25}"+
    ".hk-svc-s{display:block;font-size:11.5px;font-weight:500;line-height:1.4;color:#4b656c;transition:color .2s}"+
    ".hk-svc-n{display:inline-block;margin-top:3px;padding:2px 9px;border-radius:999px;background:#0A2E36;color:#fff;font-size:11.5px;font-weight:700;line-height:1.35;transition:background .2s,color .2s}"+
    ".hk-svc-ok{position:absolute;top:-7px;inset-inline-end:-7px;width:22px;height:22px;border-radius:50%;background:#E8C877;color:#0A2E36;box-shadow:0 0 0 2px #fff;display:none;align-items:center;justify-content:center;z-index:1}"+
    ".hk-svc-ok svg{width:13px;height:13px}"+
    ".hk-svc-tab[aria-selected=true]{background:linear-gradient(180deg,#0E3B45 0%,#0A2E36 100%);border-color:#0A2E36;color:#fff}"+
    ".hk-svc-tab[aria-selected=true] .hk-svc-ico{background:rgba(232,200,119,.16);color:#E8C877}"+
    ".hk-svc-tab[aria-selected=true] .hk-svc-s{color:#C9DAD8}"+
    ".hk-svc-tab[aria-selected=true] .hk-svc-n{background:#E8C877;color:#0A2E36}"+
    ".hk-svc-tab[aria-selected=true] .hk-svc-ok{display:flex}"+
    ".hk-svc-tab[aria-selected=true]::after{content:'';position:absolute;left:50%;bottom:-7px;width:13px;height:13px;background:#0A2E36;transform:translateX(-50%) rotate(45deg);border-radius:0 0 4px 0}"+
    ".hk-svc-tab:focus-visible{outline:2px solid #C9A23A;outline-offset:3px}"+
    ".grid-sm.hk-tabbed>.svc-group,.grid-sm.hk-tabbed>.hk-off{display:none!important}"+
    ".grid-sm.hk-tabbed>.svc-sm{animation:hkTabIn .35s ease both}"+
    "@keyframes hkTabIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"+
    ".hk-svc-help{margin:36px auto 0!important;padding-top:4px;max-width:620px;text-align:center;font-size:14.5px;line-height:1.6;color:#3d4b4f}"+
    "html body section .grid-sm+p.hk-svc-help.hk-svc-help{margin-top:36px!important}"+".hk-svc-help a{color:#0B6B73;font-weight:600;white-space:nowrap}"+
    "@media(max-width:600px){html body .grid-sm{grid-template-columns:1fr 1fr!important;gap:10px!important}"+
      "html body .grid-sm .svc-sm .img-wrap{aspect-ratio:4/3}html body .grid-sm .svc-sm-body{padding:9px 10px 10px!important}"+
      "html body .grid-sm .svc-sm-body h3{font-size:13.5px!important;line-height:1.3}"+
      "html body .grid-sm .svc-sm .hk-card-note{font-size:10.5px!important;line-height:1.3!important}"+
      "html body .hk-svc-tabs{grid-template-columns:1fr 1fr;gap:10px!important}"+
      "html body .hk-svc-tabs{gap:8px!important;padding:10px 6px 10px}"+
      ".hk-svc-tab{flex-direction:row;align-items:center;text-align:start;gap:9px;padding:9px 10px;min-height:58px;border-radius:14px;width:100%}"+
      ".hk-svc-tx{align-items:flex-start;gap:1px}"+
      ".hk-svc-ico{width:32px;height:32px}.hk-svc-ico svg{width:19px;height:19px}"+
      ".hk-svc-t{font-size:13.5px;line-height:1.2}.hk-svc-s{display:none}"+
      ".hk-svc-n{margin:0;padding:0;background:none;color:#0B6B73;font-size:11.5px;font-weight:700}"+
      ".hk-svc-tab[aria-selected=true] .hk-svc-n{background:none;color:#E8C877}"+
      ".hk-svc-ok{top:-6px;inset-inline-end:-6px;width:19px;height:19px}.hk-svc-ok svg{width:11px;height:11px}}"+
    /* every 2 s the categories not yet open give a small bounce and gold glow, until the first tap */
    ".hk-svc-tabs.hk-call .hk-svc-tab:not([aria-selected=true]){animation:hkChip 2s ease-in-out infinite}"+
    ".hk-svc-tabs.hk-call .hk-svc-tab:nth-child(2){animation-delay:.15s}.hk-svc-tabs.hk-call .hk-svc-tab:nth-child(3){animation-delay:.3s}.hk-svc-tabs.hk-call .hk-svc-tab:nth-child(4){animation-delay:.45s}"+
    "@keyframes hkChip{0%,45%,100%{transform:translateY(0);box-shadow:0 0 0 0 rgba(201,162,58,0)}"+
      "9%{transform:translateY(-6px);box-shadow:0 0 0 0 rgba(201,162,58,.6),0 0 18px rgba(201,162,58,.55)}18%{transform:translateY(0)}25%{transform:translateY(-2px)}"+
      "32%{transform:translateY(0)}40%{box-shadow:0 0 0 10px rgba(201,162,58,0),0 0 0 rgba(201,162,58,0)}}"+
    ".hk-svc-tab[aria-selected=true]{box-shadow:0 0 0 3px rgba(201,162,58,.35),0 10px 24px rgba(10,46,54,.25)}"+
    ".hk-svc-tab:not([aria-selected=true]):hover{border-color:#C9A23A;transform:translateY(-2px);box-shadow:0 0 0 3px rgba(201,162,58,.18),0 10px 22px rgba(10,46,54,.12)}"+
    ".hk-svc-tab:active{transform:scale(.97)}"+
    "@media (prefers-reduced-motion:reduce){.grid-sm.hk-tabbed>.svc-sm,.hk-svc-tabs.hk-call .hk-svc-tab,.hk-svc-ask svg{animation:none!important}}";
  document.head.appendChild(st);
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  /* each category tile: an icon, its name, a short line of what is inside, and the count written out */
  var SV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var KIND=[
    {re:/treat|علاج/i,ico:'<path d="M12 5.6c-1.6-1.3-3.4-2-5-1.4C4.6 5 4 7.6 4.6 10c.4 1.7 1 3.1 1.4 4.8.4 1.8.7 5.2 2.3 5.2 1.5 0 1.4-3.6 2.4-5 .4-.6 1.2-.6 1.6 0 1 1.4.9 5 2.4 5 1.6 0 1.9-3.4 2.3-5.2.4-1.7 1-3.1 1.4-4.8.6-2.4 0-5-2.4-5.9-1.6-.6-3.4.1-5 1.4z"/>',
      en:"Dental, hair, cosmetic, weight loss and LASIK",ar:"الأسنان والشعر والتجميل والسمنة والليزك"},
    {re:/check|فحص/i,ico:'<path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.9 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.1 0 5.2 3.1 4 6.3-2 4.8-9 9.2-9 9.2z"/><path d="M6 12h3l1.5-2.5 2.5 5 1.5-2.5H18"/>',
      en:"Full check-up, physiotherapy and rehab",ar:"الفحص الشامل والعلاج الطبيعي والتعافي"},
    {re:/holiday|trip|عطل|رحل/i,ico:'<circle cx="12" cy="9" r="3.2"/><path d="M12 2.8v1.4M5.6 9H4.2M19.8 9h-1.4M7.5 4.5l1 1M16.5 4.5l-1 1"/><path d="M3 16.5c2 0 2-1.4 4.5-1.4s2.5 1.4 4.5 1.4 2-1.4 4.5-1.4 2.5 1.4 4.5 1.4M3 20c2 0 2-1.4 4.5-1.4S10 20 12 20s2-1.4 4.5-1.4S19 20 21 20"/>',
      en:"Red Sea, Nile cruises, culture and VIP trips",ar:"البحر الأحمر والرحلات النيلية والثقافة ورحلات VIP"},
    {re:/business|study|أعمال|تعليم/i,ico:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18M11 12.5v1.5h2v-1.5"/>',
      en:"Investment, study and medical marketing",ar:"الاستثمار والدراسة والتسويق الطبي"}
  ];
  var TICK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function count(n){return ar?(n===1?"خدمة واحدة":n===2?"خدمتان":n<=10?n+" خدمات":n+" خدمة"):(n===1?"1 service":n+" services")}
  function kindOf(label,i){for(var k=0;k<KIND.length;k++)if(KIND[k].re.test(label))return KIND[k];return KIND[i]||null}
  function build(grid){
    if(grid.__hkT)return;
    var groups=[],g=-1;
    [].slice.call(grid.children).forEach(function(k){
      if(k.classList.contains("svc-group")){groups.push({label:k.textContent.trim(),cards:[]});g++}
      else if(g>=0&&k.classList.contains("svc-sm"))groups[g].cards.push(k);
    });
    if(groups.length<2)return;grid.__hkT=1;
    var prev=grid.previousElementSibling;if(prev&&prev.classList.contains("hk-svc-tabs")){var pp=prev.previousElementSibling;prev.remove();if(pp&&pp.classList.contains("hk-svc-ask"))pp.remove()}
    var bar=document.createElement("div");bar.className="hk-svc-tabs";bar.setAttribute("role","tablist");
    bar.setAttribute("aria-label",ar?"فئات الخدمات":"Service categories");
    function show(i,focus){
      groups.forEach(function(G,j){var on=i===j;G.b.setAttribute("aria-selected",on?"true":"false");G.b.tabIndex=on?0:-1;
        G.cards.forEach(function(c){c.classList.toggle("hk-off",!on)})});
      if(focus)groups[i].b.focus();
      try{sessionStorage.setItem("hkSvcTab",String(i))}catch(e){}
    }
    /* after a tap, make sure the services that just appeared are on screen, so the tap visibly does something */
    function reveal(i){var c=groups[i].cards[0];if(!c)return;setTimeout(function(){var r=c.getBoundingClientRect(),vh=innerHeight;
      if(r.top>vh-150){var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
        try{window.scrollBy({top:r.top-vh*.42,behavior:rm?"auto":"smooth"})}catch(e){window.scrollBy(0,r.top-vh*.42)}}},60)}
    groups.forEach(function(G,i){
      var b=document.createElement("button");b.type="button";b.className="hk-svc-tab";b.setAttribute("role","tab");
      var K=kindOf(G.label,i),sub=K?(ar?K.ar:K.en):G.cards.slice(0,3).map(function(c){var h=c.querySelector("h3");return h?h.textContent.trim():""}).join(ar?"، ":", ");
      b.innerHTML='<span class="hk-svc-ok">'+TICK+'</span>'+(K?'<span class="hk-svc-ico">'+SV+K.ico+'</svg></span>':'')+
        '<span class="hk-svc-tx"><span class="hk-svc-t">'+esc(G.label)+'</span><span class="hk-svc-s">'+esc(sub)+'</span><span class="hk-svc-n">'+count(G.cards.length)+'</span></span>';
      b.setAttribute("aria-label",G.label+", "+count(G.cards.length));
      b.addEventListener("click",function(){show(i);reveal(i)});G.b=b;bar.appendChild(b);
    });
    bar.addEventListener("keydown",function(e){
      var i=groups.findIndex(function(G){return G.b===document.activeElement});if(i<0)return;
      var fwd=ar?"ArrowLeft":"ArrowRight",back=ar?"ArrowRight":"ArrowLeft",n=groups.length;
      if(e.key===fwd){show((i+1)%n,true);e.preventDefault()}else if(e.key===back){show((i+n-1)%n,true);e.preventDefault()}
    });
    grid.parentNode.insertBefore(bar,grid);grid.classList.add("hk-tabbed");
    if(!(bar.previousElementSibling&&bar.previousElementSibling.classList.contains("hk-svc-ask"))){
      var ask=document.createElement("p");ask.className="hk-svc-ask";
      ask.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg><span>'+(ar?"اختر ما تحتاجه، ثم تصفّح خدماته":"Choose what you need, then browse its services")+'</span>';
      grid.parentNode.insertBefore(ask,bar);
    }
    /* Point the tabs out: a gold glow and bounce every 2 s while they are on screen, until the first tap. */
    var seen=false;try{seen=sessionStorage.getItem("hkSvcTapped")==="1"}catch(e){}
    if(!seen){
      var io=window.IntersectionObserver?new IntersectionObserver(function(es){bar.classList.toggle("hk-call",es[0].isIntersecting)},{threshold:.6}):null;
      if(io)io.observe(bar);else bar.classList.add("hk-call");
      bar.addEventListener("click",function(){bar.classList.remove("hk-call");if(io)io.disconnect();try{sessionStorage.setItem("hkSvcTapped","1")}catch(e){}},{once:true});
    }
    var nx=grid.nextElementSibling;
    if(!(nx&&nx.classList.contains("hk-svc-help"))){
      var help=document.createElement("p");help.className="hk-svc-help";
      help.innerHTML=ar?'لست متأكداً أيّها يناسبك؟ <a href="/ar/contact/">أخبرنا بحالتك</a> وسيقترح عليك المنسّق الخيارات المناسبة.'
        :'Not sure which one fits? <a href="/contact/">Tell us about your case</a> and a coordinator will suggest suitable options.';
      grid.parentNode.insertBefore(help,grid.nextSibling);
    }
    var start=0;try{start=parseInt(sessionStorage.getItem("hkSvcTab"),10)||0}catch(e){}
    show(start<groups.length?start:0);
  }
  function scan(){var gs=document.querySelectorAll(".grid-sm");for(var i=0;i<gs.length;i++)if(gs[i].querySelector(".svc-group"))build(gs[i])}
  var tq;function soon(){clearTimeout(tq);tq=setTimeout(scan,150)}
  function boot(){scan();var r=document.getElementById("root")||document.body;if(window.MutationObserver)new MutationObserver(soon).observe(r,{childList:true,subtree:true});[800,2500].forEach(function(t){setTimeout(scan,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* HK-HERO-STEADY: the English and Arabic homepages keep their hero photo fixed behind the page, so the content slides over
   it. On phones the photo used to jump because its height followed the viewport, which changes whenever the
   browser bar shows or hides. Its height is now fixed in pixels (the tallest the screen can be) and only
   re-measured when the width changes (rotation, window resize on desktop), so the photo never re-crops mid-scroll. */
(function(){
  if(window.__hkSteady)return;window.__hkSteady=1;
  var st=document.createElement("style");
  st.textContent="html body .hk-steady{position:fixed!important;top:0!important;bottom:auto!important;left:0!important;right:0!important;width:100%!important;height:var(--hk-vh,100lvh)!important;transform:translateZ(0);backface-visibility:hidden;will-change:transform}";
  document.head.appendChild(st);
  var touch=window.matchMedia&&matchMedia("(pointer:coarse)").matches,w=0,h=0;
  function measure(){
    var vh=innerHeight;
    if(touch)vh=Math.max(vh,(screen&&screen.height)||0,document.documentElement.clientHeight);
    if(innerWidth!==w){w=innerWidth;h=vh}else if(!touch||vh>h)h=Math.max(touch?h:0,vh);
    document.documentElement.style.setProperty("--hk-vh",Math.round(h)+"px");
  }
  function tag(){
    var ls=document.querySelectorAll("#root .hero-bg-img,#root .hero-bg-grad,main.arwrap>.hero-bg-img,main.arwrap>.hero-bg-grad");
    for(var i=0;i<ls.length;i++)if(!ls[i].classList.contains("hk-steady"))ls[i].classList.add("hk-steady");
  }
  measure();addEventListener("resize",measure);addEventListener("orientationchange",function(){w=0;setTimeout(measure,250)});
  var tq;function soon(){clearTimeout(tq);tq=setTimeout(tag,60)}
  function boot(){tag();var r=document.getElementById("root");if(r&&window.MutationObserver)new MutationObserver(soon).observe(r,{childList:true});[300,1200,3000].forEach(function(t){setTimeout(tag,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* HK-SPOT-FX: the homepage holiday cards (.hk-spot-home). On first view each card rises out of a curtain wipe in
   turn while its photo settles from a zoom, the tag pops and the text slides up; afterwards the photos drift slowly
   (Ken Burns) and a gold light sweeps across each card in turn, only while they are on screen. Desktop: the card
   tilts toward the pointer with a moving glare and a gold edge. Phones: a press-and-spring on tap. Transforms and
   opacity only; nothing runs for reduced-motion users. */
(function(){
  if(window.__hkSpotFx)return;window.__hkSpotFx=1;
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  var rtl=document.documentElement.dir==="rtl"||/^\/ar(\/|$)/.test(location.pathname);
  var X=".hk-spot-home.hk-fx .hk-spot-card";
  var st=document.createElement("style");
  st.textContent=
    X+"{opacity:0;transform:translateY(42px) scale(.94);clip-path:inset(22% 0 0 0 round 14px);will-change:transform;"+
      "transition:opacity .7s ease,transform .9s cubic-bezier(.2,.8,.2,1),clip-path 1s cubic-bezier(.2,.8,.2,1),box-shadow .4s ease!important;transition-delay:calc(var(--i)*130ms)!important}"+
    ".hk-spot-home.hk-fx.hk-in .hk-spot-card{opacity:1;clip-path:inset(0 0 0 0 round 14px);"+
      "transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(var(--ty,0px)) scale(var(--sc,1))}"+
    ".hk-spot-home.hk-fx.hk-done .hk-spot-card{transition:transform .6s cubic-bezier(.2,.8,.2,1),box-shadow .4s ease!important;transition-delay:0s!important}"+
    ".hk-spot-home.hk-fx.hk-done .hk-spot-card.hk-tilt{transition:transform .12s linear,box-shadow .4s ease!important}"+
    X+" img{transform:scale(1.28);transition:transform 1.7s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i)*130ms)}"+
    ".hk-spot-home.hk-fx.hk-in .hk-spot-card img{transform:scale(1.06)}"+
    ".hk-spot-home.hk-fx.hk-live .hk-spot-card img{animation:hkKB 18s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-4.5s);animation-play-state:paused}"+
    ".hk-spot-home.hk-fx.hk-live.hk-vis .hk-spot-card img{animation-play-state:running}"+
    "@keyframes hkKB{0%{transform:scale(1.06) translate3d(0,0,0)}100%{transform:scale(1.17) translate3d(-2.5%,-2%,0)}}"+
    X+" .hk-spot-tag{opacity:0;transform:scale(.5);transition:opacity .4s ease,transform .6s cubic-bezier(.34,1.7,.64,1);transition-delay:calc(var(--i)*130ms + 450ms)}"+
    ".hk-spot-home.hk-fx.hk-in .hk-spot-card .hk-spot-tag{opacity:1;transform:none}"+
    X+" .hk-spot-txt>*{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .7s cubic-bezier(.2,.8,.2,1)}"+
    X+" .hk-spot-txt>:nth-child(1){transition-delay:calc(var(--i)*130ms + 350ms)}"+
    X+" .hk-spot-txt>:nth-child(2){transition-delay:calc(var(--i)*130ms + 450ms)}"+
    X+" .hk-spot-txt>:nth-child(3){transition-delay:calc(var(--i)*130ms + 550ms)}"+
    ".hk-spot-home.hk-fx.hk-in .hk-spot-card .hk-spot-txt>*{opacity:1;transform:none}"+
    ".hk-spot-home.hk-fx.hk-in .hk-spot-card .hk-spot-txt em{transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .6s ease}"+
    ".hk-fx-shine,.hk-fx-glare{position:absolute;inset:0;z-index:1;pointer-events:none}"+
    ".hk-fx-shine{background:linear-gradient(115deg,transparent 35%,rgba(255,233,170,.38) 48%,rgba(255,255,255,.12) 52%,transparent 64%);transform:translateX(-130%)}"+
    ".hk-spot-home.hk-fx.hk-live.hk-vis .hk-fx-shine{animation:hkShine 7s ease-in-out infinite;animation-delay:calc(var(--i)*1.3s + .6s)}"+
    "@keyframes hkShine{0%{transform:translateX(-130%)}16%,100%{transform:translateX(130%)}}"+
    ".hk-fx-glare{opacity:0;transition:opacity .35s ease;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.28),transparent 46%)}"+
    "@media(hover:hover) and (pointer:fine){"+
      ".hk-spot-home.hk-fx.hk-done .hk-spot-card:hover{--ty:-8px;box-shadow:0 0 0 1px rgba(232,200,119,.75),0 22px 48px rgba(10,46,54,.32),0 0 28px rgba(232,200,119,.25)!important}"+
      ".hk-spot-home.hk-fx.hk-done .hk-spot-card:hover .hk-fx-glare{opacity:1}"+
      ".hk-spot-home.hk-fx.hk-done .hk-spot-card:hover .hk-spot-txt em{transform:translateX("+(rtl?"-":"")+"6px)}}"+
    ".hk-spot-home.hk-fx.hk-done .hk-spot-card:active{--sc:.97}";
  document.head.appendChild(st);
  var fine=window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches;
  function tilt(card){
    var raf=0,ev=null;
    card.addEventListener("pointermove",function(e){ev=e;if(raf)return;raf=requestAnimationFrame(function(){raf=0;
      var r=card.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;
      card.classList.add("hk-tilt");card.style.setProperty("--ry",((x-.5)*10).toFixed(2)+"deg");card.style.setProperty("--rx",((.5-y)*8).toFixed(2)+"deg");
      card.style.setProperty("--mx",(x*100).toFixed(1)+"%");card.style.setProperty("--my",(y*100).toFixed(1)+"%")})});
    card.addEventListener("pointerleave",function(){card.classList.remove("hk-tilt");card.style.setProperty("--rx","0deg");card.style.setProperty("--ry","0deg")});
  }
  function enhance(grid){
    if(grid.__hkFx)return;grid.__hkFx=1;
    var cards=grid.querySelectorAll(".hk-spot-card");
    [].forEach.call(cards,function(c,i){c.style.setProperty("--i",i);
      if(!c.querySelector(".hk-fx-shine")){var s=document.createElement("span");s.className="hk-fx-shine";s.setAttribute("aria-hidden","true");c.appendChild(s);
        var g=document.createElement("span");g.className="hk-fx-glare";g.setAttribute("aria-hidden","true");c.appendChild(g)}
      if(fine)tilt(c)});
    grid.classList.add("hk-fx");
    if(!window.IntersectionObserver){grid.classList.add("hk-in","hk-done","hk-live","hk-vis");return}
    new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();
      requestAnimationFrame(function(){grid.classList.add("hk-in")});
      setTimeout(function(){grid.classList.add("hk-done","hk-live")},1900+cards.length*130)},{threshold:.25}).observe(grid);
    new IntersectionObserver(function(es){grid.classList.toggle("hk-vis",es[0].isIntersecting)},{threshold:0}).observe(grid);
  }
  function scan(){var gs=document.querySelectorAll(".hk-spot-home");for(var i=0;i<gs.length;i++)enhance(gs[i])}
  var tq;function soon(){clearTimeout(tq);tq=setTimeout(scan,200)}
  function boot(){scan();var r=document.getElementById("root")||document.body;if(window.MutationObserver)new MutationObserver(soon).observe(r,{childList:true,subtree:true});[1000,3000,6000].forEach(function(t){setTimeout(scan,t)})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

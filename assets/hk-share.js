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
      msg: 'Salam! I found Hayakkom — they arrange holidays, stays and treatment in Egypt for GCC families, in Arabic and English. Have a look:',
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
      msg: 'السلام عليكم! تعرّفت على حياكم — ينسّقون العطلات والإقامة والعلاج في مصر للعائلات من دول مجلس التعاون الخليجي، بالعربي والإنجليزي. شوفهم هنا:',
      iosT: 'أضف حياكم إلى الآيفون',
      ios: ['اضغط زر المشاركة <b>⎋</b> أسفل متصفح سفاري.', 'اختر <b>إضافة إلى الشاشة الرئيسية</b>.', 'اضغط <b>إضافة</b>، وسيفتح حياكم كأنه تطبيق.'],
      andT: 'أضف حياكم إلى جوالك',
      and: ['افتح قائمة المتصفح <b>⋮</b>.', 'اختر <b>تثبيت التطبيق</b> أو <b>الإضافة إلى الشاشة الرئيسية</b>.', 'أكّد، وسيفتح حياكم كأنه تطبيق.'],
      done: 'حياكم موجود على جوالك ✓'
    }
  };

  /* One shared install event for the whole site: the popup (hk-install.js), the 'Add to your phone' button and the
     Gateway all call window.hkInstall(), so the browser's one-time install prompt is never used up by another button. */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; window.__hkBIP = e; });
  window.addEventListener('appinstalled', function () { deferred = null; window.__hkBIP = null; try { localStorage.setItem('hkInstalled', '1'); } catch (x) {} });
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
    var ev = deferred || window.__hkBIP;
    if (ev) {
      deferred = null; window.__hkBIP = null;
      try { ev.prompt(); if (ev.userChoice) ev.userChoice.then(function (c) { if (c && c.outcome === 'accepted') { try { localStorage.setItem('hkInstalled', '1'); } catch (x) {} } }); return; } catch (x) { /* already used: show the steps */ }
    }
    var ua = navigator.userAgent || '';
    var inApp = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|Snapchat|TikTok|musical_ly|Twitter/i.test(ua);
    var ios = isIOS();
    var note = inApp ? (ar ? '<p><b>أنت تتصفح من داخل تطبيق آخر.</b> اضغط ⋯ أو ⋮ واختر «فتح في المتصفح» (' + (ios ? 'سفاري' : 'كروم') + ')، ثم:</p>'
                           : '<p><b>You are inside another app.</b> Tap ⋯ or ⋮ and choose “Open in browser” (' + (ios ? 'Safari' : 'Chrome') + '), then:</p>') : '';
    var steps = (ios ? L.ios : L.and).map(function (s) { return '<li>' + s + '</li>'; }).join('');
    sheet('<h3>' + (ios ? L.iosT : L.andT) + '</h3>' + note + '<ol>' + steps + '</ol><button type="button" class="hk-sheet-close">' + L.close + '</button>', ar ? 'rtl' : 'ltr');
  }
  window.hkInstall = function () { var ar = isAr(); openInstall(ar ? T.ar : T.en, ar); };

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
(function(){function L(){var e=document.createElement("script");e.src="/assets/hk-radio.js?v=20261025c";e.async=true;document.head.appendChild(e)}
function Q(){if(window.requestIdleCallback){window.requestIdleCallback(L,{timeout:4000})}else{setTimeout(L,2000)}}
if(document.readyState==="complete"){setTimeout(Q,1200)}else{window.addEventListener("load",function(){setTimeout(Q,800)})}})();

/* Quick guide (homepage walkthrough, English and Arabic): loaded after the page has finished loading. */
(function(){var p=location.pathname.replace(/index\.html$/,"");if(p!=="/"&&p!=="/ar/")return;
function L(){var e=document.createElement("script");e.src="/assets/hk-tour.js?v=20261027a";e.async=true;document.head.appendChild(e)}
if(document.readyState==="complete"){setTimeout(L,500)}else{window.addEventListener("load",function(){setTimeout(L,500)})}})();

/* Install-or-skip app popup: starts as early as possible. */
(function(){var e=document.createElement("script");e.src="/assets/hk-install.js?v=20261113i";e.async=true;document.head.appendChild(e)})();

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
    var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA)$/.test(a.tagName));
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
  var picking=false; /* a dropdown (e.g. the currency list) is open: tuck the buttons aside, never hide them */
  function sync(){var on=(inBand.size>0||picking)&&!b.classList.contains("hk-ai-open");if(on&&!b.classList.contains("hk-dock"))fabs.forEach(side);cls("hk-dock",on)}
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
  var tt;function typing(){clearTimeout(tt);tt=setTimeout(function(){var a=document.activeElement,pk=!!(a&&a.tagName==="SELECT"&&field(a));
    cls("hk-type",field(a)&&!pk);if(pk!==picking){picking=pk;sync()}},60)}
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
    /* all four categories bounce on their own: bounce, 1 s pause, bounce again, then rest ~4 s and repeat */
    ".hk-svc-tabs.hk-call .hk-svc-tab{animation:hkChip 6.5s ease-in-out infinite}"+
    ".hk-svc-tabs.hk-call .hk-svc-tab:nth-child(2){animation-delay:.12s}.hk-svc-tabs.hk-call .hk-svc-tab:nth-child(3){animation-delay:.24s}.hk-svc-tabs.hk-call .hk-svc-tab:nth-child(4){animation-delay:.36s}"+
    "@keyframes hkChip{0%,11%,26%,37%,100%{transform:translateY(0);box-shadow:0 0 0 0 rgba(201,162,58,0)}"+
      "5%,31%{transform:translateY(-8px);box-shadow:0 0 0 0 rgba(201,162,58,.6),0 0 18px rgba(201,162,58,.55)}"+
      "8%,34%{transform:translateY(0)}9.5%,35.5%{transform:translateY(-2px)}}"+
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
    /* bounce automatically whenever the categories are on screen; no tap needed */
    var io=window.IntersectionObserver?new IntersectionObserver(function(es){bar.classList.toggle("hk-call",es[0].isIntersecting)},{threshold:.25}):null;
    if(io)io.observe(bar);else bar.classList.add("hk-call");
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

/* HK-CC-BOOST: the cookie bar (#hkCc, in every page) slides up, shows "Accept all" first and larger, and gives it a
   short gold glow after a few seconds so visitors notice it. "Essential only" stays on the bar, readable and one tap
   away, as the Saudi PDPL expects a real choice. The footer "Cookie settings" button reopens the bar. */
(function(){
  if(window.__hkCcBoost)return;window.__hkCcBoost=1;
  var B="html body #hkCc",calm=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
  var st=document.createElement("style");
  st.textContent=
    B+"{border-top:1px solid rgba(212,168,67,.45)!important;box-shadow:0 -10px 30px rgba(0,0,0,.28)!important}"+
    B+":not([hidden]){animation:"+(calm?"none":"hkCcUp .5s cubic-bezier(.2,.8,.2,1) both")+"}"+
    "@keyframes hkCcUp{from{transform:translateY(100%)}to{transform:none}}"+
    B+" p{color:#EEF6F5!important}"+
    B+" .cc-btns{align-items:center!important}"+
    B+" .cc-accept{order:-1;padding:11px 28px!important;font-size:14.5px!important;min-height:44px;box-shadow:0 4px 14px rgba(212,168,67,.35)}"+
    B+" .cc-accept.hk-glow{animation:hkCcGlow 1.6s ease-in-out 2}"+
    "@keyframes hkCcGlow{0%,100%{box-shadow:0 4px 14px rgba(212,168,67,.35);transform:none}50%{box-shadow:0 0 0 7px rgba(212,168,67,.28),0 6px 20px rgba(212,168,67,.5);transform:scale(1.05)}}"+
    B+" .cc-reject{padding:10px 18px!important;font-size:13px!important;min-height:44px;color:#E3DACA!important}"+
    "@media(max-width:600px){"+B+" .cc-btns{flex-wrap:nowrap!important;width:100%;max-width:400px}"+B+" .cc-accept{flex:1 1 auto;padding:11px 16px!important}"+B+" .cc-reject{flex:0 0 auto;padding:10px 14px!important}}";
  (document.head||document.documentElement).appendChild(st);
  if(calm)return;
  var t;function glow(){var b=document.getElementById("hkCc"),a=b&&b.querySelector(".cc-accept");
    if(!a||b.hidden)return;a.classList.remove("hk-glow");void a.offsetWidth;a.classList.add("hk-glow")}
  function watch(){var b=document.getElementById("hkCc");if(!b)return;clearTimeout(t);if(!b.hidden)t=setTimeout(glow,4000);
    if(window.MutationObserver)new MutationObserver(function(){clearTimeout(t);if(!b.hidden)t=setTimeout(glow,4000)}).observe(b,{attributes:true,attributeFilter:["hidden"]})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch);else watch();
})();

/* HK-FORM-LOADER: Jotform draws its form a second or two after the frame has loaded, which showed an empty white
   box. Every enquiry form frame (not the assistant, which has its own loading state) gets a branded cover with a
   spinner that lifts when the form reports its height (Jotform's setHeight message), 2.5 s after the frame loads,
   or at the latest 15 s after the form comes into view. */
(function(){
  if(window.__hkFormLoader)return;window.__hkFormLoader=1;
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var st=document.createElement("style");
  st.textContent=
    ".hk-fl{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;"+
      "padding-top:clamp(60px,18%,140px);background:#fff;color:#0A2E36;text-align:center;font-family:inherit;transition:opacity .35s ease}"+
    ".hk-fl.hk-fl-out{opacity:0;pointer-events:none}"+
    ".hk-fl i{width:38px;height:38px;border-radius:50%;border:3px solid rgba(212,168,67,.25);border-top-color:#D4A843;animation:hkFlSpin .9s linear infinite}"+
    ".hk-fl b{font-size:15.5px;font-weight:600;margin-top:6px}"+
    ".hk-fl span{font-size:12.5px;color:#5E7479}"+
    "@keyframes hkFlSpin{to{transform:rotate(360deg)}}"+
    "@media(prefers-reduced-motion:reduce){.hk-fl i{animation-duration:2.4s}}";
  (document.head||document.documentElement).appendChild(st);
  var items=[];
  function isForm(f){return f&&f.tagName==="IFRAME"&&f.id!=="hkAiFrame"&&/\/\/form\.jotform\.com\//.test(f.getAttribute("src")||"")}
  function attach(f){
    if(f.__hkFl)return;f.__hkFl=1;
    var p=f.parentNode;if(!p)return;
    if(getComputedStyle(p).position==="static")p.style.position="relative";
    var c=document.createElement("div");c.className="hk-fl";c.setAttribute("role","status");
    c.innerHTML='<i aria-hidden="true"></i><b>'+(ar?"جارٍ تحميل نموذج الاستفسار…":"Loading your enquiry form…")+'</b><span>'+(ar?"لحظات فقط":"This takes a moment")+'</span>';
    p.insertBefore(c,f.nextSibling);
    var it={f:f,c:c,done:false},ro,io,cap;items.push(it);
    function place(){if(it.done)return;var h=f.offsetHeight;
      if(!h||!f.offsetParent){c.style.display="none";return}
      c.style.display="";c.style.top=f.offsetTop+"px";c.style.left=f.offsetLeft+"px";c.style.width=f.offsetWidth+"px";c.style.height=h+"px"}
    it.lift=function(){if(it.done)return;it.done=true;c.classList.add("hk-fl-out");setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},400);
      if(ro)ro.disconnect();if(io)io.disconnect();clearTimeout(cap)};
    f.addEventListener("load",function(){setTimeout(it.lift,2500)});
    if(window.ResizeObserver){ro=new ResizeObserver(place);ro.observe(f)}
    addEventListener("resize",place);place();
    var arm=function(){if(!cap)cap=setTimeout(it.lift,15000)};
    if(window.IntersectionObserver){io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting}))arm()});io.observe(f)}else arm();
  }
  addEventListener("message",function(e){
    if(typeof e.data!=="string"||e.data.indexOf("setHeight")<0)return;
    for(var i=0;i<items.length;i++)if(!items[i].done&&items[i].f.contentWindow===e.source){var it=items[i];setTimeout(it.lift,250)}
  });
  function scan(root){var l=(root.querySelectorAll?root.querySelectorAll("iframe"):[]);if(root.tagName==="IFRAME")l=[root];
    for(var i=0;i<l.length;i++)if(isForm(l[i]))attach(l[i])}
  function boot(){scan(document);if(window.MutationObserver)new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)for(var j=0;j<ms[i].addedNodes.length;j++){var n=ms[i].addedNodes[j];if(n.nodeType===1)scan(n)}}).observe(document.body,{childList:true,subtree:true})}
  if(document.body)boot();else document.addEventListener("DOMContentLoaded",boot);
})();

/* HK-FORM-UP: on phones the enquiry box of the service pages (.sp-grid) used to sit below all the page text,
   where few visitors reach it. It now follows the first block (the price table where there is one), so the
   page reads: prices, then the form, then the details. Desktop keeps the sticky side column. */
(function(){
  if(window.__hkFormUp)return;window.__hkFormUp=1;
  var st=document.createElement("style");
  st.textContent="@media (max-width:768px){"+
    ".sp-grid{display:flex!important;flex-direction:column;gap:28px!important}"+
    ".sp-grid>div:first-child{display:contents}"+
    ".sp-grid>div:first-child>*{order:3}"+
    ".sp-grid>div:first-child>*:first-child{order:1}"+
    ".sp-grid>.enquiry-box{order:2;scroll-margin-top:72px}}";
  (document.head||document.documentElement).appendChild(st);
})();

/* HK-ENQ: every enquiry button keeps the visitor on the website. Clicks on WhatsApp buttons (except the floating
   WhatsApp button), "#quote" links and Jotform links scroll to the page's own form, or open the right form in a
   pop-up when the page has none. Runs before HK-CONVERSIONS (window, capture) so these clicks are not counted as
   WhatsApp conversions; the form submission is still counted as a lead. Forms and page map: scratchpad cfg.py. */
(function(){
  if(window.__hkEnq)return;window.__hkEnq=1;
  var F={"medical": ["263097117701051", "263096472028056", "input22", "q19_textbox17"], "dental": ["263095260665057", "263095990075062", "", ""], "education": ["263088230595058", "263087942282060", "", ""], "vip": ["263096488689076", "263096950374061", "sourcePage", "q3_textbox1"], "investor": ["263096824130051", "263096595743066", "q8_textbox6", "input"], "normal": ["263096737222056", "263097092698068", "q17_textbox15", "q2_textbox0"], "cairo": ["263103163535045", "263103008336042", "sourcePage", "q23_textbox21"], "luxor": ["263103777672058", "263102962904051", "q4_textbox2", "q12_textbox10"], "aswan": ["263103042715041", "263103938536056", "sourcePage", "q14_textbox12"], "hurghada": ["263102909793058", "263103653057048", "sourcePage", "input"], "sharm": ["263103247695055", "263103174380045", "q10_textbox8", "q11_textbox9"], "redsea": ["263103504152039", "263103657584057", "q12_textbox10", "q2_textbox0"], "alex": ["263103517377052", "263103490829054", "q10_textbox8", "input"], "siwa": ["263103465460047", "263103695828060", "q3_textbox1", "input"], "nile": ["263103636339052", "263103722538049", "q20_textbox18", "q20_textbox18"]},P={"about": "normal", "adventure": "normal", "alexandria": "alex", "aswan": "aswan", "business": "investor", "cairo": "cairo", "calculator": "normal", "conferences": "normal", "cosmetic-surgery": "medical", "cultural": "normal", "dental": "dental", "dentist-urgent": "medical", "doctor-children": "medical", "doctor-gp": "medical", "educational": "education", "eid-al-adha-egypt-2027": "normal", "eid-al-fitr-egypt-2027": "normal", "eyes-lasik": "medical", "first-time-in-egypt": "normal", "full-checkup": "medical", "hair-transplant": "medical", "heritage": "vip", "holidays": "normal", "honeymoon-egypt": "normal", "hotel-doctor": "medical", "how-to-choose": "medical", "hurghada": "hurghada", "kuwait": "medical", "luxor": "luxor", "medical": "medical", "nile-cruise": "nile", "nile-cruise-events": "nile", "north-coast": "alex", "north-coast-villas": "alex", "nurse-visit": "medical", "orthopedics": "medical", "physiotherapy": "medical", "religious": "normal", "safaga": "redsea", "saudi-arabia": "medical", "saudi-national-day-egypt": "normal", "saudi-school-holidays-egypt": "normal", "services": "normal", "sharm": "sharm", "sharm-5-star-hotels": "sharm", "tourists": "normal", "travel-guide": "medical", "uae": "medical", "video-consultation": "medical", "vip-trip": "vip", "weight-loss": "medical", "wellness": "medical", "who-we-are": "normal", "excursions": "normal", "wellness-retreats": "medical", "marsa-alam": "redsea", "dahab": "sharm", "siwa": "siwa"},B={"about-hayakkom-who-we-are": "normal", "bariatric-surgery-egypt-saudi-patients": "medical", "cairo-day-trips-guide": "cairo", "cosmetic-surgery-egypt-how-long-before-flying": "medical", "dental-implants-cost-egypt-saudi-patients": "dental", "dental-tourism-egypt": "dental", "doctor-in-egypt-for-gulf-visitors": "medical", "egypt-family-holiday-guide-gulf": "normal", "hair-transplant-egypt-cost-guide": "medical", "hair-transplant-egypt-or-turkey": "medical", "holiday-and-treatment-in-egypt": "medical", "how-long-stay-egypt-medical-treatment": "medical", "medical-tourism-egypt-gulf": "medical", "nile-cruise-planning-guide": "nile", "physiotherapy-sessions-egypt": "medical", "pre-travel-consultation": "medical", "questions-before-choosing-clinic-abroad": "medical", "saudi-insurance-treatment-egypt": "medical"};
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var path=location.pathname.replace(/^\/ar(?=\/|$)/,"").replace(/^\/+|\/+$/g,"");
  var key=P[path]||(path.indexOf("blog/")===0?B[path.slice(5)]:"")||"normal";
  var src=(ar?"ar-":"")+(path.replace(/\//g,"-")||"home");
  function url(k){var f=F[k]||F.normal,id=f[ar?1:0],p=f[ar?3:2];
    return "https://form.jotform.com/"+id+"?isIframeEmbed=1&button="+encodeURIComponent(src)+(p?"&"+p+"="+encodeURIComponent(src):"");}
  var st=document.createElement("style");st.textContent=".hk-qf{margin:22px 0 26px;border:1px solid #E6DFCF;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 1px 2px rgba(10,46,54,.06),0 8px 24px rgba(10,46,54,.06);scroll-margin-top:80px}.hk-qf-h{padding:16px 18px;background:#0A2E36;color:#fff;display:flex;flex-direction:column;gap:4px}.hk-qf-h strong{font-size:19px;color:#D4A843;line-height:1.3}.hk-qf-h span{font-size:13px;opacity:.88;line-height:1.5}.hk-qf .jf-wrap{border:0!important;border-radius:0!important;margin:0}.hk-wa-num{margin-inline-start:10px;font-size:13px;opacity:.85;white-space:nowrap}.hk-next{margin:28px 0 8px;padding:14px 16px;border:1px solid #E6DFCF;border-radius:12px;background:#FBF8F1;line-height:1.8}.hk-next a{color:#0A2E36;font-weight:600;text-decoration:underline;text-underline-offset:3px}.hk-enq-ov{position:fixed;inset:0;background:rgba(10,46,54,.55);z-index:2147483000;display:none;align-items:center;justify-content:center;padding:16px}.hk-enq-ov.on{display:flex}.hk-enq-bx{background:#fff;border-radius:16px;width:min(640px,100%);height:min(88vh,780px);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3)}.hk-enq-top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#0A2E36;color:#D4A843}.hk-enq-x{background:none;border:0;color:#fff;font-size:28px;cursor:pointer;line-height:1;padding:0 4px}.hk-enq-bx iframe{flex:1;width:100%;border:0;background:#fff}@media (max-width:600px){.hk-enq-ov{padding:0}.hk-enq-bx{width:100%;height:100%;border-radius:0}}";(document.head||document.documentElement).appendChild(st);
  var ov,fr;
  function track(){try{if(typeof window.gtag==="function")window.gtag("event","enquiry_open",{page_path:location.pathname})}catch(e){}}
  function close(){if(ov){ov.classList.remove("on");document.documentElement.style.overflow=""}}
  function open(u){
    if(!ov){
      ov=document.createElement("div");ov.className="hk-enq-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
      ov.innerHTML='<div class="hk-enq-bx" dir="'+(ar?"rtl":"ltr")+'"><div class="hk-enq-top"><strong>'+(ar?"احصل على عرض سعر مجاني":"Get your free quote")+
        '</strong><button type="button" class="hk-enq-x" aria-label="'+(ar?"إغلاق":"Close")+'">×</button></div><iframe title="'+(ar?"نموذج الاستفسار":"Enquiry form")+'" allow=""></iframe></div>';
      document.body.appendChild(ov);fr=ov.querySelector("iframe");
      ov.addEventListener("click",function(e){if(e.target===ov||(e.target.classList&&e.target.classList.contains("hk-enq-x")))close()});
      document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
    }
    if(fr.getAttribute("src")!==u)fr.setAttribute("src",u);
    ov.classList.add("on");document.documentElement.style.overflow="hidden";track();
  }
  function pageForm(){return document.querySelector('.hk-qf iframe,.enquiry-box iframe[src*="form.jotform.com"],iframe[src*="form.jotform.com"],iframe[id^="JotFormIFrame"]')}
  function go(){
    var f=pageForm();
    if(f){var box=(f.closest&&f.closest(".hk-qf,.enquiry-box,.arform,.jf-wrap"))||f;box.scrollIntoView({behavior:"smooth",block:"start"});track();return}
    open(url(key));
  }
  window.hkEnqOpenForm=function(){var f=pageForm();var u=f&&f.getAttribute("src");if(u&&u.indexOf("isIframeEmbed")<0)u+=(u.indexOf("?")<0?"?":"&")+"isIframeEmbed=1";open(u||url(key))};
  window.addEventListener("click",function(e){
    var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a)return;
    if(window.__hkPkgBtn&&window.__hkPkgBtn(a))return; /* package buttons go to WhatsApp (HK-PKG-WA) */
    var h=a.getAttribute("href")||"";
    var wa=/^(https?:)?\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)||/^whatsapp:/i.test(h);
    var jf=/^https:\/\/form\.jotform\.com\/\d+/.test(h);
    var q=a.hasAttribute("data-hk-enq")||h==="#quote";
    if(!(wa||jf||q))return;
    if(wa&&a.closest(".fab,.fab-stack,.fab-wa"))return;
    /* WhatsApp links that already carry a written message (Gateway plan, search results, end-of-page panel) open WhatsApp directly */
    if(wa&&(/[?&]text=/.test(h)||a.closest(".hkg,.hk-s-ov,.hk-cta-end,[data-hk-direct]")))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(jf){open(h.replace(/^(https:\/\/form\.jotform\.com\/\d+)\??/,"$1?isIframeEmbed=1&"));return}
    go();
  },true);
  function hash(){if(location.hash==="#quote")setTimeout(go,700)}
  if(document.readyState==="complete")hash();else window.addEventListener("load",hash);
})();

/* HK-LOC: every place the office address appears opens Hayakkom's official Google Maps listing (Business Profile,
   cid link), and the Contact-page map gets an "Open in Google Maps" button. Text outside #root is wrapped in a link;
   inside the React app (#root) the element itself is made clickable, so React's own nodes are never replaced. */
(function(){
  if(window.__hkLoc)return;window.__hkLoc=1;
  var MAP="https://maps.google.com/?cid=7647895636237272778";
  var RX=/(District 16, Neighbourhood 2, Sheikh Zayed City, Giza(?: 12774)?(?:, Egypt)?|Sheikh Zayed, District 16, Giza|الحي 16، المجاورة الثانية، الشيخ زايد، الجيزة(?: 12774)?(?:، مصر)?|الشيخ زايد، الحي 16، الجيزة)/;
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var st=document.createElement("style");
  st.textContent="a.hk-loc,.hk-loc-el{color:inherit;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;cursor:pointer}"+
    "a.hk-loc:hover,.hk-loc-el:hover{text-decoration-style:solid}"+
    ".hk-loc-btn{display:inline-flex;align-items:center;gap:8px;margin:12px 0 4px;padding:11px 18px;border-radius:999px;background:#0A2E36;color:#fff!important;font-weight:700;text-decoration:none!important;font-size:15px}"+
    ".hk-loc-btn:hover{background:#12434e}";
  (document.head||document.documentElement).appendChild(st);
  function track(){try{if(typeof window.gtag==="function")window.gtag("event","map_open",{page_path:location.pathname})}catch(e){}}
  function go(){track();window.open(MAP,"_blank","noopener")}
  var SKIP={SCRIPT:1,STYLE:1,A:1,TEXTAREA:1,NOSCRIPT:1,TITLE:1,BUTTON:1,IFRAME:1};
  function scan(){
    var root=document.getElementById("root");
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode;if(!p||SKIP[p.nodeName]||(p.closest&&p.closest("a,.hk-loc-el,[contenteditable]")))return NodeFilter.FILTER_REJECT;
      return RX.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});
    var list=[],n;while((n=w.nextNode()))list.push(n);
    list.forEach(function(t){
      var p=t.parentNode;
      if(root&&root.contains(t)){ /* React-owned: make the element clickable, never replace its nodes */
        if((p.textContent||"").length>160)return;
        p.classList.add("hk-loc-el");p.setAttribute("role","link");p.setAttribute("tabindex","0");
        p.setAttribute("title",ar?"افتح الموقع في خرائط جوجل":"Open our location in Google Maps");
        return;
      }
      var m=t.nodeValue.match(RX);if(!m)return;
      var after=t.splitText(m.index);after.splitText(m[0].length);
      var a=document.createElement("a");a.className="hk-loc";a.href=MAP;a.target="_blank";a.rel="noopener";
      a.title=ar?"افتح الموقع في خرائط جوجل":"Open our location in Google Maps";
      a.textContent=after.nodeValue;p.replaceChild(a,after);
    });
    /* the 📍 Address card on the Contact page */
    document.querySelectorAll(".contact-card").forEach(function(c){
      if(c.classList.contains("hk-loc-el")||c.textContent.indexOf("📍")<0)return;
      c.classList.add("hk-loc-el");c.setAttribute("role","link");c.setAttribute("tabindex","0");c.style.cursor="pointer";
    });
    /* a button under every embedded Google map */
    document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(function(f){
      var box=f.parentNode;if(!box||!box.parentNode||box.parentNode.querySelector(".hk-loc-btn"))return;
      var b=document.createElement("a");b.className="hk-loc-btn";b.href=MAP;b.target="_blank";b.rel="noopener";
      b.innerHTML="📍 "+(ar?"افتح موقعنا في خرائط جوجل":"Open our location in Google Maps");
      b.addEventListener("click",track);
      box.parentNode.insertBefore(b,box.nextSibling);
    });
  }
  document.addEventListener("click",function(e){
    var el=e.target&&e.target.closest?e.target.closest("a.hk-loc,.hk-loc-el"):null;if(!el)return;
    if(el.tagName==="A"){track();return}
    e.preventDefault();go();
  });
  document.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target&&e.target.classList&&e.target.classList.contains("hk-loc-el")){e.preventDefault();go()}});
  var t=null;function later(){clearTimeout(t);t=setTimeout(scan,250)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",later);else later();
  window.addEventListener("load",later);
  try{new MutationObserver(later).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(e){}
})();

/* HK-PKG-WA: package buttons ("Ask for this trip", "Enquire now", Kunooz "Ask on WhatsApp") open WhatsApp with a ready
   message naming the package, its indicative price range and the page, so the coordinator knows exactly what was chosen.
   The click is a normal wa.me link, so HK-CONVERSIONS still counts it as a WhatsApp conversion. */
(function(){
  if(window.__hkPkgWa)return;window.__hkPkgWa=1;
  var NUM="201031567949";
  var ar=document.documentElement.lang==="ar"||/^\/ar(\/|$)/.test(location.pathname);
  var st=document.createElement("style");
  st.textContent=".pkg-card a.hkp-btn,.pkg-card a.pkg-btn,a.hk-pkg-wa{display:inline-flex;align-items:center;justify-content:center;gap:8px}"+
    ".pkg-card a.hkp-btn::before,.pkg-card a.pkg-btn::before,a.hk-pkg-wa::before{content:'';width:18px;height:18px;flex:0 0 18px;"+
    "background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%2325D366' d='M16 3a13 13 0 0 0-11 19.7L3.5 29l6.5-1.7A13 13 0 1 0 16 3Zm7.6 18.4c-.3.9-1.8 1.7-2.5 1.8-.6.1-1.4.1-2.3-.1a20 20 0 0 1-2.1-.8c-3.7-1.6-6.1-5.3-6.3-5.6-.2-.2-1.5-2-1.5-3.8s.9-2.7 1.3-3.1c.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6l1.1 2.7c.1.2.2.5 0 .8l-.4.7-.6.6c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1l1.2-1.4c.3-.4.5-.3.9-.2l2.6 1.2c.4.2.6.3.7.4.1.2.1 1-.3 1.9Z'/%3E%3C/svg%3E\") center/contain no-repeat}";
  (document.head||document.documentElement).appendChild(st);
  function txt(el){return el?(el.textContent||"").replace(/\s+/g," ").trim():""}
  function info(a){
    var card=a.closest(".pkg-card,.kz-gem");
    if(!card){var p=a.parentElement;while(p&&p!==document.body){if(/(^|\s)pkg-/.test(p.className||"")&&p.querySelector(".pkg-price")){card=p;break}p=p.parentElement}}
    if(!card)return null;
    var isBtn=a.classList.contains("hkp-btn")||a.classList.contains("pkg-btn")||a.classList.contains("hk-pkg-wa")||(card.classList.contains("kz-gem")&&a.hasAttribute("data-hk-enq"));
    if(!isBtn)return null;
    var name=txt(card.querySelector(".pkg-name,.pkg-title,h2,h3")).replace(/^\d+\s*/,"");
    var price=txt(card.querySelector(".pkg-price,.kz-price"));
    return {name:name,price:price,id:card.id||""};
  }
  function msg(i){
    var url=location.origin+location.pathname+(i.id?"#"+i.id:"");
    if(/^ru/i.test(document.documentElement.lang||""))return "Здравствуйте, Hayakkom 👋\nМеня интересует: "+i.name+(i.price?"\nОриентировочная цена: "+i.price:"")+"\nСтраница: "+url+"\nПришлите, пожалуйста, подробности и письменное предложение.";
    return ar?("مرحباً حياكم 👋\nأرغب في: "+i.name+(i.price?"\nالسعر التقديري: "+i.price:"")+"\nالصفحة: "+url+"\nأرجو إرسال التفاصيل وعرض سعر مكتوب.")
             :("Hello Hayakkom 👋\nI'm interested in: "+i.name+(i.price?"\nIndicative price: "+i.price:"")+"\nPage: "+url+"\nPlease send me the details and a written quote.");
  }
  window.__hkPkgBtn=function(a){
    var i=info(a);if(!i||!i.name)return false;
    a.setAttribute("href","https://wa.me/"+NUM+"?text="+encodeURIComponent(msg(i)));
    a.setAttribute("target","_blank");a.setAttribute("rel","noopener");
    try{if(typeof window.gtag==="function")window.gtag("event","package_whatsapp",{package_name:i.name,price_range:i.price,page_path:location.pathname})}catch(e){}
    return true;
  };
})();

/* HK-FX: international visitors (outside the GCC countries and Egypt) see an approximate conversion next to SAR prices,
   e.g. "380–950 SAR (≈ $100–255)". GCC and Egyptian visitors see the page exactly as before. Only text outside the
   React app (#root) is touched. Rates are rounded and labelled approximate. */
(function(){
  if(window.__hkFx)return;window.__hkFx=1;
  var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}
  if(!tz||/^(Asia\/(Riyadh|Dubai|Kuwait|Qatar|Bahrain|Muscat|Aden)|Africa\/Cairo)$/.test(tz))return;
  if(/^\/(ru|uk)(\/|$)/.test(location.pathname))return; /* these pages already show USD / GBP */
  var C=tz==="Europe/London"||tz==="Europe/Belfast"?["£",4.75]:(/^Europe\//.test(tz)&&!/Moscow|Minsk|Istanbul|Kiev|Kyiv|Samara|Volgograd/.test(tz))?["€",4.05]:["$",3.75];
  var RX=/(\d[\d,]*)(?:\s?[–-]\s?(\d[\d,]*))?\s?(SAR|ريال)/g;
  function conv(n){var v=parseInt(n.replace(/,/g,""),10)/C[1];var r=v>=1000?Math.round(v/10)*10:Math.round(v/5)*5;return r.toLocaleString("en-US")}
  function scan(){
    var root=document.getElementById("root");
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|TITLE|OPTION)$/.test(p.nodeName)||(p.closest&&p.closest(".hk-fx,[contenteditable]"))||(root&&root.contains(n)))return NodeFilter.FILTER_REJECT;
      RX.lastIndex=0;return RX.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});
    var list=[],n;while((n=w.nextNode()))list.push(n);
    list.forEach(function(t){
      var s=t.nodeValue,out=document.createDocumentFragment(),last=0,m;RX.lastIndex=0;
      while((m=RX.exec(s))){
        var end=m.index+m[0].length;out.appendChild(document.createTextNode(s.slice(last,end)));
        var sp=document.createElement("span");sp.className="hk-fx";sp.style.cssText="opacity:.75;font-size:.9em;white-space:nowrap";
        sp.textContent=" (≈ "+C[0]+conv(m[1])+(m[2]?"–"+conv(m[2]):"")+")";sp.title="Approximate conversion";
        out.appendChild(sp);last=end;
      }
      out.appendChild(document.createTextNode(s.slice(last)));t.parentNode.replaceChild(out,t);
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scan);else scan();
})();

/* HK-SEARCH: site search and knowledge base. A 🔍 button in every menu (and any element with data-hk-search) opens a
   panel that searches all pages and their questions & answers (assets/search-index.json, built by
   scripts/build-search-index.py), in Arabic, English and Russian, with filters by service. Each result offers the next
   step: open the page, get a quote, or WhatsApp with a message naming what the visitor searched for. */
(function(){
  if(window.__hkSearch)return;window.__hkSearch=1;
  var L=document.documentElement.lang||"";var ar=/^ar/.test(L)||/^\/ar(\/|$)/.test(location.pathname);var ru=/^ru/.test(L);
  var lang=ar?"ar":ru?"ru":"en";
  var T={
    en:{ph:"Search treatments, trips, prices, questions…",btn:"Search",all:"All",treatments:"Treatments",holidays:"Holidays & trips",kunooz:"Kunooz",packages:"Packages",guides:"Guides",answers:"Answers",
        pop:"Popular searches",none:"No exact match. Ask us directly — a coordinator replies within 12 hours.",open:"Open",quote:"Get a quote",wa:"WhatsApp",ans:"Answer",close:"Close",res:"results",
        sugg:["dental implants cost","Hollywood smile","hair transplant","Kunooz hidden gems","Sharm family holiday","Nile cruise","doctor at my hotel","visa"]},
    ar:{ph:"ابحث عن علاج أو رحلة أو سعر أو سؤال…",btn:"بحث",all:"الكل",treatments:"العلاجات",holidays:"العطلات والرحلات",kunooz:"كنوز",packages:"الباقات",guides:"الأدلة",answers:"إجابات",
        pop:"عمليات بحث شائعة",none:"لا توجد نتيجة مطابقة. اسألنا مباشرة — يرد منسّق خلال 12 ساعة.",open:"افتح",quote:"عرض سعر",wa:"واتساب",ans:"الإجابة",close:"إغلاق",res:"نتيجة",
        sugg:["سعر زراعة الأسنان","ابتسامة هوليوود","زراعة الشعر","كنوز مصر الخفية","عطلة شرم الشيخ","رحلة نيلية","طبيب في الفندق","التأشيرة"]},
    ru:{ph:"Поиск: лечение, экскурсии, цены, вопросы…",btn:"Поиск",all:"Все",treatments:"Лечение",holidays:"Отдых и экскурсии",kunooz:"10 сокровищ",packages:"Пакеты",guides:"Гиды",answers:"Ответы",
        pop:"Популярное",none:"Точных совпадений нет. Напишите нам — координатор ответит в течение 12 часов.",open:"Открыть",quote:"Расчёт",wa:"WhatsApp",ans:"Ответ",close:"Закрыть",res:"результатов",
        sugg:["виниры","импланты","Белая пустыня","Сива","врач в отель","виза"]}}[lang];
  var SYN={teeth:"dental",tooth:"dental",dentist:"dental",veneer:"veneers",veneers:"dental veneers",implant:"implants",implants:"dental implants",smile:"hollywood dental",
    braces:"orthodontics",hair:"hair transplant",fue:"hair transplant",sleeve:"weight-loss",obesity:"weight-loss",weight:"weight-loss",lasik:"eyes lasik",eye:"eyes lasik",
    cruise:"nile cruise",nile:"nile cruise",beach:"red sea sharm hurghada holiday",resort:"holiday",kids:"family",children:"family",price:"cost price sar",cost:"cost price sar",
    "how much":"cost price",cheap:"price",hidden:"kunooz",gems:"kunooz",gem:"kunooz",desert:"white desert kunooz",safe:"safe safety",doctor:"doctor hotel",
    "اسنان":"الأسنان","سن":"الأسنان","زرعه":"زراعة","شعر":"زراعة الشعر","تكميم":"السمنة","سمنه":"السمنة","تخسيس":"السمنة","كروز":"نيلية","نيل":"نيلية","بحر":"شرم الغردقة",
    "سعر":"سعر تكلفة ريال","كم":"سعر تكلفة","كنز":"كنوز","كنوز":"كنوز","صحراء":"الصحراء كنوز","دكتور":"طبيب","طبيب":"طبيب الفندق",
    "зубы":"стоматология виниры импланты","виниры":"стоматология","импланты":"стоматология","экскурсии":"сокровищ","пустыня":"Белая пустыня","цена":"цены"};
  function norm(s){return (s||"").toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ё/g,"е").replace(/[^\p{L}\p{N}\s-]/gu," ")}
  var IDX=null,loading=null;
  function load(){if(IDX)return Promise.resolve(IDX);if(loading)return loading;
    loading=fetch("/assets/search-index.json?v=1").then(function(r){return r.json()}).then(function(d){
      d.forEach(function(x){x._t=norm(x.t+" "+x.h);x._d=norm(x.d);x._k=norm(x.k);x._q=x.q.map(function(q){return [norm(q[0]),norm(q[1])]})});IDX=d;return d});return loading}
  function terms(q){var n=norm(q);var extra=[];Object.keys(SYN).forEach(function(k){if((" "+n+" ").indexOf(" "+norm(k)+" ")>=0)extra.push(norm(SYN[k]))});
    return (n+" "+extra.join(" ")).split(/\s+/).filter(function(w){return w.length>1})}
  function hit(hay,w){if(!hay)return 0;if((" "+hay+" ").indexOf(" "+w+" ")>=0)return 1;return hay.indexOf(w)>=0?(w.length>3?.7:.3):0}
  function search(q,filter){
    var ws=terms(q);if(!ws.length)return {pages:[],answers:[]};
    var pages=[],answers=[];
    IDX.forEach(function(x){
      var s=0,m=0;ws.forEach(function(w){var a=hit(x._t,w)*6+hit(x._d,w)*2.2+hit(x._k,w)*1.4;if(a>0)m++;s+=a});
      x._q.forEach(function(qa,i){var sq=0;ws.forEach(function(w){sq+=hit(qa[0],w)*3+hit(qa[1],w)});if(sq>2.5)answers.push({x:x,i:i,s:sq+(x.l===lang?3:0)});s+=sq*.25});
      if(s<=0)return;
      s*= .5+.5*(m/ws.length);
      if(x.l===lang)s+=4;else if(lang==="ru"&&x.l==="en")s+=1;else s-=6;
      if(x.p&&/price|cost|سعر|تكلف|цен/.test(norm(q)))s+=2;
      if(x.c==="treatments"||x.c==="kunooz"||x.c==="packages")s+=1;
      pages.push({x:x,s:s});
    });
    pages.sort(function(a,b){return b.s-a.s});answers.sort(function(a,b){return b.s-a.s});
    if(filter&&filter!=="all"&&filter!=="answers")pages=pages.filter(function(r){return r.x.c===filter});
    if(filter&&filter!=="all"&&filter!=="answers")answers=answers.filter(function(r){return r.x.c===filter});
    return {pages:filter==="answers"?[]:pages.slice(0,12),answers:answers.slice(0,filter==="answers"?12:3)};
  }
  function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function mark(s,q){var t=esc(s);terms(q).slice(0,6).forEach(function(w){if(w.length<3)return;try{t=t.replace(new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>")}catch(e){}});return t}
  function waLink(x,q){var m=lang==="ar"?"مرحباً حياكم 👋\nبحثت عن: «"+q+"»\nأرغب في: "+x.t+(x.p?"\nالسعر التقديري: "+x.p:"")+"\nالصفحة: "+location.origin+x.u:
    lang==="ru"?"Здравствуйте, Hayakkom 👋\nЯ искал(а): «"+q+"»\nМеня интересует: "+x.t+(x.p?"\nЦена: "+x.p:"")+"\nСтраница: "+location.origin+x.u:
    "Hello Hayakkom 👋\nI searched for: “"+q+"”\nI'm interested in: "+x.t+(x.p?"\nIndicative price: "+x.p:"")+"\nPage: "+location.origin+x.u;
    return "https://wa.me/201031567949?text="+encodeURIComponent(m)}
  var CAT={treatments:"🩺",holidays:"🌴",kunooz:"✦",packages:"🎁",guides:"📘",company:"🏛"};
  var css=".hk-s-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid rgba(212,168,67,.6);background:transparent;color:inherit;border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer;line-height:1}"+
  ".hk-s-btn svg{width:16px;height:16px}.hk-s-btn{margin-inline-end:8px}@media (max-width:820px){.hk-s-btn .hk-s-lbl{display:none}.hk-s-btn{padding:7px 9px}}.hk-s-ov{position:fixed;inset:0;z-index:2147483100;background:rgba(6,30,36,.6);backdrop-filter:blur(3px);display:none;align-items:flex-start;justify-content:center;padding:6vh 14px 14px}"+
  ".hk-s-ov.on{display:flex}.hk-s-box{width:min(760px,100%);max-height:86vh;background:#fff;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden;color:#0A2E36}"+
  ".hk-s-top svg{width:22px;height:22px;flex:0 0 22px;color:#a8842f}.hk-s-top{display:flex;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid #EEE7D6}.hk-s-top input{flex:1;border:0;outline:0;font-size:18px;font-family:inherit;color:#0A2E36;background:transparent;min-width:0}"+
  ".hk-s-x{border:0;background:#F2F6F5;border-radius:10px;padding:8px 10px;cursor:pointer;font:inherit;color:#0A2E36}"+
  ".hk-s-top,.hk-s-f{flex:0 0 auto}.hk-s-f button{height:auto;min-height:32px;line-height:1.3}.hk-s-f{display:flex;gap:8px;padding:10px 16px;overflow-x:auto;border-bottom:1px solid #F3EEE2;scrollbar-width:none}.hk-s-f button{flex:0 0 auto;border:1px solid #E6DFCF;background:#FBF8F1;border-radius:999px;padding:6px 12px;font:inherit;font-size:13.5px;cursor:pointer;color:#0A2E36}"+
  ".hk-s-f button[aria-pressed=true]{background:#0A2E36;color:#fff;border-color:#0A2E36}.hk-s-r{overflow-y:auto;padding:8px 10px 16px}"+
  ".hk-s-h{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a8842f;margin:12px 8px 6px;font-weight:700}"+
  ".hk-s-i{display:block;padding:12px;border-radius:12px;text-decoration:none;color:inherit;border:1px solid transparent}.hk-s-i:hover,.hk-s-i:focus-within{background:#FBF8F1;border-color:#EEE5CF}"+
  ".hk-s-i b{display:block;font-size:16px;line-height:1.35}.hk-s-i p{margin:4px 0 0;font-size:14px;line-height:1.55;color:#4A5B5E}.hk-s-i mark{background:#FCEFC7;color:inherit;border-radius:3px}"+
  ".hk-s-m{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center}.hk-s-m span{font-size:12.5px;background:#F2F6F5;border-radius:999px;padding:3px 9px}.hk-s-m .pr{background:#0A2E36;color:#D4A843;font-weight:700}"+
  ".hk-s-m a{font-size:13px;font-weight:700;border-radius:999px;padding:5px 11px;text-decoration:none}.hk-s-m a.o{border:1px solid #0A2E36;color:#0A2E36}.hk-s-m a.q{background:#D4A843;color:#0A2E36}.hk-s-m a.w{background:#25D366;color:#fff}"+
  ".hk-s-a{margin:6px 0;padding:12px;border-radius:12px;background:#F7FAF9;border-inline-start:4px solid #D4A843}.hk-s-a b{display:block;font-size:15px}.hk-s-a p{margin:6px 0 0;font-size:14px;line-height:1.6;color:#33484C}"+
  ".hk-s-chips{display:flex;flex-wrap:wrap;gap:8px;padding:6px 8px}.hk-s-chips button{border:1px dashed #D4A843;background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer;color:#0A2E36}"+
  ".hk-s-none{padding:18px 10px;text-align:center;color:#4A5B5E}.hk-s-inline{display:flex;align-items:center;gap:10px;margin:16px 0 18px;padding:12px 16px;border:1px solid #E6DFCF;border-radius:999px;background:#fff;cursor:text;box-shadow:0 4px 18px rgba(10,46,54,.06);color:#6B7B7E;font-size:15.5px}"+
  ".hk-s-inline svg{width:20px;height:20px;color:#a8842f;flex:0 0 20px}.hk-s-inline kbd{margin-inline-start:auto;font-size:12px;border:1px solid #E6DFCF;border-radius:6px;padding:1px 6px;color:#8a979a}"+
  "@media (max-width:600px){.hk-s-ov{padding:0}.hk-s-box{max-height:100vh;height:100%;border-radius:0}.hk-s-inline kbd{display:none}}";
  var st=document.createElement("style");st.textContent=css;(document.head||document.documentElement).appendChild(st);
  var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var ov,inp,res,filter="all",tq=null;
  function build(){
    ov=document.createElement("div");ov.className="hk-s-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label",T.btn);
    var cats=["all","treatments","holidays","kunooz","packages","guides","answers"];
    ov.innerHTML='<div class="hk-s-box" dir="'+(ar?"rtl":"ltr")+'"><div class="hk-s-top">'+ICON+'<input type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(T.ph)+'" aria-label="'+esc(T.ph)+'"><button type="button" class="hk-s-x">'+esc(T.close)+'</button></div>'+
      '<div class="hk-s-f" role="toolbar">'+cats.map(function(c){return '<button type="button" data-f="'+c+'" aria-pressed="'+(c==="all")+'">'+esc(T[c])+'</button>'}).join("")+'</div><div class="hk-s-r" aria-live="polite"></div></div>';
    document.body.appendChild(ov);inp=ov.querySelector("input");res=ov.querySelector(".hk-s-r");
    ov.addEventListener("click",function(e){if(e.target===ov||e.target.classList.contains("hk-s-x"))close();
      var f=e.target.closest&&e.target.closest("[data-f]");if(f){filter=f.getAttribute("data-f");[].forEach.call(ov.querySelectorAll("[data-f]"),function(b){b.setAttribute("aria-pressed",b===f)});run()}
      var c=e.target.closest&&e.target.closest("[data-sugg]");if(c){inp.value=c.getAttribute("data-sugg");run();inp.focus()}
      var a=e.target.closest&&e.target.closest("a[data-r]");if(a)try{if(typeof window.gtag==="function")window.gtag("event","search_click",{search_term:inp.value,link_url:a.getAttribute("href"),action:a.getAttribute("data-r")})}catch(x){}});
    inp.addEventListener("input",function(){clearTimeout(tq);tq=setTimeout(run,120)});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){var a=res.querySelector("a[data-r=open]");if(a)location.href=a.href}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&ov.classList.contains("on"))close()});
  }
  function empty(){res.innerHTML='<div class="hk-s-h">'+esc(T.pop)+'</div><div class="hk-s-chips">'+T.sugg.map(function(s){return '<button type="button" data-sugg="'+esc(s)+'">'+esc(s)+'</button>'}).join("")+'</div>'}
  var lastLogged="";
  function run(){
    var q=inp.value.trim();if(!q){empty();return}
    load().then(function(){
      var r=search(q,filter),h="";
      if(r.answers.length){h+='<div class="hk-s-h">'+esc(T.answers)+'</div>'+r.answers.map(function(a){var qa=a.x.q[a.i];
        return '<div class="hk-s-a"><b>'+mark(qa[0],q)+'</b><p>'+mark(qa[1],q)+'</p><div class="hk-s-m"><a class="o" data-r="open" href="'+esc(a.x.u)+'">'+esc(T.open)+': '+esc(a.x.t.slice(0,48))+'</a>'+
          '<a class="w" data-r="wa" target="_blank" rel="noopener" href="'+esc(waLink(a.x,q))+'">'+esc(T.wa)+'</a></div></div>'}).join("")}
      if(r.pages.length){h+='<div class="hk-s-h">'+r.pages.length+' '+esc(T.res)+'</div>'+r.pages.map(function(p){var x=p.x;
        return '<div class="hk-s-i"><a data-r="open" href="'+esc(x.u)+'" style="text-decoration:none;color:inherit"><b>'+(CAT[x.c]||"")+' '+mark(x.t,q)+'</b><p>'+mark(x.d,q)+'</p></a><div class="hk-s-m">'+
          (x.p?'<span class="pr">'+esc(x.p)+'</span>':'')+'<span>'+esc(T[x.c]||"")+'</span>'+
          '<a class="q" data-r="quote" href="'+esc(x.u)+'#quote">'+esc(T.quote)+'</a><a class="w" data-r="wa" target="_blank" rel="noopener" href="'+esc(waLink(x,q))+'">'+esc(T.wa)+'</a></div></div>'}).join("")}
      if(!h){var x0={t:q,p:"",u:location.pathname};h='<div class="hk-s-none">'+esc(T.none)+'<div class="hk-s-m" style="justify-content:center"><a class="w" data-r="wa" target="_blank" rel="noopener" href="'+esc(waLink(x0,q))+'">'+esc(T.wa)+'</a><a class="q" data-r="quote" href="#quote">'+esc(T.quote)+'</a></div></div>'}
      res.innerHTML=h;
      if(q.length>2&&q!==lastLogged){lastLogged=q;clearTimeout(window.__hkSqT);window.__hkSqT=setTimeout(function(){try{if(typeof window.gtag==="function")window.gtag("event","search",{search_term:q,results:r.pages.length})}catch(e){}},1200)}
    });
  }
  function open(q){if(!ov)build();ov.classList.add("on");document.documentElement.style.overflow="hidden";load();if(q!=null)inp.value=q;run();setTimeout(function(){inp.focus()},30)}
  function close(){if(ov){ov.classList.remove("on");document.documentElement.style.overflow=""}}
  window.hkSearchOpen=open;
  function addButtons(){
    /* one search button in every header, right before the language switch (visible on phones and desktops) */
    var langs=document.querySelectorAll("a.enlang,a.arlang");
    if(langs.length){[].forEach.call(langs,function(l){var pr=l.previousElementSibling;if(pr&&pr.classList.contains("hk-s-btn"))return;
      var b=document.createElement("button");b.type="button";b.className="hk-s-btn";b.setAttribute("aria-label",T.btn);b.innerHTML=ICON+'<span class="hk-s-lbl">'+esc(T.btn)+'</span>';
      l.parentNode.insertBefore(b,l)})}
    [].forEach.call(document.querySelectorAll(".nav-right"),function(c){if(c.querySelector(".hk-s-btn"))return;
      var b=document.createElement("button");b.type="button";b.className="hk-s-btn";b.setAttribute("aria-label",T.btn);b.innerHTML=ICON;c.insertBefore(b,c.firstChild)});
    [].forEach.call(document.querySelectorAll("[data-hk-search]:not(.hk-s-inline)"),function(el){el.classList.add("hk-s-inline");el.setAttribute("role","button");el.setAttribute("tabindex","0");
      el.innerHTML=ICON+'<span>'+esc(el.getAttribute("data-hk-search")||T.ph)+'</span><kbd>/</kbd>'});
  }
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".hk-s-btn,.hk-s-inline");if(b){e.preventDefault();open(b.getAttribute("data-q"))}});
  document.addEventListener("keydown",function(e){if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||"")&&!(ov&&ov.classList.contains("on"))){e.preventDefault();open()}
    if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("hk-s-inline")){e.preventDefault();open()}});
  var t=null;function later(){clearTimeout(t);t=setTimeout(addButtons,200)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",later);else later();
  try{new MutationObserver(later).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(e){}
  if(/[?&]q=/.test(location.search)&&/\/search\/?$/.test(location.pathname)){var q=decodeURIComponent((location.search.match(/[?&]q=([^&]*)/)||[])[1]||"").replace(/\+/g," ");setTimeout(function(){open(q)},300)}
})();

/* HK-CTA-END: long static pages end with a clear next step after the reader has finished: the page's own enquiry
   form (opened in a panel, so the top form stays the only embedded copy) or WhatsApp with the page named. */
(function(){
  if(window.__hkCtaEnd)return;window.__hkCtaEnd=1;
  function add(){
    var legal=document.querySelector("main .hkp-legal");if(!legal||document.querySelector(".hk-cta-end"))return;
    if(!document.querySelector('iframe[src*="form.jotform.com"],.hk-qf'))return;
    var L=document.documentElement.lang||"",ar=/^ar/.test(L)||/^\/ar(\/|$)/.test(location.pathname),ru=/^ru/.test(L);
    var t=(document.title||"").split(/\s[|–]\s/)[0].trim();
    var tx=ar?["جاهز للخطوة التالية؟","املأ النموذج في دقيقة، ونرسل لك عرض سعر مكتوباً قبل أي دفع. أو راسلنا على واتساب.","📝 احصل على عرض سعر مجاني","واتساب","مرحباً حياكم 👋\nقرأت صفحة «"+t+"» وأرغب في عرض سعر.\n"]:
           ru?["Готовы к следующему шагу?","Заполните заявку за минуту — пришлём письменное предложение до оплаты. Или напишите в WhatsApp.","📝 Получить бесплатный расчёт","WhatsApp","Здравствуйте, Hayakkom 👋\nЯ прочитал(а) «"+t+"» и хочу получить расчёт.\n"]:
              ["Ready for the next step?","Fill in the form in a minute and get a written quote before you pay anything. Or message us on WhatsApp.","📝 Get my free quote","WhatsApp","Hello Hayakkom 👋\nI've just read “"+t+"” and would like a quote.\n"];
    var d=document.createElement("section");d.className="hk-cta-end";d.setAttribute("aria-label",tx[0]);
    d.style.cssText="margin:34px 0 22px;padding:22px 20px;border-radius:18px;background:linear-gradient(135deg,#0A2E36,#06222a);color:#fff;text-align:center;box-shadow:0 18px 40px -18px rgba(10,46,54,.5)";
    d.innerHTML='<strong style="display:block;font-size:22px;color:#D4A843;margin-bottom:6px">'+tx[0]+'</strong><p style="margin:0 auto 16px;max-width:560px;line-height:1.7;opacity:.92">'+tx[1]+'</p>'+
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button type="button" class="hk-cta-end-f" style="border:0;border-radius:999px;padding:13px 22px;background:#D4A843;color:#0A2E36;font:inherit;font-weight:800;cursor:pointer">'+tx[2]+'</button>'+
      '<a class="hk-cta-end-w" target="_blank" rel="noopener" href="https://wa.me/201031567949?text='+encodeURIComponent(tx[4]+location.href)+'" style="border-radius:999px;padding:13px 22px;background:#25D366;color:#fff;font-weight:800;text-decoration:none">'+tx[3]+'</a></div>';
    legal.parentNode.insertBefore(d,legal);
    d.querySelector(".hk-cta-end-f").addEventListener("click",function(){
      try{if(typeof window.gtag==="function")window.gtag("event","cta_end_form",{page_path:location.pathname})}catch(e){}
      if(window.hkEnqOpenForm)window.hkEnqOpenForm();else location.hash="quote"});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add);else add();
})();

/* HK-CONTRAST: the base page styles (".hkp p", "main.arwrap p/h2" with !important) force dark text on every paragraph
   and heading, which also hit text inside dark panels. These rules are more specific, so text on dark panels stays light
   and small gold labels on white stay readable. */
(function(){
  if(window.__hkContrast)return;window.__hkContrast=1;
  var s=document.createElement("style");s.id="hk-contrast";
  s.textContent=
    "html body .bm-sub h2,html body .bm-sub h3,html body main .bm-sub h2,html body main .bm-sub h3{color:#fff!important}"+
    "html body .bm-sub p,html body main .bm-sub p{color:rgba(255,255,255,.88)!important}"+
    "html body .bm-sub .bm-note,html body main .bm-sub p.bm-note{color:rgba(255,255,255,.72)!important}"+
    "html body .bm-sub .bm-kicker{color:#E8C877!important}"+
    "html body .bm-cover h2,html body main .bm-cover h2{color:#fff!important}html body .bm-cover p,html body main .bm-cover p{color:rgba(255,255,255,.9)!important}"+
    "html body .hk-cta-end p,html body main .hk-cta-end p{color:rgba(255,255,255,.9)!important}html body .hk-cta-end strong{color:#D4A843!important}"+
    "html body .hk-qf-h strong,html body main .hk-qf-h strong{color:#D4A843!important}html body .hk-qf-h span,html body main .hk-qf-h span{color:rgba(255,255,255,.88)!important}"+
    "html body .hkg-plan h3{color:#D4A843!important}html body .hkg-plan li,html body .hkg-plan li span,html body .hkg-tot span{color:#fff!important}html body .hkg-tot strong{color:#D4A843!important}html body .hkg-plan small{color:rgba(255,255,255,.75)!important}"+
    "html body .kz-meta .kz-price{color:#D4A843!important}"+
    "html body .bm .bm-lab,html body main .bm-lab,html body .bm-row .bm-lab{color:#8A6A1F!important}"+
    "html body .bm-mast .bm-kicker,html body main .bm-mast .bm-kicker{color:#8A6A1F!important}"+
    "html body .hkg-wa,html body .hk-cta-end-w,html body .hk-s-m a.w{background:#128C4A!important;color:#fff!important}"+
    "html body .hk-tb-share{color:#0A2E36!important}"+
    "html body footer .footer-legal,html body footer .hk-loc{color:rgba(255,255,255,.72)!important}html body footer .footer-legal a,html body footer .footer-legal .cookie-settings-btn,html body footer .ctc-link{color:var(--gold3,#D4A843)!important}";
  (document.head||document.documentElement).appendChild(s);
})();

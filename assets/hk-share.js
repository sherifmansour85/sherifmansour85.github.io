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
    '.hk-take{max-width:1100px;margin:0 auto;padding:34px 5% 30px;text-align:center}' +
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
    if (foot && root && root.contains(foot)) root.parentNode.insertBefore(box, root.nextSibling);
    else if (foot) foot.parentNode.insertBefore(box, foot);
    else document.body.appendChild(box);
    var bi = box.querySelector('.hk-tb-install');
    if (bi) bi.addEventListener('click', function () { openInstall(L, ar); });
    box.querySelector('.hk-tb-share').addEventListener('click', function () { openShare(L, ar); });
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
  var S={};["about","adventure","alexandria","aswan","blog","blog/about-hayakkom-who-we-are","blog/bariatric-surgery-egypt-saudi-patients","blog/cairo-day-trips-guide","blog/cosmetic-surgery-egypt-how-long-before-flying","blog/dental-implants-cost-egypt-saudi-patients","blog/dental-tourism-egypt","blog/hair-transplant-egypt-cost-guide","blog/hair-transplant-egypt-or-turkey","blog/how-long-stay-egypt-medical-treatment","blog/medical-tourism-egypt-gulf","blog/nile-cruise-planning-guide","blog/physiotherapy-sessions-egypt","blog/pre-travel-consultation","blog/questions-before-choosing-clinic-abroad","blog/saudi-insurance-treatment-egypt","business","cairo","calculator","careers","coastal","conferences","contact","cosmetic-surgery","cultural","dental","dentist-urgent","doctor-children","doctor-gp","educational","eyes-lasik","full-checkup","hair-transplant","heritage","holidays","hotel-doctor","how-to-choose","hurghada","luxor","medical","nile-cruise","north-coast","nurse-visit","orthopedics","packages","partners","physiotherapy","privacy","religious","saudi-arabia","saudi-arabia/dammam","saudi-arabia/jeddah","saudi-arabia/riyadh","services","sharm","terms","tourists","travel-guide","video-consultation","vip-trip","weight-loss","wellness","who-we-are"].forEach(function(s){S[s]=1});
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
  var LABELS={whatsapp:'',lead:'',phone:''}; // e.g. lead:'AbCdEfGhIjk' -> sends AW-16686203605/AbCdEfGhIjk
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

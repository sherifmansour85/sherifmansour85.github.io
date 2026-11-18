/* HK-ZARA: Hayakkom's own website assistant (replaces the Jotform AI agent; keeps Zara's picture).
   Loaded on demand by the HK-ZARA stub in hk-share.js when a visitor touches the assistant button.
   - Answers questions from the site's own knowledge base (assets/search-index.json: every page plus its Q&A),
     always linking the page the answer comes from.
   - Takes a short request (what, when, how many, name, WhatsApp, email, country) and sends it, with the whole
     chat, to the Jotform form "Hayakkom Website Chat — Zara" (263213618005044). Its notification email reaches
     support@hayakkom.com and the hourly Hub job adds it to Customers with the chat as the conversation.
   - Rules from agents.md: Hayakkom coordinates; treatment is by licensed medical institutions, trips and stays by
     registered Egyptian tourism companies; prices are indicative, in SAR, excluding flights. */
(function () {
  if (window.__hkZara) return; window.__hkZara = 1;
  var FORM = "https://submit.jotform.com/submit/263213618005044";
  var F = { first: "q2_q2_fullname0[first]", last: "q2_q2_fullname0[last]", phone: "q3_q3_textbox1", email: "q4_q4_email2",
    country: "q5_q5_textbox3", need: "q6_q6_textbox4", details: "q7_q7_textarea5", dates: "q8_q8_textbox6", people: "q9_q9_textbox7",
    lang: "q10_q10_textbox8", page: "q11_q11_textbox9", convo: "q12_q12_textarea10" };
  var AV = "https://images.weserv.nl/?url=le-de.cdn-website.com%2F570f220f41214a5784b09af2ac39327a%2Fdms3rep%2Fmulti%2Fopt%2FCapture-dccf701f-1920w.PNG&w=180&h=180&fit=cover&a=top&q=82&output=webp";
  var AV2 = "https://le-de.cdn-website.com/570f220f41214a5784b09af2ac39327a/dms3rep/multi/opt/Capture-dccf701f-1920w.PNG";
  var WA = "201031567949";
  /* Zara's picture: resized copy first, then the original, then the Hayakkom logo */
  function zaraImg(im) { im.src = AV; im.alt = ""; im.onerror = function () { if (this.src !== AV2 && this.dataset.f !== "1") { this.dataset.f = "1"; this.src = AV2; } else { this.onerror = null; this.src = "/assets/ai-avatar.png"; } }; return im; }
  var L = document.documentElement.lang || "";
  var lang = /^ar/.test(L) || /^\/ar(\/|$)/.test(location.pathname) ? "ar" : /^ru/.test(L) || /^\/ru(\/|$)/.test(location.pathname) ? "ru" : "en";
  var RTL = lang === "ar";
  var T = {
    en: { title: "Zara · Hayakkom", sub: "Instant answers · our team replies within 12 hours",
      hi: "Hi, I'm Zara from Hayakkom 👋 I can answer your questions about treatment and trips in Egypt, or prepare a free personal plan with our team. What are you interested in?",
      opts: [["dental", "🦷 Dental"], ["medical", "🩺 Medical treatment"], ["trip", "🌴 Holiday / trip"], ["vip", "⭐ VIP trip"], ["study", "🎓 Study in Egypt"], ["invest", "📈 Invest in Egypt"], ["ask", "💬 Ask a question"]],
      plan: "Would you like a free personal plan? I only need a few details, and a coordinator will contact you within 12 hours.",
      yes: "Yes, prepare my plan", ask: "I have a question", askQ: "Of course — type your question below.",
      qDetails: "Tell me a little more: which treatment, places or experience do you have in mind?",
      qDates: "When would you like to come? (a month or dates is fine)", qPeople: "How many people are travelling?",
      qName: "What's your full name?", qPhone: "Your WhatsApp number, with country code (e.g. +966 5…)?",
      qEmail: "Your email address? (optional)", skip: "Skip", qCountry: "Which country are you in?",
      countries: ["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Other"],
      badPhone: "That number looks incomplete — please include the country code, e.g. +966 5X XXX XXXX.",
      badEmail: "That email doesn't look right — type it again, or press Skip.",
      done: "Thank you, {n}! ✅ Your request is with our team. A Hayakkom coordinator will contact you on WhatsApp within 12 hours with your personal plan.",
      fail: "I couldn't send that just now. Please message us on WhatsApp so nothing gets lost:",
      more: "Anything else I can help with?", newQ: "Ask another question", waBtn: "Chat on WhatsApp", start: "Start again",
      found: "Here's what I found:", from: "From our page", open: "Open the page",
      price: "Indicative price: {p}, excluding flights.", priceMed: " The final price and treatment plan come from the licensed medical institution after assessment.",
      priceTrip: " Trips and stays are provided by registered Egyptian tourism companies.",
      none: "I don't have an exact answer to that. I can pass your question to our team — they reply within 12 hours.", pass: "Yes, pass it to the team",
      ph: "Type your message…", send: "Send",
      note: "Hayakkom coordinates; treatment is by licensed medical institutions and trips by registered Egyptian tourism companies.",
      privacy: "By sharing your details you agree that Hayakkom may contact you about your request.",
      needs: { dental: "Dental treatment", medical: "Medical treatment", trip: "Holiday / trip", vip: "VIP trip", study: "Study in Egypt", invest: "Invest in Egypt", ask: "Question" },
      q: { dental: "dental treatment implants veneers", medical: "medical treatment surgery", trip: "holiday trip family", vip: "vip trip luxury", study: "study university egypt", invest: "invest business egypt" } },
    ar: { title: "زارا · حياكم", sub: "إجابات فورية · يرد فريقنا خلال 12 ساعة",
      hi: "أهلًا، أنا زارا من حياكم 👋 أجيب عن أسئلتك حول العلاج والرحلات في مصر، أو أجهّز لك خطة شخصية مجانية مع فريقنا. بماذا تهتم؟",
      opts: [["dental", "🦷 الأسنان"], ["medical", "🩺 العلاج الطبي"], ["trip", "🌴 عطلة / رحلة"], ["vip", "⭐ رحلة VIP"], ["study", "🎓 الدراسة في مصر"], ["invest", "📈 الاستثمار في مصر"], ["ask", "💬 عندي سؤال"]],
      plan: "هل تودّ خطة شخصية مجانية؟ أحتاج فقط بعض التفاصيل، وسيتواصل معك منسّق خلال 12 ساعة.",
      yes: "نعم، جهّزوا خطتي", ask: "عندي سؤال", askQ: "بكل سرور — اكتب سؤالك في الأسفل.",
      qDetails: "أخبرني أكثر قليلًا: أي علاج أو أماكن أو تجربة تفكّر بها؟",
      qDates: "متى تودّ القدوم؟ (يكفي الشهر أو التواريخ)", qPeople: "كم عدد المسافرين؟",
      qName: "ما اسمك الكامل؟", qPhone: "رقم واتساب مع رمز الدولة (مثل ‎+966 5…)؟",
      qEmail: "بريدك الإلكتروني؟ (اختياري)", skip: "تخطّي", qCountry: "في أي دولة أنت؟",
      countries: ["السعودية", "الإمارات", "الكويت", "قطر", "البحرين", "عُمان", "أخرى"],
      badPhone: "يبدو الرقم ناقصًا — يرجى كتابته مع رمز الدولة، مثل ‎+966 5X XXX XXXX.",
      badEmail: "يبدو البريد غير صحيح — اكتبه مرة أخرى أو اضغط تخطّي.",
      done: "شكرًا لك يا {n}! ✅ وصل طلبك إلى فريقنا. سيتواصل معك منسّق من حياكم عبر واتساب خلال 12 ساعة بخطتك الشخصية.",
      fail: "تعذّر الإرسال الآن. يرجى مراسلتنا على واتساب حتى لا يضيع طلبك:",
      more: "هل أساعدك في شيء آخر؟", newQ: "سؤال آخر", waBtn: "تواصل عبر واتساب", start: "ابدأ من جديد",
      found: "هذا ما وجدته:", from: "من صفحتنا", open: "افتح الصفحة",
      price: "السعر التقديري: {p}، دون تذاكر الطيران.", priceMed: " السعر النهائي وخطة العلاج تحددهما المنشأة الطبية المرخّصة بعد الفحص.",
      priceTrip: " تقدّم الرحلات والإقامة شركات سياحة مصرية مسجّلة.",
      none: "ليست لديّ إجابة دقيقة على ذلك. يمكنني تحويل سؤالك إلى فريقنا — يردّون خلال 12 ساعة.", pass: "نعم، حوّله للفريق",
      ph: "اكتب رسالتك…", send: "إرسال",
      note: "حياكم جهة تنسيق؛ العلاج تقدّمه منشآت طبية مرخّصة والرحلات شركات سياحة مصرية مسجّلة.",
      privacy: "بمشاركة بياناتك توافق على أن تتواصل معك حياكم بخصوص طلبك.",
      needs: { dental: "علاج الأسنان", medical: "العلاج الطبي", trip: "عطلة / رحلة", vip: "رحلة VIP", study: "الدراسة في مصر", invest: "الاستثمار في مصر", ask: "سؤال" },
      q: { dental: "الأسنان زراعة", medical: "العلاج الطبي", trip: "رحلة عطلة", vip: "VIP", study: "الدراسة", invest: "الاستثمار" } },
    ru: { title: "Зара · Hayakkom", sub: "Мгновенные ответы · команда ответит в течение 12 часов",
      hi: "Здравствуйте, я Зара из Hayakkom 👋 Отвечу на вопросы о лечении и поездках в Египет или подготовлю с командой бесплатный личный план. Что вас интересует?",
      opts: [["dental", "🦷 Стоматология"], ["medical", "🩺 Лечение"], ["trip", "🌴 Отдых / экскурсии"], ["ask", "💬 Задать вопрос"]],
      plan: "Подготовить бесплатный личный план? Нужны лишь несколько деталей — координатор свяжется с вами в течение 12 часов.",
      yes: "Да, подготовьте план", ask: "У меня вопрос", askQ: "Конечно — напишите вопрос ниже.",
      qDetails: "Расскажите подробнее: какое лечение, места или впечатления вас интересуют?",
      qDates: "Когда вы хотели бы приехать? (месяц или даты)", qPeople: "Сколько человек поедет?",
      qName: "Как вас зовут (полное имя)?", qPhone: "Ваш номер WhatsApp с кодом страны?",
      qEmail: "Ваш email? (необязательно)", skip: "Пропустить", qCountry: "В какой стране вы находитесь?",
      countries: ["Россия", "Казахстан", "Украина", "ОАЭ", "Другая"],
      badPhone: "Номер выглядит неполным — укажите код страны.", badEmail: "Email выглядит неверно — введите снова или нажмите «Пропустить».",
      done: "Спасибо, {n}! ✅ Ваша заявка у нашей команды. Координатор Hayakkom свяжется с вами в WhatsApp в течение 12 часов.",
      fail: "Не удалось отправить. Напишите нам в WhatsApp, чтобы ничего не потерялось:",
      more: "Чем ещё могу помочь?", newQ: "Задать другой вопрос", waBtn: "Написать в WhatsApp", start: "Начать заново",
      found: "Вот что я нашла:", from: "Со страницы", open: "Открыть страницу",
      price: "Ориентировочная цена: {p}, без перелёта.", priceMed: " Окончательную цену и план лечения определяет лицензированное медучреждение после осмотра.",
      priceTrip: " Поездки и проживание предоставляют зарегистрированные египетские туркомпании.",
      none: "Точного ответа у меня нет. Могу передать вопрос команде — ответят в течение 12 часов.", pass: "Да, передайте команде",
      ph: "Напишите сообщение…", send: "Отправить",
      note: "Hayakkom — координатор; лечение проводят лицензированные медучреждения, поездки — зарегистрированные туркомпании.",
      privacy: "Отправляя данные, вы соглашаетесь, что Hayakkom свяжется с вами по заявке.",
      needs: { dental: "Стоматология", medical: "Лечение", trip: "Отдых / экскурсии", ask: "Вопрос" },
      q: { dental: "стоматология виниры импланты", medical: "лечение", trip: "отдых экскурсии" } }
  }[lang];

  /* ---------- state (kept for the browser tab, so a refresh doesn't lose the chat) ---------- */
  var KEY = "hk-zara-v1", S;
  try { S = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
  function fresh() { return { lang: lang, log: [], step: null, lead: {}, sent: false, need: "" }; }
  if (!S || S.lang !== lang) S = fresh();
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- UI ---------- */
  var panel = document.getElementById("hkAiPanel"); if (!panel) return;
  var css = document.createElement("style");
  css.textContent =
    "#hkAiPanel .ai-own-head{gap:10px;justify-content:flex-start}" +
    "#hkAiPanel .zr-hav{width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:top;flex:none;border:2px solid #C9A43D}" +
    "#hkAiPanel .zr-ht{display:flex;flex-direction:column;line-height:1.25;min-width:0;flex:1}#hkAiPanel .zr-ht b{font-size:15px}#hkAiPanel .zr-ht small{font-size:11.5px;opacity:.8}" +
    "#hkAiPanel .ai-own-body{flex:1;display:flex;flex-direction:column;min-height:0;background:#F4F8F7}" +
    ".zr-msgs{flex:1;overflow-y:auto;padding:14px 12px 6px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}" +
    ".zr-row{display:flex;gap:7px;align-items:flex-end;max-width:92%}.zr-row.me{align-self:flex-end;flex-direction:row-reverse}" +
    ".zr-row img{width:28px;height:28px;border-radius:50%;object-fit:cover;object-position:top;flex:none}" +
    ".zr-b{background:#fff;color:#173B44;border-radius:14px 14px 14px 4px;padding:9px 12px;font-size:14px;line-height:1.5;box-shadow:0 1px 2px rgba(10,46,54,.08);white-space:pre-wrap;overflow-wrap:anywhere;unicode-bidi:plaintext;text-align:start}" +
    ".zr-row.me .zr-b{background:#0B6B73;color:#fff;border-radius:14px 14px 4px 14px}" +
    "[dir=rtl] .zr-b{border-radius:14px 14px 4px 14px}[dir=rtl] .zr-row.me .zr-b{border-radius:14px 14px 14px 4px}" +
    ".zr-b a{color:#0B6B73;font-weight:600}.zr-row.me .zr-b a{color:#fff}.zr-b small{display:block;color:#4B656C;font-size:12px;margin-top:4px}" +
    ".zr-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 12px 8px}" +
    ".zr-chips button,.zr-chips a{border:1px solid #0B6B73;background:#fff;color:#0B6B73;border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer;text-decoration:none;line-height:1.2}" +
    ".zr-chips button:hover,.zr-chips a:hover{background:#0B6B73;color:#fff}.zr-chips .zr-wa{border-color:#25D366;color:#128C4B}.zr-chips .zr-wa:hover{background:#25D366;color:#fff}" +
    ".zr-in{display:flex;gap:6px;padding:8px 10px;border-top:1px solid #DCE7E5;background:#fff}" +
    ".zr-in input{flex:1;min-width:0;border:1px solid #C9D9D7;border-radius:10px;padding:10px 12px;font:inherit;font-size:16px;color:#173B44;background:#fff}" +
    ".zr-in input:focus{outline:2px solid #0B6B73;outline-offset:0;border-color:#0B6B73}" +
    ".zr-in button{border:0;border-radius:10px;background:#B8922A;color:#0A2E36;padding:0 14px;font:inherit;font-weight:700;cursor:pointer}" +
    ".zr-foot{font-size:10.5px;color:#6A8389;padding:0 12px 8px;background:#fff;line-height:1.4}" +
    ".zr-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#9DB2B6;animation:zrb 1s infinite}" +
    ".zr-typing span:nth-child(2){animation-delay:.15s}.zr-typing span:nth-child(3){animation-delay:.3s}" +
    "body.hk-ai-open #hkInst{display:none!important}" +
    "@keyframes zrb{0%,80%,100%{opacity:.3}40%{opacity:1}}@media (prefers-reduced-motion:reduce){.zr-typing span{animation:none}}";
  document.head.appendChild(css);

  panel.setAttribute("dir", RTL ? "rtl" : "ltr");
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", T.title);
  var head = panel.querySelector(".ai-own-head"), title = document.getElementById("hkAiTitle");
  if (head && title) {
    var hav = zaraImg(document.createElement("img")); hav.className = "zr-hav";
    var ht = document.createElement("span"); ht.className = "zr-ht"; ht.id = "hkAiTitle";
    ht.innerHTML = "<b></b><small></small>"; ht.firstChild.textContent = T.title; ht.lastChild.textContent = T.sub;
    head.insertBefore(hav, head.firstChild); title.replaceWith(ht);
  }
  var body = panel.querySelector(".ai-own-body") || panel;
  body.innerHTML = '<div class="zr-msgs" role="log" aria-live="polite"></div><div class="zr-chips"></div>' +
    '<form class="zr-in" autocomplete="on"><input type="text" enterkeyhint="send" maxlength="600"><button type="submit"></button></form><div class="zr-foot"></div>';
  var box = body.querySelector(".zr-msgs"), chipBox = body.querySelector(".zr-chips"), form = body.querySelector(".zr-in"),
    input = form.querySelector("input"), sendBtn = form.querySelector("button");
  input.placeholder = T.ph; input.setAttribute("aria-label", T.ph); sendBtn.textContent = T.send;
  body.querySelector(".zr-foot").textContent = T.note;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function avatar() { return zaraImg(document.createElement("img")); }
  function render(m) {
    var row = document.createElement("div"); row.className = "zr-row" + (m.me ? " me" : "");
    if (!m.me) row.appendChild(avatar());
    var b = document.createElement("div"); b.className = "zr-b";
    if (m.html) b.innerHTML = m.html; else b.textContent = m.text;
    row.appendChild(b); box.appendChild(row); box.scrollTop = box.scrollHeight;
  }
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return (d.innerText || d.textContent || "").trim(); }
  function bot(text, html) { var m = { text: text || plain(html), html: html || null }; S.log.push(m); save(); render(m); }
  function me(text) { var m = { me: 1, text: text }; S.log.push(m); save(); render(m); }
  function typing(ms, fn) {
    var row = document.createElement("div"); row.className = "zr-row"; row.appendChild(avatar());
    var b = document.createElement("div"); b.className = "zr-b zr-typing"; b.setAttribute("aria-hidden", "true");
    b.innerHTML = "<span></span><span></span><span></span>"; row.appendChild(b);
    box.appendChild(row); box.scrollTop = box.scrollHeight;
    setTimeout(function () { row.remove(); fn(); }, ms);
  }
  function waLink(extra) {
    var t = (lang === "ar" ? "مرحبًا حياكم، " : "Hello Hayakkom, ") + (extra || S.need || "");
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(t.trim());
  }
  function chips(list) {
    chipBox.innerHTML = ""; S.chips = list.map(function (c) { return { l: c[0], k: c[1] }; }); save();
    list.forEach(function (c) {
      var el;
      if (c[1] === "wa") { el = document.createElement("a"); el.className = "zr-wa"; el.href = waLink(); el.target = "_blank"; el.rel = "noopener"; el.textContent = "💬 " + c[0]; }
      else { el = document.createElement("button"); el.type = "button"; el.textContent = c[0]; el.addEventListener("click", function () { pick(c[1], c[0]); }); }
      chipBox.appendChild(el);
    });
  }

  /* ---------- knowledge base: assets/search-index.json ---------- */
  var IDX = null, idxP = null;
  function loadIdx() {
    if (!idxP) idxP = fetch("/assets/search-index.json", { cache: "force-cache" }).then(function (r) { return r.json(); })
      .then(function (d) { IDX = d; return d; }).catch(function () { IDX = []; return IDX; });
    return idxP;
  }
  function norm(s) { return (s || "").toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s]/gu, " "); }
  var STOP = { the: 1, and: 1, for: 1, you: 1, your: 1, are: 1, can: 1, how: 1, what: 1, with: 1, does: 1, have: 1, from: 1, this: 1, that: 1, there: 1, egypt: 1, hayakkom: 1,
    "في": 1, "من": 1, "علي": 1, "هل": 1, "ما": 1, "كيف": 1, "عن": 1, "الي": 1, "مع": 1, "مصر": 1, "حياكم": 1, "как": 1, "что": 1, "для": 1, "это": 1, "египет": 1 };
  var SYN = { teeth: "dental", tooth: "dental", dentist: "dental", veneer: "veneers", implant: "implants", smile: "hollywood dental", hair: "hair transplant",
    sleeve: "weight loss", obesity: "weight loss", lasik: "eyes lasik", cruise: "nile cruise", beach: "sharm hurghada red sea", kids: "family children",
    price: "price cost sar", cost: "price cost sar", much: "price cost", "سعر": "سعر تكلفه ريال", "كم": "سعر تكلفه", "اسنان": "الاسنان", "سن": "الاسنان",
    "شعر": "زراعه الشعر", "تكميم": "السمنه", "نيل": "نيليه", "بحر": "شرم الغردقه", "تاشيره": "التاشيره", "فيزا": "التاشيره" };
  function toks(s) {
    var out = [];
    norm(s).split(/\s+/).forEach(function (w) {
      if (!w || STOP[w]) return;
      if (w.length < 3 && !/^\d+$/.test(w) && !SYN[w]) return;
      out.push(w); if (SYN[w]) norm(SYN[w]).split(/\s+/).forEach(function (x) { if (x) out.push(x); });
      if (w.length > 4 && /^ال/.test(w)) out.push(w.slice(2));
    });
    return out;
  }
  function score(qt, text) {
    var t = " " + norm(text) + " ", s = 0;
    qt.forEach(function (w) { if (t.indexOf(" " + w) >= 0) s += w.length > 5 ? 2 : 1; });
    return s;
  }
  function find(q) {
    var qt = toks(q); if (!qt.length || !IDX) return null;
    var best = null;
    IDX.forEach(function (p) {
      var lb = p.l === lang ? 1.5 : (lang === "ru" && p.l === "en" ? 0.6 : 0);
      if (!lb) return;
      var ps = score(qt, (p.t || "") + " " + (p.h || "") + " " + (p.k || ""));
      (p.q || []).forEach(function (qa) {
        var s = (score(qt, qa[0]) * 2 + score(qt, qa[1]) * 0.5 + ps * 0.3) * lb;
        if (!best || s > best.s) best = { s: s, p: p, qa: qa };
      });
      var s2 = (ps * 1.2 + score(qt, p.d || "") * 0.6) * lb;
      if (!best || s2 > best.s) best = { s: s2, p: p, qa: null };
    });
    return best && best.s >= Math.max(2.5, qt.length * 0.9) ? best : null;
  }
  function priceLine(p) {
    if (!p.p) return "";
    return T.price.replace("{p}", p.p) + (p.c === "treatments" ? T.priceMed : T.priceTrip);
  }
  function pageCard(p) {
    return "<b>" + esc(p.h || p.t) + "</b>\n" + esc(p.d || "") + (p.p ? "\n" + esc(priceLine(p)) : "") + '<small><a href="' + esc(p.u) + '">' + esc(T.open) + " →</a></small>";
  }
  function answer(q) {
    loadIdx().then(function () {
      var hit = find(q);
      if (!hit) { S.pending = q; save(); bot(T.none); chips([[T.pass, "passq"], [T.newQ, "ask"], [T.waBtn, "wa"]]); return; }
      var p = hit.p;
      if (hit.qa) bot(null, esc(hit.qa[1]) + "<small>" + esc(T.from) + ': <a href="' + esc(p.u) + '">' + esc(p.h || p.t) + "</a></small>");
      else bot(null, esc(T.found) + "\n" + pageCard(p));
      if (!S.need) { S.need = q.slice(0, 80); save(); }
      chips(S.sent ? [[T.newQ, "ask"], [T.waBtn, "wa"]] : [[T.yes, "lead"], [T.newQ, "ask"], [T.waBtn, "wa"]]);
    });
  }

  /* ---------- request (lead) flow ---------- */
  var STEPS = ["details", "dates", "people", "name", "phone", "email", "country"];
  function ask(step) {
    S.step = step; save();
    var t = { details: T.qDetails, dates: T.qDates, people: T.qPeople, name: T.qName, phone: T.qPhone, email: T.qEmail, country: T.qCountry }[step];
    typing(450, function () {
      bot(t);
      if (step === "email") chips([[T.skip, "skip"]]);
      else if (step === "country") chips(T.countries.map(function (c) { return [c, "c:" + c]; }));
      else if (step === "people") chips([["1", "n:1"], ["2", "n:2"], ["3–4", "n:3–4"], ["5+", "n:5+"]]);
      else chips([]);
      input.type = step === "email" ? "email" : step === "phone" ? "tel" : "text";
      input.autocomplete = { name: "name", phone: "tel", email: "email", country: "country-name" }[step] || "off";
      try { input.focus({ preventScroll: true }); } catch (e) {}
    });
  }
  function nextStep() { var i = STEPS.indexOf(S.step); if (i >= 0 && i < STEPS.length - 1) ask(STEPS[i + 1]); else finish(); }
  function takeAnswer(v) {
    var st = S.step;
    if (st === "phone") {
      var d = v.replace(/[^\d+]/g, "");
      if (d.replace(/\D/g, "").length < 8) { bot(T.badPhone); return; }
      S.lead.phone = d;
    } else if (st === "email") {
      if (v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { bot(T.badEmail); chips([[T.skip, "skip"]]); return; }
      S.lead.email = v;
    } else S.lead[st] = v;
    save(); nextStep();
  }
  function transcript() { return S.log.map(function (m) { return (m.me ? "Visitor: " : "Zara: ") + m.text; }).join("\n").slice(0, 15000); }
  function send(final) {
    var ld = S.lead, fd = new FormData(), nm = (ld.name || "").trim().split(/\s+/);
    fd.append(F.first, nm.shift() || ""); fd.append(F.last, nm.join(" "));
    fd.append(F.phone, ld.phone || ""); fd.append(F.email, ld.email || ""); fd.append(F.country, ld.country || "");
    fd.append(F.need, S.need || ""); fd.append(F.details, (ld.details || "") + (S.pending && S.pending !== ld.details ? (ld.details ? "\n" : "") + "Question: " + S.pending : ""));
    fd.append(F.dates, ld.dates || ""); fd.append(F.people, ld.people || ""); fd.append(F.lang, lang);
    fd.append(F.page, location.pathname + (final ? "" : " (chat closed before the end)")); fd.append(F.convo, transcript());
    fd.append("formID", "263213618005044"); fd.append("simple_spc", "263213618005044-263213618005044"); fd.append("website", "");
    return fetch(FORM, { method: "POST", mode: "no-cors", body: fd, keepalive: !final });
  }
  function finish() {
    S.step = null; save(); chips([]);
    typing(700, function () {
      send(true).then(function () {
        S.sent = true; save();
        bot(T.done.replace("{n}", (S.lead.name || "").split(/\s+/)[0] || ""));
        typing(400, function () { bot(T.more); chips([[T.newQ, "ask"], [T.waBtn, "wa"]]); });
      }).catch(function () {
        bot(null, esc(T.fail) + ' <a href="' + esc(waLink(S.need + " — " + (S.lead.name || ""))) + '" target="_blank" rel="noopener">WhatsApp</a>');
        chips([[T.waBtn, "wa"]]);
      });
    });
  }
  function startLead() { bot(T.privacy); if (S.lead.details) { S.step = "details"; nextStep(); } else ask("details"); }

  /* ---------- input handling ---------- */
  function pick(k, label) {
    if (k === "restart") { S = fresh(); save(); box.innerHTML = ""; chips([]); typing(300, greet); return; }
    me(label);
    if (k === "skip") { S.lead.email = ""; save(); nextStep(); return; }
    if (/^[cn]:/.test(k)) { takeAnswer(k.slice(2)); return; }
    if (k === "lead") { startLead(); return; }
    if (k === "ask") { S.step = null; save(); chips([]); typing(300, function () { bot(T.askQ); try { input.focus({ preventScroll: true }); } catch (e) {} }); return; }
    if (k === "passq") { S.need = S.need || T.needs.ask; S.lead.details = S.pending || ""; save(); startLead(); return; }
    if (T.needs[k]) {
      S.need = T.needs[k]; save();
      loadIdx().then(function () {
        var hit = find(T.q[k] || T.needs[k]);
        typing(500, function () {
          if (hit) bot(null, pageCard(hit.p));
          typing(400, function () { bot(T.plan); chips([[T.yes, "lead"], [T.ask, "ask"], [T.waBtn, "wa"]]); });
        });
      });
    }
  }
  function greet() { bot(T.hi); chips(T.opts.map(function (o) { return [o[1], o[0]]; })); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v && S.step !== "email") return;
    input.value = ""; me(v || T.skip); chips([]);
    if (S.step) { takeAnswer(v); return; }
    typing(500, function () { answer(v); });
  });
  /* the visitor closes the panel or leaves after giving a WhatsApp number but before the end: still send what we have */
  function partial() { if (!S.sent && S.lead.phone && !S.partialSent) { S.partialSent = true; save(); send(false).catch(function () {}); } }
  var x = document.getElementById("hkAiX"); if (x) x.addEventListener("click", partial);
  window.addEventListener("pagehide", partial);

  /* ---------- start ---------- */
  if (S.log.length) {
    S.log.forEach(render);
    if (S.step) ask(S.step);
    else if (S.chips && S.chips.length) chips(S.chips.map(function (c) { return [c.l, c.k]; }));
    else chips([[T.newQ, "ask"], [T.waBtn, "wa"], [T.start, "restart"]]);
  } else typing(500, greet);
  loadIdx();
})();

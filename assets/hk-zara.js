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
  /* The AI Zara (Claude Managed Agents) through Hayakkom's Cloudflare relay, which holds the key. Empty = the built-in
     assistant below answers everything. If the relay fails or times out, the built-in assistant answers that message. */
  var AI_URL = "https://zara.sherif-mansour-85.workers.dev/";
  /* Zara's picture: resized copy first, then the original, then the Hayakkom logo */
  function zaraImg(im) { im.src = AV; im.alt = ""; im.onerror = function () { if (this.src !== AV2 && this.dataset.f !== "1") { this.dataset.f = "1"; this.src = AV2; } else { this.onerror = null; this.src = "/assets/ai-avatar.png"; } }; return im; }
  var L = document.documentElement.lang || "";
  var lang = /^ar/.test(L) || /^\/ar(\/|$)/.test(location.pathname) ? "ar" : /^ru/.test(L) || /^\/ru(\/|$)/.test(location.pathname) ? "ru" : "en";
  /* the visitor's own choice on the AR | EN | RU toggle wins over the page language */
  var KEY = "hk-zara-v1", S;
  try { S = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
  if (S && /^(ar|en|ru)$/.test(S.lang)) lang = S.lang;
  var RTL = lang === "ar";
  var TT = {
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
  };
  var T = TT[lang];

  /* ---------- state (kept for the browser tab, so a refresh doesn't lose the chat) ---------- */
  function fresh() { return { lang: lang, log: [], step: null, lead: {}, sent: false, need: "", voice: false }; }
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
    "#hkAiPanel .zr-ctl{display:flex;gap:5px;align-items:center;flex:none}" +
    "#hkAiPanel .zr-lgrow{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#EAF3F2;border-bottom:1px solid #D3E4E1;flex:none}" +
    "#hkAiPanel .zr-lgl{font-size:12.5px;font-weight:700;color:#173B44;white-space:nowrap;flex:none}" +
    "#hkAiPanel .zr-lg{display:flex;gap:6px;flex:1;min-width:0}" +
    "#hkAiPanel .zr-lg button{flex:1;min-height:34px;background:#fff;color:#0B6B73;border:1.5px solid #0B6B73;border-radius:999px;padding:4px 6px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;line-height:1.1;white-space:nowrap}" +
    "#hkAiPanel .zr-lg button[aria-pressed=true]{background:#0B6B73;color:#fff}" +
    "#hkAiPanel .zr-lg button[aria-pressed=true]::before{content:'\\2713  '}" +
    "#hkAiPanel .zr-spk{background:transparent;border:1px solid rgba(255,255,255,.55);color:inherit;border-radius:50%;width:30px;height:30px;padding:0;cursor:pointer;font-size:14px;line-height:1}" +
    "#hkAiPanel .zr-spk[aria-pressed=true]{background:#C9A43D;border-color:#C9A43D}" +
    ".zr-in{position:relative}" +
    ".zr-in .zr-mic{background:#E3EFEE;color:#0B6B73;padding:0 12px;font-size:18px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:transform .15s ease}" +
    ".zr-in .zr-mic.on{background:#C0392B;color:#fff;transform:scale(1.25);box-shadow:0 0 0 6px rgba(192,57,43,.18);z-index:2}" +
    ".zr-rec[hidden]{display:none!important}" +
    ".zr-ph{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:-2px -4px 0}.zr-ph a{display:block}.zr-ph img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;display:block;background:#E3EFEE}" +
    ".zr-rec{position:absolute;inset:8px 0 8px 10px;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #F1C9C4;border-radius:10px;padding:0 12px;font-size:14px;color:#173B44;z-index:1;right:auto;width:calc(100% - 130px)}" +
    "[dir=rtl] .zr-rec{inset:8px 10px 8px 0;left:auto}" +
    ".zr-rec .zr-dot{width:10px;height:10px;border-radius:50%;background:#C0392B;animation:zrp 1s infinite;flex:none}" +
    ".zr-rec .zr-tm{font-variant-numeric:tabular-nums;font-weight:700;flex:none}.zr-rec .zr-sl{color:#6A8389;font-size:12.5px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}" +
    ".zr-rec.zr-cx{border-color:#C0392B}.zr-rec.zr-cx .zr-sl{color:#C0392B;font-weight:700}" +
    ".zr-recording button[type=submit]{visibility:hidden}" +
    "@keyframes zrp{50%{opacity:.35}}" +
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
  /* AR | EN | RU toggle and the read-aloud speaker, in the header next to the close button */
  var ctl = document.createElement("span"); ctl.className = "zr-ctl";
  ctl.innerHTML = '<button type="button" class="zr-spk"></button>';
  /* language switch: its own row under the header, full names, bilingual label, the chosen one filled with a tick */
  var lgRow = document.createElement("div"); lgRow.className = "zr-lgrow";
  lgRow.innerHTML = '<span class="zr-lgl">🌐 اللغة · Language</span><span class="zr-lg" role="group"><button type="button" data-l="ar" lang="ar">العربية</button><button type="button" data-l="en" lang="en">English</button><button type="button" data-l="ru" lang="ru">Русский</button></span>';
  if (head && head.parentNode) head.parentNode.insertBefore(lgRow, head.nextSibling); else panel.insertBefore(lgRow, panel.firstChild);
  if (head) { var xb = document.getElementById("hkAiX"); if (xb && xb.parentNode === head) head.insertBefore(ctl, xb); else head.appendChild(ctl); }
  var spk = ctl.querySelector(".zr-spk");
  var body = panel.querySelector(".ai-own-body") || panel;
  body.innerHTML = '<div class="zr-msgs" role="log" aria-live="polite"></div><div class="zr-chips"></div>' +
    '<form class="zr-in" autocomplete="on"><input type="text" enterkeyhint="send" maxlength="600"><button type="button" class="zr-mic" hidden>🎙️</button><button type="submit"></button></form><div class="zr-foot"></div>';
  var box = body.querySelector(".zr-msgs"), chipBox = body.querySelector(".zr-chips"), form = body.querySelector(".zr-in"),
    input = form.querySelector("input"), sendBtn = form.querySelector("button[type=submit]"), mic = form.querySelector(".zr-mic");
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
  function bot(text, html) { var m = { text: text || plain(html), html: html || null }; S.log.push(m); save(); render(m); speak(m.text); }
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

  /* ---------- voice: free, built into the visitor's browser (speech in Arabic, English and Russian) ----------
     🎙️ listens with the browser's speech recognition (Chrome, Edge, Safari; hidden where unsupported, e.g. Firefox);
     🔊 reads Zara's replies aloud with the device's own voice. Nothing is recorded or sent anywhere by this script. */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, synth = window.speechSynthesis || null;
  var LOC = { ar: "ar-SA", en: "en-US", ru: "ru-RU" };
  var VT = {
    en: { mic: "Hold to talk, release to send", stop: "Recording — release to send", on: "Read answers aloud: on", off: "Read answers aloud: off", lg: "Language",
          slide: "‹ Slide to cancel", hold: "Hold 🎙️ to record, release to send", none: "I didn't catch that — hold 🎙️ and speak a little longer.",
          den: "I can't hear you — please allow the microphone for this site in your browser settings, or type your message." },
    ar: { mic: "اضغط مطوّلًا للتحدث، وارفع إصبعك للإرسال", stop: "جارٍ التسجيل — ارفع إصبعك للإرسال", on: "قراءة الإجابات بصوت: مفعّلة", off: "قراءة الإجابات بصوت: متوقفة", lg: "اللغة",
          slide: "اسحب للإلغاء ›", hold: "اضغط مطوّلًا على 🎙️ للتسجيل، وارفع إصبعك للإرسال", none: "لم أسمعك جيدًا — اضغط مطوّلًا على 🎙️ وتحدّث لفترة أطول قليلًا.",
          den: "لا أستطيع سماعك — اسمح باستخدام الميكروفون لهذا الموقع من إعدادات المتصفح، أو اكتب رسالتك." },
    ru: { mic: "Удерживайте, чтобы говорить; отпустите, чтобы отправить", stop: "Запись — отпустите, чтобы отправить", on: "Читать ответы вслух: вкл.", off: "Читать ответы вслух: выкл.", lg: "Язык",
          slide: "‹ Сдвиньте для отмены", hold: "Удерживайте 🎙️ для записи, отпустите для отправки", none: "Я не расслышала — удерживайте 🎙️ и говорите чуть дольше.",
          den: "Я вас не слышу — разрешите доступ к микрофону для этого сайта или напишите сообщение." }
  };
  if (synth) { try { synth.getVoices(); synth.onvoiceschanged = function () { synth.getVoices(); }; } catch (e) { synth = null; } }
  function pickVoice() {
    var vs = []; try { vs = synth.getVoices() || []; } catch (e) {}
    var want = LOC[lang].toLowerCase(), pre = lang;
    function l(v) { return (v.lang || "").replace("_", "-").toLowerCase(); }
    return vs.filter(function (v) { return l(v) === want; })[0] || vs.filter(function (v) { return l(v).indexOf(pre) === 0; })[0] || null;
  }
  function sayable(t) {
    return String(t || "").replace(/https?:\/\/\S+/g, " ").replace(/[\u{1F000}-\u{1FFFF}☀-➿️→]/gu, " ")
      .replace(/\+?\d[\d\s]{7,}\d/g, function (n) { return n.replace(/\s+/g, "").split("").join(" "); }).replace(/\s+/g, " ").trim();
  }
  function speak(t) {
    if (!S.voice || !synth) return;
    var s = sayable(t); if (!s) return;
    try {
      var u = new SpeechSynthesisUtterance(s.slice(0, 1200)); u.lang = LOC[lang];
      var v = pickVoice(); if (v) u.voice = v; u.rate = lang === "ar" ? 0.95 : 1;
      synth.speak(u);
    } catch (e) {}
  }
  function hush() { if (synth) try { synth.cancel(); } catch (e) {} }
  function setVoice(on) {
    S.voice = !!on; save(); if (!on) hush();
    spk.textContent = on ? "🔊" : "🔇"; spk.setAttribute("aria-pressed", on ? "true" : "false");
    spk.title = VT[lang][on ? "on" : "off"]; spk.setAttribute("aria-label", spk.title);
  }
  if (!synth) spk.hidden = true;
  spk.addEventListener("click", function () { setVoice(!S.voice); if (S.voice) { var last = S.log.filter(function (m) { return !m.me; }).pop(); if (last) speak(last.text); } });
  /* Hold-to-talk, like a WhatsApp voice note: press and hold 🎙️ → "recording" bar with a timer;
     release → what was said is sent; slide away (toward the text box) → cancelled. A quick tap shows how to use it.
     Space/Enter held on the focused button does the same for keyboard users. */
  var rec = null, listening = false, holding = false, cancelled = false, heard = "", interim = "", t0 = 0, tick = 0, sx = 0, gotSome = false;
  var recBar = document.createElement("div"); recBar.className = "zr-rec"; recBar.hidden = true; recBar.setAttribute("aria-live", "polite");
  recBar.innerHTML = '<span class="zr-dot"></span><span class="zr-tm">0:00</span><span class="zr-sl"></span>';
  form.insertBefore(recBar, form.firstChild);
  function micUi(on) {
    listening = on; mic.classList.toggle("on", on); mic.setAttribute("aria-pressed", on ? "true" : "false");
    mic.title = VT[lang][on ? "stop" : "mic"]; mic.setAttribute("aria-label", mic.title);
    recBar.hidden = !on; form.classList.toggle("zr-recording", on);
    if (on) { recBar.querySelector(".zr-sl").textContent = VT[lang].slide; recBar.classList.remove("zr-cx"); }
  }
  function clock() { var s = Math.floor((Date.now() - t0) / 1000); if (holding && s >= 60) { release(false); return; } recBar.querySelector(".zr-tm").textContent = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function startRec() {
    rec = new SR(); rec.lang = LOC[lang]; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
    rec.onresult = function (e) {
      interim = "";
      for (var i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) heard += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript; }
      gotSome = true;
    };
    rec.onerror = function (e) {
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") { holding = false; cancelled = true; finishRec(); bot(VT[lang].den); }
    };
    rec.onend = function () {
      if (holding && !cancelled) { try { startRec(); } catch (e) {} return; }  /* the browser stopped early: keep recording while the finger is down */
      finishRec();
    };
    rec.start();
  }
  function press(e) {
    if (!SR || listening) return;
    if (e && e.pointerId != null) { try { mic.setPointerCapture(e.pointerId); } catch (x) {} sx = e.clientX; }
    if (e && e.preventDefault) e.preventDefault();
    hush(); if (!S.voice && synth) setVoice(true);   /* someone who talks usually wants to hear the answer */
    holding = true; cancelled = false; heard = ""; interim = ""; gotSome = false; t0 = Date.now();
    try { startRec(); } catch (x) { holding = false; return; }
    micUi(true); clock(); tick = setInterval(clock, 250);
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (x) {}
  }
  function release(cancel) {
    if (!holding) return;
    holding = false; cancelled = !!cancel; clearInterval(tick);
    var short = Date.now() - t0 < 400;
    if (short && !cancel) { cancelled = true; }
    try { if (cancelled) rec.abort(); else rec.stop(); } catch (x) { finishRec(); }
    if (short && !cancel) { micUi(false); typing(200, function () { bot(VT[lang].hold); }); }
    /* safety net: some phones never report the end of listening — never leave the recording bar on screen */
    setTimeout(function () { if (listening && !holding) finishRec(); }, 2500);
  }
  function finishRec() {
    if (!listening) return;   /* already finished (each recording is sent at most once) */
    var said = (heard + " " + interim).replace(/\s+/g, " ").trim(), wasCancelled = cancelled;
    clearInterval(tick); micUi(false); heard = ""; interim = "";
    if (wasCancelled) return;
    if (!said) { bot(VT[lang].none); return; }
    input.value = said;
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true }));
  }
  if (SR) {
    mic.hidden = false; micUi(false);
    mic.addEventListener("pointerdown", press);
    mic.addEventListener("pointerup", function () { release(false); });
    mic.addEventListener("pointercancel", function () { release(true); });
    /* the finger can lift somewhere else — e.g. on the microphone-permission popup the first time — so listen everywhere */
    window.addEventListener("pointerup", function () { if (holding) release(false); }, true);
    window.addEventListener("blur", function () { if (holding) release(false); });
    document.addEventListener("visibilitychange", function () { if (document.hidden && holding) release(true); });
    recBar.addEventListener("pointerdown", function (e) { e.preventDefault(); if (holding) release(true); else if (listening) { cancelled = true; finishRec(); } });
    mic.addEventListener("pointermove", function (e) {
      if (!holding) return;
      var moved = RTL ? e.clientX - sx : sx - e.clientX;       /* toward the text box */
      recBar.classList.toggle("zr-cx", moved > 40);
      if (moved > 90) release(true);
    });
    mic.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    mic.addEventListener("click", function (e) { e.preventDefault(); });
    mic.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(null); } else if (e.key === "Escape") release(true); });
    mic.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(false); } });
  }

  /* ---------- AR | EN | RU ---------- */
  function paintLang() {
    RTL = lang === "ar"; panel.setAttribute("dir", RTL ? "rtl" : "ltr"); panel.setAttribute("aria-label", T.title);
    var ht2 = document.getElementById("hkAiTitle");
    if (ht2 && ht2.firstChild && ht2.lastChild) { ht2.firstChild.textContent = T.title; ht2.lastChild.textContent = T.sub; }
    input.placeholder = T.ph; input.setAttribute("aria-label", T.ph); sendBtn.textContent = T.send;
    body.querySelector(".zr-foot").textContent = T.note;
    lgRow.querySelector(".zr-lg").setAttribute("aria-label", VT[lang].lg);
    Array.prototype.forEach.call(lgRow.querySelectorAll(".zr-lg button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-l") === lang ? "true" : "false"); });
    setVoice(S.voice); if (SR) micUi(listening);
  }
  function setLang(l) {
    if (l === lang || !TT[l]) return;
    hush(); if (holding) release(true); else if (listening && rec) try { rec.abort(); } catch (e) {}
    lang = l; T = TT[l]; IT = ITT[l]; S.lang = l; save(); paintLang();
    if (S.step) ask(S.step); else typing(300, greet);
  }
  Array.prototype.forEach.call(lgRow.querySelectorAll(".zr-lg button"), function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-l")); }); });

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
  function hits(qt, text) { var t = " " + norm(text) + " ", n = 0, seen = {}; qt.forEach(function (w) { if (!seen[w] && t.indexOf(" " + w) >= 0) { seen[w] = 1; n++; } }); return n; }
  function find(q) {
    var qt = toks(q); if (!qt.length || !IDX) return null;
    var uniq = qt.filter(function (w, i) { return qt.indexOf(w) === i; });
    var need = uniq.length >= 2 ? 2 : 1;   /* one stray shared word ("session", "test") is not a match */
    var best = null;
    IDX.forEach(function (p) {
      var lb = p.l === lang ? 1.5 : (lang === "ru" && p.l === "en" ? 0.6 : 0);
      if (!lb) return;
      var ps = score(qt, (p.t || "") + " " + (p.h || "") + " " + (p.k || ""));
      var pageText = (p.t || "") + " " + (p.h || "") + " " + (p.k || "") + " " + (p.d || "");
      (p.q || []).forEach(function (qa) {
        if (hits(uniq, qa[0] + " " + pageText) < need) return;
        var s = (score(qt, qa[0]) * 2 + score(qt, qa[1]) * 0.5 + ps * 0.3) * lb;
        if (!best || s > best.s) best = { s: s, p: p, qa: qa };
      });
      if (hits(uniq, pageText) < need) return;
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
  /* questions about Zara herself, answered before the knowledge search */
  var INTENT = {
    voice: /(voice|speak|talk to you|call me|audio|صوت|صوتي|مكالمة|اتصال|أكلم|اكلم|كلمني|голос|позвон)/i,
    human: /(human|real person|agent|someone|staff|coordinator|موظف|شخص|إنسان|انسان|منسق|مسؤول|человек|оператор)/i,
    hello: /^(hi|hello|hey|salam|مرحبا|مرحبًا|هلا|اهلا|أهلا|السلام عليكم|السلام|привет|здравствуйте)[\s!.؟?]*$/i,
    trust: /(accredit|jci|licen[cs]ed|is it safe|safety|trust|معتمد|اعتماد|مرخص|ترخيص|آمن|امان|أمان|موثوق|аккредит|лиценз|безопас)/i,
    thanks: /^(thanks|thank you|shukran|شكرا|شكرًا|مشكور|يعطيك العافية|спасибо)[\s!.]*$/i
  };
  var ITT = {
    en: { voice: "You can talk to me: tap 🎙️ next to the message box and speak, and tap 🔊 at the top so I read my answers aloud. You can also send a voice note on WhatsApp — a coordinator replies, usually within a few hours.",
          voiceNo: "Your browser can't take voice input here (try Chrome or Safari), but tap 🔊 at the top and I'll read my answers aloud. You can also send a voice note on WhatsApp.",
          human: "Of course — a Hayakkom coordinator can take over. Message us on WhatsApp, or leave your details and we'll contact you within 12 hours.",
          thanks: "You're very welcome! Anything else I can help with?",
          trust: "Treatment is always delivered by licensed Egyptian medical institutions — never by Hayakkom. Our hospital partners include Dar Al Fouad Hospital (6th of October — the first hospital in Egypt with Joint Commission International accreditation — and Nasr City) and As-Salam International Hospital (Maadi and New Cairo), both JCI-accredited. Your doctor reviews your case before you travel, and you get a written itemised estimate before paying.",
          trustLink: "/how-to-choose/", trustLabel: "How to choose a medical coordinator" },
    ar: { voice: "يمكنك التحدث معي: اضغط 🎙️ بجانب خانة الكتابة وتكلّم، واضغط 🔊 في الأعلى لأقرأ لك إجاباتي بصوت. ويمكنك أيضًا إرسال رسالة صوتية على واتساب ويرد عليك منسّق عادةً خلال ساعات قليلة.",
          voiceNo: "متصفحك لا يدعم الإدخال الصوتي هنا (جرّب Chrome أو Safari)، لكن اضغط 🔊 في الأعلى وسأقرأ لك إجاباتي بصوت. ويمكنك أيضًا إرسال رسالة صوتية على واتساب.",
          human: "بكل سرور — يمكن لمنسّق من حياكم أن يتابع معك. راسلنا على واتساب، أو اترك بياناتك ونتواصل معك خلال 12 ساعة.",
          thanks: "العفو، حياك الله! هل أساعدك في شيء آخر؟",
          trust: "العلاج تقدّمه دائمًا منشآت طبية مصرية مرخّصة — وليس حياكم. من شركائنا مستشفى دار الفؤاد (6 أكتوبر — أول مستشفى في مصر يحصل على اعتماد اللجنة الدولية المشتركة JCI — ومدينة نصر) ومستشفى السلام الدولي (المعادي والقاهرة الجديدة)، وكلاهما معتمد من JCI. يراجع الطبيب حالتك قبل السفر، وتحصل على تقدير مكتوب ومفصّل قبل الدفع.",
          trustLink: "/ar/how-to-choose/", trustLabel: "كيف تختار منسّق رحلتك العلاجية" },
    ru: { voice: "Со мной можно говорить: нажмите 🎙️ рядом с полем ввода и говорите, а 🔊 вверху — и я буду читать ответы вслух. Можно также отправить голосовое сообщение в WhatsApp.",
          voiceNo: "Ваш браузер не поддерживает голосовой ввод (попробуйте Chrome или Safari), но нажмите 🔊 вверху — и я буду читать ответы вслух.",
          human: "Конечно — координатор Hayakkom может продолжить. Напишите нам в WhatsApp или оставьте контакты, и мы свяжемся в течение 12 часов.",
          thanks: "Пожалуйста! Чем ещё могу помочь?",
          trust: "Лечение всегда проводят лицензированные медицинские учреждения Египта, а не Hayakkom. Среди наших партнёров — больница Dar Al Fouad и международная больница As-Salam, аккредитованные Joint Commission International (JCI). Врач изучает ваш случай до поездки, а до оплаты вы получаете письменную смету.",
          trustLink: "/how-to-choose/", trustLabel: "How to choose a medical coordinator" }
  };
  var IT = ITT[lang];
  function intent(q) {
    var t = q.trim();
    if (INTENT.hello.test(t)) { greet(); return true; }
    if (INTENT.thanks.test(t)) { bot(IT.thanks); chips([[T.newQ, "ask"], [T.waBtn, "wa"]]); return true; }
    if (INTENT.trust.test(t)) { bot(null, esc(IT.trust) + '<small><a href="' + esc(IT.trustLink) + '">' + esc(IT.trustLabel) + " →</a></small>"); chips(S.sent ? [[T.newQ, "ask"], [T.waBtn, "wa"]] : [[T.yes, "lead"], [T.newQ, "ask"], [T.waBtn, "wa"]]); return true; }
    if (INTENT.voice.test(t)) { bot(SR ? IT.voice : IT.voiceNo); chips([[T.waBtn, "wa"], [T.newQ, "ask"]]); return true; }
    if (INTENT.human.test(t)) { bot(IT.human); chips(S.sent ? [[T.waBtn, "wa"]] : [[T.waBtn, "wa"], [T.yes, "lead"]]); return true; }
    return false;
  }
  /* "I'm from the UK and need help": recognise where the visitor is and what kind of help, instead of
     searching the pages for the words "UK" and "help". Country pages are linked only where they exist. */
  var COUNTRY = [
    { re: /\b(uk|u\.k\.?|united kingdom|great britain|britain|british|england|english from|london|manchester|birmingham|scotland|wales)\b|بريطانيا|المملكة المتحدة|انجلترا|إنجلترا|انكلترا|لندن|британ|великобритан|англи|лондон/i,
      n: { en: "the UK", ar: "بريطانيا", ru: "Великобритании" }, c: { en: "United Kingdom", ar: "بريطانيا", ru: "Великобритания" }, u: { en: "/uk/", ar: "/uk/", ru: "/uk/" } },
    { re: /\b(saudi|ksa|riyadh|jeddah|jedda|dammam|makkah|mecca|madinah|medina|khobar)\b|السعودي|السعودية|الرياض|جدة|جده|الدمام|مكة|المدينة|الخبر|саудов/i,
      n: { en: "Saudi Arabia", ar: "السعودية", ru: "Саудовской Аравии" }, c: { en: "Saudi Arabia", ar: "السعودية", ru: "Саудовская Аравия" }, u: { en: "/saudi-arabia/", ar: "/ar/saudi-arabia/", ru: "/saudi-arabia/" } },
    { re: /\b(uae|u\.a\.e\.?|emirates|dubai|abu dhabi|sharjah|ajman)\b|الإمارات|الامارات|دبي|أبوظبي|ابوظبي|أبو ظبي|الشارقة|оаэ|эмират|дубай/i,
      n: { en: "the UAE", ar: "الإمارات", ru: "ОАЭ" }, c: { en: "UAE", ar: "الإمارات", ru: "ОАЭ" }, u: { en: "/uae/", ar: "/ar/uae/", ru: "/uae/" } },
    { re: /\bkuwait\b|الكويت|кувейт/i, n: { en: "Kuwait", ar: "الكويت", ru: "Кувейта" }, c: { en: "Kuwait", ar: "الكويت", ru: "Кувейт" }, u: { en: "/kuwait/", ar: "/ar/kuwait/", ru: "/kuwait/" } },
    { re: /\bqatar|doha\b|قطر|الدوحة|катар/i, n: { en: "Qatar", ar: "قطر", ru: "Катара" }, c: { en: "Qatar", ar: "قطر", ru: "Катар" } },
    { re: /\bbahrain|manama\b|البحرين|бахрейн/i, n: { en: "Bahrain", ar: "البحرين", ru: "Бахрейна" }, c: { en: "Bahrain", ar: "البحرين", ru: "Бахрейн" } },
    { re: /\boman|muscat\b|عُمان|عمان|مسقط|оман/i, n: { en: "Oman", ar: "عُمان", ru: "Омана" }, c: { en: "Oman", ar: "عُمان", ru: "Оман" } },
    { re: /\b(russia|moscow)\b|روسيا|россия|росси|москв/i, n: { en: "Russia", ar: "روسيا", ru: "России" }, c: { en: "Russia", ar: "روسيا", ru: "Россия" }, u: { en: "/ru/", ar: "/ru/", ru: "/ru/" } }
  ];
  var HELP = /\b(help|assist|support|advice|plan|planning|info|information|need|looking for|interested)\b|مساعد|ساعدني|ساعدوني|أحتاج|احتاج|أبغى|ابغى|ابي|أبي|أريد|اريد|استفسار|помог|помощь|нужн|хочу|интерес/i;
  var CW = {
    en: { hi: "Welcome — happy to help you from {c}! 👋 Hayakkom coordinates your whole trip to Egypt: dental care, medical treatment and check-ups with licensed providers, plus holidays, stays and transport with registered tourism companies.",
          what: "What would you like help with? Pick one below, or just tell me in your own words.", page: "Egypt from {c}",
          help: "Of course, I'm here to help! 😊 I can answer questions about treatment and trips in Egypt, give indicative prices, or prepare a free personal plan with our team. What do you have in mind?",
          lost: "I'm not sure I understood that. Could you tell me a little more — for example \"dental implants price\", \"a family holiday in Sharm\" or \"how do I pay\"? You can also pick a topic below, or I can pass your question to our team (they reply within 12 hours)." },
    ar: { hi: "أهلًا وسهلًا بك من {c}! 👋 حياكم تنسّق رحلتك إلى مصر كاملة: علاج الأسنان والعلاج الطبي والفحوصات لدى جهات مرخّصة، إضافة إلى العطلات والإقامة والتنقل عبر شركات سياحة مسجّلة.",
          what: "بماذا تودّ أن أساعدك؟ اختر من الأسفل، أو اكتب لي بكلماتك.", page: "مصر للقادمين من {c}",
          help: "بكل سرور، أنا هنا لمساعدتك! 😊 أجيب عن أسئلتك حول العلاج والرحلات في مصر، وأعطيك أسعارًا تقديرية، أو أجهّز لك خطة شخصية مجانية مع فريقنا. بماذا تفكّر؟",
          lost: "لم أفهم طلبك تمامًا. هل تخبرني أكثر قليلًا — مثل \"سعر زراعة الأسنان\" أو \"عطلة عائلية في شرم\" أو \"كيف أدفع\"؟ ويمكنك اختيار موضوع من الأسفل، أو أحوّل سؤالك إلى فريقنا (يردّون خلال 12 ساعة)." },
    ru: { hi: "Добро пожаловать — рада помочь вам из {c}! 👋 Hayakkom организует всю поездку в Египет: стоматология, лечение и чекапы в лицензированных клиниках, а также отдых, проживание и трансфер через зарегистрированные туркомпании.",
          what: "С чем вам помочь? Выберите ниже или напишите своими словами.", page: "Египет из {c}",
          help: "Конечно, я здесь, чтобы помочь! 😊 Отвечу на вопросы о лечении и поездках в Египет, назову ориентировочные цены или подготовлю с командой бесплатный личный план. Что вас интересует?",
          lost: "Я не совсем поняла. Расскажите чуть подробнее — например, «цена имплантов», «семейный отдых в Шарме» или «как оплатить»? Можно выбрать тему ниже или передать вопрос нашей команде (ответ в течение 12 часов)." }
  };
  function topics() { return T.opts.map(function (o) { return [o[1], o[0]]; }).concat([[T.waBtn, "wa"]]); }
  function countryOf(q) { for (var i = 0; i < COUNTRY.length; i++) if (COUNTRY[i].re.test(q)) return COUNTRY[i]; return null; }
  function stripCountry(q, c) { return q.replace(new RegExp(c.re.source, "gi"), " ").replace(/\b(i am|i'm|im|we are|we're|from|living in|live in|based in|and|need|help|please)\b|أنا|انا|من|نحن|وأحتاج|واحتاج|مساعدة|я|мы|из|нужна|помощь/gi, " ").replace(/\s+/g, " ").trim(); }
  /* ---------- AI Zara ---------- */
  function md(t) {   /* the agent writes light markdown: bold, links, bare https links */
    return esc(t).replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]\n]{1,120})\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  }
  function waiting() {
    var row = document.createElement("div"); row.className = "zr-row"; row.appendChild(avatar());
    var b = document.createElement("div"); b.className = "zr-b zr-typing"; b.setAttribute("aria-hidden", "true");
    b.innerHTML = "<span></span><span></span><span></span>"; row.appendChild(b); box.appendChild(row); box.scrollTop = box.scrollHeight;
    return function () { row.remove(); };
  }
  function photos(list) {
    var html = '<span class="zr-ph">' + list.map(function (im) {
      return '<a href="' + esc(im.url) + '" target="_blank" rel="noopener"><img src="' + esc(im.url) + '" alt="' + esc(im.caption || "") + '" loading="lazy"></a>';
    }).join("") + "</span>" + (list[0] && list[0].caption ? "<small>" + esc(list[0].caption) + "</small>" : "");
    var m = { text: list.map(function (i) { return i.caption || ""; }).join(" · "), html: html, pics: 1 }; S.log.push(m); save(); render(m);
  }
  var aiBusy = false;
  function aiAnswer(q) {
    if (aiBusy) return; aiBusy = true;
    var stop = waiting(), ctl2 = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ctl2) ctl2.abort(); }, 100000);
    fetch(AI_URL, { method: "POST", headers: { "content-type": "application/json" }, signal: ctl2 ? ctl2.signal : undefined,
      body: JSON.stringify({ session_id: S.ai || "", text: q, lang: lang, channel: S.voice ? "voice" : "web_chat", page: location.pathname, transcript: transcript(), contact: S.aiContact || {} }) })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || d.error && !(d.replies && d.replies.length)) throw new Error(d.error || r.status); return d; }); })
      .then(function (d) {
        clearTimeout(timer); stop(); aiBusy = false;
        S.ai = d.session_id || S.ai; if (d.contact && d.contact.name) S.aiContact = d.contact; save();
        if (!d.replies.length && !(d.images && d.images.length)) throw new Error("empty");
        d.replies.forEach(function (t) {   /* the screen shows bold and links; the voice reads clean words only */
          var said = t.replace(/\[([^\]\n]+)\]\((https?:[^)\s]+)\)/g, "$1").replace(/[*_#`>]+/g, "").replace(/^\s*[-•]\s+/gm, "");
          bot(said, md(t));
        });
        if (d.images && d.images.length) photos(d.images);
        if (d.contact && (d.contact.phone || d.contact.email)) { S.lead.phone = S.lead.phone || d.contact.phone; S.sent = true; save(); }
        chips(d.handoff ? [[T.waBtn, "wa"]] : [[T.waBtn, "wa"]]);
      })
      .catch(function () { clearTimeout(timer); stop(); aiBusy = false; ruleAnswer(q); });
  }
  function answer(q) {
    if (AI_URL) { aiAnswer(q); return; }
    ruleAnswer(q);
  }
  function ruleAnswer(q) {
    if (intent(q)) return;
    var cw = CW[lang], ctry = countryOf(q);
    loadIdx().then(function () {
      if (ctry) {
        S.lead.country = S.lead.country || ctry.c[lang]; save();
        var rest = stripCountry(q, ctry), hit2 = rest.length > 3 ? find(rest) : null, link = ctry.u && ctry.u[lang];
        bot(null, esc(cw.hi.replace("{c}", ctry.n[lang])) + (link ? '<small><a href="' + esc(link) + '">' + esc(cw.page.replace("{c}", ctry.n[lang])) + " →</a></small>" : ""));
        if (hit2) { typing(450, function () { var p2 = hit2.p; if (hit2.qa) bot(null, esc(hit2.qa[1]) + "<small>" + esc(T.from) + ': <a href="' + esc(p2.u) + '">' + esc(p2.h || p2.t) + "</a></small>"); else bot(null, esc(T.found) + "\n" + pageCard(p2)); chips(S.sent ? [[T.newQ, "ask"], [T.waBtn, "wa"]] : [[T.yes, "lead"], [T.newQ, "ask"], [T.waBtn, "wa"]]); }); }
        else typing(450, function () { bot(cw.what); chips(topics()); });
        return;
      }
      /* a bare "I need help" / "can you help me?" gets a welcome and topics, not a random page */
      if (/^\W*(hi|hello|hey|please)?\W*((i|we)\s+)?(really\s+)?(need|want|would like|require)?\s*(some\s+|your\s+)?(help|assistance|support|advice|information|info)(\s+(me|please|us))?\W*$|^\W*(can|could)\s+you\s+help(\s+(me|us))?\W*$|^\W*help(\s+me)?\W*$|^[\s\W]*(أحتاج|احتاج|أبغى|ابغى|أبي|ابي|أريد|اريد)?\s*(مساعدة|مساعده)[\s\W]*$|^[\s\W]*(ساعدني|ساعدوني|ممكن تساعدني|ممكن مساعدة)[\s\W]*$|^[\s\W]*(мне\s+)?(нужна\s+)?помощь[\s\W]*$|^[\s\W]*помогите[\s\W]*$/i.test(q)) { bot(cw.help); chips(topics()); return; }
      var hit = find(q);
      if (!hit && HELP.test(q) && q.split(/\s+/).length <= 8) { bot(cw.help); chips(topics()); return; }
      if (!hit) { S.pending = q; save(); bot(cw.lost); chips([[T.pass, "passq"]].concat(topics())); return; }
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
    if (AI_URL && T.needs[k]) { typing(200, function () { aiAnswer(label); }); return; }
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
  var x = document.getElementById("hkAiX"); if (x) x.addEventListener("click", function () { partial(); hush(); if (holding) release(true); else if (listening && rec) try { rec.abort(); } catch (e) {} });
  window.addEventListener("pagehide", partial);

  /* ---------- start ---------- */
  paintLang();
  if (S.log.length) {
    S.log.forEach(render);
    if (S.step) ask(S.step);
    else if (S.chips && S.chips.length) chips(S.chips.map(function (c) { return [c.l, c.k]; }));
    else chips([[T.newQ, "ask"], [T.waBtn, "wa"], [T.start, "restart"]]);
  } else typing(500, greet);
  loadIdx();
})();

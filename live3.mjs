// After PR 39: forms higher on phones, new box wording, study forms, titles, address.
import { chromium } from 'playwright';
let ok = false;
for (let i = 0; i < 60; i++) { const h = await (await fetch('https://www.hayakkom.com/dental/?w=' + Date.now())).text(); if (h.includes('hk-share.js?v=3548')) { ok = true; break } await new Promise(r => setTimeout(r, 10000)) }
console.log('live serves hk-share v3548:', ok);
const b = await chromium.launch();
for (const [u, w] of [['/dental/', 412], ['/ar/dental/', 412], ['/medical/', 412], ['/educational/', 412], ['/ar/educational/', 412], ['/dental/', 1366], ['/', 412]]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem('hk-consent', 'essential'); localStorage.setItem('hkTourDone6', '1'); localStorage.setItem('hkInstallSkip', String(Date.now())) } catch (e) {} });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://www.hayakkom.com' + u + '?t=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(5000);
  const r = await p.evaluate(() => { const top = e => e ? Math.round(e.getBoundingClientRect().top + scrollY) : null;
    const box = document.querySelector('.enquiry-box') || document.getElementById('study-form');
    return { title: document.title, page: document.documentElement.scrollHeight, form: top(box),
      boxTitle: ((document.querySelector('.enquiry-box-title') || document.querySelector('#study-form h2') || {}).textContent || '').trim(),
      boxSub: ((document.querySelector('.enquiry-box-sub') || {}).textContent || '').trim().slice(0, 60),
      address: ((document.body.innerText.match(/(District 16[^·\n]*|الحي 16[^·\n]*)/) || [''])[0]).slice(0, 70) } });
  console.log(u, w, JSON.stringify(r), 'errors:', errs.length ? errs.slice(0, 2) : 'none');
  if (w < 500 && u !== '/') { await p.evaluate(() => { const e = document.querySelector('.enquiry-box') || document.getElementById('study-form'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 70) }); await p.waitForTimeout(700); await p.screenshot({ path: 'shots/form' + u.replace(/\//g, '_') + '.png' }) }
  await c.close() }
await b.close();

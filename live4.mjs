// After PR 40: the new study and dental forms load on the live site; Arabic forms sit in the top box.
import { chromium } from 'playwright';
let ok = false;
for (let i = 0; i < 60; i++) { const h = await (await fetch('https://www.hayakkom.com/ar/dental/?w=' + Date.now())).text(); if (h.includes('263095990075062')) { ok = true; break } await new Promise(r => setTimeout(r, 10000)) }
console.log('live serves the new Arabic dental form:', ok);
const b = await chromium.launch();
for (const [u, w] of [['/dental/', 412], ['/ar/dental/', 412], ['/educational/', 412], ['/ar/educational/', 412], ['/ar/medical/', 412], ['/ar/dental/', 1366]]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem('hk-consent', 'essential'); localStorage.setItem('hkTourDone6', '1'); localStorage.setItem('hkInstallSkip', String(Date.now())) } catch (e) {} });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://www.hayakkom.com' + u + '?t=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(4000);
  await p.evaluate(() => { const e = document.querySelector('.enquiry-box') || document.getElementById('study-form'); if (e) scrollTo(0, e.getBoundingClientRect().top + scrollY - 70) }); await p.waitForTimeout(6000);
  const r = await p.evaluate(() => { const box = document.querySelector('.enquiry-box') || document.getElementById('study-form');
    return { form: box ? Math.round(box.getBoundingClientRect().top + scrollY) : null, frames: [...document.querySelectorAll('iframe')].map(i => (i.src.match(/jotform\.com\/(\d+)/) || [])[1]).filter(Boolean) } });
  console.log(u, w, JSON.stringify(r), 'errors:', errs.length ? errs.slice(0, 2) : 'none');
  if (w < 500) await p.screenshot({ path: 'shots/new' + u.replace(/\//g, '_') + '.png' });
  await c.close() }
await b.close();

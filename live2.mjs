// After PR 38 on the live site: hero photo, Jotform only when used, form loading cover, assistant on intent, cookie bar.
import { chromium } from 'playwright';
let ok = false;
for (let i = 0; i < 60; i++) { const h = await (await fetch('https://www.hayakkom.com/dental/?w=' + Date.now())).text(); if (h.includes('hk-share.js?v=3547')) { ok = true; break } await new Promise(r => setTimeout(r, 10000)) }
console.log('live serves hk-share v3547:', ok);
const b = await chromium.launch();
const ctx = async () => { const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem('hk-consent', 'essential'); localStorage.setItem('hkTourDone6', '1'); localStorage.setItem('hkInstallSkip', String(Date.now())) } catch (e) {} }); return c };
for (const u of ['/', '/ar/']) { const c = await ctx(); const p = await c.newPage(); const req = [];
  p.on('request', r => { if (/hero-pyramids|pexels-photo-71241/.test(r.url())) req.push(r.url().split('/').pop()) });
  await p.goto('https://www.hayakkom.com' + u + '?t=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(3000);
  console.log(u, 'hero requests:', req.join(', ')); await p.screenshot({ path: `shots/hero${u.length > 1 ? '-ar' : '-en'}.png` }); await c.close() }
for (const u of ['/dental/', '/ar/contact/']) { const c = await ctx(); const p = await c.newPage(); const jf = []; const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('request', r => { if (/jotform|jotfor\.ms/.test(r.url())) jf.push(r.url().replace(/\?.*/, '').slice(8, 60)) });
  await p.goto('https://www.hayakkom.com' + u + '?t=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(6000);
  console.log('\n' + u, 'Jotform before scrolling:', jf.length ? jf.join(', ') : 'none');
  const n0 = jf.length;
  await p.evaluate(() => { const f = document.querySelector('.jf-wrap') || document.querySelector('iframe[src*="form.jotform"]'); scrollTo(0, f.getBoundingClientRect().top + scrollY - 70) });
  let shot = 0; const t0 = Date.now();
  for (let k = 0; k < 24; k++) { await p.waitForTimeout(500);
    const s = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')].find(i => /form\.jotform/.test(i.src) && i.getBoundingClientRect().top < 900 && i.getBoundingClientRect().bottom > 0); if (!f) return 'no form on screen yet';
      const c = f.nextElementSibling; return 'form ' + getComputedStyle(f).display + ' | cover ' + (c && c.classList.contains('hk-fl') ? (c.classList.contains('hk-fl-out') ? 'fading' : getComputedStyle(c).display) : 'gone') });
    if (k % 2 === 1 || /gone/.test(s)) console.log('  ' + ((Date.now() - t0) / 1000).toFixed(1) + 's ' + s);
    if (!shot && /cover flex/.test(s) && /form block/.test(s)) { shot = 1; await p.screenshot({ path: `shots/form-loading${u.includes('ar') ? '-ar' : '-en'}.png` }) }
    if (/cover gone/.test(s)) { await p.waitForTimeout(800); await p.screenshot({ path: `shots/form-ready${u.includes('ar') ? '-ar' : '-en'}.png` }); break } }
  console.log('  Jotform after scrolling:', jf.slice(n0).join(', '));
  const n1 = jf.length; await p.dispatchEvent('#hkAi', 'touchstart').catch(() => {}); await p.waitForTimeout(1500);
  console.log('  assistant after touch:', jf.slice(n1).filter(x => /agent/.test(x)).length ? 'loading' : 'NOT loading', '| errors:', errs.length ? errs.slice(0, 2) : 'none');
  const cc = await p.evaluate(() => (document.querySelector('#hkCc p') || {}).textContent || ''); console.log('  cookie text:', cc.trim().slice(0, 70));
  await c.close() }
await b.close();

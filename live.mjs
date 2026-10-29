// After PR 36: is the new cookie bar, the guide hand and the implant price live?
import { chromium } from 'playwright';
let ok = false;
for (let i = 0; i < 60; i++) { const h = await (await fetch('https://www.hayakkom.com/?w=' + Date.now())).text(); if (h.includes('hk-share.js?v=3545')) { ok = true; break } await new Promise(r => setTimeout(r, 10000)) }
console.log('live serves hk-share v3545:', ok);
const b = await chromium.launch();
for (const [n, u, w, h, m] of [['en-phone', '/', 390, 844, true], ['ar-phone', '/ar/', 390, 844, true], ['en-desk', '/', 1366, 820, false], ['ar-desk', '/ar/', 1366, 820, false]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m, deviceScaleFactor: m ? 2 : 1 });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://www.hayakkom.com' + u + '?t=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(5500);
  const cc = await p.evaluate(() => { const c = document.getElementById('hkCc'); if (!c) return 'no bar'; const r = (s) => c.querySelector(s); const q = r('.cc-accept').getBoundingClientRect(), z = r('.cc-reject').getBoundingClientRect();
    return { shown: !c.hidden, text: r('p').textContent.trim().slice(0, 60), accept: r('.cc-accept').textContent, reject: r('.cc-reject').textContent, oneRow: Math.abs(q.top - z.top) < 4, glow: r('.cc-accept').classList.contains('hk-glow') } });
  console.log(`\n== ${n}`, JSON.stringify(cc));
  await p.screenshot({ path: `shots/${n}-cookie.png` });
  await p.click('#hkCcYes'); await p.waitForTimeout(400);
  const gtagConsent = await p.evaluate(() => JSON.stringify((window.dataLayer || []).filter(x => x && x[0] === 'consent').map(x => x[1] + ':' + (x[2] && x[2].analytics_storage))));
  console.log('consent calls:', gtagConsent);
  // the guide starts once the bar is gone
  const tour = await p.waitForSelector('#hkTour', { timeout: 15000 }).then(() => true).catch(() => false);
  console.log('guide opened:', tour);
  if (tour) {
    for (let s = 0; s < 3; s++) {
      await p.waitForTimeout(2600);
      const st = await p.evaluate(() => { const t = document.querySelector('#hkTour'), h = t.querySelector('.hkt-tap'), r = h && h.getBoundingClientRect(); return { title: (t.querySelector('.hkt-t') || {}).textContent, hand: !!(h && r.width && getComputedStyle(h).display !== 'none'), at: r ? [r.x | 0, r.y | 0] : null } });
      console.log(' step', s, JSON.stringify(st)); await p.screenshot({ path: `shots/${n}-guide${s}.png` });
      const next = await p.$('#hkTour .hkt-main'); if (next) await next.click().catch(() => {}); else break;
    }
  }
  const price = await p.evaluate(() => { const s = [...document.scripts].map(x => x.src).find(x => /hk-mini-calc/.test(x)); return s || 'no mini-calc' });
  console.log('mini-calc:', price, 'errors:', errs.length ? errs.slice(0, 3) : 'none');
  await c.close();
}
const js = await (await fetch('https://www.hayakkom.com/assets/hk-mini-calc.js?x=' + Date.now())).text();
console.log('\nimplant range live:', (js.match(/lo:\s*\d+,\s*hi:\s*\d+/g) || []).slice(0, 4).join(' | '));
await b.close();

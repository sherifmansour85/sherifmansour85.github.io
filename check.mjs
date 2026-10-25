// Walks the homepage quick guide with real photos, on the live site and on the PR branch, phone and desktop, EN and AR.
import { chromium, devices } from 'playwright';
const TARGETS = [['live', 'https://www.hayakkom.com']];
const DEV = [['phone', { ...devices['iPhone 13'] }], ['desktop', { viewport: { width: 1366, height: 820 } }]];
const b = await chromium.launch();
// wait until GitHub Pages serves the new version (hk-share v3540)
for (let i = 0; i < 36; i++) { const h = await (await fetch('https://www.hayakkom.com/?w=' + Date.now())).text(); if (h.includes('hk-share.js?v=3540')) { console.log('live has v3540'); break } await new Promise(r => setTimeout(r, 5000)) }
for (const [tn, base] of TARGETS) for (const [dn, dopt] of DEV) for (const path of ['/', '/ar/']) {
  const L = path === '/' ? 'en' : 'ar', tag = `${tn}-${dn}-${L}`, errs = [];
  const ctx = await b.newContext(dopt); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('hkInstallSkip', String(Date.now())) } catch (e) {} });
  try {
    await p.goto(base + path + '?lc=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1500);
    const cc = await p.$('#hkCcYes'); if (cc && await cc.isVisible()) await cc.click();
    const v = await p.evaluate(() => (document.querySelector('script[src*="hk-share.js"]') || {}).src || '');
    await p.waitForSelector('#hkTour', { timeout: 20000 }); await p.waitForTimeout(900);
    await p.screenshot({ path: `shots/${tag}-0.jpg`, quality: 70 });
    await p.click('#hkTour .hkt-main');
    const steps = [];
    for (let i = 1; i <= 9; i++) {
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `shots/${tag}-${i}.jpg`, quality: 70 });
      const t = await p.evaluate(() => (document.querySelector('#hkTour .hkt-eb')?.textContent || '') + ' :: ' + (document.querySelector('#hkTour .hkt-t')?.textContent || '') + ' :: ' + [...document.querySelectorAll('#hkTour .hkt-ex p')].map(e => e.textContent).join(' '));
      steps.push(t);
      if (await p.$('#hkTour a.hkt-main')) break;
      await p.click('#hkTour .hkt-main');
    }
    await p.click('#hkTour .hkt-link'); await p.waitForTimeout(600);
    // category tiles: scroll them under the header, tap the 4th like a visitor, and check the services are on screen
    await p.evaluate(() => { const a = document.querySelector('.hk-svc-ask') || document.querySelector('.hk-svc-tabs'); scrollTo(0, a.getBoundingClientRect().top + scrollY - 80) });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `shots/${tag}-tiles-a.jpg`, quality: 70 });
    const bb = await (await p.$('.hk-svc-tab:nth-child(4)')).boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(1500);
    await p.screenshot({ path: `shots/${tag}-tiles-b.jpg`, quality: 70 });
    const after = await p.evaluate(() => { const c = [...document.querySelectorAll('.grid-sm .svc-sm')].find(x => !x.classList.contains('hk-off')); const r = c.getBoundingClientRect(); const img = c.querySelector('img'); return { cardTop: Math.round(r.top), vh: innerHeight, photoLoaded: !!(img && img.complete && img.naturalWidth > 0), tileH: Math.round(document.querySelector('.hk-svc-tab').getBoundingClientRect().height) } });
    console.log(`== ${tag}  (${v.split('/').pop()})`); steps.forEach(s => console.log('   ' + s));
    console.log('   tiles:', JSON.stringify(after), 'errors:', JSON.stringify(errs));
  } catch (e) { console.log(`== ${tag} FAILED: ${e.message.split('\n')[0]}`, JSON.stringify(errs)); await p.screenshot({ path: `shots/${tag}-fail.jpg`, quality: 70 }).catch(() => {}) }
  await ctx.close();
}
// a returning visitor who already skipped the guide: it must not pop up again, and the footer button must open the new guide
for (const [dn, dopt] of DEV) for (const path of ['/', '/ar/']) {
  const L = path === '/' ? 'en' : 'ar', tag = `return-${dn}-${L}`;
  const ctx = await b.newContext(dopt); const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('hkInstallSkip', String(Date.now())); localStorage.setItem('hkTourDone3', '1') } catch (e) {} });
  try {
    await p.goto('https://www.hayakkom.com' + path + '?lc=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1500); const cc = await p.$('#hkCcYes'); if (cc && await cc.isVisible()) await cc.click();
    await p.waitForTimeout(4000);
    const auto = !!(await p.$('#hkTour'));
    const ver = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /hk-(share|tour)/.test(s)).map(s => s.split('/').pop()).join(' '));
    const btn = await p.$('footer .hkt-again'); const btnText = btn ? await btn.textContent() : 'MISSING';
    if (btn) { await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await p.screenshot({ path: `shots/${tag}-footer.jpg`, quality: 70 }); await btn.click() }
    await p.waitForSelector('#hkTour', { timeout: 8000 }); await p.waitForTimeout(800);
    await p.click('#hkTour .hkt-main'); await p.waitForTimeout(1800); await p.click('#hkTour .hkt-main'); await p.waitForTimeout(2000);
    await p.screenshot({ path: `shots/${tag}-step2.jpg`, quality: 70 });
    const t = await p.evaluate(() => document.querySelector('#hkTour .hkt-t')?.textContent);
    console.log(`== ${tag}: auto-popup=${auto} scripts=[${ver}] footer="${btnText}" step2="${t}"`);
  } catch (e) { console.log(`== ${tag} FAILED: ${e.message.split('\n')[0]}`) }
  await ctx.close();
}
// a visitor who saw the OLD guide (old flag only): the new guide must be offered once
for (const path of ['/', '/ar/']) {
  const ctx = await b.newContext(DEV[0][1]); const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('hkInstallSkip', String(Date.now())); if (!sessionStorage.getItem('r')) { localStorage.setItem('hkTourDone2', '1'); sessionStorage.setItem('r', '1') } } catch (e) {} });
  await p.goto('https://www.hayakkom.com' + path + '?lc=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1500); const cc = await p.$('#hkCcYes'); if (cc && await cc.isVisible()) await cc.click();
  const offered = await p.waitForSelector('#hkTour', { timeout: 10000 }).then(() => true, () => false);
  if (offered) { await p.screenshot({ path: `shots/oldflag-${path === '/' ? 'en' : 'ar'}.jpg`, quality: 70 }); await p.click('#hkTour .hkt-link'); await p.waitForTimeout(600) }
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(5000);
  console.log(`== oldflag-${path === '/' ? 'en' : 'ar'}: new guide offered=${offered}, shows again after skipping=${!!(await p.$('#hkTour'))}`);
  await ctx.close();
}
await b.close();

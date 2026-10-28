// Does the live Google tag (AW-16686203605) also send to GA4 G-YM2MCB9756?
import { chromium } from 'playwright';
const js = await (await fetch('https://www.googletagmanager.com/gtag/js?id=AW-16686203605')).text();
console.log('gtag.js bytes', js.length);
console.log('G- IDs inside the AW tag:', [...new Set(js.match(/G-[A-Z0-9]{8,12}/g) || [])].join(', ') || 'none');
console.log('AW IDs inside:', [...new Set(js.match(/AW-\d+/g) || [])].join(', '));
const b = await chromium.launch();
for (const [label, url] of [['EN', 'https://www.hayakkom.com/'], ['AR', 'https://www.hayakkom.com/ar/']]) {
  for (const accept of [false, true]) {
    const p = await b.newPage();
    const hits = [];
    p.on('request', r => { const u = r.url(); if (/google-analytics\.com|analytics\.google\.com|\/g\/collect|googleadservices|doubleclick|googletagmanager/.test(u)) hits.push(u.slice(0, 220)); });
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForTimeout(4000);
    if (accept) { await p.click('#hkCcYes').catch(e => console.log('no accept button', e.message)); await p.waitForTimeout(5000); }
    const tags = await p.evaluate(() => Object.keys(window.google_tag_manager || {}).filter(k => /^(G|AW|GT)-/.test(k)));
    console.log(`\n== ${label} consent=${accept ? 'accepted' : 'default'} loaded tags: ${tags.join(', ')}`);
    const collect = hits.filter(h => /\/g\/collect/.test(h));
    console.log('GA4 collect hits:', collect.length, collect.map(h => (h.match(/tid=[^&]+/) || [''])[0] + ' ' + (h.match(/gcs=[^&]+/) || [''])[0] + ' ' + (h.match(/en=[^&]+/) || [''])[0]).join(' | '));
    hits.filter(h => !/\/g\/collect/.test(h)).forEach(h => console.log('  ', h));
    await p.close();
  }
}
await b.close();

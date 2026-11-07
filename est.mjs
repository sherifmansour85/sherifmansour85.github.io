// Fill a real Jotform form in a browser with clearly marked TEST answers, submit it, and report the thank-you page
// (and the estimate link it shows). Answers are set on the real inputs, then the form is submitted natively.
import { chromium } from 'playwright';
const id = process.env.FORM || '263103163535045';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('https://form.jotform.com/' + id, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
const req = await p.evaluate(() => [...document.querySelectorAll('.jf-required, [class*="validate[required"]')].map(e => e.name || e.id).slice(0, 40));
console.log('required inputs:', JSON.stringify(req));
await p.evaluate(() => {
  const set = (sel, v) => { const e = document.querySelector(sel); if (e) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } return !!e; };
  const tick = (name, valueStart) => { const e = [...document.querySelectorAll('input[name="' + name + '"]')].find(i => i.value.startsWith(valueStart)); if (e) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); } return !!e; };
  const out = {};
  out.exc1 = tick('q24_whichExcursions[]', 'Pyramids & Sphinx half day');
  out.exc2 = tick('q24_whichExcursions[]', 'Nile dinner cruise');
  out.egypt = tick('q3_q3_radio1', 'No');
  out.nights = set('[name="q6_q6_number4"]', '4');
  out.who = tick('q8_q8_radio6', 'Couple');
  out.stay = tick('q12_q12_radio10', '4-star');
  out.add = tick('q16_q16_checkbox14[]', 'Airport');
  out.first = set('[name="q19_q19_fullname17[first]"]', 'TEST');
  out.last = set('[name="q19_q19_fullname17[last]"]', 'Estimate check please delete');
  out.phone = set('[name="q20_q20_phone18[full]"]', '+20 100 000 0000') || set('[name^="q20_"]', '+20 100 000 0000');
  out.consent = !!document.querySelector('[name^="q22_"]') && (document.querySelector('[name^="q22_"]').checked = true);
  out.src = set('[name="q26_sourcePage"]', 'test-estimate');
  window.__set = out;
});
console.log('set:', JSON.stringify(await p.evaluate(() => window.__set)));
const [resp] = await Promise.all([p.waitForNavigation({ timeout: 30000 }).catch(e => null), p.evaluate(() => { const f = document.querySelector('form.jotform-form'); HTMLFormElement.prototype.submit.call(f); })]);
await p.waitForTimeout(3000);
console.log('final url:', p.url());
const txt = await p.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 900) : '');
console.log('page text:', txt);
const links = await p.evaluate(() => [...document.querySelectorAll('a[href*="estimate"]')].map(a => a.href));
const raw = await p.content(); const i = raw.indexOf('hayakkom.com/estimate'); console.log('RAW:', JSON.stringify(raw.slice(Math.max(0,i-200), i+1400)));
console.log('estimate links:', JSON.stringify(links));
await b.close();

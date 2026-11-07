// For each form: fill every visible question generically with TEST answers (first options, numbers = 2),
// submit natively, and print the "estimate" link from the thank-you page.
import { chromium } from 'playwright';
const forms = (process.env.FORMS || '263097117701051,263096472028056,263102962904051,263095260665057,263095990075062,263103636339052').split(',');
const b = await chromium.launch();
for (const id of forms) {
  const p = await b.newPage();
  try {
    await p.goto('https://form.jotform.com/' + id, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
    await p.evaluate(() => {
      const fire = e => { e.dispatchEvent(new Event('click', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
      const groups = {};
      document.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i => { (groups[i.name] = groups[i.name] || []).push(i); });
      Object.values(groups).forEach(g => { const n = g[0].type === 'checkbox' ? Math.min(2, g.length) : 1; for (let k = 0; k < n; k++) { if (!g[k].checked) g[k].click(); g[k].checked = true; fire(g[k]); } });
      document.querySelectorAll('select').forEach(s => { if (s.options.length > 1) { s.selectedIndex = 1; fire(s); } });
      document.querySelectorAll('input[type=number]').forEach(i => { i.value = '2'; fire(i); });
      document.querySelectorAll('input[type=text],input[type=tel],textarea').forEach(i => {
        if (/est[a-z]$|summary|source|textbox17|input22|sourcePage/i.test(i.name) || i.closest('.always-hidden')) return;
        if (/first/i.test(i.name)) i.value = 'TEST'; else if (/last/i.test(i.name)) i.value = 'Estimate check please delete';
        else if (/phone|whatsapp|full\]/i.test(i.name)) i.value = '+20 100 000 0000'; else if (!i.value) i.value = 'TEST';
        fire(i);
      });
    });
    await p.waitForTimeout(1500);
    const hidden = await p.evaluate(() => [...document.querySelectorAll('input')].filter(i => /_est[a-z]$/.test(i.name)).map(i => i.name.replace(/^q\d+_/, '') + '=' + i.value.slice(0, 80)));
    await Promise.all([p.waitForNavigation({ timeout: 30000 }).catch(() => null), p.evaluate(() => HTMLFormElement.prototype.submit.call(document.querySelector('form.jotform-form')))]);
    await p.waitForTimeout(2500);
    const title = await p.evaluate(() => (document.querySelector('h1') || {}).innerText || document.title);
    const links = await p.evaluate(() => [...document.querySelectorAll('a[href*="estimate"]')].map(a => a.href));
    console.log('### ' + id + '\n hidden: ' + JSON.stringify(hidden) + '\n thank-you: ' + title.trim().slice(0, 80) + '\n link: ' + (links[0] || 'NONE'));
  } catch (e) { console.log('### ' + id + ' ERROR ' + e.message); }
  await p.close();
}
await b.close();

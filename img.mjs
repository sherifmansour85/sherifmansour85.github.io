// Download the homepage hero photo once and save sized WebP copies for the site to host itself.
import sharp from 'sharp';
import fs from 'fs';
fs.mkdirSync('img', { recursive: true });
const src = 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg?auto=compress&cs=tinysrgb&w=2400';
const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
const meta = await sharp(buf).metadata(); console.log('source', meta.width, 'x', meta.height, buf.length, 'bytes');
// Upright crop for phones: full photo height, centred like the CSS (background-position 50%).
const cw = Math.round(meta.height * 0.6), left = Math.round((meta.width - cw) * 0.5);
await sharp(buf).extract({ left, top: 0, width: cw, height: meta.height }).webp({ quality: 60, effort: 6 }).toFile('img/hero-pyramids-tall.webp');
console.log('img/hero-pyramids-tall.webp', cw + 'x' + meta.height, fs.statSync('img/hero-pyramids-tall.webp').size, 'bytes');
for (const [w, q] of [[640, 62], [960, 64], [1440, 66], [1920, 68]]) {
  const out = `img/hero-pyramids-${w}.webp`;
  await sharp(buf).resize({ width: w }).webp({ quality: q, effort: 6 }).toFile(out);
  const m = await sharp(out).metadata(); console.log(out, m.width + 'x' + m.height, fs.statSync(out).size, 'bytes');
}

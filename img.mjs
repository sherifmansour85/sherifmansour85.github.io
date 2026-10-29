// Download the homepage hero photo once and save sized WebP copies for the site to host itself.
import sharp from 'sharp';
import fs from 'fs';
fs.mkdirSync('img', { recursive: true });
const src = 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg?auto=compress&cs=tinysrgb&w=2400';
const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
const meta = await sharp(buf).metadata(); console.log('source', meta.width, 'x', meta.height, buf.length, 'bytes');
for (const [w, q] of [[640, 62], [960, 64], [1440, 66], [1920, 68]]) {
  const out = `img/hero-pyramids-${w}.webp`;
  await sharp(buf).resize({ width: w }).webp({ quality: q, effort: 6 }).toFile(out);
  const m = await sharp(out).metadata(); console.log(out, m.width + 'x' + m.height, fs.statSync(out).size, 'bytes');
}

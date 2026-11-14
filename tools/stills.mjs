// 비트별 스틸 캡처 → stills/contact.jpg (검수용)
// usage: node tools/stills.mjs [--mobile] [--port 8765]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { chromium } from 'file:///C:/Users/windg/.claude/skills/kinetic-motion/scripts/node_modules/playwright/index.mjs';

const args = process.argv.slice(2);
const mobile = args.includes('--mobile');
const stops = args.includes('--stops');
const port = Number((args.find((a) => a.startsWith('--port=')) || '--port=8771').split('=')[1]);
const root = resolve(import.meta.dirname, '..');
const site = resolve(root, 'site');
const out = resolve(root, 'stills', (stops ? 'stops_' : '') + (mobile ? 'mobile' : 'desktop'));
mkdirSync(out, { recursive: true });

const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: site, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const vp = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// 프로그램 스크롤이 멈춤 지점으로 끌려가지 않게 스냅을 끈다
await page.addStyleTag({ content: 'html.snap { scroll-snap-type: none !important; }' });
await page.waitForTimeout(300);

const beats = await page.evaluate(() => [...document.querySelectorAll('.scene')].map((s) => ({ top: s.offsetTop, n: Number(s.dataset.beats), name: s.dataset.scene })));
const vh = vp.height;
const shots = [];
let idx = 0;
const stopList = stops ? await page.evaluate(() => [...document.querySelectorAll('.stop')].map((el) => { const sec = el.parentElement; return { name: sec.dataset.scene, y: sec.offsetTop + parseFloat(el.style.top), b: Math.round(parseFloat(el.style.top) / (0.6 * innerHeight) * 100) / 100 }; })) : [];
for (const p of stopList) {
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(p.y));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const file = resolve(out, `${String(idx).padStart(3, '0')}_${p.name}_${p.b}.png`);
  await page.screenshot({ path: file });
  shots.push(file); idx++;
}
for (const s of stops ? [] : beats) {
  for (let k = 0; k <= s.n; k += 0.5) {
    if (k === s.n && s !== beats[beats.length - 1]) continue; // 다음 장면 0비트와 같은 프레임
    const y = Math.round(s.top + k * 0.6 * vh);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = resolve(out, `${String(idx).padStart(3, '0')}_${s.name}_${k}.png`);
    await page.screenshot({ path: file });
    shots.push(file); idx++;
  }
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await browser.close();
server.kill();

const cols = mobile ? 8 : 4;
const scale = mobile ? 180 : 360;
execSync(`python -I "${resolve(root, 'tools', 'contact.py')}" "${out}" ${cols} ${scale}`, { stdio: 'inherit' });
console.log(JSON.stringify({ shots: shots.length, overflowX: overflow, errors, contact: resolve(out, 'contact.jpg') }, null, 1));

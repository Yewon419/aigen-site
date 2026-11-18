// 링크 미리보기 그림(site/og.png, 1200x630): 첫 화면을 그대로 찍는다
// usage: node tools/og.mjs
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from 'file:///C:/Users/windg/.claude/skills/kinetic-motion/scripts/node_modules/playwright/index.mjs';

const port = 8772;
const site = resolve(import.meta.dirname, '..', 'site');
const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: site, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(site, 'og.png') });
await browser.close();
server.kill();
console.log('og.png written');

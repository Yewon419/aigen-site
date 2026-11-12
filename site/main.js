// aigen-site main.js
// 계약: 모든 스타일은 스크롤 위치의 순수 함수다. render(b)는 장면 안의 비트 b(0..beats)만 읽는다.
// CSS transition, 타이머, Math.random을 쓰지 않는다. 1비트 = 60vh 스크롤.
(function () {
  'use strict';
  const M = window.M;
  const { clamp, prog, ease, kf } = M;
  const BEAT_VH = 0.6;
  const NEVER = 1e9;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { document.documentElement.classList.add('static'); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const bar = $('#bar');
  const tick = $('#tick');
  const gauge = $('#gauge');
  const cornerSection = $('#cornerSection');
  const bts = {};
  $$('.bt').forEach((el) => { bts[el.dataset.bt] = { el, glyphs: M.splitGlyphs(el), w: 0 }; });

  // 검은 글줄: 단어 단위로 나눈다 (링크는 단어로 통째)
  const lines = {};
  $$('.ln').forEach((el) => {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = p; words.push(s); frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName === 'A') {
          n.classList.add('w'); words.push(n);
        }
      });
    };
    walk(el);
    lines[el.dataset.k] = { el, words };
  });
  const lists = {};
  $$('.list').forEach((el) => { lists[el.dataset.k] = { el, items: $$('li', el) }; });
  const imgs = {};
  $$('.ph, .panel').forEach((el) => { imgs[el.dataset.k] = el; });
  const col = $('[data-k="me-col"]');

  // ---- 레이아웃 상수 (리사이즈마다 다시 잰다) ----
  const L = {};
  function layout() {
    L.vw = window.innerWidth; L.vh = window.innerHeight;
    L.narrow = L.vw < 720;
    L.m = clamp(0.05 * L.vw, 20, 96);
    L.D = clamp(0.09 * L.vw, 40, 144);
    L.H = L.D * 1.18;
    L.pad = L.D * 0.32;
    L.S = clamp(0.038 * L.vw, 22, 48);
    L.topY = Math.max(L.m, 32) + 40;
    L.centerY = L.vh / 2 - L.H / 2;
    L.phoneW = L.narrow ? 0.46 * L.vw : Math.min(0.3 * L.vw, 360, 0.78 * L.vh / (1950 / 900));
    L.phoneH = L.phoneW * (1950 / 900);
    L.phoneX = L.vw - L.m - L.phoneW;
    L.phoneY = L.narrow ? L.vh * 0.5 : L.vh * 0.16;
    L.cupTop0 = L.phoneY + 0.612 * L.phoneH;
    L.cupBottom = L.phoneY + 0.856 * L.phoneH;
    L.cupW = L.narrow ? 0.12 * L.vw : 0.09 * L.vw;
    L.stripY = L.narrow ? L.vh * 0.26 : L.vh * 0.3;
    L.stripH = L.H * 0.55;
    L.panelW = L.narrow ? L.vw - 2 * L.m : Math.min(0.36 * L.vw, 460);
    L.panelH = L.panelW * (1974 / 1400);
    L.panelX = L.vw - L.m - L.panelW;
    L.panelY = L.narrow ? L.vh * 0.52 : L.vh * 0.1;
    bar.style.setProperty('--pad', L.pad + 'px');
    // 띠 안 글자 폭
    Object.values(bts).forEach((b) => { b.glyphs.forEach((g) => (g.style.transform = 'none')); b.w = b.el.offsetWidth; });

    // 장면별 고정 위치
    const sub = L.centerY + L.H + 28;
    place('hero-sub', L.m, sub);
    place('hero-list', L.m, sub + L.S * 1.18 + 20);
    const under = L.topY + L.H + 32;
    place('su-1', L.m, under);
    place('su-2', L.m, under, L.narrow ? null : 0.6 * L.vw);
    L.gaugeX = L.phoneX - L.cupW - 28;
    const fx = L.m;
    const fy = L.narrow ? L.vh * 0.22 : L.vh * 0.42;
    const fw = L.narrow ? L.vw - 2 * L.m : L.gaugeX - fx - 48;
    ['su-3', 'su-4', 'su-5'].forEach((k) => place(k, fx, fy, fw));
    setImg('su-ph', L.phoneX, L.phoneY, L.phoneW);
    placeList('su-list', L.m, under, L.narrow ? null : 0.62 * L.vw);
    place('su-links', L.m, under);

    place('te-1', L.m, under);
    const ty = L.narrow ? L.stripY + L.stripH + 28 : L.vh * 0.5;
    const tw = L.narrow ? L.vw - 2 * L.m : L.vw - 2 * L.m - L.phoneW - 48;
    ['te-2', 'te-3', 'te-4', 'te-5'].forEach((k) => place(k, L.m, ty, tw));
    const tpy = L.narrow ? L.vh * 0.66 : L.vh * 0.42;
    setImg('te-ph1', L.phoneX, tpy, L.phoneW);
    setImg('te-ph2', L.phoneX, tpy, L.phoneW);
    placeList('te-list', L.m, under, L.narrow ? null : 0.62 * L.vw);
    place('te-links', L.m, under);

    place('gi-1', L.m, under);
    setImg('gi-panel', L.panelX, L.panelY, L.panelW);
    const gy = L.narrow ? L.vh * 0.16 : L.vh * 0.72;
    const gw = L.narrow ? L.vw - 2 * L.m : L.panelX - L.m - 48;
    ['gi-2', 'gi-3', 'gi-4', 'gi-5', 'gi-links'].forEach((k) => place(k, L.m, gy, gw));
    L.angleCx = L.narrow ? L.vw * 0.5 : L.m + 0.2 * L.vw;
    L.angleCy = L.narrow ? L.vh * 0.36 : L.vh * 0.5;
    L.angleW = L.narrow ? 0.5 * L.vw : 0.3 * L.vw;
    L.angleH = L.H * 0.42;

    col.style.top = under + 'px';
    col.style.width = (L.narrow ? L.vw - 2 * L.m : 0.66 * L.vw) + 'px';

    placeList('end-list', L.m, sub);
  }
  function place(k, x, y, w) {
    const ln = lines[k]; if (!ln) return;
    ln.el.style.left = x + 'px'; ln.el.style.top = y + 'px';
    if (w) ln.el.style.width = w + 'px';
  }
  function placeList(k, x, y, w) {
    const li = lists[k]; li.el.style.left = x + 'px'; li.el.style.top = y + 'px'; if (w) li.el.style.width = w + 'px';
  }
  function setImg(k, x, y, w) {
    const el = imgs[k]; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = w + 'px';
  }

  // ---- 프리미티브 ----
  // 띠 안 글자: 띠 아래 가장자리에서 글리프별로 솟고, 위로 빠진다. 띠의 overflow가 마스크다.
  function glyphsIn(id, b, tIn, tOut = NEVER, st = 0.06) {
    const g = bts[id]; const dist = L.H * 1.15;
    g.glyphs.forEach((s, i) => {
      const u = ease.outExpo(prog(b, tIn + i * st, tIn + i * st + 0.5));
      const v = ease.inCubic(prog(b, tOut + i * st, tOut + i * st + 0.4));
      s.style.transform = `translateY(${(1 - u) * dist - v * dist}px)`;
    });
  }
  function hideGlyphs(id) { const g = bts[id]; g.glyphs.forEach((s) => (s.style.transform = `translateY(${L.H * 1.15}px)`)); }
  // 검은 글줄: 단어가 16px 위로 올라오며 블러가 걷힌다. 나갈 때는 위로 밀려 사라진다.
  function words(k, b, tIn, tOut = NEVER, st = 0.045) {
    const ln = lines[k];
    ln.words.forEach((w, i) => {
      const u = ease.outExpo(prog(b, tIn + i * st, tIn + i * st + 0.45));
      const v = ease.inCubic(prog(b, tOut + i * st * 0.6, tOut + i * st * 0.6 + 0.35));
      w.style.transform = `translateY(${(1 - u) * 16 - v * 40}px)`;
      w.style.opacity = (u * (1 - v)).toFixed(3);
      w.style.filter = u < 0.999 ? `blur(${(1 - u) * 10}px)` : 'none';
    });
  }
  function listIn(k, b, tIn, tOut = NEVER, st = 0.12) {
    lists[k].items.forEach((li, i) => {
      const u = ease.outExpo(prog(b, tIn + i * st, tIn + i * st + 0.5));
      const v = ease.inCubic(prog(b, tOut + i * st * 0.5, tOut + i * st * 0.5 + 0.35));
      li.style.transform = `translateY(${(1 - u) * 18 - v * 40}px)`;
      li.style.opacity = (u * (1 - v)).toFixed(3);
    });
  }
  function img(k, x, y, op = 1) { const el = imgs[k]; el.style.transform = `translate(${x}px, ${y}px)`; el.style.opacity = op; }
  function setBar(x, y, w, h, rot = 0) {
    bar.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    bar.style.width = w + 'px'; bar.style.height = h + 'px';
  }
  const bw = (id) => bts[id].w + 2 * L.pad;

  // 링크 줄 밑줄 사각형 (단어 실측)
  function underline(linksKey) {
    const ln = lines[linksKey]; const el = ln.el;
    let lw = 0; ln.words.forEach((w) => { lw = Math.max(lw, w.offsetLeft + w.offsetWidth); });
    return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) + el.offsetHeight + 8, w: lw, h: 4 };
  }
  // 공통 꼬리. tL = 링크 등장 비트.
  // [tL-0.5, tL] 제목 띠 → 밑줄 / 링크 tL~tL+0.45 등장, tL+0.9 퇴장 / [tL+1.0, tL+1.55] 밑줄 → 다음 제목 띠 / 다음 글자 tL+1.15
  function tailLinks(b, tL, linksKey, prevId, nextId, prevOut) {
    const u = underline(linksKey);
    words(linksKey, b, tL, tL + 0.9);
    glyphsIn(prevId, b, -10, prevOut);
    glyphsIn(nextId, b, tL + 1.15);
    const u1 = ease.inOutCubic(prog(b, tL - 0.5, tL));
    const u2 = ease.inOutCubic(prog(b, tL + 1.0, tL + 1.55));
    return {
      x: L.m,
      y: M.lerp(M.lerp(L.topY, u.y, u1), L.topY, u2),
      w: M.lerp(M.lerp(bw(prevId), u.w, u1), bw(nextId), u2),
      h: M.lerp(M.lerp(L.H, u.h, u1), L.H, u2),
      under: u,
    };
  }

  // ---- 장면 ----
  const scenes = [];
  const scene = (name, render) => scenes.push({ name, render });

  // 히어로 3비트: 로드 즉시 완성 상태. 1.0부터 문장 퇴장, 1.5~2.5 띠가 위로 올라가며 「슈가캡」을 싣는다.
  scene('hero', (b, A) => {
    words('hero-sub', b, -1, 1.0);
    words('hero-list', b, -1, 1.15);
    if (!A) return;
    glyphsIn('name', b, -10, 1.2);
    glyphsIn('sugar', b, 2.2);
    const u = ease.inOutCubic(prog(b, 1.5, 2.5));
    setBar(L.m, M.lerp(L.centerY, L.topY, u), M.lerp(bw('name'), bw('sugar'), u), L.H);
  });

  // 슈가캡 11비트: 제목 → 선언 → 컵 수위(3~6) → 만든 방법(6.6~8.1) → 링크(8.8~9.7) → 템포루틴 제목(9.95)
  scene('sugar', (b, A) => {
    words('su-1', b, 0.1, 1.05);
    words('su-2', b, 1.2, 2.1);
    words('su-3', b, 3.0, 3.95);
    words('su-4', b, 4.0, 4.95);
    words('su-5', b, 5.0, 5.95);
    listIn('su-list', b, 6.9, 8.0);
    const pin = ease.outExpo(prog(b, 2.2, 3.0)), pout = ease.inCubic(prog(b, 6.0, 6.7));
    img('su-ph', (1 - pin) * (L.vw - L.phoneX + 40) + pout * (L.vw - L.phoneX + 40), 0);
    if (!A) return;
    glyphsIn('sugar', b, -10, 1.9);
    if (b < 8.3) {
      glyphsIn('made1', b, 6.6, 8.0);
      const toCup = ease.inOutCubic(prog(b, 2.0, 2.9));
      const level = kf(b, [[3, 0], [4, 0.25, ease.outExpo], [5, 0.5, ease.outExpo], [6, 0.72, ease.outExpo]]);
      const cupTop = L.cupTop0 + (L.cupBottom - L.cupTop0) * level;
      const back = ease.inOutCubic(prog(b, 6.0, 6.8));
      const x = M.lerp(M.lerp(L.m, L.gaugeX, toCup), L.m, back);
      const y = M.lerp(M.lerp(L.topY, cupTop, toCup), L.topY, back);
      const w = M.lerp(M.lerp(bw('sugar'), L.cupW, toCup), bw('made1'), back);
      const h = M.lerp(M.lerp(L.H, L.cupBottom - cupTop, toCup), L.H, back);
      setBar(x, y, w, h);
      gauge.style.transform = `translate(${L.gaugeX}px, ${L.cupTop0}px)`;
      gauge.style.width = L.cupW + 'px'; gauge.style.height = (L.cupBottom - L.cupTop0) + 'px';
      gauge.style.opacity = (ease.outCubic(prog(b, 2.6, 2.9)) * (1 - ease.inCubic(prog(b, 6.0, 6.3)))).toFixed(3);
      words('su-links', b, NEVER);
    } else {
      const r = tailLinks(b, 8.8, 'su-links', 'made1', 'tempo', 8.0);
      setBar(r.x, r.y, r.w, r.h);
    }
  });

  // 템포루틴 11비트: 제목 → 계절 띠(1.9~6) → 만든 방법(6.6~8.1) → 링크 → 짐살라빔 제목
  scene('tempo', (b, A) => {
    words('te-1', b, 0.1, 1.0);
    words('te-2', b, 2.0, 2.95);
    words('te-3', b, 3.0, 3.95);
    words('te-4', b, 4.0, 4.95);
    words('te-5', b, 5.0, 5.95);
    listIn('te-list', b, 6.9, 8.0);
    const p1in = ease.outExpo(prog(b, 2.3, 3.0)), p1out = ease.inCubic(prog(b, 4.0, 4.5));
    img('te-ph1', 0, (1 - p1in) * L.vh + p1out * L.vh);
    const p2in = ease.outExpo(prog(b, 4.4, 5.1)), p2out = ease.inCubic(prog(b, 6.0, 6.6));
    img('te-ph2', 0, (1 - p2in) * L.vh + p2out * L.vh);
    if (!A) return;
    glyphsIn('tempo', b, -10, 0.9);
    const stripW = L.vw - 2 * L.m;
    ['s0', 's1', 's2', 's3'].forEach((id, i) => {
      const el = bts[id].el; el.style.left = (stripW * (i + 0.5) / 4 - bts[id].w / 2) + 'px';
      glyphsIn(id, b, 1.9 + i * 0.1, 5.9 + i * 0.05, 0.08);
    });
    const k = kf(b, [[2, 0], [3, 1, ease.outExpo], [4, 2, ease.outExpo], [5, 3, ease.outExpo]]);
    const tv = ease.outExpo(prog(b, 1.95, 2.3)) * (1 - ease.inCubic(prog(b, 5.9, 6.2)));
    tick.style.transform = `translateX(${stripW * (k + 0.5) / 4}px) scaleY(${tv.toFixed(3)})`;
    if (b < 8.3) {
      glyphsIn('made2', b, 6.6, 8.0);
      const toStrip = ease.inOutCubic(prog(b, 1.0, 1.9));
      const back = ease.inOutCubic(prog(b, 6.0, 6.8));
      const y = M.lerp(M.lerp(L.topY, L.stripY, toStrip), L.topY, back);
      const w = M.lerp(M.lerp(bw('tempo'), stripW, toStrip), bw('made2'), back);
      const h = M.lerp(M.lerp(L.H, L.stripH, toStrip), L.H, back);
      setBar(L.m, y, w, h);
      words('te-links', b, NEVER);
    } else {
      const r = tailLinks(b, 8.8, 'te-links', 'made2', 'gim', 8.0);
      setBar(r.x, r.y, r.w, r.h);
    }
  });

  // 짐살라빔 9비트: 제목 → 각도선(1.9~6, 몸통→엉덩이→무릎) → 각도선이 눕혀져 링크 밑줄(6~6.5) → 링크 → 방식 제목
  scene('gim', (b, A) => {
    words('gi-1', b, 0.1, 1.0);
    words('gi-2', b, 2.0, 2.95);
    words('gi-3', b, 3.0, 3.95);
    words('gi-4', b, 4.0, 4.95);
    words('gi-5', b, 5.0, 5.95);
    const pin = ease.outExpo(prog(b, 1.3, 2.1)), pout = ease.inCubic(prog(b, 6.0, 6.6));
    img('gi-panel', (1 - pin) * (L.vw - L.panelX + 40) + pout * (L.vw - L.panelX + 40), 0);
    if (!A) return;
    glyphsIn('gim', b, -10, 0.9);
    glyphsIn('a0', b, 1.9, 2.9, 0.04);
    glyphsIn('a1', b, 3.0, 3.9, 0.04);
    const ax = L.angleCx - L.angleW / 2, ay = L.angleCy - L.angleH / 2;
    if (b < 6.0) {
      glyphsIn('a2', b, 4.0, 5.3, 0.04);
      const toLine = ease.inOutCubic(prog(b, 1.0, 1.9));
      const rot = kf(b, [[1.0, 0], [1.9, -32.59, ease.inOutCubic], [2.9, -32.59], [3.4, -69.89, ease.inOutCubic], [3.9, -69.89], [4.4, -108.35, ease.inOutCubic]]);
      setBar(M.lerp(L.m, ax, toLine), M.lerp(L.topY, ay, toLine), M.lerp(bw('gim'), L.angleW, toLine), M.lerp(L.H, L.angleH, toLine), rot);
      words('gi-links', b, NEVER);
    } else {
      const r = tailLinks(b, 6.5, 'gi-links', 'a2', 'method', 5.5);
      if (b < 6.5) {
        const u0 = ease.inOutCubic(prog(b, 6.0, 6.5));
        setBar(M.lerp(ax, r.under.x, u0), M.lerp(ay, r.under.y, u0), M.lerp(L.angleW, r.under.w, u0), M.lerp(L.angleH, r.under.h, u0), M.lerp(-108.35, 0, u0));
      } else {
        setBar(r.x, r.y, r.w, r.h);
      }
    }
  });

  scene('method', (b, A) => {
    const ks = ['me-1', 'me-2', 'me-3', 'me-4', 'me-5'];
    const cur = Math.min(4, Math.floor(b));
    ks.forEach((k, i) => {
      words(k, b, i + 0.15, 4.5);
      const dim = i < cur ? ease.outCubic(prog(b, cur + 0.1, cur + 0.5)) : 0;
      lines[k].el.style.color = dim > 0 ? `rgb(${Math.round(10 + 128 * dim)}, ${Math.round(10 + 128 * dim)}, ${Math.round(10 + 128 * dim)})` : '';
    });
    if (!A) return;
    glyphsIn('method', b, -10, 4.4);
    glyphsIn('name', b, 4.75);
    const u = ease.inOutCubic(prog(b, 4.5, 5.0));
    setBar(L.m, M.lerp(L.topY, L.centerY, u), M.lerp(bw('method'), bw('name'), u), L.H);
  });

  scene('end', (b, A) => {
    listIn("end-list", b, 0.15, NEVER, 0.08);
    if (!A) return;
    glyphsIn('name', b, -10);
    setBar(L.m, L.centerY, bw('name'), L.H);
  });

  // ---- 드라이버 ----
  const sections = $$('.scene');
  sections.forEach((s) => s.style.setProperty('--beats', s.dataset.beats));
  let lastY = -1, lastW = 0, lastH = 0;
  function frame() {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (vw !== lastW || vh !== lastH) { lastW = vw; lastH = vh; layout(); lastY = -1; }
    const y = window.scrollY;
    if (y !== lastY) {
      lastY = y;
      let active = 0;
      const bs = sections.map((s, i) => {
        const top = s.offsetTop, range = Number(s.dataset.beats) * BEAT_VH * vh;
        const b = clamp((y - top) / (BEAT_VH * vh), 0, Number(s.dataset.beats));
        if (y >= top && y < top + range + vh) active = i;
        return b;
      });
      Object.keys(bts).forEach(hideGlyphs);
      gauge.style.opacity = '0';
      scenes.forEach((sc, i) => sc.render(bs[i], i === active));
      cornerSection.textContent = sections[active].dataset.label;
    }
    requestAnimationFrame(frame);
  }
  document.fonts.ready.then(() => { layout(); requestAnimationFrame(frame); });
})();

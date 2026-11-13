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
  const over = $('#over');
  const cornerSection = $('#cornerSection');
  const bts = {};
  $$('.bt').forEach((el) => {
    const glyphs = el.hasAttribute('data-nosplit') ? [el.firstElementChild] : M.splitGlyphs(el);
    bts[el.dataset.bt] = { el, glyphs, w: 0 };
  });
  // 띠 위에 올라가야 하는 글줄은 #over 층으로 옮긴다 (정적 모드에선 원래 자리에 둔다)
  $$('.ln.inv').forEach((el) => over.appendChild(el));

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
  const chi = {}; $$('.chi').forEach((el) => { chi[el.dataset.i] = el; });
  const cups = {}; $$('.cup').forEach((el) => { cups[el.dataset.c] = el; });
  const chars = {}; $$('.ch').forEach((el) => { chars[el.dataset.ch] = el; });
  const byP = (a, b) => a.dataset.p - b.dataset.p;
  const phones = $$('.ph3[data-s="sugar"]').sort(byP);
  const tphones = $$('.ph3[data-s="tempo"]').sort(byP);
  const seasons = $$('.sphoto').sort((a, b) => a.dataset.s - b.dataset.s);
  const crops = {}; $$('.crop').forEach((el) => { crops[el.dataset.g] = el; });
  const doc = $('.doc');
  // 빛뜰 데스크 화면은 띠(기기 테두리) 위에 올라가야 해서 #over 층으로 옮긴다
  const dks = {}; $$('.dk').forEach((el) => { dks[el.dataset.d] = el; over.appendChild(el); });
  // 상태 기계 조각(1110x250)에서 잰 다섯 단계 원의 가로 중심 비율과 반폭
  const SMX = [0.132, 0.314, 0.495, 0.677, 0.859], SMR = 0.088;
  const AR = { sugar: 1, tempo: 1, gim: 855 / 207 };
  const countEl = bts.count.glyphs[0];
  const COUNT = 2057;
  // 컵 사진(720x1292)에서 잰 수면 높이 비율
  const SURF = { 100: 0.17, 80: 0.235, 50: 0.375, 30: 0.495 };

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
    L.stripY = L.narrow ? L.vh * 0.26 : L.vh * 0.3;
    L.stripH = L.H * 0.55;
    L.panelW = L.narrow ? L.vw - 2 * L.m : Math.min(0.36 * L.vw, 460);
    L.panelH = L.panelW * (1974 / 1400);
    L.panelX = L.vw - L.m - L.panelW;
    L.panelY = L.narrow ? L.vh * 0.52 : L.vh * 0.1;
    bar.style.setProperty('--pad', L.pad + 'px');
    // 띠 안 글자 폭 (카운터는 최종값으로 잰다)
    countEl.textContent = fmtCount(COUNT);
    Object.values(bts).forEach((b) => { b.el.style.left = ''; b.glyphs.forEach((g) => (g.style.transform = 'none')); b.w = b.el.offsetWidth; });

    // 히어로: 이름표 아래 문장, 목차, 아이콘 타일
    const sub = L.centerY + L.H + 28;
    place('hero-sub', L.m, sub);
    place('hero-list', L.m, sub + L.S * 1.18 + 20);
    // 챕터 막: 아이콘은 가운데 제목 위
    L.C = Math.min(0.16 * L.vh, 150, 0.3 * L.vw);

    // 슈가캡: 큰 컵(제품 컷)과 왼쪽 글 기둥
    const under = L.topY + L.H + 32;
    L.under = under;
    L.cupH = L.narrow ? 0.5 * L.vh : 0.84 * L.vh;
    L.cupW = L.cupH * (720 / 1292);
    L.cupX = L.narrow ? (L.vw - L.cupW) / 2 : Math.min(0.64 * L.vw - L.cupW / 2, L.vw - L.m - L.cupW);
    L.cupY = L.narrow ? L.vh - L.cupH - 0.03 * L.vh : (L.vh - L.cupH) / 2 + 0.03 * L.vh;
    L.lineT = Math.max(6, L.H * 0.07);
    const colW = L.narrow ? L.vw - 2 * L.m : Math.max(280, L.cupX - L.m - 48);
    Object.values(cups).forEach((el) => { el.style.width = L.cupW + 'px'; el.style.height = L.cupH + 'px'; });
    place('su-1', L.m, under, colW);
    place('su-2', L.m, under, colW);
    L.cntY = L.narrow ? under : 0.34 * L.vh;
    place('su-3', L.m, L.cntY + L.H + 24, colW);
    // 밤: 띠가 하늘이 되고, 작아진 컵 양옆에 로슈와 카인
    L.bandH = (L.narrow ? 0.42 : 0.46) * L.vh;
    place('su-4', L.m, under, L.narrow ? L.vw - 2 * L.m : 0.6 * L.vw);
    L.cupHn = (L.narrow ? 0.26 : 0.42) * L.vh;
    L.cupWn = L.cupHn * (720 / 1292);
    L.floor = 0.93 * L.vh;
    L.nightCup = { x: (L.vw - L.cupWn) / 2, y: L.floor - L.cupHn, s: L.cupHn / L.cupH };
    const chH = (L.narrow ? 0.16 : 0.32) * L.vh;
    const gap = L.narrow ? 6 : 0.02 * L.vw;
    const kW = chH * (408 / 614), rW = chH * (560 / 613);
    L.chars = {
      kain: { x: L.vw / 2 - L.cupWn / 2 - gap - kW, y: L.floor - chH, w: kW, h: chH },
      roshu: { x: L.vw / 2 + L.cupWn / 2 + gap, y: L.floor - chH, w: rW, h: chH },
    };
    Object.entries(chars).forEach(([k, el]) => { el.style.width = L.chars[k].w + 'px'; el.style.height = L.chars[k].h + 'px'; });
    // 만든 방법: 왼쪽 글, 오른쪽 폰 세 대
    L.pw = L.narrow ? 0.3 * L.vw : Math.min(0.15 * L.vw, 0.62 * L.vh / (1950 / 900));
    L.ph = L.pw * (1950 / 900);
    const pcx = L.narrow ? L.vw / 2 : 0.7 * L.vw;
    const py = L.narrow ? L.vh - L.ph - 0.05 * L.vh : (L.vh - L.ph) / 2 + 0.04 * L.vh;
    L.phones = [
      { x: pcx - 0.78 * L.pw - L.pw / 2, y: py + 0.04 * L.ph, r: -7 },
      { x: pcx - L.pw / 2, y: py, r: 0 },
      { x: pcx + 0.78 * L.pw - L.pw / 2, y: py + 0.04 * L.ph, r: 7 },
    ];
    [...phones, ...tphones].forEach((el) => { el.style.width = L.pw + 'px'; el.style.height = L.ph + 'px'; });
    const col2 = L.narrow ? L.vw - 2 * L.m : 0.42 * L.vw;
    place('su-5', L.m, under, col2);
    placeList('su-list', L.m, under + lines['su-5'].el.offsetHeight + 28, col2);
    place('su-links', L.m, under);

    place('te-1', L.m, under);
    const ty = L.narrow ? L.stripY + L.stripH + 28 : L.vh * 0.5;
    const tw = L.narrow ? L.vw - 2 * L.m : L.vw - 2 * L.m - L.phoneW - 48;
    ['te-2', 'te-3', 'te-4', 'te-5'].forEach((k) => place(k, L.m, ty, tw));
    const tpy = L.narrow ? L.vh * 0.66 : L.vh * 0.42;
    setImg('te-ph1', L.phoneX, tpy, L.phoneW);
    setImg('te-ph2', L.phoneX, tpy, L.phoneW);
    placeList('te-list', L.m, under, col2);
    seasons.forEach((el) => { el.style.width = L.vw + 'px'; el.style.height = L.stripY + 'px'; });
    place('te-links', L.m, under);

    place('gi-1', L.m, under);
    setImg('gi-panel', L.panelX, L.panelY, L.panelW);
    const gy = L.narrow ? L.vh * 0.16 : L.vh * 0.78;
    // 판넬 조각: 위에 상태 기계, 아래 칸에 체크포인트 → 아키텍처 → 기준값
    L.gcW = L.narrow ? L.vw - 2 * L.m : Math.min(0.42 * L.vw, 620);
    L.gcX = L.narrow ? L.m : L.vw - L.m - L.gcW;
    L.smH = L.gcW * (250 / 1110);
    L.smY = L.narrow ? 0.5 * L.vh : L.topY;
    L.slotY = L.smY + L.smH + 20;
    L.slotH = (L.narrow ? L.vh - L.m - 24 : 0.88 * L.vh) - L.slotY;
    [crops.sm, crops.smlit].forEach((el) => { el.style.left = L.gcX + 'px'; el.style.top = L.smY + 'px'; el.style.width = L.gcW + 'px'; el.style.height = L.smH + 'px'; });
    fitSlot(crops.skel, 940 / 550, L.gcX, L.slotY, L.gcW, L.slotH);
    fitSlot(crops.arch, 1600 / 347, L.gcX, L.slotY, L.gcW, L.slotH);
    fitSlot(crops.table, 656 / 548, L.gcX, L.slotY, L.gcW, L.slotH);
    const gw = L.narrow ? L.vw - 2 * L.m : L.gcX - L.m - 48;
    ['gi-2', 'gi-3', 'gi-4', 'gi-5', 'gi-links'].forEach((k) => place(k, L.m, gy, gw));
    L.angleCx = L.narrow ? L.vw * 0.5 : L.m + 0.2 * L.vw;
    L.angleCy = L.narrow ? L.vh * 0.36 : L.vh * 0.46;
    L.angleW = L.narrow ? 0.5 * L.vw : 0.3 * L.vw;
    L.angleH = L.H * 0.42;

    col.style.top = under + 'px';
    col.style.width = (L.narrow ? L.vw - 2 * L.m : 0.5 * L.vw) + 'px';
    // 방식: 띠가 지금 읽는 문장 왼쪽 표시줄이 된다. 오른쪽(좁으면 아래) 칸에 COPY.md 표와 검수 스틸
    L.meR = ['me-1', 'me-2', 'me-3', 'me-4', 'me-5'].map((k) => {
      const el = lines[k].el;
      return { x: Math.max(6, L.m - 18), y: under + el.offsetTop, w: 5, h: el.offsetHeight };
    });
    const msX = L.narrow ? L.m : L.m + 0.5 * L.vw + 48;
    const msW = L.vw - L.m - msX;
    const msY = L.narrow ? Math.max(0.64 * L.vh, under + col.offsetHeight + 16) : under;
    const msH = (L.narrow ? L.vh - L.m - 24 : 0.86 * L.vh) - msY;
    doc.style.left = msX + 'px'; doc.style.top = msY + 'px'; doc.style.width = msW + 'px';
    fitSlot(crops.stills, 1200 / 565, msX, msY, msW, msH);

    // 빛뜰 데스크: 왼쪽(좁으면 위) 글, 오른쪽(좁으면 아래) 기기 칸. 띠가 PC 화면 → 대화 창 → 폰 몸체 테두리가 된다
    const dw = L.narrow ? L.vw - 2 * L.m : 0.36 * L.vw;
    place('de-1', L.m, under, L.narrow ? L.vw - 2 * L.m : 0.6 * L.vw);
    const dty = L.narrow ? under : L.vh * 0.5;
    let dth = 0;
    ['de-2', 'de-3', 'de-4', 'de-5'].forEach((k) => { place(k, L.m, dty, dw); dth = Math.max(dth, lines[k].el.offsetHeight); });
    place('de-links', L.m, dty);
    L.fp = L.narrow ? 6 : 10;
    const ax0 = L.narrow ? L.m : L.m + dw + 64;
    const ay0 = (L.narrow ? under + dth + 24 : L.topY) + 4 * L.fp;
    const aw = L.vw - L.m - ax0 - 2 * L.fp;
    const ah = (L.narrow ? L.vh - L.m - 28 : 0.9 * L.vh) - ay0 - 4 * L.fp;
    const fitC = (ar, maxH) => {
      const h = Math.min(ah, maxH), w = Math.min(aw, h * ar), hh = w / ar;
      return { x: ax0 + L.fp + (aw - w) / 2, y: ay0 + (ah - hh) / 2, w, h: hh };
    };
    L.dk = { office: fitC(1440 / 904, 1e9), chat: fitC(760 / 700, 1e9), phone: fitC(390 / 664, 664 * 1.3) };
    const put = (el, r) => { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; };
    put(dks.office, L.dk.office); put(dks.chat, L.dk.chat);
    put(dks['phone-office'], L.dk.phone); put(dks['phone-chat'], L.dk.phone);

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
  function fitSlot(el, ar, x, y, w, h) {
    const fw = Math.min(w, h * ar);
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = fw + 'px'; el.style.height = fw / ar + 'px';
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
  function fmtCount(n) { return n.toLocaleString('en-US') + '종'; }

  // ---- 사각형 (띠는 언제나 사각형 하나다) ----
  const lerpR = (a, c, u) => ({ x: M.lerp(a.x, c.x, u), y: M.lerp(a.y, c.y, u), w: M.lerp(a.w, c.w, u), h: M.lerp(a.h, c.h, u) });
  const shrinkR = (r, s) => ({ x: r.x + (r.w * (1 - s)) / 2, y: r.y + (r.h * (1 - s)) / 2, w: r.w * s, h: r.h * s });
  const fullR = () => ({ x: 0, y: 0, w: L.vw, h: L.vh });
  const plateR = (id, y) => ({ x: L.m, y, w: bw(id), h: L.H });
  const sideR = (id) => {
    const h = id === 'gim' ? L.H * 0.62 : L.H;
    return { x: L.m + bw(id) + 16, y: L.topY + (L.H - h) / 2, w: h * AR[id], h };
  };
  // 챕터 막에서 제목 위 아이콘 자리
  const chRf = (id) => {
    const h = id === 'gim' ? L.C * 0.5 : L.C, w = h * AR[id];
    return { x: (L.vw - w) / 2, y: L.vh / 2 - L.H / 2 - 32 - h, w, h };
  };
  const setBarR = (r) => setBar(r.x, r.y, r.w, r.h);
  // 띠 안 글자를 화면 가로 중앙에 둔다 (띠 사각형 기준 좌표로 환산)
  function centerBt(id, r) { bts[id].el.style.left = (L.vw / 2 - r.x - bts[id].w / 2) + 'px'; }
  function icon(i, r, op) {
    const el = chi[i];
    el.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.w / 100})`;
    el.style.opacity = op.toFixed(3);
  }

  // 챕터 막: 화면을 덮은 띠가 이름표로 줄어든다. [t0, t0+0.7]
  function chapterBar(b, id, t0) {
    const u = ease.inOutCubic(prog(b, t0, t0 + 0.7));
    const r = lerpR(fullR(), plateR(id, L.topY), u);
    setBarR(r);
    bts[id].el.style.left = M.lerp(L.vw / 2 - r.x - bts[id].w / 2, L.pad, u) + 'px';
    return r;
  }
  // 챕터 아이콘: 가운데에서 이름표 오른쪽으로 내려앉고, outAt에 접혀 사라진다
  function chapterIcon(b, id, t0, outAt) {
    const u = ease.inOutCubic(prog(b, t0, t0 + 0.7));
    const o = ease.inCubic(prog(b, outAt, outAt + 0.35));
    if (o >= 1) return;
    icon(id, shrinkR(lerpR(chRf(id), sideR(id), u), 1 - o), 1);
  }
  // 띠가 화면 전체로 번지고 다음 제목이 가운데에서 솟는다. [t0, t0+0.6]
  function floodTo(b, from, nextId, t0) {
    const r = lerpR(from, fullR(), ease.inOutCubic(prog(b, t0, t0 + 0.6)));
    setBarR(r);
    glyphsIn(nextId, b, t0 + 0.45);
    centerBt(nextId, r);
    const i = ease.outExpo(prog(b, t0 + 0.5, t0 + 0.95));
    if (i > 0 && chi[nextId]) icon(nextId, shrinkR(chRf(nextId), 0.6 + 0.4 * i), i);
    return r;
  }

  // ---- 슈가캡 자산 ----
  const lineR = (f) => ({ x: L.cupX + 0.04 * L.cupW, y: L.cupY + f * L.cupH - L.lineT / 2, w: 0.92 * L.cupW, h: L.lineT });
  const LEVELS = [[3.0, 3.7, '100', '80'], [4.0, 4.7, '80', '50'], [5.0, 5.7, '50', '30']];
  const lineF = (b) => kf(b, [[3.0, SURF[100]], [3.7, SURF[80]], [4.0, SURF[80]], [4.7, SURF[50]], [5.0, SURF[50]], [5.7, SURF[30]]]);
  function renderCups(b) {
    Object.values(cups).forEach((el) => { el.style.opacity = '0'; el.style.clipPath = 'none'; });
    const enter = ease.outExpo(prog(b, 1.3, 2.2));
    if (enter <= 0) return;
    const shrink = ease.inOutCubic(prog(b, 7.9, 8.7));
    const exit = ease.inCubic(prog(b, 9.8, 10.4));
    if (exit >= 1) return;
    const n = L.nightCup;
    const x = M.lerp(L.cupX, n.x, shrink);
    const y = M.lerp(L.cupY + (1 - enter) * (L.vh - L.cupY + 40), n.y, shrink) + exit * (L.vh - n.y + 40);
    const s = M.lerp(1, n.s, shrink);
    const tf = `translate(${x}px, ${y}px) scale(${s})`;
    const show = (k, op, clip) => { const el = cups[k]; el.style.transform = tf; el.style.opacity = op.toFixed(3); el.style.clipPath = clip; };
    let seg = null;
    LEVELS.forEach((g) => { if (b >= g[0]) seg = g; });
    if (!seg) { show('100', 1, 'none'); return; }
    const [, t1, P, N] = seg;
    const yl = lineF(b) * L.cupH;
    if (b < t1) {
      show(N, 1, `inset(0 0 ${L.cupH - yl}px 0)`);
      show(P, 1, `inset(${yl}px 0 0 0)`);
    } else {
      show(N, 1, 'none');
      const f = 1 - prog(b, t1, t1 + 0.3);
      if (f > 0) show(P, f, `inset(${yl}px 0 0 0)`);
    }
  }
  function renderChars(b) {
    const out = ease.inCubic(prog(b, 9.8, 10.4));
    [['kain', 8.4], ['roshu', 8.55]].forEach(([k, t]) => {
      const el = chars[k], r = L.chars[k];
      const u = ease.outExpo(prog(b, t, t + 0.6));
      el.style.opacity = u > 0 && out < 1 ? '1' : '0';
      el.style.transform = `translate(${r.x}px, ${r.y + (1 - u) * (L.vh - r.y + 20) + out * (L.vh - r.y + 20)}px)`;
    });
  }
  // 폰 세 대 부채꼴: t0에 아래에서 솟고 [o0, o1]에 내려간다
  function renderFan(set, b, t0, o0, o1) {
    const out = ease.inCubic(prog(b, o0, o1));
    set.forEach((el, i) => {
      const p = L.phones[i];
      const t = t0 + [0.12, 0, 0.24][i];
      const u = ease.outExpo(prog(b, t, t + 0.7));
      el.style.opacity = u > 0 && out < 1 ? '1' : '0';
      el.style.transform = `translate(${p.x}px, ${p.y + (1 - u) * (L.vh - p.y + 40) + out * (L.vh - p.y + 40)}px) rotate(${p.r * u}deg)`;
    });
  }

  // 링크 줄 밑줄 사각형 (단어 실측)
  function underline(linksKey) {
    const ln = lines[linksKey]; const el = ln.el;
    let lw = 0; ln.words.forEach((w) => { lw = Math.max(lw, w.offsetLeft + w.offsetWidth); });
    return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) + el.offsetHeight + 8, w: lw, h: 4 };
  }

  // ---- 장면 ----
  const scenes = [];
  const scene = (name, render) => scenes.push({ name, render });

  // 히어로 3비트: 로드 즉시 완성 상태. 1.0부터 글 퇴장,
  // 1.3~2.0 이름표가 화면 전체로 번지고, 슈가캡 제목과 아이콘이 가운데에서 솟는다.
  scene('hero', (b, A) => {
    words('hero-sub', b, -1, 1.0);
    words('hero-list', b, -1, 1.1);
    if (!A) return;
    glyphsIn('name', b, -10, 1.15);
    const r = lerpR(plateR('name', L.centerY), fullR(), ease.inOutCubic(prog(b, 1.3, 2.0)));
    setBarR(r);
    glyphsIn('sugar', b, 1.8);
    centerBt('sugar', r);
    const ic = ease.outExpo(prog(b, 1.8, 2.25));
    if (ic > 0) icon('sugar', shrinkR(chRf('sugar'), 0.6 + 0.4 * ic), ic);
  });

  // 슈가캡 14비트
  // 0~1.3 챕터 막 → 이름표 / 1.3 선언과 컵 등장 / 2.1~2.8 이름표가 수면선이 된다
  // 3.0~5.7 기록할 때마다 수면선이 다음 수위로 내려가며 사진을 바꿔 닦는다
  // 5.9~6.6 수면선 → 카운터 이름표 / 7.85~8.6 카운터 → 밤하늘 / 9.85~10.55 밤하늘 → 「만든 방법」
  // 11.85~12.3 이름표 → 링크 밑줄 / 13.0~13.6 밑줄이 화면을 덮고 「템포루틴」
  scene('sugar', (b, A) => {
    words('su-1', b, 1.3, 2.3);
    words('su-2', b, 2.6, 5.55);
    words('su-3', b, 6.7, 7.85);
    words('su-4', b, 8.45, 9.85);
    words('su-5', b, 10.6, 11.85);
    listIn('su-list', b, 11.0, 11.85);
    words('su-links', b, 12.25, 13.0);
    renderCups(b);
    renderChars(b);
    renderFan(phones, b, 10.5, 12.55, 12.95);
    if (!A) return;
    glyphsIn('sugar', b, -10, 2.0);
    chapterIcon(b, 'sugar', 0.6, 1.75);
    countEl.textContent = fmtCount(Math.round(COUNT * ease.outCubic(prog(b, 6.45, 7.4))));
    glyphsIn('count', b, 6.35, 7.75);
    glyphsIn('made1', b, 10.3, 11.85);
    const cnt = plateR('count', L.cntY);
    const band = { x: 0, y: 0, w: L.vw, h: L.bandH };
    const made = plateR('made1', L.topY);
    if (b < 2.1) chapterBar(b, 'sugar', 0.6);
    else if (b < 2.8) setBarR(lerpR(plateR('sugar', L.topY), lineR(SURF[100]), ease.inOutCubic(prog(b, 2.1, 2.8))));
    else if (b < 5.9) setBarR(lineR(lineF(b)));
    else if (b < 7.85) setBarR(lerpR(lineR(SURF[30]), cnt, ease.inOutCubic(prog(b, 5.9, 6.6))));
    else if (b < 9.85) setBarR(lerpR(cnt, band, ease.inOutCubic(prog(b, 7.85, 8.6))));
    else if (b < 11.85) setBarR(lerpR(band, made, ease.inOutCubic(prog(b, 9.85, 10.55))));
    else if (b < 13.0) setBarR(lerpR(made, underline('su-links'), ease.inOutCubic(prog(b, 11.85, 12.3))));
    else floodTo(b, underline('su-links'), 'tempo', 13.0);
  });

  // 사진 여러 장을 한 칸에서 바꿔 닦는다. ins[k] = [t0, t1, 방향]. 다음 장이 다 덮으면 앞 장은 숨긴다.
  // 방향 'up' = 아래에서 위로 드러남, 'right' = 왼쪽에서 오른쪽으로 드러남
  // cover=false면 크기가 다른 장끼리라 덮지 않고, 앞 장이 다음 장 직전 0.35비트 동안 위로 접힌다
  function wipeSet(set, b, ins, out, cover = true) {
    set.forEach((el, k) => {
      const [t0, t1, dir] = ins[k];
      const u = ease.outExpo(prog(b, t0, t1));
      const nx = ins[k + 1];
      const n = nx ? ease.outExpo(prog(b, nx[0], nx[1])) : 0;
      const fold = nx && !cover ? ease.inCubic(prog(b, nx[0] - 0.35, nx[0])) : 0;
      const vis = u > 0 && (cover ? n < 1 : fold < 1) && out < 1;
      el.style.opacity = vis ? '1' : '0';
      if (!vis) return;
      const top = dir === 'up' ? (1 - u) * 100 : 0;
      const right = dir === 'right' ? (1 - u) * 100 : 0;
      el.style.clipPath = `inset(${Math.max(top, out * 100).toFixed(2)}% ${right.toFixed(2)}% ${(fold * 100).toFixed(2)}% 0)`;
    });
  }

  // 템포루틴 12.1비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 제목 → 계절 띠(1.9~6, 띠 위로 그 계절 사진) → 만든 방법과 폰 세 대(6.6~) → 링크(8.8) → 밑줄이 화면을 덮고 「짐살라빔」(9.8)
  const TEMPO_OFF = 1.3;
  scene('tempo', (bRaw, A) => {
    const b = bRaw - TEMPO_OFF;
    if (A && bRaw < TEMPO_OFF + 1.5) chapterIcon(bRaw, 'tempo', 0.6, TEMPO_OFF + 0.75);
    tempoBody(b, A);
    if (A && bRaw < TEMPO_OFF) chapterBar(bRaw, 'tempo', 0.6);
  });
  function tempoBody(b, A) {
    words('te-1', b, 0.1, 1.0);
    words('te-2', b, 2.0, 2.6);
    words('te-3', b, 3.05, 3.6);
    words('te-4', b, 4.05, 4.6);
    words('te-5', b, 5.05, 5.95);
    listIn('te-list', b, 6.9, 8.0);
    const p1in = ease.outExpo(prog(b, 2.3, 3.0)), p1out = ease.inCubic(prog(b, 4.0, 4.5));
    img('te-ph1', 0, (1 - p1in) * L.vh + p1out * L.vh);
    const p2in = ease.outExpo(prog(b, 4.4, 5.1)), p2out = ease.inCubic(prog(b, 6.0, 6.6));
    img('te-ph2', 0, (1 - p2in) * L.vh + p2out * L.vh);
    // 계절 사진: 겨울은 띠에서 위로 자라고, 커서가 다음 칸으로 갈 때마다 다음 계절이 왼쪽부터 덮는다. 6.0에 띠 안으로 접힌다
    wipeSet(seasons, b, [[1.9, 2.6, 'up'], [3.0, 3.7, 'right'], [4.0, 4.7, 'right'], [5.0, 5.7, 'right']], ease.inOutCubic(prog(b, 5.9, 6.4)));
    renderFan(tphones, b, 6.7, 9.3, 9.75);
    if (!A) { words('te-links', b, NEVER); return; }
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
      const u = underline('te-links');
      words('te-links', b, 8.8, 9.7);
      if (b < 9.8) setBarR(lerpR(plateR('made2', L.topY), u, ease.inOutCubic(prog(b, 8.3, 8.8))));
      else floodTo(b, u, 'gim', 9.8);
    }
  }

  // 짐살라빔 9.8비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 제목 → 이름표가 각도선이 된다(1.0~1.9). 각도선이 몸통→엉덩이→무릎 기준값으로 기울 때
  // 오른쪽 판넬 조각: 상태 기계는 다섯 단계가 차례로 켜지고, 아래 칸은 체크포인트 → 아키텍처 → 기준값 표
  // 6.0~6.5 각도선이 눕혀져 링크 밑줄, 판넬 전체가 들어온다 / 7.5 밑줄이 화면을 덮고 「AI와 일하는 방식」
  const GIM_OFF = 1.3;
  scene('gim', (bRaw, A) => {
    const b = bRaw - GIM_OFF;
    if (A && bRaw < GIM_OFF + 1.5) chapterIcon(bRaw, 'gim', 0.6, GIM_OFF + 0.75);
    gimBody(b, A);
    if (A && bRaw < GIM_OFF) chapterBar(bRaw, 'gim', 0.6);
  });
  function gimBody(b, A) {
    words('gi-1', b, 0.1, 1.0);
    words('gi-2', b, 2.0, 2.6);
    words('gi-3', b, 3.05, 3.6);
    words('gi-4', b, 4.05, 4.6);
    words('gi-5', b, 5.05, 5.95);
    // 판넬 조각은 오른쪽으로 밀려나고 판넬 전체가 그 자리에 들어온다
    const push = ease.inCubic(prog(b, 5.95, 6.4));
    const dx = push * (L.vw - L.gcX + 40);
    const smIn = ease.outExpo(prog(b, 1.6, 2.3));
    crops.sm.style.opacity = smIn > 0 && push < 1 ? '0.3' : '0';
    crops.sm.style.transform = `translate(${dx}px, ${(1 - smIn) * 24}px)`;
    // 켜진 단계: 1.9부터 0.68비트마다 한 칸씩
    const st = kf(b, [[1.9, 0], [2.4, 0], [2.6, 1, ease.outExpo], [3.1, 1], [3.3, 2, ease.outExpo], [3.8, 2], [4.0, 3, ease.outExpo], [4.5, 3], [4.7, 4, ease.outExpo]]);
    const i0 = Math.floor(st), cx = M.lerp(SMX[i0], SMX[Math.min(4, i0 + 1)], st - i0);
    const lit = crops.smlit;
    lit.style.opacity = smIn > 0 && push < 1 ? smIn.toFixed(3) : '0';
    lit.style.transform = crops.sm.style.transform;
    lit.style.clipPath = `inset(0 ${((1 - cx - SMR) * 100).toFixed(2)}% 0 ${((cx - SMR) * 100).toFixed(2)}%)`;
    const slot = [crops.skel, crops.arch, crops.table];
    wipeSet(slot, b, [[1.9, 2.6, 'up'], [3.0, 3.7, 'up'], [4.0, 4.7, 'up']], 0, false);
    slot.forEach((el) => { el.style.transform = `translateX(${dx}px)`; if (push >= 1) el.style.opacity = '0'; });
    const pin = ease.outExpo(prog(b, 6.3, 7.0));
    img('gi-panel', (1 - pin) * (L.vw - L.panelX + 40), 0, b < 8.1 ? 1 : 0);
    if (!A) { words('gi-links', b, NEVER); return; }
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
      const u = underline('gi-links');
      words('gi-links', b, 6.5, 7.4);
      if (b < 7.5) {
        const u0 = ease.inOutCubic(prog(b, 6.0, 6.5));
        setBar(M.lerp(ax, u.x, u0), M.lerp(ay, u.y, u0), M.lerp(L.angleW, u.w, u0), M.lerp(L.angleH, u.h, u0), M.lerp(-108.35, 0, u0));
      } else {
        floodTo(b, u, 'desk', 7.5);
      }
    }
  }

  // 빛뜰 데스크 11.7비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 선언(0.1) → 선언이 빠진 뒤 이름표가 PC 화면 테두리가 되고 사무실이 드러난다(1.4~2.6)
  // → 테두리가 대화 창 크기로(3.6) → 폰 몸체로 줄어든다(5.2) → 폰 사무실, 폰 대화 창과 승인 요청
  // 7.95~8.45 폰 몸체가 링크 밑줄 / 9.4 밑줄이 화면을 덮고 「AI와 일하는 방식」
  const DESK_OFF = 1.3;
  const frameR = (r, p, ky = 1) => ({ x: r.x - p, y: r.y - p * ky, w: r.w + 2 * p, h: r.h + 2 * p * ky });
  // 화면 하나: [i0, i1]에 아래에서 위(또는 왼쪽에서 오른쪽)로 드러나고, [f0, f1]에 아래에서 위로 접힌다
  function screenIn(el, b, i0, i1, f0, f1, dir = 'up') {
    const u = ease.outExpo(prog(b, i0, i1));
    const f = ease.inCubic(prog(b, f0, f1));
    el.style.opacity = u > 0 && f < 1 ? '1' : '0';
    const top = dir === 'up' ? (1 - u) * 100 : 0;
    const right = dir === 'right' ? (1 - u) * 100 : 0;
    el.style.clipPath = `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${(f * 100).toFixed(2)}% 0)`;
  }
  scene('desk', (bRaw, A) => {
    const b = bRaw - DESK_OFF;
    deskBody(b, A);
    if (A && bRaw < DESK_OFF) chapterBar(bRaw, 'desk', 0.6);
  });
  function deskBody(b, A) {
    words('de-1', b, 0.1, 1.0);
    words('de-2', b, 2.0, 3.4);
    words('de-3', b, 4.0, 5.0);
    words('de-4', b, 5.6, 6.3);
    words('de-5', b, 6.9, 7.6);
    screenIn(dks.office, b, 2.0, 2.6, 3.3, 3.6);
    screenIn(dks.chat, b, 3.95, 4.55, 4.85, 5.2);
    screenIn(dks['phone-office'], b, 5.6, 6.2, 7.1, 7.11);
    screenIn(dks['phone-chat'], b, 6.5, 7.1, 7.6, 7.95, 'right');
    if (!A) { words('de-links', b, NEVER); return; }
    glyphsIn('desk', b, -10, 0.9);
    const phoneF = frameR(L.dk.phone, L.fp * 1.4, 2.2);
    if (b < 7.95) {
      const R = [frameR(L.dk.office, L.fp), frameR(L.dk.chat, L.fp), phoneF];
      const f = kf(b, [[3.6, 0], [3.95, 1, ease.inOutCubic], [5.2, 1], [5.6, 2, ease.inOutCubic]]);
      const i = Math.floor(f);
      const dev = lerpR(R[i], R[Math.min(2, i + 1)], f - i);
      setBarR(lerpR(plateR('desk', L.topY), dev, ease.inOutCubic(prog(b, 1.4, 2.0))));
      words('de-links', b, NEVER);
    } else {
      const u = underline('de-links');
      words('de-links', b, 8.45, 9.3);
      if (b < 9.4) setBarR(lerpR(phoneF, u, ease.inOutCubic(prog(b, 7.95, 8.45))));
      else floodTo(b, u, 'method', 9.4);
    }
  }

  // 방식 7비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 이름표가 지금 읽는 문장 왼쪽 표시줄로 줄어들어 문장마다 내려간다. 오른쪽은 COPY.md 표 → 이 페이지 검수 스틸
  // 5.1~5.6 표시줄이 가운데 이름표가 된다(엔드와 같은 자리)
  const METHOD_OFF = 1.3;
  const meMark = (f) => { const i = Math.floor(f), j = Math.min(4, i + 1); return lerpR(L.meR[i], L.meR[j], f - i); };
  scene('method', (bRaw, A) => {
    const b = bRaw - METHOD_OFF;
    const ks = ['me-1', 'me-2', 'me-3', 'me-4', 'me-5'];
    const cur = clamp(Math.floor(b - 0.6), 0, 4);
    ks.forEach((k, i) => {
      words(k, b, i + 0.75, 5.1);
      const dim = i < cur ? ease.outCubic(prog(b, cur + 0.7, cur + 1.1)) : 0;
      lines[k].el.style.color = dim > 0 ? `rgb(${Math.round(10 + 128 * dim)}, ${Math.round(10 + 128 * dim)}, ${Math.round(10 + 128 * dim)})` : '';
    });
    const out = ease.inCubic(prog(b, 5.0, 5.4));
    const dIn = ease.outExpo(prog(b, 0.85, 1.5));
    const sIn = ease.outExpo(prog(b, 2.75, 3.45));
    const dFold = ease.inCubic(prog(b, 2.4, 2.75));
    doc.style.opacity = dIn > 0 && dFold < 1 ? '1' : '0';
    doc.style.transform = `translateY(${(1 - dIn) * 24}px)`;
    doc.style.clipPath = `inset(0 0 ${(dFold * 100).toFixed(2)}% 0)`;
    const st = crops.stills;
    st.style.opacity = sIn > 0 && out < 1 ? '1' : '0';
    st.style.clipPath = `inset(${((1 - sIn) * 100).toFixed(2)}% 0 0 0)`;
    st.style.transform = `translateY(${out * 40}px)`;
    if (!A) return;
    if (bRaw < METHOD_OFF) { glyphsIn('method', b, -10); chapterBar(bRaw, 'method', 0.6); return; }
    glyphsIn('method', b, -10, 0.5);
    glyphsIn('name', b, 5.35);
    const f = kf(b, [[0.6, 0], [1.55, 0], [1.9, 1, ease.inOutCubic], [2.55, 1], [2.9, 2, ease.inOutCubic], [3.55, 2], [3.9, 3, ease.inOutCubic], [4.55, 3], [4.9, 4, ease.inOutCubic]]);
    if (b < 1.0) setBarR(lerpR(plateR('method', L.topY), meMark(0), ease.inOutCubic(prog(b, 0.55, 1.0))));
    else if (b < 5.1) setBarR(meMark(f));
    else setBarR(lerpR(meMark(4), plateR('name', L.centerY), ease.inOutCubic(prog(b, 5.1, 5.6))));
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
        const top = s.offsetTop;
        if (y >= top) active = i;
        return clamp((y - top) / (BEAT_VH * vh), 0, Number(s.dataset.beats));
      });
      Object.keys(bts).forEach(hideGlyphs);
      Object.values(bts).forEach((g) => (g.el.style.left = ''));
      Object.values(chi).forEach((el) => (el.style.opacity = '0'));
      scenes.forEach((sc, i) => sc.render(bs[i], i === active));
      cornerSection.textContent = sections[active].dataset.label;
    }
    requestAnimationFrame(frame);
  }
  // 투명한 채로 기다리던 사진이 첫 등장 프레임에 비어 보이지 않게 미리 디코드한다
  [...phones, ...tphones, ...seasons, ...Object.values(crops), ...Object.values(dks), ...Object.values(cups), ...Object.values(chars)].forEach((el) => el.decode().catch((e) => console.warn('decode', el.src, e)));
  document.fonts.ready.then(() => { layout(); requestAnimationFrame(frame); });
})();

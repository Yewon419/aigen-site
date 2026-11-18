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
  if (reduced) {
    document.documentElement.classList.add('static');
    // 모션 줄이기면 티저는 자동 재생하지 않고 직접 튼다
    document.querySelectorAll('video').forEach((v) => { v.controls = true; });
    return;
  }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const bar = $('#bar');
  const tick = $('#tick');
  const over = $('#over');
  const cornerSection = $('#cornerSection');
  const cornersB = [...document.querySelectorAll('.corner.bl, .corner.br')];
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
  // 도표: 상자(.nd) 사이 화살표와 되돌이 화살표(data-back="from>to")는 SVG로 그린다
  const SVGNS = 'http://www.w3.org/2000/svg';
  const flows = {};
  $$('.flow').forEach((el) => {
    const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'fl-ar'); svg.setAttribute('aria-hidden', 'true');
    el.prepend(svg);
    const path = (cls) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', cls); if (cls === 'ar') p.setAttribute('pathLength', '1'); svg.appendChild(p); return p; };
    const nodes = $$('.nd', el);
    const arrows = nodes.slice(1).map(() => ({ line: path('ar'), head: path('hd') }));
    const bk = el.dataset.back ? el.dataset.back.split('>').map(Number) : null;
    const back = bk ? { from: bk[0], to: bk[1], line: path('ar'), head: path('hd'), label: $('.fl-bk', el) } : null;
    flows[el.dataset.k] = { el, svg, nodes, arrows, back, R: [], x: 0, y: 0, w: 0, h: 0 };
  });
  over.appendChild(flows['me-flow'].el);
  // 슈가캡 주간 기준 막대와 나라별 카탈로그
  const wk = { el: $('.wk'), bars: $$('.wk-b'), marks: $$('.wk-b i, .wk-b u'), cap: $('.wk figcaption') };
  const cat = { el: $('.cat'), boxes: $$('.cn'), cap: $('.cat figcaption') };
  // 빛뜰 데스크 구조: 서버 상자는 띠가 칠하므로 #over 층에 둔다. 화살표 = [보내는 쪽, 받는 쪽]
  const acEl = $('.ac'); over.appendChild(acEl);
  const ac = { el: acEl, n: {}, cap: $('figcaption', acEl), svg: document.createElementNS(SVGNS, 'svg') };
  $$('.nd', acEl).forEach((el) => { ac.n[el.dataset.a] = el; });
  ac.svg.setAttribute('class', 'fl-ar'); ac.svg.setAttribute('aria-hidden', 'true'); acEl.prepend(ac.svg);
  ac.arrows = [['term', 'srv'], ['srv', 'sdk'], ['srv', 'pc'], ['srv', 'ph'], ['srv', 'push']].map(([from, to]) => {
    const line = document.createElementNS(SVGNS, 'path'); line.setAttribute('class', 'ar'); line.setAttribute('pathLength', '1');
    const head = document.createElementNS(SVGNS, 'path'); head.setAttribute('class', 'hd');
    ac.svg.append(line, head);
    return { from, to, line, head };
  });
  // 템포루틴 데이터가 가는 곳
  const pv = { el: $('.pv'), rows: $$('.pv-r').map((r) => [...r.children]), cap: $('.pv figcaption') };
  const chi = {}; $$('.chi').forEach((el) => { chi[el.dataset.i] = el; });
  const cups = {}; $$('.cup').forEach((el) => { cups[el.dataset.c] = el; });
  const chars = {}; $$('.ch').forEach((el) => { chars[el.dataset.ch] = el; });
  const seasons = $$('.sphoto').sort((a, b) => a.dataset.s - b.dataset.s);
  const crops = {}; $$('.crop').forEach((el) => { crops[el.dataset.g] = el; });
  const doc = $('.doc');
  // 빛뜰 데스크 화면은 띠(기기 테두리) 위에 올라가야 해서 #over 층으로 옮긴다
  const dks = {}; $$('.dk').forEach((el) => { dks[el.dataset.d] = el; over.appendChild(el); });
  // 템포루틴 티저도 띠(필름 테두리) 위에 올라간다
  const tfilm = $('.tv'); over.appendChild(tfilm);
  let filmOn = false;
  const themes = $$('.th').sort((a, b) => a.dataset.t - b.dataset.t);
  // 상태 기계 조각(1110x250)에서 잰 다섯 단계 원의 가로 중심 비율과 반폭
  const SMX = [0.132, 0.314, 0.495, 0.677, 0.859], SMR = 0.088;
  const AR = { sugar: 1, tempo: 1, gim: 855 / 207, desk: 1 };
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
    L.D = clamp(Math.min(0.09 * L.vw, 0.145 * L.vh), 40, 144);
    L.H = L.D * 1.18;
    L.pad = L.D * 0.32;
    L.S = clamp(0.038 * L.vw, 22, 48);
    L.topY = Math.max(L.m, 32) + 40;
    L.safeB = L.vh - L.m - 40;
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
    place('su-2b', L.m, under, colW);
    L.cntY = L.narrow ? under : 0.34 * L.vh;
    place('su-3', L.m, L.cntY + L.H + 24, colW);
    // 주간 기준 막대: 기준 문장 아래, 좁으면 컵 위 빈칸에 맞춘다
    const wkY = under + lines['su-2b'].el.offsetHeight + (L.narrow ? 16 : 40);
    wk.el.style.left = L.m + 'px'; wk.el.style.top = wkY + 'px'; wk.el.style.width = Math.min(colW, 560) + 'px';
    wk.el.style.setProperty('--wh', '0px');
    const wkAvail = (L.narrow ? L.cupY - 12 : L.safeB) - wkY;
    wk.el.style.setProperty('--wh', clamp(wkAvail - wk.el.offsetHeight, 36, L.narrow ? 120 : 240) + 'px');
    // 나라별 카탈로그: 카탈로그 문장 아래
    const catY = L.cntY + L.H + 24 + lines['su-3'].el.offsetHeight + (L.narrow ? 14 : 32);
    cat.el.style.left = L.m + 'px'; cat.el.style.top = catY + 'px'; cat.el.style.width = Math.min(colW, 640) + 'px';
    // 좁은 화면: 카탈로그가 떠 있는 동안 컵이 그 아래로 비켜난다
    L.cupDrop = L.narrow ? Math.max(0, catY + cat.el.offsetHeight + 12 - L.cupY) : 0;
    // 밤: 띠가 하늘이 되고, 작아진 컵 양옆에 로슈와 카인
    place('su-4', L.m, under, L.narrow ? L.vw - 2 * L.m : 0.6 * L.vw);
    L.bandH = Math.max((L.narrow ? 0.42 : 0.46) * L.vh, under + lines['su-4'].el.offsetHeight + 0.04 * L.vh);
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
    // 만든 방법: 한 줄 요약 아래 데이터에서 스토어까지 이어지는 도표(좁으면 세로)
    place('su-5', L.m, under, L.vw - 2 * L.m);
    const sf = flows['su-flow'];
    const sfy = under + lines['su-5'].el.offsetHeight + (L.narrow ? 20 : 40);
    layoutFlow(sf, L.m, L.vw - 2 * L.m, L.narrow);
    moveFlow(sf, L.narrow ? sfy : Math.max(sfy, (sfy + L.safeB - sf.h) / 2 - 0.04 * L.vh));
    place('su-links', L.m, under);

    place('te-1', L.m, under);
    const ty = L.narrow ? L.stripY + L.stripH + 28 : L.vh * 0.5;
    const tw = L.narrow ? L.vw - 2 * L.m : L.vw - 2 * L.m - L.phoneW - 48;
    ['te-2', 'te-3', 'te-4', 'te-5'].forEach((k) => place(k, L.m, ty, tw));
    pv.el.style.left = L.m + 'px'; pv.el.style.width = tw + 'px';
    pv.el.style.top = (ty + lines['te-5'].el.offsetHeight + (L.narrow ? 16 : 36)) + 'px';
    const tpy = L.narrow ? L.vh * 0.66 : L.vh * 0.42;
    setImg('te-ph1', L.phoneX, tpy, L.phoneW);
    setImg('te-ph2', L.phoneX, tpy, L.phoneW);
    const tf = flows['te-flow'];
    layoutFlow(tf, L.m, L.vw - 2 * L.m, L.narrow);
    moveFlow(tf, L.narrow ? under : Math.max(under, (under + L.safeB - tf.h) / 2));
    seasons.forEach((el) => { el.style.width = L.vw + 'px'; el.style.height = L.stripY + 'px'; });
    place('te-links', L.m, under);
    // 티저: 왼쪽(좁으면 위) 글, 오른쪽(좁으면 아래) 9:16 필름. 띠가 필름 테두리가 된다
    const fcw = L.narrow ? L.vw - 2 * L.m : 0.36 * L.vw;
    place('te-6', L.m, L.narrow ? under : L.vh * 0.5, fcw);
    const ffp = L.narrow ? 6 : 10;
    const fx0 = L.narrow ? L.m : L.m + fcw + 64;
    const fy0 = (L.narrow ? under + lines['te-6'].el.offsetHeight + 24 : L.topY) + ffp;
    const fah = Math.min((L.narrow ? L.vh - L.m - 28 : Math.min(0.9 * L.vh, L.vh - L.m - 24)) - fy0 - ffp, 960);
    const faw = L.vw - L.m - fx0 - 2 * ffp;
    const ffw = Math.min(faw, fah * 9 / 16), ffh = ffw * 16 / 9;
    L.film = { x: fx0 + ffp + (faw - ffw) / 2, y: fy0 + (fah - ffh) / 2, w: ffw, h: ffh };
    L.filmF = { x: L.film.x - ffp, y: L.film.y - ffp, w: ffw + 2 * ffp, h: ffh + 2 * ffp };
    putR(tfilm, L.film);
    // 테마 여섯 장: 글 아래 한 줄(좁으면 세 장씩 두 줄), 띠는 그 아래 선반
    place('te-7', L.m, under, L.narrow ? L.vw - 2 * L.m : 0.6 * L.vw);
    const cols = L.narrow ? 3 : 6, rows = 6 / cols, tg = L.narrow ? 10 : 16;
    const thy = under + lines['te-7'].el.offsetHeight + (L.narrow ? 24 : 40);
    const thAvail = (L.narrow ? L.vh - L.m - 40 : Math.min(0.9 * L.vh, L.vh - L.m - 24)) - thy - 24;
    const thw = Math.min((L.vw - 2 * L.m - (cols - 1) * tg) / cols, ((thAvail - (rows - 1) * tg) / rows) * (480 / 968));
    const thh = thw * (968 / 480);
    L.themes = themes.map((el, i) => ({ x: L.m + (i % cols) * (thw + tg), y: thy + Math.floor(i / cols) * (thh + tg), w: thw, h: thh }));
    themes.forEach((el, i) => putR(el, L.themes[i]));
    L.shelf = { x: L.m, y: thy + rows * thh + (rows - 1) * tg + 14, w: cols * thw + (cols - 1) * tg, h: L.lineT };

    place('gi-1', L.m, under);
    setImg('gi-panel', L.panelX, L.panelY, L.panelW);
    const gy = L.narrow ? L.vh * 0.16 : L.vh * 0.78;
    // 판넬 조각: 위에 상태 기계, 아래 칸에 체크포인트 → 아키텍처 → 기준값
    L.gcW = L.narrow ? L.vw - 2 * L.m : Math.min(0.42 * L.vw, 620);
    L.gcX = L.narrow ? L.m : L.vw - L.m - L.gcW;
    L.smH = L.gcW * (250 / 1110);
    L.smY = L.narrow ? 0.5 * L.vh : L.topY;
    L.slotY = L.smY + L.smH + 20;
    L.slotH = (L.narrow ? L.vh - L.m - 24 : Math.min(0.88 * L.vh, L.vh - L.m - 24)) - L.slotY;
    [crops.sm, crops.smlit].forEach((el) => { el.style.left = L.gcX + 'px'; el.style.top = L.smY + 'px'; el.style.width = L.gcW + 'px'; el.style.height = L.smH + 'px'; });
    fitSlot(crops.skel, 940 / 550, L.gcX, L.slotY, L.gcW, L.slotH);
    fitSlot(crops.arch, 1600 / 347, L.gcX, L.slotY, L.gcW, L.slotH);
    fitSlot(crops.table, 656 / 548, L.gcX, L.slotY, L.gcW, L.slotH);
    const gw = L.narrow ? L.vw - 2 * L.m : L.gcX - L.m - 48;
    ['gi-2', 'gi-3', 'gi-4', 'gi-5', 'gi-links'].forEach((k) => place(k, L.m, gy, gw));
    if (!L.narrow) ['gi-2', 'gi-3', 'gi-4', 'gi-5'].forEach((k) => place(k, L.m, Math.min(gy, L.safeB - lines[k].el.offsetHeight)));
    L.angleCx = L.narrow ? L.vw * 0.5 : L.m + 0.2 * L.vw;
    // 좁은 화면: 각도선은 글 아래, 상태 기계 위 빈칸에 들어가도록 길이와 중심을 맞춘다
    const gtb = gy + Math.max(...['gi-2', 'gi-3', 'gi-4', 'gi-5'].map((k) => lines[k].el.offsetHeight));
    L.angleW = L.narrow ? Math.min(0.5 * L.vw, L.smY - gtb - 24) : 0.3 * L.vw;
    L.angleCy = L.narrow ? Math.min(Math.max(L.vh * 0.36, gtb + 12 + L.angleW / 2), L.smY - 12 - L.angleW / 2) : L.vh * 0.46;
    L.angleH = L.H * 0.42;

    // 방식: 다섯 단계 도표(되돌이 화살표 포함). 띠가 지금 단계 상자를 칠한다. 아래 칸에 COPY.md 표 → 검수 스틸 → 마지막 문장
    const mf = flows['me-flow'];
    layoutFlow(mf, L.m, L.vw - 2 * L.m, L.narrow);
    moveFlow(mf, under);
    const msX = L.m, msW = L.narrow ? L.vw - 2 * L.m : Math.min(0.6 * L.vw, L.vw - 2 * L.m);
    const msY = mf.y + mf.h + (L.narrow ? 16 : 40);
    doc.style.width = (L.narrow ? msW : Math.min(msW, 640)) + 'px';
    // 좁은 화면: 표는 앞 두 단계와만 함께 보이므로, 아직 안 뜬 아래 상자 자리까지 올려도 된다
    const docY = L.narrow ? Math.min(msY, L.safeB - doc.offsetHeight) : msY;
    doc.style.left = msX + 'px'; doc.style.top = docY + 'px';
    fitSlot(crops.stills, 1200 / 565, msX, msY, msW, (L.narrow ? L.vh - L.m - 24 : L.safeB + 24) - msY);
    place('me-5', L.m, msY, msW);

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
    const ah = (L.narrow ? L.vh - L.m - 28 : Math.min(0.9 * L.vh, L.vh - L.m - 24)) - ay0 - 4 * L.fp;
    const fitC = (ar, maxH) => {
      const h = Math.min(ah, maxH), w = Math.min(aw, h * ar), hh = w / ar;
      return { x: ax0 + L.fp + (aw - w) / 2, y: ay0 + (ah - hh) / 2, w, h: hh };
    };
    L.dk = { office: fitC(1440 / 904, 1e9), chat: fitC(760 / 700, 1e9), phone: fitC(390 / 664, 664 * 1.3) };
    const put = (el, r) => { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; };
    put(dks.office, L.dk.office); put(dks.chat, L.dk.chat);
    // 큐브 사무실 그림: 첫 문장 아래 칸(좁으면 가운데)
    const cy0 = under + lines['de-1'].el.offsetHeight + (L.narrow ? 24 : 32) + L.fp;
    const cah = (L.narrow ? L.vh - L.m - 28 : Math.min(0.9 * L.vh, L.vh - L.m - 24)) - cy0 - L.fp;
    const cw = Math.min(L.vw - 2 * L.m - 2 * L.fp, cah * (1200 / 1050));
    L.dk.cubes = { x: L.narrow ? (L.vw - cw) / 2 : L.m + L.fp, y: cy0, w: cw, h: cw * (1050 / 1200) };
    put(dks.cubes, L.dk.cubes);
    put(dks['phone-office'], L.dk.phone); put(dks['phone-chat'], L.dk.phone);
    // 구조도: 윗단 세션 둘, 가운데 서버(띠가 칠함), 아랫단 화면·폰·알림
    place('de-6', L.m, under, L.vw - 2 * L.m);
    const AW = L.narrow ? L.vw - 2 * L.m : Math.min(L.vw - 2 * L.m, 1040);
    const ag = L.narrow ? 10 : 24, agy = L.narrow ? 34 : clamp(0.07 * L.vh, 40, 72);
    const w2 = (AW - ag) / 2, w3 = (AW - 2 * ag) / 3;
    const an = ac.n;
    [[an.term, w2], [an.sdk, w2], [an.srv, AW], [an.pc, w3], [an.ph, w3], [an.push, w3]].forEach(([el, w]) => { el.style.width = w + 'px'; el.style.height = 'auto'; });
    const h1 = Math.max(an.term.offsetHeight, an.sdk.offsetHeight), hs = an.srv.offsetHeight;
    const h3 = Math.max(an.pc.offsetHeight, an.ph.offsetHeight, an.push.offsetHeight);
    const ys = h1 + agy, y3 = ys + hs + agy;
    const AR3 = {
      term: { x: 0, y: 0, w: w2, h: h1 }, sdk: { x: w2 + ag, y: 0, w: w2, h: h1 }, srv: { x: 0, y: ys, w: AW, h: hs },
      pc: { x: 0, y: y3, w: w3, h: h3 }, ph: { x: w3 + ag, y: y3, w: w3, h: h3 }, push: { x: 2 * (w3 + ag), y: y3, w: w3, h: h3 },
    };
    Object.entries(AR3).forEach(([k, r]) => putR(an[k], r));
    ac.arrows.forEach((a) => {
      const up = a.to === 'sdk', o = up ? AR3[a.to] : AR3[a.from === 'srv' ? a.to : a.from], cx = o.x + o.w / 2;
      const y0 = a.from === 'srv' ? (up ? ys - 3 : ys + hs + 3) : h1 + 3;
      const y1 = up ? h1 + 3 : (a.from === 'srv' ? y3 - 3 : ys - 3);
      a.line.setAttribute('d', pathD([[cx, y0], [cx, y1]])); a.head.setAttribute('d', headD([cx, y1], up ? 'u' : 'd'));
    });
    ac.cap.style.top = (y3 + h3 + 14) + 'px'; ac.cap.style.width = L.narrow ? AW + 'px' : '';
    const ah3 = y3 + h3 + 14 + ac.cap.offsetHeight;
    const acY = under + lines['de-6'].el.offsetHeight + (L.narrow ? 24 : 40);
    L.ac = { x: L.m, y: L.narrow ? acY : Math.max(acY, (acY + L.safeB - ah3) / 2) };
    ac.el.style.left = L.ac.x + 'px'; ac.el.style.top = L.ac.y + 'px'; ac.el.style.width = AW + 'px'; ac.el.style.height = ah3 + 'px';
    ac.svg.setAttribute('width', AW); ac.svg.setAttribute('height', ah3);
    L.srvR = { x: L.ac.x, y: L.ac.y + ys, w: AW, h: hs };

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
  function putR(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; }
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
    const drop = L.cupDrop * ease.inOutCubic(prog(b, 6.5, 6.95)) * (1 - ease.inOutCubic(prog(b, 7.85, 8.3)));
    const y = M.lerp(L.cupY + drop + (1 - enter) * (L.vh - L.cupY + 40), n.y, shrink) + exit * (L.vh - n.y + 40);
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
      const f = 1 - prog(b, t1, t1 + 0.15);
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
  const pathD = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const HD = { r: [[-7, -4.5], [-7, 4.5]], d: [[-4.5, -7], [4.5, -7]], u: [[-4.5, 7], [4.5, 7]], l: [[7, -4.5], [7, 4.5]] };
  const headD = (p, dir) => { const [a, c] = HD[dir]; return pathD([[p[0] + a[0], p[1] + a[1]], p, [p[0] + c[0], p[1] + c[1]]]); };
  // 도표 배치: 가로 한 줄(좁으면 세로 한 줄). 되돌이 화살표는 가로면 아래로, 세로면 오른쪽으로 돈다
  function layoutFlow(f, x, w, vert) {
    const n = f.nodes.length;
    const g = vert ? 16 : clamp(0.024 * L.vw, 22, 44);
    const bk = f.back ? (vert ? 34 : 44) : 0;
    const nw = vert ? w - bk : (w - (n - 1) * g) / n;
    f.nodes.forEach((el) => { el.style.width = nw + 'px'; el.style.height = 'auto'; });
    const nh = Math.max(...f.nodes.map((el) => el.offsetHeight));
    f.R = f.nodes.map((el, i) => (vert ? { x: 0, y: i * (nh + g), w: nw, h: nh } : { x: i * (nw + g), y: 0, w: nw, h: nh }));
    f.nodes.forEach((el, i) => putR(el, f.R[i]));
    const d = pathD, head = headD;
    f.arrows.forEach((a, i) => {
      const r = f.R[i];
      const pts = vert ? [[nw / 2, r.y + nh + 3], [nw / 2, r.y + nh + g - 3]] : [[r.x + nw + 3, nh / 2], [r.x + nw + g - 3, nh / 2]];
      a.line.setAttribute('d', d(pts)); a.head.setAttribute('d', head(pts[1], vert ? 'd' : 'r'));
    });
    f.w = w; f.h = vert ? n * nh + (n - 1) * g : nh + bk;
    if (f.back) {
      const a = f.R[f.back.from], c = f.R[f.back.to], lb = f.back.label;
      let pts;
      if (vert) {
        const xr = nw + bk - 8;
        pts = [[nw + 3, a.y + nh / 2], [xr, a.y + nh / 2], [xr, c.y + nh / 2], [nw + 3, c.y + nh / 2]];
        lb.style.left = (xr - lb.offsetWidth / 2) + 'px';
        lb.style.top = ((a.y + c.y + nh) / 2 - lb.offsetHeight / 2) + 'px';
        lb.style.transform = 'rotate(90deg)';
      } else {
        const yb = nh + bk - 8;
        pts = [[a.x + nw / 2, nh + 3], [a.x + nw / 2, yb], [c.x + nw / 2, yb], [c.x + nw / 2, nh + 3]];
        lb.style.left = ((a.x + c.x + nw) / 2 - lb.offsetWidth / 2) + 'px';
        lb.style.top = (yb - lb.offsetHeight / 2) + 'px';
        lb.style.transform = 'none';
      }
      f.back.line.setAttribute('d', d(pts)); f.back.head.setAttribute('d', head(pts[3], vert ? 'l' : 'u'));
    }
    f.x = x;
    f.el.style.left = x + 'px'; f.el.style.width = f.w + 'px'; f.el.style.height = f.h + 'px';
    f.svg.setAttribute('width', f.w); f.svg.setAttribute('height', f.h);
  }
  function moveFlow(f, y) { f.y = y; f.el.style.top = y + 'px'; }
  // 도표 등장: ts[i]에 상자 i가 솟고, 그 직전에 앞 상자에서 화살표가 그어진다. tb에 되돌이 화살표. tOut에 통째로 위로 빠진다
  function flowIn(k, b, ts, tb, tOut) {
    const f = flows[k];
    const v = ease.inCubic(prog(b, tOut, tOut + 0.35));
    f.el.style.opacity = (1 - v).toFixed(3);
    f.el.style.transform = `translateY(${(-v * 40).toFixed(2)}px)`;
    f.nodes.forEach((el, i) => {
      const u = ease.outExpo(prog(b, ts[i], ts[i] + 0.45));
      el.style.opacity = u.toFixed(3);
      el.style.transform = `translateY(${((1 - u) * 16).toFixed(2)}px)`;
    });
    const draw = (a, t0, t1) => {
      const u = ease.inOutCubic(prog(b, t0, t1));
      a.line.style.strokeDashoffset = (1 - u).toFixed(4);
      a.line.style.opacity = u > 0 ? '1' : '0';
      a.head.style.opacity = u > 0.98 ? '1' : '0';
    };
    f.arrows.forEach((a, i) => draw(a, Math.max(ts[i] + 0.1, ts[i + 1] - 0.2), ts[i + 1] + 0.1));
    if (f.back) {
      draw(f.back, tb, tb + 0.4);
      f.back.label.style.opacity = ease.outCubic(prog(b, tb + 0.25, tb + 0.5)).toFixed(3);
    }
  }

  // 주간 기준 막대: 한 주씩 왼쪽부터 솟는다. tOut에 통째로 위로 빠진다
  function weeksIn(b, t0, tOut) {
    const v = ease.inCubic(prog(b, tOut, tOut + 0.35));
    wk.el.style.opacity = (1 - v).toFixed(3);
    wk.el.style.transform = `translateY(${(-v * 40).toFixed(2)}px)`;
    wk.bars.forEach((el, i) => {
      const t = t0 + i * 0.08;
      el.style.transform = `scaleY(${ease.outExpo(prog(b, t, t + 0.45)).toFixed(4)})`;
      const m = ease.outCubic(prog(b, t + 0.2, t + 0.45)).toFixed(3);
      wk.marks[2 * i].style.opacity = m; wk.marks[2 * i + 1].style.opacity = m;
    });
    wk.cap.style.opacity = ease.outCubic(prog(b, t0 + 0.6, t0 + 0.9)).toFixed(3);
  }
  // 나라별 카탈로그: 세 칸이 차례로 솟고 설명이 뒤따른다
  function catalogIn(b, t0, tOut) {
    const v = ease.inCubic(prog(b, tOut, tOut + 0.35));
    cat.el.style.opacity = (1 - v).toFixed(3);
    cat.el.style.transform = `translateY(${(-v * 40).toFixed(2)}px)`;
    cat.boxes.forEach((el, i) => {
      const u = ease.outExpo(prog(b, t0 + i * 0.12, t0 + i * 0.12 + 0.45));
      el.style.opacity = u.toFixed(3);
      el.style.transform = `translateY(${((1 - u) * 16).toFixed(2)}px)`;
    });
    cat.cap.style.opacity = ease.outCubic(prog(b, t0 + 0.4, t0 + 0.7)).toFixed(3);
  }

  // 데이터가 가는 곳: 줄마다 상자가 솟고, 화살표가 그어진 뒤 가는 곳이 뜬다
  function privacyIn(b, t0, tOut) {
    const v = ease.inCubic(prog(b, tOut, tOut + 0.35));
    pv.el.style.opacity = (1 - v).toFixed(3);
    pv.el.style.transform = `translateY(${(-v * 40).toFixed(2)}px)`;
    pv.rows.forEach(([box, ar, to], i) => {
      const t = t0 + i * 0.1;
      const u = ease.outExpo(prog(b, t, t + 0.4));
      box.style.opacity = u.toFixed(3);
      box.style.transform = `translateY(${((1 - u) * 12).toFixed(2)}px)`;
      const a = ease.inOutCubic(prog(b, t + 0.1, t + 0.3));
      ar.style.opacity = a > 0 ? '1' : '0';
      ar.style.transform = `scaleX(${a.toFixed(4)})`;
      to.style.opacity = ease.outCubic(prog(b, t + 0.25, t + 0.45)).toFixed(3);
    });
    pv.cap.style.opacity = ease.outCubic(prog(b, t0 + 0.4, t0 + 0.65)).toFixed(3);
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
  // 1.3~2.0 이름표가 화면 전체로 번지고, 첫 장(템포루틴) 제목과 아이콘이 가운데에서 솟는다.
  scene('hero', (b, A) => {
    words('hero-sub', b, -1, 1.0);
    words('hero-list', b, -1, 1.1);
    if (!A) return;
    glyphsIn('name', b, -10, 1.15);
    const r = lerpR(plateR('name', L.centerY), fullR(), ease.inOutCubic(prog(b, 1.3, 2.0)));
    setBarR(r);
    glyphsIn('tempo', b, 1.8);
    centerBt('tempo', r);
    const ic = ease.outExpo(prog(b, 1.8, 2.25));
    if (ic > 0) icon('tempo', shrinkR(chRf('tempo'), 0.6 + 0.4 * ic), ic);
  });

  // 슈가캡 14비트
  // 0~1.3 챕터 막 → 이름표 / 1.3 선언과 컵 등장 / 2.1~2.8 이름표가 수면선이 된다
  // 3.0~5.7 기록할 때마다 수면선이 다음 수위로 내려가며 사진을 바꿔 닦는다
  // 5.9~6.6 수면선 → 카운터 이름표 / 7.85~8.6 카운터 → 밤하늘 / 9.85~10.55 밤하늘 → 「만든 방법」
  // 11.85~12.3 이름표 → 링크 밑줄 / 13.0~13.6 밑줄이 화면을 덮고 「AI와 일하는 방식」
  scene('sugar', (b, A) => {
    words('su-1', b, 1.3, 2.3);
    words('su-2', b, 2.6, 3.9);
    words('su-2b', b, 4.55, 5.9);
    weeksIn(b, 4.75, 5.9);
    catalogIn(b, 6.95, 7.85);
    words('su-3', b, 6.7, 7.85, 0.03);
    words('su-4', b, 8.45, 9.85);
    words('su-5', b, 10.6, 11.85);
    flowIn('su-flow', b, [0, 1, 2, 3, 4, 5].map((i) => 10.75 + i * 0.12), 0, 11.85);
    words('su-links', b, 12.25, 13.0);
    renderCups(b);
    renderChars(b);
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
    else floodTo(b, underline('su-links'), 'method', 13.0);
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

  // 템포루틴 18.6비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 제목(0.1) → 이름표가 세로 필름 테두리, 개념 영상(1.3~4.2) → 계절 띠(TS0~, 계절마다 TC비트, 띠 위로 그 계절 사진)
  // → 띠가 선반, 그 위로 테마 여섯 장(TE~) → 만든 방법과 폰 세 대(TM~) → 링크 → 밑줄이 화면을 덮고 「빛뜰 데스크」(TM+3.8)
  const TEMPO_OFF = 1.3;
  const TS0 = 4.8, TC = 1.4, TE = TS0 + 4 * TC, TM = TE + 2.1;
  scene('tempo', (bRaw, A) => {
    const b = bRaw - TEMPO_OFF;
    if (A && bRaw < TEMPO_OFF + 1.5) chapterIcon(bRaw, 'tempo', 0.6, TEMPO_OFF + 0.75);
    tempoBody(b, A);
    if (A && bRaw < TEMPO_OFF) chapterBar(bRaw, 'tempo', 0.6);
  });
  function tempoBody(b, A) {
    words('te-1', b, 0.1, 1.2);
    words('te-6', b, 1.9, 3.8, 0.03);
    ['te-2', 'te-3', 'te-4', 'te-5'].forEach((k, i) => words(k, b, TS0 + i * TC + 0.1, TS0 + i * TC + 1.0, 0.025));
    privacyIn(b, TS0 + 3 * TC + 0.2, TS0 + 3 * TC + 1.0);
    words('te-7', b, TE + 0.95, TE + 2.0, 0.03);
    flowIn('te-flow', b, [0, 1, 2, 3, 4].map((i) => TM + 0.85 + i * 0.13), TM + 1.5, TM + 2.0);
    const p1in = ease.outExpo(prog(b, TS0 + 0.4, TS0 + 1.1)), p1out = ease.inCubic(prog(b, TS0 + 2 * TC, TS0 + 2 * TC + 0.5));
    img('te-ph1', 0, (1 - p1in) * L.vh + p1out * L.vh);
    const p2in = ease.outExpo(prog(b, TS0 + 2 * TC + 0.4, TS0 + 2 * TC + 1.1)), p2out = ease.inCubic(prog(b, TE - 0.1, TE + 0.4));
    img('te-ph2', 0, (1 - p2in) * L.vh + p2out * L.vh);
    // 개념 영상: 필름 테두리 안에서 아래부터 드러나고, 보일 때만 처음부터 재생한다
    screenIn(tfilm, b, 1.7, 2.25, 3.9, 4.2);
    const on = tfilm.style.opacity === '1';
    if (on && !filmOn) { tfilm.currentTime = 0; tfilm.play().catch((e) => console.warn('teaser play', e)); }
    if (!on && filmOn) tfilm.pause();
    filmOn = on;
    // 계절 사진: 겨울은 띠에서 위로 자라고, 커서가 다음 칸으로 갈 때마다 다음 계절이 왼쪽부터 덮는다. TE에 띠 안으로 접힌다
    wipeSet(seasons, b, [0, 1, 2, 3].map((i) => [TS0 + i * TC, TS0 + i * TC + 0.7, i ? 'right' : 'up']), ease.inOutCubic(prog(b, TE - 0.1, TE + 0.4)));
    // 테마: 선반 위로 한 장씩 솟고, 선반 안으로 가라앉는다
    themes.forEach((el, i) => {
      const r = L.themes[i];
      const u = ease.outExpo(prog(b, TE + 0.75 + i * 0.08, TE + 1.35 + i * 0.08));
      const o = ease.inCubic(prog(b, TE + 2.0 + i * 0.04, TE + 2.4 + i * 0.04));
      const d = Math.max(1 - u, o);
      el.style.opacity = d < 1 ? '1' : '0';
      el.style.transform = `translateY(${(d * r.h).toFixed(2)}px)`;
      el.style.clipPath = `inset(0 0 ${(d * 100).toFixed(2)}% 0)`;
    });
    if (!A) { words('te-links', b, NEVER); return; }
    glyphsIn('tempo', b, -10, 0.75);
    const stripW = L.vw - 2 * L.m;
    ['s0', 's1', 's2', 's3'].forEach((id, i) => {
      const el = bts[id].el; el.style.left = (stripW * (i + 0.5) / 4 - bts[id].w / 2) + 'px';
      glyphsIn(id, b, TS0 + i * 0.1, TE - 0.1 + i * 0.05, 0.08);
    });
    const k = kf(b, [[TS0, 0], [TS0 + TC, 0], [TS0 + TC + 0.5, 1, ease.outExpo], [TS0 + 2 * TC, 1], [TS0 + 2 * TC + 0.5, 2, ease.outExpo], [TS0 + 3 * TC, 2], [TS0 + 3 * TC + 0.5, 3, ease.outExpo]]);
    const tv = ease.outExpo(prog(b, TS0 + 0.05, TS0 + 0.4)) * (1 - ease.inCubic(prog(b, TE - 0.1, TE + 0.2)));
    tick.style.transform = `translateX(${stripW * (k + 0.5) / 4}px) scaleY(${tv.toFixed(3)})`;
    const stripR = { x: L.m, y: L.stripY, w: stripW, h: L.stripH };
    if (b < TM + 2.3) words('te-links', b, NEVER);
    if (b < 4.15) setBarR(lerpR(plateR('tempo', L.topY), L.filmF, ease.inOutCubic(prog(b, 1.3, 1.9))));
    else if (b < TE + 0.45) setBarR(lerpR(L.filmF, stripR, ease.inOutCubic(prog(b, 4.15, 4.75))));
    else if (b < TM) setBarR(lerpR(stripR, L.shelf, ease.inOutCubic(prog(b, TE + 0.45, TE + 0.9))));
    else if (b < TM + 2.3) {
      glyphsIn('made2', b, TM + 0.6, TM + 2.0);
      setBarR(lerpR(L.shelf, plateR('made2', L.topY), ease.inOutCubic(prog(b, TM, TM + 0.8))));
    } else {
      const u = underline('te-links');
      words('te-links', b, TM + 2.8, TM + 3.7);
      if (b < TM + 3.8) setBarR(lerpR(plateR('made2', L.topY), u, ease.inOutCubic(prog(b, TM + 2.3, TM + 2.8))));
      else floodTo(b, u, 'desk', TM + 3.8);
    }
  }

  // 짐살라빔 9.8비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 제목 → 이름표가 각도선이 된다(1.0~1.9). 각도선이 몸통→엉덩이→무릎 기준값으로 기울 때
  // 오른쪽 판넬 조각: 상태 기계는 다섯 단계가 차례로 켜지고, 아래 칸은 체크포인트 → 아키텍처 → 기준값 표
  // 6.0~6.5 각도선이 눕혀져 링크 밑줄, 판넬 전체가 들어온다 / 7.5 밑줄이 화면을 덮고 「슈가캡」
  const GIM_OFF = 1.3;
  scene('gim', (bRaw, A) => {
    const b = bRaw - GIM_OFF;
    if (A && bRaw < GIM_OFF + 1.5) chapterIcon(bRaw, 'gim', 0.6, GIM_OFF + 0.75);
    gimBody(b, A);
    if (A && bRaw < GIM_OFF) chapterBar(bRaw, 'gim', 0.6);
  });
  function gimBody(b, A) {
    words('gi-1', b, 0.1, 1.0);
    words('gi-2', b, 2.0, 2.6, 0.02);
    words('gi-3', b, 3.05, 3.6, 0.02);
    words('gi-4', b, 4.05, 4.6, 0.02);
    words('gi-5', b, 5.05, 5.95, 0.02);
    // 판넬 조각은 오른쪽으로 밀려나고 판넬 전체가 그 자리에 들어온다
    const push = ease.inCubic(prog(b, 5.95, 6.4));
    const dx = push * (L.vw - L.gcX + 40);
    const smIn = ease.outExpo(prog(b, 1.6, 2.3));
    crops.sm.style.opacity = smIn > 0 && push < 1 ? '0.3' : '0';
    crops.sm.style.transform = `translate(${dx}px, ${(1 - smIn) * 24}px)`;
    // 켜진 단계: 문장이 바뀔 때마다 한 칸씩
    const st = kf(b, [[1.9, 0], [2.6, 0], [2.8, 1, ease.outExpo], [3.3, 1], [3.5, 2, ease.outExpo], [4.0, 2], [4.2, 3, ease.outExpo], [4.7, 3], [4.9, 4, ease.outExpo]]);
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
    glyphsIn('a0', b, 1.9, 2.9, 0.03);
    glyphsIn('a1', b, 3.0, 3.9, 0.03);
    const ax = L.angleCx - L.angleW / 2, ay = L.angleCy - L.angleH / 2;
    if (b < 6.0) {
      glyphsIn('a2', b, 4.0, 5.3, 0.03);
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
        floodTo(b, u, 'sugar', 7.5);
      }
    }
  }

  // 빛뜰 데스크 13.9비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 이름표 글자가 빠지면(0~0.7) 이름표가 큐브 사무실 그림의 액자가 되고(0.55~0.95) 첫 문장이 뜬다(0.75). 1.7~2.05 PC 화면 테두리로
  // 본문: 선언(0.1) → 선언이 빠진 뒤 이름표가 PC 화면 테두리가 되고 사무실이 드러난다(1.4~2.6)
  // → 테두리가 대화 창 크기로(3.6) → 폰 몸체로 줄어든다(5.2) → 폰 사무실, 폰 대화 창과 승인 요청
  // 7.95~8.45 폰 몸체가 구조도의 서버 상자 / 10.15~10.65 서버 상자가 링크 밑줄 / 11.6 밑줄이 화면을 덮고 「짐살라빔」
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
    if (A && bRaw < DESK_OFF + 1.5) chapterIcon(bRaw, 'desk', 0.6, DESK_OFF);
    deskBody(b, A);
    if (A && bRaw < DESK_OFF) chapterBar(bRaw, 'desk', 0.6);
  });
  function deskBody(b, A) {
    words('de-1', b, 0.75, 1.6);
    words('de-2', b, 2.0, 3.4);
    words('de-3', b, 4.0, 5.0);
    words('de-4', b, 5.6, 6.3);
    words('de-5', b, 6.9, 7.6);
    screenIn(dks.cubes, b, 0.85, 1.3, 1.5, 1.75);
    screenIn(dks.office, b, 2.0, 2.6, 3.3, 3.6);
    screenIn(dks.chat, b, 3.95, 4.55, 4.85, 5.2);
    screenIn(dks['phone-office'], b, 5.6, 6.2, 7.1, 7.11);
    screenIn(dks['phone-chat'], b, 6.5, 7.1, 7.6, 7.95, 'right');
    words('de-6', b, 8.2, 9.75);
    archIn(b, A);
    if (!A) { words('de-links', b, NEVER); return; }
    glyphsIn('desk', b, -10, 0.0);
    const phoneF = frameR(L.dk.phone, L.fp * 1.4, 2.2);
    if (b < 7.95) {
      const R = [frameR(L.dk.office, L.fp), frameR(L.dk.chat, L.fp), phoneF];
      const f = kf(b, [[3.6, 0], [3.95, 1, ease.inOutCubic], [5.2, 1], [5.6, 2, ease.inOutCubic]]);
      const i = Math.floor(f);
      const dev = lerpR(R[i], R[Math.min(2, i + 1)], f - i);
      const cubesF = frameR(L.dk.cubes, L.fp);
      if (b < 1.7) setBarR(lerpR(plateR('desk', L.topY), cubesF, ease.inOutCubic(prog(b, 0.55, 0.95))));
      else setBarR(lerpR(cubesF, dev, ease.inOutCubic(prog(b, 1.7, 2.05))));
      words('de-links', b, NEVER);
    } else if (b < 10.15) {
      setBarR(lerpR(phoneF, L.srvR, ease.inOutCubic(prog(b, 7.95, 8.45))));
      words('de-links', b, NEVER);
    } else {
      const u = underline('de-links');
      words('de-links', b, 10.65, 11.5);
      if (b < 11.6) setBarR(lerpR(L.srvR, u, ease.inOutCubic(prog(b, 10.15, 10.65))));
      else floodTo(b, u, 'gim', 11.6);
    }
  }
  // 구조도: 띠가 서버 상자에 앉으면 서버 글이 뜨고, 세션 → 서버 → 화면·폰·알림 순으로 상자와 화살표가 생긴다
  function archIn(b, A) {
    const v = ease.inCubic(prog(b, 9.75, 10.1));
    ac.el.style.opacity = (1 - v).toFixed(3);
    ac.el.style.transform = `translateY(${(-v * 40).toFixed(2)}px)`;
    const T = { srv: 8.35, term: 8.5, sdk: 8.6, pc: 8.8, ph: 8.9, push: 9.0 };
    Object.entries(T).forEach(([k, t]) => {
      const u = ease.outExpo(prog(b, t, t + 0.4));
      ac.n[k].style.opacity = u.toFixed(3);
      ac.n[k].style.transform = `translateY(${((1 - u) * 12).toFixed(2)}px)`;
    });
    ac.n.srv.classList.toggle('on', A && b >= 8.4 && b < 10.15);
    ac.arrows.forEach((a) => {
      const t = Math.max(T[a.from], T[a.to]) - 0.05;
      const u = ease.inOutCubic(prog(b, t, t + 0.25));
      a.line.style.strokeDashoffset = (1 - u).toFixed(4);
      a.line.style.opacity = u > 0 ? '1' : '0';
      a.head.style.opacity = u > 0.98 ? '1' : '0';
    });
    ac.cap.style.opacity = ease.outCubic(prog(b, 9.15, 9.4)).toFixed(3);
  }

  // 방식 7.5비트: 0~1.3 챕터 막 → 이름표, 이후 본문(b = 원래 비트 - 1.3)
  // 본문: 이름표가 첫 상자(스펙 문서)를 칠하고, 단계마다 다음 상자로 옮겨 간다. 상자와 화살표는 띠가 닿기 직전에 생긴다
  // 아래 칸: COPY.md 표(스펙, 구현) → 검수 스틸(스크린샷 검수) → 마지막 문장(환경 고치기, 되돌이 화살표)
  // 5.6~6.1 띠가 가운데 이름표가 된다(엔드와 같은 자리)
  const METHOD_OFF = 1.3;
  const ME_T = [0.8, 1.75, 2.75, 3.75, 4.75];
  const meNode = (i) => { const f = flows['me-flow'], r = f.R[i]; return { x: f.x + r.x, y: f.y + r.y, w: r.w, h: r.h }; };
  const meMark = (f) => { const i = Math.floor(f), j = Math.min(4, i + 1); return lerpR(meNode(i), meNode(j), f - i); };
  scene('method', (bRaw, A) => {
    const b = bRaw - METHOD_OFF;
    const fl = flows['me-flow'];
    flowIn('me-flow', b, ME_T, 4.9, 5.55);
    words('me-5', b, 5.0, 5.6);
    const dIn = ease.outExpo(prog(b, 0.85, 1.5));
    const dFold = ease.inCubic(prog(b, 2.55, 2.9));
    doc.style.opacity = dIn > 0 && dFold < 1 ? '1' : '0';
    doc.style.transform = `translateY(${(1 - dIn) * 24}px)`;
    doc.style.clipPath = `inset(0 0 ${(dFold * 100).toFixed(2)}% 0)`;
    const sIn = ease.outExpo(prog(b, 3.6, 4.3));
    const sFold = ease.inCubic(prog(b, 4.55, 4.9));
    const st = crops.stills;
    st.style.opacity = sIn > 0 && sFold < 1 ? '1' : '0';
    st.style.clipPath = `inset(${((1 - sIn) * 100).toFixed(2)}% 0 ${(sFold * 100).toFixed(2)}% 0)`;
    const lit = (R) => fl.nodes.forEach((el, i) => {
      const n = meNode(i);
      const ox = Math.max(0, Math.min(R.x + R.w, n.x + n.w) - Math.max(R.x, n.x));
      const oy = Math.max(0, Math.min(R.y + R.h, n.y + n.h) - Math.max(R.y, n.y));
      el.classList.toggle('on', ox * oy > 0.5 * n.w * n.h);
    });
    if (!A || bRaw < METHOD_OFF) {
      fl.nodes.forEach((el) => el.classList.remove('on'));
      if (A) { glyphsIn('method', b, -10); chapterBar(bRaw, 'method', 0.6); }
      return;
    }
    glyphsIn('method', b, -10, 0.5);
    glyphsIn('name', b, 5.85);
    const f = kf(b, [[0.6, 0], [1.55, 0], [1.9, 1, ease.inOutCubic], [2.55, 1], [2.9, 2, ease.inOutCubic], [3.55, 2], [3.9, 3, ease.inOutCubic], [4.55, 3], [4.9, 4, ease.inOutCubic]]);
    let R;
    if (b < 1.0) R = lerpR(plateR('method', L.topY), meNode(0), ease.inOutCubic(prog(b, 0.55, 1.0)));
    else if (b < 5.6) R = meMark(f);
    else R = lerpR(meMark(4), plateR('name', L.centerY), ease.inOutCubic(prog(b, 5.6, 6.1)));
    setBarR(R);
    lit(R);
  });

  scene('end', (b, A) => {
    listIn("end-list", b, 0.15, NEVER, 0.08);
    if (!A) return;
    glyphsIn('name', b, -10);
    setBar(L.m, L.centerY, bw('name'), L.H);
  });

  // ---- 멈춤 지점 ----
  // 슬라이드처럼 휠 한 번, 스와이프 한 번에 다음 지점까지만 간다. 지점은 그 장면의 글과 그림이 다 자리 잡은 순간
  // 챕터 본문은 원래 비트 = 본문 비트 + 1.3. 0.3은 챕터 막(가운데 제목)
  const STOPS = {
    hero: [0],
    sugar: [0.3, 2.0, 3.85, 5.85, 7.7, 9.75, 11.8, 12.95],
    tempo: [0.3, 2.0, 5.0, ...[0, 1, 2, 3].map((i) => TEMPO_OFF + TS0 + i * TC + 0.95), TEMPO_OFF + TE + 1.95, TEMPO_OFF + TM + 1.95, TEMPO_OFF + TM + 3.75],
    gim: [0.3, ...[0.85, 2.55, 3.55, 4.55, 5.9, 7.35].map((x) => GIM_OFF + x)],
    desk: [0.3, ...[1.45, 3.25, 4.8, 6.25, 7.55, 9.6, 11.5].map((x) => DESK_OFF + x)],
    method: [0.3, ...[1.5, 2.45, 3.5, 4.5, 5.45].map((x) => METHOD_OFF + x)],
    end: [0.98],
  };
  const snaps = [];
  $$('.scene').forEach((sec) => (STOPS[sec.dataset.scene] || []).forEach((b) => {
    const el = document.createElement('div'); el.className = 'stop'; el.setAttribute('aria-hidden', 'true');
    sec.appendChild(el); snaps.push({ el, b });
  }));
  const placeSnaps = () => snaps.forEach(({ el, b }) => { el.style.top = (b * BEAT_VH * L.vh) + 'px'; });
  // 휠은 지점 사이가 멀면 제자리로 튕기므로 직접 다음 지점으로 보낸다. 한 번의 휠 동작(관성 포함)에 한 지점
  const stopY = () => snaps.map(({ el }) => el.parentElement.offsetTop + parseFloat(el.style.top));
  let wheelBusy = false, lastWheel = 0;
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || !document.documentElement.classList.contains('snap')) return;
    e.preventDefault();
    const now = performance.now(), quiet = now - lastWheel > 250;
    lastWheel = now;
    if (wheelBusy || !quiet || Math.abs(e.deltaY) < 2) return;
    const ys = stopY(), y = scrollY;
    const target = e.deltaY > 0 ? ys.find((v) => v > y + 2) : [...ys].reverse().find((v) => v < y - 2);
    if (target === undefined) return;
    wheelBusy = true; setTimeout(() => { wheelBusy = false; }, 1200);
    scrollTo({ top: target, behavior: 'smooth' });
  }, { passive: false });
  addEventListener('scrollend', () => { wheelBusy = false; });

  // ---- 드라이버 ----
  const sections = $$('.scene');
  const ordered = sections.map((s) => scenes.find((sc) => sc.name === s.dataset.scene));
  sections.forEach((s) => s.style.setProperty('--beats', s.dataset.beats));
  let lastY = -1, lastW = 0, lastH = 0;
  function frame() {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (vw !== lastW || vh !== lastH) { lastW = vw; lastH = vh; layout(); placeSnaps(); lastY = -1; }
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
      ordered.forEach((sc, i) => sc.render(bs[i], i === active));
      cornerSection.textContent = sections[active].dataset.label;
      // 아래 모서리 라벨은 첫 화면에서만. 본문 글과 겹치므로 히어로를 벗어나며 사라진다
      const cb = (1 - prog(bs[0], 0.1, 0.5)).toFixed(3);
      cornersB.forEach((el) => { el.style.opacity = cb; });
    }
    requestAnimationFrame(frame);
  }
  // 투명한 채로 기다리던 사진이 첫 등장 프레임에 비어 보이지 않게 미리 디코드한다
  [...seasons, ...themes, ...Object.values(crops), ...Object.values(dks), ...Object.values(cups), ...Object.values(chars)].forEach((el) => el.decode().catch((e) => console.warn('decode', el.src, e)));
  document.fonts.ready.then(() => { layout(); placeSnaps(); document.documentElement.classList.add('snap'); requestAnimationFrame(frame); });
})();

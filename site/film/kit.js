// 장 영상 공통 도구. 가운데 기기 하나는 그 자리에 있고, 좌우 글이 선으로 기기 속 요소를 짚는다.
// 모든 함수는 t의 순수 함수로 스타일을 정한다. 줄바꿈은 글 안의 | 로만 일어난다.
window.Kit = function Kit() {
  const { clamp, lerp, prog, ease, kf } = M;
  // ?p 가 붙으면 세로(모바일) 판: 기기는 위, 글과 그림은 그 아래
  const P = new URLSearchParams(location.search).has('p');
  const W = P ? 1080 : 1920, H = P ? 1920 : 1080, MX = P ? 100 : 120;
  if (P) { document.documentElement.classList.add('pt'); document.documentElement.style.width = W + 'px'; document.documentElement.style.height = H + 'px'; }
  const io = ease.inOutCubic;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const put = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };
  const K = { P, W, H, MX, LX: MX, RX: W - MX, io, $, $$, put, clamp, lerp, prog, ease, kf, lines: {}, masks: {}, warn: [] };
  // 가로판 값과 세로판 값 중 지금 판의 것
  K.v = (land, port) => (P ? port : land);
  const fx = document.getElementById('fx'); if (fx) { fx.setAttribute('width', W); fx.setAttribute('height', H); }

  // 기기 상자: 선이 꺾이는 자리와 화면 속 비율 좌표의 기준
  K.device = (el, x, y, w, h, bz) => {
    put(el, x, y); el.style.width = w + 'px'; el.style.height = h + 'px';
    K.box = { x, y, w, h, bz, iw: w - 2 * bz, ih: h - 2 * bz };
    K.A = (fx, fy) => [x + bz + fx * (w - 2 * bz), y + bz + fy * (h - 2 * bz)];
    K.LIM = { l: x - 66, r: x + w + 66 };
  };

  // 글: | 로 나눈 줄마다 한 덩어리, 줄 안에서는 낱말 단위로 움직인다
  K.parse = () => {
    $$('.ln').forEach((el) => {
      let rows = el.textContent.split('|').map((r) => r.trim());
      // 세로판: 끊는 자리(|)는 그대로 두고, 폭이 허락하면 이웃 덩어리를 한 줄로 잇는다
      if (P) {
        el.classList.remove('r');
        const maxW = parseFloat(el.dataset.maxw || (W - 2 * MX));
        el.textContent = '';
        const m = document.createElement('span'); m.style.cssText = 'display:inline-block;white-space:nowrap'; el.append(m);
        const fit = (txt) => { m.textContent = txt; return m.offsetWidth <= maxW; };
        const out = [];
        rows.forEach((r) => { const last = out.length - 1; if (last >= 0 && !el.dataset.keep && fit(out[last] + ' ' + r)) out[last] += ' ' + r; else out.push(r); });
        rows = out;
      }
      el.textContent = '';
      const ws = [];
      rows.forEach((r) => {
        const row = document.createElement('span'); row.className = 'row';
        r.split(/\s+/).forEach((p, i) => {
          if (i) row.append(' ');
          const s = document.createElement('span'); s.className = 'w'; s.textContent = p; row.append(s); ws.push(s);
        });
        el.append(row);
      });
      K.lines[el.dataset.k] = { el, ws };
    });
    $$('[data-m]').forEach((el) => { K.masks[el.dataset.m] = el; });
  };

  K.words = (k, t, tIn, tOut = 1e9, st = 0.035) => {
    K.lines[k].ws.forEach((w, i) => {
      const u = ease.outExpo(prog(t, tIn + i * st, tIn + i * st + 0.5));
      const v = ease.inCubic(prog(t, tOut + i * st * 0.5, tOut + i * st * 0.5 + 0.35));
      w.style.transform = `translateY(${(1 - u) * 18 - v * 36}px)`;
      w.style.opacity = (u * (1 - v)).toFixed(3);
      w.style.filter = u < 0.999 ? `blur(${(1 - u) * 10}px)` : 'none';
    });
  };
  // 마스크 줄: 글자가 줄 아래 가장자리에서 솟고 위로 빠진다
  K.rise = (el, t, tIn, tOut = 1e9, st = 0.06) => {
    const d = el.offsetHeight * 1.05;
    [...el.querySelectorAll('.g')].forEach((g, i) => {
      const u = ease.outExpo(prog(t, tIn + i * st, tIn + i * st + 0.6));
      const v = ease.inCubic(prog(t, tOut + i * st * 0.5, tOut + i * st * 0.5 + 0.4));
      g.style.transform = `translateY(${(1 - u) * d - v * d}px)`;
    });
  };
  // 덩어리 하나가 아래서 올라오고 위로 빠진다
  K.lift = (el, t, tIn, tOut = 1e9, dy = 24) => {
    const u = ease.outExpo(prog(t, tIn, tIn + 0.5)), v = ease.inCubic(prog(t, tOut, tOut + 0.35));
    el.style.opacity = (u * (1 - v)).toFixed(3);
    el.style.transform = `translateY(${((1 - u) * dy - v * 40).toFixed(1)}px)`;
  };
  // 그림이 위에서 아래로 열리고 아래로 닫힌다
  K.wipe = (el, t, tIn, tOut = 1e9, r = 0) => {
    const u = ease.outExpo(prog(t, tIn, tIn + 0.6)), v = ease.inCubic(prog(t, tOut, tOut + 0.35));
    el.style.opacity = u > 0 && v < 1 ? '1' : '0';
    el.style.clipPath = `inset(${((1 - u) * 100).toFixed(2)}% 0 ${(v * 100).toFixed(2)}% 0 round ${r}px)`;
  };

  // 이름표: | 앞은 진하게, 뒤는 회색으로 한 줄에 잇는다
  K.label = (k) => {
    const rows = K.lines[k].el.querySelectorAll('.row');
    rows.forEach((r, i) => { r.style.display = 'inline'; if (i) { r.style.marginLeft = '10px'; r.style.color = 'var(--gray)'; r.style.fontWeight = '500'; } });
    return K.lines[k].el;
  };
  K.rightAlign = (el, y) => put(el, P ? K.LX : K.RX - el.offsetWidth, y);
  // 글 첫 줄의 기기 쪽 끝 (선이 출발하는 점)
  K.rowEdge = (k, rowIdx = 0) => {
    const { el, ws } = K.lines[k];
    const tops = [...new Set(ws.map((w) => w.offsetTop))];
    const top = tops[Math.min(rowIdx, tops.length - 1)];
    const row = ws.filter((w) => w.offsetTop === top);
    const x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top);
    // 세로판: 기기 아래 글은 줄 왼쪽 여백에서 출발해 여백을 타고 올라간다 (위 글을 가로지르지 않는다)
    if (P && y0 > K.box.y + K.box.h) return [x0 - 22, y0 + top + row[0].offsetHeight / 2];
    const right = el.classList.contains('r') || x0 > K.box.x;
    const x = right ? x0 + Math.min(...row.map((w) => w.offsetLeft)) - 18 : x0 + Math.max(...row.map((w) => w.offsetLeft + w.offsetWidth)) + 18;
    return [x, y0 + top + row[0].offsetHeight / 2];
  };
  // 글이 기기 쪽 경계를 넘으면 기록한다 (스틸 검수용)
  K.check = () => {
    Object.entries(K.lines).forEach(([k, { el }]) => {
      const x0 = parseFloat(el.style.left), w = el.offsetWidth, y0 = parseFloat(el.style.top);
      if (P) {
        const ww = Math.max(w, ...[...el.querySelectorAll('.row')].map((r) => { r.style.display = 'inline-block'; const v = r.offsetWidth; r.style.display = ''; return v; }));
        if (el.style.left && x0 + ww > W - MX + 2) K.warn.push(`${k} 오른끝 ${Math.round(x0 + ww)} > ${W - MX}`);
        if (el.style.top && y0 + el.offsetHeight > H - 40) K.warn.push(`${k} 아래끝 ${Math.round(y0 + el.offsetHeight)}`);
        return;
      }
      if (y0 > K.box.y + K.box.h) return;
      if (x0 < K.box.x && x0 + w > K.LIM.l) K.warn.push(`${k} 오른끝 ${Math.round(x0 + w)} > ${Math.round(K.LIM.l)}`);
      if (x0 > K.box.x && x0 < K.LIM.r) K.warn.push(`${k} 왼끝 ${Math.round(x0)} < ${Math.round(K.LIM.r)}`);
    });
    document.title = K.warn.length ? 'WARN ' + K.warn.join(' / ') : 'OK';
  };

  // 선: 글에서 기기 속 요소까지. 기기 테두리 바로 바깥에서 꺾인다
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); $('#fx').append(e); return e; };
  K.callout = (from, to, ey = 36) => {
    const p = mk('path', 'ln2'); const ring = mk('circle', 'ring'); const dot = mk('circle', 'dot');
    const below = from[1] > K.box.y + K.box.h;
    const elbowX = from[0] < K.box.x ? K.box.x - 36 : K.box.x + K.box.w + 36;
    // 기기 아래에서 오는 선은 기기 밑변 바로 아래에서 꺾여 올라간다
    const EY = K.box.y + K.box.h + ey;
    const pts = below ? [from, [from[0], EY], [to[0], EY], to] : [from, [elbowX, from[1]], to];
    p.setAttribute('d', 'M' + pts.map((q) => q.join(' ')).join(' L')); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1';
    dot.setAttribute('cx', to[0]); dot.setAttribute('cy', to[1]);
    ring.setAttribute('cx', to[0]); ring.setAttribute('cy', to[1]);
    const sd = mk('circle', 'dot'); sd.setAttribute('cx', from[0]); sd.setAttribute('cy', from[1]);
    return { p, ring, dot, sd };
  };
  K.drawC = (c, t, t0, tOut) => {
    const u = io(prog(t, t0, t0 + 0.55));
    const v = ease.inCubic(prog(t, tOut, tOut + 0.3));
    const on = u > 0 && v < 1;
    c.p.style.strokeDashoffset = (1 - u + v).toFixed(4);
    c.p.style.opacity = on ? '1' : '0';
    c.sd.setAttribute('r', on ? (3.5 * ease.outExpo(prog(t, t0, t0 + 0.2))).toFixed(2) : 0);
    const d = ease.outExpo(prog(t, t0 + 0.5, t0 + 0.8));
    c.dot.setAttribute('r', (5 * d * (1 - v)).toFixed(2));
    const g = ease.outExpo(prog(t, t0 + 0.5, t0 + 1.0));
    c.ring.setAttribute('r', lerp(40, 16, g).toFixed(2));
    c.ring.style.opacity = (Math.min(1, g * 2) * (1 - v)).toFixed(3);
  };
  K.arrow = (pts) => {
    const p = mk('path', 'ln2'); p.setAttribute('d', 'M' + pts.map((q) => q.join(' ')).join(' L')); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1';
    const e = pts[pts.length - 1], s = pts[pts.length - 2];
    const dx = Math.sign(e[0] - s[0]), dy = Math.sign(e[1] - s[1]);
    const h = mk('path', 'hd');
    h.setAttribute('d', dx ? `M${e[0] - 9 * dx} ${e[1] - 6} L${e[0]} ${e[1]} L${e[0] - 9 * dx} ${e[1] + 6}` : `M${e[0] - 6} ${e[1] - 9 * dy} L${e[0]} ${e[1]} L${e[0] + 6} ${e[1] - 9 * dy}`);
    return { p, h };
  };
  K.drawA = (a, t, t0, dur = 0.35) => {
    const u = io(prog(t, t0, t0 + dur));
    a.p.style.strokeDashoffset = (1 - u).toFixed(4); a.p.style.opacity = u > 0 ? '1' : '0';
    a.h.style.opacity = u > 0.97 ? '1' : '0';
  };

  // 기기 속 화면 넘기기: 다음 화면이 오른쪽에서 밀고 들어온다. cuts = 넘김 시작 시각들
  K.pager = (scrs, cuts, t, iw) => {
    const p = cuts.map((c) => io(prog(t, c, c + 0.45)));
    scrs.forEach((s, i) => {
      const inn = i === 0 ? 1 : p[i - 1], out = i < p.length ? p[i] : 0;
      s.style.transform = `translateX(${((1 - inn) * iw - out * iw).toFixed(1)}px)`;
      s.style.opacity = inn > 0 && out < 1 ? '1' : '0';
    });
  };
  return K;
};

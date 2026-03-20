// app.js — 名画収集館 メインロジック
// paintings.js が先に読み込まれている前提

(function () {

  // ── DOM ──────────────────────────────────────────
  const dw      = document.getElementById('dw');
  const abt     = document.getElementById('abt');
  const abs     = document.getElementById('abs');
  const bh      = document.getElementById('bh');
  const bdg     = document.getElementById('bdg');
  const toastEl = document.getElementById('toast');

  // ── State ─────────────────────────────────────────
  let filter  = { century: 'all', style: 'all', artist: 'all' };
  let queue   = [];
  let cards   = [];   // { el, data }
  let pointer = 0;
  let liked   = [];
  try { liked = JSON.parse(localStorage.getItem('meiga_liked') || '[]'); } catch (e) {}

  // ── フィルター用ユニーク値 ─────────────────────────
  const centuries = [...new Set(PAINTINGS.map(p => p.century))].sort();
  const styles    = [...new Set(PAINTINGS.map(p => p.style))].sort();
  const artists   = [...new Set(PAINTINGS.map(p => p.artist))].sort();

  // ── ユーティリティ ───────────────────────────────
  function save() {
    try { localStorage.setItem('meiga_liked', JSON.stringify(liked)); } catch (e) {}
  }

  function updateBadge() {
    bdg.textContent = liked.length;
    liked.length > 0 ? bdg.classList.add('on') : bdg.classList.remove('on');
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
  }

  // ── カード生成 ────────────────────────────────────
  function makeCard(p, idx, total) {
    const card = document.createElement('div');
    card.className = 'card';
    card._p = p;

    // バッジ類
    const num = document.createElement('div');
    num.className = 'card-num';
    num.textContent = `${idx + 1} / ${total}`;

    const stag = document.createElement('div');
    stag.className = 'style-tag';
    stag.textContent = p.style;

    // 釘・ひも
    const nail = document.createElement('div'); nail.className = 'nail';
    const wire = document.createElement('div'); wire.className = 'wire';

    // 額縁
    const frameWrap = document.createElement('div');
    frameWrap.className = 'frame-wrap';

    // 絵画画像
    const img = document.createElement('img');
    img.className = 'painting-img';
    img.alt = p.title;
    img.onload  = () => img.classList.add('loaded');
    img.onerror = () => {
      // 読み込み失敗時はプレースホルダー表示
      img.style.display = 'none';
      const ph = document.createElement('div');
      ph.className = 'painting-placeholder';
      ph.innerHTML = `<div class="ph-title">${p.title}</div>`;
      frameWrap.appendChild(ph);
    };
    img.src = p.image;
    frameWrap.appendChild(img);

    const shadow = document.createElement('div');
    shadow.className = 'frame-shadow';

    card.appendChild(num);
    card.appendChild(stag);
    card.appendChild(nail);
    card.appendChild(wire);
    card.appendChild(frameWrap);
    card.appendChild(shadow);
    return card;
  }

  // ── キュー構築 ────────────────────────────────────
  function buildQueue() {
    const res = PAINTINGS.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style  ) return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist ) return false;
      return true;
    });
    if (res.length === 0) { showToast('該当する作品がありません'); return false; }
    queue = [...res].sort(() => Math.random() - .5);
    return true;
  }

  function clearDeck() {
    cards.forEach(c => c.el.remove());
    cards = []; pointer = 0;
  }

  // ── 初期化 ───────────────────────────────────────
  function init() {
    clearDeck();
    if (!buildQueue()) return;
    const preload = Math.min(3, queue.length);
    for (let i = 0; i < preload; i++) {
      const el = makeCard(queue[i], i, queue.length);
      dw.appendChild(el);
      cards.push({ el, data: queue[i] });
    }
    pointer = preload;
    updateStack();
  }

  function updateStack() {
    cards.forEach(({ el }, i) => {
      el.classList.remove('cur', 'above', 'drag');
      if (i === 0) {
        el.classList.add('cur');
        el.style.transform = ''; el.style.opacity = '';
        updateMeta(el._p);
      } else {
        el.style.transform = 'translateY(110%)';
        el.style.opacity   = '0';
        el.style.transition = '';
      }
    });
  }

  function updateMeta(p) {
    if (!p) return;
    abt.textContent = p.title;
    abs.textContent = `${p.artist}  ·  ${p.year}  ·  ${p.museum || p.century}`;
    bh.classList.toggle('lk', liked.some(x => x.id === p.id));
  }

  // ── スワイプ ──────────────────────────────────────
  let isDrag = false, startY = 0, diffY = 0;
  const THRESH = 48;

  dw.addEventListener('mousedown',  e => onStart(e.clientY));
  dw.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive: true });
  window.addEventListener('mousemove',  e => { if (isDrag) onMove(e.clientY); });
  window.addEventListener('touchmove',  e => { if (isDrag) onMove(e.touches[0].clientY); }, { passive: true });
  window.addEventListener('mouseup',  onEnd);
  window.addEventListener('touchend', onEnd);

  function onStart(y) {
    if (!cards.length) return;
    isDrag = true; startY = y; diffY = 0;
    cards[0].el.classList.add('drag');
  }

  function onMove(y) {
    if (!isDrag || !cards.length) return;
    diffY = y - startY;
    const dy = Math.min(0, diffY);
    cards[0].el.style.transform = `translateY(${dy * .38}px)`;
    if (cards.length > 1) {
      const prog = Math.min(Math.abs(dy) / (THRESH * 1.5), 1);
      cards[1].el.style.transition = 'none';
      cards[1].el.style.transform  = `translateY(${(1 - prog) * 110}%)`;
      cards[1].el.style.opacity    = String(prog);
    }
  }

  function onEnd() {
    if (!isDrag) return;
    isDrag = false;
    if (!cards.length) return;
    cards[0].el.classList.remove('drag');
    cards[0].el.style.transition = '';
    if (diffY < -THRESH) {
      goNext();
    } else {
      cards[0].el.style.transform = '';
      if (cards.length > 1) {
        cards[1].el.style.transition = '';
        cards[1].el.style.transform  = 'translateY(110%)';
        cards[1].el.style.opacity    = '0';
      }
    }
  }

  function goNext() {
    if (!cards.length) return;
    const cur = cards[0].el;
    cur.style.transition = 'transform .5s cubic-bezier(.76,0,.24,1), opacity .38s ease';
    cur.classList.add('above');
    setTimeout(() => cur.remove(), 560);
    cards.shift();
    if (pointer < queue.length) {
      const el = makeCard(queue[pointer], pointer, queue.length);
      dw.appendChild(el);
      cards.push({ el, data: queue[pointer] });
      pointer++;
    }
    if (cards.length === 0) {
      showToast('全作品を鑑賞しました。シャッフル中…');
      setTimeout(() => init(), 1200);
      return;
    }
    updateStack();
  }

  // キーボード操作
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === ' ') goNext();
  });

  // マウスホイール（冒頭収集館と同じ操作感）
  dw.addEventListener('wheel', e => {
    if (e.deltaY > 0) goNext();
  }, { passive: true });

  // ── ハート ───────────────────────────────────────
  bh.addEventListener('click', () => {
    if (!cards.length) return;
    const p = cards[0].data;
    const i = liked.findIndex(x => x.id === p.id);
    if (i >= 0) {
      liked.splice(i, 1);
      bh.classList.remove('lk');
      showToast('解除しました');
    } else {
      liked.push(p);
      bh.classList.add('lk');
      bh.classList.remove('bt'); void bh.offsetWidth; bh.classList.add('bt');
      showToast('ギャラリーに追加しました');
    }
    save(); updateBadge();
  });

  // ── シェア ───────────────────────────────────────
  document.getElementById('btn-share').addEventListener('click', () => {
    if (!cards.length) return;
    const p = cards[0].data;
    const text = `「${p.title}」\n${p.artist}（${p.year}）\n${p.museum ? p.museum + '\n' : ''}\n#名画収集館 #名画 #art`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank', 'noopener'
    );
  });

  // ── フィルタードロワー ────────────────────────────
  const fd = document.getElementById('fd');
  document.getElementById('btn-filter').addEventListener('click', () => {
    fd.classList.add('open'); buildFilterUI();
  });
  document.getElementById('fdb').addEventListener('click', () => fd.classList.remove('open'));

  function buildFilterUI() {
    const body = document.getElementById('fdbody');
    body.innerHTML = '';

    // 現在の対象作品数
    const cnt = PAINTINGS.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style  ) return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist ) return false;
      return true;
    }).length;
    const cd = document.createElement('div');
    cd.className = 'fd-cnt';
    cd.textContent = `現在 ${cnt} 作品が対象`;
    body.appendChild(cd);

    function section(label, key, vals) {
      const s   = document.createElement('div'); s.className = 'fds';
      const lbl = document.createElement('div'); lbl.className = 'fdl'; lbl.textContent = label;
      const pw  = document.createElement('div'); pw.className = 'pw';

      const all = document.createElement('button');
      all.className = 'pill' + (filter[key] === 'all' ? ' on' : '');
      all.textContent = 'すべて';
      all.onclick = () => { filter[key] = 'all'; init(); fd.classList.remove('open'); };
      pw.appendChild(all);

      vals.forEach(v => {
        const pill = document.createElement('button');
        pill.className = 'pill' + (filter[key] === v ? ' on' : '');
        pill.textContent = v;
        pill.onclick = () => { filter[key] = v; init(); fd.classList.remove('open'); };
        pw.appendChild(pill);
      });
      s.appendChild(lbl); s.appendChild(pw); body.appendChild(s);
    }

    section('世紀',       'century', centuries);
    section('画派・スタイル', 'style',   styles);
    section('画家',       'artist',  artists);
  }

  // ── ギャラリー ───────────────────────────────────
  const gp = document.getElementById('gp');
  document.getElementById('btn-gal').addEventListener('click', () => {
    gp.classList.add('open'); renderGallery();
  });
  document.getElementById('gpc').addEventListener('click', () => gp.classList.remove('open'));

  function renderGallery() {
    const grid  = document.getElementById('gg');
    const empty = document.getElementById('ge');
    grid.innerHTML = '';
    if (liked.length === 0) {
      empty.style.display = 'block'; grid.style.display = 'none'; return;
    }
    empty.style.display = 'none'; grid.style.display = 'grid';
    liked.forEach(p => {
      const item  = document.createElement('div'); item.className = 'gi';
      const wire  = document.createElement('div'); wire.className = 'giwire';
      const frame = document.createElement('div'); frame.className = 'gif';
      const img   = document.createElement('img');
      img.src = p.image; img.alt = p.title;
      img.onerror = () => { img.src = `https://placehold.co/120x160/ede4d3/b0997e?text=${encodeURIComponent(p.title.slice(0,6))}`; };
      const lbl = document.createElement('div'); lbl.className = 'gilbl'; lbl.textContent = p.title;
      frame.appendChild(img);
      item.appendChild(wire); item.appendChild(frame); item.appendChild(lbl);
      item.title = `${p.title} — ${p.artist} (${p.year})`;
      grid.appendChild(item);
    });
  }

  // ── 起動 ─────────────────────────────────────────
  updateBadge();
  init();

})();

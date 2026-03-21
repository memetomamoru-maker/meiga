// app.js — 名画収集館
// シカゴ美術館 ARTIC API からパブリックドメイン絵画を動的取得

(function () {

  const IIIF_BASE = 'https://www.artic.edu/iiif/2';
  const API_BASE  = 'https://api.artic.edu/api/v1';

  function imgUrl(id) {
    return `${IIIF_BASE}/${id}/full/843,/0/default.jpg`;
  }

  function toCentury(year) {
    if (!year) return '不明';
    if (year <= 1500) return '15世紀以前';
    if (year <= 1600) return '16世紀';
    if (year <= 1700) return '17世紀';
    if (year <= 1800) return '18世紀';
    if (year <= 1900) return '19世紀';
    return '20世紀';
  }

  // ── DOM ──────────────────────────────────────────
  const dw      = document.getElementById('dw');
  const abt     = document.getElementById('abt');
  const abs     = document.getElementById('abs');
  const bh      = document.getElementById('bh');
  const bdg     = document.getElementById('bdg');
  const toastEl = document.getElementById('toast');

  // ── State ─────────────────────────────────────────
  let allPaintings = [];
  let queue   = [];
  let cards   = [];
  let pointer = 0;
  let liked   = [];
  let filter  = { century: 'all', style: 'all', artist: 'all' };
  let centuries = [], styles = [], artists = [];

  try { liked = JSON.parse(localStorage.getItem('meiga_liked') || '[]'); } catch(e) {}

  // ── ユーティリティ ─────────────────────────────────
  function save() {
    try { localStorage.setItem('meiga_liked', JSON.stringify(liked)); } catch(e) {}
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
  function updateFilterOptions() {
    centuries = [...new Set(allPaintings.map(p => p.century))].sort();
    styles    = [...new Set(allPaintings.map(p => p.style))].filter(Boolean).sort();
    artists   = [...new Set(allPaintings.map(p => p.artist))].filter(Boolean).sort();
  }

  // ── ARTIC API 取得（Gemini指摘：POST + JSONボディ形式）──
  async function fetchPage(page) {
    const url = `${API_BASE}/artworks/search?fields=id,title,artist_display,date_end,style_title,image_id&limit=100&page=${page}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: {
          bool: {
            must: [
              { term: { is_public_domain: true } },
              { term: { artwork_type_title: 'Painting' } }
            ]
          }
        }
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return (data.data || [])
      .filter(d => d.image_id)
      .map((d, i) => ({
        id:      `artic-${page}-${i}`,
        title:   d.title || '無題',
        // FIX: split('\n')は配列を返すので[0]で取得してからtrim()
        artist:  ((d.artist_display || '').split('\n')[0] || '作者不詳').trim(),
        year:    d.date_end || 0,
        century: toCentury(d.date_end),
        style:   d.style_title || 'Painting',
        museum:  'シカゴ美術館',
        image:   imgUrl(d.image_id),
      }));
  }

  // ── 初回ロード ─────────────────────────────────────
  async function initialLoad() {
    showLoadingCard();
    try {
      const first = await fetchPage(1);
      allPaintings = first;
      updateFilterOptions();
      removeLoadingCard();
      initDeck();
      // バックグラウンドで追加取得
      for (let p = 2; p <= 6; p++) {
        fetchPage(p).then(more => {
          allPaintings = allPaintings.concat(more);
          updateFilterOptions();
        }).catch(() => {});
      }
    } catch(e) {
      removeLoadingCard();
      showToast('読み込みに失敗しました。リロードしてください。');
      console.error('ARTIC fetch error:', e);
    }
  }

  function showLoadingCard() {
    const c = document.createElement('div');
    c.className = 'card cur';
    c.id = 'loading-card';
    c.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ink-l);">
        <div class="ph-spinner"></div>
        <div style="font-size:11px;letter-spacing:.15em;font-style:italic;">名画を読み込み中</div>
        <div style="font-size:9px;letter-spacing:.1em;opacity:.5;">Art Institute of Chicago</div>
      </div>`;
    dw.appendChild(c);
  }

  function removeLoadingCard() {
    const c = document.getElementById('loading-card');
    if (c) c.remove();
  }

  // ── キュー・デッキ ────────────────────────────────
  function buildQueue() {
    const res = allPaintings.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    });
    if (!res.length) { showToast('該当する作品がありません'); return false; }
    queue   = [...res].sort(() => Math.random() - .5);
    pointer = 0;
    return true;
  }

  function clearDeck() {
    cards.forEach(c => c.el.remove());
    cards = []; pointer = 0;
  }

  function initDeck() {
    clearDeck();
    if (!buildQueue()) return;
    for (let i = 0; i < Math.min(3, queue.length); i++) {
      const el = makeCard(queue[i], i, queue.length);
      dw.appendChild(el);
      cards.push({ el, data: queue[i] });
    }
    pointer = Math.min(3, queue.length);
    updateStack();
  }

  function makeCard(p, idx, total) {
    const card = document.createElement('div');
    card.className = 'card';
    card._p = p;

    const num  = document.createElement('div');
    num.className = 'card-num';
    num.textContent = `${idx + 1} / ${total}`;

    const stag = document.createElement('div');
    stag.className = 'style-tag';
    stag.textContent = p.century;

    const nail = document.createElement('div'); nail.className = 'nail';
    const wire = document.createElement('div'); wire.className = 'wire';

    const fw = document.createElement('div');
    fw.className = 'frame-wrap';

    const ph = document.createElement('div');
    ph.className = 'painting-placeholder';
    ph.innerHTML = `<div class="ph-spinner"></div><div class="ph-title">${p.title}</div>`;
    fw.appendChild(ph);

    const img = document.createElement('img');
    img.className = 'painting-img';
    img.alt = p.title;
    img.onload  = () => { img.classList.add('loaded'); ph.style.display = 'none'; };
    img.onerror = () => { ph.innerHTML = `<div class="ph-title" style="opacity:.35;">${p.title}</div>`; };
    img.src = p.image;
    fw.appendChild(img);

    const shadow = document.createElement('div');
    shadow.className = 'frame-shadow';

    card.appendChild(num);
    card.appendChild(stag);
    card.appendChild(nail);
    card.appendChild(wire);
    card.appendChild(fw);
    card.appendChild(shadow);
    return card;
  }

  function updateStack() {
    cards.forEach(({ el }, i) => {
      el.classList.remove('cur', 'above', 'drag');
      if (i === 0) {
        el.classList.add('cur');
        el.style.transform = ''; el.style.opacity = '';
        updateMeta(el._p);
      } else {
        el.style.transform  = 'translateY(110%)';
        el.style.opacity    = '0';
        el.style.transition = '';
      }
    });
  }

  function updateMeta(p) {
    if (!p) return;
    abt.textContent = p.title;
    abs.textContent = `${p.artist}  ·  ${p.year || '年不明'}  ·  ${p.museum}`;
    bh.classList.toggle('lk', liked.some(x => x.id === p.id));
  }

  // ── スワイプ ──────────────────────────────────────
  let isDrag = false, startY = 0, diffY = 0;
  const THRESH = 48;

  dw.addEventListener('mousedown',  e => onStart(e.clientY));
  // FIX: e.touches[0].clientY（インデックス必要）
  dw.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive: true });
  window.addEventListener('mousemove', e => { if (isDrag) onMove(e.clientY); });
  // FIX: e.touches[0].clientY
  window.addEventListener('touchmove', e => { if (isDrag) onMove(e.touches[0].clientY); }, { passive: true });
  window.addEventListener('mouseup',  onEnd);
  window.addEventListener('touchend', onEnd);

  function onStart(y) {
    if (!cards.length) return;
    isDrag = true; startY = y; diffY = 0;
    // FIX: cards[0].el（cardsは配列）
    cards[0].el.classList.add('drag');
  }
  function onMove(y) {
    if (!isDrag || !cards.length) return;
    diffY = y - startY;
    const dy = Math.min(0, diffY);
    // FIX: cards[0].el
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
    // FIX: cards[0].el
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
    // FIX: cards[0].el
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
    if (!cards.length) {
      showToast('シャッフルして最初から…');
      setTimeout(() => initDeck(), 1200);
      return;
    }
    updateStack();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === ' ') goNext();
  });
  dw.addEventListener('wheel', e => { if (e.deltaY > 0) goNext(); }, { passive: true });

  // ── ハート ────────────────────────────────────────
  bh.addEventListener('click', () => {
    if (!cards.length) return;
    // FIX: cards[0].data
    const p = cards[0].data;
    const i = liked.findIndex(x => x.id === p.id);
    if (i >= 0) {
      liked.splice(i, 1); bh.classList.remove('lk'); showToast('解除しました');
    } else {
      liked.push(p); bh.classList.add('lk');
      bh.classList.remove('bt'); void bh.offsetWidth; bh.classList.add('bt');
      showToast('ギャラリーに追加しました');
    }
    save(); updateBadge();
  });

  // ── シェア ────────────────────────────────────────
  document.getElementById('btn-share').addEventListener('click', () => {
    if (!cards.length) return;
    // FIX: cards[0].data
    const p = cards[0].data;
    const t = `「${p.title}」\n${p.artist}（${p.year || ''}）\n${p.museum}\n\n#名画収集館 #名画 #art`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  });

  // ── フィルタードロワー ─────────────────────────────
  const fd = document.getElementById('fd');
  document.getElementById('btn-filter').addEventListener('click', () => {
    fd.classList.add('open'); buildFilterUI();
  });
  document.getElementById('fdb').addEventListener('click', () => fd.classList.remove('open'));

  function buildFilterUI() {
    const body = document.getElementById('fdbody');
    body.innerHTML = '';
    const cnt = allPaintings.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    }).length;
    const cd = document.createElement('div');
    cd.className = 'fd-cnt';
    cd.textContent = `現在 ${cnt} 作品が対象`;
    body.appendChild(cd);

    function sec(label, key, vals) {
      const s   = document.createElement('div'); s.className = 'fds';
      const lbl = document.createElement('div'); lbl.className = 'fdl'; lbl.textContent = label;
      const pw  = document.createElement('div'); pw.className = 'pw';
      const all = document.createElement('button');
      all.className = 'pill' + (filter[key] === 'all' ? ' on' : '');
      all.textContent = 'すべて';
      all.onclick = () => { filter[key] = 'all'; initDeck(); fd.classList.remove('open'); };
      pw.appendChild(all);
      vals.slice(0, 30).forEach(v => {
        const pill = document.createElement('button');
        pill.className = 'pill' + (filter[key] === v ? ' on' : '');
        pill.textContent = v;
        pill.onclick = () => { filter[key] = v; initDeck(); fd.classList.remove('open'); };
        pw.appendChild(pill);
      });
      s.appendChild(lbl); s.appendChild(pw); body.appendChild(s);
    }
    sec('世紀',     'century', centuries);
    sec('スタイル', 'style',   styles);
    sec('画家',     'artist',  artists);
  }

  // ── ギャラリー ────────────────────────────────────
  const gp = document.getElementById('gp');
  document.getElementById('btn-gal').addEventListener('click', () => {
    gp.classList.add('open'); renderGallery();
  });
  document.getElementById('gpc').addEventListener('click', () => gp.classList.remove('open'));

  function renderGallery() {
    const grid  = document.getElementById('gg');
    const empty = document.getElementById('ge');
    grid.innerHTML = '';
    if (!liked.length) {
      empty.style.display = 'block'; grid.style.display = 'none'; return;
    }
    empty.style.display = 'none'; grid.style.display = 'grid';
    liked.forEach(p => {
      const item  = document.createElement('div'); item.className = 'gi';
      const wire  = document.createElement('div'); wire.className = 'giwire';
      const frame = document.createElement('div'); frame.className = 'gif';
      const img   = document.createElement('img');
      img.src = p.image; img.alt = p.title;
      const lbl = document.createElement('div'); lbl.className = 'gilbl'; lbl.textContent = p.title;
      frame.appendChild(img);
      item.appendChild(wire); item.appendChild(frame); item.appendChild(lbl);
      item.title = `${p.title} — ${p.artist} (${p.year})`;
      grid.appendChild(item);
    });
  }

  // ── 起動 ──────────────────────────────────────────
  updateBadge();
  initialLoad();

})();

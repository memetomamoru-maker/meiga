// app.js — 名画収集館
// Gemini修正版 + touches[0]バグ修正済み

(function () {

  // ── DOM ──────────────────────────────────────────
  const dw      = document.getElementById('dw');
  const abt     = document.getElementById('abt');
  const abs     = document.getElementById('abs');
  const bh      = document.getElementById('bh');
  const bdg     = document.getElementById('bdg');
  const toastEl = document.getElementById('toast');

  // ── State ─────────────────────────────────────────
  let queue   = [];
  let cursor  = 0;
  let liked   = [];
  let filter  = { century: 'all', style: 'all', artist: 'all' };
  let centuries = [], styles = [], artists = [];

  let curCard  = null;
  let nextCard = null;
  let prevCard = null;

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
    const src = STATIC_PAINTINGS;
    centuries = [...new Set(src.map(p => p.century))].sort();
    styles    = [...new Set(src.map(p => p.style))].filter(Boolean).sort();
    artists   = [...new Set(src.map(p => p.artist))].filter(Boolean).sort();
  }

  // ── 画像URL軽量化（Wikimedia thumb形式に変換）────────
  function getOptimizedUrl(url) {
    if (!url) return url;
    // すでにthumb形式ならそのまま
    if (url.includes('/thumb/')) return url;
    // commons直URLをthumb/800px形式に変換
    const m = url.match(/\/commons\/([0-9a-f]\/[0-9a-f]{2})\/(.+)$/i);
    if (m) {
      const hash = m[1], file = m[2];
      return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}/${file}/800px-${file}`;
    }
    return url;
  }

  // ── キュー構築 ────────────────────────────────────
  function buildQueue() {
    const res = STATIC_PAINTINGS.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    });
    if (!res.length) { showToast('該当する作品がありません'); return false; }
    queue  = [...res].sort(() => Math.random() - .5);
    cursor = 0;
    return true;
  }

  // ── カード生成 ────────────────────────────────────
  function makeCard(p, idx) {
    if (!p) return null;
    const card = document.createElement('div');
    card.className = 'card';
    card._p = p;

    const num  = document.createElement('div');
    num.className = 'card-num';
    num.textContent = `${idx + 1} / ${queue.length}`;

    const stag = document.createElement('div');
    stag.className = 'style-tag';
    stag.textContent = p.style;

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
    img.onerror = () => { ph.innerHTML = `<div class="ph-title" style="opacity:.4">${p.title}</div>`; };
    img.src = getOptimizedUrl(p.image);
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

  // ── デッキ初期化 ──────────────────────────────────
  function initDeck() {
    dw.querySelectorAll('.card').forEach(c => c.remove());
    curCard = prevCard = nextCard = null;

    if (!buildQueue()) return;

    curCard = makeCard(queue[cursor], cursor);
    curCard.classList.add('cur');
    dw.appendChild(curCard);

    if (cursor + 1 < queue.length) {
      nextCard = makeCard(queue[cursor + 1], cursor + 1);
      nextCard.style.cssText = 'transform:translateY(110%);opacity:0;transition:none;';
      dw.appendChild(nextCard);
    }

    updateMeta();
  }

  function updateMeta() {
    const p = queue[cursor];
    if (!p) return;
    abt.textContent = p.title;
    abs.textContent = `${p.artist}  ·  ${p.year || '年不明'}  ·  ${p.museum}`;
    bh.classList.toggle('lk', liked.some(x => x.id === p.id));
  }

  // ── スワイプ ──────────────────────────────────────
  let isDrag = false, startY = 0, diffY = 0;
  const THRESH = 50;

  dw.addEventListener('mousedown',  e => onStart(e.clientY));
  // FIX: e.touches[0].clientY（Geminiが直し損ねていたバグ）
  dw.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive: true });
  window.addEventListener('mousemove',  e => { if (isDrag) onMove(e.clientY); });
  // FIX: e.touches[0].clientY
  window.addEventListener('touchmove',  e => { if (isDrag) onMove(e.touches[0].clientY); }, { passive: true });
  window.addEventListener('mouseup',  onEnd);
  window.addEventListener('touchend', onEnd);

  function onStart(y) {
    if (!curCard) return;
    isDrag = true; startY = y; diffY = 0;
    curCard.classList.add('drag');
  }

  function onMove(y) {
    if (!isDrag || !curCard) return;
    diffY = y - startY;
    curCard.style.transform = `translateY(${diffY * 0.38}px)`;

    if (diffY < 0 && nextCard) {
      const prog = Math.min(Math.abs(diffY) / (THRESH * 1.5), 1);
      nextCard.style.transition = 'none';
      nextCard.style.transform  = `translateY(${(1 - prog) * 110}%)`;
      nextCard.style.opacity    = String(prog);
    } else if (diffY > 0 && prevCard) {
      const prog = Math.min(diffY / (THRESH * 1.5), 1);
      prevCard.style.transition = 'none';
      prevCard.style.transform  = `translateY(${-(1 - prog) * 110}%)`;
      prevCard.style.opacity    = String(prog);
    }
  }

  function onEnd() {
    if (!isDrag) return;
    isDrag = false;
    if (!curCard) return;
    curCard.classList.remove('drag');
    curCard.style.transition = '';

    if (diffY < -THRESH) {
      goNext();
    } else if (diffY > THRESH) {
      goPrev();
    } else {
      curCard.style.transform = '';
      if (nextCard) { nextCard.style.transition = ''; nextCard.style.transform = 'translateY(110%)'; nextCard.style.opacity = '0'; }
      if (prevCard) { prevCard.style.transition = ''; prevCard.style.transform = 'translateY(-110%)'; prevCard.style.opacity = '0'; }
    }
  }

  // ── 次へ（上スワイプ）────────────────────────────
  function goNext() {
    if (cursor >= queue.length - 1) {
      showToast('シャッフルして最初から…');
      setTimeout(() => initDeck(), 800);
      return;
    }

    const DUR = '.48s', EASE = 'cubic-bezier(.76,0,.24,1)';

    // 古いprevCardを削除
    if (prevCard) { prevCard.remove(); }

    // 現在カードを上へ退場・prevCardに昇格
    curCard.classList.remove('cur');
    curCard.style.transition = `transform ${DUR} ${EASE}, opacity .35s ease`;
    curCard.style.transform  = 'translateY(-110%)';
    curCard.style.opacity    = '0';
    prevCard = curCard;

    // nextCardを現在に
    curCard = nextCard;
    cursor++;

    if (curCard) {
      curCard.style.transition = `transform ${DUR} ${EASE}, opacity .35s ease`;
      curCard.classList.add('cur');
      curCard.style.transform  = 'translateY(0)';
      curCard.style.opacity    = '1';
    }

    // 次の次を準備
    if (cursor + 1 < queue.length) {
      nextCard = makeCard(queue[cursor + 1], cursor + 1);
      nextCard.style.cssText = 'transform:translateY(110%);opacity:0;transition:none;';
      dw.appendChild(nextCard);
    } else {
      nextCard = null;
    }

    updateMeta();
  }

  // ── 前へ（下スワイプ）────────────────────────────
  function goPrev() {
    if (cursor <= 0) {
      showToast('最初の作品です');
      curCard.style.transform = '';
      return;
    }

    const DUR = '.48s', EASE = 'cubic-bezier(.76,0,.24,1)';

    // 古いnextCardを削除
    if (nextCard) { nextCard.remove(); }

    // 現在カードを下へ退場・nextCardに降格
    curCard.classList.remove('cur');
    curCard.style.transition = `transform ${DUR} ${EASE}, opacity .35s ease`;
    curCard.style.transform  = 'translateY(110%)';
    curCard.style.opacity    = '0';
    nextCard = curCard;

    // prevCardを現在に
    curCard = prevCard;
    cursor--;

    if (curCard) {
      curCard.style.transition = `transform ${DUR} ${EASE}, opacity .35s ease`;
      curCard.classList.add('cur');
      curCard.style.transform  = 'translateY(0)';
      curCard.style.opacity    = '1';
    }

    // 1枚前を準備
    if (cursor - 1 >= 0) {
      prevCard = makeCard(queue[cursor - 1], cursor - 1);
      prevCard.style.cssText = 'transform:translateY(-110%);opacity:0;transition:none;';
      dw.insertBefore(prevCard, curCard);
    } else {
      prevCard = null;
    }

    updateMeta();
  }

  // ── キーボード・ホイール ───────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
  });
  dw.addEventListener('wheel', e => {
    if (e.deltaY > 0) goNext();
    else if (e.deltaY < 0) goPrev();
  }, { passive: true });

  // ── ハート ────────────────────────────────────────
  bh.addEventListener('click', () => {
    const p = queue[cursor];
    if (!p) return;
    const idx = liked.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      liked.splice(idx, 1); bh.classList.remove('lk'); showToast('解除しました');
    } else {
      liked.push(p); bh.classList.add('lk');
      bh.classList.remove('bt'); void bh.offsetWidth; bh.classList.add('bt');
      showToast('ギャラリーに追加しました');
    }
    save(); updateBadge();
  });

  // ── シェア ────────────────────────────────────────
  document.getElementById('btn-share').addEventListener('click', () => {
    const p = queue[cursor];
    if (!p) return;
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
    const cnt = STATIC_PAINTINGS.filter(p => {
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
      vals.forEach(v => {
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
      img.src = getOptimizedUrl(p.image); img.alt = p.title;
      const lbl = document.createElement('div'); lbl.className = 'gilbl'; lbl.textContent = p.title;
      frame.appendChild(img);
      item.appendChild(wire); item.appendChild(frame); item.appendChild(lbl);
      item.title = `${p.title} — ${p.artist} (${p.year})`;
      grid.appendChild(item);
    });
  }

  // ── 起動 ──────────────────────────────────────────
  updateBadge();
  updateFilterOptions();
  initDeck();

})();

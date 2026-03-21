// app.js — 名画収集館 v5
(function () {
  'use strict';

  const dw      = document.getElementById('dw');
  const abt     = document.getElementById('abt');
  const abs     = document.getElementById('abs');
  const bh      = document.getElementById('bh');
  const bdg     = document.getElementById('bdg');
  const toastEl = document.getElementById('toast');

  let allPaintings = [];
  let queue  = [];
  let cursor = 0;
  let liked  = [];
  let filter = { century: 'all', style: 'all', artist: 'all' };
  let centuries = [], styles = [], artists = [];
  let curCard = null, nextCard = null, prevCard = null;
  let isAnimating = false;

  try { liked = JSON.parse(localStorage.getItem('meiga_liked') || '[]'); } catch(e) { liked = []; }
  function save() { try { localStorage.setItem('meiga_liked', JSON.stringify(liked)); } catch(e) {} }

  function updateBadge() {
    bdg.textContent = liked.length;
    liked.length > 0 ? bdg.classList.add('on') : bdg.classList.remove('on');
  }

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ── 使い方ガイド ──────────────────────────────────────────
  const guide = document.getElementById('guide');
  const btnGuideStart = document.getElementById('guide-start');
  const btnGuideSkip  = document.getElementById('guide-skip');
  const btnGuideOpen  = document.getElementById('btn-guide');

  function showGuide() { guide.classList.remove('hidden'); }
  function hideGuide() { guide.classList.add('hidden'); }

  btnGuideStart.addEventListener('click', () => hideGuide());
  btnGuideSkip.addEventListener('click', () => {
    hideGuide();
    try { localStorage.setItem('meiga_guide_skip', '1'); } catch(e) {}
  });
  btnGuideOpen.addEventListener('click', () => showGuide());

  const skipGuide = (() => { try { return localStorage.getItem('meiga_guide_skip') === '1'; } catch(e) { return false; } })();
  if (skipGuide) hideGuide();

  // ── ホーム画面追加バナー ──────────────────────────────────
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!isStandalone && !localStorage.getItem('meiga_a2hs_dismissed')) {
    const a2hsBanner = document.getElementById('a2hs-banner');
    if (a2hsBanner) {
      a2hsBanner.style.display = 'flex';
      document.getElementById('a2hs-close').addEventListener('click', () => {
        a2hsBanner.style.display = 'none';
        localStorage.setItem('meiga_a2hs_dismissed', '1');
      });
    }
  }

  // ── フィルター選択肢の構築 ────────────────────────────────
  function updateFilterOptions() {
    centuries = [...new Set(allPaintings.map(p => p.century))].filter(Boolean).sort((a, b) => {
      const order = ['14世紀以前','15世紀','16世紀','17世紀','18世紀','19世紀','20世紀','不明'];
      return order.indexOf(a) - order.indexOf(b);
    });
    styles = [...new Set(allPaintings.map(p => p.style))]
      .filter(s => s && s !== '絵画' && s !== 'Paintings' && s !== 'Oil on canvas' && s.length < 25)
      .sort();
    artists = [...new Set(allPaintings.map(p => p.artist))].filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ja'));
  }

  // ── API取得 ──────────────────────────────────────────────
  async function fetchPaintings() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    try {
      const res = await fetch('/api/paintings', { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.paintings && data.paintings.length > 0) {
        allPaintings = data.paintings;
        updateFilterOptions();
        return true;
      }
    } catch(e) {
      clearTimeout(timeout);
      console.error('API fetch error:', e);
    }
    return false;
  }

  // ── 起動 ─────────────────────────────────────────────────
  async function initialLoad() {
    showLoadingCard();
    const ok = await fetchPaintings();
    removeLoadingCard();

    if (!ok || allPaintings.length === 0) {
      const errCard = document.createElement('div');
      errCard.className = 'card cur';
      errCard.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ink-m);padding:24px;text-align:center;">
        <div style="font-size:13px;font-style:italic;">読み込みに失敗しました</div>
        <button onclick="location.reload()" style="padding:9px 22px;border:1px solid var(--gold);background:transparent;cursor:pointer;font-family:inherit;font-size:11px;color:var(--gold);letter-spacing:.1em;">再読み込み</button>
      </div>`;
      dw.appendChild(errCard);
      return;
    }

    buildQueue();
    renderDeck();
  }

  function showLoadingCard() {
    const c = document.createElement('div');
    c.className = 'card cur'; c.id = 'loading-card';
    c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--ink-l);">
      <div class="ph-spinner"></div>
      <div style="font-size:10px;letter-spacing:.2em;font-style:italic;">名画を集めています</div>
    </div>`;
    dw.appendChild(c);
  }
  function removeLoadingCard() {
    const c = document.getElementById('loading-card'); if (c) c.remove();
  }

  // ── キュー構築 ───────────────────────────────────────────
  function buildQueue() {
    const filtered = allPaintings.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    });
    if (!filtered.length) { showToast('該当する作品がありません'); return false; }

    if (filter.century === 'all' && filter.style === 'all' && filter.artist === 'all') {
      queue = [...filtered];
    } else {
      queue = [...filtered].sort(() => Math.random() - .5);
    }
    cursor = 0;
    return true;
  }

  function renderDeck() {
    dw.querySelectorAll('.card').forEach(c => c.remove());
    curCard = prevCard = nextCard = null;
    isAnimating = false;
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
    updateNavButtons();
    updateFilterFooter();
  }

  function makeCard(p, idx) {
    if (!p) return null;
    const card = document.createElement('div');
    card.className = 'card'; card._p = p;

    const num = document.createElement('div');
    num.className = 'card-num';
    num.textContent = `${idx + 1} / ${queue.length}`;

    // 世紀タグ（右上から左上に移動して矢印と被らないよう修正）
    const stag = document.createElement('div');
    stag.className = 'style-tag';
    stag.textContent = p.century;

    const nail  = document.createElement('div'); nail.className = 'nail';
    const wire  = document.createElement('div'); wire.className = 'wire';
    const fw    = document.createElement('div'); fw.className = 'frame-wrap';

    const ph = document.createElement('div');
    ph.className = 'painting-placeholder';
    ph.innerHTML = `<div class="ph-spinner"></div><div class="ph-title">${p.title}</div>`;
    fw.appendChild(ph);

    const img = document.createElement('img');
    img.className = 'painting-img'; img.alt = p.title; img.decoding = 'async';
    img.onload  = () => { img.classList.add('loaded'); ph.style.display = 'none'; };
    img.onerror = () => { ph.innerHTML = `<div class="ph-title" style="opacity:.5">${p.title}</div>`; };
    img.src = p.image;
    fw.appendChild(img);

    const shadow = document.createElement('div'); shadow.className = 'frame-shadow';
    card.appendChild(num); card.appendChild(stag);
    card.appendChild(nail); card.appendChild(wire);
    card.appendChild(fw); card.appendChild(shadow);
    return card;
  }

  function updateMeta() {
    const p = queue[cursor]; if (!p) return;
    abt.textContent = p.title;
    // 作品名クリックでWikipedia/美術館ページへ
    const link = p.wikiUrl || p.museumUrl;
    if (link) {
      abt.style.cursor = 'pointer';
      abt.title = '詳細を見る';
      abt.onclick = () => window.open(link, '_blank', 'noopener,noreferrer');
      abt.classList.add('abt-link');
    } else {
      abt.style.cursor = 'default';
      abt.onclick = null;
      abt.classList.remove('abt-link');
    }
    abs.textContent = `${p.artist}  ·  ${p.year || '年代不明'}  ·  ${p.museum}`;
    bh.classList.toggle('lk', liked.some(x => x.id === p.id));
  }

  function updateNavButtons() {
    const bp = document.getElementById('btn-prev');
    const bn = document.getElementById('btn-next');
    if (bp) bp.style.opacity = cursor <= 0 ? '0.3' : '1';
    if (bn) bn.style.opacity = cursor >= queue.length - 1 ? '0.3' : '1';
  }

  // ── スワイプ ─────────────────────────────────────────────
  let isDrag = false, startY = 0, diffY = 0, startTime = 0;
  const THRESH = 55, RESIST = 0.42;

  dw.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.clientY); });
  dw.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive: true });
  window.addEventListener('mousemove', e => { if (isDrag) onMove(e.clientY); });
  window.addEventListener('touchmove', e => { if (isDrag) { e.preventDefault(); onMove(e.touches[0].clientY); } }, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
  window.addEventListener('touchcancel', onEnd);

  function onStart(y) {
    if (!curCard || isAnimating) return;
    isDrag = true; startY = y; diffY = 0; startTime = Date.now();
    curCard.style.transition = 'none';
  }
  function onMove(y) {
    if (!isDrag || !curCard) return;
    diffY = y - startY;
    curCard.style.transform = `translateY(${diffY * RESIST}px)`;
    if (diffY < 0 && nextCard) {
      const prog = Math.min(Math.abs(diffY) / (THRESH * 1.8), 1);
      nextCard.style.transition = 'none';
      nextCard.style.transform  = `translateY(${(1 - prog) * 110}%)`;
      nextCard.style.opacity    = String(prog * 0.9);
    } else if (diffY > 0 && prevCard) {
      const prog = Math.min(diffY / (THRESH * 1.8), 1);
      prevCard.style.transition = 'none';
      prevCard.style.transform  = `translateY(${-(1 - prog) * 110}%)`;
      prevCard.style.opacity    = String(prog * 0.9);
    }
  }
  function onEnd() {
    if (!isDrag) return; isDrag = false; if (!curCard) return;
    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(diffY) / elapsed; // px/ms
    // 速度閾値でも判定（高速スワイプ対応 + 遅い誤操作防止）
    const isSwipe = Math.abs(diffY) > THRESH || (velocity > 0.5 && Math.abs(diffY) > 20);
    if      (diffY < -THRESH || (diffY < -20 && velocity > 0.5)) goNext();
    else if (diffY >  THRESH || (diffY >  20 && velocity > 0.5)) goPrev();
    else snapBack();
  }
  function snapBack() {
    if (!curCard) return;
    curCard.style.transition = 'transform 0.28s cubic-bezier(.34,1.56,.64,1)';
    curCard.style.transform  = 'translateY(0)';
    if (nextCard) { nextCard.style.transition = 'transform 0.28s ease,opacity 0.28s ease'; nextCard.style.transform = 'translateY(110%)'; nextCard.style.opacity = '0'; }
    if (prevCard) { prevCard.style.transition = 'transform 0.28s ease,opacity 0.28s ease'; prevCard.style.transform = 'translateY(-110%)'; prevCard.style.opacity = '0'; }
  }

  const DUR = '0.42s', EASE = 'cubic-bezier(.55,0,.1,1)';

  function goNext() {
    if (!curCard || isAnimating) return;
    if (cursor >= queue.length - 1) { showToast('すべての作品を見ました。最初に戻ります。'); setTimeout(() => { cursor = -1; goNext(); }, 600); return; }
    isAnimating = true;
    if (prevCard) { prevCard.remove(); prevCard = null; }
    curCard.style.transition = `transform ${DUR} ${EASE},opacity 0.24s ease`;
    curCard.style.transform  = 'translateY(-110%)'; curCard.style.opacity = '0';
    prevCard = curCard; curCard = nextCard; cursor++;
    if (curCard) { curCard.style.transition = `transform ${DUR} ${EASE}`; curCard.classList.add('cur'); curCard.style.transform = 'translateY(0)'; curCard.style.opacity = '1'; }
    if (cursor + 1 < queue.length) {
      nextCard = makeCard(queue[cursor + 1], cursor + 1);
      nextCard.style.cssText = `transform:translateY(110%);opacity:0;transition:none;`;
      dw.appendChild(nextCard);
    } else { nextCard = null; }
    updateMeta(); updateNavButtons();
    setTimeout(() => { isAnimating = false; }, 460);
  }

  function goPrev() {
    if (!curCard || isAnimating) return;
    if (cursor <= 0) { showToast('最初の作品です'); snapBack(); return; }
    isAnimating = true;
    if (nextCard) { nextCard.remove(); nextCard = null; }
    curCard.style.transition = `transform ${DUR} ${EASE},opacity 0.24s ease`;
    curCard.style.transform  = 'translateY(110%)'; curCard.style.opacity = '0';
    nextCard = curCard; curCard = prevCard; cursor--;
    if (curCard) { curCard.style.transition = `transform ${DUR} ${EASE}`; curCard.classList.add('cur'); curCard.style.transform = 'translateY(0)'; curCard.style.opacity = '1'; }
    if (cursor - 1 >= 0) {
      prevCard = makeCard(queue[cursor - 1], cursor - 1);
      prevCard.style.cssText = `transform:translateY(-110%);opacity:0;transition:none;`;
      dw.insertBefore(prevCard, curCard);
    } else { prevCard = null; }
    updateMeta(); updateNavButtons();
    setTimeout(() => { isAnimating = false; }, 460);
  }

  // ── キーボード・ホイール ──────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    if (e.key === 'Escape') { document.getElementById('fd').classList.remove('open'); document.getElementById('gp').classList.remove('open'); hideGuide(); }
  });
  let wheelThrottle = false;
  dw.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelThrottle) return; wheelThrottle = true;
    if (e.deltaY > 0) goNext(); else goPrev();
    setTimeout(() => { wheelThrottle = false; }, 520);
  }, { passive: false });

  document.getElementById('btn-prev').addEventListener('click', goPrev);
  document.getElementById('btn-next').addEventListener('click', goNext);

  // ── ハート ───────────────────────────────────────────────
  bh.addEventListener('click', () => {
    const p = queue[cursor]; if (!p) return;
    const idx = liked.findIndex(x => x.id === p.id);
    if (idx >= 0) { liked.splice(idx, 1); bh.classList.remove('lk'); showToast('ギャラリーから外しました'); }
    else { liked.push(p); bh.classList.add('lk'); bh.classList.remove('bt'); void bh.offsetWidth; bh.classList.add('bt'); showToast('ギャラリーに追加しました ♡'); }
    save(); updateBadge();
  });

  // ── シェア ───────────────────────────────────────────────
  document.getElementById('btn-share').addEventListener('click', () => {
    const p = queue[cursor]; if (!p) return;
    const url = 'https://meiga.vercel.app/';
    const t = `「${p.title}」\n${p.artist}（${p.year || ''}）\n${p.museum}\n\n名画の世界を旅するアプリ「名画収集館」\n${url}\n\n#名画収集館 #名画 #art #masterpiece`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank', 'noopener,noreferrer');
  });

  // ── 画像保存 ─────────────────────────────────────────────
  document.getElementById('btn-save-img').addEventListener('click', async () => {
    const p = queue[cursor]; if (!p) return;
    try {
      showToast('画像を保存中...');
      const res = await fetch(p.image);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `meiga_${p.title.replace(/[^\w\u3040-\u9FFF]/g, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('保存しました');
    } catch(e) {
      // フォールバック：画像URLを新タブで開く
      window.open(p.image, '_blank');
      showToast('新しいタブで画像を開きました');
    }
  });

  // ── フィルタードロワー ─────────────────────────────────────
  const fd = document.getElementById('fd');
  document.getElementById('btn-filter').addEventListener('click', () => { fd.classList.add('open'); buildFilterUI(); });
  document.getElementById('fdb').addEventListener('click', () => fd.classList.remove('open'));
  document.getElementById('fdb2').addEventListener('click', () => fd.classList.remove('open'));
  document.getElementById('fd-reset-btn').addEventListener('click', () => {
    filter = { century: 'all', style: 'all', artist: 'all' };
    renderDeck(); fd.classList.remove('open');
  });

  function updateFilterFooter() {
    const count = allPaintings.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    }).length;
    const lbl = document.getElementById('fd-cnt-label');
    const rst = document.getElementById('fd-reset-btn');
    if (lbl) lbl.textContent = `${count} 作品が対象`;
    if (rst) rst.disabled = filter.century === 'all' && filter.style === 'all' && filter.artist === 'all';
  }

  const sectionState = { century: true, style: false, artist: false };

  function buildFilterUI() {
    updateFilterFooter();
    const body = document.getElementById('fdbody');
    body.innerHTML = '';

    function sec(label, key, vals, emoji) {
      if (!vals || vals.length === 0) return;
      const s = document.createElement('div'); s.className = 'fds';

      const hdr = document.createElement('div');
      hdr.className = 'fds-header' + (sectionState[key] ? ' open' : '');

      const lbl = document.createElement('div'); lbl.className = 'fdl';
      const currentVal = filter[key] === 'all' ? 'すべて' : filter[key];
      lbl.innerHTML = `${emoji ? emoji + '&nbsp;' : ''}${label} <span class="fdl-count">${currentVal}</span>`;

      const arrow = document.createElement('div'); arrow.className = 'fds-arrow'; arrow.textContent = '▾';
      hdr.appendChild(lbl); hdr.appendChild(arrow);

      const bdy = document.createElement('div');
      bdy.className = 'fds-body' + (sectionState[key] ? ' open' : '');

      const pw = document.createElement('div'); pw.className = 'pw';

      const allBtn = document.createElement('button');
      allBtn.className = 'pill' + (filter[key] === 'all' ? ' on' : '');
      allBtn.textContent = 'すべて';
      allBtn.onclick = () => {
        filter[key] = 'all';
        renderDeck(); updateFilterFooter(); buildFilterUI();
      };
      pw.appendChild(allBtn);

      vals.forEach(v => {
        const pill = document.createElement('button');
        pill.className = 'pill' + (filter[key] === v ? ' on' : '');
        pill.textContent = v;
        pill.onclick = () => {
          filter[key] = v;
          updateFilterFooter();
          buildFilterUI();
          renderDeck();
          // フィルター選択後もドロワーを開いたままにする（がっかり感解消）
          // ※ユーザーが明示的に閉じるまで開いたまま
        };
        pw.appendChild(pill);
      });

      bdy.appendChild(pw);

      hdr.onclick = () => {
        sectionState[key] = !sectionState[key];
        hdr.classList.toggle('open', sectionState[key]);
        bdy.classList.toggle('open', sectionState[key]);
      };

      s.appendChild(hdr); s.appendChild(bdy); body.appendChild(s);
    }

    sec('時代・世紀', 'century', centuries, '🏛');
    sec('画派・スタイル', 'style', styles, '🎨');
    sec('画家', 'artist', artists, '👤');
  }

  // ── ギャラリー ────────────────────────────────────────────
  const gp = document.getElementById('gp');
  document.getElementById('btn-gal').addEventListener('click', () => { gp.classList.add('open'); renderGallery(); });
  document.getElementById('gpc').addEventListener('click', () => gp.classList.remove('open'));

  function renderGallery() {
    const grid  = document.getElementById('gg');
    const empty = document.getElementById('ge');
    grid.innerHTML = '';

    if (!liked.length) {
      empty.style.display = 'block'; grid.style.display = 'none'; return;
    }
    empty.style.display = 'none'; grid.style.display = 'grid';

    liked.forEach((p, i) => {
      const item = document.createElement('div'); item.className = 'gi'; item.style.animationDelay = `${i * 0.04}s`;
      const wire  = document.createElement('div'); wire.className = 'giwire';
      const frame = document.createElement('div'); frame.className = 'gif';

      const img = document.createElement('img');
      img.alt = p.title; img.loading = 'lazy';
      // ギャラリーで画像が出ない問題：img.srcを明示的にセット
      img.src = '';
      img.addEventListener('error', () => {
        // エラー時はプレースホルダー
        img.style.display = 'none';
        const ph2 = document.createElement('div');
        ph2.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--ink-l);padding:4px;text-align:center;font-style:italic;';
        ph2.textContent = p.title;
        frame.appendChild(ph2);
      });
      // 少し遅延させてsrcをセット（キャッシュ問題回避）
      requestAnimationFrame(() => { img.src = p.image; });

      const del = document.createElement('button'); del.className = 'gi-del'; del.innerHTML = '×'; del.title = '削除';
      del.onclick = e => {
        e.stopPropagation();
        const idx = liked.findIndex(x => x.id === p.id);
        if (idx >= 0) { liked.splice(idx, 1); save(); updateBadge(); }
        item.style.cssText = 'transform:scale(0);opacity:0;transition:all 0.2s ease';
        setTimeout(() => { item.remove(); if (liked.length === 0) renderGallery(); }, 200);
        if (queue[cursor] && queue[cursor].id === p.id) bh.classList.remove('lk');
      };

      // ギャラリー内作品名クリックで詳細へ
      const lbl = document.createElement('div'); lbl.className = 'gilbl'; lbl.textContent = p.title;
      const sub = document.createElement('div'); sub.className = 'gilsub'; sub.textContent = p.artist;
      const link = p.wikiUrl || p.museumUrl;
      if (link) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
          if (e.target === del || e.target.closest('.gi-del')) return;
          window.open(link, '_blank', 'noopener,noreferrer');
        });
      }

      frame.appendChild(img); frame.appendChild(del);
      item.appendChild(wire); item.appendChild(frame); item.appendChild(lbl); item.appendChild(sub);
      grid.appendChild(item);
    });
  }

  updateBadge();
  initialLoad();

})();

// app.js — 名画収集館 v6
(function () {
  'use strict';

  const dw      = document.getElementById('dw');
  const abt     = document.getElementById('abt');
  const abs     = document.getElementById('abs');
  const bh      = document.getElementById('bh');
  const bdg     = document.getElementById('bdg');
  const toastEl = document.getElementById('toast');

  let allPaintings = [];
  let queue = [];
  let cursor = 0;
  let liked  = [];
  let filter = { century: 'all', style: 'all', artist: 'all' };
  let centuries = [], styles = [], artists = [];
  let curCard = null, nextCard = null, prevCard = null;
  let isAnimating = false;

  try { liked = JSON.parse(localStorage.getItem('meiga_liked') || '[]'); } catch(e) { liked = []; }

  // 旧データのマイグレーション（artistの "(French" 等を除去、museumUrlがないものを補完）
  liked = liked.map(p => {
    if (p.artist && p.artist.includes('(')) {
      p.artist = p.artist.replace(/\s*\([^)]*\)/g, '').split(',')[0].trim();
    }
    if (!p.museumUrl) {
      if (p.id && p.id.startsWith('met-')) {
        const metId = p.id.replace('met-', '');
        p.museumUrl = `https://www.metmuseum.org/art/collection/search/${metId}`;
      } else if (p.id && p.id.startsWith('artic-')) {
        const articId = p.id.replace('artic-', '');
        p.museumUrl = `https://www.artic.edu/artworks/${articId}`;
      }
    }
    return p;
  });
  try { localStorage.setItem('meiga_liked', JSON.stringify(liked)); } catch(e) {}
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

  // ── 使い方ガイド ────────────────────────────────────────────
  const guide        = document.getElementById('guide');
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

  const skipGuide = (() => {
    try { return localStorage.getItem('meiga_guide_skip') === '1'; } catch(e) { return false; }
  })();
  if (skipGuide) {
    hideGuide();
  } else {
    setTimeout(() => {
      guide.style.transition = 'none';
      showGuide();
      void guide.offsetWidth;
      guide.style.transition = '';
    }, 0);
  }

  // ── 今日の一枚 ────────────────────────────────────────────
  // buildQueue() は内部で cursor=0 にリセットしてしまうため、
  // 今日の一枚は cursor を先に確定してから直接デッキを組む
  document.getElementById('btn-today').addEventListener('click', () => {
    if (!allPaintings.length) return;
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const target = allPaintings[seed % allPaintings.length];
    filter = { century: 'all', style: 'all', artist: 'all' };
    queue = [...allPaintings];
    const idx = queue.findIndex(p => p.id === target.id);
    cursor = idx >= 0 ? idx : 0;
    _renderDeckAt(cursor);
    const btn = document.getElementById('btn-today');
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 1200);
  });

  // ── ホーム画面追加バナー ────────────────────────────────────
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!isStandalone && !localStorage.getItem('meiga_a2hs_dismissed')) {
    const a2hsBanner = document.getElementById('a2hs-banner');
    if (a2hsBanner) {
      // 1秒後に下からスライドイン
      setTimeout(() => {
        a2hsBanner.classList.add('show');
        // 6秒後に自動フェードアウト
        setTimeout(() => {
          a2hsBanner.classList.remove('show');
          setTimeout(() => {
            a2hsBanner.style.display = 'none';
            localStorage.setItem('meiga_a2hs_dismissed', '1');
          }, 400);
        }, 6000);
      }, 1000);
      document.getElementById('a2hs-close').addEventListener('click', () => {
        a2hsBanner.classList.remove('show');
        setTimeout(() => {
          a2hsBanner.style.display = 'none';
          localStorage.setItem('meiga_a2hs_dismissed', '1');
        }, 400);
      });
    }
  }

  // ── フィルター選択肢の構築 ──────────────────────────────────
  function updateFilterOptions() {
    centuries = [...new Set(allPaintings.map(p => p.century))].filter(Boolean).sort((a, b) => {
      const order = ['14世紀以前','15世紀','16世紀','17世紀','18世紀','19世紀','20世紀','不明'];
      return order.indexOf(a) - order.indexOf(b);
    });
    styles = [...new Set(allPaintings.map(p => p.style))]
      .filter(s => s && s !== '絵画' && s !== 'Paintings' && s !== 'Oil on canvas' && s.length < 25)
      .sort();
    // 画家ごとの作品数をカウントして上位20人に絞る（英語名除外）
    const artistCount = {};
    allPaintings.forEach(p => {
      if (!p.artist) return;
      if (p.artist === p.artist.replace(/[\u0080-\uFFFF]/g, '')) return; // 英語のみ除外
      artistCount[p.artist] = (artistCount[p.artist] || 0) + 1;
    });
    artists = Object.entries(artistCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name)
      .sort();
  }

  // ── famous100取得 ─────────────────────────────────────────
  // famous100.json のフィールド: id, title, artist, year, century,
  //   theme（テーマ）, museum, museumUrl, wikiUrl, image, isFamous
  // style フィールドは存在しないので theme を style にマップする
  async function fetchFamous() {
    try {
      const res = await fetch('/api/famous');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.paintings || []).map(p => ({
        ...p,
        style: p.theme || '名画100選',
      }));
    } catch(e) {
      console.warn('famous100 load failed:', e);
      return [];
    }
  }

  // ── API取得（リトライ付き）──────────────────────────────────
  async function fetchPaintings() {
    const MAX_RETRY = 3;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      const controller = new AbortController();
      const timeoutMs = attempt === 1 ? 14000 : 20000;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
        console.error(`API fetch error (attempt ${attempt}/${MAX_RETRY}):`, e);
        if (attempt < MAX_RETRY) {
          const loadingCard = document.getElementById('loading-card');
          if (loadingCard) {
            const msg = loadingCard.querySelector('div > div:last-child');
            if (msg) msg.textContent = `接続中... (${attempt + 1}/${MAX_RETRY})`;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    return false;
  }

  // ── 起動 ────────────────────────────────────────────────────
  async function initialLoad() {
    showLoadingCard();
    const [famousResult, apiOk] = await Promise.all([fetchFamous(), fetchPaintings()]);

    if (famousResult.length > 0) {
      const existingIds = new Set(allPaintings.map(p => p.id));
      const newFamous = famousResult.filter(p => !existingIds.has(p.id));
      allPaintings = [...newFamous, ...allPaintings];
      updateFilterOptions();
    }

    removeLoadingCard();
    if (allPaintings.length === 0) {
      const errCard = document.createElement('div');
      errCard.className = 'card cur';
      errCard.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ink-m);padding:24px;text-align:center;">
        <div style="font-size:13px;font-style:italic;">読み込みに失敗しました</div>
        <button id="retry-btn" style="padding:9px 22px;border:1px solid var(--gold);background:transparent;cursor:pointer;font-family:inherit;font-size:11px;color:var(--gold);letter-spacing:.1em;">再読み込み</button>
        </div>`;
      dw.appendChild(errCard);
      document.getElementById('retry-btn').addEventListener('click', () => {
        errCard.remove();
        initialLoad();
      });
      return;
    }
    buildQueue();
    renderDeck();
  }

  function showLoadingCard() {
    const c = document.createElement('div');
    c.className = 'card cur';
    c.id = 'loading-card';
    c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--ink-l);">
      <div class="ph-spinner"></div>
      <div style="font-size:10px;letter-spacing:.2em;font-style:italic;">名画を集めています</div>
      </div>`;
    dw.appendChild(c);
  }
  function removeLoadingCard() {
    const c = document.getElementById('loading-card');
    if (c) c.remove();
  }

  // ── キュー構築 ──────────────────────────────────────────────
  function buildQueue() {
    const filtered = allPaintings.filter(p => {
      if (filter.century !== 'all' && p.century !== filter.century) return false;
      if (filter.style   !== 'all' && p.style   !== filter.style)   return false;
      if (filter.artist  !== 'all' && p.artist  !== filter.artist)  return false;
      return true;
    });
    if (!filtered.length) { showToast('該当する作品がありません'); return false; }
    if (filter.century === 'all' && filter.style === 'all') {
      queue = [...filtered];
    } else {
      queue = [...filtered].sort(() => Math.random() - .5);
    }
    cursor = 0;
    return true;
  }

  // ── デッキ描画（renderDeckはbuildQueueを呼ぶ通常フロー用）──
  function renderDeck() {
    dw.querySelectorAll('.card').forEach(c => c.remove());
    curCard = prevCard = nextCard = null;
    isAnimating = false;
    if (!buildQueue()) return;
    _renderDeckAt(cursor);
  }

  // cursor が決まった状態でカードを組み立てる内部関数
  // 今日の一枚など、cursor を外から指定したいケースで使う
  function _renderDeckAt(cur) {
    dw.querySelectorAll('.card').forEach(c => c.remove());
    curCard = prevCard = nextCard = null;
    isAnimating = false;
    cursor = cur;
    curCard = makeCard(queue[cursor], cursor);
    curCard.classList.add('cur');
    dw.appendChild(curCard);
    if (cursor + 1 < queue.length) {
      nextCard = makeCard(queue[cursor + 1], cursor + 1);
      nextCard.style.cssText = 'transform:translateY(110%);opacity:0;transition:none;';
      dw.appendChild(nextCard);
    }
    if (cursor - 1 >= 0) {
      prevCard = makeCard(queue[cursor - 1], cursor - 1);
      prevCard.style.cssText = 'transform:translateY(-110%);opacity:0;transition:none;';
      dw.insertBefore(prevCard, curCard);
    }
    updateMeta();
    updateNavButtons();
    updateFilterFooter();
  }

  function makeCard(p, idx) {
    if (!p) return null;
    const card = document.createElement('div');
    card.className = 'card';
    card._p = p;
    const num = document.createElement('div');
    num.className = 'card-num';
    num.textContent = `${idx + 1} / ${queue.length}`;
    const stag = document.createElement('div');
    stag.className = 'style-tag';
    stag.textContent = p.century;
    const nail = document.createElement('div');
    nail.className = 'nail';
    const wire = document.createElement('div');
    wire.className = 'wire';
    const fw = document.createElement('div');
    fw.className = 'frame-wrap';
    const ph = document.createElement('div');
    ph.className = 'painting-placeholder';
    ph.innerHTML = `<div class="ph-spinner"></div><div class="ph-title">${p.title}</div>`;
    fw.appendChild(ph);
    const img = document.createElement('img');
    img.className = 'painting-img';
    img.alt = p.title;
    img.decoding = 'async';
    img.onload = () => { img.classList.add('loaded'); ph.style.display = 'none'; };
    img.onerror = () => { ph.innerHTML = `<div class="ph-title" style="opacity:.5">${p.title}</div>`; };
    img.src = p.image;
    img.style.cursor = 'zoom-in';
    // ★ 画像クリックのみでライトボックスを開く（ab への重複追加は行わない）
    img.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(p); });
    fw.appendChild(img);
    // 拡大ヒントはshowZoomHint()で別途管理（先読み生成でカウントが進まないよう分離）
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

  function updateMeta() {
    const p = queue[cursor];
    if (!p) return;
    abt.textContent = p.title;
    // famousはwikiUrl優先（日本語で軽い）、MET/ARTICはmuseumUrl優先
    const link = p.isFamous
      ? (p.wikiUrl || p.museumUrl || null)
      : (p.museumUrl || p.wikiUrl || null);
    const linkIcon = document.getElementById('ab-link-icon');
    if (link) {
      abt.style.cursor = 'pointer';
      abt.title = '詳細を見る';
      abt.onclick = () => window.open(link, '_blank', 'noopener,noreferrer');
      abt.classList.add('abt-link');
      if (linkIcon) linkIcon.style.display = 'block';
    } else {
      abt.style.cursor = 'default';
      abt.onclick = null;
      abt.classList.remove('abt-link');
      if (linkIcon) linkIcon.style.display = 'none';
    }
    abs.textContent = `${p.artist} · ${p.year || '年代不明'} · ${p.museum}`;
    bh.classList.toggle('lk', liked.some(x => x.id === p.id));
    const fill = document.getElementById('progress-fill');
    if (fill && queue.length > 1) {
      fill.style.width = `${(cursor / (queue.length - 1)) * 100}%`;
    } else if (fill) {
      fill.style.width = '100%';
    }
  }
  function updateNavButtons() {}

  // 拡大ヒント: アプリ起動後の最初の3枚に表示（セッション中のみカウント、毎回リセット）
  let _zoomSessionCount = 0;
  let _zoomShownForCursor = -1;
  function showZoomHint() {
    if (_zoomSessionCount >= 3) return;
    if (_zoomShownForCursor === cursor) return;
    _zoomShownForCursor = cursor;
    // 現在のcurCardにhintを追加
    if (!curCard) return;
    const fw = curCard.querySelector('.frame-wrap');
    if (!fw) return;
    const existing = fw.querySelector('.zoom-hint');
    if (existing) return;
    const hint = document.createElement('div');
    hint.className = 'zoom-hint';
    hint.textContent = 'タップで拡大';
    hint.style.cssText = 'opacity:0;';
    fw.appendChild(hint);
    requestAnimationFrame(() => {
      hint.style.transition = 'opacity .4s ease';
      hint.style.opacity = '1';
      setTimeout(() => {
        hint.style.transition = 'opacity .8s ease';
        hint.style.opacity = '0';
        setTimeout(() => { hint.remove(); }, 800);
      }, 2200);
    });
    _zoomSessionCount++;
  }

  // ── スワイプ ────────────────────────────────────────────────
  // ★ startX も追跡して横移動が多い場合はキャンセル（ピンチ誤検知防止）
  // ★ ライトボックスが開いている場合はスワイプ無効
  let isDrag = false, startX = 0, startY = 0, diffY = 0, startTime = 0;
  const THRESH = 40, RESIST = 0.35;

  dw.addEventListener('mousedown', e => {
    e.preventDefault();
    onStart(e.clientX, e.clientY);
  });
  dw.addEventListener('touchstart', e => {
    if (document.getElementById('lightbox').classList.contains('open')) return;
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('mousemove', e => { if (isDrag) onMove(e.clientX, e.clientY); });
  window.addEventListener('touchmove', e => {
    if (isDrag) { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
  window.addEventListener('touchcancel', onEnd);

  function onStart(x, y) {
    if (!curCard || isAnimating) return;
    isDrag = true;
    startX = x; startY = y; diffY = 0;
    startTime = Date.now();
    curCard.style.transition = 'none';
    curCard.style.transform = 'translateY(0)';
  }
  function onMove(x, y) {
    if (!isDrag || !curCard) return;
    const dX = x - startX;
    diffY = y - startY;
    // 横移動が縦移動より大きければスワイプではない（ピンチ操作など）
    if (Math.abs(dX) > Math.abs(diffY) + 8) {
      isDrag = false;
      snapBack();
      return;
    }
    curCard.style.transform = `translateY(${diffY * RESIST}px)`;
    if (diffY < 0 && nextCard) {
      const prog = Math.min(Math.abs(diffY) / (THRESH * 1.8), 1);
      nextCard.style.transition = 'none';
      nextCard.style.transform = `translateY(${(1 - prog) * 110}%)`;
      nextCard.style.opacity = String(Math.min(prog * 1.1, 0.98));
    } else if (diffY > 0 && prevCard) {
      const prog = Math.min(diffY / (THRESH * 1.8), 1);
      prevCard.style.transition = 'none';
      prevCard.style.transform = `translateY(${-(1 - prog) * 110}%)`;
      prevCard.style.opacity = String(Math.min(prog * 1.1, 0.98));
    }
  }
  function onEnd() {
    if (!isDrag) return;
    isDrag = false;
    if (!curCard) return;
    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = Math.abs(diffY) / elapsed;
    if      (diffY < -THRESH || (diffY < -20 && velocity > 0.5)) goNext();
    else if (diffY >  THRESH || (diffY >  20 && velocity > 0.5)) goPrev();
    else { isAnimating = true; snapBack(); }
  }
  function snapBack() {
    if (!curCard) return;
    curCard.style.transition = 'transform 0.3s cubic-bezier(.34,1.4,.64,1)';
    curCard.style.transform = 'translateY(0)';
    curCard.style.opacity = '1';
    if (nextCard) {
      nextCard.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
      nextCard.style.transform = 'translateY(110%)';
      nextCard.style.opacity = '0';
    }
    if (prevCard) {
      prevCard.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
      prevCard.style.transform = 'translateY(-110%)';
      prevCard.style.opacity = '0';
    }
    setTimeout(() => { isAnimating = false; }, 320);
  }

  // ★ DUR を 0.52s → 0.46s に短縮し、isAnimating 解除を DUR より長い 520ms に設定
  // （アニメ完了前に次操作が入って状態が壊れるのを防ぐ）
  const DUR = '0.46s', EASE = 'cubic-bezier(.16,1,.3,1)';

  function goNext() {
    if (!curCard || isAnimating) return;
    if (cursor >= queue.length - 1) {
      showToast('すべての作品を見ました。最初に戻ります。');
      setTimeout(() => { cursor = -1; goNext(); }, 600);
      return;
    }
    isAnimating = true;
    if (prevCard) { prevCard.remove(); prevCard = null; }

    curCard.style.transition = `transform ${DUR} ${EASE}, opacity 0.22s ease`;
    curCard.style.transform = 'translateY(-110%)';
    curCard.style.opacity = '0';
    prevCard = curCard;

    cursor++;
    // nextCard が既に生成済みの場合はそれを使う、なければ作る
    if (nextCard) {
      curCard = nextCard;
    } else {
      curCard = makeCard(queue[cursor], cursor);
      curCard.style.cssText = 'transform:translateY(110%);opacity:0;transition:none;';
      dw.appendChild(curCard);
    }
    curCard.style.transition = `transform ${DUR} ${EASE}`;
    curCard.classList.add('cur');
    curCard.style.transform = 'translateY(0)';
    curCard.style.opacity = '1';

    if (cursor + 1 < queue.length) {
      nextCard = makeCard(queue[cursor + 1], cursor + 1);
      nextCard.style.cssText = 'transform:translateY(110%);opacity:0;transition:none;';
      dw.appendChild(nextCard);
    } else {
      nextCard = null;
    }
    updateMeta(); updateNavButtons(); showZoomHint();
    setTimeout(() => { isAnimating = false; }, 520);
  }

  function goPrev() {
    if (!curCard || isAnimating) return;
    if (cursor <= 0) { showToast('最初の作品です'); snapBack(); return; }
    isAnimating = true;
    if (nextCard) { nextCard.remove(); nextCard = null; }

    curCard.style.transition = `transform ${DUR} ${EASE}, opacity 0.22s ease`;
    curCard.style.transform = 'translateY(110%)';
    curCard.style.opacity = '0';
    nextCard = curCard;

    cursor--;
    if (prevCard) {
      curCard = prevCard;
    } else {
      curCard = makeCard(queue[cursor], cursor);
      curCard.style.cssText = 'transform:translateY(-110%);opacity:0;transition:none;';
      dw.insertBefore(curCard, nextCard);
    }
    curCard.style.transition = `transform ${DUR} ${EASE}`;
    curCard.classList.add('cur');
    curCard.style.transform = 'translateY(0)';
    curCard.style.opacity = '1';

    if (cursor - 1 >= 0) {
      prevCard = makeCard(queue[cursor - 1], cursor - 1);
      prevCard.style.cssText = 'transform:translateY(-110%);opacity:0;transition:none;';
      dw.insertBefore(prevCard, curCard);
    } else {
      prevCard = null;
    }
    updateMeta(); updateNavButtons(); showZoomHint();
    setTimeout(() => { isAnimating = false; }, 520);
  }

  // ── キーボード・ホイール ────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    if (e.key === 'Escape') {
      document.getElementById('fd').classList.remove('open');
      document.getElementById('gp').classList.remove('open');
      hideGuide();
    }
  });

  let wheelThrottle = false;
  dw.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelThrottle) return;
    if (Math.abs(e.deltaY) < 5) return;
    wheelThrottle = true;
    if (e.deltaY > 0) goNext(); else goPrev();
    setTimeout(() => { wheelThrottle = false; }, 1200);
  }, { passive: false });

  // ── ハート ──────────────────────────────────────────────────
  bh.addEventListener('click', () => {
    const p = queue[cursor];
    if (!p) return;
    const idx = liked.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      liked.splice(idx, 1);
      bh.classList.remove('lk');
      showToast('ギャラリーから外しました');
    } else {
      liked.push(p);
      bh.classList.add('lk');
      bh.classList.remove('bt');
      void bh.offsetWidth;
      bh.classList.add('bt');
      showToast('ギャラリーに追加しました ♡');
    }
    save(); updateBadge();
  });

  // ── シェア ──────────────────────────────────────────────────
  document.getElementById('btn-share').addEventListener('click', () => {
    const p = queue[cursor];
    if (!p) return;
    const url = 'https://meiga.vercel.app/';
    const t = `「${p.title}」\n${p.artist}（${p.year || ''}）\n${p.museum}\n\n名画の世界を旅するアプリ「名画収集館」\n${url}\n\n#名画収集館 #名画 #art #masterpiece`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank', 'noopener,noreferrer');
  });

  // ── フィルタードロワー ──────────────────────────────────────
  const fd = document.getElementById('fd');
  document.getElementById('btn-filter').addEventListener('click', () => { fd.classList.add('open'); buildTodayCard(); buildFilterUI(); });
  document.getElementById('fdb').addEventListener('click', () => fd.classList.remove('open'));
  document.getElementById('fdb2').addEventListener('click', () => fd.classList.remove('open'));
  document.getElementById('fd-reset-btn').addEventListener('click', () => {
    filter = { century: 'all', style: 'all', artist: 'all' };
    renderDeck();
    fd.classList.remove('open');
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
    if (rst) rst.disabled = filter.century === 'all' && filter.style === 'all';
  }

  const sectionState = { century: true, style: false, artist: false };
  function buildFilterUI() {
    updateFilterFooter();
    const body = document.getElementById('fdbody');
    body.innerHTML = '';
    function sec(label, key, vals, emoji) {
      if (!vals || vals.length === 0) return;
      const s = document.createElement('div');
      s.className = 'fds';
      const hdr = document.createElement('div');
      hdr.className = 'fds-header' + (sectionState[key] ? ' open' : '');
      const lbl = document.createElement('div');
      lbl.className = 'fdl';
      const currentVal = filter[key] === 'all' ? 'すべて' : filter[key];
      lbl.innerHTML = `${emoji ? emoji + '&nbsp;' : ''}${label} <span class="fdl-count">${currentVal}</span>`;
      const arrow = document.createElement('div');
      arrow.className = 'fds-arrow';
      arrow.textContent = '▾';
      hdr.appendChild(lbl); hdr.appendChild(arrow);
      const bdy = document.createElement('div');
      bdy.className = 'fds-body' + (sectionState[key] ? ' open' : '');
      const pw = document.createElement('div');
      pw.className = 'pw';
      const allBtn = document.createElement('button');
      allBtn.className = 'pill' + (filter[key] === 'all' ? ' on' : '');
      allBtn.textContent = 'すべて';
      allBtn.onclick = () => { filter[key] = 'all'; renderDeck(); updateFilterFooter(); buildFilterUI(); };
      pw.appendChild(allBtn);
      vals.forEach(v => {
        const pill = document.createElement('button');
        pill.className = 'pill' + (filter[key] === v ? ' on' : '');
        pill.textContent = v;
        pill.onclick = () => { filter[key] = v; renderDeck(); fd.classList.remove('open'); };
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
    sec('画家', 'artist', artists, '🖌');
  }

  // ── ギャラリー ──────────────────────────────────────────────
  const gp = document.getElementById('gp');
  document.getElementById('btn-gal').addEventListener('click', () => { gp.classList.add('open'); renderGallery(); });
  document.getElementById('gpc').addEventListener('click', () => gp.classList.remove('open'));

  function renderGallery() {
    const grid  = document.getElementById('gg');
    const empty = document.getElementById('ge');
    grid.innerHTML = '';
    if (!liked.length) { empty.style.display = 'block'; grid.style.display = 'none'; return; }
    empty.style.display = 'none'; grid.style.display = 'grid';
    liked.forEach((p, i) => {
      const item  = document.createElement('div'); item.className = 'gi'; item.style.animationDelay = `${i * 0.04}s`;
      const wire  = document.createElement('div'); wire.className = 'giwire';
      const frame = document.createElement('div'); frame.className = 'gif';
      const inner = document.createElement('div'); inner.className = 'gif-inner';
      const img   = document.createElement('img'); img.alt = p.title; img.loading = 'lazy'; img.src = p.image;
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const ph2 = document.createElement('div');
        ph2.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--ink-l);padding:4px;text-align:center;font-style:italic;background:var(--parchment);';
        ph2.textContent = p.title; inner.appendChild(ph2);
      });
      inner.appendChild(img);
      const del = document.createElement('button'); del.className = 'gi-del'; del.innerHTML = '×'; del.title = '削除';
      del.onclick = e => {
        e.stopPropagation();
        const idx = liked.findIndex(x => x.id === p.id);
        if (idx >= 0) { liked.splice(idx, 1); save(); updateBadge(); }
        item.style.cssText = 'transform:scale(0);opacity:0;transition:all 0.2s ease';
        setTimeout(() => { item.remove(); if (liked.length === 0) renderGallery(); }, 200);
        if (queue[cursor] && queue[cursor].id === p.id) bh.classList.remove('lk');
      };
      const lbl = document.createElement('div'); lbl.className = 'gilbl'; lbl.textContent = p.title;
      const sub = document.createElement('div'); sub.className = 'gilsub'; sub.textContent = p.artist;
      // タップで拡大表示（外部リンクはライトボックス内の詳細リンクへ）
      item.style.cursor = 'zoom-in';
      item.addEventListener('click', (e) => {
        if (e.target === del || e.target.closest('.gi-del')) return;
        openLightbox(p, { fromGallery: true });
      });
      frame.appendChild(inner); frame.appendChild(del);
      item.appendChild(wire); item.appendChild(frame); item.appendChild(lbl); item.appendChild(sub);
      grid.appendChild(item);
    });
  }

  // ── ライトボックス（絵の拡大表示）──────────────────────────
  // fromGallery: true のとき額縁なし・ピンチズーム無効
  function openLightbox(p, opts) {
    const lb      = document.getElementById('lightbox');
    const lbImg   = document.getElementById('lb-img');
    const lbTitle = document.getElementById('lb-title');
    const lbSub   = document.getElementById('lb-sub');
    const lbLink  = document.getElementById('lb-link');
    if (!lb) return;
    const fromGallery = opts && opts.fromGallery;
    // gallery-modeクラス制御（額縁表示/非表示）
    lb.classList.toggle('gallery-mode', fromGallery);
    lbImg.src = '';
    const bigUrl = p.image
      .replace('/web-large/', '/original/')
      .replace('/full/843,/', '/full/1200,/');
    lbImg.src = bigUrl;
    lbImg.onerror = () => { lbImg.src = p.image; };
    lbTitle.textContent = p.title;
    lbSub.textContent = `${p.artist} · ${p.year || '年代不明'} · ${p.museum}`;
    // 詳細リンク: famousはwikiUrl優先、それ以外はmuseumUrl優先
    const link = p.isFamous
      ? (p.wikiUrl || p.museumUrl || null)
      : (p.museumUrl || p.wikiUrl || null);
    if (link && lbLink) {
      lbLink.href = link;
      lbLink.style.display = 'inline-block';
    } else if (lbLink) {
      lbLink.style.display = 'none';
    }
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.id === 'lb-close') closeLightbox();
  });
  // Escape: ライトボックス → ドロワー → ガイド の順に閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) { closeLightbox(); return; }
    document.getElementById('fd').classList.remove('open');
    document.getElementById('gp').classList.remove('open');
    hideGuide();
  }, true);

  // ── 今日の一枚カード（フィルタードロワー内）────────────────
  function buildTodayCard() {
    if (!allPaintings.length) return;
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const p = allPaintings[seed % allPaintings.length];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    const elDate   = document.getElementById('fd-today-date');
    const elTitle  = document.getElementById('fd-today-title');
    const elArtist = document.getElementById('fd-today-artist');
    if (elDate)   elDate.textContent   = dateStr;
    if (elTitle)  elTitle.textContent  = p.title;
    if (elArtist) elArtist.textContent = `${p.artist}（${p.year || '年代不明'}）`;
    const btn = document.getElementById('fd-today-btn');
    if (btn) {
      btn.onclick = () => {
        fd.classList.remove('open');
        document.getElementById('btn-today').click();
      };
    }
  }

  // ── Copyright年を動的にセット ──────────────────────────────
  const copyYearEl = document.getElementById('copy-year');
  if (copyYearEl) copyYearEl.textContent = new Date().getFullYear();

  updateBadge();
  initialLoad();
})();

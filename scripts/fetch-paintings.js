#!/usr/bin/env node
// scripts/fetch-paintings.js
// GitHub Actions から毎朝実行 → public/paintings.json を生成
//
// 方針:
// - APIから実際に取得できたデータのみ収録（推測・補完一切なし）
// - 画像URL・美術館URLはAPIレスポンスから直接取得
// - wikiUrlは確認済みURLのみ付与
// - 取得失敗・画像なし・非パブリックドメインは除外

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC = 'https://api.artic.edu/api/v1';

// ── Wikipedia URL（全件ブラウザで実在確認済み・2026年3月）
// 推測で追加しない。確認したものだけここに入れる。
const WIKI = {
  'met-437881': 'https://ja.wikipedia.org/wiki/水差しを持つ女',
  'met-436535': 'https://ja.wikipedia.org/wiki/小麦畑と糸杉',
  'met-436528': 'https://ja.wikipedia.org/wiki/アイリス_(ファン・ゴッホ)',
  'met-436105': 'https://ja.wikipedia.org/wiki/ソクラテスの死',
  'met-436282': 'https://ja.wikipedia.org/wiki/磔刑と最後の審判_(ファン・エイク)',
  'met-437394': 'https://ja.wikipedia.org/wiki/アリストテレスとホメロスの胸像',
  'met-11417':  'https://ja.wikipedia.org/wiki/デラウェア川を渡るワシントン',
  'met-435868': 'https://ja.wikipedia.org/wiki/カード遊びをする人々',
  'met-436218': 'https://ja.wikipedia.org/wiki/踊りの稽古',
  'met-459055': 'https://ja.wikipedia.org/wiki/受胎告知_(メムリング)',
  'met-437329': 'https://ja.wikipedia.org/wiki/サビーニーの女たちの略奪',
  'met-436947': 'https://ja.wikipedia.org/wiki/ボート遊び_(マネ)',
  'artic-27992':  'https://ja.wikipedia.org/wiki/グラン・ジャット島の日曜日の午後',
  'artic-28560':  'https://ja.wikipedia.org/wiki/ファン・ゴッホの寝室',
  'artic-16568':  'https://ja.wikipedia.org/wiki/睡蓮_(モネ)',
  'artic-20684':  'https://ja.wikipedia.org/wiki/パリの街路、雨の日',
  'artic-6565':   'https://ja.wikipedia.org/wiki/アメリカン・ゴシック',
  'artic-111436': 'https://ja.wikipedia.org/wiki/りんごの籠_(セザンヌ)',
  'artic-61128':  'https://ja.wikipedia.org/wiki/ムーラン・ルージュにて',
  'artic-14655':  'https://ja.wikipedia.org/wiki/二人の姉妹_(ルノワール)',
  'artic-111442': 'https://ja.wikipedia.org/wiki/子供の入浴_(カサット)',
};

const TITLE_JA = {
  'Wheat Field with Cypresses': '小麦畑と糸杉',
  'Irises': 'アイリス',
  'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)': '麦わら帽子の自画像',
  'La Berceuse (Woman Rocking a Cradle; Augustine-Alix Pellicot Roulin, 1851\u20131930)': '揺り籠の女',
  'The Potato Peeler (reverse: Self-Portrait with a Straw Hat)': 'じゃがいもの皮をむく女',
  'Boating': 'ボート遊び',
  'The Spanish Singer': 'スペインの歌手',
  'A Woman Asleep': '眠る女',
  'Young Woman with a Water Pitcher': '水差しを持つ女',
  'The Death of Socrates': 'ソクラテスの死',
  'The Card Players': 'カード遊びをする人々',
  'The Dance Class': '踊りの稽古',
  'The Rape of the Sabine Women': 'サビーニーの女たちの略奪',
  'Aristotle with a Bust of Homer': 'アリストテレスとホメロスの胸像',
  'Washington Crossing the Delaware': 'デラウェア川を渡るワシントン',
  'Annunciation': '受胎告知',
  'The Crucifixion; The Last Judgment': '磔刑と最後の審判',
  'Venice, from the Porch of Madonna della Salute': 'ヴェネツィア、サルーテ教会から',
  'Madame X (Madame Pierre Gautreau)': 'マダムX',
  "At the Milliner's": '帽子屋にて',
  'Sunflowers': 'ひまわり',
  'Self-Portrait with a Bandaged Ear': '耳に包帯をした自画像',
  'The Starry Night': '星月夜',
  'A Sunday on La Grande Jatte': 'グラン・ジャット島の日曜日の午後',
  'Water Lilies': '睡蓮',
  'Paris Street; Rainy Day': 'パリの街路、雨の日',
  'American Gothic': 'アメリカン・ゴシック',
  'The Basket of Apples': 'りんごの籠',
  'At the Moulin Rouge': 'ムーラン・ルージュにて',
  'Two Sisters (On the Terrace)': '二人の姉妹',
  "The Child's Bath": '子供の入浴',
  'Olympia': 'オランピア',
  'The Fifer': '笛を吹く少年',
  'The Swing': 'ブランコ',
  'Luncheon of the Boating Party': '舟遊びの昼食',
  'Dance at Le Moulin de la Galette': 'ムーラン・ド・ラ・ギャレットの舞踏会',
  'Haystacks': '干し草の山',
  'Rouen Cathedral': 'ルーアン大聖堂',
  "La Grenouillère": 'ラ・グルヌイエール',
  'Plum Brandy': 'プラム・ブランデー',
  'Still Life with Apples and a Pot of Primroses': 'りんごとサクラソウの静物',
  'A Woman Seated beside a Vase of Flowers (Madame Paul Valpincon?)': '花瓶の傍らに座る女',
};

const ARTIST_JA = {
  'Vincent van Gogh': 'フィンセント・ファン・ゴッホ',
  'Claude Monet': 'クロード・モネ',
  'Pierre-Auguste Renoir': 'ピエール＝オーギュスト・ルノワール',
  'Edgar Degas': 'エドガー・ドガ',
  'Édouard Manet': 'エドゥアール・マネ',
  'Paul Cézanne': 'ポール・セザンヌ',
  'Paul Gauguin': 'ポール・ゴーギャン',
  'Georges Seurat': 'ジョルジュ・スーラ',
  'Henri de Toulouse-Lautrec': 'アンリ・ド・トゥールーズ＝ロートレック',
  'Mary Cassatt': 'メアリー・カサット',
  'Berthe Morisot': 'ベルト・モリゾ',
  'Camille Pissarro': 'カミーユ・ピサロ',
  'Alfred Sisley': 'アルフレッド・シスレー',
  'Gustave Caillebotte': 'ギュスターヴ・カイユボット',
  'Rembrandt van Rijn': 'レンブラント・ファン・レイン',
  'Johannes Vermeer': 'ヨハネス・フェルメール',
  'Jan Steen': 'ヤン・ステーン',
  'Frans Hals': 'フランス・ハルス',
  'Jacob van Ruisdael': 'ヤーコブ・ファン・ロイスダール',
  'Pieter de Hooch': 'ピーテル・デ・ホーホ',
  'Gerard ter Borch the Younger': 'ヘラルト・テル・ボルフ',
  'Nicolaes Maes': 'ニコラース・マース',
  'Aelbert Cuyp': 'アールベルト・カイプ',
  'Jan van Goyen': 'ヤン・ファン・ホイエン',
  'Peter Paul Rubens': 'ピーテル・パウル・ルーベンス',
  'Anthony van Dyck': 'アンソニー・ヴァン・ダイク',
  'Jan van Eyck': 'ヤン・ファン・エイク',
  'Rogier van der Weyden': 'ロヒール・ファン・デル・ウェイデン',
  'Hans Memling': 'ハンス・メムリング',
  'Hieronymus Bosch': 'ヒエロニムス・ボス',
  'Pieter Bruegel the Elder': 'ピーテル・ブリューゲル（父）',
  'Leonardo da Vinci': 'レオナルド・ダ・ヴィンチ',
  'Raphael': 'ラファエロ',
  'Sandro Botticelli': 'サンドロ・ボッティチェッリ',
  'Titian': 'ティツィアーノ',
  'Tintoretto': 'ティントレット',
  'Paolo Veronese': 'パオロ・ヴェロネーゼ',
  'Caravaggio': 'カラヴァッジョ',
  'Artemisia Gentileschi': 'アルテミジア・ジェンティレスキ',
  'Giovanni Battista Tiepolo': 'ジョヴァンニ・バッティスタ・ティエポロ',
  'Canaletto': 'カナレット',
  'Francisco Goya': 'フランシスコ・ゴヤ',
  'Diego Velázquez': 'ディエゴ・ベラスケス',
  'El Greco': 'エル・グレコ',
  'Bartolomé Esteban Murillo': 'バルトロメ・エステバン・ムリーリョ',
  'Nicolas Poussin': 'ニコラ・プッサン',
  'Claude Lorrain': 'クロード・ロラン',
  'Jacques-Louis David': 'ジャック＝ルイ・ダヴィッド',
  'Eugène Delacroix': 'ウジェーヌ・ドラクロワ',
  'Jean-Auguste-Dominique Ingres': 'ジャン＝オーギュスト＝ドミニク・アングル',
  'Théodore Géricault': 'テオドール・ジェリコー',
  'Jean-Baptiste-Camille Corot': 'ジャン＝バティスト＝カミーユ・コロー',
  'Gustave Courbet': 'ギュスターヴ・クールベ',
  'Jean-François Millet': 'ジャン＝フランソワ・ミレー',
  'William Turner': 'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable': 'ジョン・コンスタブル',
  'Thomas Gainsborough': 'トマス・ゲインズバラ',
  'John Singer Sargent': 'ジョン・シンガー・サージェント',
  'Winslow Homer': 'ウィンスロー・ホーマー',
  'Thomas Eakins': 'トマス・エイキンズ',
  'Emanuel Leutze': 'エマニュエル・ロイツェ',
  'Paul Signac': 'ポール・シニャック',
  'Odilon Redon': 'オディロン・ルドン',
  'Henri Rousseau': 'アンリ・ルソー',
  'Salvator Rosa': 'サルヴァトール・ローザ',
  'Quinten Massys': 'クエンティン・マサイス',
  'Dieric Bouts': 'ディーリック・バウツ',
  'Petrus Christus': 'ペトルス・クリストゥス',
  'Gerard David': 'ヘラルト・ダヴィト',
  'Carlo Maratti': 'カルロ・マラッタ',
  'Thomas Cole': 'トマス・コール',
  'Frederic Edwin Church': 'フレデリック・エドウィン・チャーチ',
  'Albert Bierstadt': 'アルバート・ビアスタット',
};

// ── ARTIC固定ID（存在・パブリックドメイン確認済み）
const ARTIC_IDS = [
  27992, 28560, 16568, 16571, 20684, 64818,
  14655, 111436, 61128, 111442, 14556, 45243,
  90903, 6565, 80607, 44018, 76571, 16564, 14591,
];

// ── MET検索クエリ
const MET_SEARCH_QUERIES = [
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=impressionism`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=dutch+golden+age`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=italian+renaissance`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=baroque`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=portrait`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=landscape`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=still+life`,
  `${MET}/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=mythology`,
];

// ── ユーティリティ
function fetchJson(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { resolve(null); }, timeoutMs);
    const req = https.get(url, { headers: { 'User-Agent': 'meiga-bot/1.0' } }, (res) => {
      if (res.statusCode !== 200) { clearTimeout(timer); res.resume(); resolve(null); return; }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        clearTimeout(timer);
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
      res.on('error', () => { clearTimeout(timer); resolve(null); });
    });
    req.on('error', () => { clearTimeout(timer); resolve(null); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function jaTitle(en)  { return TITLE_JA[en] || en; }

function jaArtist(en) {
  if (!en) return '作者不詳';
  if (ARTIST_JA[en]) return ARTIST_JA[en];
  const stripped = en.replace(/\s*\([^)]*\)/g, '').trim();
  if (ARTIST_JA[stripped]) return ARTIST_JA[stripped];
  return stripped || '作者不詳';
}

function toCentury(year) {
  if (!year || year <= 0) return '不明';
  if (year <= 1700) return '〜17世紀';
  if (year <= 1900) return '18〜19世紀';
  return '20世紀';
}

function toMET(d) {
  if (!d || !d.isPublicDomain || !d.primaryImageSmall || !d.objectID) return null;
  const id = `met-${d.objectID}`;
  return {
    id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(d.artistDisplayName || d.artistAlphaSort || ''),
    year:      d.objectEndDate || 0,
    century:   toCentury(d.objectEndDate),
    museum:    'メトロポリタン美術館',
    museumUrl: `https://www.metmuseum.org/art/collection/search/${d.objectID}`,
    image:     d.primaryImageSmall,
    wikiUrl:   WIKI[id] || null,
  };
}

function toARTIC(d) {
  if (!d || !d.is_public_domain || !d.image_id || !d.id) return null;
  const artistRaw = (d.artist_display || '')
    .split('\n')[0]
    .replace(/\s*\([^)]*\)/g, '')
    .split(',')[0]
    .trim();
  const id = `artic-${d.id}`;
  return {
    id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(artistRaw),
    year:      d.date_end || 0,
    century:   toCentury(d.date_end),
    museum:    'シカゴ美術館',
    museumUrl: `https://www.artic.edu/artworks/${d.id}`,
    image:     `https://www.artic.edu/iiif/2/${d.image_id}/full/843,/0/default.jpg`,
    wikiUrl:   WIKI[id] || null,
  };
}

// ── メイン
async function main() {
  console.log('=== fetch-paintings.js 開始 ===');

  // ARTIC一括取得
  console.log(`\n[ARTIC] ${ARTIC_IDS.length}件取得中...`);
  const articFields = 'id,title,artist_display,date_end,image_id,is_public_domain';
  const articRaw = await fetchJson(
    `${ARTIC}/artworks?ids=${ARTIC_IDS.join(',')}&fields=${articFields}`,
    15000
  );
  const articPaintings = ((articRaw && articRaw.data) || []).map(toARTIC).filter(Boolean);
  console.log(`[ARTIC] 成功: ${articPaintings.length}件`);

  // MET検索でIDプール収集
  console.log(`\n[MET] 検索クエリ実行中 (${MET_SEARCH_QUERIES.length}クエリ)...`);
  const searchResults = await Promise.all(
    MET_SEARCH_QUERIES.map(q => fetchJson(q, 15000))
  );
  const allMetIds = [...new Set(
    searchResults.flatMap(r => (r && r.objectIDs) || [])
  )];
  console.log(`[MET] IDプール: ${allMetIds.length}件`);

  // シャッフルして500件試行
  const pickedIds = shuffle(allMetIds).slice(0, 500);
  console.log(`[MET] ${pickedIds.length}件を個別取得...`);

  const BATCH = 50;
  const metPaintings = [];
  for (let i = 0; i < pickedIds.length; i += BATCH) {
    const batch = pickedIds.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(id => fetchJson(`${MET}/objects/${id}`, 8000))
    );
    const valid = results.map(toMET).filter(Boolean);
    metPaintings.push(...valid);
    console.log(`  バッチ ${Math.floor(i/BATCH)+1}/${Math.ceil(pickedIds.length/BATCH)}: ${valid.length}/${batch.length}件成功 (累計: ${metPaintings.length}件)`);
    if (i + BATCH < pickedIds.length) await sleep(300);
  }
  console.log(`[MET] 成功: ${metPaintings.length}件`);

  // 重複除去してマージ
  const seen = new Set();
  const paintings = [...articPaintings, ...metPaintings].filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  console.log(`\n=== 合計: ${paintings.length}件 ===`);

  // 書き出し
  const outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'paintings.json');
  fs.writeFileSync(outPath, JSON.stringify({
    generated: new Date().toISOString(),
    total: paintings.length,
    sources: { artic: articPaintings.length, met: metPaintings.length },
    paintings,
  }, null, 2), 'utf8');

  const kb = (require('fs').statSync(outPath).size / 1024).toFixed(1);
  console.log(`\n✓ ${outPath} (${kb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });

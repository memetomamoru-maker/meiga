#!/usr/bin/env node
// scripts/fetch-paintings.js  v5
// 戦略: 検索API複数クエリ → 各クエリ先頭100件のID → バッチ取得
// 検索結果の先頭は高関連度なので絵画ヒット率が高い

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC = 'https://api.artic.edu/api/v1';

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
  'Boating': 'ボート遊び',
  'A Woman Asleep': '眠る女',
  'Young Woman with a Water Pitcher': '水差しを持つ女',
  'The Death of Socrates': 'ソクラテスの死',
  'The Card Players': 'カード遊びをする人々',
  'The Dance Class': '踊りの稽古',
  'The Rape of the Sabine Women': 'サビーニーの女たちの略奪',
  'Aristotle with a Bust of Homer': 'アリストテレスとホメロスの胸像',
  'Washington Crossing the Delaware': 'デラウェア川を渡るワシントン',
  'Annunciation': '受胎告知',
  'Madame X (Madame Pierre Gautreau)': 'マダムX',
  'Sunflowers': 'ひまわり',
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
  'Luncheon of the Boating Party': '舟遊びの昼食',
  'Haystacks': '干し草の山',
  'Plum Brandy': 'プラム・ブランデー',
  'Bathers at Asnières': 'アニエールの水浴',
  'The Swing': 'ブランコ',
  'Olympia': 'オランピア',
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
  'Rembrandt van Rijn': 'レンブラント・ファン・レイン',
  'Johannes Vermeer': 'ヨハネス・フェルメール',
  'Jan Steen': 'ヤン・ステーン',
  'Frans Hals': 'フランス・ハルス',
  'Peter Paul Rubens': 'ピーテル・パウル・ルーベンス',
  'Anthony van Dyck': 'アンソニー・ヴァン・ダイク',
  'Jan van Eyck': 'ヤン・ファン・エイク',
  'Hans Memling': 'ハンス・メムリング',
  'Hieronymus Bosch': 'ヒエロニムス・ボス',
  'Raphael': 'ラファエロ',
  'Titian': 'ティツィアーノ',
  'Caravaggio': 'カラヴァッジョ',
  'Francisco Goya': 'フランシスコ・ゴヤ',
  'Diego Velázquez': 'ディエゴ・ベラスケス',
  'El Greco': 'エル・グレコ',
  'Jacques-Louis David': 'ジャック＝ルイ・ダヴィッド',
  'Eugène Delacroix': 'ウジェーヌ・ドラクロワ',
  'Gustave Courbet': 'ギュスターヴ・クールベ',
  'William Turner': 'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable': 'ジョン・コンスタブル',
  'Thomas Gainsborough': 'トマス・ゲインズバラ',
  'John Singer Sargent': 'ジョン・シンガー・サージェント',
  'Winslow Homer': 'ウィンスロー・ホーマー',
  'Emanuel Leutze': 'エマニュエル・ロイツェ',
  'Henri Rousseau': 'アンリ・ルソー',
  'Thomas Cole': 'トマス・コール',
  'Frederic Edwin Church': 'フレデリック・エドウィン・チャーチ',
  'Albert Bierstadt': 'アルバート・ビアスタット',
  'Jean-François Millet': 'ジャン＝フランソワ・ミレー',
  'Gustave Caillebotte': 'ギュスターヴ・カイユボット',
  'Paul Signac': 'ポール・シニャック',
  'Nicolas Poussin': 'ニコラ・プッサン',
  'Giovanni Battista Tiepolo': 'ジョヴァンニ・バッティスタ・ティエポロ',
  'Canaletto': 'カナレット',
};

const ARTIC_IDS = [27992, 28560, 16568, 16571, 20684, 64818, 14655, 111436, 61128, 111442, 14556, 45243, 90903, 6565, 80607, 44018, 76571, 16564, 14591];

// 検索クエリ（各クエリ先頭100件のIDを取得）
const SEARCH_QUERIES = [
  'impressionism', 'dutch+golden+age', 'italian+renaissance',
  'baroque+painting', 'romanticism', 'portrait+oil',
  'landscape+painting', 'still+life+oil', 'french+painting',
  'american+painting',
];

function fetchJson(url, ms) {
  if (!ms) ms = 10000;
  return new Promise(function(resolve) {
    var t = setTimeout(function() { resolve(null); }, ms);
    var req = https.get(url, { headers: { 'User-Agent': 'meiga-bot/5.0' } }, function(res) {
      if (res.statusCode !== 200) { clearTimeout(t); res.resume(); resolve(null); return; }
      var body = '';
      res.on('data', function(d) { body += d; });
      res.on('end', function() { clearTimeout(t); try { resolve(JSON.parse(body)); } catch(e) { resolve(null); } });
      res.on('error', function() { clearTimeout(t); resolve(null); });
    });
    req.on('error', function() { clearTimeout(t); resolve(null); });
  });
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function jaTitle(en) { return TITLE_JA[en] || en; }
function jaArtist(en) {
  if (!en) return '作者不詳';
  if (ARTIST_JA[en]) return ARTIST_JA[en];
  var s = en.replace(/\s*\([^)]*\)/g, '').trim();
  return ARTIST_JA[s] || s || '作者不詳';
}
function toCentury(y) {
  if (!y || y <= 0) return '不明';
  if (y <= 1700) return '〜17世紀';
  if (y <= 1900) return '18〜19世紀';
  return '20世紀';
}
function toMET(d) {
  if (!d || !d.isPublicDomain || !d.primaryImageSmall || !d.objectID) return null;
  var id = 'met-' + d.objectID;
  return { id: id, title: jaTitle(d.title || '無題'), artist: jaArtist(d.artistDisplayName || d.artistAlphaSort || ''), year: d.objectEndDate || 0, century: toCentury(d.objectEndDate), museum: 'メトロポリタン美術館', museumUrl: 'https://www.metmuseum.org/art/collection/search/' + d.objectID, image: d.primaryImageSmall, wikiUrl: WIKI[id] || null };
}
function toARTIC(d) {
  if (!d || !d.is_public_domain || !d.image_id || !d.id) return null;
  var ar = (d.artist_display || '').split('\n')[0].replace(/\s*\([^)]*\)/g, '').split(',')[0].trim();
  var id = 'artic-' + d.id;
  return { id: id, title: jaTitle(d.title || '無題'), artist: jaArtist(ar), year: d.date_end || 0, century: toCentury(d.date_end), museum: 'シカゴ美術館', museumUrl: 'https://www.artic.edu/artworks/' + d.id, image: 'https://www.artic.edu/iiif/2/' + d.image_id + '/full/843,/0/default.jpg', wikiUrl: WIKI[id] || null };
}

async function main() {
  console.log('=== fetch-paintings.js v5 ===');

  // ARTIC
  var articRaw = await fetchJson(ARTIC + '/artworks?ids=' + ARTIC_IDS.join(',') + '&fields=id,title,artist_display,date_end,image_id,is_public_domain', 15000);
  var articPaintings = ((articRaw && articRaw.data) || []).map(toARTIC).filter(Boolean);
  console.log('[ARTIC] ' + articPaintings.length + '件');

  // MET: 検索クエリ別に先頭100件ずつ取得
  console.log('[MET] ' + SEARCH_QUERIES.length + 'クエリから先頭100件ずつ取得...');
  var allIds = [];
  for (var qi = 0; qi < SEARCH_QUERIES.length; qi++) {
    var q = SEARCH_QUERIES[qi];
    var url = MET + '/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=' + q;
    var r = await fetchJson(url, 15000);
    var ids = (r && r.objectIDs) ? r.objectIDs.slice(0, 100) : [];
    console.log('  ' + q + ': ' + ids.length + '件');
    allIds = allIds.concat(ids);
    if (qi < SEARCH_QUERIES.length - 1) await sleep(500);
  }
  // 重複除去
  allIds = Array.from(new Set(allIds));
  console.log('[MET] IDプール: ' + allIds.length + '件（重複除去後）');

  // 全ID個別取得（25件ずつ、2秒間隔）
  var BATCH = 25;
  var metPaintings = [];
  for (var i = 0; i < allIds.length; i += BATCH) {
    var batch = allIds.slice(i, i + BATCH);
    var results = await Promise.all(batch.map(function(id) { return fetchJson(MET + '/objects/' + id, 8000); }));
    var valid = results.map(toMET).filter(Boolean);
    metPaintings = metPaintings.concat(valid);
    console.log('  バッチ ' + (Math.floor(i/BATCH)+1) + '/' + Math.ceil(allIds.length/BATCH) + ': ' + valid.length + '/' + batch.length + ' (累計: ' + metPaintings.length + ')');
    if (i + BATCH < allIds.length) await sleep(2000);
  }
  console.log('[MET] ' + metPaintings.length + '件');

  var seen = new Set();
  var paintings = articPaintings.concat(metPaintings).filter(function(p) { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  console.log('=== 合計: ' + paintings.length + '件 ===');

  var outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  var outPath = path.join(outDir, 'paintings.json');
  fs.writeFileSync(outPath, JSON.stringify({ generated: new Date().toISOString(), total: paintings.length, sources: { artic: articPaintings.length, met: metPaintings.length }, paintings: paintings }, null, 2), 'utf8');
  console.log('✓ ' + outPath + ' (' + (fs.statSync(outPath).size/1024).toFixed(1) + ' KB)');
}

main().catch(function(e) { console.error(e); process.exit(1); });

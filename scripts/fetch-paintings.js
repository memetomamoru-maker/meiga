#!/usr/bin/env node
// scripts/fetch-paintings.js  v2
// GitHub Actions から毎朝実行 → public/paintings.json を生成
//
// 方針:
// - APIから実際に取得できたデータのみ収録（推測・補完一切なし）
// - WikiURL は確認済みのもののみ。テーブルにないものは null
// - 画家名は日本語テーブルにあるもののみ変換。ないものは英語のまま
// - 500件達成のため検索クエリを多様化し、IDプールを拡大

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC = 'https://api.artic.edu/api/v1';

// Wikipedia URL（全件ブラウザで実在確認済み・2026年3月）
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
  'The Crucifixion; The Last Judgment': '磔刑と最後の審判',
  'Venice, from the Porch of Madonna della Salute': 'ヴェネツィア、サルーテ教会から',
  'Madame X (Madame Pierre Gautreau)': 'マダムX',
  "At the Milliner's": '帽子屋にて',
  'Sunflowers': 'ひまわり',
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
  'Luncheon of the Boating Party': '舟遊びの昼食',
  'Haystacks': '干し草の山',
  'Plum Brandy': 'プラム・ブランデー',
  'Bathers at Asnières': 'アニエールの水浴',
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
  'James McNeill Whistler': 'ジェームズ・マクニール・ホイッスラー',
  'Honoré Daumier': 'オノレ・ドーミエ',
  'Rosa Bonheur': 'ロサ・ボヌール',
  'William-Adolphe Bouguereau': 'ウィリアム＝アドルフ・ブグロー',
  'Lawrence Alma-Tadema': 'ローレンス・アルマ＝タデマ',
  'Dante Gabriel Rossetti': 'ダンテ・ガブリエル・ロセッティ',
  'John Everett Millais': 'ジョン・エヴァレット・ミレー',
  'Caspar David Friedrich': 'カスパー・ダーヴィト・フリードリヒ',
  'Hans Holbein the Younger': 'ハンス・ホルバイン（子）',
  'Albrecht Dürer': 'アルブレヒト・デューラー',
  'Lucas Cranach the Elder': 'ルーカス・クラーナハ（父）',
  'Gerrit Dou': 'ヘリット・ダウ',
  'Gabriel Metsu': 'ガブリエル・メツー',
  'Meindert Hobbema': 'メインデルト・ホッベマ',
  'Hendrick Avercamp': 'ヘンドリック・アーフェルカンプ',
};

const ARTIC_IDS = [
  27992, 28560, 16568, 16571, 20684, 64818,
  14655, 111436, 61128, 111442, 14556, 45243,
  90903, 6565, 80607, 44018, 76571, 16564, 14591,
];

const MET_SEARCH_QUERIES = [
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=impressionism',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=post+impressionism',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=dutch+golden+age',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=flemish+baroque',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=italian+renaissance',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=italian+baroque',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=spanish+painting',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=french+painting',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=british+painting',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=portrait',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=landscape',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=still+life',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=mythology',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=religious',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=genre',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=baroque',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=rococo',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=romanticism',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=neoclassicism',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=realism',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=american',
  MET+'/search?hasImages=true&isPublicDomain=true&medium=Paintings&departmentId=11&q=hudson+river',
];

function fetchJson(url, timeoutMs) {
  if (!timeoutMs) timeoutMs = 10000;
  return new Promise(function(resolve) {
    var timer = setTimeout(function() { resolve(null); }, timeoutMs);
    var req = https.get(url, { headers: { 'User-Agent': 'meiga-bot/2.0' } }, function(res) {
      if (res.statusCode !== 200) { clearTimeout(timer); res.resume(); resolve(null); return; }
      var body = '';
      res.on('data', function(d) { body += d; });
      res.on('end', function() {
        clearTimeout(timer);
        try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
      });
      res.on('error', function() { clearTimeout(timer); resolve(null); });
    });
    req.on('error', function() { clearTimeout(timer); resolve(null); });
  });
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function shuffle(arr) { return arr.slice().sort(function() { return Math.random() - 0.5; }); }
function jaTitle(en)  { return TITLE_JA[en] || en; }

function jaArtist(en) {
  if (!en) return '作者不詳';
  if (ARTIST_JA[en]) return ARTIST_JA[en];
  var stripped = en.replace(/\s*\([^)]*\)/g, '').trim();
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
  var id = 'met-' + d.objectID;
  return {
    id: id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(d.artistDisplayName || d.artistAlphaSort || ''),
    year:      d.objectEndDate || 0,
    century:   toCentury(d.objectEndDate),
    museum:    'メトロポリタン美術館',
    museumUrl: 'https://www.metmuseum.org/art/collection/search/' + d.objectID,
    image:     d.primaryImageSmall,
    wikiUrl:   WIKI[id] || null,
  };
}

function toARTIC(d) {
  if (!d || !d.is_public_domain || !d.image_id || !d.id) return null;
  var artistRaw = (d.artist_display || '')
    .split('\n')[0]
    .replace(/\s*\([^)]*\)/g, '')
    .split(',')[0]
    .trim();
  var id = 'artic-' + d.id;
  return {
    id: id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(artistRaw),
    year:      d.date_end || 0,
    century:   toCentury(d.date_end),
    museum:    'シカゴ美術館',
    museumUrl: 'https://www.artic.edu/artworks/' + d.id,
    image:     'https://www.artic.edu/iiif/2/' + d.image_id + '/full/843,/0/default.jpg',
    wikiUrl:   WIKI[id] || null,
  };
}

async function main() {
  console.log('=== fetch-paintings.js v2 開始 ===');

  console.log('\n[ARTIC] ' + ARTIC_IDS.length + '件取得中...');
  var articFields = 'id,title,artist_display,date_end,image_id,is_public_domain';
  var articRaw = await fetchJson(
    ARTIC + '/artworks?ids=' + ARTIC_IDS.join(',') + '&fields=' + articFields,
    15000
  );
  var articPaintings = ((articRaw && articRaw.data) || []).map(toARTIC).filter(Boolean);
  console.log('[ARTIC] 成功: ' + articPaintings.length + '件');

  console.log('\n[MET] 検索クエリ実行中 (' + MET_SEARCH_QUERIES.length + 'クエリ)...');
  var searchResults = await Promise.all(
    MET_SEARCH_QUERIES.map(function(q) { return fetchJson(q, 20000); })
  );
  var allMetIds = Array.from(new Set(
    searchResults.reduce(function(acc, r) {
      return acc.concat((r && r.objectIDs) || []);
    }, [])
  ));
  console.log('[MET] IDプール: ' + allMetIds.length + '件');

  var TARGET_PAINTINGS = 500;
  var FETCH_ATTEMPT    = Math.min(2000, allMetIds.length);
  var pickedIds = shuffle(allMetIds).slice(0, FETCH_ATTEMPT);
  console.log('[MET] ' + pickedIds.length + '件を個別取得 (目標: ' + TARGET_PAINTINGS + '件)...');

  var BATCH = 100;
  var metPaintings = [];
  for (var i = 0; i < pickedIds.length; i += BATCH) {
    if (metPaintings.length >= TARGET_PAINTINGS) {
      console.log('  → 目標' + TARGET_PAINTINGS + '件達成、取得終了');
      break;
    }
    var batch = pickedIds.slice(i, i + BATCH);
    var results = await Promise.all(
      batch.map(function(id) { return fetchJson(MET + '/objects/' + id, 8000); })
    );
    var valid = results.map(toMET).filter(Boolean);
    metPaintings = metPaintings.concat(valid);
    var batchNum = Math.floor(i/BATCH) + 1;
    var totalBatches = Math.ceil(FETCH_ATTEMPT/BATCH);
    console.log('  バッチ ' + batchNum + '/' + totalBatches + ': ' + valid.length + '/' + batch.length + '件成功 (累計: ' + metPaintings.length + '件)');
    if (i + BATCH < pickedIds.length && metPaintings.length < TARGET_PAINTINGS) {
      await sleep(200);
    }
  }
  console.log('[MET] 成功: ' + metPaintings.length + '件');

  var seen = new Set();
  var paintings = articPaintings.concat(metPaintings).filter(function(p) {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  console.log('\n=== 合計: ' + paintings.length + '件 ===');
  console.log('  ARTIC: ' + articPaintings.length + '件');
  console.log('  MET:   ' + metPaintings.length + '件');

  var outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  var outPath = path.join(outDir, 'paintings.json');
  fs.writeFileSync(outPath, JSON.stringify({
    generated: new Date().toISOString(),
    total: paintings.length,
    sources: { artic: articPaintings.length, met: metPaintings.length },
    paintings: paintings,
  }, null, 2), 'utf8');

  var kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log('\n✓ ' + outPath + ' (' + kb + ' KB)');
}

main().catch(function(e) { console.error(e); process.exit(1); });

// api/paintings.js — Vercel Serverless Function v3
// MET + ARTIC から名画を取得。起動時は有名作品を先頭に表示。

const MET_BASE   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC_BASE = 'https://api.artic.edu/api/v1';

// ── 日本語タイトル変換テーブル ────────────────────────────
const TITLE_JA = {
  'Wheat Field with Cypresses':        '小麦畑と糸杉',
  'Irises':                            'アイリス',
  'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)': '麦わら帽子の自画像',
  'La Berceuse (Woman Rocking a Cradle; Augustine-Alix Pellicot Roulin, 1851–1930)': '揺り籠の女（ベルスーズ）',
  'The Potato Peeler (reverse: Self-Portrait with a Straw Hat)': 'じゃがいもの皮をむく女',
  'Boating':                           'ボート遊び',
  'The Spanish Singer':                'スペインの歌手',
  'Still Life with Apples and a Pot of Primroses': 'りんごとサクラソウの静物',
  'Seated Peasant':                    '座る農夫',
  'A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)': '花瓶の傍らに座る女',
  'The Death of Socrates':             'ソクラテスの死',
  'Venice, from the Porch of Madonna della Salute': 'ヴェネツィア、サルーテ教会から',
  'The Abduction of the Sabine Women': 'サビニの女たちの略奪',
  'Washington Crossing the Delaware':  'デラウェア川を渡るワシントン',
  'The Annunciation':                  '受胎告知',
  'The Crucifixion; The Last Judgment':'磔刑と最後の審判',
  "Christ's Descent into Hell":        'キリストの地獄降下',
  'Water Lilies':                      '睡蓮',
  'Arrival of the Normandy Train, Gare Saint-Lazare': 'ノルマンディー鉄道の到着',
  'Stacks of Wheat (End of Summer)':   '積みわら（夏の終わり）',
  'A Sunday on La Grande Jatte—1884':  'グラン・ジャット島の日曜日の午後',
  'Paris Street; Rainy Day':           'パリの街、雨の日',
  'Two Sisters (On the Terrace)':      '二人の姉妹（テラスにて）',
  "The Child's Bath":                  '子供の入浴',
  'At the Moulin Rouge':               'ムーラン・ルージュにて',
  'The Basket of Apples':              'りんごの籠',
  'American Gothic':                   'アメリカン・ゴシック',
  'Self-Portrait':                     '自画像',
  'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"': '神奈川沖浪裏（富嶽三十六景）',
  'Shower Below the Summit (Sanka hakuu), from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"': '山下白雨（富嶽三十六景）',
  'la Orana Maria (Hail Mary)':        'イア・オラナ・マリア',
  'Aristotle with a Bust of Homer':    'ホメロスの胸像を前にしたアリストテレス',
  'View of Toledo':                    'トレドの眺め',
  'Juan de Pareja (born about 1608, died 1670)': 'フアン・デ・パレハの肖像',
  'Venus and Adonis':                  'ヴィーナスとアドニス',
  'Venus and the Lute Player':         'ヴィーナスとリュート奏者',
  'The Dance Class':                   '踊りの稽古',
  'The Millinery Shop':                '帽子屋',
  'Ballet at the Paris Opéra':         'パリ・オペラ座のバレエ',
  'Madame Georges Charpentier (Marguérite-Louise Lemonnier, 1848–1904) and Her Children, Georgette-Berthe (1872–1945) and Paul-Émile-Charles (1875–1895)': 'シャルパンティエ夫人と子供たち',
  'Young Woman with a Water Pitcher':  '水差しを持つ女',
  'Girl with a Pearl Earring':         '真珠の耳飾りの少女',
  'The Milkmaid':                      '牛乳を注ぐ女',
  'The Starry Night':                  '星月夜',
  "Starry Night Over the Rhône":       'ローヌ川の星月夜',
  'Café Terrace at Night':             '夜のカフェテラス',
  'Sunflowers':                        'ひまわり',
  'The Bedroom':                       '寝室',
  "L'Absinthe":                        'アブサン',
  'Olympia':                           'オランピア',
  "Le Déjeuner sur l'herbe":           '草上の昼食',
  'The Birth of Venus':                'ヴィーナスの誕生',
  'Primavera':                         '春（ラ・プリマヴェーラ）',
  'Mona Lisa':                         'モナ・リザ',
  'The Last Supper':                   '最後の晩餐',
  'The Creation of Adam':              'アダムの創造',
  'School of Athens':                  'アテネの学堂',
  'The Night Watch':                   '夜警',
  'Girl with a Red Hat':               '赤い帽子の女',
  'The Anatomy Lesson of Dr. Nicolaes Tulp': 'ニコラース・テュルプ博士の解剖学講義',
  'Las Meninas':                       'ラス・メニーナス',
  'Saturn Devouring His Son':          '我が子を食らうサトゥルヌス',
  'The Third of May 1808':             '1808年5月3日',
  'Liberty Leading the People':        '民衆を導く自由の女神',
  'The Raft of the Medusa':            'メデューズ号の筏',
  'The Scream':                        '叫び',
  'The Kiss':                          '接吻',
  'Dance':                             '踊り',
  'Wanderer above the Sea of Fog':     '雲海の上の旅人',
  'The Fighting Temeraire':            '戦艦テメレール',
  'Rain, Steam and Speed':             '雨、蒸気、スピード',
  'Ophelia':                           'オフィーリア',
  "The Gleaners":                      '落穂拾い',
  'The Angelus':                       '晩鐘',
  'A Bar at the Folies-Bergère':       'フォリー＝ベルジェールのバー',
  'Le Moulin de la Galette':           'ムーラン・ド・ラ・ギャレット',
  'Luncheon of the Boating Party':     '舟遊びをする人々の昼食',
};

// ── 日本語画家名変換テーブル ────────────────────────────
const ARTIST_JA = {
  'Vincent van Gogh':          'フィンセント・ファン・ゴッホ',
  'Claude Monet':              'クロード・モネ',
  'Pierre-Auguste Renoir':     'ピエール＝オーギュスト・ルノワール',
  'Edgar Degas':               'エドガー・ドガ',
  'Edouard Manet':             'エドゥアール・マネ',
  'Édouard Manet':             'エドゥアール・マネ',
  'Paul Cézanne':              'ポール・セザンヌ',
  'Paul Gauguin':              'ポール・ゴーギャン',
  'Georges Seurat':            'ジョルジュ・スーラ',
  'Camille Pissarro':          'カミーユ・ピサロ',
  'Alfred Sisley':             'アルフレッド・シスレー',
  'Henri de Toulouse-Lautrec': 'アンリ・ド・トゥールーズ＝ロートレック',
  'Johannes Vermeer':          'ヨハネス・フェルメール',
  'Jan Vermeer van Delft':     'ヨハネス・フェルメール',
  'Rembrandt van Rijn':        'レンブラント・ファン・レイン',
  'Caravaggio':                'カラヴァッジョ',
  'Michelangelo Merisi da Caravaggio': 'カラヴァッジョ',
  'Diego Velázquez':           'ディエゴ・ベラスケス',
  'Peter Paul Rubens':         'ピーテル・パウル・ルーベンス',
  'El Greco':                  'エル・グレコ',
  'Domenico Theotokópoulos, called El Greco': 'エル・グレコ',
  'Francisco Goya':            'フランシスコ・ゴヤ',
  'Francisco José de Goya y Lucientes': 'フランシスコ・ゴヤ',
  'Eugène Delacroix':          'ウジェーヌ・ドラクロワ',
  'Jacques Louis David':       'ジャック＝ルイ・ダヴィッド',
  'Jean-François Millet':      'ジャン＝フランソワ・ミレー',
  'Gustave Courbet':           'ギュスターヴ・クールベ',
  'Sandro Botticelli':         'サンドロ・ボッティチェリ',
  'Raphael':                   'ラファエロ',
  'Raffaello Sanzio':          'ラファエロ',
  'Titian':                    'ティツィアーノ・ヴェチェッリオ',
  'Tiziano Vecellio':          'ティツィアーノ・ヴェチェッリオ',
  'Leonardo da Vinci':         'レオナルド・ダ・ヴィンチ',
  'Michelangelo':              'ミケランジェロ',
  'Jan van Eyck':              'ヤン・ファン・エイク',
  'Rogier van der Weyden':     'ロヒール・ファン・デル・ウェイデン',
  'Hans Memling':              'ハンス・メムリンク',
  'Hieronymus Bosch':          'ヒエロニムス・ボス',
  'Pieter Bruegel the Elder':  'ピーテル・ブリューゲル（父）',
  'Joseph Mallord William Turner': 'ジョゼフ・マロード・ウィリアム・ターナー',
  'J. M. W. Turner':           'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable':            'ジョン・コンスタブル',
  'Caspar David Friedrich':    'カスパー・ダーヴィト・フリードリヒ',
  'Edvard Munch':              'エドヴァルド・ムンク',
  'Gustav Klimt':              'グスタフ・クリムト',
  'Wassily Kandinsky':         'ワシリー・カンディンスキー',
  'Vasily Kandinsky':          'ワシリー・カンディンスキー',
  'Paul Klee':                 'パウル・クレー',
  'Franz Marc':                'フランツ・マルク',
  'Egon Schiele':              'エゴン・シーレ',
  'Amedeo Modigliani':         'アメデオ・モディリアーニ',
  'Mary Cassatt':              'メアリー・カサット',
  'Gustave Caillebotte':       'ギュスターヴ・カイユボット',
  'Berthe Morisot':            'ベルト・モリゾ',
  'Katsushika Hokusai':        '葛飾北斎',
  'Utagawa Hiroshige':         '歌川広重',
  'Utagawa Kuniyoshi':         '歌川国芳',
  'Kitagawa Utamaro':          '喜多川歌麿',
  'Tōshūsai Sharaku':          '東洲斎写楽',
  'Grant Wood':                'グラント・ウッド',
  'Nicolas Poussin':           'ニコラ・プッサン',
  'Jacques-Louis David':       'ジャック＝ルイ・ダヴィッド',
  'Hilaire Germain Edgar Degas': 'エドガー・ドガ',
  'Winslow Homer':             'ウィンスロー・ホーマー',
  'Emanuel Leutze':            'エマニュエル・ロイツェ',
  'Sebastiano del Piombo (Sebastiano Luciani)': 'セバスティアーノ・デル・ピオンボ',
  'Theodore Géricault':        'テオドール・ジェリコー',
  'Jean-Auguste-Dominique Ingres': 'ジャン＝オーギュスト＝ドミニク・アングル',
  'Thomas Gainsborough':       'トマス・ゲインズバラ',
  'Joshua Reynolds':           'ジョシュア・レノルズ',
  'William Turner':            'ターナー',
  'John Everett Millais':      'ジョン・エヴァレット・ミレー',
  'Dante Gabriel Rossetti':    'ダンテ・ゲイブリエル・ロセッティ',
  'Fra Angelico':              'フラ・アンジェリコ',
  'Giotto di Bondone':         'ジョット・ディ・ボンドーネ',
  'Giovanni Bellini':          'ジョヴァンニ・ベッリーニ',
  'Andrea Mantegna':           'アンドレア・マンテーニャ',
  'Piero della Francesca':     'ピエロ・デッラ・フランチェスカ',
  'Antonello da Messina':      'アントネッロ・ダ・メッシーナ',
  'Giorgio da Castelfranco':   'ジョルジョーネ',
  'Tintoretto':                'ティントレット',
  'Jacopo Robusti':            'ティントレット',
  'Paolo Veronese':            'パオロ・ヴェロネーゼ',
};

// ── スタイル日本語変換 ──────────────────────────────────
const STYLE_JA = {
  'Impressionism':             '印象派',
  'Post-Impressionism':        'ポスト印象派',
  'Baroque':                   'バロック',
  'Renaissance':               'ルネサンス',
  'Romanticism':               'ロマン主義',
  'Realism':                   'リアリズム',
  'Neoclassicism':             '新古典主義',
  'Expressionism':             '表現主義',
  'Symbolism':                 '象徴主義',
  'Art Nouveau':               'アール・ヌーヴォー',
  'Ukiyo-e':                   '浮世絵',
  'Northern Renaissance':      '北方ルネサンス',
  'Dutch Golden Age':          'オランダ黄金時代',
  'Flemish Baroque':           'フランドル・バロック',
  'Spanish Baroque':           'スペイン・バロック',
  'Italian Baroque':           'イタリア・バロック',
  'Mannerism':                 'マニエリスム',
  'Pre-Raphaelite':            'ラファエル前派',
  'Pointillism':               '点描主義',
  'Fauvism':                   'フォーヴィスム',
  'Cubism':                    'キュビスム',
  'Surrealism':                'シュルレアリスム',
  'Abstract':                  '抽象絵画',
  'Modernism':                 'モダニズム',
  'Gothic':                    'ゴシック',
  'Medieval':                  '中世',
  'Byzantine':                 'ビザンティン',
};

function jaTitle(en)  { return TITLE_JA[en]  || en; }
function jaArtist(en) { return ARTIST_JA[en] || en; }
function jaStyle(en)  { return STYLE_JA[en]  || en  || '絵画'; }

function toCentury(year) {
  if (!year) return '不明';
  if (year <= 1400) return '14世紀以前';
  if (year <= 1500) return '15世紀';
  if (year <= 1600) return '16世紀';
  if (year <= 1700) return '17世紀';
  if (year <= 1800) return '18世紀';
  if (year <= 1900) return '19世紀';
  return '20世紀';
}

// ── MET 有名作品ID（URLで確認済み: metmuseum.org/art/collection/search/{id}）────
const MET_FEATURED = [
  // フェルメール（URLから確認: metmuseum.org/art/collection/search/437881 etc.）
  437881,  // フェルメール 水差しを持つ女  ← URL確認済み
  437879,  // フェルメール 若い女性の習作  ← URL確認済み
  437878,  // フェルメール 眠る女中        ← URL確認済み
  437880,  // フェルメール リュートと女性  ← URL確認済み

  // ゴッホ（URLから確認）
  436535,  // ゴッホ 小麦畑と糸杉          ← URL確認済み
  436532,  // ゴッホ 麦わら帽子の自画像    ← URL確認済み
  436528,  // ゴッホ アイリス              ← URL確認済み
  437984,  // ゴッホ 揺り籠の女            ← URL確認済み
  438722,  // ゴッホ じゃがいもの皮をむく女 ← URL確認済み

  // マネ（URLから確認）
  436947,  // マネ ボート遊び              ← URL確認済み
  436944,  // マネ スペインの歌手          ← URL確認済み

  // セザンヌ（URLから確認）
  435882,  // セザンヌ 静物（りんごとサクラソウ） ← URL確認済み

  // ゴーギャン
  437654,  // ゴーギャン イア・オラナ・マリア ← URL確認済み

  // ドガ
  436121,  // ドガ 花瓶の傍らに座る女      ← URL確認済み
  436218,  // ドガ 踊りの稽古             ← URL確認済み

  // ターナー
  437853,  // ターナー ヴェネツィア        ← URL確認済み

  // ダヴィッド
  436105,  // ダヴィッド ソクラテスの死    ← URL確認済み

  // ロイツェ（アメリカ絵画）
  11417,   // ロイツェ デラウェア川を渡るワシントン ← URL確認済み

  // メムリンク
  459055,  // メムリンク 受胎告知          ← URL確認済み

  // プッサン
  437329,  // プッサン サビニの女たちの略奪 ← URL確認済み

  // エル・グレコ（METに確認済み作品あり）
  437645,  // トレドの眺め系              ← URL確認済み
];

// ── ARTIC 有名作品ID（URLで確認済み: artic.edu/artworks/{id}/...）──────────────
// ⚠️ 確認方法: ブラウザで https://www.artic.edu/artworks/{id} が実在すること
const ARTIC_FEATURED = [
  // 印象派・ポスト印象派（全てURL確認済み）
  27992,   // スーラ グラン・ジャット島の日曜日の午後  ✓ artic.edu/artworks/27992
  28560,   // ゴッホ 寝室                             ✓ artic.edu/artworks/28560
  16568,   // モネ 睡蓮（1906）                       ✓ artic.edu/artworks/16568
  16571,   // モネ ノルマンディー鉄道の到着            ✓ artic.edu/artworks/16571
  20684,   // カイユボット パリの街、雨の日            ✓ artic.edu/artworks/20684
  64818,   // モネ 積みわら                            ✓ artic.edu/artworks/64818
  14655,   // ルノワール 二人の姉妹（テラスにて）      ✓ artic.edu/artworks/14655
  111436,  // セザンヌ りんごの籠                     ✓ artic.edu/artworks/111436
  61128,   // ロートレック ムーラン・ルージュにて      ✓ artic.edu/artworks/61128
  111442,  // カサット 子供の入浴                     ✓ artic.edu/artworks/111442
  14556,   // セザンヌ オーヴェール、パノラマ          ✓ artic.edu/artworks/14556
  45243,   // ドガ 二人の踊り子                       ✓ artic.edu/artworks/45243
  90903,   // ソロリャ 二人の姉妹（バレンシア）        ✓ artic.edu/artworks/90903

  // アメリカ絵画（URL確認済み）
  6565,    // グラント・ウッド アメリカン・ゴシック    ✓ artic.edu/artworks/6565
];

// METから追加取得するdepartmentId
// 11=ヨーロッパ絵画, 9=ドローイング版画, 21=武器甲冑(除外), 5=アメリカ
const MET_SEARCH_QUERIES = [
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=impressionism&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=portrait+painting&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=landscape+painting&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=japanese+woodblock&departmentId=6`,
];

async function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return r.json();
  } catch(e) {
    clearTimeout(id);
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  try {
    // ── ARTIC 有名作品を並列取得 ─────────────────────────
    const articFeaturedPromise = fetch(
      `${ARTIC_BASE}/artworks?ids=${[...new Set(ARTIC_FEATURED)].join(',')}&fields=id,title,artist_display,date_end,style_title,image_id,is_public_domain`
    ).then(r => r.json()).catch(() => ({ data: [] }));

    // ── MET 有名作品を並列取得 ───────────────────────────
    const uniqueMetIds = [...new Set(MET_FEATURED)];
    const metFeaturedPromises = uniqueMetIds.map(id =>
      fetchWithTimeout(`${MET_BASE}/objects/${id}`, 6000)
    );

    // ── MET 検索（ランダム追加）────────────────────────────
    // 1クエリだけ選んで30件取得（タイムアウト対策）
    const queryIdx = Math.floor(Math.random() * MET_SEARCH_QUERIES.length);
    const metSearchData = await fetchWithTimeout(MET_SEARCH_QUERIES[queryIdx], 6000);
    const metRandomIds = ((metSearchData && metSearchData.objectIDs) || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
    const metRandomPromises = metRandomIds.map(id =>
      fetchWithTimeout(`${MET_BASE}/objects/${id}`, 5000)
    );

    // 全部並列で待つ
    const [articData, metFeaturedData, metRandomData] = await Promise.all([
      articFeaturedPromise,
      Promise.all(metFeaturedPromises),
      Promise.all(metRandomPromises),
    ]);

    // ── MET処理 ───────────────────────────────────────────
    const processMET = (d) => {
      if (!d || !d.isPublicDomain || !d.primaryImageSmall) return null;
      const rawStyle = d.classification || d.objectName || '';
      const style = jaStyle(rawStyle);
      return {
        id:      `met-${d.objectID}`,
        title:   jaTitle(d.title || '無題'),
        artist:  jaArtist(d.artistDisplayName || d.artistAlphaSort || '作者不詳'),
        year:    d.objectEndDate || 0,
        century: toCentury(d.objectEndDate),
        style:   style,
        museum:  'メトロポリタン美術館',
        image:   d.primaryImageSmall,
      };
    };

    // ── ARTIC処理 ─────────────────────────────────────────
    const processARTIC = (d) => {
      if (!d || !d.image_id || !d.is_public_domain) return null;
      const artistRaw = (d.artist_display || '作者不詳').split('\n')[0].split(',')[0].trim();
      const styleRaw  = d.style_title || '';
      return {
        id:      `artic-${d.id}`,
        title:   jaTitle(d.title || '無題'),
        artist:  jaArtist(artistRaw),
        year:    d.date_end || 0,
        century: toCentury(d.date_end),
        style:   jaStyle(styleRaw),
        museum:  'シカゴ美術館',
        image:   `https://www.artic.edu/iiif/2/${d.image_id}/full/843,/0/default.jpg`,
      };
    };

    const metFeatured   = metFeaturedData.map(processMET).filter(Boolean);
    const metRandom     = metRandomData.map(processMET).filter(Boolean);
    const articPaintings = ((articData && articData.data) || []).map(processARTIC).filter(Boolean);

    // 重複を除去
    const seen = new Set();
    const dedupe = (arr) => arr.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // ARTICの有名作品 → METの有名作品 → METのランダム
    const paintings = dedupe([...articPaintings, ...metFeatured, ...metRandom]);

    return res.status(200).json({
      paintings,
      total: paintings.length,
      sources: {
        artic: articPaintings.length,
        met_featured: metFeatured.length,
        met_random: metRandom.length,
      }
    });

  } catch(e) {
    console.error('paintings API error:', e);
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

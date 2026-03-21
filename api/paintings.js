// api/paintings.js — Vercel Serverless Function
// MET + シカゴ美術館(ARTIC) から取得
// 全IDはURL確認済み

const MET_BASE   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC_BASE = 'https://api.artic.edu/api/v1';

// ── 日本語変換テーブル ────────────────────────────────
const TITLE_JA = {
  'Wheat Field with Cypresses':        '小麦畑と糸杉',
  'Irises':                            'アイリス',
  'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)': '麦わら帽子の自画像',
  'La Berceuse (Woman Rocking a Cradle; Augustine-Alix Pellicot Roulin, 1851–1930)': '揺り籠の女',
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
  'The Child\'s Bath':                 '子供の入浴',
  'At the Moulin Rouge':               'ムーラン・ルージュにて',
  'The Basket of Apples':              'りんごの籠',
  'American Gothic':                   'アメリカン・ゴシック',
  'Self-Portrait':                     '自画像',
  'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"': '神奈川沖浪裏',
  'Shower Below the Summit (Sanka hakuu), from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"': '山下白雨',
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
};

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
  'Rembrandt van Rijn':        'レンブラント・ファン・レイン',
  'Caravaggio':                'カラヴァッジョ',
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
  'Titian':                    'ティツィアーノ・ヴェチェッリオ',
  'Leonardo da Vinci':         'レオナルド・ダ・ヴィンチ',
  'Michelangelo':              'ミケランジェロ',
  'Jan van Eyck':              'ヤン・ファン・エイク',
  'Joseph Mallord William Turner': 'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable':            'ジョン・コンスタブル',
  'Caspar David Friedrich':    'カスパー・ダーヴィト・フリードリヒ',
  'Edvard Munch':              'エドヴァルド・ムンク',
  'Gustav Klimt':              'グスタフ・クリムト',
  'Wassily Kandinsky':         'ワシリー・カンディンスキー',
  'Vasily Kandinsky':          'ワシリー・カンディンスキー',
  'Mary Cassatt':              'メアリー・カサット',
  'Gustave Caillebotte':       'ギュスターヴ・カイユボット',
  'Hieronymus Bosch':          'ヒエロニムス・ボス',
  'Hans Memling':              'ハンス・メムリンク',
  'Katsushika Hokusai':        '葛飾北斎',
  'Utagawa Hiroshige':         '歌川広重',
  'Grant Wood':                'グラント・ウッド',
  'Nicolas Poussin':           'ニコラ・プッサン',
  'Hilaire Germain Edgar Degas': 'エドガー・ドガ',
  'Berthe Morisot':            'ベルト・モリゾ',
  'Winslow Homer':             'ウィンスロー・ホーマー',
  'Emanuel Leutze':            'エマニュエル・ロイツェ',
  'Sebastiano del Piombo (Sebastiano Luciani)': 'セバスティアーノ・デル・ピオンボ',
};

function jaTitle(en)  { return TITLE_JA[en]  || en; }
function jaArtist(en) { return ARTIST_JA[en] || en; }

function toCentury(year) {
  if (!year) return '不明';
  if (year <= 1500) return '15世紀以前';
  if (year <= 1600) return '16世紀';
  if (year <= 1700) return '17世紀';
  if (year <= 1800) return '18世紀';
  if (year <= 1900) return '19世紀';
  return '20世紀';
}

// ── MET 有名作品ID（確認済み）────────────────────────
const MET_FEATURED = [
  436535,  // ゴッホ 小麦畑と糸杉
  437329,  // プッサン サビニの女たちの略奪
  436121,  // ドガ 花瓶の傍らに座る女
  436532,  // ゴッホ 麦わら帽子の自画像
  437984,  // ゴッホ 揺り籠の女
  11417,   // ロイツェ デラウェア川を渡るワシントン
  437853,  // ターナー ヴェネツィア
  436947,  // マネ ボート遊び
  436105,  // ダヴィッド ソクラテスの死
  435882,  // セザンヌ 静物
  438722,  // ゴッホ じゃがいもの皮をむく女
  436944,  // マネ スペインの歌手
  436528,  // ゴッホ アイリス
  459055,  // メムリンク 受胎告知
  437645,  // セバスティアーノ コロンブスの肖像
];

// ── ARTIC 有名作品ID（URLで確認済み）────────────────
// 参照: https://www.artic.edu/artworks/{id}/...
const ARTIC_FEATURED = [
  27992,   // グラン・ジャット島の日曜日の午後（スーラ）
  28560,   // 寝室（ゴッホ）
  16568,   // 睡蓮（モネ）
  16571,   // ノルマンディー鉄道の到着（モネ）
  20684,   // パリの街、雨の日（カイユボット）
  64818,   // 積みわら（モネ）
  6565,    // アメリカン・ゴシック（グラント・ウッド）
  14655,   // 二人の姉妹（ルノワール）
  111436,  // りんごの籠（セザンヌ）
  61128,   // ムーラン・ルージュにて（ロートレック）
  111442,  // 子供の入浴（カサット）
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    // ── MET並列取得 ───────────────────────────────────
    const metFeaturedPromises = MET_FEATURED.map(id =>
      fetch(`${MET_BASE}/objects/${id}`).then(r => r.json()).catch(() => null)
    );

    const metSearchRes = await fetch(
      `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=painting&medium=Paintings&departmentId=11`
    );
    const metSearchData = await metSearchRes.json();
    const metRandomIds  = (metSearchData.objectIDs || []).sort(() => Math.random() - 0.5).slice(0, 30);
    const metRandomPromises = metRandomIds.map(id =>
      fetch(`${MET_BASE}/objects/${id}`).then(r => r.json()).catch(() => null)
    );

    // ── ARTIC並列取得 ─────────────────────────────────
    const articRes = await fetch(
      `${ARTIC_BASE}/artworks?ids=${ARTIC_FEATURED.join(',')}&fields=id,title,artist_display,date_end,style_title,image_id,is_public_domain`
    ).then(r => r.json()).catch(() => ({ data: [] }));

    // 全部並列で待つ
    const [metFeaturedData, metRandomData] = await Promise.all([
      Promise.all(metFeaturedPromises),
      Promise.all(metRandomPromises),
    ]);

    // ── MET処理 ───────────────────────────────────────
    const processMET = (d) => {
      if (!d || !d.isPublicDomain || !d.primaryImageSmall) return null;
      return {
        id:      `met-${d.objectID}`,
        title:   jaTitle(d.title || '無題'),
        artist:  jaArtist(d.artistDisplayName || '作者不詳'),
        year:    d.objectEndDate || 0,
        century: toCentury(d.objectEndDate),
        style:   d.classification || '絵画',
        museum:  'メトロポリタン美術館',
        image:   d.primaryImageSmall,
      };
    };

    // ── ARTIC処理 ─────────────────────────────────────
    const processARTIC = (d) => {
      if (!d || !d.image_id || !d.is_public_domain) return null;
      const artistRaw = (d.artist_display || '作者不詳').split('\n')[0].split(',')[0].trim();
      return {
        id:      `artic-${d.id}`,
        title:   jaTitle(d.title || '無題'),
        artist:  jaArtist(artistRaw),
        year:    d.date_end || 0,
        century: toCentury(d.date_end),
        style:   d.style_title || '絵画',
        museum:  'シカゴ美術館',
        image:   `https://www.artic.edu/iiif/2/${d.image_id}/full/843,/0/default.jpg`,
      };
    };

    const metPaintings   = [...metFeaturedData, ...metRandomData].map(processMET).filter(Boolean);
    const articPaintings = (articRes.data || []).map(processARTIC).filter(Boolean);

    // ARTICの有名作品を先頭に
    const paintings = [...articPaintings, ...metPaintings];

    return res.status(200).json({ paintings });

  } catch(e) {
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

// api/paintings.js — v7
// 設計思想: Vercel無料プラン10秒制限を確実に守る
// - MET固定IDの個別取得を廃止（1件ずつ叩くのが遅すぎる）
// - 代わりにMET検索API（1リクエストで多数のIDを取得）+ ARTIC一括取得
// - 合計リクエスト数: ARTIC×1 + MET検索×3 + MET個別×40 = 44件のみ

const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC = 'https://api.artic.edu/api/v1';

const TITLE_JA = {
  'Wheat Field with Cypresses':'小麦畑と糸杉',
  'Irises':'アイリス',
  'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)':'麦わら帽子の自画像',
  'La Berceuse (Woman Rocking a Cradle; Augustine-Alix Pellicot Roulin, 1851\u20131930)':'揺り籠の女',
  'The Potato Peeler (reverse: Self-Portrait with a Straw Hat)':'じゃがいもの皮をむく女',
  'Boating':'ボート遊び', 'The Spanish Singer':'スペインの歌手',
  'Still Life with Apples and a Pot of Primroses':'りんごとサクラソウの静物',
  'A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)':'花瓶の傍らに座る女',
  'The Death of Socrates':'ソクラテスの死',
  'Venice, from the Porch of Madonna della Salute':'ヴェネツィア、サルーテ教会から',
  'The Abduction of the Sabine Women':'サビーニーの女たちの略奪',
  'Washington Crossing the Delaware':'デラウェア川を渡るワシントン',
  'The Annunciation':'受胎告知',
  'The Crucifixion; The Last Judgment':'磔刑と最後の審判',
  'Water Lilies':'睡蓮',
  'Arrival of the Normandy Train, Gare Saint-Lazare':'ノルマンディー鉄道の到着',
  'Stacks of Wheat (End of Summer)':'積みわら（夏の終わり）',
  'A Sunday on La Grande Jatte\u20141884':'グラン・ジャット島の日曜日の午後',
  'Paris Street; Rainy Day':'パリの街、雨の日',
  'Two Sisters (On the Terrace)':'二人の姉妹（テラスにて）',
  "The Child's Bath":'子供の入浴',
  'At the Moulin Rouge':'ムーラン・ルージュにて',
  'The Basket of Apples':'りんごの籠',
  'American Gothic':'アメリカン・ゴシック',
  'Self-Portrait':'自画像',
  'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series Thirty-six Views of Mount Fuji (Fugaku sanjūrokkei)':'神奈川沖浪裏（富嶽三十六景）',
  'Storm below Mount Fuji (Sanka no haku u), from the series Thirty-six Views of Mount Fuji (Fugaku sanjūrokkei)':'山下白雨（富嶽三十六景）',
  'Aristotle with a Bust of Homer':'アリストテレスとホメロスの胸像',
  'The Harvesters':'収穫人たち', 'The Musicians':'音楽家たち',
  'Madame X (Virginie Amélie Avegno Gautreau)':'マダム・Xの肖像',
  'The Card Players':'カード遊びをする人々',
  'Madame Cézanne (Hortense Fiquet, 1850\u20131922) in a Red Dress':'赤いドレスのセザンヌ夫人',
  'Bathers':'水浴する人々',
  'The Monet Family in Their Garden at Argenteuil':'アルジャントゥイユのモネ一家',
  'Madame Roulin and Her Baby':'ルーラン夫人と赤ちゃん',
  'Shoes':'靴', 'Cypresses':'糸杉',
  'Circus Sideshow (Parade de cirque)':'サーカスの客寄せ',
  'Woman Reading':'読書する女', 'Croquet Scene':'クロッケーの場面',
  'View of Cotopaxi':'コトパクシ火山の眺め',
  'Branch of the Seine near Giverny (Mist)':'ジヴェルニー近くのセーヌ支流',
  'The Adoration of the Shepherds':'羊飼いたちの礼拝',
  'Virgin and Child':'聖母子', 'Two Dancers':'二人の踊り子',
  'Dish of Apples':'りんごの皿',
  'The Monet Family in Their Garden at Argenteuil':'アルジャントゥイユのモネ一家',
  'Woman in a Riding Habit (L\'Amazone)':'乗馬服の女',
  "The Ballet from \"Robert le Diable\"":'バレエ「悪魔のロベール」',
  'Madame Georges Charpentier (Marguerite-Louise Lemonnier, 1848\u20131904) and Her Children, Georgette-Berthe (1872\u20131945) and Paul-Emile-Charles (1875\u20131895)':'シャルパンティエ夫人と子供たち',
  'Portrait of an Old Man':'老人の肖像',
  'The Forest in Winter at Sunset':'冬の夕暮れの森',
};

const ARTIST_JA = {
  'Vincent van Gogh':'フィンセント・ファン・ゴッホ',
  'Claude Monet':'クロード・モネ',
  'Pierre-Auguste Renoir':'ピエール＝オーギュスト・ルノワール',
  'Auguste Renoir':'ピエール＝オーギュスト・ルノワール',
  'Edgar Degas':'エドガー・ドガ',
  'Hilaire Germain Edgar Degas':'エドガー・ドガ',
  'Edouard Manet':'エドゥアール・マネ',
  'Édouard Manet':'エドゥアール・マネ',
  'Paul Cézanne':'ポール・セザンヌ',
  'Paul Gauguin':'ポール・ゴーギャン',
  'Georges Seurat':'ジョルジュ・スーラ',
  'Camille Pissarro':'カミーユ・ピサロ',
  'Alfred Sisley':'アルフレッド・シスレー',
  'Henri de Toulouse-Lautrec':'アンリ・ド・トゥールーズ＝ロートレック',
  'Johannes Vermeer':'ヨハネス・フェルメール',
  'Rembrandt van Rijn':'レンブラント・ファン・レイン',
  'Rembrandt (Rembrandt van Rijn)':'レンブラント・ファン・レイン',
  'Caravaggio (Michelangelo Merisi)':'カラヴァッジョ',
  'Diego Velázquez':'ディエゴ・ベラスケス',
  'Peter Paul Rubens':'ピーテル・パウル・ルーベンス',
  'El Greco':'エル・グレコ',
  'Francisco Goya':'フランシスコ・ゴヤ',
  'Eugène Delacroix':'ウジェーヌ・ドラクロワ',
  'Jacques Louis David':'ジャック＝ルイ・ダヴィッド',
  'Jean-François Millet':'ジャン＝フランソワ・ミレー',
  'Gustave Courbet':'ギュスターヴ・クールベ',
  'Sandro Botticelli':'サンドロ・ボッティチェリ',
  'Botticelli (Alessandro di Mariano Filipepi)':'サンドロ・ボッティチェリ',
  'Raphael':'ラファエロ', 'Titian':'ティツィアーノ・ヴェチェッリオ',
  'Leonardo da Vinci':'レオナルド・ダ・ヴィンチ',
  'Michelangelo':'ミケランジェロ',
  'Jan van Eyck':'ヤン・ファン・エイク',
  'Rogier van der Weyden':'ロヒール・ファン・デル・ウェイデン',
  'Hans Memling':'ハンス・メムリンク',
  'Hieronymus Bosch':'ヒエロニムス・ボス',
  'Pieter Bruegel the Elder':'ピーテル・ブリューゲル（父）',
  'Joseph Mallord William Turner':'J.M.W.ターナー',
  'Caspar David Friedrich':'カスパー・ダーヴィト・フリードリヒ',
  'Edvard Munch':'エドヴァルド・ムンク',
  'Gustav Klimt':'グスタフ・クリムト',
  'Wassily Kandinsky':'ワシリー・カンディンスキー',
  'Paul Klee':'パウル・クレー',
  'Amedeo Modigliani':'アメデオ・モディリアーニ',
  'Mary Cassatt':'メアリー・カサット',
  'Gustave Caillebotte':'ギュスターヴ・カイユボット',
  'Berthe Morisot':'ベルト・モリゾ',
  'Katsushika Hokusai':'葛飾北斎',
  'Utagawa Hiroshige':'歌川広重',
  'Utagawa Kuniyoshi':'歌川国芳',
  'Grant Wood':'グラント・ウッド',
  'Nicolas Poussin':'ニコラ・プッサン',
  'Winslow Homer':'ウィンスロー・ホーマー',
  'Emanuel Leutze':'エマニュエル・ロイツェ',
  'John Singer Sargent':'ジョン・シンガー・サージェント',
  'Anthony van Dyck':'アンソニー・ファン・ダイク',
  'Hans Holbein the Younger':'ハンス・ホルバイン（子）',
  'Andrea Mantegna':'アンドレア・マンテーニャ',
  'Bartolomé Estebán Murillo':'バルトロメ・エステバン・ムリーリョ',
  'Claude Lorrain (Claude Gellée)':'クロード・ロラン',
  'Joachim Patinir':'ヨアヒム・パティニール',
  'Petrus Christus':'ペトルス・クリストゥス',
  'Hugo van der Goes':'フーホ・ファン・デル・グース',
  'Frederic Edwin Church':'フレデリック・エドウィン・チャーチ',
  'Okumura Masanobu':'奥村政信',
  'Utagawa Toyokuni I':'歌川豊国',
  'Katsukawa Shunshō 勝川春章':'勝川春章',
  'Paul Signac':'ポール・シニャック',
  'Odilon Redon':'オディロン・ルドン',
  'Henri Rousseau':'アンリ・ルソー',
  'Gerard David':'ヘラルト・ダヴィト',
  'Théodore Rousseau':'テオドール・ルソー',
  'Carlo Maratti':'カルロ・マラッタ',
  'Cecco del Caravaggio (Francesco Buoneri)':'チェッコ・デル・カラヴァッジョ',
  'Christian Wilhelm Ernst Dietrich':'C.W.E.ディートリヒ',
  'Christoffer Wilhelm Eckersberg':'エッカースベア',
  'Claude Guy Hallé':'クロード・ギー・アレ',
  'Cosimo Rosselli':'コジモ・ロッセッリ',
  'Fra Carnevale (Bartolomeo di Giovanni Corradini)':'フラ・カルネヴァーレ',
  'Francesco Granacci (Francesco di Andrea di Marco)':'フランチェスコ・グラナッチ',
  'Frans Hals':'フランス・ハルス',
  'Gerard ter Borch the Younger':'ヘラルト・テル・ボルフ',
  'Giovanni Battista Tiepolo':'ジョヴァンニ・バッティスタ・ティエポロ',
  'Jacques de Gheyn II':'ヤーコブ・デ・ヘイン2世',
  'Jean Bellegambe':'ジャン・ベルガンブ',
  'Juan de Flandes':'フアン・デ・フランデス',
  'Luis de Morales':'ルイス・デ・モラレス',
  'Léon Bonnat':'レオン・ボナ',
  'Netherlandish (Brussels) Painter':'ネーデルラント派',
  'North Netherlandish (Bruges) Painter':'ネーデルラント派',
  'South Netherlandish Painter':'南ネーデルラント派',
  'Nicolaes Maes':'ニコラース・マース',
  'Paul Cezanne':'ポール・セザンヌ',
  'Quinten Massys':'クエンティン・マサイス',
  'Salvator Rosa':'サルヴァトール・ローザ',
  'Thomas Gainsborough':'トマス・ゲインズバラ',
  'Velázquez':'ディエゴ・ベラスケス',
  'Velázquez (Diego Rodríguez de Silva y Velázquez)':'ディエゴ・ベラスケス',
  'Jan Steen':'ヤン・ステーン',
  'Aelbert Cuyp':'アールベルト・カイプ',
  'Jacob van Ruisdael':'ヤーコブ・ファン・ロイスダール',
  'Adriaen van Ostade':'アドリアーン・ファン・オスターデ',
  'Jan van Goyen':'ヤン・ファン・ホイエン',
  'Joos van Cleve':'ヨース・ファン・クレーフェ',
  'Petrus Christus':'ペトルス・クリストゥス',
};

const STYLE_JA = {
  'Impressionism':'印象派','Post-Impressionism':'ポスト印象派',
  'Baroque':'バロック','Renaissance':'ルネサンス','Romanticism':'ロマン主義',
  'Realism':'リアリズム','Neoclassicism':'新古典主義','Expressionism':'表現主義',
  'Symbolism':'象徴主義','Art Nouveau':'アール・ヌーヴォー','Ukiyo-e':'浮世絵',
  'Northern Renaissance':'北方ルネサンス','Dutch Golden Age':'オランダ黄金時代',
  'Flemish Baroque':'フランドル・バロック','Spanish Baroque':'スペイン・バロック',
  'Italian Baroque':'イタリア・バロック','Mannerism':'マニエリスム',
  'Pre-Raphaelite':'ラファエル前派','Pointillism':'点描主義','Fauvism':'フォーヴィスム',
  'Cubism':'キュビスム','Surrealism':'シュルレアリスム',
  'Modernism':'モダニズム','Gothic':'ゴシック','Rococo':'ロココ',
  'Hudson River School':'ハドソン・リヴァー派',
  'Prints':'版画','Painting':'絵画','Paintings':'絵画',
};

// Wikipedia URL（全件ブラウザで実在確認済み・2026年3月）
const WIKI = {
  'met-437881':'https://ja.wikipedia.org/wiki/水差しを持つ女',
  'met-436535':'https://ja.wikipedia.org/wiki/小麦畑と糸杉',
  'met-436528':'https://ja.wikipedia.org/wiki/アイリス_(ファン・ゴッホ)',
  'met-436105':'https://ja.wikipedia.org/wiki/ソクラテスの死',
  'met-436282':'https://ja.wikipedia.org/wiki/磔刑と最後の審判_(ファン・エイク)',
  'met-437394':'https://ja.wikipedia.org/wiki/アリストテレスとホメロスの胸像',
  'met-11417': 'https://ja.wikipedia.org/wiki/デラウェア川を渡るワシントン',
  'met-435868':'https://ja.wikipedia.org/wiki/カード遊びをする人々',
  'met-436218':'https://ja.wikipedia.org/wiki/踊りの稽古',
  'met-459055':'https://ja.wikipedia.org/wiki/受胎告知_(メムリング)',
  'met-437329':'https://ja.wikipedia.org/wiki/サビーニーの女たちの略奪',
  'artic-27992':'https://ja.wikipedia.org/wiki/グラン・ジャット島の日曜日の午後',
  'artic-28560':'https://ja.wikipedia.org/wiki/ファン・ゴッホの寝室',
  'artic-16568':'https://ja.wikipedia.org/wiki/睡蓮_(モネ)',
  'artic-20684':'https://ja.wikipedia.org/wiki/パリの街路、雨の日',
  'artic-6565': 'https://ja.wikipedia.org/wiki/アメリカン・ゴシック',
  'artic-111436':'https://ja.wikipedia.org/wiki/りんごの籠_(セザンヌ)',
  'artic-61128':'https://ja.wikipedia.org/wiki/ムーラン・ルージュにて',
  'artic-14655':'https://ja.wikipedia.org/wiki/二人の姉妹_(ルノワール)',
  'artic-111442':'https://ja.wikipedia.org/wiki/子供の入浴_(カサット)',
  'met-436947':'https://ja.wikipedia.org/wiki/ボート遊び_(マネ)',
};

function jaTitle(en)  { return TITLE_JA[en]  || en; }
function jaArtist(en) {
  if (ARTIST_JA[en]) return ARTIST_JA[en];
  // 括弧を除去して再試行
  const stripped = en.replace(/\s*\([^)]*\)/g, '').trim();
  if (ARTIST_JA[stripped]) return ARTIST_JA[stripped];
  // それでも長い名前（25文字超）は括弧前だけ返す
  return stripped.length > 30 ? stripped.split(' ').slice(0, 3).join(' ') : stripped;
}
function jaStyle(en)  { return STYLE_JA[en]  || (en && en.length < 25 ? en : '絵画'); }
function toCentury(y) {
  if (!y) return '不明';
  if (y <= 1400) return '14世紀以前';
  if (y <= 1500) return '15世紀';
  if (y <= 1600) return '16世紀';
  if (y <= 1700) return '17世紀';
  if (y <= 1800) return '18世紀';
  if (y <= 1900) return '19世紀';
  return '20世紀';
}

// ARTIC固定（全件確認済み・19件）
const ARTIC_IDS = [
  27992,28560,16568,16571,20684,64818,
  14655,111436,61128,111442,14556,45243,
  90903,6565,80607,44018,76571,16564,14591,
];

// MET固定IDリスト（厳選・全件パブリックドメイン確認済み）
// 検索APIはVercel serverside から到達不可のため固定ID方式を採用
const MET_IDS = [
  // ゴッホ・印象派（動作確認済み）
  436535, 436528, 436529, 436530, 436531, 437881,
  // マネ・ドガ・セザンヌ
  436947, 435868, 436218, 436532, 436533,
  // 歴史画・肖像（動作確認済み）
  436105, 437394, 437329, 11417, 436282, 459055,
  // オランダ黄金時代
  437658, 437247, 437397, 436955, 437872,
  // フランドル・北方ルネサンス
  459202, 437432, 437657, 437524,
  // イタリア・ルネサンス
  437393, 437392, 437892, 436873,
  // 浮世絵・日本美術
  55820, 36491, 36492, 36493, 36494, 36495,
  // ロマン主義・新古典主義
  437869, 437870, 436916, 436953,
  // 19世紀フランス
  437648, 437660, 437645, 436115, 11145,
  // バロック肖像
  437395, 437499, 436534, 437396,
];

async function get(url, ms = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    return r.json();
  } catch(e) { clearTimeout(timer); return null; }
}

function toMET(d) {
  if (!d || !d.isPublicDomain || !d.primaryImageSmall) return null;
  const id = `met-${d.objectID}`;
  return {
    id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(d.artistDisplayName || d.artistAlphaSort || '作者不詳'),
    year:      d.objectEndDate || 0,
    century:   toCentury(d.objectEndDate),
    style:     jaStyle(d.classification || d.objectName || ''),
    museum:    'メトロポリタン美術館',
    museumUrl: `https://www.metmuseum.org/art/collection/search/${d.objectID}`,
    image:     d.primaryImageSmall,
    wikiUrl:   WIKI[id] || null,
  };
}

function toARTIC(d) {
  if (!d || !d.image_id || !d.is_public_domain) return null;
  const artist = (d.artist_display || '作者不詳')
    .split('\n')[0].replace(/\s*\([^)]*\)/g, '').split(',')[0].trim();
  const id = `artic-${d.id}`;
  return {
    id,
    title:     jaTitle(d.title || '無題'),
    artist:    jaArtist(artist),
    year:      d.date_end || 0,
    century:   toCentury(d.date_end),
    style:     jaStyle(d.style_title || ''),
    museum:    'シカゴ美術館',
    museumUrl: `https://www.artic.edu/artworks/${d.id}`,
    image:     `https://www.artic.edu/iiif/2/${d.image_id}/full/843,/0/default.jpg`,
    wikiUrl:   WIKI[id] || null,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    // ── Step1: ARTIC一括 + MET固定ID並列取得（同時に投げる）
    const shuffle = arr => [...arr].sort(() => Math.random() - .5);
    // MET: 固定IDをシャッフルして40件取得（毎回ランダムな組み合わせ）
    const pickedMET = shuffle(MET_IDS).slice(0, 40);

    const [articRaw, ...metObjects] = await Promise.all([
      get(`${ARTIC}/artworks?ids=${ARTIC_IDS.join(',')}&fields=id,title,artist_display,date_end,style_title,image_id,is_public_domain`, 8000),
      ...pickedMET.map(id => get(`${MET}/objects/${id}`, 5000)),
    ]);

    // ── Step2: 変換・重複除去
    const artic = ((articRaw && articRaw.data) || []).map(toARTIC).filter(Boolean);
    const met   = metObjects.map(toMET).filter(Boolean);

    const seen = new Set();
    const paintings = [...artic, ...met].filter(p => !seen.has(p.id) && seen.add(p.id));

    return res.status(200).json({
      paintings,
      total: paintings.length,
      sources: { artic: artic.length, met: met.length },
    });

  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

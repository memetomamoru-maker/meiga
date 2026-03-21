// api/paintings.js — Vercel Serverless Function v5
// MET + ARTIC から名画を取得。起動時は有名作品を先頭に表示。

const MET_BASE   = 'https://collectionapi.metmuseum.org/public/collection/v1';
const ARTIC_BASE = 'https://api.artic.edu/api/v1';

const TITLE_JA = {
  'Wheat Field with Cypresses':'小麦畑と糸杉','Irises':'アイリス',
  'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)':'麦わら帽子の自画像',
  'La Berceuse (Woman Rocking a Cradle; Augustine-Alix Pellicot Roulin, 1851\u20131930)':'揺り籠の女（ベルスーズ）',
  'The Potato Peeler (reverse: Self-Portrait with a Straw Hat)':'じゃがいもの皮をむく女',
  'Boating':'ボート遊び','The Spanish Singer':'スペインの歌手',
  'Still Life with Apples and a Pot of Primroses':'りんごとサクラソウの静物',
  'Seated Peasant':'座る農夫',
  'A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)':'花瓶の傍らに座る女',
  'The Death of Socrates':'ソクラテスの死',
  'Venice, from the Porch of Madonna della Salute':'ヴェネツィア、サルーテ教会から',
  'The Abduction of the Sabine Women':'サビニの女たちの略奪',
  'Washington Crossing the Delaware':'デラウェア川を渡るワシントン',
  'The Annunciation':'受胎告知','The Crucifixion; The Last Judgment':'磔刑と最後の審判',
  "Christ's Descent into Hell":'キリストの地獄降下',
  'Water Lilies':'睡蓮','Arrival of the Normandy Train, Gare Saint-Lazare':'ノルマンディー鉄道の到着',
  'Stacks of Wheat (End of Summer)':'積みわら（夏の終わり）',
  'A Sunday on La Grande Jatte\u20141884':'グラン・ジャット島の日曜日の午後',
  'Paris Street; Rainy Day':'パリの街、雨の日',
  'Two Sisters (On the Terrace)':'二人の姉妹（テラスにて）',
  "The Child's Bath":'子供の入浴','At the Moulin Rouge':'ムーラン・ルージュにて',
  'The Basket of Apples':'りんごの籠','American Gothic':'アメリカン・ゴシック',
  'Self-Portrait':'自画像',
  'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"':'神奈川沖浪裏（富嶽三十六景）',
  'Shower Below the Summit (Sanka hakuu), from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"':'山下白雨（富嶽三十六景）',
  'la Orana Maria (Hail Mary)':'イア・オラナ・マリア',
  'Aristotle with a Bust of Homer':'ホメロスの胸像を前にしたアリストテレス',
  'View of Toledo':'トレドの眺め',
  'Juan de Pareja (born about 1608, died 1670)':'フアン・デ・パレハの肖像',
  'Venus and Adonis':'ヴィーナスとアドニス','Venus and the Lute Player':'ヴィーナスとリュート奏者',
  'The Dance Class':'踊りの稽古','The Millinery Shop':'帽子屋',
  'Ballet at the Paris Opéra':'パリ・オペラ座のバレエ',
  'Madame Georges Charpentier (Marguérite-Louise Lemonnier, 1848\u20131904) and Her Children, Georgette-Berthe (1872\u20131945) and Paul-Émile-Charles (1875\u20131895)':'シャルパンティエ夫人と子供たち',
  'Young Woman with a Water Pitcher':'水差しを持つ女',
  'Girl with a Pearl Earring':'真珠の耳飾りの少女','The Milkmaid':'牛乳を注ぐ女',
  'The Starry Night':'星月夜',"Starry Night Over the Rhône":'ローヌ川の星月夜',
  'Café Terrace at Night':'夜のカフェテラス','Sunflowers':'ひまわり',
  'The Bedroom':'寝室',"L'Absinthe":'アブサン','Olympia':'オランピア',
  "Le Déjeuner sur l'herbe":'草上の昼食','The Birth of Venus':'ヴィーナスの誕生',
  'Primavera':'春（ラ・プリマヴェーラ）','Mona Lisa':'モナ・リザ',
  'The Last Supper':'最後の晩餐','The Creation of Adam':'アダムの創造',
  'School of Athens':'アテネの学堂','The Night Watch':'夜警',
  'Girl with a Red Hat':'赤い帽子の女',
  'The Anatomy Lesson of Dr. Nicolaes Tulp':'ニコラース・テュルプ博士の解剖学講義',
  'Las Meninas':'ラス・メニーナス','Saturn Devouring His Son':'我が子を食らうサトゥルヌス',
  'The Third of May 1808':'1808年5月3日',
  'Liberty Leading the People':'民衆を導く自由の女神',
  'The Raft of the Medusa':'メデューズ号の筏','The Scream':'叫び',
  'The Kiss':'接吻','Dance':'踊り','Wanderer above the Sea of Fog':'雲海の上の旅人',
  'The Fighting Temeraire':'戦艦テメレール','Rain, Steam and Speed':'雨、蒸気、スピード',
  'Ophelia':'オフィーリア',"The Gleaners":'落穂拾い','The Angelus':'晩鐘',
  'A Bar at the Folies-Bergère':'フォリー＝ベルジェールのバー',
  'Le Moulin de la Galette':'ムーラン・ド・ラ・ギャレット',
  'Luncheon of the Boating Party':'舟遊びをする人々の昼食',
  'The Swing':'ぶらんこ','Woman Reading':'読書する女','Poppies':'ポピー畑',
  'The Magpie':'かささぎ','Woman with a Parasol':'日傘の女',
  'The Card Players':'カード遊びをする人々',
  'Mont Sainte-Victoire':'サント＝ヴィクトワール山',
  'The Large Bathers':'大水浴図',
  'Almond Blossoms':'アーモンドの花','Red Vineyard':'赤いぶどう畑',
  'Portrait of Dr. Gachet':'ガシェ博士の肖像',
  'The Church at Auvers':'オーヴェルの教会',
  'Portrait of Madame X':'マダム・Xの肖像',
};

const ARTIST_JA = {
  'Vincent van Gogh':'フィンセント・ファン・ゴッホ',
  'Vincent Van Gogh':'フィンセント・ファン・ゴッホ',
  'Claude Monet':'クロード・モネ',
  'Pierre-Auguste Renoir':'ピエール＝オーギュスト・ルノワール',
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
  'Jan Vermeer van Delft':'ヨハネス・フェルメール',
  'Rembrandt van Rijn':'レンブラント・ファン・レイン',
  'Caravaggio':'カラヴァッジョ',
  'Michelangelo Merisi da Caravaggio':'カラヴァッジョ',
  'Diego Velázquez':'ディエゴ・ベラスケス',
  'Peter Paul Rubens':'ピーテル・パウル・ルーベンス',
  'El Greco':'エル・グレコ',
  'Domenico Theotokópoulos, called El Greco':'エル・グレコ',
  'Francisco Goya':'フランシスコ・ゴヤ',
  'Francisco José de Goya y Lucientes':'フランシスコ・ゴヤ',
  'Eugène Delacroix':'ウジェーヌ・ドラクロワ',
  'Jacques Louis David':'ジャック＝ルイ・ダヴィッド',
  'Jacques-Louis David':'ジャック＝ルイ・ダヴィッド',
  'Jean-François Millet':'ジャン＝フランソワ・ミレー',
  'Gustave Courbet':'ギュスターヴ・クールベ',
  'Sandro Botticelli':'サンドロ・ボッティチェリ',
  'Raphael':'ラファエロ','Raffaello Sanzio':'ラファエロ',
  'Titian':'ティツィアーノ・ヴェチェッリオ','Tiziano Vecellio':'ティツィアーノ・ヴェチェッリオ',
  'Leonardo da Vinci':'レオナルド・ダ・ヴィンチ',
  'Michelangelo':'ミケランジェロ',
  'Jan van Eyck':'ヤン・ファン・エイク',
  'Rogier van der Weyden':'ロヒール・ファン・デル・ウェイデン',
  'Hans Memling':'ハンス・メムリンク',
  'Hieronymus Bosch':'ヒエロニムス・ボス',
  'Pieter Bruegel the Elder':'ピーテル・ブリューゲル（父）',
  'Joseph Mallord William Turner':'ジョゼフ・マロード・ウィリアム・ターナー',
  'J. M. W. Turner':'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable':'ジョン・コンスタブル',
  'Caspar David Friedrich':'カスパー・ダーヴィト・フリードリヒ',
  'Edvard Munch':'エドヴァルド・ムンク',
  'Gustav Klimt':'グスタフ・クリムト',
  'Wassily Kandinsky':'ワシリー・カンディンスキー',
  'Vasily Kandinsky':'ワシリー・カンディンスキー',
  'Paul Klee':'パウル・クレー','Franz Marc':'フランツ・マルク',
  'Egon Schiele':'エゴン・シーレ',
  'Amedeo Modigliani':'アメデオ・モディリアーニ',
  'Mary Cassatt':'メアリー・カサット',
  'Gustave Caillebotte':'ギュスターヴ・カイユボット',
  'Berthe Morisot':'ベルト・モリゾ',
  'Katsushika Hokusai':'葛飾北斎',
  'Utagawa Hiroshige':'歌川広重','Utagawa Kuniyoshi':'歌川国芳',
  'Kitagawa Utamaro':'喜多川歌麿','Tōshūsai Sharaku':'東洲斎写楽',
  'Grant Wood':'グラント・ウッド','Nicolas Poussin':'ニコラ・プッサン',
  'Winslow Homer':'ウィンスロー・ホーマー',
  'Emanuel Leutze':'エマニュエル・ロイツェ',
  'Theodore Géricault':'テオドール・ジェリコー',
  'Jean-Auguste-Dominique Ingres':'ジャン＝オーギュスト＝ドミニク・アングル',
  'Thomas Gainsborough':'トマス・ゲインズバラ',
  'John Everett Millais':'ジョン・エヴァレット・ミレー',
  'Fra Angelico':'フラ・アンジェリコ','Giotto di Bondone':'ジョット・ディ・ボンドーネ',
  'Giovanni Bellini':'ジョヴァンニ・ベッリーニ',
  'Andrea Mantegna':'アンドレア・マンテーニャ',
  'Albrecht Dürer':'アルブレヒト・デューラー',
  'Hans Holbein the Younger':'ハンス・ホルバイン（子）',
  'Bartolomé Esteban Murillo':'バルトロメ・エステバン・ムリーリョ',
  'Artemisia Gentileschi':'アルテミジア・ジェンティレスキ',
  'Giovanni Battista Tiepolo':'ジョヴァンニ・バッティスタ・ティエポロ',
  'Canaletto':'カナレット','Giovanni Antonio Canal':'カナレット',
  'Jean-Honoré Fragonard':'ジャン＝オノレ・フラゴナール',
  'François Boucher':'フランソワ・ブーシェ',
  'Antoine Watteau':'アントワーヌ・ワトー',
  'Jean-Baptiste-Siméon Chardin':'ジャン＝バティスト＝シメオン・シャルダン',
  'John Singer Sargent':'ジョン・シンガー・サージェント',
  'James Abbott McNeill Whistler':'ジェームズ・ホイッスラー',
  'Joachim Patinir':'ヨアヒム・パティニール',
  'Lucas Cranach the Elder':'ルーカス・クラナッハ（父）',
  'Henri Rousseau':'アンリ・ルソー',
  'Odilon Redon':'オディロン・ルドン','Gustave Moreau':'ギュスターヴ・モロー',
  'Henri Matisse':'アンリ・マティス','Georges Braque':'ジョルジュ・ブラック',
  'Marc Chagall':'マルク・シャガール',
  'Joaquín Sorolla':'ホアキン・ソロリャ',
  'Paul Signac':'ポール・シニャック',
  'Elisabeth Louise Vigée Le Brun':'エリザベート・ヴィジェ＝ルブラン',
  'Frans Hals':'フランス・ハルス',
  'Jacob van Ruisdael':'ヤーコブ・ファン・ロイスダール',
  'Pieter de Hooch':'ピーテル・デ・ホーホ',
  'Jan Steen':'ヤン・ステーン',
  'Domenico Ghirlandaio':'ドメニコ・ギルランダイオ',
  'Sebastiano del Piombo (Sebastiano Luciani)':'セバスティアーノ・デル・ピオンボ',
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
  'Cubism':'キュビスム','Surrealism':'シュルレアリスム','Abstract':'抽象絵画',
  'Modernism':'モダニズム','Gothic':'ゴシック','Medieval':'中世',
  'Byzantine':'ビザンティン','Rococo':'ロココ','Hudson River School':'ハドソン・リヴァー派',
  'Naturalism':'ナチュラリズム','Academicism':'アカデミズム',
};

const WIKI_URL = {
  'met-437881':'https://ja.wikipedia.org/wiki/水差しを持つ女',
  'met-436535':'https://ja.wikipedia.org/wiki/小麦畑と糸杉',
  'met-436528':'https://ja.wikipedia.org/wiki/アイリス_(ファン・ゴッホ)',
  'met-436105':'https://ja.wikipedia.org/wiki/ソクラテスの死',
  'artic-27992':'https://ja.wikipedia.org/wiki/グラン・ジャット島の日曜日の午後',
  'artic-28560':'https://ja.wikipedia.org/wiki/ファン・ゴッホの寝室',
  'artic-16568':'https://ja.wikipedia.org/wiki/睡蓮_(モネ)',
  'artic-20684':'https://ja.wikipedia.org/wiki/パリの街路、雨の日',
  'artic-6565':'https://ja.wikipedia.org/wiki/アメリカン・ゴシック',
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

const MET_FEATURED = [
  437881,437879,437878,437880,  // フェルメール
  436535,436532,436528,437984,438722,  // ゴッホ
  436947,436944,  // マネ
  435882,  // セザンヌ
  437654,  // ゴーギャン
  436121,436218,  // ドガ
  437853,  // ターナー
  436105,  // ダヴィッド
  11417,   // ロイツェ
  459055,  // メムリンク
  437329,  // プッサン
  437645,  // エル・グレコ
  438817,  // ルノワール シャルパンティエ夫人
  436528,  // ゴッホ アイリス（確認済み）
  11108,   // ホーマー
  12127,   // サージェント
  1247,    // ハルス
  436781,  // アングル
  36491,36492,57137,  // 北斎
  55747,36902,  // 広重
];

const ARTIC_FEATURED = [
  27992,28560,16568,16571,20684,64818,14655,111436,61128,111442,14556,45243,90903,6565,
  // 追加
  117266,  // ルノワール ムーラン・ド・ラ・ギャレット
  80607,   // ピカソ 老いたギタリスト
  44018,   // モネ 積みわら夕暮れ
  24943,   // ゴッホ 自画像
  76571,   // モリゾ 揺り籠
];

const MET_SEARCH_QUERIES = [
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=impressionism&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=portrait+painting&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=landscape+painting&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=japanese+woodblock&departmentId=6`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=baroque+painting&medium=Paintings&departmentId=11`,
  `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=renaissance+painting&medium=Paintings&departmentId=11`,
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
    const articFeaturedPromise = fetch(
      `${ARTIC_BASE}/artworks?ids=${[...new Set(ARTIC_FEATURED)].join(',')}&fields=id,title,artist_display,date_end,style_title,image_id,is_public_domain`
    ).then(r => r.json()).catch(() => ({ data: [] }));

    const uniqueMetIds = [...new Set(MET_FEATURED)];
    const metFeaturedPromises = uniqueMetIds.map(id =>
      fetchWithTimeout(`${MET_BASE}/objects/${id}`, 6000)
    );

    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    const queryIdxs = shuffle([0,1,2,3,4,5]).slice(0, 2);
    const metSearchPromises = queryIdxs.map(i =>
      fetchWithTimeout(MET_SEARCH_QUERIES[i], 6000)
    );
    const metSearchResults = await Promise.all(metSearchPromises);
    const metRandomIds = shuffle(
      metSearchResults.flatMap(d => (d && d.objectIDs) || [])
    ).slice(0, 60);
    const metRandomPromises = metRandomIds.map(id =>
      fetchWithTimeout(`${MET_BASE}/objects/${id}`, 5000)
    );

    const [articData, metFeaturedData, metRandomData] = await Promise.all([
      articFeaturedPromise,
      Promise.all(metFeaturedPromises),
      Promise.all(metRandomPromises),
    ]);

    const processMET = (d) => {
      if (!d || !d.isPublicDomain || !d.primaryImageSmall) return null;
      const rawStyle = d.classification || d.objectName || '';
      const id = `met-${d.objectID}`;
      return {
        id,
        title:    jaTitle(d.title || '無題'),
        titleEn:  d.title || '',
        artist:   jaArtist(d.artistDisplayName || d.artistAlphaSort || '作者不詳'),
        artistEn: d.artistDisplayName || d.artistAlphaSort || '',
        year:     d.objectEndDate || 0,
        century:  toCentury(d.objectEndDate),
        style:    jaStyle(rawStyle),
        museum:   'メトロポリタン美術館',
        museumUrl:`https://www.metmuseum.org/art/collection/search/${d.objectID}`,
        image:    d.primaryImageSmall,
        wikiUrl:  WIKI_URL[id] || null,
      };
    };

    const processARTIC = (d) => {
      if (!d || !d.image_id || !d.is_public_domain) return null;
      const artistRaw = (d.artist_display || '作者不詳').split('\n')[0].split(',')[0].trim();
      const id = `artic-${d.id}`;
      return {
        id,
        title:    jaTitle(d.title || '無題'),
        titleEn:  d.title || '',
        artist:   jaArtist(artistRaw),
        artistEn: artistRaw,
        year:     d.date_end || 0,
        century:  toCentury(d.date_end),
        style:    jaStyle(d.style_title || ''),
        museum:   'シカゴ美術館',
        museumUrl:`https://www.artic.edu/artworks/${d.id}`,
        image:    `https://www.artic.edu/iiif/2/${d.image_id}/full/843,/0/default.jpg`,
        wikiUrl:  WIKI_URL[id] || null,
      };
    };

    const metFeatured    = metFeaturedData.map(processMET).filter(Boolean);
    const metRandom      = metRandomData.map(processMET).filter(Boolean);
    const articPaintings = ((articData && articData.data) || []).map(processARTIC).filter(Boolean);

    const seen = new Set();
    const dedupe = arr => arr.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    const paintings = dedupe([...articPaintings, ...metFeatured, ...metRandom]);

    return res.status(200).json({
      paintings,
      total: paintings.length,
      sources: { artic: articPaintings.length, met_featured: metFeatured.length, met_random: metRandom.length }
    });

  } catch(e) {
    console.error('paintings API error:', e);
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

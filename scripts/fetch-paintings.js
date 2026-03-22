#!/usr/bin/env node
// fetch-paintings.js  v27
// ARTIC 750件投入（日本美術・非絵画フィルター込み） → 目標500件
// 版権: MET・ARTIC ともにCC0（商用含む完全自由）確認済み

const fs = require('fs');
const path = require('path');
const https = require('https');
const ARTIC = 'https://api.artic.edu/api/v1';
const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';

const WIKI = {
  'artic-27992':'https://ja.wikipedia.org/wiki/グラン・ジャット島の日曜日の午後',
  'artic-28560':'https://ja.wikipedia.org/wiki/ファン・ゴッホの寝室',
  'artic-16568':'https://ja.wikipedia.org/wiki/睡蓮_(モネ)',
  'artic-20684':'https://ja.wikipedia.org/wiki/パリの街路、雨の日',
  'artic-6565':'https://ja.wikipedia.org/wiki/アメリカン・ゴシック',
  'artic-111436':'https://ja.wikipedia.org/wiki/りんごの籠_(セザンヌ)',
  'artic-61128':'https://ja.wikipedia.org/wiki/ムーラン・ルージュにて',
  'artic-14655':'https://ja.wikipedia.org/wiki/二人の姉妹_(ルノワール)',
  'artic-111442':'https://ja.wikipedia.org/wiki/子供の入浴_(カサット)',
  'met-437881':'https://ja.wikipedia.org/wiki/水差しを持つ女',
  'met-436535':'https://ja.wikipedia.org/wiki/小麦畑と糸杉',
  'met-436528':'https://ja.wikipedia.org/wiki/アイリス_(ファン・ゴッホ)',
  'met-436105':'https://ja.wikipedia.org/wiki/ソクラテスの死',
  'met-436282':'https://ja.wikipedia.org/wiki/磔刑と最後の審判_(ファン・エイク)',
  'met-437394':'https://ja.wikipedia.org/wiki/アリストテレスとホメロスの胸像',
  'met-11417':'https://ja.wikipedia.org/wiki/デラウェア川を渡るワシントン',
  'met-435868':'https://ja.wikipedia.org/wiki/カード遊びをする人々',
  'met-436218':'https://ja.wikipedia.org/wiki/踊りの稽古',
  'met-459055':'https://ja.wikipedia.org/wiki/受胎告知_(メムリング)',
  'met-437329':'https://ja.wikipedia.org/wiki/サビーニーの女たちの略奪',
  'met-436947':'https://ja.wikipedia.org/wiki/ボート遊び_(マネ)',
};

const TITLE_JA = {
  'Wheat Field with Cypresses':'小麦畑と糸杉','Irises':'アイリス','Boating':'ボート遊び',
  'A Woman Asleep':'眠る女','Young Woman with a Water Pitcher':'水差しを持つ女',
  'The Death of Socrates':'ソクラテスの死','The Card Players':'カード遊びをする人々',
  'The Dance Class':'踊りの稽古','The Rape of the Sabine Women':'サビーニーの女たちの略奪',
  'Aristotle with a Bust of Homer':'アリストテレスとホメロスの胸像',
  'Washington Crossing the Delaware':'デラウェア川を渡るワシントン',
  'Annunciation':'受胎告知','Madame X (Madame Pierre Gautreau)':'マダムX',
  'Sunflowers':'ひまわり','A Sunday on La Grande Jatte':'グラン・ジャット島の日曜日の午後',
  'Water Lilies':'睡蓮','Paris Street; Rainy Day':'パリの街路、雨の日',
  'American Gothic':'アメリカン・ゴシック','The Basket of Apples':'りんごの籠',
  'At the Moulin Rouge':'ムーラン・ルージュにて','Two Sisters (On the Terrace)':'二人の姉妹',
  "The Child's Bath":'子供の入浴','Olympia':'オランピア','The Fifer':'笛を吹く少年',
  'Haystacks':'干し草の山','Plum Brandy':'プラム・ブランデー',
  'Stoke-by-Nayland':'ストーク・バイ・ネイランド',
  'Woman at Her Toilette':'化粧する女','Woman Reading':'読書する女性',
  'Venice, Palazzo Dario':'ヴェネツィア、パラッツォ・ダリオ',
  'Moulin de la Galette':'ムーラン・ド・ラ・ギャレット',
  'Self-Portrait':'自画像','Portrait of a Lady':'貴婦人の肖像',
  'Portrait of a Man':'男性の肖像','Portrait of a Woman':'女性の肖像',
  'Landscape':'風景画','Still Life':'静物','Flowers in a Vase':'花瓶の花',
  'Madonna and Child':'聖母子','The Holy Family':'聖家族',
  'The Crucifixion':'磔刑','The Adoration of the Magi':'東方三博士の礼拝',
  'Luncheon of the Boating Party':'舟遊びの昼食',
  'Dance at Le Moulin de la Galette':'ムーラン・ド・ラ・ギャレットの舞踏会',
  'The Swing':'ブランコ','By the Seashore':'海辺にて',
  'Woman with a Parasol':'パラソルを持つ女',
  'Young Girls at the Piano':'ピアノを弾く少女たち',
  'Bathers at Asnières':'アニエールの水浴',
  'Banks of the Seine':'セーヌ川の岸辺',
  'Stacks of Wheat (End of Summer)':'干し草の積み重ね（夏の終わり）',
  'On the Bank of the Seine, Bennecourt':'セーヌ河畔、ベンヌクール',
  'The Bedroom':'寝室','Interior':'室内','Reading':'読書',
  'The Gleaners':'落ち穂拾い','The Angelus':'晩鐘',
  'Liberty Leading the People':'民衆を導く自由の女神',
  'The Raft of the Medusa':'メデューズ号の筏',
  'The Fighting Temeraire':'戦艦テメレール号','The Hay Wain':'干し草車',
  'Arrangement in Grey and Black No. 1':'灰色と黒のアレンジメント第1番',
  'Venus and Cupid':'ヴィーナスとキューピッド','Bacchus':'バッカス',
  'The Birth of Venus':'ヴィーナスの誕生','Primavera':'春',
  'Girl with a Pearl Earring':'真珠の耳飾りの少女',
  'The Milkmaid':'牛乳を注ぐ女','Las Meninas':'ラス・メニーナス',
  'Still Life with Flowers':'花の静物画','Still Life with Fruit':'果物の静物画',
  'Autumn Landscape':'秋の風景','Winter Landscape':'冬の風景',
  'River Landscape':'川の風景','The Bridge':'橋',
  'After the Bath':'入浴の後','Woman Bathing':'入浴する女性',
  'The Ballet Class':'バレエの稽古','Dancers in Pink':'ピンクの衣装のダンサーたち',
  'In a Café':'カフェにて','The Absinthe Drinker':'アブサンを飲む人',
  'Saint John the Baptist':'洗礼者ヨハネ','The Three Graces':'三美神',
  'The Death of Marat':'マラーの死','Saturn Devouring His Son':'我が子を食らうサトゥルヌス',
  'Rabbit Warren at Pontoise, Snow':'ポントワーズの雪のウサギ小屋',
};

const ARTIST_JA = {
  'Vincent van Gogh':'フィンセント・ファン・ゴッホ','Claude Monet':'クロード・モネ',
  'Pierre-Auguste Renoir':'ピエール＝オーギュスト・ルノワール','Edgar Degas':'エドガー・ドガ',
  'Édouard Manet':'エドゥアール・マネ','Paul Cézanne':'ポール・セザンヌ',
  'Paul Gauguin':'ポール・ゴーギャン','Georges Seurat':'ジョルジュ・スーラ',
  'Georges-Pierre Seurat':'ジョルジュ・スーラ',
  'Henri de Toulouse-Lautrec':'アンリ・ド・トゥールーズ＝ロートレック',
  'Mary Cassatt':'メアリー・カサット','Berthe Morisot':'ベルト・モリゾ',
  'Camille Pissarro':'カミーユ・ピサロ','Alfred Sisley':'アルフレッド・シスレー',
  'Gustave Caillebotte':'ギュスターヴ・カイユボット',
  'Rembrandt van Rijn':'レンブラント・ファン・レイン','Johannes Vermeer':'ヨハネス・フェルメール',
  'Jan Steen':'ヤン・ステーン','Frans Hals':'フランス・ハルス',
  'Jacob van Ruisdael':'ヤーコブ・ファン・ロイスダール',
  'Peter Paul Rubens':'ピーテル・パウル・ルーベンス','Anthony van Dyck':'アンソニー・ヴァン・ダイク',
  'Jan van Eyck':'ヤン・ファン・エイク','Hans Memling':'ハンス・メムリング',
  'Hieronymus Bosch':'ヒエロニムス・ボス','Pieter Bruegel the Elder':'ピーテル・ブリューゲル（父）',
  'Leonardo da Vinci':'レオナルド・ダ・ヴィンチ','Raphael':'ラファエロ',
  'Sandro Botticelli':'サンドロ・ボッティチェッリ',
  'Titian':'ティツィアーノ','Tintoretto':'ティントレット','Paolo Veronese':'パオロ・ヴェロネーゼ',
  'Caravaggio':'カラヴァッジョ','Artemisia Gentileschi':'アルテミジア・ジェンティレスキ',
  'Francisco Goya':'フランシスコ・ゴヤ','Diego Velázquez':'ディエゴ・ベラスケス',
  'El Greco':'エル・グレコ','Bartolomé Esteban Murillo':'バルトロメ・エステバン・ムリーリョ',
  'Jacques-Louis David':'ジャック＝ルイ・ダヴィッド',
  'Eugène Delacroix':'ウジェーヌ・ドラクロワ',
  'Jean-Auguste-Dominique Ingres':'ジャン＝オーギュスト＝ドミニク・アングル',
  'Théodore Géricault':'テオドール・ジェリコー',
  'Jean-Baptiste-Camille Corot':'ジャン＝バティスト＝カミーユ・コロー',
  'Gustave Courbet':'ギュスターヴ・クールベ','Jean-François Millet':'ジャン＝フランソワ・ミレー',
  'William Turner':'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable':'ジョン・コンスタブル','Thomas Gainsborough':'トマス・ゲインズバラ',
  'John Singer Sargent':'ジョン・シンガー・サージェント',
  'Winslow Homer':'ウィンスロー・ホーマー','Thomas Eakins':'トマス・エイキンズ',
  'Emanuel Leutze':'エマニュエル・ロイツェ','Thomas Cole':'トマス・コール',
  'Frederic Edwin Church':'フレデリック・エドウィン・チャーチ',
  'Albert Bierstadt':'アルバート・ビアスタット',
  'James McNeill Whistler':'ジェームズ・マクニール・ホイッスラー',
  'Nicolas Poussin':'ニコラ・プッサン','Claude Lorrain':'クロード・ロラン',
  'Giovanni Battista Tiepolo':'ジョヴァンニ・バッティスタ・ティエポロ','Canaletto':'カナレット',
};

// 絵画以外を除外するキーワード（タイトルに含まれていたら除外）
const NON_PAINTING_KEYWORDS = [
  // 器・陶器類
  'cup','vase','bowl','vessel','plate','jar','urn','jug','pitcher','flask',
  'ewer','bottle','cup','basin','censer','incense','teapot',
  'celadon','porcelain','ceramic','glaze','stoneware','earthenware',
  'skyphos','kylix','amphora','krater','lekythos','oinochoe','pyxis',
  // 立体作品
  'bust','statue','figurine','statuette','relief','sculpture','carving',
  'mask','helmet','armor','sword','dagger','coin','medal','medallion',
  // テキスタイル
  'textile','tapestry','embroidery','lace','fabric','weaving',
  // 版画・印刷物
  'print','woodblock','etching','engraving','lithograph','photograph','daguerreotype',
  'from views','from twelve','months of flowers','title page',
  // 建築・風景版画（絵画でないもの）
  'view of the villa','view of the remains','view of the grand',
  'from views of rome','from views of',
];

// タイトルが非絵画かチェック（部分一致）
function isNonPaintingTitle(title) {
  if (!title) return false;
  var t = title.toLowerCase();
  for (var i = 0; i < NON_PAINTING_KEYWORDS.length; i++) {
    if (t.includes(NON_PAINTING_KEYWORDS[i])) return true;
  }
  return false;
}

// ARTIC 固定ID（バッチ1〜5: 349件 + バッチ6〜9: 新規400件 = 合計749件）
const ARTIC_IDS = [
  // バッチ1〜5（既存349件）
  22,4758,161,7988,9018,9637,9024,11723,14591,14245,14630,14664,16568,20530,21843,25099,24880,25108,25105,25102,25113,25110,25129,25117,25115,26607,26561,28096,26720,28283,30629,30368,30899,34231,32276,37900,36504,43244,41375,39920,46230,47580,47141,48121,48064,48151,50116,48164,54415,52983,
  54418,55718,54424,61910,57703,55721,62181,61921,64507,62808,64936,64520,68433,67428,75557,70593,79021,76890,79763,81555,81235,83613,84092,87088,91610,90443,92194,92195,92196,92197,92199,92198,94131,95654,103309,99512,113794,112100,109413,116525,116448,117266,117059,116873,117491,121415,121412,121408,125547,121416,
  127982,127981,127984,127983,127987,127986,127990,127989,127988,130724,127991,131466,130725,133852,131827,137125,137054,140604,137226,145243,141111,146861,145876,147604,154238,154237,158412,160197,158483,160222,190628,186418,190640,190629,196410,195381,200149,200003,201820,201819,217155,221647,229377,228882,229950,236623,236545,237995,237997,237996,
  229343,154496,111377,93811,93809,199002,180545,126981,198809,185162,181719,74967,72801,36300,5375,119084,230193,120275,111629,61146,61141,61139,52283,43774,656,239462,208143,188629,90589,86812,75101,37716,148112,148111,28869,15468,12000,879,228827,223896,111659,104094,104031,45356,16622,28560,229406,229371,229363,229351,
  180498,80062,45369,45363,217536,121186,111628,88793,43771,20684,135128,135127,64339,38919,212983,153194,25825,192603,159136,141835,66039,20522,5357,5353,28024,184362,155999,81558,45404,34116,21907,561,512,212474,212252,210442,209437,209425,111634,21727,203128,146696,146683,146694,146693,146688,146685,55905,146692,146691,
  43060,28961,244180,158472,73216,234003,193067,185357,185180,185001,22525,187050,42802,42185,32295,221842,221135,195401,193023,21366,251697,250596,221143,151323,25655,257404,190500,158431,117317,208272,176,173,162,158,155,283,254,182872,96051,87650,10006,9961,9949,5618,4183,252541,251894,204511,204509,198126,196669,184498,82410,46271,9696,242485,234433,230687,154124,86930,64599,50735,21038,50745,50743,113098,81574,81572,50766,50747,2848,115974,111478,56905,14523,182504,158382,50768,3551,149537,113084,84088,20101,14318,14309,147853,14317,113080,113076,50756,14511,14506,14498,14493,14313,113074,113078,113070,112165,50764,
  // バッチ6〜9（新規400件 page20〜40）
  80482,79796,79537,78972,78969,7957,2104,2102,96747,96746,92869,92868,30590,24631,22248,14696,9756,8619,189775,152180,105700,94608,58293,32724,31232,17261,230189,91097,183073,124818,91406,20278,18843,249190,228313,91433,61128,25743,234463,144521,249142,249141,127874,121738,120299,12985,487,221975,254363,215735,
  152849,147005,145677,99366,31955,26882,12830,12284,140647,130676,101031,79720,76816,57051,24548,4102,260424,5860,249100,248929,182173,158422,88985,15073,249113,249095,149052,39170,249138,39143,249140,249139,249125,249114,215558,71294,48983,249124,249123,249116,249115,215555,103918,71279,47661,179719,37104,249076,249075,249073,
  249071,74514,47947,249085,249083,249080,249079,249088,249084,249070,250775,250774,250773,249108,249106,249081,249078,250772,250771,249089,249087,249086,249082,249077,249074,249072,94133,236371,150059,91893,91376,30947,12829,229015,158608,111030,111436,109458,102080,55887,257989,186659,184108,105800,84553,65202,18754,189597,135681,
  94841,74646,18751,835,261733,261731,261730,261729,261728,261727,261726,261725,261724,261723,261722,261721,261720,261719,261718,261717,261716,261715,261714,261713,261712,261711,261710,261709,261708,261707,261706,261705,261704,261703,261702,261701,261700,261699,261698,261697,261696,261695,261694,261693,261692,261691,261690,261689,261688,261687,
  261686,261685,261684,261683,261682,261681,261680,261679,261678,261677,261676,261675,261674,261673,261672,261671,261670,261669,261668,261667,261666,261665,261664,261663,261662,261661,261660,261659,261658,261657,261656,261655,261654,261653,261652,261651,261650,261649,261648,261647,261646,261645,261644,261643,261642,261641,261640,261639,261638,261637,

  // バッチ10 (page41〜60 新規200件)
  160229,181478,185775,216794,250450,250453,250451,262117,265263,212830,129513,117310,2949,67012,67010,66996,66994,66985,66983,66980,66976,66973,66971,66969,67007,77063,274883,54793,248769,110663,20891,19109,23443,22553,23905,23868,24001,23941,25093,24393,88904,25761,110739,89685,88999,13690,13671,22938,22823,88295,
  47519,36111,81083,77331,77328,81212,81185,81469,81216,130581,13192,150278,42068,197413,64447,13948,88612,90446,182994,76868,52244,11238,11223,11222,80175,12947,49000,257616,257677,257600,257561,130764,130756,257471,241788,130754,20016,20801,269865,279901,278674,269866,280905,279903,282836,281985,282838,282837,282843,282842,
  282840,143474,143473,143476,143475,106557,64489,70551,74507,40616,47188,109228,49708,107939,93779,28881,59435,143469,143470,143471,143472,44610,143468,48657,106245,250533,275637,36730,36590,106240,36172,106243,36487,36860,10482,274552,149385,59097,106239,49197,131901,60426,16156,16159,131900,262319,43081,254135,108853,74699,
  251175,106210,106209,275847,252362,275845,275843,275841,275839,275837,275835,275833,275831,275829,275827,252357,252356,252359,252358,36485,60543,106207,60497,74706,110648,74697,85665,85659,106205,110648,106203,60503,72992,60447,106204,60503,60499,60449,252354,252353,36480,252352,252351,36470,252350,252349,252348,252347,252346,252345,
  // バッチ11（oil on canvas/panel検索で確認済み絵画のみ）
  152437,144467,181460,191183,196282,185185,182381,183293,64001,27281,2156,11,863,27992,9,109819,9021,898,60294,884,8991,64476,883,14655,69780,149778,874,111442,80084,16571,94840,109780,64818,862,27980,87479,14620,14598,19333,29392,122130,100476,154235,869,110661,60755,47578,16487,876,81537,
  100351,59847,14624,6005,144969,895,87643,25865,64996,5848,14572,84709,14586,51130,39560,79349,16564,138,889,15708,19336,4796,28862,25812,20579,154121,81535,16549,81539,109314,191564,44739,116101,4783,16554,81533,103139,8980,44017,57996,20545,44742,111656,65811,16499,65916,14556,193664,16584,15705,
  27949,97933,8969,16544,62042,59002,15401,4887,44892,133859,27984,20701,95183,877,885,64957,13487,81557,81545,111318,14574,20535,663,110782,62460,71573,4749,2166,146701,160030,62371,86998,16617,117700,65925,65920,65930,66042,4575,24684,111617,53495,20199,95998,886,497,16347,61616,8953,110507,
  110673,100350,887,23972,100342,111649,27764,110242,16327,184371,897,119264,21682,864,43211,27310,16362,22857,893,81503,109435,65891,111404,111447,16380,16377,22880,111450,16500,97937,111448,16484,65875,16340,111441,81467,16621,111407,64969,80082,4586,107114,60292,60296,60290,16610,16613,107106,107110,107112,
  // バッチ12（oil on canvas検索page4-8 確認済み追加100件）
  896,64920,95654,867,81512,153799,16551,28849,65509,18951,16398,14561,57051,64724,87467,111317,21934,873,512,44018,65821,14591,14650,76571,100191,81505,57048,93394,81551,81546,75507,111559,59927,45240,97910,81566,27307,14634,5349,110541,96559,100352,84076,879,111620,21907,14647,14630,111059,16600,
  26650,68792,16622,5304,8987,80499,64489,51577,890,25832,109926,120172,67362,109938,100829,16560,16488,16629,11434,111623,27138,59798,153798,891,4758,72801,110867,20530,65845,44816,16579,109220,111428,81552,17161,27987,87515,110663,88632,81548,39542,111736,222002,81540,45829,57050,16633,64729,2179,16542,
];

const MET_DEPT_IDS = [11,14];

function fetchJson(url,ms){if(!ms)ms=10000;return new Promise(function(resolve){var t=setTimeout(function(){resolve(null);},ms);var req=https.get(url,{headers:{'User-Agent':'meiga-bot/27.0'}},function(res){if(res.statusCode!==200){clearTimeout(t);res.resume();resolve(null);return;}var body='';res.on('data',function(d){body+=d;});res.on('end',function(){clearTimeout(t);try{resolve(JSON.parse(body));}catch(e){resolve(null);}});res.on('error',function(){clearTimeout(t);resolve(null);});});req.on('error',function(){clearTimeout(t);resolve(null);});});}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function shuffle(a){return a.slice().sort(function(){return Math.random()-0.5;});}
function jt(en){return TITLE_JA[en]||en;}
function ja(en){if(!en)return'作者不詳';if(ARTIST_JA[en])return ARTIST_JA[en];var s=en.replace(/\s*\([^)]*\)/g,'').trim();return ARTIST_JA[s]||s||'作者不詳';}
function cy(y){if(!y||y<=0)return'不明';if(y<=1700)return'〜17世紀';if(y<=1900)return'18〜19世紀';return'20世紀';}

// isNonPainting → isNonPaintingTitle に統合済み

function toMET(d){
  if(!d||!d.isPublicDomain||!d.primaryImageSmall||!d.objectID)return null;
  if(isNonPaintingTitle(d.title))return null;
  // classificationが明示的にPaintingsでない場合はmediumチェック
  var cls=(d.classification||'').toLowerCase();
  if(cls && cls!=='paintings' && !isMediumOk(d.medium))return null;
  // classificationがPaintingsでも素材が明らかに非絵画なら除外
  if(cls && cls!=='paintings' && cls!=='') {
    var nonPaintingCls=['stone','metal','textile','ceramics','arms and armor','glass','jewelry','musical instruments','costume accessories'];
    for(var i=0;i<nonPaintingCls.length;i++){if(cls.includes(nonPaintingCls[i]))return null;}
  }var id='met-'+d.objectID;return{id:id,title:jt(d.title||'無題'),artist:ja(d.artistDisplayName||d.artistAlphaSort||''),year:d.objectEndDate||0,century:cy(d.objectEndDate),museum:'メトロポリタン美術館',museumUrl:'https://www.metmuseum.org/art/collection/search/'+d.objectID,image:d.primaryImageSmall,wikiUrl:WIKI[id]||null};}
// 絵画素材キーワード
var PAINTING_MEDIA=['oil','watercolor','tempera','acrylic','gouache','fresco','encaustic','pastel','distemper','casein','enamel on','paint'];
// 絵画には絶対使わない素材（実データで確認済み）
// NG: wood/gold/ivory は「oil on wood panel」「gold leaf on panel」に含まれるので除外不可
var NON_PAINTING_MEDIA=[
  // 写真・版画
  'photograph','gelatin','albumen','collotype','daguerreotype',
  'lithograph','etching','engraving','woodblock','woodcut','drypoint',
  'aquatint','mezzotint','screenprint',
  // 金属工芸
  'bronze','iron','steel','copper alloy','silver alloy','gilt copper',
  'fritware','stoneware','earthenware','faience','majolica',
  // ガラス・石
  'blown glass','molded glass','rock crystal','marble','granite','limestone',
  // テキスタイル（linen/silk単体は絵画の支持体にも使う → 「on linen」「on silk」なら除外しない）
  'tapestry','embroidery','needlework','woven',
  // バッチ13（oil on canvas/panel検索 確認済み追加200件）
  59784,81516,49651,51541,111730,110776,210893,27943,100489,94127,105887,53064,65937,93780,44829,150054,71191,97909,90333,36525,111418,10550,53213,70118,105600,44775,5502,159770,72180,156072,160031,16367,45267,110879,243872,27962,105604,87531,111746,2823,76212,102227,151108,64979,13745,111637,78591,11312,58984,88374,
  110798,131884,100061,12888,15279,105462,2158,154495,61642,18743,95993,97884,12658,55621,50306,24315,117477,79586,110871,33212,20534,44826,46092,75974,81521,110561,71971,53061,59779,131407,22194,4896,111062,40549,160032,159722,31285,90024,31173,28857,19200,4092,75393,121628,81507,16490,72864,8097,19339,60812,
  110872,15486,81519,64007,59858,55380,81562,5288,69003,49702,64754,51582,20597,39954,16494,198905,146272,72398,49422,139907,97890,79765,16496,97292,59809,69844,64740,217534,28136,156596,53067,69538,111632,4791,29395,79037,153797,120104,16376,27309,111657,86298,16648,81522,27163,16394,145808,93783,209942,235046,
  15714,72375,24674,57854,111646,186425,60809,27170,96621,44831,60812,97903,64490,81528,111662,81508,85694,85674,81531,11301,64483,97388,16634,64745,105467,93791,71944,22186,53070,15394,111061,15393,15391,10553,186379,97895,64730,16644,16640,72862,186391,15719,8093,64975,16370,8089,81561,
  // 有名作家追加バッチ（ARTIC 全件medium確認済み）
  14561,65811,80336,109418,101509,27943,19339,60812,16496,34461,44826,44829,40549,44775,99366,79720,
];

function isMediumOk(medium) {
  // ポジティブフィルター: 絵具素材が含まれているものだけ通す
  if(!medium) return false;
  var m = medium.toLowerCase();
  var OK=['oil on','oil and ','oil paint','watercolor','water color','gouache',
    'tempera','fresco','secco','acrylic','pastel','encaustic','distemper',
    'casein','paint on','painted on','painted in','ink on','brush and ink'];
  for(var i=0;i<OK.length;i++){if(m.includes(OK[i]))return true;}
  return false;
}

function toARTIC(d){
  if(!d||!d.is_public_domain||!d.image_id||!d.id)return null;
  if(isNonPaintingTitle(d.title))return null;
  if(!isMediumOk(d.medium_display))return null;
  // 確認済み非絵画IDをブラックリスト除外
  var BLACKLIST=[30629,46230,117059,116873,46271,31955,36730,36590,36172,36487,36860,10482,36485,11223,11222,49197];
  if(BLACKLIST.indexOf(d.id)>=0)return null;
  var ar=(d.artist_display||'').split('\n')[0].replace(/\s*\([^)]*\)/g,'').split(',')[0].trim();
  // 日本美術を除外
  var jaNames=['Hokusai','Hiroshige','Utamaro','Kuniyoshi','Kunisada','Toyokuni','Harunobu','Kiyonaga','Sharaku','Yoshitoshi','Utagawa','Kitagawa'];
  for(var i=0;i<jaNames.length;i++){if(ar.includes(jaNames[i]))return null;}
  var id='artic-'+d.id;
  return{id:id,title:jt(d.title||'無題'),artist:ja(ar),year:d.date_end||0,century:cy(d.date_end),museum:'シカゴ美術館',museumUrl:'https://www.artic.edu/artworks/'+d.id,image:'https://www.artic.edu/iiif/2/'+d.image_id+'/full/843,/0/default.jpg',wikiUrl:WIKI[id]||null};
}

async function main(){
  console.log('=== fetch-paintings.js v27 ===');
  var flds='id,title,artist_display,date_end,image_id,is_public_domain,medium_display';
  var artic=[];
  var uniqueIds=[...new Set(ARTIC_IDS)];
  console.log('[ARTIC] ユニークID: '+uniqueIds.length+'件');
  for(var a=0;a<uniqueIds.length;a+=50){
    var ids=uniqueIds.slice(a,a+50);
    var r=await fetchJson(ARTIC+'/artworks?ids='+ids.join(',')+'&fields='+flds+'&limit=50',15000);
    var v=((r&&r.data)||[]).map(toARTIC).filter(Boolean);
    artic=artic.concat(v);
    console.log('[ARTIC] バッチ'+(Math.floor(a/50)+1)+': '+v.length+'件 累計:'+artic.length);
  }
  console.log('[ARTIC] 合計: '+artic.length+'件');

  // MET有名作家固定ID（確認済み: pd=true, 画像あり）
  var MET_FAMOUS=[435876,435877,435878,435879,435880,437879,437878];
  var metFamousData=await Promise.all(MET_FAMOUS.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  var metFamous=metFamousData.map(toMET).filter(Boolean);
  console.log('[MET Famous] '+metFamous.length+'件');
  met=met.concat(metFamous);

  var dr=await Promise.all(MET_DEPT_IDS.map(function(id){return fetchJson(MET+'/objects?departmentIds='+id,30000);}));
  var mids=Array.from(new Set(dr.reduce(function(acc,r){return acc.concat((r&&r.objectIDs)||[]);},[])));
  var picked=shuffle(mids).slice(0,25);
  var mr=await Promise.all(picked.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  var met=mr.map(toMET).filter(Boolean);
  console.log('[MET] '+met.length+'件');

  var seen=new Set();
  var all=artic.concat(met).filter(function(p){if(seen.has(p.id))return false;seen.add(p.id);return true;});
  console.log('=== 合計: '+all.length+'件 ===');

  var od=path.join(__dirname,'..','public');
  if(!fs.existsSync(od))fs.mkdirSync(od,{recursive:true});
  var op=path.join(od,'paintings.json');
  fs.writeFileSync(op,JSON.stringify({generated:new Date().toISOString(),total:all.length,sources:{artic:artic.length,met:met.length},paintings:all},null,2),'utf8');
  console.log('OK '+op+' ('+(fs.statSync(op).size/1024).toFixed(1)+' KB)');
}
main().catch(function(e){console.error(e);process.exit(1);});

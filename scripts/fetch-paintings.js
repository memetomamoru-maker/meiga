#!/usr/bin/env node
// fetch-paintings.js  v35
// Cleveland Museum of Art API追加（APIキー不要・CC0）
// ARTIC 750件投入（日本美術・非絵画フィルター込み） → 目標500件
// 版権: MET・ARTIC ともにCC0（商用含む完全自由）確認済み

const fs = require('fs');
const path = require('path');
const https = require('https');
const ARTIC = 'https://api.artic.edu/api/v1';
const CMA   = 'https://openaccess-api.clevelandart.org/api/artworks';
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
  'View of an Italian Villa and Gardens (the Belvedere of the Vatican)':'イタリアの別荘と庭園（バチカンのベルヴェデーレ）',
  'View of the Grotta di Palazzo with Banquet':'グロッタ・ディ・パラッツォの宴会',
  'Portrait of Cardinal Zelada':'ゼラーダ枢機卿の肖像',
  'Khosrow and Shirin in a Garden, a Scene from the Khamsa of Nizami':'ニザーミーの「ハムサ」より：庭園のホスローとシーリーン',
  'Sawmill, Outskirts of Paris':'パリ郊外の製材所',
  'Manuscript of Kulliyat (Complete Works) by Sa\'di with Lacquered Cover':'サアディー「全集」の彩飾写本（漆塗り表紙）',
  'Garden Scene':'庭園の情景',
  'Ruler Entertained by Dancers in a Paradise Garden':'天国の庭で踊り子たちに接待される統治者',
  'Roma Antica':'古代ローマ',
  'Water Lily Pond':'睡蓮の池',
  'Near the Lake':'湖のほとり',
  'Page from a Manuscript of Kulliyat (Complete Works) by Sa\'di':'サアディー「全集」写本の一頁',
  'Divan of Hafiz':'ハーフィズの詩集',
  'Mussooree and the Dhoon from Landour':'ランドールからのムスーリーとドゥーン',
  'Rack Picture for Dr. Nones':'ノーンズ博士のラック絵',
  'For Sunday\'s Dinner':'日曜日の夕食のために',
  'Portrait of Philippe Coypel and His Wife':'フィリップ・コワペルと妻の肖像',
  'The Fates Gathering in the Stars':'星を集める運命の女神たち',
  'Icebound':'氷に閉ざされて',
  'William Bonham':'ウィリアム・ボナムの肖像',
  'J. Ellis Bonham':'J・エリス・ボナムの肖像',
  'Mrs. William Bonham (Ann Warford)':'ウィリアム・ボナム夫人（アン・ウォーフォード）',
  'Madame Léon Clapisson':'レオン・クラピソン夫人',
  'Saint George and the Dragon':'聖ゲオルギウスと龍',
  'Landscape (The Lock)':'風景（水門）',
  'Crèche':'馬小屋（キリスト降誕）',
  'Nathaniel Hurd':'ナサニエル・ハードの肖像',
  'Portrait of Dora Wheeler':'ドーラ・ウィーラーの肖像',
  'Stag at Sharkey\'s':'シャーキーズのボクシング',
  'The Peaceable Kingdom':'平和の王国',
  'Niagara Falls':'ナイアガラの滝',
  'Long Island Farm Houses':'ロングアイランドの農家',
  'Watson and the Shark':'ワトソンとサメ',
  'Valley of the Yosemite':'ヨセミテの谷',
  'The Rocky Mountains, Lander\'s Peak':'ロッキー山脈、ランダーズ・ピーク',
  'Among the Sierra Nevada, California':'シエラネバダ山中、カリフォルニア',
  'Heart of the Andes':'アンデスの心臓部',
  'Twilight in the Wilderness':'荒野の薄暮',
  'Cotopaxi':'コトパクシ火山',
  'Automat':'オートマット',
  'Chop Suey':'チャプスイ',
  'Drug Store':'ドラッグストア',
  'Gas':'ガソリンスタンド',
  'Room in New York':'ニューヨークの部屋',
  'Rooms by the Sea':'海辺の部屋',
  'Second Story Sunlight':'二階の陽光',
  'Eleven A.M.':'午前11時',
  'Morning Sun':'朝の陽光',
  'Cape Cod Morning':'ケープコッドの朝',
  'Cape Cod Evening':'ケープコッドの夕暮れ',
  'Fox Hunt':'キツネ狩り',
  'The Blue Boat':'青い舟',
  'The Berry Pickers':'ベリー摘みの人々',
  'Snap the Whip':'鞭遊び',
  'The Veteran in a New Field':'新しい畑の退役兵士',
  'Prisoners from the Front':'前線の捕虜',
  'The Swimming Hole':'水遊びの穴',
  'The Gross Clinic':'グロス診療所',
  'Between Rounds':'ラウンドの合間',
  'Wrestlers':'レスラーたち',
  'El Jaleo':'エル・ハレオ',
  'The Daughters of Edward Darley Boit':'エドワード・ダーレイ・ボイトの娘たち',
  'Street in Venice':'ヴェネツィアの路地',
  'Venetian Interior':'ヴェネツィアの室内',
  'Fumée d\'Ambre Gris':'アンバーグリスの煙',
  'Oyster Gatherers of Cancale':'カンカルの牡蠣採り',
  'The Hatch Family':'ハッチ家の肖像',
  'Hip, Hip, Hurrah!':'ヒップ、ヒップ、フラー！',
  'The Wyndham Sisters':'ウィンダム姉妹',
  'Lady Agnew of Lochnaw':'ロッホナウのアニュー卿夫人',
  'The Laundress':'洗濯女',
  'The Seamstress':'縫い物をする女',
  'The Lacemaker':'レースを編む女',
  'Mother and Child':'母と子',
  'Sunday Morning':'日曜日の朝',
  'Morning':'朝',
  'Evening':'夕暮れ',
  'Twilight':'薄暮',
  'Bouquet of Flowers':'花束',
  'Poppies':'ポピー',
  'Roses':'バラ',
  'Chrysanthemums':'菊',
  'Lilies':'ユリ',
  'Tulips':'チューリップ',
  'Carnations':'カーネーション',
  'Battle Scene':'戦闘の場面',
  'Naval Battle':'海戦',
  'The Triumph':'凱旋',
  'Allegory of Faith':'信仰の寓意',
  'Allegory of Hope':'希望の寓意',
  'Allegory of Charity':'慈愛の寓意',
  'Allegory of Justice':'正義の寓意',
  'The Holy Family with Saint John':'洗礼者ヨハネを伴う聖家族',
  'The Baptism of Christ':'キリストの洗礼',
  'The Resurrection':'復活',
  'The Entombment':'埋葬',
  'The Lamentation':'哀悼',
  'The Descent from the Cross':'十字架降下',
  'Christ Carrying the Cross':'十字架を担うキリスト',
  'Christ in the Garden':'庭園のキリスト',
  'The Adoration of the Shepherds':'羊飼いの礼拝',
  'Madonna and Child with Saints':'聖人たちとともにある聖母子',
  'The Virgin and Child':'聖母子',
  'The Virgin Mary':'聖母マリア',
  'Saint Peter':'聖ペテロ',
  'Saint Paul':'聖パウロ',
  'Saint Francis of Assisi':'聖フランチェスコ',
  'Saint Sebastian':'聖セバスティアヌス',
  'Saint Jerome':'聖ヒエロニムス',
  'Saint Anthony':'聖アントニウス',
  'Saint Michael':'大天使ミカエル',
  'The Archangel Gabriel':'大天使ガブリエル',
  'Venus and Mars':'ヴィーナスとマルス',
  'Venus and Adonis':'ヴィーナスとアドニス',
  'Diana and Her Nymphs':'ディアナとニンフたち',
  'Diana the Huntress':'狩りの女神ディアナ',
  'Apollo and the Muses':'アポロとミューズたち',
  'Jupiter and Io':'ユピテルとイオ',
  'Leda and the Swan':'レダと白鳥',
  'Danae':'ダナエ',
  'Hercules':'ヘラクレス',
  'Perseus and Andromeda':'ペルセウスとアンドロメダ',
  'Orpheus':'オルフェウス',
  'Narcissus':'ナルキッソス',
  'Europa and the Bull':'エウロパと雄牛',
  'Triumph of Bacchus':'バッカスの凱旋',
  'Nymphs and Satyr':'ニンフとサテュロス',
  'Cupid and Psyche':'キューピッドとプシュケ',
  'Vanitas':'ヴァニタス',
  'The Prodigal Son':'放蕩息子',
  'The Return of the Prodigal Son':'放蕩息子の帰還',
  'The Wedding at Cana':'カナの婚礼',
  'Pietà':'ピエタ',
  'The Last Judgment':'最後の審判',
  'The Coronation of the Virgin':'聖母戴冠',
  'The Assumption of the Virgin':'聖母被昇天',
  'The Grand Canal':'大運河',
  'The Piazza San Marco':'サン・マルコ広場',
  'The Doge\'s Palace':'ドゥカーレ宮殿',
  'The Rialto Bridge':'リアルト橋',
  'The Colosseum':'コロッセウム',
  'The Pantheon':'パンテオン',
  'Market Day':'市場の日',
  'Horse Fair':'馬市',
  'Horses at a Trough':'水槽の馬',
  'Cattle in a Landscape':'風景の中の牛',
  'Dead Game':'狩猟獲物の静物',
  'Still Life with Apples':'リンゴのある静物',
  'Still Life with Roses':'バラのある静物',
  'Still Life with Flowers and Fruit':'花と果物のある静物',
  'Vase of Flowers':'花瓶',
  'The Fisherman':'漁師',
  'The Woodcutter':'木こり',
  'Old Man Reading':'読書する老人',
  'Old Woman Reading':'読書する老婆',
  'Young Woman Reading':'読書する若い女性',
  'Girl Reading':'読書する少女',
  'Boy in a Red Vest':'赤いベストの少年',
  'Girl in White':'白衣の少女',
  'Lady in Blue':'青衣の貴婦人',
  'Man with a Glove':'手袋を持つ男',
  'Man in Armor':'甲冑姿の男',
  'Woman with a Fan':'扇を持つ女性',
  'Woman at a Window':'窓辺の女性',
  'Woman at the Piano':'ピアノを弾く女性',
  'The Concert':'演奏会',
  'The Music Lesson':'音楽の稽古',
  'The Love Letter':'恋文',
  'At the Races':'競馬場にて',
  'At the Café':'カフェにて',
  'At the Theater':'劇場にて',
  'At the Opera':'オペラにて',
  'Children Playing':'遊ぶ子どもたち',
  'Ships in a Storm':'嵐の船',
  'Calm Sea':'凪の海',
  'Fishing Boats':'漁船',
  'After the Hunt':'狩猟の後',
  'The Artist\'s Studio':'画家のアトリエ',
  'Morning in the City':'都市の朝',
  'Max Schmitt in a Single Scull':'シングルスカルのマックス・シュミット',
  'Salutat':'勝利の挨拶',
  'The Thinker: Portrait of Louis N. Kenton':'思索する人：ルイス・N・ケントンの肖像',
  'The Chess Players':'チェスをする人々',
  'A Friendly Call':'親しき訪問',
  'The Morning Walk':'朝の散歩',
  'Idle Hours':'閑暇の時',
  'The Sisters':'姉妹',
  'Sunlight and Shadow':'光と影',
  'Shinnecock Hills':'シネコックの丘',
  'The Croquet Game':'クロッケーの試合',
  'Under the Horsechestnut Tree':'マロニエの木の下で',
  'A Sunny Day at Shinnecock Bay':'シネコック湾の晴れた日',
  'The Hunters in the Snow':'雪の中の狩人',
  'Children\'s Games':'子供の遊戯',
  'The Peasant Wedding':'農民の結婚式',
  'The Land of Cockaigne':'怠け者の楽園',
  'The Fight Between Carnival and Lent':'カーニバルと断食の戦い',
  'The Misanthrope':'人間嫌い',
  'Grey and Silver: Old Battersea Reach':'グレーと銀：バタシーの渡し場',
  'Trouville (Grey and Green, the Silver Sea)':'トルーヴィル（グレーと緑、銀の海）',
  'Figures by a Railing':'手すりのそばの人物たち',
  'Scene from Bohemian Life':'ボヘミアン生活の一場面',
  'Portrait of Dr. William McNeill Whistler':'ウィリアム・マクニール・ホイッスラー博士の肖像',
  'Corte del Paradiso':'コルテ・デル・パラディーゾ',
  'Portrait of Miss Maud Franklin':'モード・フランクリン嬢の肖像',
  'Study for "Arrangement in Grey and Black, No. 2: Portrait of Thomas Carlyle"':'「グレーと黒のアレンジメント第2番：トーマス・カーライルの肖像」習作',
  'The Little Blue Cap':'小さな青い帽子',
  'Violet and Silver—The Deep Sea':'紫と銀——深海',
  'Coast Scene, Bathers':'海岸の情景、水浴する人々',
  'Study of a Girl\'s Head and Shoulders':'少女の頭部と肩の習作',
  'Chelsea Shop':'チェルシーの店',
  'Butterfly':'蝶',
  'Butterfly with Checkered Wings':'格子模様の翅の蝶',
  'Lady Filmer in her Drawing Room':'フィルマー夫人の居間',
  'Orchids':'蘭',
  'Retable and Frontal of the Life of Christ and the Virgin':'キリストと聖母の生涯の祭壇画',
  'Soldiers Discovering the Body of Holofernes':'ホロフェルネスの遺体を発見する兵士たち',
  'Acrobats at the Cirque Fernando (Francisca and Angelina Wartenberg)':'サーカス・フェルナンドの曲芸師（フランシスカとアンジェリナ・ワルテンベルク）',
  'Saint Francis Kneeling in Meditation':'瞑想にひざまずく聖フランチェスコ',
  'The Family Concert':'家族の演奏会',
  'Study for "Arrangement in Black, No. 2: Portrait of Mrs. Louis Huth"':'「黒のアレンジメント第2番：ルイス・ハス夫人の肖像」習作',
  '\'Il Mascherone,\' a Rocaille Fountain on the Grounds of the Villa Borghese':'「イル・マスケローネ」、ボルゲーゼ荘の噴水',
  'On the Terrace of a Hotel in Bordighera: The Painter Jean Martin Reviews His Bill (Illustration for Edmond Renoir\'s "L\'étiquette")':'ボルディゲーラのホテルテラスにて',
  'Landscape with Figures':'人物のいる風景',
  'Landscape with a Village':'村のある風景',
  'Landscape with Cattle':'牛のいる風景',
  'A Wooded Landscape':'森の風景',
  'Woodland Scene':'森の情景',
  'Italian Landscape':'イタリアの風景',
  'Mountain Landscape':'山の風景',
  'Summer Landscape':'夏の風景',
  'Spring Landscape':'春の風景',
  'Coastal Scene':'海岸の情景',
  'Harbor Scene':'港の情景',
  'A Village Scene':'村の情景',
  'Country Road':'田舎道',
  'Old Bridge':'古い橋',
  'Old Mill':'古い水車小屋',
  'The Cathedral':'大聖堂',
  'The Piazzetta':'ピアゼッタ',
  'Venice from the Porch of Madonna della Salute':'マドンナ・デッラ・サルーテの回廊からのヴェネツィア',
  'Capriccio with the Colosseum':'コロッセウムのカプリッチョ',
  'Roman Campagna':'ローマのカンパーニャ',
  'View of Haarlem':'ハーレムの眺望',
  'View from the Window':'窓からの眺め',
  'Thunderstorm over a Rocky Landscape':'岩山の嵐',
  'Snowy Landscape':'雪景色',
  'River Landscape with a View of a Town':'町を望む川の風景',
  'Autumn Landscape with a View of Het Steen in the Early Morning':'早朝のヘット・ステーンを望む秋の風景',
  'Boy with a Flute':'笛を持つ少年',
  'Girl with a Red Hat':'赤い帽子の少女',
  'Lady in White':'白衣の貴婦人',
  'Lady in Red':'赤衣の貴婦人',
  'Woman with Flowers':'花を持つ女性',
  'Woman by a Window':'窓辺の女性',
  'Woman Writing a Letter':'手紙を書く女性',
  'Girl Interrupted at Her Music':'音楽を中断された少女',
  'The Spinner':'糸紡ぎをする女',
  'The Knitter':'編み物をする女',
  'The Cook':'料理人',
  'The Kitchen Maid':'台所の女中',
  'The Blacksmith':'鍛冶屋',
  'The Philosopher':'哲学者',
  'The Alchemist':'錬金術師',
  'The Astronomer':'天文学者',
  'The Geographer':'地理学者',
  'The Schoolmaster':'教師',
  'The Reader':'読書する人',
  'The Letter':'手紙',
  'Portrait of a Young Man':'若い男性の肖像',
  'Portrait of a Young Woman':'若い女性の肖像',
  'Portrait of a Girl':'少女の肖像',
  'Portrait of a Boy':'少年の肖像',
  'Portrait of an Old Man':'老人の肖像',
  'Portrait of a Gentleman':'紳士の肖像',
  'Self-Portrait as a Young Man':'若き日の自画像',
  'Young Man with a Sword':'剣を持つ若い男',
  'At the Beach':'ビーチにて',
  'Boating Party':'舟遊びの一行',
  'Picnic in the Country':'野外ピクニック',
  'Sunday Afternoon':'日曜日の午後',
  'Summer Afternoon':'夏の午後',
  'The Afternoon Tea':'アフタヌーンティー',
  'The Garden Party':'庭園パーティー',
  'Children in the Garden':'庭の子どもたち',
  'The Family':'家族',
  'By the Fireplace':'暖炉のそばで',
  'In the Studio':'スタジオにて',
  'New York Restaurant':'ニューヨークのレストラン',
  'Flowers in a Glass Vase':'ガラス花瓶の花',
  'Peonies':'牡丹',
  'Still Life with Peaches':'桃のある静物',
  'Still Life with Grapes':'ぶどうのある静物',
  'Still Life with a Vase of Flowers':'花瓶のある静物',
  'Game and Fruit':'狩猟獲物と果物',
  'Bread and Wine':'パンとワイン',
  'The Transfiguration':'変容',
  'Saint Catherine of Alexandria':'アレクサンドリアの聖カタリナ',
  'Saint Mary Magdalene':'マグダラの聖マリア',
  'Saint John the Baptist in the Wilderness':'荒野の洗礼者ヨハネ',
  'The Martyrdom of Saint Lawrence':'聖ラウレンティウスの殉教',
  'The Stigmatization of Saint Francis':'聖フランチェスコの聖痕',
  'Noli Me Tangere':'ノリ・メ・タンゲレ',
  'Christ Appears to Mary Magdalene':'キリストとマグダラのマリア',
  'The Finding of Moses':'モーセの発見',
  'Samson and Delilah':'サムソンとデリラ',
  'David and Goliath':'ダビデとゴリアテ',
  'Judith with the Head of Holofernes':'ホロフェルネスの首を持つユディト',
  'Susanna and the Elders':'スザンナと長老たち',
  'Allegory of Time':'時間の寓意',
  'Allegory of Spring':'春の寓意',
  'Allegory of Summer':'夏の寓意',
  'Allegory of Autumn':'秋の寓意',
  'Allegory of Winter':'冬の寓意',
  'The Ages of Man':'人生の諸段階',
  'Father Time':'時の翁',
  'The Siege':'攻城戦',
  'The Lee Shore':'風下の岸',
  'Key West':'キー・ウェスト',
  'A Gust of Wind':'一陣の風',
  'The Haymakers':'干し草刈りの人々',
  'The Harvesters':'刈り入れをする人々',
  'Harvest Time':'収穫の季節',
  'Apple Picking':'リンゴ摘み',
  'The Nooning':'昼休み',
  'The Plough and the Song':'鋤と歌',
  'Boys in a Pasture':'牧場の少年たち',
  'In the Orchard':'果樹園にて',
  'Counting the Cost':'コストを計算する',
  'Hip Hip Hurrah!':'ヒップ、ヒップ、フラー！',
  'Mrs. Knowlton':'ノウルトン夫人',
  'Miss Van Buren':'ミス・ヴァン・ビューレン',
  'Marguerite in a Striped Dress':'縞模様のドレスのマルゲリット',
  'The Open Air Breakfast':'野外の朝食',
  'Lady with a White Shawl':'白いショールの貴婦人',
  'A Summer Squall':'夏のスコール',
  'The Artist\'s Daughters':'画家の娘たち',
  'Near the Beach, Shinnecock':'シネコックのビーチ近く',
  'Rehearsal of the Pasdeloup Orchestra at the Cirque d\'Hiver':'冬のサーカス場でのパドルー楽団のリハーサル',
  'Two Wine Glasses':'二つのワイングラス',
  'Fishing for Oysters at Cancale':'カンカルでの牡蠣漁',
  'The Loggers':'木材伐採人夫',
  'An Old Man and His Grandson':'老人と孫',
  'The Beggars':'乞食たち',
  'Return of the Herd':'群れの帰還',
  'Hay Harvest':'干し草の収穫',
  'The Dark Day':'曇った日',
  'Starting Out After Rail':'レールを追って出発',
  'Pushing for Rail':'手漕ぎ舟でのレール猟',
  'Defiance: Inviting a Shot before Petersburg':'挑発：ピーターズバーグ前での一発',
  'The Biglin Brothers Racing':'ビグリン兄弟のレース',
  'Three Boys in a Dory':'ドーリー船の3人の少年',
  'Taking the Sunbath':'日光浴',
  'Venus':'ヴィーナス',
  'Minerva':'ミネルヴァ',
  'Mercury':'メルクリウス',
  'Neptune':'ネプトゥーヌス',
  'Pan':'牧神パン',
  'Psyche':'プシュケ',
  'Aphrodite':'アフロディーテ',
  'Amor Vincit Omnia':'愛はすべてに勝る',
  'The Nymph of the Spring':'泉のニンフ',
  'Youth and Time':'青春と時間',
  'Memento Mori':'メメント・モリ',
  'The Last Communion of Saint Jerome':'聖ヒエロニムスの最後の聖体拝領',
  'Mercury Instructing Cupid Before Venus':'ヴィーナスの前でキューピッドに教えるメルクリウス',
  'The Rape of the Daughters of Leucippus':'レウキッポスの娘たちの略奪',
  'The Sloop, Nassau':'スループ船、ナッソー',
  'On a Lee Shore':'風下の岸辺',
  'The Breadwinner':'大黒柱',
  'Old Kentucky Home':'古いケンタッキーの家',
  'The Turkey Shoot':'七面鳥の猟',
  'The Dance on the Battery in the Presence of Peter Stuyvesant':'ピーター・スタイフェサント前でのバッテリーのダンス',
  'Ring Toss':'輪投げ',
  'A Good Time Coming':'楽しいことが来る',
  'Blackberrying':'ブラックベリー摘み',
  'The Woodman':'木こり',
  'Over the River':'川を越えて',
  'Hall at Shinnecock':'シネコックのホール',
  'The Social Club':'社交クラブ',
  'The Talkers':'語らう人々',
  'Venetian Women in the Palazzo Rezzonico':'レッツォニコ宮殿のヴェネツィア女性',

  'Study for "Arrangement in Black, No. 2: Portrait of Mrs. Louis Huth" (recto); Study for "Symphony in Flesh Color and Pink: Portrait of Mrs. Frances Leyland" (verso)':'「黒のアレンジメント第2番」習作（表）／「肉色とピンクのシンフォニー」習作（裏）',
  'The Young Emperor Akbar Arrests the Insolent Shah Abu\'l-Maali, Page from a Manuscript of the Akbarnama':'「アクバル・ナーマ」より：若き皇帝アクバルの反逆者捕縛',
  'Chained Prisoners are Brought Before a King, a scene from the Gulistan of Sa\'di':'サアディー「薔薇園」より：王の前に引かれる囚人たち',
  'Judge (Qazi) of Hamadan in a Domed Chamber':'ドーム型の部屋のハマダン判事',
  'The Fountains':'噴水',
  'The Shadow of Death':'死の影',
  'Jesus Mocked by the Soldiers':'兵士にあざけられるキリスト',
  'Ecce Agnus Dei':'見よ、神の子羊',
  'Saint John the Baptist Entering the Wilderness':'荒野に入る洗礼者ヨハネ',
  'Abraham\'s Sacrifice of Isaac':'イサクを献げるアブラハム',
  'Tobias and the Angel':'トビトと天使',
  'Salome with the Head of Saint John the Baptist':'洗礼者ヨハネの首を持つサロメ',
  'Saint Martin and the Beggar':'聖マルタンと乞食',
  'Annunciation to the Shepherds':'羊飼いへの告知',
  'The Nativity':'キリストの降誕',
  'Mater Dolorosa (Sorrowing Virgin)':'悲しみの聖母',
  'The Two Disciples at the Tomb':'墓の前の二人の弟子',
  'The Temptation of Saint Jerome':'聖ヒエロニムスの誘惑',
  'Virgin and Child with the Young Saint John the Baptist':'幼い洗礼者ヨハネとともにある聖母子',
  'The Holy Family with Saints Elizabeth and John the Baptist':'エリザベスと洗礼者ヨハネを伴う聖家族',
  'Tarquin and Lucretia':'タルクィニウスとルクレティア',
  'Armida Encounters the Sleeping Rinaldo':'眠るリナルドに出会うアルミーダ',
  'Virgil Reading the "Aeneid" to Augustus':'アウグストゥスに「アエネーイス」を読み聞かせるウェルギリウス',
  'The Garden of Paradise':'楽園の庭',
  'Hercules and the Lernaean Hydra':'ヘラクレスとレルネーのヒュドラ',
  'Arab Horseman Attacked by a Lion':'ライオンに襲われるアラブの騎手',
  'Wounded Lioness':'傷ついた雌ライオン',
  'Tiger Resting':'休む虎',
  'The Combat of the Giaour and Hassan':'ジャウルとハッサンの格闘',
  'Circassian Cavalry Awaiting their Commanding Officer at the Door of a Byzantine Monument; Memory of the Orient':'ビザンチン建物の前で待つチェルケス騎兵',
  'Bullfight':'闘牛',
  'The Song of the Lark':'ひばりの歌',
  'Pergola with Oranges':'オレンジのパーゴラ',
  'The Sand Pits, Hampstead Heath':'ハムステッド・ヒースの砂の採掘場',
  'View on the Grounds of a Villa near Florence':'フィレンツェ近郊の別荘の庭',
  'Staircase in the Park of Villa Chigi di Ariccia':'アリッチャのキージ荘の公園の階段',
  'Landscape near Chiusi, Tuscany':'トスカーナ、キウージ近郊の風景',
  'Pastoral Landscape with Ruins':'廃墟のある田園風景',
  'The Watermill with the Great Red Roof':'赤い大屋根の水車小屋',
  'Solitude':'孤独',
  'Coming Squall (Nahant Beach with a Summer Shower)':'来たるスコール（夏のにわか雨のナハント海岸）',
  'Les Andelys, Côte d\'Aval':'レ・ザンドリー、コート・ダヴァル',
  'Love of Winter':'冬の愛',
  'Lights of Other Days':'往時の光',
  'The Girl by the Window':'窓辺の少女',
  'The Bewitched Mill':'魅惑の水車小屋',
  'October Day':'十月の日',
  'Beach at Cabasson (Baigne-Cul)':'カバッソンの海岸（バーニュ・キュル）',
  'The Eruption of Vesuvius':'ヴェスヴィオ火山の噴火',
  'Landscape with Saint John on Patmos':'パトモス島の聖ヨハネのいる風景',
  'The Millinery Shop':'帽子屋',
  'The Herring Net':'ニシンの網',
  'Waterloo Bridge, Gray Weather':'ウォータールー橋、曇天',
  'The Poet\'s Garden':'詩人の庭',
  'Sea View, Calm Weather (Vue de mer, temps calme)':'穏やかな海の眺め',
  'The Races at Longchamp':'ロンシャンの競馬',
  'Poppy Field (Giverny)':'ポピー畑（ジヴェルニー）',
  'Branch of the Seine near Giverny (Mist)':'ジヴェルニー近くのセーヌ川の支流（霧）',
  'The Artist\'s House at Argenteuil':'アルジャントゥイユの画家の家',
  'Apples and Grapes':'リンゴとぶどう',
  'Houses of Parliament, London':'ロンドン、国会議事堂',
  'Rocks at Port-Goulphar, Belle-Île':'ベル＝イル島、ポール・グルファールの岩',
  'The Banks of the Epte at Giverny':'ジヴェルニーのエプト川岸',
  'Souvenir of the Environs of Lake Nemi':'ネミ湖周辺の思い出',
  'Chariot Race':'戦車競走',
  'A Peasant Woman Digging in Front of Her Cottage':'小屋の前で掘る農婦',
  'Landscape with Two Poplars':'二本のポプラのある風景',
  'Flower Girl in Holland':'オランダの花売り娘',
  'Landscape at Chailly':'シャイイの風景',
  'Valley of Aosta: Snowstorm, Avalanche, and Thunderstorm':'アオスタの谷：吹雪、雪崩、嵐',
  'Stack of Wheat (Snow Effect, Overcast Day)':'積み藁（雪の効果、曇り日）',
  'The Customs House at Varengeville':'ヴァランジュヴィルの税関',
  'The Departure of the Boats, Étretat':'エトルタ、船の出発',
  'Étretat: The Beach and the Falaise d\'Amont':'エトルタ：ビーチとファレーズ・ダモン',
  'Sandvika, Norway':'サンドヴィカ、ノルウェー',
  'Stacks of Wheat (Sunset, Snow Effect)':'積み藁（夕暮れ、雪の効果）',
  'Stack of Wheat':'積み藁',
  'Waterloo Bridge, Sunlight Effect':'ウォータールー橋、陽光の効果',
  'Charing Cross Bridge, London':'チャリング・クロス橋、ロンドン',
  'The Terrace':'テラス',
  'New England Headlands':'ニューイングランドの岬',
  'Near Newport':'ニューポート近郊',
  'New York Street':'ニューヨークの街',
  'At Mouquin\'s':'ムカン亭にて',
  'Provincetown':'プロビンスタウン',
  'Cabin in the Cotton':'綿畑の小屋',
  'Maine Coast':'メイン海岸',
  'Holiday on the Hudson':'ハドソン川の休日',
  'A Home in the Wilderness':'荒野の我が家',
  'Point Judith, Rhode Island':'ロードアイランド州ジュディス岬',
  'Wood Interior':'森の内部',
  'Study, North Conway, New Hampshire':'習作、ニューハンプシャー州ノース・コンウェイ',
  'An October Day in the White Mountains':'ホワイト・マウンテンの十月の日',
  'Mount Starr King, Yosemite':'スター・キング山、ヨセミテ',
  'Storm in the Mountains':'山の嵐',
  'The Clove - A Storm Scene in the Catskill Mountains':'渓谷——キャッツキル山地の嵐',
  'Approaching Storm from the Alban Hills':'アルバン山地から迫る嵐',
  'Arkville Landscape':'アークヴィルの風景',
  'Durham, Connecticut':'コネチカット州ダーラム',
  'Trees and a Stream on a Hillside':'丘の斜面の木々と小川',
  'Fort George Island, Florida':'フロリダ州ジョージ要塞島',
  'Autumn Landscape and Pool':'秋の風景と池',
  'Forest Stream with Vista':'眺めのある森の流れ',
  'Three Trees: Italy':'三本の木：イタリア',
  'A Clump of Trees':'木立',
  'Autumn River Scene, The Brook':'秋の川の情景、小川',
  'In the Housatonic Valley':'ホウサトニック渓谷にて',
  'Vale of Kashmir':'カシミールの谷',
  'View of a Lake':'湖の眺め',
  'Wild Coast, Newport':'ニューポートの荒々しい海岸',
  'View near Newport':'ニューポート近郊の眺め',
  'Harbor of Boston, with Landing of Troops':'ボストン港、軍隊上陸',
  'Early Morning After a Storm at Sea':'海上の嵐の翌朝',
  'View of the City of Washington in 1807':'1807年のワシントン市の眺め',
  'Approaching Storm':'来たる嵐',
  'Young Clergyman Reading':'読書する若い聖職者',
  'Portrait of a Ladakhi Mountain Goat':'ラダックの山羊の肖像',
  'Toilette of the Law Clerk':'書記官の身支度',
  'Young Woman in Black':'黒衣の若い女性',
  'Mrs. Noah Smith and Family':'ノア・スミス夫人と家族',
  'Madame de Pastoret and Her Son':'パストレ夫人と息子',
  'Amédée-David, the Comte de Pastoret':'アメデー・ダヴィッド、パストレ伯爵',
  'A Mother Feeding her Child (The Happy Mother)':'子に授乳する母（幸せな母）',
  'Francesco de\' Medici':'フランチェスコ・デ・メディチ',
  'Henri Degas and His Niece Lucie Degas (The Artist\'s Uncle and Cousin)':'アンリ・ドガと姪ルシー・ドガ',
  'Madam Pompadour':'ポンパドゥール夫人',
  'Don José Moñino y Redondo, Conde de Floridablanca':'フロリダブランカ伯爵',
  'Portrait of an Artist':'ある芸術家の肖像',
  'The Actor Maximilian Korn in a Landscape':'風景の中の俳優マクシミリアン・コルン',
  'Old Man Attended by Visitors':'訪問者に接する老人',
  'A Mounted Officer':'馬上の将校',
  'Portrait of a Man with Gray Hair':'白髪の男の肖像',
  'Portrait of a Man with a Pink':'カーネーションを持つ男の肖像',
  'Portrait of Lisa Colt Curtis':'リサ・コルト・カーティスの肖像',
  'Elizabeth Beltzhoover Mason':'エリザベス・ベルツフーバー・メイソン',
  'Samuel Williams':'サミュエル・ウィリアムズの肖像',
  'George III':'ジョージ3世の肖像',
  'Jeremiah Belknap':'ジェレマイア・ベルナップの肖像',
  'Charles Apthorp':'チャールズ・アプソープの肖像',
  'Portrait of Jean Terford David':'ジャン・テルフォード・デヴィッドの肖像',
  'Nathaniel Olds':'ナサニエル・オルズの肖像',
  'Anna Dummer Powell':'アナ・ダマー・パウエルの肖像',
  'Lucy':'ルーシーの肖像',
  'Catherine Greene':'キャサリン・グリーンの肖像',
  'Baron FitzGibbon':'フィッツギボン男爵の肖像',
  'Mary Fairlie Cooper':'メアリー・フェアリー・クーパーの肖像',
  'Wilson Cary Nicholas':'ウィルソン・ケアリー・ニコラスの肖像',
  'Portrait of Mary Sicard David':'メアリー・シカール・デヴィッドの肖像',
  'Jeanne Balzac':'ジャンヌ・バルザックの肖像',
  'Portrait of a Woman (Judith Colman Bulfinch?)':'女性の肖像（ジュディス・コルマン・バルフィンチ？）',
  'Portrait of a Woman (Mrs. Ann Hivlyn)':'女性の肖像（アン・ヒヴリン夫人）',
  'Dr. James Stuart; Mary Campbell Stuart':'ジェームズ・スチュアート博士とメアリー・キャンベル・スチュアート',
  'Mary Campbell Stuart':'メアリー・キャンベル・スチュアートの肖像',
  'The Captive Slave (Ira Aldridge)':'囚われた奴隷（アイラ・オールドリッジ）',
  'Old Man with a Gold Chain':'金の鎖を持つ老人',
  'Beggar with Oysters (Philosopher)':'牡蠣を持つ乞食（哲学者）',
  'Beggar with a Duffle Coat (Philosopher)':'ダッフルコートの乞食（哲学者）',
  'Mrs. George Swinton (Elizabeth Ebsworth)':'ジョージ・スウィントン夫人（エリザベス・エブズワース）',
  'Self-Portrait with Five Muses':'五人のミューズとともにある自画像',
  'Milton Dictating to His Daughter':'娘に口述するミルトン',
  'Lady Reading the Letters of Heloise and Abelard':'エロイーズとアベラールの手紙を読む貴婦人',
  'Young Spartan Girls Challenging Boys':'少年に挑む若きスパルタの少女たち',
  'Two Heads of Damned Souls from Dante\'s "Inferno" (recto and verso)':'ダンテ「地獄篇」より呪われた魂の頭部',
  'Heraclitus, the Weeping Philosopher':'泣く哲学者ヘラクレイトス',
  'Friar Pedro Shoots El Maragato as His Horse Rears':'フライ・ペドロ、馬が立ち上がるなかでエル・マラガトを撃つ',
  'Jessica':'ジェシカ',
  'A Holiday':'休日',
  'The Rathskeller':'地下居酒屋',
  'Winding Yarn (Interior of a Nantucket Kitchen)':'糸巻き（ナンタケットの台所）',
  'Young Peasant Having Her Coffee':'コーヒーを飲む若い農婦',
  'Woman and Child at the Well':'井戸のそばの女と子',
  'Woman in a Garden':'庭の女性',
  'Jacques and Berthe Lipchitz':'ジャック・リプシッツとベルト・リプシッツ',
  'A Woman at the Élysée Montmartre (Femme à l\'Élysée Montmartre)':'エリゼ・モンマルトルの女性',
  'Early Morning, Tarpon Springs':'ターポンスプリングスの早朝',
  'Café Singer':'カフェの歌手',
  'A Friendly Warning':'親切な警告',
  'Tight-Rope Walker':'綱渡り師',
  'The Brierwood Pipe':'ブライアーウッドのパイプ',
  'His First Model-Miss Russell':'最初のモデル：ミス・ラッセル',
  'Trompe-l\'Oeil Still Life with a Flower Piece':'花の絵のあるトロンプ・ルイユ静物',
  'Card Rack with a Jack of Hearts':'ハートのジャックのカードラック',
  'A Builder of Boats':'船大工',
  'The Venetian Girl':'ヴェネツィアの少女',
  'The Park-Winter':'公園——冬',
  'Down to the Harbor':'港へ下る',
  'British Manufactory; A Sketch':'英国の工場；スケッチ',
  'On the Beach, No. 3':'浜辺にて、第3番',
  'The Cossack':'コサック',
  'Boy Fishing':'釣りをする少年',
  'The Little Cavalier':'小さな騎士',
  'Circus Horses':'サーカスの馬',
  'Deserted Wharf (The Old Mill at Cos Cob)':'廃れた波止場（コス・コブの古い水車小屋）',
  'On Bos\'n\'s Hill':'ボースンの丘にて',
  'Morning Glory with Black':'黒との朝顔',
  'White Flower':'白い花',
  'Rock at Sea':'海上の岩',
  'Orchid Blossoms':'蘭の花',
  'Wisdom and Destiny':'知恵と運命',
  'The Violin Player':'ヴァイオリン奏者',
  'White Mare':'白い牝馬',
  'Storm Clouds':'嵐の雲',
  'Women Working in a Field':'畑で働く女性たち',
  'Unfinished Study of Sheep':'羊の未完習作',
  'A Marine':'海景',
  'Movement':'動き',
  'Barks Fleeing Before the Storm':'嵐の前に逃げる帆船',
  'Man with Lance Riding through the Snow':'槍を持って雪中を進む男',
  'Mountain Brook':'山の小川',
  'Fish (Still Life)':'魚（静物）',
  'Calf\'s Head and Ox Tongue':'仔牛の頭と牛の舌',
  'Kitchen Still Life':'台所の静物',
  'An Abundance of Fruit':'果物の豊穣',
  'Fruits of the Midi':'南仏の果物',
  'Still Life No. 15':'静物第15番',
  'Landscape: Window Overlooking the Woods':'風景：森を見下ろす窓',
  'Boy on a Ram':'雄羊に乗る少年',
  'Madame Roulin Rocking the Cradle (La berceuse)':'ゆりかごを揺らすルーラン夫人',
  'Jupiter Rebuked by Venus':'ヴィーナスに叱られるユピテル',
  'Time Unveiling Truth':'真実を明かす時間',
  'Allegory of Peace and War':'平和と戦争の寓意',
  'The Last of New England—The Beginning of New Mexico':'ニューイングランドの終わり——ニューメキシコの始まり',
  'The Building of the Dam':'ダムの建設',
  'Fishing Boats with Hucksters Bargaining for Fish':'魚を買い交渉する行商人のいる漁船',
  'Interior of the Oude Kerk, Delft':'デルフト旧教会の内部',
  'Pasture in Normandy':'ノルマンディーの牧草地',
  'The Guardhouse':'衛兵所',
  'Mountain Road with Travelers':'旅人のいる山道',
  'The Road to Market':'市場への道',
  'Three Little Girls':'三人の小さな女の子',
  'On the Road':'道中にて',
  'Job':'ヨブ',
  'A Woman of the Sabines':'サビニュの女',
  'Lake Erie Patterns':'エリー湖の模様',
  'June (recto)':'六月（表）',
  'Rosa Mystica':'神秘の薔薇',
  'The Monastery of San Pedro (Our Lady of the Snows)':'サン・ペドロ修道院（雪の聖母）',
  'July':'七月',
  'Hermes and the Infant Dionysus':'ヘルメスと幼いディオニュソス',
  'Still Life with Grapes and Flowers':'ぶどうと花の静物',
  'Memento Mori, "To This Favour"':'メメント・モリ「この姿に」',
  'The Madonna of Ivory':'象牙の聖母',
  'Head of a Girl':'少女の頭部',
  'Yellow Light':'黄色の光',
  'Head of a Boy':'少年の頭部',
  'The Lone Sentinel':'孤独な歩哨',
  'Graves of Travelers':'旅人の墓',

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

// MET固定ID方式に変更（ランダム取得廃止）

function fetchJson(url,ms){if(!ms)ms=10000;return new Promise(function(resolve){var t=setTimeout(function(){resolve(null);},ms);var req=https.get(url,{headers:{'User-Agent':'meiga-bot/35.0'}},function(res){if(res.statusCode!==200){clearTimeout(t);res.resume();resolve(null);return;}var body='';res.on('data',function(d){body+=d;});res.on('end',function(){clearTimeout(t);try{resolve(JSON.parse(body));}catch(e){resolve(null);}});res.on('error',function(){clearTimeout(t);resolve(null);});});req.on('error',function(){clearTimeout(t);resolve(null);});});}
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
  // classificationがPainting以外の場合のみ素材チェック
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
];


// ── Cleveland Museum of Art（APIキー不要・CC0）──
function toCMA(d) {
  if (!d || !d.id || !d.images || !d.images.web || !d.images.web.url) return null;
  if (isNonPaintingTitle(d.title)) return null;
  var creatorRaw = (d.creators && d.creators[0] && d.creators[0].description) || '';
  var creatorName = creatorRaw.replace(/\s*\([^)]*\)/g, '').split(',')[0].trim();
  var yearNum = d.creation_date_earliest || d.creation_date_latest || 0;
  var id = 'cma-' + d.id;
  return {
    id: id,
    title: jt(d.title || '無題'),
    artist: ja(creatorName) || creatorName || '作者不詳',
    year: yearNum,
    century: cy(yearNum),
    museum: 'クリーブランド美術館',
    museumUrl: d.url || ('https://clevelandart.org/art/' + (d.accession_number || d.id)),
    image: d.images.web.url,
    wikiUrl: null,
  };
}

async function fetchCMA() {
  var results = [];
  var LIMIT = 100;
  var DEPTS = ['European Paintings', 'American Painting and Sculpture'];
  for (var di = 0; di < DEPTS.length; di++) {
    var dept = DEPTS[di];
    for (var skip = 0; skip < 300; skip += LIMIT) {
      var url = CMA + '/?type=Painting&has_image=1&cc0=1&limit=' + LIMIT + '&skip=' + skip + '&department=' + encodeURIComponent(dept);
      var r = await fetchJson(url, 15000);
      if (!r || !r.data || r.data.length === 0) break;
      var items = r.data.map(toCMA).filter(Boolean);
      results = results.concat(items);
      console.log('[CMA] ' + dept + ' skip' + skip + ': ' + items.length + '件 累計:' + results.length);
      await sleep(300);
      if (r.data.length < LIMIT) break;
    }
  }
  console.log('[CMA] 合計: ' + results.length + '件');
  return results;
}

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
  console.log('=== fetch-paintings.js v35 ===');
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

  // ARTIC有名作家を個別に確実取得（バッチで弾かれる対策）
  var ARTIC_FAMOUS=[
    27943,19339,60812,16496,34461,  // ゴーギャン
    81516,81521,81515,81522,111648,4776,  // ミレー
    80530,80526,  // ボッティチェッリ系テンペラ
    90048,  // コール（ニアガラの滝）
  ];
  var articFamousData=await Promise.all(ARTIC_FAMOUS.map(function(id){
    return fetchJson(ARTIC+'/artworks/'+id+'?fields=id,title,artist_display,date_end,image_id,is_public_domain,medium_display',8000)
      .then(function(r){return r&&r.data?r.data:null;});
  }));
  var articFamousFiltered=articFamousData.map(toARTIC).filter(Boolean);
  console.log('[ARTIC Famous] '+articFamousFiltered.length+'件');
  artic=artic.concat(articFamousFiltered);

  // MET有名作家固定ID（確認済み: pd=true, 画像あり）
  var met=[];
  var MET_FAMOUS=[435876,435877,435878,435879,435880,437879,437878];
  var metFamousData=await Promise.all(MET_FAMOUS.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  var metFamous=metFamousData.map(toMET).filter(Boolean);
  console.log('[MET Famous] '+metFamous.length+'件');
  met=met.concat(metFamous);

  // MET追加確認済みID（classification=Paintings または medium確認済み）
  var MET_EXTRA=[
    437394, 436947, 437329, 436218, 459055, 436105, 436282, 11417, 435868, 437881,
    436535, 436528, 438722, 435650, 437133, 436305, 436121, 435869, 437984, 459202,
    436524, 437654, 436803,
  ];
  var metExtraData=await Promise.all(MET_EXTRA.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  met=met.concat(metExtraData.map(toMET).filter(Boolean));
  console.log('[MET] '+met.length+'件');

  var cma = await fetchCMA();
  var seen=new Set();
  var all=artic.concat(met).concat(cma).filter(function(p){if(seen.has(p.id))return false;seen.add(p.id);return true;});
  console.log('=== 合計: '+all.length+'件 (ARTIC:'+artic.length+' MET:'+met.length+' CMA:'+cma.length+') ===');

  var od=path.join(__dirname,'..','public');
  if(!fs.existsSync(od))fs.mkdirSync(od,{recursive:true});
  var op=path.join(od,'paintings.json');
  fs.writeFileSync(op,JSON.stringify({generated:new Date().toISOString(),total:all.length,sources:{artic:artic.length,met:met.length,cma:cma.length},paintings:all},null,2),'utf8');
  console.log('OK '+op+' ('+(fs.statSync(op).size/1024).toFixed(1)+' KB)');
}
main().catch(function(e){console.error(e);process.exit(1);});

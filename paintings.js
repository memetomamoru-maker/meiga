// paintings.js — 名画収集館 作品データベース
// 画像URL: Wikimedia Commons Special:Redirect（公式の外部利用向けエンドポイント）
// 作品を追加するときはこのファイルだけ編集すればOK

const PAINTINGS = [

  // ── Leonardo da Vinci ──────────────────────────────
  {
    id: 1, title: 'モナ・リザ', title_en: 'Mona Lisa',
    artist: 'Leonardo da Vinci', year: 1503, century: '16世紀', style: 'ルネサンス', museum: 'ルーヴル美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg&width=800',
  },
  {
    id: 2, title: '最後の晩餐', title_en: 'The Last Supper',
    artist: 'Leonardo da Vinci', year: 1498, century: '15世紀', style: 'ルネサンス', museum: 'サンタ・マリア・デッレ・グラツィエ教会',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/%22The_Last_Supper%22_by_Leonardo_da_Vinci.jpg&width=800',
  },

  // ── Johannes Vermeer ───────────────────────────────
  {
    id: 3, title: '真珠の耳飾りの少女', title_en: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer', year: 1665, century: '17世紀', style: 'バロック', museum: 'マウリッツハイス美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vermeer_-_Girl_with_a_Pearl_Earring.jpg&width=800',
  },
  {
    id: 4, title: '牛乳を注ぐ女', title_en: 'The Milkmaid',
    artist: 'Johannes Vermeer', year: 1658, century: '17世紀', style: 'バロック', museum: 'アムステルダム国立美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg&width=800',
  },
  {
    id: 5, title: '真珠の重さを量る女', title_en: 'Woman Holding a Balance',
    artist: 'Johannes Vermeer', year: 1664, century: '17世紀', style: 'バロック', museum: 'ナショナル・ギャラリー・オブ・アート',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vermeer_-_Woman_Holding_a_Balance.jpg&width=800',
  },
  {
    id: 6, title: '水差しを持つ女', title_en: 'Young Woman with a Water Pitcher',
    artist: 'Johannes Vermeer', year: 1662, century: '17世紀', style: 'バロック', museum: 'メトロポリタン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Johannes_Vermeer_-_Young_Woman_with_a_Water_Pitcher_-_WGA24666.jpg&width=800',
  },

  // ── Vincent van Gogh ───────────────────────────────
  {
    id: 7, title: '星月夜', title_en: 'The Starry Night',
    artist: 'Vincent van Gogh', year: 1889, century: '19世紀', style: 'ポスト印象派', museum: 'ニューヨーク近代美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg&width=800',
  },
  {
    id: 8, title: 'ひまわり', title_en: 'Sunflowers',
    artist: 'Vincent van Gogh', year: 1888, century: '19世紀', style: 'ポスト印象派', museum: 'ナショナル・ギャラリー（ロンドン）',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vincent_Willem_van_Gogh_127.jpg&width=800',
  },
  {
    id: 9, title: 'アイリス', title_en: 'Irises',
    artist: 'Vincent van Gogh', year: 1889, century: '19世紀', style: 'ポスト印象派', museum: 'ゲッティ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Irises-Vincent_van_Gogh.jpg&width=800',
  },
  {
    id: 10, title: '夜のカフェテラス', title_en: 'Café Terrace at Night',
    artist: 'Vincent van Gogh', year: 1888, century: '19世紀', style: 'ポスト印象派', museum: 'クレラー＝ミュラー美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Van_Gogh_-_Terrasse_des_Caf%C3%A9s_an_der_Place_du_Forum_in_Arles%2C_abends.jpeg&width=800',
  },
  {
    id: 11, title: '糸杉', title_en: 'Cypresses',
    artist: 'Vincent van Gogh', year: 1889, century: '19世紀', style: 'ポスト印象派', museum: 'メトロポリタン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Van_Gogh_-_Cypresses_(1889).jpg&width=800',
  },

  // ── Claude Monet ───────────────────────────────────
  {
    id: 12, title: '印象・日の出', title_en: 'Impression, Sunrise',
    artist: 'Claude Monet', year: 1872, century: '19世紀', style: '印象派', museum: 'マルモッタン・モネ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Monet_-_Impression%2C_Sunrise.jpg&width=800',
  },
  {
    id: 13, title: '睡蓮', title_en: 'Water Lilies',
    artist: 'Claude Monet', year: 1906, century: '20世紀', style: '印象派', museum: 'シカゴ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg&width=800',
  },
  {
    id: 14, title: 'アルジャントゥイユの橋', title_en: 'The Bridge at Argenteuil',
    artist: 'Claude Monet', year: 1874, century: '19世紀', style: '印象派', museum: 'オルセー美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Claude_Monet_-_The_Bridge_at_Argenteuil_-_Google_Art_Project.jpg&width=800',
  },
  {
    id: 15, title: 'ラ・グルヌイエール', title_en: 'La Grenouillère',
    artist: 'Claude Monet', year: 1869, century: '19世紀', style: '印象派', museum: 'メトロポリタン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Claude_Monet_-_La_Grenouill%C3%A8re.jpg&width=800',
  },

  // ── Pierre-Auguste Renoir ──────────────────────────
  {
    id: 16, title: 'ムーラン・ド・ラ・ギャレット', title_en: 'Bal du moulin de la Galette',
    artist: 'Pierre-Auguste Renoir', year: 1876, century: '19世紀', style: '印象派', museum: 'オルセー美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpg&width=800',
  },
  {
    id: 17, title: 'ぶらんこ', title_en: 'The Swing',
    artist: 'Pierre-Auguste Renoir', year: 1876, century: '19世紀', style: '印象派', museum: 'オルセー美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Pierre-Auguste_Renoir_-_La_Balancoire.jpg&width=800',
  },

  // ── Rembrandt van Rijn ─────────────────────────────
  {
    id: 18, title: '夜警', title_en: 'The Night Watch',
    artist: 'Rembrandt van Rijn', year: 1642, century: '17世紀', style: 'バロック', museum: 'アムステルダム国立美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Night_Watch_-_HD.jpg&width=800',
  },
  {
    id: 19, title: '自画像', title_en: 'Self-Portrait',
    artist: 'Rembrandt van Rijn', year: 1659, century: '17世紀', style: 'バロック', museum: 'ナショナル・ギャラリー・オブ・アート',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg&width=800',
  },

  // ── Édouard Manet ──────────────────────────────────
  {
    id: 20, title: '草上の昼食', title_en: "Le Déjeuner sur l'herbe",
    artist: 'Édouard Manet', year: 1863, century: '19世紀', style: '印象派', museum: 'オルセー美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg&width=800',
  },
  {
    id: 21, title: 'フォリー＝ベルジェールのバー', title_en: 'A Bar at the Folies-Bergère',
    artist: 'Édouard Manet', year: 1882, century: '19世紀', style: '印象派', museum: 'コートールド・ギャラリー',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg&width=800',
  },

  // ── Georges Seurat ─────────────────────────────────
  {
    id: 22, title: 'グラン・ジャット島の日曜日の午後', title_en: 'A Sunday on La Grande Jatte',
    artist: 'Georges Seurat', year: 1886, century: '19世紀', style: 'ポスト印象派', museum: 'シカゴ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg&width=800',
  },

  // ── Edvard Munch ───────────────────────────────────
  {
    id: 23, title: '叫び', title_en: 'The Scream',
    artist: 'Edvard Munch', year: 1893, century: '19世紀', style: '表現主義', museum: 'ノルウェー国立美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg&width=800',
  },

  // ── Gustav Klimt ───────────────────────────────────
  {
    id: 24, title: '接吻', title_en: 'The Kiss',
    artist: 'Gustav Klimt', year: 1908, century: '20世紀', style: 'アール・ヌーヴォー', museum: 'ベルヴェデーレ宮殿',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg&width=800',
  },
  {
    id: 25, title: 'ユディトI', title_en: 'Judith I',
    artist: 'Gustav Klimt', year: 1901, century: '20世紀', style: 'アール・ヌーヴォー', museum: 'ベルヴェデーレ宮殿',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Judith_and_the_Head_of_Holofernes_(Klimt)_-_Wiener_Secession_version.jpg&width=800',
  },

  // ── Sandro Botticelli ──────────────────────────────
  {
    id: 26, title: 'ヴィーナスの誕生', title_en: 'The Birth of Venus',
    artist: 'Sandro Botticelli', year: 1485, century: '15世紀', style: 'ルネサンス', museum: 'ウフィツィ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Sandro_Botticelli_046.jpg&width=800',
  },
  {
    id: 27, title: '春（プリマヴェーラ）', title_en: 'Primavera',
    artist: 'Sandro Botticelli', year: 1482, century: '15世紀', style: 'ルネサンス', museum: 'ウフィツィ美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Botticelli-primavera.jpg&width=800',
  },

  // ── Raphael ────────────────────────────────────────
  {
    id: 28, title: 'アテナイの学堂', title_en: 'The School of Athens',
    artist: 'Raphael', year: 1511, century: '16世紀', style: 'ルネサンス', museum: 'ヴァチカン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg&width=800',
  },

  // ── Caravaggio ─────────────────────────────────────
  {
    id: 29, title: '聖マタイの召命', title_en: 'The Calling of Saint Matthew',
    artist: 'Caravaggio', year: 1600, century: '17世紀', style: 'バロック', museum: 'サン・ルイジ・デイ・フランチェージ聖堂',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Calling_of_Saint_Matthew-Caravaggo_(1599-1600).jpg&width=800',
  },

  // ── Edgar Degas ────────────────────────────────────
  {
    id: 30, title: '踊りの稽古', title_en: 'The Dance Class',
    artist: 'Edgar Degas', year: 1874, century: '19世紀', style: '印象派', museum: 'メトロポリタン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Degas_-_The_Dance_Class.jpg&width=800',
  },

  // ── 葛飾北斎 ───────────────────────────────────────
  {
    id: 31, title: '神奈川沖浪裏', title_en: 'The Great Wave off Kanagawa',
    artist: '葛飾北斎', year: 1831, century: '19世紀', style: '浮世絵', museum: '大英博物館 他',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Tsunami_by_hokusai_19th_century.jpg&width=800',
  },
  {
    id: 32, title: '凱風快晴（赤富士）', title_en: 'Fine Wind, Clear Morning',
    artist: '葛飾北斎', year: 1831, century: '19世紀', style: '浮世絵', museum: '大英博物館 他',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Red_Fuji_southern_wind_clear_morning.jpg&width=800',
  },

  // ── 歌川広重 ───────────────────────────────────────
  {
    id: 33, title: '大橋・あたけの夕立', title_en: 'Sudden Shower over Shin-Ōhashi Bridge',
    artist: '歌川広重', year: 1857, century: '19世紀', style: '浮世絵', museum: '東京国立博物館 他',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Hiroshige_Atake_sous_une_averse_soudaine.jpg&width=800',
  },

  // ── Salvador Dalí ──────────────────────────────────
  {
    id: 34, title: '記憶の固執', title_en: 'The Persistence of Memory',
    artist: 'Salvador Dalí', year: 1931, century: '20世紀', style: 'シュルレアリスム', museum: 'ニューヨーク近代美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Persistence_of_Memory.jpg&width=800',
  },

  // ── Wassily Kandinsky ──────────────────────────────
  {
    id: 35, title: 'コンポジションVIII', title_en: 'Composition VIII',
    artist: 'Wassily Kandinsky', year: 1923, century: '20世紀', style: '抽象絵画', museum: 'グッゲンハイム美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vassily_Kandinsky%2C_1923_-_Composition_8%2C_huile_sur_toile%2C_140_cm_x_201_cm%2C_Guggenheim_Museum.jpg&width=800',
  },

  // ── Jan van Eyck ───────────────────────────────────
  {
    id: 36, title: 'アルノルフィーニ夫妻の肖像', title_en: 'Arnolfini Portrait',
    artist: 'Jan van Eyck', year: 1434, century: '15世紀', style: '初期フランドル派', museum: 'ナショナル・ギャラリー（ロンドン）',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Van_Eyck_-_Arnolfini_Portrait.jpg&width=800',
  },

  // ── Michelangelo ───────────────────────────────────
  {
    id: 37, title: 'アダムの創造', title_en: 'The Creation of Adam',
    artist: 'Michelangelo', year: 1512, century: '16世紀', style: 'ルネサンス', museum: 'システィーナ礼拝堂',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Michelangelo_-_Creation_of_Adam_(cropped).jpg&width=800',
  },

  // ── Diego Velázquez ────────────────────────────────
  {
    id: 38, title: '侍女たち', title_en: 'Las Meninas',
    artist: 'Diego Velázquez', year: 1656, century: '17世紀', style: 'バロック', museum: 'プラド美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Las_Meninas_01.jpg&width=800',
  },

  // ── Francisco Goya ─────────────────────────────────
  {
    id: 39, title: '我が子を食らうサトゥルヌス', title_en: 'Saturn Devouring His Son',
    artist: 'Francisco Goya', year: 1823, century: '19世紀', style: 'ロマン主義', museum: 'プラド美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_(1819-1823).jpg&width=800',
  },

  // ── Eugène Delacroix ───────────────────────────────
  {
    id: 40, title: '民衆を導く自由の女神', title_en: 'Liberty Leading the People',
    artist: 'Eugène Delacroix', year: 1830, century: '19世紀', style: 'ロマン主義', museum: 'ルーヴル美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg&width=800',
  },

  // ── Camille Pissarro ───────────────────────────────
  {
    id: 41, title: 'ブールヴァール・モンマルトル', title_en: 'Boulevard Montmartre, Spring Morning',
    artist: 'Camille Pissarro', year: 1897, century: '19世紀', style: '印象派', museum: 'ナショナル・ギャラリー・オブ・ヴィクトリア',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Spring_Morning.jpg&width=800',
  },

  // ── Paul Cézanne ───────────────────────────────────
  {
    id: 42, title: 'サント＝ヴィクトワール山', title_en: 'Mont Sainte-Victoire',
    artist: 'Paul Cézanne', year: 1904, century: '20世紀', style: 'ポスト印象派', museum: 'フィラデルフィア美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Paul_C%C3%A9zanne_(1839-1906)_-_Mont_Sainte-Victoire_(1902-1906).jpg&width=800',
  },

  // ── Paul Gauguin ───────────────────────────────────
  {
    id: 43, title: '我々はどこから来たのか', title_en: 'Where Do We Come From? What Are We? Where Are We Going?',
    artist: 'Paul Gauguin', year: 1898, century: '19世紀', style: 'ポスト印象派', museum: 'ボストン美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Paul_Gauguin_-_D%27o%C3%B9_venons-nous_-_Que_sommes-nous_-_O%C3%B9_allons-nous.jpg&width=800',
  },

  // ── Henri de Toulouse-Lautrec ──────────────────────
  {
    id: 44, title: 'ムーラン・ルージュ、ラ・グーリュ', title_en: 'Moulin Rouge: La Goulue',
    artist: 'Henri de Toulouse-Lautrec', year: 1891, century: '19世紀', style: 'ポスト印象派', museum: 'ニューヨーク近代美術館',
    image: 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/ToulouseLautrec_MoulinRouge_1891.jpg&width=800',
  },

];

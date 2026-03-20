// paintings.js — 名画収集館 作品データベース
// すべてパブリックドメイン（作者死後70年以上）確定作品のみ
// ダリ・ピカソ・マティスなど20世紀の著作権存続作家は除外済み

const PAINTINGS = [

  // ── Leonardo da Vinci (1452–1519) ─────────────────
  { id:1, title:'モナ・リザ', title_en:'Mona Lisa', artist:'Leonardo da Vinci', year:1503, century:'16世紀', style:'ルネサンス', museum:'ルーヴル美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
  { id:2, title:'最後の晩餐', title_en:'The Last Supper', artist:'Leonardo da Vinci', year:1498, century:'15世紀', style:'ルネサンス', museum:'サンタ・マリア・デッレ・グラツィエ教会',
    image:'https://upload.wikimedia.org/wikipedia/commons/4/4b/%22The_Last_Supper%22_by_Leonardo_da_Vinci.jpg' },

  // ── Johannes Vermeer (1632–1675) ───────────────────
  { id:3, title:'真珠の耳飾りの少女', title_en:'Girl with a Pearl Earring', artist:'Johannes Vermeer', year:1665, century:'17世紀', style:'バロック', museum:'マウリッツハイス美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/d/d7/Meisje_met_de_parel.jpg' },
  { id:4, title:'牛乳を注ぐ女', title_en:'The Milkmaid', artist:'Johannes Vermeer', year:1658, century:'17世紀', style:'バロック', museum:'アムステルダム国立美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg' },
  { id:5, title:'真珠の重さを量る女', title_en:'Woman Holding a Balance', artist:'Johannes Vermeer', year:1664, century:'17世紀', style:'バロック', museum:'ナショナル・ギャラリー・オブ・アート',
    image:'https://upload.wikimedia.org/wikipedia/commons/f/f9/Vermeer_-_Woman_Holding_a_Balance.jpg' },
  { id:6, title:'デルフト眺望', title_en:'View of Delft', artist:'Johannes Vermeer', year:1661, century:'17世紀', style:'バロック', museum:'マウリッツハイス美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vermeer-view-of-delft.jpg' },

  // ── Vincent van Gogh (1853–1890) ───────────────────
  { id:7, title:'星月夜', title_en:'The Starry Night', artist:'Vincent van Gogh', year:1889, century:'19世紀', style:'ポスト印象派', museum:'ニューヨーク近代美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
  { id:8, title:'ひまわり', title_en:'Sunflowers', artist:'Vincent van Gogh', year:1888, century:'19世紀', style:'ポスト印象派', museum:'ナショナル・ギャラリー（ロンドン）',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg' },
  { id:9, title:'アイリス', title_en:'Irises', artist:'Vincent van Gogh', year:1889, century:'19世紀', style:'ポスト印象派', museum:'ゲッティ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Irises-Vincent_van_Gogh.jpg/1280px-Irises-Vincent_van_Gogh.jpg' },
  { id:10, title:'夜のカフェテラス', title_en:'Café Terrace at Night', artist:'Vincent van Gogh', year:1888, century:'19世紀', style:'ポスト印象派', museum:'クレラー＝ミュラー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Van_Gogh_-_Terrasse_des_Caf%C3%A9s_an_der_Place_du_Forum_in_Arles%2C_abends.jpeg/800px-Van_Gogh_-_Terrasse_des_Caf%C3%A9s_an_der_Place_du_Forum_in_Arles%2C_abends.jpeg' },
  { id:11, title:'糸杉', title_en:'Cypresses', artist:'Vincent van Gogh', year:1889, century:'19世紀', style:'ポスト印象派', museum:'メトロポリタン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Van_Gogh_-_Cypresses_%281889%29.jpg/800px-Van_Gogh_-_Cypresses_%281889%29.jpg' },
  { id:12, title:'種をまく人', title_en:'The Sower', artist:'Vincent van Gogh', year:1888, century:'19世紀', style:'ポスト印象派', museum:'クレラー＝ミュラー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Van_Gogh_The_Sower.jpg/1024px-Van_Gogh_The_Sower.jpg' },

  // ── Claude Monet (1840–1926) ───────────────────────
  { id:13, title:'印象・日の出', title_en:'Impression, Sunrise', artist:'Claude Monet', year:1872, century:'19世紀', style:'印象派', museum:'マルモッタン・モネ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg' },
  { id:14, title:'睡蓮', title_en:'Water Lilies', artist:'Claude Monet', year:1906, century:'20世紀', style:'印象派', museum:'シカゴ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg' },
  { id:15, title:'アルジャントゥイユの橋', title_en:'The Bridge at Argenteuil', artist:'Claude Monet', year:1874, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Claude_Monet_-_The_Bridge_at_Argenteuil_-_Google_Art_Project.jpg/1280px-Claude_Monet_-_The_Bridge_at_Argenteuil_-_Google_Art_Project.jpg' },
  { id:16, title:'ラ・グルヌイエール', title_en:'La Grenouillère', artist:'Claude Monet', year:1869, century:'19世紀', style:'印象派', museum:'メトロポリタン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Claude_Monet_-_La_Grenouill%C3%A8re.jpg/1280px-Claude_Monet_-_La_Grenouill%C3%A8re.jpg' },

  // ── Pierre-Auguste Renoir (1841–1919) ──────────────
  { id:17, title:'ムーラン・ド・ラ・ギャレット', title_en:'Bal du moulin de la Galette', artist:'Pierre-Auguste Renoir', year:1876, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpg/1280px-Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpg' },
  { id:18, title:'ぶらんこ', title_en:'The Swing', artist:'Pierre-Auguste Renoir', year:1876, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Pierre-Auguste_Renoir_-_La_Balancoire.jpg/800px-Pierre-Auguste_Renoir_-_La_Balancoire.jpg' },
  { id:19, title:'舟遊びをする人々の昼食', title_en:'Luncheon of the Boating Party', artist:'Pierre-Auguste Renoir', year:1881, century:'19世紀', style:'印象派', museum:'フィリップス・コレクション',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg' },

  // ── Rembrandt van Rijn (1606–1669) ─────────────────
  { id:20, title:'夜警', title_en:'The Night Watch', artist:'Rembrandt van Rijn', year:1642, century:'17世紀', style:'バロック', museum:'アムステルダム国立美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg' },
  { id:21, title:'自画像', title_en:'Self-Portrait', artist:'Rembrandt van Rijn', year:1659, century:'17世紀', style:'バロック', museum:'ナショナル・ギャラリー・オブ・アート',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/877px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg' },

  // ── Édouard Manet (1832–1883) ──────────────────────
  { id:22, title:'草上の昼食', title_en:"Le Déjeuner sur l'herbe", artist:'Édouard Manet', year:1863, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg/1280px-Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg' },
  { id:23, title:'フォリー＝ベルジェールのバー', title_en:'A Bar at the Folies-Bergère', artist:'Édouard Manet', year:1882, century:'19世紀', style:'印象派', museum:'コートールド・ギャラリー',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg/1280px-Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg' },

  // ── Georges Seurat (1859–1891) ─────────────────────
  { id:24, title:'グラン・ジャット島の日曜日の午後', title_en:'A Sunday on La Grande Jatte', artist:'Georges Seurat', year:1886, century:'19世紀', style:'ポスト印象派', museum:'シカゴ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg' },

  // ── Edvard Munch (1863–1944) ───────────────────────
  { id:25, title:'叫び', title_en:'The Scream', artist:'Edvard Munch', year:1893, century:'19世紀', style:'表現主義', museum:'ノルウェー国立美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg' },

  // ── Gustav Klimt (1862–1918) ───────────────────────
  { id:26, title:'接吻', title_en:'The Kiss', artist:'Gustav Klimt', year:1908, century:'20世紀', style:'アール・ヌーヴォー', museum:'ベルヴェデーレ宮殿',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg' },
  { id:27, title:'ユディトI', title_en:'Judith I', artist:'Gustav Klimt', year:1901, century:'20世紀', style:'アール・ヌーヴォー', museum:'ベルヴェデーレ宮殿',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Judith_and_the_Head_of_Holofernes_%28Klimt%29_-_Wiener_Secession_version.jpg/600px-Judith_and_the_Head_of_Holofernes_%28Klimt%29_-_Wiener_Secession_version.jpg' },

  // ── Sandro Botticelli (1445–1510) ──────────────────
  { id:28, title:'ヴィーナスの誕生', title_en:'The Birth of Venus', artist:'Sandro Botticelli', year:1485, century:'15世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sandro_Botticelli_046.jpg/1280px-Sandro_Botticelli_046.jpg' },
  { id:29, title:'春（プリマヴェーラ）', title_en:'Primavera', artist:'Sandro Botticelli', year:1482, century:'15世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1280px-Botticelli-primavera.jpg' },

  // ── Raphael (1483–1520) ────────────────────────────
  { id:30, title:'アテナイの学堂', title_en:'The School of Athens', artist:'Raphael', year:1511, century:'16世紀', style:'ルネサンス', museum:'ヴァチカン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg' },

  // ── Caravaggio (1571–1610) ─────────────────────────
  { id:31, title:'聖マタイの召命', title_en:'The Calling of Saint Matthew', artist:'Caravaggio', year:1600, century:'17世紀', style:'バロック', museum:'サン・ルイジ・デイ・フランチェージ聖堂',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg/1280px-The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg' },

  // ── Edgar Degas (1834–1917) ────────────────────────
  { id:32, title:'踊りの稽古', title_en:'The Dance Class', artist:'Edgar Degas', year:1874, century:'19世紀', style:'印象派', museum:'メトロポリタン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Degas_-_The_Dance_Class.jpg/998px-Degas_-_The_Dance_Class.jpg' },
  { id:33, title:'ピンクの踊り子たち', title_en:'Dancers in Pink', artist:'Edgar Degas', year:1876, century:'19世紀', style:'印象派', museum:'ボストン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Degas_-_Dancers_in_Pink%2C_c._1876.jpg/800px-Degas_-_Dancers_in_Pink%2C_c._1876.jpg' },

  // ── 葛飾北斎 (1760–1849) ────────────────────────────
  { id:34, title:'神奈川沖浪裏', title_en:'The Great Wave off Kanagawa', artist:'葛飾北斎', year:1831, century:'19世紀', style:'浮世絵', museum:'大英博物館 他',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg' },
  { id:35, title:'凱風快晴（赤富士）', title_en:'Fine Wind, Clear Morning', artist:'葛飾北斎', year:1831, century:'19世紀', style:'浮世絵', museum:'大英博物館 他',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Red_Fuji_southern_wind_clear_morning.jpg/1280px-Red_Fuji_southern_wind_clear_morning.jpg' },

  // ── 歌川広重 (1797–1858) ────────────────────────────
  { id:36, title:'大橋・あたけの夕立', title_en:'Sudden Shower over Shin-Ōhashi Bridge', artist:'歌川広重', year:1857, century:'19世紀', style:'浮世絵', museum:'東京国立博物館 他',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hiroshige_Atake_sous_une_averse_soudaine.jpg/800px-Hiroshige_Atake_sous_une_averse_soudaine.jpg' },
  { id:37, title:'亀戸梅屋舗', title_en:'Plum Park in Kameido', artist:'歌川広重', year:1857, century:'19世紀', style:'浮世絵', museum:'東京国立博物館 他',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Hiroshige_Plum_Park.jpg/800px-Hiroshige_Plum_Park.jpg' },

  // ── Jan van Eyck (1390–1441) ───────────────────────
  { id:38, title:'アルノルフィーニ夫妻の肖像', title_en:'Arnolfini Portrait', artist:'Jan van Eyck', year:1434, century:'15世紀', style:'初期フランドル派', museum:'ナショナル・ギャラリー（ロンドン）',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg' },

  // ── Michelangelo (1475–1564) ───────────────────────
  { id:39, title:'アダムの創造', title_en:'The Creation of Adam', artist:'Michelangelo', year:1512, century:'16世紀', style:'ルネサンス', museum:'システィーナ礼拝堂',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg' },

  // ── Diego Velázquez (1599–1660) ────────────────────
  { id:40, title:'侍女たち', title_en:'Las Meninas', artist:'Diego Velázquez', year:1656, century:'17世紀', style:'バロック', museum:'プラド美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Las_Meninas_01.jpg/800px-Las_Meninas_01.jpg' },

  // ── Francisco Goya (1746–1828) ─────────────────────
  { id:41, title:'我が子を食らうサトゥルヌス', title_en:'Saturn Devouring His Son', artist:'Francisco Goya', year:1823, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg/800px-Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg' },
  { id:42, title:'着衣のマハ', title_en:'The Clothed Maja', artist:'Francisco Goya', year:1805, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Goya_Maja_clothed.jpg/1280px-Goya_Maja_clothed.jpg' },

  // ── Eugène Delacroix (1798–1863) ───────────────────
  { id:43, title:'民衆を導く自由の女神', title_en:'Liberty Leading the People', artist:'Eugène Delacroix', year:1830, century:'19世紀', style:'ロマン主義', museum:'ルーヴル美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg' },

  // ── Camille Pissarro (1830–1903) ───────────────────
  { id:44, title:'ブールヴァール・モンマルトル', title_en:'Boulevard Montmartre, Spring Morning', artist:'Camille Pissarro', year:1897, century:'19世紀', style:'印象派', museum:'ナショナル・ギャラリー・オブ・ヴィクトリア',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Spring_Morning.jpg/1280px-Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Spring_Morning.jpg' },

  // ── Paul Cézanne (1839–1906) ───────────────────────
  { id:45, title:'サント＝ヴィクトワール山', title_en:'Mont Sainte-Victoire', artist:'Paul Cézanne', year:1904, century:'20世紀', style:'ポスト印象派', museum:'フィラデルフィア美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Paul_C%C3%A9zanne_%281839-1906%29_-_Mont_Sainte-Victoire_%281902-1906%29.jpg/1280px-Paul_C%C3%A9zanne_%281839-1906%29_-_Mont_Sainte-Victoire_%281902-1906%29.jpg' },
  { id:46, title:'リンゴとオレンジ', title_en:'Apples and Oranges', artist:'Paul Cézanne', year:1899, century:'19世紀', style:'ポスト印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Paul_Cezanne%2C_Pommes_et_oranges_%28Apples_and_Oranges%29%2C_c._1899.jpg/1280px-Paul_Cezanne%2C_Pommes_et_oranges_%28Apples_and_Oranges%29%2C_c._1899.jpg' },

  // ── Paul Gauguin (1848–1903) ───────────────────────
  { id:47, title:'我々はどこから来たのか', title_en:'Where Do We Come From? What Are We? Where Are We Going?', artist:'Paul Gauguin', year:1898, century:'19世紀', style:'ポスト印象派', museum:'ボストン美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Paul_Gauguin_-_D%27o%C3%B9_venons-nous_-_Que_sommes-nous_-_O%C3%B9_allons-nous.jpg/1280px-Paul_Gauguin_-_D%27o%C3%B9_venons-nous_-_Que_sommes-nous_-_O%C3%B9_allons-nous.jpg' },
  { id:48, title:'タヒチの女たち', title_en:'Tahitian Women on the Beach', artist:'Paul Gauguin', year:1891, century:'19世紀', style:'ポスト印象派', museum:'オルセー美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Paul_Gauguin_-_Tahitian_Women_on_the_Beach.jpg/1024px-Paul_Gauguin_-_Tahitian_Women_on_the_Beach.jpg' },

  // ── Henri de Toulouse-Lautrec (1864–1901) ──────────
  { id:49, title:'ムーラン・ルージュ、ラ・グーリュ', title_en:'Moulin Rouge: La Goulue', artist:'Henri de Toulouse-Lautrec', year:1891, century:'19世紀', style:'ポスト印象派', museum:'ニューヨーク近代美術館',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/ToulouseLautrec_MoulinRouge_1891.jpg/800px-ToulouseLautrec_MoulinRouge_1891.jpg' },

  // ── Gustav Klimt 追加 (1862–1918) ─────────────────
  { id:50, title:'アデーレ・ブロッホ＝バウアーの肖像 I', title_en:'Portrait of Adele Bloch-Bauer I', artist:'Gustav Klimt', year:1907, century:'20世紀', style:'アール・ヌーヴォー', museum:'ノイエ・ギャラリー',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Klimt_-_Portrait_of_Adele_Bloch-Bauer_I.jpg/800px-Klimt_-_Portrait_of_Adele_Bloch-Bauer_I.jpg' },

];

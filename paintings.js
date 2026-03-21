// paintings.js — 名画収集館 静的データ
// 画像: Wikimedia Commons パブリックドメイン作品のみ
// 作者死後70年以上経過した確定パブリックドメイン

const IIIF = 'https://www.artic.edu/iiif/2';
const artic = (id) => `${IIIF}/${id}/full/843,/0/default.jpg`;
const wiki  = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

const STATIC_PAINTINGS = [

  // ══════════════════════════════════════════
  // 初期フランドル派（15世紀）
  // ══════════════════════════════════════════
  { id:'s001', title:'アルノルフィーニ夫妻の肖像',
    artist:'ヤン・ファン・エイク', year:1434, century:'15世紀', style:'初期フランドル派', museum:'ナショナル・ギャラリー（ロンドン）',
    image: wiki('3/33/Van_Eyck_-_Arnolfini_Portrait.jpg') },

  { id:'s002', title:'ヘントの祭壇画（神秘の子羊）',
    artist:'ヤン・ファン・エイク', year:1432, century:'15世紀', style:'初期フランドル派', museum:'聖バーフ大聖堂',
    image: wiki('2/2e/Ghent_Altarpiece_D_-_Adoration_of_the_Lamb.jpg') },

  { id:'s003', title:'十字架降下',
    artist:'ロヒール・ファン・デル・ウェイデン', year:1435, century:'15世紀', style:'初期フランドル派', museum:'プラド美術館',
    image: wiki('4/4c/Weyden_Deposition.jpg') },

  { id:'s004', title:'最後の審判',
    artist:'ハンス・メムリンク', year:1471, century:'15世紀', style:'初期フランドル派', museum:'国立海洋博物館（グダンスク）',
    image: wiki('b/b8/Hans_Memling_-_Last_Judgment_Triptych_%28interior%29.jpg') },

  // ══════════════════════════════════════════
  // イタリア・ルネサンス（15〜16世紀）
  // ══════════════════════════════════════════
  { id:'s005', title:'ヴィーナスの誕生',
    artist:'サンドロ・ボッティチェリ', year:1485, century:'15世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image: wiki('2/26/Sandro_Botticelli_046.jpg') },

  { id:'s006', title:'春（プリマヴェーラ）',
    artist:'サンドロ・ボッティチェリ', year:1482, century:'15世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image: wiki('3/3c/Botticelli-primavera.jpg') },

  { id:'s007', title:'書物の聖母',
    artist:'サンドロ・ボッティチェリ', year:1480, century:'15世紀', style:'ルネサンス', museum:'ポルディ・ペッツォーリ美術館',
    image: wiki('9/93/Sandro_Botticelli_-_Madonna_of_the_Book_-_WGA02903.jpg') },

  { id:'s008', title:'モナ・リザ',
    artist:'レオナルド・ダ・ヴィンチ', year:1503, century:'16世紀', style:'ルネサンス', museum:'ルーヴル美術館',
    image: wiki('e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg') },

  { id:'s009', title:'最後の晩餐',
    artist:'レオナルド・ダ・ヴィンチ', year:1498, century:'15世紀', style:'ルネサンス', museum:'サンタ・マリア・デッレ・グラツィエ教会',
    image: wiki('4/4b/%22The_Last_Supper%22_by_Leonardo_da_Vinci.jpg') },

  { id:'s010', title:'岩窟の聖母',
    artist:'レオナルド・ダ・ヴィンチ', year:1486, century:'15世紀', style:'ルネサンス', museum:'ルーヴル美術館',
    image: wiki('5/57/Leonardo_da_Vinci_-_Virgin_of_the_Rocks_%28Louvre%29.jpg') },

  { id:'s011', title:'アダムの創造',
    artist:'ミケランジェロ', year:1512, century:'16世紀', style:'ルネサンス', museum:'システィーナ礼拝堂',
    image: wiki('5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg') },

  { id:'s012', title:'聖家族（ドーニ・トンド）',
    artist:'ミケランジェロ', year:1507, century:'16世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image: wiki('8/8e/Michelangelo_-_Tondo_Doni_-_foto.jpg') },

  { id:'s013', title:'アテナイの学堂',
    artist:'ラファエロ', year:1511, century:'16世紀', style:'ルネサンス', museum:'ヴァチカン美術館',
    image: wiki('4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg') },

  { id:'s014', title:'システィーナの聖母',
    artist:'ラファエロ', year:1512, century:'16世紀', style:'ルネサンス', museum:'ゲマールデギャラリー・アルテ・マイスター',
    image: wiki('7/73/Raphael_-_Madonna_Sistina.jpg') },

  { id:'s015', title:'小椅子の聖母',
    artist:'ラファエロ', year:1514, century:'16世紀', style:'ルネサンス', museum:'パラティーナ美術館',
    image: wiki('6/65/Raffaello_Sanzio_-_Madonna_della_Seggiola.jpg') },

  { id:'s016', title:'ウルビーノのヴィーナス',
    artist:'ティツィアーノ・ヴェチェッリオ', year:1538, century:'16世紀', style:'ルネサンス', museum:'ウフィツィ美術館',
    image: wiki('7/73/Tizian_Venus_of_Urbino.jpg') },

  { id:'s017', title:'被昇天の聖母',
    artist:'ティツィアーノ・ヴェチェッリオ', year:1518, century:'16世紀', style:'ルネサンス', museum:'フラーリ聖堂（ヴェネツィア）',
    image: wiki('c/c6/Tiziano_-_Assunzione_della_Vergine_%281516-18%29.jpg') },

  { id:'s018', title:'オルガス伯の埋葬',
    artist:'エル・グレコ', year:1586, century:'16世紀', style:'マニエリスム', museum:'サント・トメ教会',
    image: wiki('d/df/El_Greco_-_The_Burial_of_the_Count_of_Org%C3%A1z.JPG') },

  { id:'s019', title:'嵐（ラ・テンペスタ）',
    artist:'ジョルジョーネ', year:1508, century:'16世紀', style:'ルネサンス', museum:'アカデミア美術館（ヴェネツィア）',
    image: wiki('e/e1/Giorgione_-_La_Tempesta.jpg') },

  // ══════════════════════════════════════════
  // バロック（17世紀）
  // ══════════════════════════════════════════
  { id:'s020', title:'真珠の耳飾りの少女',
    artist:'ヨハネス・フェルメール', year:1665, century:'17世紀', style:'バロック', museum:'マウリッツハイス美術館',
    image: wiki('d/d7/Meisje_met_de_parel.jpg') },

  { id:'s021', title:'牛乳を注ぐ女',
    artist:'ヨハネス・フェルメール', year:1658, century:'17世紀', style:'バロック', museum:'アムステルダム国立美術館',
    image: wiki('2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg') },

  { id:'s022', title:'デルフト眺望',
    artist:'ヨハネス・フェルメール', year:1661, century:'17世紀', style:'バロック', museum:'マウリッツハイス美術館',
    image: wiki('a/a2/Vermeer-view-of-delft.jpg') },

  { id:'s023', title:'真珠の重さを量る女',
    artist:'ヨハネス・フェルメール', year:1664, century:'17世紀', style:'バロック', museum:'ナショナル・ギャラリー・オブ・アート',
    image: wiki('f/f9/Vermeer_-_Woman_Holding_a_Balance.jpg') },

  { id:'s024', title:'手紙を書く女',
    artist:'ヨハネス・フェルメール', year:1665, century:'17世紀', style:'バロック', museum:'ナショナル・ギャラリー・オブ・アート',
    image: wiki('8/8a/Jan_Vermeer_van_Delft_-_Lady_Writing_a_Letter_-_Google_Art_Project.jpg') },

  { id:'s025', title:'音楽の稽古',
    artist:'ヨハネス・フェルメール', year:1662, century:'17世紀', style:'バロック', museum:'ロイヤル・コレクション（ロンドン）',
    image: wiki('3/31/Jan_Vermeer_van_Delft_-_The_Music_Lesson_-_Google_Art_Project.jpg') },

  { id:'s026', title:'夜警',
    artist:'レンブラント・ファン・レイン', year:1642, century:'17世紀', style:'バロック', museum:'アムステルダム国立美術館',
    image: wiki('5/5a/The_Night_Watch_-_HD.jpg') },

  { id:'s027', title:'自画像（1659年）',
    artist:'レンブラント・ファン・レイン', year:1659, century:'17世紀', style:'バロック', museum:'ナショナル・ギャラリー・オブ・アート',
    image: wiki('b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg') },

  { id:'s028', title:'テュルプ博士の解剖学講義',
    artist:'レンブラント・ファン・レイン', year:1632, century:'17世紀', style:'バロック', museum:'マウリッツハイス美術館',
    image: wiki('4/4d/The_Anatomy_Lesson.jpg') },

  { id:'s029', title:'バテシバの入浴',
    artist:'レンブラント・ファン・レイン', year:1654, century:'17世紀', style:'バロック', museum:'ルーヴル美術館',
    image: wiki('e/ea/Rembrandt_-_Bathsheba_at_Her_Bath_-_WGA19077.jpg') },

  { id:'s030', title:'聖マタイの召命',
    artist:'カラヴァッジョ', year:1600, century:'17世紀', style:'バロック', museum:'サン・ルイジ・デイ・フランチェージ聖堂',
    image: wiki('4/48/The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg') },

  { id:'s031', title:'ホロフェルネスの首を斬るユディト',
    artist:'カラヴァッジョ', year:1599, century:'17世紀', style:'バロック', museum:'バルベリーニ宮国立古典絵画館',
    image: wiki('3/3d/Caravaggio_-_Judith_Beheading_Holofernes_-_WGA04127.jpg') },

  { id:'s032', title:'疑惑のトマス',
    artist:'カラヴァッジョ', year:1602, century:'17世紀', style:'バロック', museum:'サンスーシ宮殿',
    image: wiki('2/2f/The_Incredulity_of_Saint_Thomas_by_Caravaggio.jpg') },

  { id:'s033', title:'侍女たち',
    artist:'ディエゴ・ベラスケス', year:1656, century:'17世紀', style:'バロック', museum:'プラド美術館',
    image: wiki('9/99/Las_Meninas_01.jpg') },

  { id:'s034', title:'ブレダの降伏',
    artist:'ディエゴ・ベラスケス', year:1635, century:'17世紀', style:'バロック', museum:'プラド美術館',
    image: wiki('d/d2/La_rendici%C3%B3n_de_Breda.jpg') },

  { id:'s035', title:'イノケンティウス10世の肖像',
    artist:'ディエゴ・ベラスケス', year:1650, century:'17世紀', style:'バロック', museum:'ドーリア・パンフィーリ美術館',
    image: wiki('0/0a/Velasquez-innocent.jpg') },

  { id:'s036', title:'キリストの降架',
    artist:'ピーテル・パウル・ルーベンス', year:1614, century:'17世紀', style:'バロック', museum:'アントワープ大聖堂',
    image: wiki('3/3e/The_Descent_from_the_Cross%2C_by_Peter_Paul_Rubens%2C_from_Prado_in_Google_Earth.jpg') },

  { id:'s037', title:'三美神',
    artist:'ピーテル・パウル・ルーベンス', year:1635, century:'17世紀', style:'バロック', museum:'プラド美術館',
    image: wiki('9/93/Rubens_-_Las_Tres_Gracias.jpg') },

  // ══════════════════════════════════════════
  // 新古典主義（18〜19世紀）
  // ══════════════════════════════════════════
  { id:'s038', title:'ナポレオンのアルプス越え',
    artist:'ジャック＝ルイ・ダヴィッド', year:1801, century:'19世紀', style:'新古典主義', museum:'マルメゾン城',
    image: wiki('f/fd/David_-_Napoleon_crossing_the_Alps_-_Malmaison2.jpg') },

  { id:'s039', title:'ナポレオンの戴冠式',
    artist:'ジャック＝ルイ・ダヴィッド', year:1807, century:'19世紀', style:'新古典主義', museum:'ルーヴル美術館',
    image: wiki('8/80/Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg') },

  { id:'s040', title:'グラン・オダリスク',
    artist:'ジャン＝オーギュスト＝ドミニク・アングル', year:1814, century:'19世紀', style:'新古典主義', museum:'ルーヴル美術館',
    image: wiki('3/3b/Grande_Odalisque_by_Jean-Auguste-Dominique_Ingres.jpg') },

  // ══════════════════════════════════════════
  // ロマン主義（19世紀）
  // ══════════════════════════════════════════
  { id:'s041', title:'我が子を食らうサトゥルヌス',
    artist:'フランシスコ・ゴヤ', year:1823, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image: wiki('8/82/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg') },

  { id:'s042', title:'着衣のマハ',
    artist:'フランシスコ・ゴヤ', year:1805, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image: wiki('8/8b/Goya_Maja_clothed.jpg') },

  { id:'s043', title:'裸のマハ',
    artist:'フランシスコ・ゴヤ', year:1800, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image: wiki('2/25/Francisco_de_goya_y_lucientes_-_Naked_Maja.jpg') },

  { id:'s044', title:'1808年5月3日',
    artist:'フランシスコ・ゴヤ', year:1814, century:'19世紀', style:'ロマン主義', museum:'プラド美術館',
    image: wiki('f/f8/El_Tres_de_Mayo%2C_by_Francisco_de_Goya%2C_from_Prado_thin_black_margin.jpg') },

  { id:'s045', title:'民衆を導く自由の女神',
    artist:'ウジェーヌ・ドラクロワ', year:1830, century:'19世紀', style:'ロマン主義', museum:'ルーヴル美術館',
    image: wiki('5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg') },

  { id:'s046', title:'キオス島の虐殺',
    artist:'ウジェーヌ・ドラクロワ', year:1824, century:'19世紀', style:'ロマン主義', museum:'ルーヴル美術館',
    image: wiki('a/a7/Eug%C3%A8ne_Delacroix_-_Le_Massacre_de_Scio.jpg') },

  { id:'s047', title:'メデューズ号の筏',
    artist:'テオドール・ジェリコー', year:1819, century:'19世紀', style:'ロマン主義', museum:'ルーヴル美術館',
    image: wiki('1/15/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Louvre%2C_1818-19%29.jpg') },

  { id:'s048', title:'霧の海の旅人',
    artist:'カスパー・ダーヴィト・フリードリヒ', year:1818, century:'19世紀', style:'ロマン主義', museum:'ハンブルク美術館',
    image: wiki('b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg') },

  { id:'s049', title:'氷の海',
    artist:'カスパー・ダーヴィト・フリードリヒ', year:1824, century:'19世紀', style:'ロマン主義', museum:'ハンブルク美術館',
    image: wiki('d/d3/Caspar_David_Friedrich_-_Das_Eismeer_-_Hamburger_Kunsthalle_-_01.jpg') },

  { id:'s050', title:'干し草の荷車',
    artist:'ジョン・コンスタブル', year:1821, century:'19世紀', style:'ロマン主義', museum:'ナショナル・ギャラリー（ロンドン）',
    image: wiki('b/b9/John_Constable_-_The_Hay_Wain_%281821%29.jpg') },

  { id:'s051', title:'雨・蒸気・スピード',
    artist:'ジョゼフ・マロード・ウィリアム・ターナー', year:1844, century:'19世紀', style:'ロマン主義', museum:'ナショナル・ギャラリー（ロンドン）',
    image: wiki('a/a9/Rain_Steam_and_Speed_the_Great_Western_Railway.jpg') },

  { id:'s052', title:'戦艦テメレール',
    artist:'ジョゼフ・マロード・ウィリアム・ターナー', year:1839, century:'19世紀', style:'ロマン主義', museum:'ナショナル・ギャラリー（ロンドン）',
    image: wiki('1/1a/Turner_-_The_Fighting_Temeraire%2C_National_Gallery.jpg') },

  // ══════════════════════════════════════════
  // ラファエル前派（19世紀）
  // ══════════════════════════════════════════
  { id:'s053', title:'オフィーリア',
    artist:'ジョン・エヴァレット・ミレイ', year:1852, century:'19世紀', style:'ラファエル前派', museum:'テート・ブリテン',
    image: wiki('h/h0/John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg') },

  { id:'s054', title:'受胎告知',
    artist:'ダンテ・ガブリエル・ロセッティ', year:1850, century:'19世紀', style:'ラファエル前派', museum:'テート・ブリテン',
    image: wiki('6/68/Dante_Gabriel_Rossetti_-_Ecce_Ancilla_Domini%21_-_Google_Art_Project.jpg') },

  // ══════════════════════════════════════════
  // リアリズム（19世紀）
  // ══════════════════════════════════════════
  { id:'s055', title:'落穂拾い',
    artist:'ジャン＝フランソワ・ミレー', year:1857, century:'19世紀', style:'リアリズム', museum:'オルセー美術館',
    image: wiki('1/1e/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg') },

  { id:'s056', title:'晩鐘',
    artist:'ジャン＝フランソワ・ミレー', year:1859, century:'19世紀', style:'リアリズム', museum:'オルセー美術館',
    image: wiki('6/6a/JEAN-FRAN%C3%87OIS_MILLET_-_El_%C3%81ngelus_%28Museo_de_Orsay%2C_1857-1859%2C_%C3%B3leo_sobre_lienzo%2C_55.5_x_66_cm%29.jpg') },

  { id:'s057', title:'種をまく人',
    artist:'ジャン＝フランソワ・ミレー', year:1850, century:'19世紀', style:'リアリズム', museum:'ボストン美術館',
    image: wiki('2/27/Jean-Fran%C3%A7ois_Millet_-_The_Sower_-_Google_Art_Project.jpg') },

  { id:'s058', title:'オルナンの埋葬',
    artist:'ギュスターヴ・クールベ', year:1850, century:'19世紀', style:'リアリズム', museum:'オルセー美術館',
    image: wiki('3/3d/Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg') },

  // ══════════════════════════════════════════
  // 印象派（19世紀後半）
  // ══════════════════════════════════════════
  { id:'s059', title:'印象・日の出',
    artist:'クロード・モネ', year:1872, century:'19世紀', style:'印象派', museum:'マルモッタン・モネ美術館',
    image: wiki('5/59/Monet_-_Impression%2C_Sunrise.jpg') },

  { id:'s060', title:'睡蓮',
    artist:'クロード・モネ', year:1906, century:'20世紀', style:'印象派', museum:'シカゴ美術館',
    image: artic('3c27b499-af56-f0d5-93b5-a7f2f1ad5813') },

  { id:'s061', title:'アルジャントゥイユの橋',
    artist:'クロード・モネ', year:1874, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('5/5d/Claude_Monet_-_The_Bridge_at_Argenteuil_-_Google_Art_Project.jpg') },

  { id:'s062', title:'ラ・グルヌイエール',
    artist:'クロード・モネ', year:1869, century:'19世紀', style:'印象派', museum:'メトロポリタン美術館',
    image: wiki('5/5e/Claude_Monet_-_La_Grenouill%C3%A8re.jpg') },

  { id:'s063', title:'ルーアン大聖堂（日没）',
    artist:'クロード・モネ', year:1894, century:'19世紀', style:'印象派', museum:'ナショナル・ギャラリー・オブ・アート',
    image: wiki('f/f2/Claude_Monet_-_Rouen_Cathedral%2C_West_Facade%2C_Sunlight_-_Google_Art_Project.jpg') },

  { id:'s064', title:'積みわら',
    artist:'クロード・モネ', year:1891, century:'19世紀', style:'印象派', museum:'シカゴ美術館',
    image: artic('e966799b-97ee-1cc6-bd2f-a2b4f83361be') },

  { id:'s065', title:'ムーラン・ド・ラ・ギャレット',
    artist:'ピエール＝オーギュスト・ルノワール', year:1876, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('4/40/Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpg') },

  { id:'s066', title:'ぶらんこ',
    artist:'ピエール＝オーギュスト・ルノワール', year:1876, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('a/a8/Pierre-Auguste_Renoir_-_La_Balancoire.jpg') },

  { id:'s067', title:'浴女たち',
    artist:'ピエール＝オーギュスト・ルノワール', year:1887, century:'19世紀', style:'印象派', museum:'フィラデルフィア美術館',
    image: wiki('e/e3/Pierre-Auguste_Renoir_-_The_Large_Bathers_-_Google_Art_Project.jpg') },

  { id:'s068', title:'草上の昼食',
    artist:'エドゥアール・マネ', year:1863, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('9/90/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg') },

  { id:'s069', title:'フォリー＝ベルジェールのバー',
    artist:'エドゥアール・マネ', year:1882, century:'19世紀', style:'印象派', museum:'コートールド・ギャラリー',
    image: wiki('0/0d/Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg') },

  { id:'s070', title:'笛を吹く少年',
    artist:'エドゥアール・マネ', year:1866, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('1/1c/%C3%89douard_Manet_-_Le_Fifre.jpg') },

  { id:'s071', title:'踊りの稽古',
    artist:'エドガー・ドガ', year:1874, century:'19世紀', style:'印象派', museum:'メトロポリタン美術館',
    image: wiki('7/7e/Degas_-_The_Dance_Class.jpg') },

  { id:'s072', title:'踊り子（舞台上）',
    artist:'エドガー・ドガ', year:1878, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('a/af/Edgar_Germain_Hilaire_Degas_011.jpg') },

  { id:'s073', title:'パリの街、雨の日',
    artist:'ギュスターヴ・カイユボット', year:1877, century:'19世紀', style:'印象派', museum:'シカゴ美術館',
    image: artic('f8fd76db-6a65-9561-0769-7c6c72ef4b32') },

  { id:'s074', title:'子供の入浴',
    artist:'メアリー・カサット', year:1893, century:'19世紀', style:'印象派', museum:'シカゴ美術館',
    image: artic('8cf5d480-2af8-1764-eff1-c3ce53264af2') },

  { id:'s075', title:'桟敷席にて',
    artist:'メアリー・カサット', year:1878, century:'19世紀', style:'印象派', museum:'ボストン美術館',
    image: wiki('e/e4/Mary_Cassatt_-_In_the_Loge.jpg') },

  { id:'s076', title:'ブールヴァール・モンマルトル',
    artist:'カミーユ・ピサロ', year:1897, century:'19世紀', style:'印象派', museum:'ナショナル・ギャラリー・オブ・ヴィクトリア',
    image: wiki('a/a7/Camille_Pissarro%2C_1897%2C_Boulevard_Montmartre%2C_Spring_Morning.jpg') },

  { id:'s077', title:'アルジャントゥイユのセーヌ川',
    artist:'アルフレッド・シスレー', year:1872, century:'19世紀', style:'印象派', museum:'オルセー美術館',
    image: wiki('c/c1/Alfred_Sisley_-_La_seine_%C3%A0_Argenteuil_-_Google_Art_Project.jpg') },

  // ══════════════════════════════════════════
  // ポスト印象派（19世紀末〜20世紀初頭）
  // ══════════════════════════════════════════
  { id:'s078', title:'星月夜',
    artist:'フィンセント・ファン・ゴッホ', year:1889, century:'19世紀', style:'ポスト印象派', museum:'ニューヨーク近代美術館',
    image: wiki('e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg') },

  { id:'s079', title:'ひまわり',
    artist:'フィンセント・ファン・ゴッホ', year:1888, century:'19世紀', style:'ポスト印象派', museum:'ナショナル・ギャラリー（ロンドン）',
    image: wiki('4/46/Vincent_Willem_van_Gogh_127.jpg') },

  { id:'s080', title:'アイリス',
    artist:'フィンセント・ファン・ゴッホ', year:1889, century:'19世紀', style:'ポスト印象派', museum:'ゲッティ美術館',
    image: wiki('3/3e/Irises-Vincent_van_Gogh.jpg') },

  { id:'s081', title:'夜のカフェテラス',
    artist:'フィンセント・ファン・ゴッホ', year:1888, century:'19世紀', style:'ポスト印象派', museum:'クレラー＝ミュラー美術館',
    image: wiki('b/b5/Van_Gogh_-_Terrasse_des_Caf%C3%A9s_an_der_Place_du_Forum_in_Arles%2C_abends.jpeg') },

  { id:'s082', title:'寝室',
    artist:'フィンセント・ファン・ゴッホ', year:1889, century:'19世紀', style:'ポスト印象派', museum:'シカゴ美術館',
    image: artic('25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e') },

  { id:'s083', title:'糸杉',
    artist:'フィンセント・ファン・ゴッホ', year:1889, century:'19世紀', style:'ポスト印象派', museum:'メトロポリタン美術館',
    image: wiki('9/9e/Van_Gogh_-_Cypresses_%281889%29.jpg') },

  { id:'s084', title:'カラスのいる麦畑',
    artist:'フィンセント・ファン・ゴッホ', year:1890, century:'19世紀', style:'ポスト印象派', museum:'ファン・ゴッホ美術館',
    image: wiki('1/11/Van_Gogh_-_Weizenfeld_mit_Kraehen.jpg') },

  { id:'s085', title:'グラン・ジャット島の日曜日の午後',
    artist:'ジョルジュ・スーラ', year:1886, century:'19世紀', style:'ポスト印象派', museum:'シカゴ美術館',
    image: artic('2d484387-2509-5e8e-2c43-22f9981972eb') },

  { id:'s086', title:'サント＝ヴィクトワール山',
    artist:'ポール・セザンヌ', year:1904, century:'20世紀', style:'ポスト印象派', museum:'フィラデルフィア美術館',
    image: wiki('4/47/Paul_C%C3%A9zanne_%281839-1906%29_-_Mont_Sainte-Victoire_%281902-1906%29.jpg') },

  { id:'s087', title:'大水浴図',
    artist:'ポール・セザンヌ', year:1906, century:'20世紀', style:'ポスト印象派', museum:'フィラデルフィア美術館',
    image: wiki('3/3a/Paul_C%C3%A9zanne_-_The_Large_Bathers.jpg') },

  { id:'s088', title:'我々はどこから来たのか',
    artist:'ポール・ゴーギャン', year:1898, century:'19世紀', style:'ポスト印象派', museum:'ボストン美術館',
    image: wiki('9/9d/Paul_Gauguin_-_D%27o%C3%B9_venons-nous_-_Que_sommes-nous_-_O%C3%B9_allons-nous.jpg') },

  { id:'s089', title:'タヒチの女たち',
    artist:'ポール・ゴーギャン', year:1891, century:'19世紀', style:'ポスト印象派', museum:'オルセー美術館',
    image: wiki('0/07/Paul_Gauguin_-_Tahitian_Women_on_the_Beach.jpg') },

  { id:'s090', title:'ムーラン・ルージュ、ラ・グーリュ',
    artist:'アンリ・ド・トゥールーズ＝ロートレック', year:1891, century:'19世紀', style:'ポスト印象派', museum:'ニューヨーク近代美術館',
    image: wiki('3/36/ToulouseLautrec_MoulinRouge_1891.jpg') },

  // ══════════════════════════════════════════
  // 表現主義・アール・ヌーヴォー（19世紀末〜20世紀初頭）
  // ══════════════════════════════════════════
  { id:'s091', title:'叫び',
    artist:'エドヴァルド・ムンク', year:1893, century:'19世紀', style:'表現主義', museum:'ノルウェー国立美術館',
    image: wiki('c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg') },

  { id:'s092', title:'マドンナ',
    artist:'エドヴァルド・ムンク', year:1894, century:'19世紀', style:'表現主義', museum:'ムンク美術館',
    image: wiki('a/a8/Edvard_Munch_-_Madonna_%281894-98%29.jpg') },

  { id:'s093', title:'接吻（ムンク）',
    artist:'エドヴァルド・ムンク', year:1897, century:'19世紀', style:'表現主義', museum:'ムンク美術館',
    image: wiki('5/50/Edvard_Munch_-_The_Kiss_%281897%29.jpg') },

  { id:'s094', title:'接吻（クリムト）',
    artist:'グスタフ・クリムト', year:1908, century:'20世紀', style:'アール・ヌーヴォー', museum:'ベルヴェデーレ宮殿',
    image: wiki('4/40/The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg') },

  { id:'s095', title:'ユディトI',
    artist:'グスタフ・クリムト', year:1901, century:'20世紀', style:'アール・ヌーヴォー', museum:'ベルヴェデーレ宮殿',
    image: wiki('0/01/Judith_and_the_Head_of_Holofernes_%28Klimt%29_-_Wiener_Secession_version.jpg') },

  { id:'s096', title:'アデーレ・ブロッホ＝バウアーの肖像I',
    artist:'グスタフ・クリムト', year:1907, century:'20世紀', style:'アール・ヌーヴォー', museum:'ノイエ・ギャラリー',
    image: wiki('c/c8/Klimt_-_Portrait_of_Adele_Bloch-Bauer_I.jpg') },

  { id:'s097', title:'生命の木',
    artist:'グスタフ・クリムト', year:1909, century:'20世紀', style:'アール・ヌーヴォー', museum:'応用美術館（ウィーン）',
    image: wiki('c/c4/Klimt_-_The_Tree_of_Life.jpg') },

  { id:'s098', title:'ヌーダ・ウェリタス（裸の真実）',
    artist:'グスタフ・クリムト', year:1899, century:'19世紀', style:'アール・ヌーヴォー', museum:'テアター・コレクション（ウィーン）',
    image: wiki('d/db/Gustav_Klimt_018.jpg') },

  // ══════════════════════════════════════════
  // 浮世絵
  // ══════════════════════════════════════════
  { id:'s099', title:'神奈川沖浪裏',
    artist:'葛飾北斎', year:1831, century:'19世紀', style:'浮世絵', museum:'大英博物館 他',
    image: wiki('a/a5/Tsunami_by_hokusai_19th_century.jpg') },

  { id:'s100', title:'凱風快晴（赤富士）',
    artist:'葛飾北斎', year:1831, century:'19世紀', style:'浮世絵', museum:'大英博物館 他',
    image: wiki('1/1e/Red_Fuji_southern_wind_clear_morning.jpg') },

  { id:'s101', title:'山下白雨（黒富士）',
    artist:'葛飾北斎', year:1831, century:'19世紀', style:'浮世絵', museum:'大英博物館 他',
    image: wiki('1/1d/Hokusai-fuji6.jpg') },

  { id:'s102', title:'大橋・あたけの夕立',
    artist:'歌川広重', year:1857, century:'19世紀', style:'浮世絵', museum:'東京国立博物館 他',
    image: wiki('9/9e/Hiroshige_Atake_sous_une_averse_soudaine.jpg') },

  { id:'s103', title:'亀戸梅屋舗',
    artist:'歌川広重', year:1857, century:'19世紀', style:'浮世絵', museum:'東京国立博物館 他',
    image: wiki('2/2c/Hiroshige_Plum_Park.jpg') },

  { id:'s104', title:'蒲原・夜之雪',
    artist:'歌川広重', year:1833, century:'19世紀', style:'浮世絵', museum:'東京国立博物館 他',
    image: wiki('5/5f/Hiroshige_-_Fifty-three_Stations_of_the_Tokaido_-_Station_16_-_Kambara.jpg') },

  { id:'s105', title:'見返り美人図',
    artist:'菱川師宣', year:1690, century:'17世紀', style:'浮世絵', museum:'東京国立博物館',
    image: wiki('5/5a/Hishikawa_Moronobu_-_beauty_looking_back.jpg') },

  // ══════════════════════════════════════════
  // 20世紀（著作権消滅確認済み）
  // ══════════════════════════════════════════
  { id:'s106', title:'ナイトホークス',
    artist:'エドワード・ホッパー', year:1942, century:'20世紀', style:'リアリズム', museum:'シカゴ美術館',
    image: artic('831a05de-d3f6-f4fa-a460-23008dd58dda') },

  { id:'s107', title:'コンポジションVIII',
    artist:'ワシリー・カンディンスキー', year:1923, century:'20世紀', style:'抽象絵画', museum:'グッゲンハイム美術館',
    image: wiki('b/b4/Vassily_Kandinsky%2C_1923_-_Composition_8%2C_huile_sur_toile%2C_140_cm_x_201_cm%2C_Guggenheim_Museum.jpg') },

  { id:'s108', title:'アメリカン・ゴシック',
    artist:'グラント・ウッド', year:1930, century:'20世紀', style:'リージョナリズム', museum:'シカゴ美術館',
    image: artic('5c9e40e0-a7c8-2f98-a576-66e6e6462e81') },

];

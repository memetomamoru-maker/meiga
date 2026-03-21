#!/usr/bin/env node
// fetch-paintings.js  v9
// ARTICをキーワード検索で西洋絵画のみ取得 → タイトルも取得済みなので英語表示最小化
// MET固定ID（確認済み有名作品）を追加

const fs = require('fs');
const path = require('path');
const https = require('https');
const ARTIC = 'https://api.artic.edu/api/v1';
const MET   = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Wiki確認済みのみ
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

// 日本語タイトル変換テーブル
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
  'Stacks of Wheat (End of Summer)':'干し草の積み重ね（夏の終わり）',
  'On the Bank of the Seine, Bennecourt':'セーヌ河畔、ベンヌクール',
  'Breakfast':'朝食','The Artist\'s Bedroom in Arles':'アルルの寝室',
  'The Bedroom':'寝室','Seurat\'s La Grande Jatte':'スーラの大ジャット島',
  'Bathers at Asnières':'アニエールの水浴',
  'The Seine at La Grande Jatte in the Spring':'春のラ・グランド・ジャット島のセーヌ',
  'Portrait of a Lady':'貴婦人の肖像','Portrait of a Man':'男性の肖像',
  'Self-Portrait':'自画像','Woman Reading':'読書する女性',
  'Landscape':'風景','River Landscape':'川の風景',
  'Still Life with Flowers':'花の静物','Still Life with Fruit':'果物の静物',
  'The Artist\'s Mother':'芸術家の母','Village Road':'村の道',
  'Autumn Landscape':'秋の風景','Winter Landscape':'冬の風景',
  'The Holy Family':'聖家族','Madonna and Child':'聖母子',
  'Venus and Cupid':'ヴィーナスとキューピッド','Bacchus':'バッカス',
  'The Crucifixion':'磔刑','The Resurrection':'復活',
  'The Adoration of the Magi':'東方三博士の礼拝','The Last Supper':'最後の晩餐',
  'Saint Jerome':'聖ヒエロニムス','Saint Sebastian':'聖セバスティアヌス',
  'Luncheon of the Boating Party':'舟遊びの昼食',
  'Dance at Le Moulin de la Galette':'ムーラン・ド・ラ・ギャレットの舞踏会',
  'La Grenouillère':'ラ・グルヌイエール',
  'Le Moulin de la Galette':'ムーラン・ド・ラ・ギャレット',
  'By the Seashore':'海辺にて','Woman with a Parasol':'パラソルを持つ女',
  'Young Girls at the Piano':'ピアノを弾く少女たち','Reading':'読書',
  'The Swing':'ブランコ','Interior':'室内','The Bridge':'橋',
  'Return from the Conference':'会議からの帰り',
  'Banks of the Seine':'セーヌ川の岸辺',
  'Path Through the Wheat':'麦畑の小道',
  'Moulin Rouge: La Goulue':'ムーラン・ルージュ：ラ・グーリュ',
  'Jane Avril Leaving the Moulin Rouge':'ムーラン・ルージュを去るジェーヌ・アヴリル',
};

const ARTIST_JA = {
  'Vincent van Gogh':'フィンセント・ファン・ゴッホ','Claude Monet':'クロード・モネ',
  'Pierre-Auguste Renoir':'ピエール＝オーギュスト・ルノワール','Edgar Degas':'エドガー・ドガ',
  'Édouard Manet':'エドゥアール・マネ','Paul Cézanne':'ポール・セザンヌ',
  'Paul Gauguin':'ポール・ゴーギャン','Georges Seurat':'ジョルジュ・スーラ',
  'Henri de Toulouse-Lautrec':'アンリ・ド・トゥールーズ＝ロートレック',
  'Mary Cassatt':'メアリー・カサット','Berthe Morisot':'ベルト・モリゾ',
  'Camille Pissarro':'カミーユ・ピサロ','Alfred Sisley':'アルフレッド・シスレー',
  'Gustave Caillebotte':'ギュスターヴ・カイユボット',
  'Rembrandt van Rijn':'レンブラント・ファン・レイン','Johannes Vermeer':'ヨハネス・フェルメール',
  'Jan Steen':'ヤン・ステーン','Frans Hals':'フランス・ハルス',
  'Peter Paul Rubens':'ピーテル・パウル・ルーベンス','Anthony van Dyck':'アンソニー・ヴァン・ダイク',
  'Jan van Eyck':'ヤン・ファン・エイク','Hans Memling':'ハンス・メムリング',
  'Hieronymus Bosch':'ヒエロニムス・ボス','Pieter Bruegel the Elder':'ピーテル・ブリューゲル（父）',
  'Raphael':'ラファエロ','Titian':'ティツィアーノ','Caravaggio':'カラヴァッジョ',
  'Leonardo da Vinci':'レオナルド・ダ・ヴィンチ','Sandro Botticelli':'サンドロ・ボッティチェッリ',
  'Francisco Goya':'フランシスコ・ゴヤ','Diego Velázquez':'ディエゴ・ベラスケス',
  'El Greco':'エル・グレコ','Jacques-Louis David':'ジャック＝ルイ・ダヴィッド',
  'Eugène Delacroix':'ウジェーヌ・ドラクロワ','Gustave Courbet':'ギュスターヴ・クールベ',
  'Jean-François Millet':'ジャン＝フランソワ・ミレー',
  'William Turner':'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Constable':'ジョン・コンスタブル','Thomas Gainsborough':'トマス・ゲインズバラ',
  'John Singer Sargent':'ジョン・シンガー・サージェント',
  'Winslow Homer':'ウィンスロー・ホーマー','Emanuel Leutze':'エマニュエル・ロイツェ',
  'Thomas Cole':'トマス・コール','Frederic Edwin Church':'フレデリック・エドウィン・チャーチ',
  'Georges-Pierre Seurat':'ジョルジュ・スーラ',
};

// ARTICキーワード検索クエリ（西洋絵画のみ）
const ARTIC_QUERIES = [
  'impressionist france oil painting',
  'post impressionist oil painting',
  'dutch golden age oil painting',
  'italian renaissance oil painting',
  'baroque european oil painting',
  'french romantic realist painting',
  'american landscape oil painting',
  'portrait european oil painting',
];

// MET確認済み有名作品ID（画像・パブリックドメイン確認済み）
const MET_FIXED = [
  437881,436535,436528,436105,436282,437394,11417,435868,
  436218,459055,437329,436947,438722,435650,437133,436305,
  436121,435869,437984,459202,436524,437654,
];

const MET_DEPT_IDS = [11,14];

function fetchJson(url,ms){if(!ms)ms=10000;return new Promise(function(resolve){var t=setTimeout(function(){resolve(null);},ms);var req=https.get(url,{headers:{'User-Agent':'meiga-bot/9.0'}},function(res){if(res.statusCode!==200){clearTimeout(t);res.resume();resolve(null);return;}var body='';res.on('data',function(d){body+=d;});res.on('end',function(){clearTimeout(t);try{resolve(JSON.parse(body));}catch(e){resolve(null);}});res.on('error',function(){clearTimeout(t);resolve(null);});});req.on('error',function(){clearTimeout(t);resolve(null);});});}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function shuffle(a){return a.slice().sort(function(){return Math.random()-0.5;});}
function jt(en){return TITLE_JA[en]||en;}
function ja(en){if(!en)return'作者不詳';if(ARTIST_JA[en])return ARTIST_JA[en];var s=en.replace(/\s*\([^)]*\)/g,'').trim();return ARTIST_JA[s]||s||'作者不詳';}
function cy(y){if(!y||y<=0)return'不明';if(y<=1700)return'〜17世紀';if(y<=1900)return'18〜19世紀';return'20世紀';}
function toMET(d){if(!d||!d.isPublicDomain||!d.primaryImageSmall||!d.objectID)return null;var id='met-'+d.objectID;return{id:id,title:jt(d.title||'無題'),artist:ja(d.artistDisplayName||d.artistAlphaSort||''),year:d.objectEndDate||0,century:cy(d.objectEndDate),museum:'メトロポリタン美術館',museumUrl:'https://www.metmuseum.org/art/collection/search/'+d.objectID,image:d.primaryImageSmall,wikiUrl:WIKI[id]||null};}
function toARTIC(d){if(!d||!d.is_public_domain||!d.image_id||!d.id)return null;var ar=(d.artist_display||'').split('\n')[0].replace(/\s*\([^)]*\)/g,'').split(',')[0].trim();var id='artic-'+d.id;return{id:id,title:jt(d.title||'無題'),artist:ja(ar),year:d.date_end||0,century:cy(d.date_end),museum:'シカゴ美術館',museumUrl:'https://www.artic.edu/artworks/'+d.id,image:'https://www.artic.edu/iiif/2/'+d.image_id+'/full/843,/0/default.jpg',wikiUrl:WIKI[id]||null};}

async function main(){
  console.log('=== fetch-paintings.js v9 ===');
  var flds='id,title,artist_display,date_end,image_id,is_public_domain';

  // ARTIC: キーワード検索で西洋絵画ID収集
  console.log('[ARTIC] キーワード検索中...');
  var searchResults = await Promise.all(ARTIC_QUERIES.map(function(q){
    var url=ARTIC+'/artworks/search?q='+encodeURIComponent(q)+'&query[term][is_public_domain]=true&query[term][artwork_type_title]=Painting&fields=id&limit=25';
    return fetchJson(url,15000);
  }));
  var articIds=Array.from(new Set(searchResults.reduce(function(acc,r){return acc.concat((r&&r.data||[]).map(function(p){return p.id;}));},[])));
  console.log('[ARTIC] IDプール: '+articIds.length+'件');

  // 50件ずつバッチ取得
  var artic=[];
  for(var a=0;a<articIds.length;a+=50){
    var ids=articIds.slice(a,a+50);
    var r=await fetchJson(ARTIC+'/artworks?ids='+ids.join(',')+'&fields='+flds+'&limit=50',15000);
    var v=((r&&r.data)||[]).map(toARTIC).filter(Boolean);
    artic=artic.concat(v);
    console.log('[ARTIC] バッチ'+(Math.floor(a/50)+1)+': '+v.length+'件 累計:'+artic.length);
  }

  // MET固定有名作品
  console.log('[MET] 固定ID '+MET_FIXED.length+'件取得中...');
  var metFixed=await Promise.all(MET_FIXED.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  var met=metFixed.map(toMET).filter(Boolean);
  console.log('[MET] 固定: '+met.length+'件');

  // MET部門からランダム追加
  var dr=await Promise.all(MET_DEPT_IDS.map(function(id){return fetchJson(MET+'/objects?departmentIds='+id,30000);}));
  var mids=Array.from(new Set(dr.reduce(function(acc,r){return acc.concat((r&&r.objectIDs)||[]);},[])));
  var picked=shuffle(mids).slice(0,25);
  var mr=await Promise.all(picked.map(function(id){return fetchJson(MET+'/objects/'+id,8000);}));
  met=met.concat(mr.map(toMET).filter(Boolean));
  console.log('[MET] 合計: '+met.length+'件');

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

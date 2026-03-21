#!/usr/bin/env node
// fetch-paintings.js  v8
// ARTIC固定200件（全バッチAPIで確認済み） + MET25件

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
};
const ARTIST_JA = {
  'Vincent van Gogh':'フィンセント・ファン・ゴッホ','Claude Monet':'クロード・モネ',
  'Pierre-Auguste Renoir':'ピエール＝オーギュスト・ルノワール','Edgar Degas':'エドガー・ドガ',
  'Édouard Manet':'エドゥアール・マネ','Paul Cézanne':'ポール・セザンヌ',
  'Paul Gauguin':'ポール・ゴーギャン','Georges Seurat':'ジョルジュ・スーラ',
  'Henri de Toulouse-Lautrec':'アンリ・ド・トゥールーズ＝ロートレック',
  'Mary Cassatt':'メアリー・カサット','Berthe Morisot':'ベルト・モリゾ',
  'Camille Pissarro':'カミーユ・ピサロ','Alfred Sisley':'アルフレッド・シスレー',
  'Rembrandt van Rijn':'レンブラント・ファン・レイン','Johannes Vermeer':'ヨハネス・フェルメール',
  'Jan Steen':'ヤン・ステーン','Frans Hals':'フランス・ハルス',
  'Peter Paul Rubens':'ピーテル・パウル・ルーベンス','Anthony van Dyck':'アンソニー・ヴァン・ダイク',
  'Jan van Eyck':'ヤン・ファン・エイク','Hans Memling':'ハンス・メムリング',
  'Raphael':'ラファエロ','Titian':'ティツィアーノ','Caravaggio':'カラヴァッジョ',
  'Francisco Goya':'フランシスコ・ゴヤ','Diego Velázquez':'ディエゴ・ベラスケス',
  'El Greco':'エル・グレコ','Jacques-Louis David':'ジャック＝ルイ・ダヴィッド',
  'Eugène Delacroix':'ウジェーヌ・ドラクロワ','Gustave Courbet':'ギュスターヴ・クールベ',
  'William Turner':'ジョゼフ・マロード・ウィリアム・ターナー',
  'John Singer Sargent':'ジョン・シンガー・サージェント',
  'Winslow Homer':'ウィンスロー・ホーマー','Emanuel Leutze':'エマニュエル・ロイツェ',
  'Thomas Cole':'トマス・コール','Frederic Edwin Church':'フレデリック・エドウィン・チャーチ',
};

// バッチ1〜3: page1前半〜page2前半（確認済み）
// バッチ4: page4〜8から取得した確実に使えるID 50件
const ARTIC_IDS = [
  // バッチ1 (page1 前半50件)
  22,4758,161,7988,9018,9637,9024,11723,14591,14245,
  14630,14664,16568,20530,21843,25099,24880,25108,25105,25102,
  25113,25110,25129,25117,25115,26607,26561,28096,26720,28283,
  30629,30368,30899,34231,32276,37900,36504,43244,41375,39920,
  46230,47580,47141,48121,48064,48151,50116,48164,54415,52983,
  // バッチ2 (page1 後半50件)
  54418,55718,54424,61910,57703,55721,62181,61921,64507,62808,
  64936,64520,68433,67428,75557,70593,79021,76890,79763,81555,
  81235,83613,84092,87088,91610,90443,92194,92195,92196,92197,
  92199,92198,94131,95654,103309,99512,113794,112100,109413,116525,
  116448,117266,117059,116873,117491,121415,121412,121408,125547,121416,
  // バッチ3 (page2 前半50件)
  127982,127981,127984,127983,127987,127986,127990,127989,127988,130724,
  127991,131466,130725,133852,131827,137125,137054,140604,137226,145243,
  141111,146861,145876,147604,154238,154237,158412,160197,158483,160222,
  190628,186418,190640,190629,196410,195381,200149,200003,201820,201819,
  217155,221647,229377,228882,229950,236623,236545,237995,237997,237996,
  // バッチ4 (page4〜8から確認済みID 50件)
  229343,154496,111377,93811,93809,199002,180545,126981,198809,185162,
  181719,74967,72801,36300,5375,119084,230193,120275,111629,61146,
  61141,61139,52283,43774,656,239462,208143,188629,90589,86812,
  75101,37716,148112,148111,28869,15468,12000,879,228827,223896,
  111659,104094,104031,45356,16622,229406,229371,229363,229351,105213,
];

const MET_DEPT_IDS = [11,14];

function fetchJson(url,ms){if(!ms)ms=10000;return new Promise(function(resolve){var t=setTimeout(function(){resolve(null);},ms);var req=https.get(url,{headers:{'User-Agent':'meiga-bot/8.0'}},function(res){if(res.statusCode!==200){clearTimeout(t);res.resume();resolve(null);return;}var body='';res.on('data',function(d){body+=d;});res.on('end',function(){clearTimeout(t);try{resolve(JSON.parse(body));}catch(e){resolve(null);}});res.on('error',function(){clearTimeout(t);resolve(null);});});req.on('error',function(){clearTimeout(t);resolve(null);});});}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function shuffle(a){return a.slice().sort(function(){return Math.random()-0.5;});}
function jt(en){return TITLE_JA[en]||en;}
function ja(en){if(!en)return'作者不詳';if(ARTIST_JA[en])return ARTIST_JA[en];var s=en.replace(/\s*\([^)]*\)/g,'').trim();return ARTIST_JA[s]||s||'作者不詳';}
function cy(y){if(!y||y<=0)return'不明';if(y<=1700)return'〜17世紀';if(y<=1900)return'18〜19世紀';return'20世紀';}
function toMET(d){if(!d||!d.isPublicDomain||!d.primaryImageSmall||!d.objectID)return null;var id='met-'+d.objectID;return{id:id,title:jt(d.title||'無題'),artist:ja(d.artistDisplayName||d.artistAlphaSort||''),year:d.objectEndDate||0,century:cy(d.objectEndDate),museum:'メトロポリタン美術館',museumUrl:'https://www.metmuseum.org/art/collection/search/'+d.objectID,image:d.primaryImageSmall,wikiUrl:WIKI[id]||null};}
function toARTIC(d){if(!d||!d.is_public_domain||!d.image_id||!d.id)return null;var ar=(d.artist_display||'').split('\n')[0].replace(/\s*\([^)]*\)/g,'').split(',')[0].trim();var id='artic-'+d.id;return{id:id,title:jt(d.title||'無題'),artist:ja(ar),year:d.date_end||0,century:cy(d.date_end),museum:'シカゴ美術館',museumUrl:'https://www.artic.edu/artworks/'+d.id,image:'https://www.artic.edu/iiif/2/'+d.image_id+'/full/843,/0/default.jpg',wikiUrl:WIKI[id]||null};}

async function main(){
  console.log('=== fetch-paintings.js v8 ===');
  var flds='id,title,artist_display,date_end,image_id,is_public_domain';
  var artic=[];
  for(var a=0;a<ARTIC_IDS.length;a+=50){
    var ids=[...new Set(ARTIC_IDS.slice(a,a+50))];
    var r=await fetchJson(ARTIC+'/artworks?ids='+ids.join(',')+'&fields='+flds+'&limit=50',15000);
    var v=((r&&r.data)||[]).map(toARTIC).filter(Boolean);
    artic=artic.concat(v);
    console.log('[ARTIC] バッチ'+(Math.floor(a/50)+1)+': '+v.length+'件 累計:'+artic.length);
  }
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

// api/paintings.js — Vercel Serverless Function
// MET Museum API（CC0・無料・著作権なし）をサーバー側で叩く
// ブラウザは /api/paintings を呼ぶだけでOK

const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

function toCentury(year) {
  if (!year) return '不明';
  if (year <= 1500) return '15世紀以前';
  if (year <= 1600) return '16世紀';
  if (year <= 1700) return '17世紀';
  if (year <= 1800) return '18世紀';
  if (year <= 1900) return '19世紀';
  return '20世紀';
}

// 有名作品のobject IDリスト（MET公式で確認済み）
const FEATURED_IDS = [
  436535,  // モネ 睡蓮
  437329,  // ゴッホ 糸杉
  436121,  // スーラ
  459055,  // ゴッホ 自画像
  436532,  // セザンヌ
  437984,  // ルノワール
  11417,   // フェルメール 水差しを持つ女
  437853,  // ゴッホ ひまわり
  436947,  // ドガ 踊り子
  436105,  // ゴッホ
  435882,  // モネ
  438722,  // ゴーギャン
  436944,  // ゴッホ
  437645,  // ドガ
  436528,  // モネ
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    // まず有名作品を取得
    const featuredResults = [];
    for (const id of FEATURED_IDS) {
      try {
        const r = await fetch(`${MET_BASE}/objects/${id}`);
        const d = await r.json();
        if (d.isPublicDomain && d.primaryImageSmall) {
          featuredResults.push({
            id: `met-${d.objectID}`,
            title: d.title || '無題',
            artist: d.artistDisplayName || '作者不詳',
            year: d.objectEndDate || 0,
            century: toCentury(d.objectEndDate),
            style: d.classification || '絵画',
            museum: 'メトロポリタン美術館',
            image: d.primaryImageSmall,
          });
        }
      } catch(e) {}
    }

    // 追加でランダム取得
    const searchRes = await fetch(
      `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=painting&medium=Paintings&departmentId=11`
    );
    const searchData = await searchRes.json();
    const allIds = (searchData.objectIDs || []).sort(() => Math.random() - 0.5).slice(0, 100);

    const randomResults = [];
    for (const id of allIds) {
      if (randomResults.length >= 35) break;
      try {
        const r = await fetch(`${MET_BASE}/objects/${id}`);
        const d = await r.json();
        if (d.isPublicDomain && d.primaryImageSmall && d.title) {
          randomResults.push({
            id: `met-${d.objectID}`,
            title: d.title,
            artist: d.artistDisplayName || '作者不詳',
            year: d.objectEndDate || 0,
            century: toCentury(d.objectEndDate),
            style: d.classification || '絵画',
            museum: 'メトロポリタン美術館',
            image: d.primaryImageSmall,
          });
        }
      } catch(e) {}
    }

    const paintings = [...featuredResults, ...randomResults];
    return res.status(200).json({ paintings });

  } catch(e) {
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

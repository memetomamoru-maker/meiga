// api/paintings.js
// MET Museum APIから作品を取得するVercel Serverless Function

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

const FEATURED_IDS = [
  436535, 437329, 436121, 459055, 436532,
  437984, 11417,  437853, 436947, 436105,
  435882, 438722, 436944, 437645, 436528,
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    // 1. 有名作品を並列で取得
    const featuredPromises = FEATURED_IDS.map(id =>
      fetch(`${MET_BASE}/objects/${id}`).then(r => r.json()).catch(() => null)
    );

    // 2. ランダム作品のIDリストを取得
    const searchRes = await fetch(
      `${MET_BASE}/search?hasImages=true&isPublicDomain=true&q=painting&medium=Paintings&departmentId=11`
    );
    const searchData = await searchRes.json();

    // タイムアウトを防ぐため20件に制限
    const allIds = (searchData.objectIDs || []).sort(() => Math.random() - 0.5).slice(0, 20);

    // 3. ランダム作品を並列で取得
    const randomPromises = allIds.map(id =>
      fetch(`${MET_BASE}/objects/${id}`).then(r => r.json()).catch(() => null)
    );

    // すべてのAPIリクエストを並列で完了
    const featuredResultsData = await Promise.all(featuredPromises);
    const randomResultsData   = await Promise.all(randomPromises);

    const processItem = (d) => {
      if (d && d.isPublicDomain && d.primaryImageSmall) {
        return {
          id:      `met-${d.objectID}`,
          title:   d.title || '無題',
          artist:  d.artistDisplayName || '作者不詳',
          year:    d.objectEndDate || 0,
          century: toCentury(d.objectEndDate),
          style:   d.classification || '絵画',
          museum:  'メトロポリタン美術館',
          image:   d.primaryImageSmall,
        };
      }
      return null;
    };

    const featuredResults = featuredResultsData.map(processItem).filter(Boolean);
    const randomResults   = randomResultsData.map(processItem).filter(Boolean);
    const paintings       = [...featuredResults, ...randomResults];

    return res.status(200).json({ paintings });

  } catch(e) {
    return res.status(500).json({ error: e.message, paintings: [] });
  }
};

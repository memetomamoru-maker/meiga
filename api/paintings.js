// api/paintings.js
// public/paintings.json を読んで返すだけ
// 実際のデータ取得は GitHub Actions (scripts/fetch-paintings.js) が担当

const fs   = require('fs');
const path = require('path');
// Wikimedia Commons のパブリックドメイン・CC0画像を収蔵館の作品IDで照合。
const imageFallbacks = require('../data/painting-image-fallbacks.json');
const clevelandFallbacks = require('../data/cleveland-image-fallbacks.json');
const archivedChicagoIds = new Set(require('../data/chicago-archived-ids.json'));
const clevelandWebImage = /^(https:\/\/openaccess-cdn\.clevelandart\.org\/[^/]+\/[^/]+)_web\.jpg$/;

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const filePath = path.join(process.cwd(), 'public', 'paintings.json');

    if (!fs.existsSync(filePath)) {
      // JSONがまだ生成されていない場合（初回デプロイ直後など）
      return res.status(503).json({
        error: 'paintings.json がまだ生成されていません。GitHub Actions を手動実行してください。',
        paintings: [],
        total: 0,
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.paintings = data.paintings
      .filter(({ id }) => !id.startsWith('artic-') || archivedChicagoIds.has(id) || imageFallbacks[id])
      .map(painting => {
        if (archivedChicagoIds.has(painting.id)) {
          return {
            ...painting,
            image: `/images/chicago/${painting.id.slice('artic-'.length)}.jpg`,
            fallbackImage: painting.image,
          };
        }
        if (painting.id.startsWith('cma-')) {
          // 旧データのWeb版URLからも、同じ作品の公式プリント版を補完する。
          const printImage = painting.printImage || (clevelandWebImage.test(painting.image)
            ? painting.image.replace(clevelandWebImage, '$1_print.jpg')
            : null);
          return { ...painting, printImage, fallbackImage: clevelandFallbacks[painting.id] || null };
        }
        const fallbackImage = imageFallbacks[painting.id];
        return fallbackImage ? { ...painting, fallbackImage } : painting;
      });
    data.total = data.paintings.length;
    data.sources.artic = data.paintings.filter(({ id }) => id.startsWith('artic-')).length;
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message, paintings: [], total: 0 });
  }
};

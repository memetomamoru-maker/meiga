// api/paintings.js — Vercel Serverless Function
// MET Museum API（CC0・完全無料・著作権問題なし）をサーバー側で叩く
// ブラウザからCORSなしで /api/paintings?page=1 で呼び出せる

export const config = { runtime: 'edge' };

const MET_SEARCH = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=painting&medium=Paintings&departmentId=11';
const MET_OBJECT = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

function toCentury(year) {
  if (!year) return '不明';
  if (year <= 1500) return '15世紀以前';
  if (year <= 1600) return '16世紀';
  if (year <= 1700) return '17世紀';
  if (year <= 1800) return '18世紀';
  if (year <= 1900) return '19世紀';
  return '20世紀';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const PER_PAGE = 50;

  try {
    // 全IDを取得
    const searchRes = await fetch(MET_SEARCH);
    const searchData = await searchRes.json();
    const allIds = searchData.objectIDs || [];

    // ページ分割してランダムに選ぶ（毎回シャッフル）
    const shuffled = allIds.sort(() => Math.random() - 0.5);
    const startIdx = ((page - 1) * PER_PAGE) % shuffled.length;
    const ids = shuffled.slice(startIdx, startIdx + PER_PAGE * 3); // 3倍取って絞る

    const paintings = [];
    for (const id of ids) {
      if (paintings.length >= PER_PAGE) break;
      try {
        const r = await fetch(MET_OBJECT + id);
        const d = await r.json();
        if (!d.isPublicDomain || !d.primaryImageSmall || !d.title) continue;
        paintings.push({
          id:      `met-${d.objectID}`,
          title:   d.title,
          artist:  d.artistDisplayName || '作者不詳',
          year:    d.objectEndDate || 0,
          century: toCentury(d.objectEndDate),
          style:   d.classification || '絵画',
          museum:  'メトロポリタン美術館',
          image:   d.primaryImageSmall,
        });
      } catch (e) {}
    }

    return new Response(JSON.stringify({ paintings }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=600',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, paintings: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// api/famous.js
// public/famous100.json を読んで返す

const fs   = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  try {
    const filePath = path.join(process.cwd(), 'public', 'famous100.json');

    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ paintings: [], total: 0 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return res.status(200).json(data);

  } catch (e) {
    console.error(e);
    return res.status(200).json({ paintings: [], total: 0 });
  }
};

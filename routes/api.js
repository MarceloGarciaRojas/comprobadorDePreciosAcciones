const crypto = require('crypto');
const fetch = require('node-fetch');

const likesDB = {};

function anonymizeIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = function (app) {
  app.get('/api/stock-prices', async (req, res) => {
    try {
      let { stock, like } = req.query;
      const ipHash = anonymizeIp(req.ip || req.connection.remoteAddress || 'unknown');

      if (!Array.isArray(stock)) {
        stock = [stock];
      }

      const stockData = await Promise.all(
        stock.map(async (symbol) => {
          const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
          );
          const data = await response.json();
          const normalizedSymbol = data.symbol.toUpperCase();

          if (!likesDB[normalizedSymbol]) {
            likesDB[normalizedSymbol] = { likes: 0, ips: [] };
          }

          if (like === 'true' && !likesDB[normalizedSymbol].ips.includes(ipHash)) {
            likesDB[normalizedSymbol].likes += 1;
            likesDB[normalizedSymbol].ips.push(ipHash);
          }

          return {
            stock: normalizedSymbol,
            price: data.latestPrice,
            likes: likesDB[normalizedSymbol].likes
          };
        })
      );

      if (stockData.length === 1) {
        return res.json({ stockData: stockData[0] });
      }

      return res.json({
        stockData: [
          {
            stock: stockData[0].stock,
            price: stockData[0].price,
            rel_likes: stockData[0].likes - stockData[1].likes
          },
          {
            stock: stockData[1].stock,
            price: stockData[1].price,
            rel_likes: stockData[1].likes - stockData[0].likes
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener datos' });
    }
  });
};

'use strict';

const https = require('https');

const likesByStock = {};

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.connection.remoteAddress || 'unknown';
}

function normalizeStock(stock) {
  return String(stock || '').trim().toUpperCase();
}

function getStockPrice(stock) {
  const symbol = encodeURIComponent(stock);
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;

  return new Promise(function (resolve, reject) {
    https
      .get(url, function (response) {
        let data = '';

        response.on('data', function (chunk) {
          data += chunk;
        });

        response.on('end', function () {
          try {
            const parsed = JSON.parse(data);

            resolve({
              stock: normalizeStock(parsed.symbol || parsed.stock || stock),
              price: Number(parsed.latestPrice || parsed.price || 0)
            });
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

function addLike(stock, ip) {
  if (!likesByStock[stock]) {
    likesByStock[stock] = new Set();
  }

  likesByStock[stock].add(ip);
}

function getLikes(stock) {
  if (!likesByStock[stock]) {
    return 0;
  }

  return likesByStock[stock].size;
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      const stockQuery = req.query.stock;
      const shouldLike = req.query.like === 'true' || req.query.like === true;
      const ip = getClientIp(req);

      if (!stockQuery) {
        return res.json({ stockData: {} });
      }

      const stocks = Array.isArray(stockQuery)
        ? stockQuery.map(normalizeStock)
        : [normalizeStock(stockQuery)];

      if (shouldLike) {
        stocks.forEach(function (stock) {
          addLike(stock, ip);
        });
      }

      const stockData = await Promise.all(
        stocks.map(async function (stock) {
          const data = await getStockPrice(stock);

          return {
            stock: data.stock,
            price: data.price,
            likes: getLikes(stock)
          };
        })
      );

      if (stockData.length === 1) {
        return res.json({
          stockData: stockData[0]
        });
      }

      const first = stockData[0];
      const second = stockData[1];

      return res.json({
        stockData: [
          {
            stock: first.stock,
            price: first.price,
            rel_likes: first.likes - second.likes
          },
          {
            stock: second.stock,
            price: second.price,
            rel_likes: second.likes - first.likes
          }
        ]
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Error al consultar el precio de la acción'
      });
    }
  });
};
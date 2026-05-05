'use strict';

const https = require('https');

const likes = {};

function normalizeStock(stock) {
  return String(stock || '').trim().toUpperCase();
}

function getIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.connection.remoteAddress || 'unknown';
}

function addLike(stock, ip) {
  if (!likes[stock]) {
    likes[stock] = [];
  }

  if (likes[stock].indexOf(ip) === -1) {
    likes[stock].push(ip);
  }
}

function getLikes(stock) {
  return likes[stock] ? likes[stock].length : 0;
}

function getStockPrice(stock) {
  const symbol = encodeURIComponent(stock);
  const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + symbol + '/quote';

  return new Promise(function (resolve, reject) {
    https.get(url, function (response) {
      let body = '';

      response.on('data', function (chunk) {
        body += chunk;
      });

      response.on('end', function () {
        try {
          const data = JSON.parse(body);

          resolve({
            stock: normalizeStock(data.symbol || stock),
            price: Number(data.latestPrice || data.price || 0)
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stockQuery = req.query.stock;
      const like = req.query.like === 'true' || req.query.like === true;
      const ip = getIp(req);

      if (!stockQuery) {
        return res.json({ stockData: {} });
      }

      const stocks = Array.isArray(stockQuery)
        ? stockQuery.map(normalizeStock).slice(0, 2)
        : [normalizeStock(stockQuery)];

      if (like) {
        stocks.forEach(function (stock) {
          addLike(stock, ip);
        });
      }

      Promise.all(stocks.map(getStockPrice))
        .then(function (stockResults) {
          if (stockResults.length === 1) {
            const onlyStock = stockResults[0];

            return res.json({
              stockData: {
                stock: onlyStock.stock,
                price: onlyStock.price,
                likes: getLikes(stocks[0])
              }
            });
          }

          const first = stockResults[0];
          const second = stockResults[1];

          const firstLikes = getLikes(stocks[0]);
          const secondLikes = getLikes(stocks[1]);

          return res.json({
            stockData: [
              {
                stock: first.stock,
                price: first.price,
                rel_likes: firstLikes - secondLikes
              },
              {
                stock: second.stock,
                price: second.price,
                rel_likes: secondLikes - firstLikes
              }
            ]
          });
        })
        .catch(function () {
          return res.status(500).json({
            error: 'Error getting stock price'
          });
        });
    });
};
const fetch = require('node-fetch');

const likesDB = {};

module.exports = function (app) {

  app.get('/api/stock-prices', async (req, res) => {
    try {
      let stock = req.query.stock;
      const like = req.query.like;
      const ip = req.ip;

      if (!Array.isArray(stock)) {
        stock = [stock];
      }

      const stockData = await Promise.all(
        stock.map(async (s) => {
          const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${s}/quote`
          );
          const data = await response.json();

          // Inicializar si no existe
          const symbol = data.symbol;

        if (!likesDB[symbol]) {
            likesDB[symbol] = { likes: 0, ips: [] };
        }

          //  Manejo de likes por IP
        if (like === 'true' && !likesDB[symbol].ips.includes(ip)) {
            likesDB[symbol].likes++;
            likesDB[symbol].ips.push(ip);
        } 

          return {
            stock: data.symbol,
            price: data.latestPrice,
            likes: likesDB[symbol].likes
          };
        })
      );

      //  Una sola acción
      if (stockData.length === 1) {
        return res.json({ stockData: stockData[0] });
      }

      //  Dos acciones → calcular rel_likes
      const rel_likes_1 = stockData[0].likes - stockData[1].likes;
      const rel_likes_2 = stockData[1].likes - stockData[0].likes;

      return res.json({
        stockData: [
          {
            stock: stockData[0].stock,
            price: stockData[0].price,
            rel_likes: rel_likes_1
          },
          {
            stock: stockData[1].stock,
            price: stockData[1].price,
            rel_likes: rel_likes_2
          }
        ]
      });

    } catch (error) {
      res.status(500).json({ error: 'Error al obtener datos' });
    }
  });

};
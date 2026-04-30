const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const assert = chai.assert;
chai.use(chaiHttp);

describe('Functional Tests', function () {
    this.timeout(10000);
  // 1️⃣ Ver un stock
  it('Ver un stock', function (done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.exists(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  // 2️⃣ Ver un stock y darle like
  it('Ver un stock y darle like', function (done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  // 3️⃣ Dar like de nuevo (no debe aumentar)
  it('Dar like de nuevo (misma IP)', function (done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function (err, res) {
        const likes = res.body.stockData.likes;

        chai.request(server)
          .get('/api/stock-prices?stock=GOOG&like=true')
          .end(function (err2, res2) {
            assert.equal(res2.body.stockData.likes, likes);
            done();
          });
      });
  });

  // 4️⃣ Ver dos acciones
  it('Ver dos acciones', function (done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=AAPL')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        done();
      });
  });

  // 5️⃣ Ver dos acciones con like
  it('Ver dos acciones con like', function (done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=AAPL&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.exists(res.body.stockData[0].rel_likes);
        assert.exists(res.body.stockData[1].rel_likes);
        done();
      });
  });

});
'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(10000);

  test('GET /api/stock-prices con una acción', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('GET /api/stock-prices con una acción y like', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'MSFT', like: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'MSFT');
        assert.isNumber(res.body.stockData.price);
        assert.isAtLeast(res.body.stockData.likes, 1);
        done();
      });
  });

  test('GET /api/stock-prices con una acción y like duplicado', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'MSFT', like: 'true' })
      .end(function (err, firstRes) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: 'MSFT', like: 'true' })
          .end(function (err, secondRes) {
            assert.equal(secondRes.status, 200);
            assert.equal(
              secondRes.body.stockData.likes,
              firstRes.body.stockData.likes
            );
            done();
          });
      });
  });

  test('GET /api/stock-prices con dos acciones', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'AAPL'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

  test('GET /api/stock-prices con dos acciones y like', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'AAPL'], like: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });
});
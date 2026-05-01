const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const assert = chai.assert;
chai.use(chaiHttp);

describe('Functional Tests', function () {
  this.timeout(15000);

  it('Viewing one stock: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  it('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=MSFT&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'MSFT');
        assert.isNumber(res.body.stockData.price);
        assert.equal(res.body.stockData.likes, 1);
        done();
      });
  });

  it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=MSFT&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'MSFT');
        assert.equal(res.body.stockData.likes, 1);
        done();
      });
  });

  it('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&stock=AAPL')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'AAPL');
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });

  it('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&stock=AAPL&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'AAPL');
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(res.body.stockData[0].rel_likes, -res.body.stockData[1].rel_likes);
        done();
      });
  });
});

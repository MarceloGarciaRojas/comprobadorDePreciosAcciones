'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api.js');

const app = express();

/*
  freeCodeCamp Stock Price Checker:
  El bot espera que scripts y CSS solo carguen desde el propio servidor.
  Header mínimo y directo para evitar problemas con versiones de Helmet.
*/
app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self'; style-src 'self'"
  );
  next();
});

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

apiRoutes(app);

app.use(function (req, res) {
  res.status(404).type('text').send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});

module.exports = app;
'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');

const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  })
);

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
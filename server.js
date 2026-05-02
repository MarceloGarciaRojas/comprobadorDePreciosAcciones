require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(function(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self'; style-src 'self';"
  );
  next();
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

const apiRoutes = require('./routes/api.js');
apiRoutes(app);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = app;
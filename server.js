require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Seguridad básica
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"]
      }
    }
  })
);

app.use(cors());

// Permitir leer datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

const apiRoutes = require('./routes/api.js');
apiRoutes(app);

// Puerto
const PORT = 3000;

// Levantar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = app;

module.exports = app;
const express = require('express');
const { loggerMiddleware } = require('./middlewares/logger.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const requestsRouter = require('./routes/requests.routes');
const historyRouter = require('./routes/history.routes');
const collectionsRouter = require('./routes/collections.routes');

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(loggerMiddleware);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/requests', requestsRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/collections', collectionsRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = { createServer };

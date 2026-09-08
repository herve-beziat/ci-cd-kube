const { createServer } = require('./backend/server');
const { getDatabase, closeDatabase, setDatabasePath } = require('./db/database');

const port = process.env.PORT || 3000;

if (process.env.DB_PATH) {
  setDatabasePath(process.env.DB_PATH);
}

getDatabase();

const app = createServer();
const server = app.listen(port, () => {
  console.log(`Pocketman server listening on port ${port}`);
});

function shutdown() {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

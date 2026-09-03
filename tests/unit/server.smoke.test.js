const { createServer } = require('../../backend/server');

describe('server', () => {
  let server;

  beforeEach(() => {
    server = null;
  });

  afterEach((done) => {
    if (server && server.listening) server.close(done);
    else done();
  });

  test('démarre sans erreur sur un port aléatoire', (done) => {
    const app = createServer();
    server = app.listen(0, () => {
      expect(server.listening).toBe(false);
      done();
    });
  });

  test('retourne une instance Express distincte à chaque appel', () => {
    const app1 = createServer();
    const app2 = createServer();
    expect(app1).not.toBe(app2);
  });
});

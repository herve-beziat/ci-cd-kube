const { errorMiddleware } = require('../../../backend/middlewares/error.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorMiddleware', () => {
  test('retourne status 500 et un JSON { error } pour une erreur générique', () => {
    const err = new Error('Erreur inattendue');
    const res = mockRes();

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur inattendue' });
  });

  test('utilise err.status si défini', () => {
    const err = Object.assign(new Error('Non trouvé'), { status: 404 });
    const res = mockRes();

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Non trouvé' });
  });

  test('retourne un message par défaut si err.message est absent', () => {
    const err = {};
    const res = mockRes();

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur interne du serveur' });
  });
});

const { loggerMiddleware } = require('../../../backend/middlewares/logger.middleware');

describe('loggerMiddleware', () => {
  test('appelle next()', () => {
    const req = { method: 'GET', url: '/api/health' };
    const res = { on: jest.fn() };
    const next = jest.fn();

    loggerMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('enregistre un handler sur l\'événement finish de la réponse', () => {
    const req = { method: 'POST', url: '/api/requests/send' };
    const res = { on: jest.fn() };
    const next = jest.fn();

    loggerMiddleware(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  test('le handler finish loggue méthode, url et statusCode', () => {
    const req = { method: 'GET', url: '/api/history' };
    const res = { on: jest.fn(), statusCode: 200 };
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    loggerMiddleware(req, res, next);
    const finishHandler = res.on.mock.calls[0][1];
    finishHandler();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('GET'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('/api/history'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('200'));

    consoleSpy.mockRestore();
  });
});

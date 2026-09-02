const { sendRequest } = require('../../../backend/services/requests.service');

function mockFetch(status, body, contentType = 'application/json') {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    headers: {
      get: (key) => key === 'content-type' ? contentType : null,
      entries: () => [['content-type', contentType]][Symbol.iterator](),
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  });
}

afterEach(() => jest.restoreAllMocks());

describe('sendRequest — méthodes HTTP', () => {
  test.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])('envoie une requête %s', async (method) => {
    mockFetch(200, { ok: true });
    const result = await sendRequest({ method, url: 'http://test.local' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.local',
      expect.objectContaining({ method })
    );
    expect(result.statusCode).toBe(200);
  });
});

describe('sendRequest — headers', () => {
  test('transmet les headers custom', async () => {
    mockFetch(200, {});
    await sendRequest({
      method: 'GET',
      url: 'http://test.local',
      headers: { Authorization: 'Bearer token', 'X-Custom': 'value' },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.local',
      expect.objectContaining({
        headers: { Authorization: 'Bearer token', 'X-Custom': 'value' },
      })
    );
  });
});

describe('sendRequest — body', () => {
  test('sérialise le body en JSON pour POST', async () => {
    mockFetch(201, {});
    await sendRequest({
      method: 'POST',
      url: 'http://test.local',
      body: { name: 'test' },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.local',
      expect.objectContaining({ body: '{"name":"test"}' })
    );
  });

  test('n\'envoie pas de body pour GET', async () => {
    mockFetch(200, {});
    await sendRequest({ method: 'GET', url: 'http://test.local', body: { name: 'test' } });
    const options = global.fetch.mock.calls[0][1];
    expect(options.body).toBeUndefined();
  });
});

describe('sendRequest — réponse non-JSON', () => {
  test('retourne le texte brut si content-type n\'est pas JSON', async () => {
    mockFetch(200, 'OK', 'text/plain');
    const result = await sendRequest({ method: 'GET', url: 'http://test.local' });
    expect(result.body).toBe('OK');
  });
});

describe('sendRequest — timeout', () => {
  test('lève une erreur 408 si la requête dépasse le timeout', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    await expect(sendRequest({ method: 'GET', url: 'http://test.local' }))
      .rejects.toMatchObject({ status: 408 });
  });
});

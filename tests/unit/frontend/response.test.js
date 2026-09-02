const { getStatusClass, getStatusLabel, formatStatus, formatBody } = require('../../../frontend/response');

describe('getStatusClass()', () => {
  test.each([
    [200, 'status-2xx'],
    [201, 'status-2xx'],
    [301, 'status-3xx'],
    [304, 'status-3xx'],
    [400, 'status-4xx'],
    [404, 'status-4xx'],
    [500, 'status-5xx'],
    [503, 'status-5xx'],
  ])('code %i → classe %s', (code, expected) => {
    expect(getStatusClass(code)).toBe(expected);
  });

  test('retourne une chaîne vide pour les codes < 200', () => {
    expect(getStatusClass(100)).toBe('');
  });
});

describe('getStatusLabel()', () => {
  test('retourne le libellé pour les codes connus', () => {
    expect(getStatusLabel(200)).toBe('OK');
    expect(getStatusLabel(404)).toBe('Not Found');
    expect(getStatusLabel(500)).toBe('Internal Server Error');
  });

  test('retourne une chaîne vide pour les codes inconnus', () => {
    expect(getStatusLabel(999)).toBe('');
  });
});

describe('formatStatus()', () => {
  test('retourne "200 OK" pour 200', () => {
    expect(formatStatus(200)).toBe('200 OK');
  });

  test('retourne juste le code pour un code inconnu', () => {
    expect(formatStatus(999)).toBe('999');
  });
});

describe('formatBody()', () => {
  test('indente un objet JSON', () => {
    const result = formatBody({ a: 1, b: 2 });
    expect(result).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
  });

  test('indente une chaîne JSON valide', () => {
    const result = formatBody('{"a":1}');
    expect(result).toBe('{\n  "a": 1\n}');
  });

  test('retourne le texte brut si non-JSON', () => {
    expect(formatBody('Hello world')).toBe('Hello world');
  });

  test('retourne une chaîne vide pour null', () => {
    expect(formatBody(null)).toBe('');
  });

  test('retourne une chaîne vide pour undefined', () => {
    expect(formatBody(undefined)).toBe('');
  });
});

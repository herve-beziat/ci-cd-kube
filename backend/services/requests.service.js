const TIMEOUT_MS = 30000;
const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

async function sendRequest({ method, url, headers = {}, body = null }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const options = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body && BODY_METHODS.includes(method)) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const start = Date.now();
    const response = await fetch(url, options);
    const responseTime = Date.now() - start;

    const responseHeaders = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get('content-type') || '';
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
      responseTime,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error(`La requête a expiré après ${TIMEOUT_MS / 1000}s`);
      error.status = 408;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { sendRequest };

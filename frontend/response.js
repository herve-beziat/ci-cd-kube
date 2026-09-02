function getStatusClass(code) {
  if (code >= 500) return 'status-5xx';
  if (code >= 400) return 'status-4xx';
  if (code >= 300) return 'status-3xx';
  if (code >= 200) return 'status-2xx';
  return '';
}

function getStatusLabel(code) {
  const labels = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 408: 'Request Timeout', 409: 'Conflict',
    422: 'Unprocessable Entity', 500: 'Internal Server Error',
    502: 'Bad Gateway', 503: 'Service Unavailable',
  };
  return labels[code] || '';
}

function formatStatus(code) {
  const label = getStatusLabel(code);
  return label ? `${code} ${label}` : String(code);
}

function formatBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  if (body === null || body === undefined) return '';
  return JSON.stringify(body, null, 2);
}

// Compatible browser (script tag) et Jest (require)
if (typeof module !== 'undefined') {
  module.exports = { getStatusClass, getStatusLabel, formatStatus, formatBody };
}

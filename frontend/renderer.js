let apiBase = '';

// ── Theme ─────────────────────────────────────────────────────────────────────

const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'light' ? '☾' : '☀';
}

themeToggle.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('pocketman-theme', next);
  applyTheme(next);
});

applyTheme(localStorage.getItem('pocketman-theme') || 'dark');

async function init() {
  if (window.electronAPI) {
    const port = await window.electronAPI.getPort();
    apiBase = `http://localhost:${port}`;
  }
  await loadHistory();
  await loadCollections();
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ── Headers ───────────────────────────────────────────────────────────────────

function addHeaderRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'header-row';
  row.innerHTML = `
    <input type="text" placeholder="Clé" value="${key}">
    <input type="text" placeholder="Valeur" value="${value}">
    <button type="button" class="remove-btn">✕</button>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  document.getElementById('headers-list').appendChild(row);
}

document.getElementById('add-header').addEventListener('click', () => addHeaderRow());

function getHeaders() {
  const headers = {};
  document.querySelectorAll('.header-row').forEach(row => {
    const [key, value] = row.querySelectorAll('input');
    if (key.value.trim()) headers[key.value.trim()] = value.value.trim();
  });
  return headers;
}

// ── Form submit ───────────────────────────────────────────────────────────────

document.getElementById('request-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await sendRequest();
});

async function sendRequest() {
  const method = document.getElementById('method').value;
  const url = document.getElementById('url').value.trim();
  const headers = getHeaders();
  const rawBody = document.getElementById('body').value.trim();
  const sendBtn = document.querySelector('.send-btn');

  let body = null;
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      showError('Le body n\'est pas un JSON valide.');
      return;
    }
  }

  sendBtn.disabled = true;
  sendBtn.textContent = '…';

  try {
    const res = await fetch(`${apiBase}/api/requests/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, url, headers, body }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Erreur serveur');
      return;
    }

    showResponse(data);
    await loadHistory();
  } catch {
    showError('Impossible de joindre le serveur local.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Envoyer';
  }
}

// ── Response tabs ─────────────────────────────────────────────────────────────

document.querySelectorAll('[data-rtab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-rtab]').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.response-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`rtab-${tab.dataset.rtab}`).classList.add('active');
  });
});

// ── Response display ──────────────────────────────────────────────────────────

function showResponse({ statusCode, headers, body, responseTime }) {
  const meta = document.getElementById('response-meta');
  const tabs = document.getElementById('response-tabs');
  const statusEl = document.getElementById('response-status');
  const timeEl = document.getElementById('response-time');
  const bodyEl = document.getElementById('response-body');
  const headersTable = document.getElementById('response-headers-table');

  meta.classList.remove('hidden');
  tabs.classList.remove('hidden');

  statusEl.textContent = formatStatus(statusCode);
  statusEl.className = `response-status ${getStatusClass(statusCode)}`;
  timeEl.textContent = `${responseTime}ms`;

  bodyEl.textContent = formatBody(body);

  headersTable.innerHTML = Object.entries(headers || {})
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join('');
}

function showError(message) {
  document.getElementById('response-meta').classList.add('hidden');
  document.getElementById('response-tabs').classList.add('hidden');
  document.getElementById('response-body').textContent = `Erreur : ${message}`;
}

// ── History ───────────────────────────────────────────────────────────────────

async function loadHistory() {
  try {
    const res = await fetch(`${apiBase}/api/history`);
    const entries = await res.json();
    renderHistory(entries);
  } catch {
    // silently ignore — history is non-critical
  }
}

function renderHistory(entries) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  if (entries.length === 0) {
    list.innerHTML = '<li class="history-empty">Aucune requête</li>';
    return;
  }

  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <button type="button" class="history-load" data-id="${entry.id}">
        <span class="history-method method-${entry.method.toLowerCase()}">${entry.method}</span>
        <span class="history-url">${entry.url}</span>
      </button>
      <button type="button" class="history-delete" data-id="${entry.id}" title="Supprimer">✕</button>
    `;

    li.querySelector('.history-load').addEventListener('click', () => loadFromHistory(entry));
    li.querySelector('.history-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteHistoryEntry(entry.id);
    });

    list.appendChild(li);
  });
}

function loadFromHistory(entry) {
  document.getElementById('method').value = entry.method;
  document.getElementById('url').value = entry.url;

  document.getElementById('headers-list').innerHTML = '';
  Object.entries(entry.headers || {}).forEach(([k, v]) => addHeaderRow(k, v));

  document.getElementById('body').value = entry.body
    ? JSON.stringify(entry.body, null, 2)
    : '';
}

async function deleteHistoryEntry(id) {
  try {
    await fetch(`${apiBase}/api/history/${id}`, { method: 'DELETE' });
    await loadHistory();
  } catch {
    // silently ignore
  }
}

document.getElementById('clear-history').addEventListener('click', async () => {
  try {
    await fetch(`${apiBase}/api/history`, { method: 'DELETE' });
    await loadHistory();
  } catch {
    // silently ignore
  }
});

// ── Collections ───────────────────────────────────────────────────────────────

async function loadCollections() {
  try {
    const res = await fetch(`${apiBase}/api/collections`);
    const collections = await res.json();
    renderCollections(collections);
  } catch {
    // silently ignore
  }
}

function renderCollections(collections) {
  const list = document.getElementById('collections-list');
  list.innerHTML = '';

  if (collections.length === 0) {
    list.innerHTML = '<li class="history-empty">Aucune collection</li>';
    return;
  }

  collections.forEach(col => {
    const li = document.createElement('li');
    li.className = 'collection-group';

    const itemsHtml = col.items.map(item => `
      <li class="collection-item" data-item-id="${item.id}">
        <button type="button" class="collection-item-load">
          <span class="history-method method-${item.method.toLowerCase()}">${item.method}</span>
          <span class="collection-item-name">${item.name || item.url}</span>
        </button>
        <button type="button" class="collection-item-delete" title="Supprimer">✕</button>
      </li>
    `).join('');

    li.innerHTML = `
      <div class="collection-header">
        <button type="button" class="collection-toggle">
          <span class="collection-arrow">▶</span>
          <span class="collection-name">${col.name}</span>
        </button>
        <button type="button" class="collection-delete" title="Supprimer la collection">✕</button>
      </div>
      <ul class="collection-items">${itemsHtml}</ul>
    `;

    li.querySelector('.collection-toggle').addEventListener('click', () => {
      const arrow = li.querySelector('.collection-arrow');
      const items = li.querySelector('.collection-items');
      arrow.classList.toggle('open');
      items.classList.toggle('open');
    });

    li.querySelector('.collection-delete').addEventListener('click', () => {
      confirmDeleteCollection(col.id, col.name);
    });

    li.querySelectorAll('.collection-item').forEach((itemEl, idx) => {
      const item = col.items[idx];
      itemEl.querySelector('.collection-item-load').addEventListener('click', () => {
        loadFromHistory(item);
      });
      itemEl.querySelector('.collection-item-delete').addEventListener('click', async () => {
        await deleteCollectionItem(col.id, item.id);
      });
    });

    list.appendChild(li);
  });
}

let pendingDeleteCollectionId = null;

function confirmDeleteCollection(id, name) {
  pendingDeleteCollectionId = id;
  document.getElementById('delete-collection-message').textContent =
    `La collection « ${name} » et toutes ses requêtes seront supprimées.`;
  document.getElementById('delete-collection-modal').classList.add('open');
}

document.getElementById('delete-collection-cancel').addEventListener('click', () => {
  pendingDeleteCollectionId = null;
  document.getElementById('delete-collection-modal').classList.remove('open');
});

document.getElementById('delete-collection-confirm').addEventListener('click', async () => {
  if (!pendingDeleteCollectionId) return;
  const id = pendingDeleteCollectionId;
  pendingDeleteCollectionId = null;
  document.getElementById('delete-collection-modal').classList.remove('open');
  try {
    await fetch(`${apiBase}/api/collections/${id}`, { method: 'DELETE' });
    await loadCollections();
  } catch {
    // silently ignore
  }
});

async function deleteCollectionItem(collectionId, itemId) {
  try {
    await fetch(`${apiBase}/api/collections/${collectionId}/items/${itemId}`, { method: 'DELETE' });
    await loadCollections();
  } catch {
    // silently ignore
  }
}

document.getElementById('new-collection').addEventListener('click', () => {
  document.getElementById('modal-collection-name').value = '';
  document.getElementById('new-collection-modal').classList.add('open');
  document.getElementById('modal-collection-name').focus();
});

document.getElementById('new-collection-cancel').addEventListener('click', () => {
  document.getElementById('new-collection-modal').classList.remove('open');
});

document.getElementById('new-collection-confirm').addEventListener('click', async () => {
  const name = document.getElementById('modal-collection-name').value.trim();
  if (!name) return;
  try {
    await fetch(`${apiBase}/api/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    document.getElementById('new-collection-modal').classList.remove('open');
    await loadCollections();
  } catch {
    // silently ignore
  }
});

document.getElementById('modal-collection-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('new-collection-confirm').click();
  if (e.key === 'Escape') document.getElementById('new-collection-modal').classList.remove('open');
});

document.getElementById('save-to-collection').addEventListener('click', async () => {
  try {
    const res = await fetch(`${apiBase}/api/collections`);
    const collections = await res.json();

    const select = document.getElementById('modal-collection-select');
    select.innerHTML = collections.map(c =>
      `<option value="${c.id}">${c.name}</option>`
    ).join('') || '<option value="" disabled>Aucune collection</option>';

    document.getElementById('modal-item-name').value = '';
    document.getElementById('save-modal').classList.add('open');
  } catch {
    // silently ignore
  }
});

document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('save-modal').classList.remove('open');
});

document.getElementById('modal-confirm').addEventListener('click', async () => {
  const collectionId = document.getElementById('modal-collection-select').value;
  if (!collectionId) return;

  const name = document.getElementById('modal-item-name').value.trim();
  const method = document.getElementById('method').value;
  const url = document.getElementById('url').value.trim();
  const headers = getHeaders();
  const rawBody = document.getElementById('body').value.trim();

  if (!url) return;

  let body = null;
  if (rawBody) {
    try { body = JSON.parse(rawBody); } catch { body = null; }
  }

  try {
    await fetch(`${apiBase}/api/collections/${collectionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, method, url, headers, body }),
    });
    document.getElementById('save-modal').classList.remove('open');
    await loadCollections();
  } catch {
    // silently ignore
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

init();

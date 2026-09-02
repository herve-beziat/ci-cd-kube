const collectionsService = require('../services/collections.service');

async function list(req, res, next) {
  try {
    res.json(collectionsService.getAll());
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    const collection = collectionsService.createCollection(name.trim());
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
}

async function rename(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    collectionsService.rename(Number(id), name.trim());
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    collectionsService.deleteCollection(Number(id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { id } = req.params;
    const { name, method, url, headers, body } = req.body;
    if (!method || !url) {
      return res.status(400).json({ error: 'method et url sont requis' });
    }
    const itemId = collectionsService.addItem(Number(id), { name, method, url, headers, body });
    res.status(201).json({ id: itemId });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { itemId } = req.params;
    collectionsService.removeItem(Number(itemId));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, rename, remove, addItem, removeItem };

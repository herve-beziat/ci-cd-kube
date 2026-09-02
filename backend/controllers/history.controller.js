const historyService = require('../services/history.service');

async function list(req, res, next) {
  try {
    const entries = historyService.getAll();
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    historyService.deleteById(Number(id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function clear(req, res, next) {
  try {
    historyService.deleteAll();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, remove, clear };

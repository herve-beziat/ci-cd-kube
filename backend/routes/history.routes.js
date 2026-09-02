const { Router } = require('express');
const { list, remove, clear } = require('../controllers/history.controller');

const router = Router();

router.get('/', list);
router.delete('/:id', remove);
router.delete('/', clear);

module.exports = router;

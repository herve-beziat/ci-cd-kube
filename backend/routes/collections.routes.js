const { Router } = require('express');
const { list, create, rename, remove, addItem, removeItem } = require('../controllers/collections.controller');

const router = Router();

router.get('/', list);
router.post('/', create);
router.put('/:id', rename);
router.delete('/:id', remove);
router.post('/:id/items', addItem);
router.delete('/:id/items/:itemId', removeItem);

module.exports = router;

const { Router } = require('express');
const { send } = require('../controllers/requests.controller');

const router = Router();

router.post('/send', send);

module.exports = router;

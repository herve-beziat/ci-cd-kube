const { sendRequest } = require('../services/requests.service');
const { save } = require('../services/history.service');

async function send(req, res, next) {
  try {
    const { method, url, headers, body } = req.body;
    const result = await sendRequest({ method, url, headers, body });
    save({ method, url, headers, body, statusCode: result.statusCode, responseTime: result.responseTime });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { send };

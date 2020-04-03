const { key } = require('../config');

function auth(req, res, next) {
  const x_key = req.header('x-api-key');
  if (!x_key)
    return res
      .status(401)
      .send({ Error: 'Access denied! API key not provided..' });

  if (key != x_key)
    return res.status(401).send({ Error: 'Invalid API key provided....' });

  next();
}

module.exports = auth;

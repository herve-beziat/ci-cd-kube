function errorMiddleware(err, req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erreur interne du serveur',
  });
}

module.exports = { errorMiddleware };

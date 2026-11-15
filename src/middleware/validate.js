module.exports = (schema) => (req, res, next) => {
  try {
    const value = schema.parse({ body: req.body, query: req.query, params: req.params });
    req.validated = value;
    next();
  } catch (error) {
    next(error);
  }
};

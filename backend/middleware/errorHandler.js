const createError = require("http-errors");

/** 404：资源不存在 */
function notFoundHandler(req, res, next) {
  next(createError(404, "资源不存在"));
}

/** 统一 JSON 错误响应 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isDev = req.app.get("env") === "development";

  res.status(status).json({
    code: 0,
    msg: err.message || "服务器内部错误",
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };

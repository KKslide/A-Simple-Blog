/**
 * 成功响应
 * @param {import('express').Response} res
 * @param {{ code?: number; msg?: string; data?: unknown }} payload
 */
function success(res, { code = 1, msg = "成功", data } = {}) {
  const body = { code, msg };
  if (data !== undefined) body.data = data;
  return res.json(body);
}

/**
 * 失败响应
 * @param {import('express').Response} res
 * @param {string} msg 错误提示
 * @param {number} [httpStatus] HTTP 状态码，默认 200
 */
function fail(res, msg, httpStatus = 200) {
  return res.status(httpStatus).json({ code: 0, msg });
}

module.exports = { success, fail };

/** 管理端路由登录校验中间件 */
module.exports = function (req, res, next) {
  if (req.session && req.session.logData && req.session.logData.login) {
    // 登录状态，放行
    return next();
  }

  // 未登录，拦截请求
  return res.status(401).json({
    code: 401,
    message: '未登录或登录已过期，请重新登录'
  });
};

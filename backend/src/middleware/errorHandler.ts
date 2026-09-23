import createError from 'http-errors'
import type { NextFunction, Request, Response } from 'express'

/** 带 HTTP 状态码的错误（articleViewService 抛出、本模块消费） */
export interface HttpStatusError extends Error {
  status?: number
  statusCode?: number
  stack?: string
}

// mark 可用nginx替换 → error_page 404 /api_404.json; proxy_intercept_errors on;
//   location = /api_404.json { return 200 '{"code":0,"msg":"资源不存在"}'; }
//   注意：仅处理路由层 404，Node.js 运行时错误（500）仍需保留
/** 404：资源不存在 */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(createError(404, '资源不存在'))
}

/** 统一 JSON 错误响应 */
export function errorHandler(
  err: HttpStatusError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || err.statusCode || 500
  const isDev = req.app.get('env') === 'development'

  res.status(status).json({
    code: 0,
    msg: err.message || '服务器内部错误',
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  })
}

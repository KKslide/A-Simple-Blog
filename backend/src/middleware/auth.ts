import type { NextFunction, Request, Response } from 'express'
import { fail } from '../lib/response.ts'

/** 管理端路由登录校验中间件 */
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.session?.logData?.login) {
    // 登录状态，放行
    return next()
  }

  // 未登录，拦截请求（HTTP 401 + 统一格式）
  return fail(res, '未登录或登录已过期，请重新登录', 401)
}

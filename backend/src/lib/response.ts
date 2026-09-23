/**
 * 统一响应格式规范
 *
 * 成功: { code: 1, msg: "成功", data?: ... }
 * 失败: { code: 0, msg: "错误提示" }
 *
 * code 含义:
 *   1 — 业务成功
 *   0 — 业务失败（参数校验不通过、操作失败等）
 *
 * HTTP 状态码:
 *   200 — 请求处理成功（即使业务失败也是 200，由 code 区分）
 *   401 — 未登录（由 auth 中间件处理）
 *   404 — 路由不存在（由 notFoundHandler 处理）
 *   500 — 服务器内部异常（由 errorHandler 处理）
 */
import type { Response } from 'express'

interface ResponsePayload {
  msg?: string
  data?: unknown
}

/**
 * 成功响应
 */
export function success(res: Response, { msg = '成功', data }: ResponsePayload = {}) {
  const body: Record<string, unknown> = { code: 1, msg }
  if (data !== undefined) body.data = data
  return res.json(body)
}

/**
 * 失败响应（业务失败，HTTP 状态码仍为 200）
 * @param httpStatus HTTP 状态码，默认 200
 */
export function fail(res: Response, msg: string, httpStatus = 200) {
  return res.status(httpStatus).json({ code: 0, msg })
}

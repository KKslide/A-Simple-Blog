/**
 * express-session 会话数据增强
 *
 * req.session.logData 由登录接口写入（doLogin），
 * auth 中间件据此判断登录态。类型合并进 SessionData 后全项目可用。
 */
import 'express-session'

declare module 'express-session' {
  interface SessionData {
    /** 登录用户信息 + 登录标记 */
    logData?: {
      id: number
      username: string
      is_admin: number
      login: boolean
    }
  }
}

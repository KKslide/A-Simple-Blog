/**
 * Express 应用入口：API、Session、静态资源兜底
 */
// 先加载 .env，保证后续所有模块读取环境变量时已就绪
import './config/db.ts'

import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import expressStaticGzip from 'express-static-gzip'
import { rateLimit } from 'express-rate-limit'

import { sessionConfig } from './config/session.ts'
import indexRouter from './routes/indexRouter.ts'
import adminRouter from './routes/adminRouter.ts'
import picRouter from './routes/picRouter.ts'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.ts'
import { FRONTEND_DIST_DIR, UPLOAD_DIR } from './config/paths.ts'

const app = express()

// 本地/线上通过同机 Nginx 反向代理访问时, 信任 loopback 转发的 X-Forwarded-* 头
// 用于 session secure cookie 和 rate limit 获取真实客户端 IP
app.set('trust proxy', 'loopback')

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))

app.use(session(sessionConfig))
// 开发环境保留 morgan, 生产环境由 Nginx 记录访问日志
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'))
}
app.use(cookieParser())

// 接口限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: '请求过于频繁，请稍后再试' },
})
// 登录限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 每个 IP 最多 5 次登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: '登录尝试过多，请15分钟后再试' },
})

// 非生产环境兜底: 没有 Nginx 时, 直接访问 8088 也能看到前端和上传文件
if (process.env.NODE_ENV !== 'production') {
  app.use('/upload', express.static(UPLOAD_DIR))

  // 前端构建产物
  app.use(
    '/admin',
    expressStaticGzip(FRONTEND_DIST_DIR, {
      enableBrotli: true,
      orderPreference: ['gz', 'br'],
      serveStatic: { maxAge: '1y', immutable: true },
    }),
  )

  app.use(
    '/',
    expressStaticGzip(FRONTEND_DIST_DIR, {
      enableBrotli: true,
      orderPreference: ['gz', 'br'],
      serveStatic: { maxAge: '1y', immutable: true },
    }),
  )

  // SPA 回退
  app.get(/^\/(?!api|upload|admin\/.*\.(js|css|map|ico|png|jpg|jpeg|svg)).*/, (_req, res) => {
    res.sendFile(FRONTEND_DIST_DIR + '/index.html')
  })
}
// 路由已包含完整前缀（/admin/auth/login, /user/articles 等）
// 登录限流仅应用于登录接口
app.use('/api/admin/auth/login', loginLimiter)
app.use('/api', apiLimiter, indexRouter)
app.use('/api', apiLimiter, adminRouter)
app.use('/api', apiLimiter, picRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

/** express-session 配置 */
// 先加载 .env，保证模块加载时 SESSION_SECRET / NODE_ENV 已就绪
import './db.ts'

// mark 可用nginx辅助 → proxy_cookie_flags ~ Secure; proxy_cookie_flags ~ HttpOnly; proxy_cookie_flags ~ SameSite=lax;
//   通过 proxy_set_header X-Forwarded-Proto $scheme 可让 secure 自动生效
export const sessionConfig = {
  name: 'sid',
  // FIXME: .env 中的 SESSION_SECRET 仍是占位默认值，会话可被伪造，部署前必须换成随机串
  secret: process.env.SESSION_SECRET || 'dev_session_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 12 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  rolling: true,
}

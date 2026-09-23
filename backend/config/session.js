/** express-session 配置 */
// mark 可用nginx辅助 → proxy_cookie_flags ~ Secure; proxy_cookie_flags ~ HttpOnly; proxy_cookie_flags ~ SameSite=lax;
//   通过 proxy_set_header X-Forwarded-Proto $scheme 可让 secure 自动生效
module.exports = {
  name: "sid",
  secret: process.env.SESSION_SECRET || "dev_session_secret_change_in_production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 12 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
  rolling: true,
};

/** express-session 配置 */
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

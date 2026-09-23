/**
 * Express 应用入口：API、Session、静态资源（静态部分 Phase 4 将交给 Nginx）
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const expressStaticGzip = require("express-static-gzip");
const rateLimit = require("express-rate-limit");

const sessionConfig = require("./config/session");
const indexRouter = require("./routes/indexRouter");
const adminRouter = require("./routes/adminRouter");
const picRouter = require("./routes/picRouter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// mark 可用nginx替换 → client_max_body_size 1m; (但 JSON/URL 解析本身仍需保留)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 跨域（Phase 4 将迁移至 Nginx）
// mark 可用nginx替换 → add_header Access-Control-Allow-* + if ($request_method = OPTIONS) { return 204; }
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With, sessionToken"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Max-Age", "3600");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(session(sessionConfig));
// mark 可用nginx替换 → access_log /var/log/nginx/access.log (替代 morgan HTTP 日志)
app.use(logger("dev"));
app.use(cookieParser());
// mark 可用nginx替换 → gzip on; gzip_min_length 1024; gzip_types ... (替代动态压缩)
app.use(compression({ threshold: 1024 }));

// 接口限流
// mark 可用nginx替换 → limit_req_zone $binary_remote_addr zone=api:10m rate=6r/m; limit_req zone=api burst=20 nodelay;
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: "请求过于频繁，请稍后再试" }
});
// mark 可用nginx替换 → limit_req_zone $binary_remote_addr zone=login:10m rate=1r/3m; limit_req zone=login burst=2 nodelay;
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 每个 IP 最多 5 次登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: "登录尝试过多，请15分钟后再试" }
});

// 静态资源托管（Phase 4 将迁移至 Nginx）
// mark 可用nginx替换 → location /upload { alias ...; expires 30d; add_header Cache-Control "public, immutable"; }
app.use("/upload", express.static(path.join(__dirname, "upload")));

const distPath = path.join(__dirname, "dist");

// mark 可用nginx替换 → root .../dist; gzip_static on; brotli_static on; expires 1y; add_header Cache-Control "public, immutable";
app.use(
  "/admin",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: { maxAge: "1y", immutable: true },
  })
);

// mark 可用nginx替换 → try_files $uri $uri/ /index.html (配合 root + gzip_static + brotli_static)
app.use(
  "/",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: { maxAge: "1y", immutable: true },
  })
);

// 向后兼容：旧 /server 路径 301 跳转到 /admin
// mark 可用nginx替换 → location ~ ^/server(.*) { return 301 /admin$1$is_args$args; }
app.get(/^\/server(.*)/, (req, res) => {
  res.redirect(301, "/admin" + (req.params[0] || ""));
});

// mark 可用nginx替换 → try_files $uri $uri/ /index.html; (SPA 通配回退)
app.get(/^\/(?!api|upload|admin\/.*\.(js|css|map|ico|png|jpg|jpeg|svg)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 路由已包含完整前缀（/admin/auth/login, /user/articles 等）
// 登录限流仅应用于登录接口
// mark 可用nginx替换 → location /api/admin/auth/login { limit_req zone=login; proxy_pass ... }
app.use("/api/admin/auth/login", loginLimiter);
// mark 可用nginx替换 → location /api { limit_req zone=api burst=20 nodelay; proxy_pass ... }
app.use("/api", apiLimiter, indexRouter);
app.use("/api", apiLimiter, adminRouter);
app.use("/api", apiLimiter, picRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

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

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 跨域（Phase 4 将迁移至 Nginx）
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
app.use(logger("dev"));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));

// 接口限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: "请求过于频繁，请稍后再试" }
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 每个 IP 最多 5 次登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 0, msg: "登录尝试过多，请15分钟后再试" }
});

// 静态资源托管（Phase 4 将迁移至 Nginx）
app.use("/upload", express.static(path.join(__dirname, "upload")));

const distPath = path.join(__dirname, "dist");

app.use(
  "/server",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: { maxAge: "1y", immutable: true },
  })
);

app.use(
  "/",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: { maxAge: "1y", immutable: true },
  })
);

app.get("/admin", (req, res) => {
  res.redirect("/server");
});

app.get(/^\/(?!api|upload|server\/.*\.(js|css|map|ico|png|jpg|jpeg|svg)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 路由已包含完整前缀（/admin/auth/login, /user/articles 等）
// 登录限流仅应用于登录接口
app.use("/api/admin/auth/login", loginLimiter);
app.use("/api", apiLimiter, indexRouter);
app.use("/api", apiLimiter, adminRouter);
app.use("/api", apiLimiter, picRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

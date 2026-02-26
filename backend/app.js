const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const expressStaticGzip = require("express-static-gzip");
// 引入子路由
const indexRouter = require("./routes/indexRouter");
const adminRouter = require("./routes/adminRouter");
const picRouter = require("./routes/picRouter");

const app = express();

app.use(bodyParser.json({ limit: "200mb" })); // for parsing application/json
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true })); // for parsing application/x-www-form-urlencoded

// 跨域
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , whatever, sessionToken");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // res.header('Access-Control-Allow-Credentials', true);
  // res.header('Content-Type', 'application/json;charset=utf-8');
  res.header("Access-Control-Max-Age", "3600");
  // 预检请求直接返回
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// session配置
app.use(
  session({
    name: "sid",
    secret: "session_id",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // 防止前端通过 JS 读取 cookie
      maxAge: 12 * 60 * 60 * 1000, // 保存10小时
    },
    rolling: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Gzip/Brotli 压缩（对所有可压缩响应启用）
app.use(
  compression({
    threshold: 1024, // 超过 1KB 才压缩
  })
);

// 静态资源托管
app.use("/upload", express.static(path.join(__dirname, "upload")));

const distPath = path.join(__dirname, "dist");

// 优先使用预压缩的 br/gz 静态资源
app.use(
  "/server",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: {
      maxAge: "1y",
      immutable: true,
    },
  })
);

app.use(
  "/",
  expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ["gz", "br"],
    serveStatic: {
      maxAge: "1y",
      immutable: true,
    },
  })
);

// 让 /admin 直接 302 跳转到 /server
app.get("/admin", (req, res) => {
  res.redirect("/server");
});

// SPA 路由处理
app.get(/^\/(?!api|upload|server\/.*\.(js|css|map|ico|png|jpg|jpeg|svg)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 挂载路由
app.use("/api/user", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/pic", picRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.send(`
        <h1>Error</h1>
        <p>${err.message}</p>
        <pre>${req.app.get("env") === "development" ? err.stack : ""}</pre>
    `);
});

module.exports = app;

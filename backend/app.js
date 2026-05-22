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

const sessionConfig = require("./config/session");
const indexRouter = require("./routes/indexRouter");
const adminRouter = require("./routes/adminRouter");
const picRouter = require("./routes/picRouter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

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

app.use("/api/user", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/pic", picRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

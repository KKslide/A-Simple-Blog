/**
 * 前台路由 - RESTful 风格
 *
 * 遵循 OpenAPI 规范：
 * - GET    读取资源
 * - POST   创建资源
 *
 * URL 命名规则：
 * - 资源名用复数名词（articles, messages, visits）
 * - 资源 ID 用路径参数（:id）
 * - 不使用动词（add, get）
 *
 * 注意：路由前缀 /user 在 app.js 中通过 app.use("/api/user", indexRouter) 挂载
 *       但前端 baseURL 在开发环境为空，需要完整路径，所以这里保留 /user 前缀
 */

const express = require("express");
const router = express.Router();
const handler = require("../handlers/indexHandler");
const path = require("path");
const fs = require("fs");

// ============================================================
// 地图数据
// ============================================================

/**
 * GET /user/map
 * 获取 ECharts 地图 GeoJSON 数据
 * 查询参数: province?, city?
 * 响应: GeoJSON 对象
 */
router.get("/user/map", (req, res) => {
  const province = req.query.province;
  const city = req.query.city;

  // 校验参数，防止路径穿越
  const isValidMapParam = (str) => /^[一-龥a-zA-Z0-9_-]+$/.test(str);
  if (province && !isValidMapParam(province)) {
    return res.status(400).json({ error: "参数不合法" });
  }
  if (city && !isValidMapParam(city)) {
    return res.status(400).json({ error: "参数不合法" });
  }

  let filePath = "";

  if (!province) {
    // 全国
    filePath = path.join(__dirname, "../json/map/china.json");
  } else if (province && !city) {
    // 省级
    filePath = path.join(__dirname, `../json/map/${province}/${province}.json`);
  } else if (province && city) {
    // 市级
    filePath = path.join(__dirname, `../json/map/${province}/${city}.json`);
  }

  // 判断文件是否存在
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "地图数据不存在" });
  }

  // 读取 JSON 文件
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "读取地图数据失败" });
    }
    res.json(JSON.parse(data));
  });
});

// ============================================================
// 文章相关
// ============================================================

/**
 * GET /user/articles
 * 获取文章列表（首页数据，按分类分组）
 * 响应: { code: 1, data: { catList: [...], blogList: { TOP: [...], [categoryName]: [...] } } }
 */
router.get("/user/articles", handler.getIndexPage);

/**
 * GET /user/articles/search
 * 搜索文章
 * 查询参数: keyword?, starttime?, endtime?, category_id?, pageNo?, pageSize?
 * 响应: { code: 1, data: ArticleItem[] }
 */
router.get("/user/articles/search", handler.searchIndexPage);

/**
 * GET /user/articles/:id
 * 获取文章详情（含上下篇和评论）
 * 路径参数: id - 文章 ID
 * 响应: { code: 1, data: { prev, cur, next } }
 */
router.get("/user/articles/:id", handler.getContentPage);

/**
 * POST /user/articles/:id/view
 * 记录文章阅读（IP+日期去重）
 * 路径参数: id - 文章 ID
 * 响应: { code: 1, data: { counted: boolean, view_count: number } }
 */
router.post("/user/articles/:id/view", handler.recordArticleView);

/**
 * POST /user/articles/:id/comments
 * 发表评论
 * 路径参数: id - 文章 ID
 * 请求体: { nickname?, comment }
 * 响应: { code: 1, msg: "评论成功" }
 */
router.post("/user/articles/:id/comments", handler.Comment);

// ============================================================
// 留言相关
// ============================================================

/**
 * GET /user/messages
 * 获取留言列表
 * 响应: { code: 1, data: MessageItem[] }
 */
router.get("/user/messages", handler.getMessages);

/**
 * POST /user/messages
 * 提交留言
 * 请求体: { nickname, content }
 * 响应: { code: 1, msg: "留言成功" }
 */
router.post("/user/messages", handler.leaveMessage);

// ============================================================
// 访问统计
// ============================================================

/**
 * POST /user/visits
 * 记录全站访问（PV）
 * 响应: { code: 1, data: { recorded: true, ip: string } }
 */
router.post("/user/visits", handler.visitRecord);

module.exports = router;

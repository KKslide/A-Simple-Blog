var express = require("express");
var router = express.Router();
var handler = require("../handlers/indexHandler");
var path = require("path");
var fs = require("fs");

// 获取地图数据接口
router.get("/map", (req, res) => {
  const province = req.query.province; // 省份名
  const city = req.query.city; // 市名

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

/* ********* 前端 ********* */
/* 获取blog列表数据 或 vlog列表数据 */
router.get("/page", handler.getIndexPage);
/* bloglist页面搜索 */
router.post("/search", handler.searchIndexPage);
/* 获取详情页 */
router.post("/content", handler.getContentPage);
/* 评论文章 */
router.post("/comment", handler.Comment);

/* 留言 */
router.get("/message/get", handler.getMessages);
router.post("/message/add", handler.leaveMessage);

/* 统计访问者IP和时间 */
router.post("/visit", handler.visitRecord);

module.exports = router;

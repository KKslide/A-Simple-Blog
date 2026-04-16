var express = require("express");
var router = express.Router();
var handler = require("../handlers/adminHandler.js");
var authMiddleware = require("../middleware/auth.js");

/* ********* 管理端 ******** */
/* 检测是否登陆 */
router.get("/isadmin", (req, res) => {
  if (JSON.stringify(req.cookies) == "{}") {
    res.json({ code: 0, msg: "请先登录啦" });
  } else {
    res.json({ code: 1, islogin: "logined", msg: "登陆成功" });
  }
});
/* 登陆/登出 */
router.post("/login", handler.doLogin);
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("sid");
    res.json({ code: 1, message: "已退出登陆" });
  });
});

router.use(authMiddleware);

/* 修改密码 */
router.post("/info/edit", handler.editInfo);

/* 后台-首页数据 */
router.get("/dashboard", handler.getDashboard);

/* 分类 */
/* 分类-获取 */
router.get("/categories", handler.getCategory);
/* 分类-新增 */
router.post("/categories/add", handler.addCategory);
/* 分类-删除 */
router.post("/categories/del", handler.delCategory);
/* 分类-修改 */
router.post("/categories/edit", handler.editCategory);

/* 文章 */
/* 文章-获取 */
router.get("/articles", handler.getArticle);
/* 文章-新增 */
router.post("/articles/add", handler.addArticle);
/* 文章-删除 */
router.post("/articles/del", handler.delArticle);
/* 文章-修改 */
router.post("/articles/edit", handler.editArticle);

/* 评论 */
/* 评论-获取 */
router.get("/comment", handler.getComment);
/* 评论-删除 */
router.post("/comment/del", handler.delComment);

/* 留言 */
/* 留言-获取 */
router.get("/message/get", handler.adminGetMessages);
/* 留言-删除 */
router.post("/massage/del", handler.delMessage);

module.exports = router;

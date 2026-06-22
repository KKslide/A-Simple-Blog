const express = require("express");
const router = express.Router();
const handler = require("../handlers/adminHandler.js");
const authMiddleware = require("../middleware/auth.js");

/* ********* 管理端 ******** */
/* 检测是否登陆 */
router.get("/isadmin", (req, res) => {
  if (req.session?.logData?.login) {
    res.json({ code: 1, islogin: "logined", msg: "登陆成功" });
  } else {
    res.json({ code: 0, msg: "请先登录啦" });
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

// 🔒 使用独立受保护子路由，auth 中间件作为其第一层，杜绝权限绕过
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);

/* 修改密码 */
protectedRouter.post("/info/edit", handler.editInfo);

/* 后台-首页数据 */
protectedRouter.get("/dashboard", handler.getDashboard);

/* 分类 */
/* 分类-获取 */
protectedRouter.get("/categories", handler.getCategory);
/* 分类-新增 */
protectedRouter.post("/categories/add", handler.addCategory);
/* 分类-删除 */
protectedRouter.post("/categories/del", handler.delCategory);
/* 分类-修改 */
protectedRouter.post("/categories/edit", handler.editCategory);

/* 文章 */
/* 文章-获取 */
protectedRouter.get("/articles", handler.getArticle);
/* 文章-新增 */
protectedRouter.post("/articles/add", handler.addArticle);
/* 文章-删除 */
protectedRouter.post("/articles/del", handler.delArticle);
/* 文章-修改 */
protectedRouter.post("/articles/edit", handler.editArticle);

/* 评论 */
/* 评论-获取 */
protectedRouter.get("/comment", handler.getComment);
/* 评论-删除 */
protectedRouter.post("/comment/del", handler.delComment);

/* 留言 */
/* 留言-获取 */
protectedRouter.get("/message/get", handler.adminGetMessages);
/* 留言-删除 */
protectedRouter.post("/message/del", handler.delMessage);

router.use(protectedRouter);

module.exports = router;

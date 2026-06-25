/**
 * 管理端路由 - RESTful 风格
 *
 * 遵循 OpenAPI 规范：
 * - GET    读取资源
 * - POST   创建资源
 * - PUT    更新资源（全量）
 * - DELETE 删除资源
 *
 * URL 命名规则：
 * - 资源名用复数名词（categories, articles, comments, messages）
 * - 资源 ID 用路径参数（:id）
 * - 不使用动词（add, del, edit）
 *
 * 注意：路由前缀 /admin 在 app.js 中通过 app.use("/api", adminRouter) 挂载
 *       但前端 baseURL 在开发环境为空，需要完整路径，所以这里保留 /admin 前缀
 *
 * 安全架构：
 * - 认证路由（/admin/auth/status, login, logout）不需要登录
 * - 其他所有管理接口通过 protectedRouter 统一校验登录状态
 * - protectedRouter 使用独立子路由 + authMiddleware 作为第一层，杜绝绕过
 */

const express = require("express");
const router = express.Router();
const handler = require("../handlers/adminHandler.js");
const authMiddleware = require("../middleware/auth.js");

// ============================================================
// 认证相关（无需登录）
// ============================================================

/**
 * GET /admin/auth/status
 * 检查登录状态
 * 响应: { code: 1, msg: "已登录", data: { loggedIn: true } }
 *       { code: 0, msg: "未登录" }
 */
router.get("/admin/auth/status", (req, res) => {
  if (req.session?.logData?.login) {
    const { login, ...userInfo } = req.session.logData;
    res.json({ code: 1, msg: "已登录", data: { loggedIn: true, userInfo } });
  } else {
    res.json({ code: 0, msg: "未登录" });
  }
});

/**
 * POST /admin/auth/login
 * 管理员登录
 * 请求体: { username: string, password: string }
 * 响应: { code: 1, msg: "登录成功", data: { userInfo: { id, username, is_admin } } }
 */
router.post("/admin/auth/login", handler.doLogin);

/**
 * POST /admin/auth/logout
 * 管理员登出
 * 响应: { code: 1, msg: "已退出登录" }
 */
router.post("/admin/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("sid");
    res.json({ code: 1, msg: "已退出登录" });
  });
});

// ============================================================
// 以下所有路由需要登录
// 使用独立的受保护子路由，auth 中间件作为其第一层
// 确保每个请求都必须先通过身份验证才能到达业务处理器
// ============================================================

const protectedRouter = express.Router();

// 🔒 权限校验中间件 —— 受保护路由的第一道防线
protectedRouter.use(authMiddleware);

// ============================================================
// 密码管理
// ============================================================

/**
 * PUT /admin/auth/password
 * 修改管理员密码
 * 请求体: { type: "check"|"edit", id?, username, password }
 * 响应: { code: 1, msg: "验证通过" | "修改成功" }
 */
protectedRouter.put("/admin/auth/password", handler.editInfo);

// ============================================================
// 仪表盘
// ============================================================

/**
 * GET /admin/dashboard
 * 获取仪表盘统计数据
 * 响应: { code: 1, data: { tag_list, pie_chart_data, line_chart_data } }
 */
protectedRouter.get("/admin/dashboard", handler.getDashboard);

// ============================================================
// 分类管理
// ============================================================

/**
 * GET /admin/categories
 * 获取分类列表（支持分页）
 * 查询参数: pageNo?, pageSize?, searchType?
 * 响应: { code: 1, data: CategoryItem[] }
 */
protectedRouter.get("/admin/categories", handler.getCategory);

/**
 * POST /admin/categories
 * 新增分类
 * 请求体: { name, banner_url?, sort_order?, show_type? }
 * 响应: { code: 1, msg: "创建成功" }
 */
protectedRouter.post("/admin/categories", handler.addCategory);

/**
 * PUT /admin/categories/:id
 * 编辑分类（⚠️ 禁止编辑 "Other" 兜底分类）
 * 路径参数: id - 分类 ID
 * 请求体: { name, banner_url?, sort_order?, show_type? }
 * 响应: { code: 1, msg: "更新成功" }
 */
protectedRouter.put("/admin/categories/:id", handler.editCategory);

/**
 * DELETE /admin/categories/:id
 * 删除分类（⚠️ 禁止删除 "Other" 兜底分类）
 * 路径参数: id - 分类 ID
 * 响应: { code: 1, msg: "删除成功" }
 */
protectedRouter.delete("/admin/categories/:id", handler.delCategory);

// ============================================================
// 文章管理
// ============================================================

/**
 * GET /admin/articles
 * 获取文章列表（支持分页和筛选）
 * 查询参数: pageNo?, pageSize?, title?, category_id?, is_pinned?, is_published?
 * 响应: { code: 1, data: ArticleItem[] }
 */
protectedRouter.get("/admin/articles", handler.getArticle);

/**
 * POST /admin/articles
 * 新增文章
 * 请求体: { title, category_id, content?, description?, cover_url?, video_url?, is_published?, is_pinned? }
 * 响应: { code: 1, msg: "创建成功" }
 */
protectedRouter.post("/admin/articles", handler.addArticle);

/**
 * PUT /admin/articles/:id
 * 编辑文章
 * 路径参数: id - 文章 ID
 * 请求体: { title?, category_id?, content?, description?, cover_url?, video_url?, is_published?, is_pinned? }
 * 响应: { code: 1, msg: "更新成功" }
 */
protectedRouter.put("/admin/articles/:id", handler.editArticle);

/**
 * DELETE /admin/articles/:id
 * 删除文章
 * 路径参数: id - 文章 ID
 * 响应: { code: 1, msg: "删除成功" }
 */
protectedRouter.delete("/admin/articles/:id", handler.delArticle);

// ============================================================
// 评论管理
// ============================================================

/**
 * GET /admin/comments
 * 获取评论列表
 * 查询参数: id (文章 ID，必填)
 * 响应: { code: 1, data: CommentItem[] }
 */
protectedRouter.get("/admin/comments", handler.getComment);

/**
 * DELETE /admin/comments/:id
 * 删除评论
 * 路径参数: id - 评论 ID
 * 响应: { code: 1, msg: "删除成功" }
 */
protectedRouter.delete("/admin/comments/:id", handler.delComment);

// ============================================================
// 留言管理
// ============================================================

/**
 * GET /admin/messages
 * 获取留言列表（分页）
 * 查询参数: pageNo?, pageSize?
 * 响应: { code: 1, data: { messages: MessageItem[], total: number, pages: number } }
 */
protectedRouter.get("/admin/messages", handler.adminGetMessages);

/**
 * DELETE /admin/messages/:id
 * 删除留言
 * 路径参数: id - 留言 ID
 * 响应: { code: 1, msg: "删除成功" }
 */
protectedRouter.delete("/admin/messages/:id", handler.delMessage);

// 将受保护路由挂载到主路由上
router.use(protectedRouter);

module.exports = router;

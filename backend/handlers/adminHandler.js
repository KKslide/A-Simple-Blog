/**
 * 管理端处理器
 *
 * 遵循 RESTful 规范：
 * - 资源 ID 从路径参数获取（req.params.id）
 * - 分页参数从查询参数获取（req.query）
 * - 创建/更新数据从请求体获取（req.body）
 */

const base = require("../lib/repositories/baseRepository");
const userRepo = require("../lib/repositories/userRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const commentRepo = require("../lib/repositories/commentRepository");
const messageRepo = require("../lib/repositories/messageRepository");
const dashboardService = require("../lib/services/dashboardService");
const { success, fail } = require("../lib/response");
const { query } = require("../db/index");

/**
 * POST /auth/login
 * 管理员登录
 */
async function doLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userRepo.authenticate(username, password);
    if (!user) return fail(res, "用户名或密码错误！");
    req.session.logData = { ...user, login: true };
    return success(res, { msg: "登录成功", data: { userInfo: user } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /auth/password
 * 修改管理员密码或验证密码
 */
async function editInfo(req, res, next) {
  try {
    const { type, id, username, password } = req.body;
    if (type === "check") {
      const user = await userRepo.authenticate(username, password);
      if (!user) return fail(res, "验证失败");
      return success(res, { msg: "验证通过" });
    }
    if (type === "edit") {
      await userRepo.updateUser(id, { username, password });
      return success(res, { msg: "修改成功" });
    }
    return fail(res, "无效的操作类型");
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboard
 * 获取仪表盘统计数据
 */
async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardData();
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /categories
 * 获取分类列表（支持分页）
 */
async function getCategory(req, res, next) {
  try {
    const pageNo = Number(req.query.pageNo ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);  // 默认 5 条
    const hasPagination = req.query.pageNo != null || req.query.pageSize != null;
    const searchType = req.query.searchType;

    const data = hasPagination && searchType !== "all"
      ? await base.findPageActive("category", { pageNo, pageSize, orderColumn: "sort_order" })
      : await base.findAllActive("category");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /categories
 * 新增分类
 */
async function addCategory(req, res, next) {
  try {
    const { name, banner_url, sort_order, show_type } = req.body;
    await base.insert("category", {
      name,
      banner_url,
      sort_order,
      ...(show_type ? { show_type } : {}),
    });
    return success(res, { msg: "创建成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /categories/:id
 * 删除分类
 * ⚠️ "Other" 是系统兜底分类，禁止删除
 */
async function delCategory(req, res, next) {
  try {
    const categoryId = req.params.id;  // 从路径参数获取 ID
    // 禁止删除 Other 兜底分类
    const [targetRows] = await query(
      "SELECT name FROM category WHERE id = ? LIMIT 1",
      [categoryId]
    );
    if (targetRows.length && targetRows[0].name === "Other") {
      return fail(res, "Other 是系统兜底分类，禁止删除!");
    }
    // 把该分类下的文章归到 Other 分类
    const [otherRows] = await query(
      "SELECT id FROM category WHERE name = 'Other' AND is_del = '0' LIMIT 1"
    );
    if (otherRows.length) {
      await query(
        "UPDATE article SET category_id = ? WHERE category_id = ?",
        [otherRows[0].id, categoryId]
      );
    }
    await base.softDelete("category", categoryId);
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /categories/:id
 * 编辑分类
 * ⚠️ 禁止修改 "Other" 兜底分类
 */
async function editCategory(req, res, next) {
  try {
    const categoryId = req.params.id;  // 从路径参数获取 ID
    // 禁止修改 Other 兜底分类
    const [targetRows] = await query(
      "SELECT name FROM category WHERE id = ? LIMIT 1",
      [categoryId]
    );
    if (targetRows.length && targetRows[0].name === "Other") {
      return fail(res, "Other 是系统兜底分类，禁止编辑!");
    }
    await base.updateById("category", categoryId, {
      name: req.body.name,
      banner_url: req.body.banner_url,
      sort_order: req.body.sort_order,
      ...(req.body.show_type ? { show_type: req.body.show_type } : {}),
    });
    return success(res, { msg: "更新成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /articles
 * 获取文章列表（支持分页和筛选）
 */
async function getArticle(req, res, next) {
  try {
    const pageNo = Number(req.query.pageNo ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);  // 默认 5 条
    const data = await articleRepo.listAdmin({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 5,
      title: req.query.title,
      category_id: req.query.category_id,
      is_pinned: req.query.is_pinned,
      is_published: req.query.is_published,
    });
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /articles
 * 新增文章
 */
async function addArticle(req, res, next) {
  try {
    await base.insert("article", {
      title: req.body.title,
      category_id: req.body.category_id,
      content: req.body.content,
      description: req.body.description,
      cover_url: req.body.cover_url,
      video_url: req.body.video_url,
      is_published: req.body.is_published,
      is_pinned: req.body.is_pinned,
    });
    return success(res, { msg: "创建成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /articles/:id
 * 删除文章
 */
async function delArticle(req, res, next) {
  try {
    await base.softDelete("article", req.params.id);  // 从路径参数获取 ID
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /articles/:id
 * 编辑文章
 */
async function editArticle(req, res, next) {
  try {
    const articleId = req.params.id;  // 从路径参数获取 ID

    // 置顶数量限制：最多 5 篇
    if (String(req.body.is_pinned) === '1') {
      const [rows] = await query(
        "SELECT COUNT(*) AS cnt FROM article WHERE is_pinned = '1' AND is_del = '0'"
      );
      // 如果当前文章本身未置顶，且已有 5 篇置顶，则拒绝
      const [current] = await query(
        "SELECT is_pinned FROM article WHERE id = ?", [articleId]
      );
      const alreadyPinned = current.length && String(current[0].is_pinned) === '1';
      if (!alreadyPinned && rows[0].cnt >= 5) {
        return fail(res, "置顶文章已达上限（5篇），请先取消其他置顶");
      }
    }

    await base.updateById("article", articleId, {
      title: req.body.title,
      category_id: req.body.category_id,
      content: req.body.content,
      description: req.body.description,
      cover_url: req.body.cover_url,
      video_url: req.body.video_url,
      is_published: req.body.is_published,
      is_pinned: req.body.is_pinned,
    });
    return success(res, { msg: "更新成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /comments
 * 获取评论列表
 */
async function getComment(req, res, next) {
  try {
    const data = await commentRepo.findByArticleId(req.query.id);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /comments/:id
 * 删除评论
 */
async function delComment(req, res, next) {
  try {
    await base.softDelete("comment", req.params.id);  // 从路径参数获取 ID
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /messages (前台)
 * 获取留言列表
 */
async function getMessages(req, res, next) {
  try {
    const data = await base.findAllActive("messages");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /messages (管理端)
 * 获取留言列表（分页）
 */
async function adminGetMessages(req, res, next) {
  try {
    const pageNo = Number(req.query.pageNo ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);  // 默认 5 条
    const data = await messageRepo.listAdminPage({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 5,
    });
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /messages/:id
 * 删除留言
 */
async function delMessage(req, res, next) {
  try {
    await base.softDelete("messages", req.params.id);  // 从路径参数获取 ID
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  doLogin,
  editInfo,
  getDashboard,
  getCategory,
  addCategory,
  delCategory,
  editCategory,
  getArticle,
  addArticle,
  delArticle,
  editArticle,
  getComment,
  delComment,
  getMessages,
  adminGetMessages,
  delMessage,
};

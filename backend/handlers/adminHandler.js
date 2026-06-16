const base = require("../lib/repositories/baseRepository");
const userRepo = require("../lib/repositories/userRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const commentRepo = require("../lib/repositories/commentRepository");
const messageRepo = require("../lib/repositories/messageRepository");
const dashboardService = require("../lib/services/dashboardService");
const { success, fail } = require("../lib/response");
const { query } = require("../db/index");

async function doLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userRepo.authenticate(username, password);
    if (!user) return fail(res, "用户名或密码错误！");
    req.session.logData = { ...user, login: true };
    return success(res, { msg: "登陆成功!", data: { userInfo: user } });
  } catch (err) {
    next(err);
  }
}

async function editInfo(req, res, next) {
  try {
    const { type, id, username, password } = req.body || req.query;
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

async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardData();
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const pageNo = Number(req.body.pageNo ?? req.query.pageNo ?? 1);
    const pageSize = Number(req.body.pageSize ?? req.query.pageSize ?? 10);
    const hasPagination =
      req.body.pageNo != null ||
      req.query.pageNo != null ||
      req.body.pageSize != null ||
      req.query.pageSize != null;
    const searchType = req.body.searchType ?? req.query.searchType ?? req.body.serchType ?? req.query.serchType;

    const data = hasPagination && searchType !== "all"
      ? await base.findPageActive("category", { pageNo, pageSize, orderColumn: "sort_order" })
      : await base.findAllActive("category");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    const { name, banner_url, sort_order, show_type } = req.body;
    await base.insert("category", {
      name,
      banner_url,
      sort_order,
      ...(show_type ? { show_type } : {}),
    });
    return success(res, { msg: "成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * 软删除分类
 * ⚠️ "Other" 是系统兜底分类，禁止删除 — 删除会导致文章归属、饼图统计等全部错乱
 */
async function delCategory(req, res, next) {
  try {
    const categoryId = req.body.id;
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
 * 编辑分类
 * ⚠️ 禁止修改 "Other" 兜底分类的名称
 */
async function editCategory(req, res, next) {
  try {
    // 禁止修改 Other 兜底分类
    const [targetRows] = await query(
      "SELECT name FROM category WHERE id = ? LIMIT 1",
      [req.body.id]
    );
    if (targetRows.length && targetRows[0].name === "Other") {
      return fail(res, "Other 是系统兜底分类，禁止编辑!");
    }
    await base.updateById("category", req.body.id, {
      name: req.body.name,
      banner_url: req.body.banner_url,
      sort_order: req.body.sort_order,
      ...(req.body.show_type ? { show_type: req.body.show_type } : {}),
    });
    return success(res, { msg: "修改成功" });
  } catch (err) {
    next(err);
  }
}

async function getArticle(req, res, next) {
  try {
    const pageNo = Number(req.body.pageNo ?? req.query.pageNo ?? 1);
    const pageSize = Number(req.body.pageSize ?? req.query.pageSize ?? 10);
    const src = { ...req.query, ...req.body };
    const data = await articleRepo.listAdmin({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 10,
      title: src.title,
      category_id: src.category_id,
      is_pinned: src.is_pinned,
      is_published: src.is_published,
    });
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

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
    return success(res, { msg: "成功" });
  } catch (err) {
    next(err);
  }
}

async function delArticle(req, res, next) {
  try {
    await base.softDelete("article", req.body.id);
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

async function editArticle(req, res, next) {
  try {
    // 置顶数量限制：最多 5 篇
    if (String(req.body.is_pinned) === '1') {
      const [rows] = await query(
        "SELECT COUNT(*) AS cnt FROM article WHERE is_pinned = '1' AND is_del = '0'"
      );
      // 如果当前文章本身未置顶，且已有 5 篇置顶，则拒绝
      const [current] = await query(
        "SELECT is_pinned FROM article WHERE id = ?", [req.body.id]
      );
      const alreadyPinned = current.length && String(current[0].is_pinned) === '1';
      if (!alreadyPinned && rows[0].cnt >= 5) {
        return fail(res, "置顶文章已达上限（5篇），请先取消其他置顶");
      }
    }

    await base.updateById("article", req.body.id, {
      title: req.body.title,
      category_id: req.body.category_id,
      content: req.body.content,
      description: req.body.description,
      cover_url: req.body.cover_url,
      video_url: req.body.video_url,
      is_published: req.body.is_published,
      is_pinned: req.body.is_pinned,
    });
    return success(res, { msg: "修改成功" });
  } catch (err) {
    next(err);
  }
}

async function getComment(req, res, next) {
  try {
    const data = await commentRepo.findByArticleId(req.query.id);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function delComment(req, res, next) {
  try {
    await base.softDelete("comment", req.body.id);
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const data = await base.findAllActive("messages");
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function adminGetMessages(req, res, next) {
  try {
    const pageNo = Number(req.body.pageNo ?? req.query.pageNo ?? 1);
    const pageSize = Number(req.body.pageSize ?? req.query.pageSize ?? 10);
    const data = await messageRepo.listAdminPage({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 10,
    });
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function delMessage(req, res, next) {
  try {
    await base.softDelete("messages", req.body.id || req.query.id);
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

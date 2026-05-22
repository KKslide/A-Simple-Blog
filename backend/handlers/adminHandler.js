const base = require("../lib/repositories/baseRepository");
const userRepo = require("../lib/repositories/userRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const commentRepo = require("../lib/repositories/commentRepository");
const messageRepo = require("../lib/repositories/messageRepository");
const dashboardService = require("../lib/services/dashboardService");
const { success, fail } = require("../lib/response");

async function doLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userRepo.authenticate(username, password);
    if (!user) return fail(res, "用户名或密码错误！");
    req.session.logData = { ...user, login: true };
    return res.json({ code: 1, msg: "登陆成功! ", userInfo: user });
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
    res.json(data);
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
    res.json({ data });
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

async function delCategory(req, res, next) {
  try {
    await base.softDelete("category", req.body.id);
    return success(res, { msg: "删除成功" });
  } catch (err) {
    next(err);
  }
}

async function editCategory(req, res, next) {
  try {
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
    const data = await articleRepo.listAdmin({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 10,
    });
    res.json({ data });
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
    res.json(data);
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
    const result = await messageRepo.listAdminPage({
      pageNo: pageNo > 0 ? pageNo : 1,
      pageSize: pageSize > 0 ? pageSize : 10,
    });
    res.json(result);
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

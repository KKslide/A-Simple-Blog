const util = require("../util/util");
const base = require("../lib/repositories/baseRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const indexPageService = require("../lib/services/indexPageService");
const contentService = require("../lib/services/contentService");
const visitService = require("../lib/services/visitService");
const articleViewService = require("../lib/services/articleViewService");
const { success, fail } = require("../lib/response");

async function getIndexPage(req, res, next) {
  try {
    const data = await indexPageService.getIndexPageData();
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function searchIndexPage(req, res, next) {
  try {
    const data = await articleRepo.searchPublished(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function getContentPage(req, res, next) {
  try {
    const id = req.body.contentid || req.query.contentid;
    const data = await contentService.getContentDetail(id);
    if (!data) return fail(res, "没有数据!");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function Comment(req, res, next) {
  try {
    const ip = util.getClientIp(req);
    const articleId = req.body.contentid || req.query.contentid;
    const nickname = (req.body.nickname || req.query.nickname || ip).toString().trim();
    const content = (req.body.comment || req.query.comment || "").toString().trim();

    // 输入校验
    if (!content) return fail(res, "评论内容不能为空");
    if (content.length > 500) return fail(res, "评论内容不能超过500字");
    if (nickname.length > 50) return fail(res, "昵称不能超过50字");

    await base.insert("comment", {
      article_id: articleId,
      nickname,
      content,
      ip,
    });
    return success(res, { msg: "成功" });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const data = await base.findAllActive("messages");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function leaveMessage(req, res, next) {
  try {
    const nickname = (req.body.nickname || req.query.nickname || "").toString().trim();
    const content = (req.body.content || req.query.content || "").toString().trim();
    const ip = util.getClientIp(req);

    // 输入校验
    if (!nickname) return fail(res, "昵称不能为空");
    if (!content) return fail(res, "留言内容不能为空");
    if (nickname.length > 50) return fail(res, "昵称不能超过50字");
    if (content.length > 500) return fail(res, "留言内容不能超过500字");

    await base.insert("messages", {
      nickname,
      content,
      ip,
    });
    return success(res, { msg: "成功" });
  } catch (err) {
    next(err);
  }
}

async function visitRecord(req, res, next) {
  try {
    const result = await visitService.recordSiteVisit(req);
    return success(res, { msg: "成功", data: result });
  } catch (err) {
    next(err);
  }
}

/** 记录文章阅读 (与详情分离) */
async function recordArticleView(req, res, next) {
  try {
    const articleId = req.body.contentid || req.body.articleId || req.query.contentid;
    const ip = util.getClientIp(req);
    const result = await articleViewService.recordArticleView(articleId, ip);
    return success(res, { msg: "成功", data: result });
  } catch (err) {
    if (err.status === 400) return fail(res, err.message);
    if (err.status === 404) return fail(res, err.message);
    next(err);
  }
}

module.exports = {
  getIndexPage,
  searchIndexPage,
  getContentPage,
  Comment,
  getMessages,
  leaveMessage,
  visitRecord,
  recordArticleView,
};

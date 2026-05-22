const util = require("../util/util");
const base = require("../lib/repositories/baseRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const indexPageService = require("../lib/services/indexPageService");
const contentService = require("../lib/services/contentService");
const visitService = require("../lib/services/visitService");
const articleViewService = require("../lib/services/articleViewService");
const { success } = require("../lib/response");

async function getIndexPage(req, res, next) {
  try {
    const data = await indexPageService.getIndexPageData();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function searchIndexPage(req, res, next) {
  try {
    const data = await articleRepo.searchPublished(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getContentPage(req, res, next) {
  try {
    const id = req.body.contentid || req.query.contentid;
    const data = await contentService.getContentDetail(id);
    if (!data) return res.json({ code: 0, msg: "没有数据!" });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function Comment(req, res, next) {
  try {
    const ip = util.getClientIp(req);
    const articleId = req.body.contentid || req.query.contentid;
    await base.insert("comment", {
      article_id: articleId,
      nickname: req.body.nickname || req.query.nickname || ip,
      content: req.body.comment || req.query.comment,
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
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function leaveMessage(req, res, next) {
  try {
    await base.insert("messages", {
      nickname: req.query.nickname || req.body.nickname,
      content: req.query.content || req.body.content,
      ip: util.getClientIp(req),
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
    if (err.status === 400) return res.status(400).json({ code: 0, msg: err.message });
    if (err.status === 404) return res.status(404).json({ code: 0, msg: err.message });
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

/**
 * 前台处理器
 *
 * 遵循 RESTful 规范：
 * - 资源 ID 从路径参数获取（req.params.id）
 * - 查询参数从 req.query 获取
 * - 请求体从 req.body 获取
 */

const util = require("../util/util");
const base = require("../lib/repositories/baseRepository");
const articleRepo = require("../lib/repositories/articleRepository");
const indexPageService = require("../lib/services/indexPageService");
const contentService = require("../lib/services/contentService");
const visitService = require("../lib/services/visitService");
const articleViewService = require("../lib/services/articleViewService");
const { success, fail } = require("../lib/response");

/**
 * GET /articles
 * 获取首页文章列表（按分类分组）
 */
async function getIndexPage(req, res, next) {
  try {
    const data = await indexPageService.getIndexPageData();
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /articles/search
 * 搜索文章
 */
async function searchIndexPage(req, res, next) {
  try {
    const data = await articleRepo.searchPublished(req.query);  // GET 请求，参数从 query 获取
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /articles/:id
 * 获取文章详情（含上下篇和评论）
 */
async function getContentPage(req, res, next) {
  try {
    const id = req.params.id;  // 从路径参数获取 ID
    const data = await contentService.getContentDetail(id);
    if (!data) return fail(res, "文章不存在");
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /articles/:id/comments
 * 发表评论
 */
async function Comment(req, res, next) {
  try {
    const ip = util.getClientIp(req);
    const articleId = req.params.id;  // 从路径参数获取文章 ID
    const nickname = (req.body.nickname || ip).toString().trim();
    const content = (req.body.comment || "").toString().trim();

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
    return success(res, { msg: "评论成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /messages
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
 * POST /messages
 * 提交留言
 */
async function leaveMessage(req, res, next) {
  try {
    const ip = util.getClientIp(req);
    const nickname = (req.body.nickname || ip).toString().trim();
    const content = (req.body.content || "").toString().trim();

    // 输入校验
    if (!content) return fail(res, "留言内容不能为空");
    if (nickname.length > 50) return fail(res, "昵称不能超过50字");
    if (content.length > 500) return fail(res, "留言内容不能超过500字");

    await base.insert("messages", {
      nickname,
      content,
      ip,
    });
    return success(res, { msg: "留言成功" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /visits
 * 记录全站访问（PV）
 */
async function visitRecord(req, res, next) {
  try {
    const result = await visitService.recordSiteVisit(req);
    return success(res, { msg: "访问已记录", data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /articles/:id/view
 * 记录文章阅读（IP+日期去重）
 */
async function recordArticleView(req, res, next) {
  try {
    const articleId = req.params.id;  // 从路径参数获取文章 ID
    const ip = util.getClientIp(req);
    const result = await articleViewService.recordArticleView(articleId, ip);
    return success(res, { msg: "阅读已记录", data: result });
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

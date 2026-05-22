/** 文章阅读统计: 与详情接口分离, 按 IP + 自然日去重 */
const { query } = require("../../db/index");
const base = require("../repositories/baseRepository");
const util = require("../../util/util");

/**
 * 今日是否已计过该 IP 对该文章的阅读
 */
async function hasViewedToday(articleId, ip) {
  const [rows] = await query(
    `SELECT id FROM article_view_log
     WHERE article_id = ? AND ip = ? AND DATE(viewed_at) = CURDATE()
     LIMIT 1`,
    [articleId, ip]
  );
  return rows.length > 0;
}

/**
 * 文章是否存在且已发布
 */
async function isPublishedArticle(articleId) {
  const [rows] = await query(
    `SELECT id, view_count FROM article
     WHERE id = ? AND is_del = 0 AND is_published = 1
     LIMIT 1`,
    [articleId]
  );
  return rows[0] || null;
}

/**
 * 记录文章阅读 (同日同 IP 只计一次)
 * @param {number} articleId
 * @param {string} ip
 * @returns {Promise<{ counted: boolean, view_count: number }>}
 */
async function recordArticleView(articleId, ip) {
  const id = base.toPositiveInt(articleId, 0);
  if (!id) {
    const err = new Error("无效的文章 ID");
    err.status = 400;
    throw err;
  }

  const article = await isPublishedArticle(id);
  if (!article) {
    const err = new Error("文章不存在或未发布");
    err.status = 404;
    throw err;
  }

  const clientIp = ip || "unknown";

  if (await hasViewedToday(id, clientIp)) {
    return { counted: false, view_count: article.view_count };
  }

  const now = util.getNow();
  await query(
    `INSERT INTO article_view_log (article_id, ip, viewed_at) VALUES (?, ?, ?)`,
    [id, clientIp, now]
  );
  await query(`UPDATE article SET view_count = view_count + 1 WHERE id = ?`, [id]);

  return {
    counted: true,
    view_count: (article.view_count ?? 0) + 1,
  };
}

module.exports = { recordArticleView, hasViewedToday, isPublishedArticle };

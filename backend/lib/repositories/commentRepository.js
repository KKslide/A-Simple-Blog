const { query } = require("../../db/index");
const base = require("./baseRepository");

/** 按文章 id 查询未删除评论 */
async function findByArticleId(articleId) {
  const id = base.toPositiveInt(articleId, 0);
  if (!id) return [];
  const [rows] = await query(
    "SELECT * FROM comment WHERE article_id = ? AND is_del = '0'",
    [id]
  );
  return rows;
}

module.exports = { findByArticleId };

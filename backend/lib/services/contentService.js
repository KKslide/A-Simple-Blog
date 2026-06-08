/** 文章详情：正文、评论、上下篇、浏览量 */
const { query } = require("../../db/index");
const utils = require("../../util/util");
const base = require("../repositories/baseRepository");

/** 格式化为 MySQL DATETIME 字符串 */
function formatDateToSQLString(date) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function getContentDetail(id) {
  const articleId = base.toPositiveInt(id, 0);
  if (!articleId) return null;

  const curSql = `
    SELECT
      a.id, a.title, a.category_id AS category_id, c.name AS category,
      c.banner_url AS category_banner_url, a.content, a.description, a.created_at,
      a.view_count, a.video_url, a.cover_url, a.is_published, a.is_del,
      IF(COUNT(comm.id) > 0,
        JSON_ARRAYAGG(JSON_OBJECT(
          'id', comm.id, 'article_id', comm.article_id, 'nickname', comm.nickname,
          'created_at', comm.created_at, 'ip', comm.ip, 'content', comm.content, 'is_del', comm.is_del
        )),
        JSON_ARRAY()
      ) AS comment
    FROM article a
    JOIN category c ON a.category_id = c.id
    LEFT JOIN comment comm ON a.id = comm.article_id AND comm.is_del = '0'
    WHERE a.id = ? AND a.is_del = '0' AND a.is_published = '1'
    GROUP BY a.id
  `;

  const [rows] = await query(curSql, [articleId]);
  const cur = rows[0];
  if (!cur) return null;

  if (cur.comment && typeof cur.comment === "string") {
    cur.comment = JSON.parse(cur.comment);
  }

  const categoryId = cur.category_id;
  const addTime = formatDateToSQLString(cur.created_at);

  const prevSql = `
    SELECT a.* FROM article a
    WHERE a.category_id = ? AND a.is_del = '0' AND a.is_published = '1' AND a.created_at < ?
    ORDER BY a.created_at DESC LIMIT 1
  `;
  const nextSql = `
    SELECT a.* FROM article a
    WHERE a.category_id = ? AND a.is_del = '0' AND a.is_published = '1' AND a.created_at > ?
    ORDER BY a.created_at ASC LIMIT 1
  `;

  const [prevResult, nextResult] = await Promise.all([
    query(prevSql, [categoryId, addTime]),
    query(nextSql, [categoryId, addTime]),
  ]);

  // 阅读量由 POST /user/content/view 单独统计, 详情接口不再自增

  return {
    prev: prevResult[0][0] || null,
    cur,
    next: nextResult[0][0] || null,
  };
}

module.exports = { getContentDetail };

const { query } = require("../../db/index");
const base = require("./baseRepository");

/** 管理端文章列表（含评论数、分类名） */
async function listAdmin({ pageNo = 1, pageSize = 10 } = {}) {
  const pNo = base.toPositiveInt(pageNo, 1);
  const pSize = base.toPositiveInt(pageSize, 10);
  const offset = (pNo - 1) * pSize;
  const [rows] = await query(
    `
    SELECT
      (SELECT COUNT(*) FROM article) AS total,
      COUNT(cm.article_id) AS comment_num,
      cate.name AS cate_name,
      a.*
    FROM article a
    LEFT JOIN category cate ON a.category_id = cate.id
    LEFT JOIN comment cm ON a.id = cm.article_id AND cm.is_del = '0'
    WHERE a.is_del = '0'
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [pSize, offset]
  );
  return rows;
}

/**
 * 前台已发布文章搜索
 * @param {import('express').Request['body']} body 请求体
 */
async function searchPublished(body) {
  let { keyword, starttime, endtime, category_id, pageNo, pageSize } = body;

  keyword = keyword && String(keyword).trim() !== "" ? String(keyword).trim() : null;
  category_id = category_id != null && !isNaN(category_id) ? Number(category_id) : null;
  starttime = starttime && String(starttime).trim() !== "" ? String(starttime).trim() : null;
  endtime = endtime && String(endtime).trim() !== "" ? String(endtime).trim() : null;
  pageNo = pageNo != null && !isNaN(pageNo) ? Number(pageNo) : null;
  pageSize = pageSize != null && !isNaN(pageSize) ? Number(pageSize) : null;

  let sql = `
    SELECT
      (SELECT COUNT(*)
       FROM article a2
       LEFT JOIN category c2 ON a2.category_id = c2.id
       WHERE a2.is_del = '0' AND a2.is_published = '1' AND c2.is_del = '0'
       ${category_id !== null ? " AND a2.category_id = ?" : ""}
       ${keyword !== null ? " AND (a2.title LIKE ? OR a2.description LIKE ?)" : ""}
       ${starttime !== null ? " AND a2.created_at >= ?" : ""}
       ${endtime !== null ? " AND a2.created_at <= ?" : ""}
      ) AS total,
      COUNT(cm.article_id) AS comment_num,
      cate.name AS cate_name,
      a.*
    FROM article a
    LEFT JOIN category cate ON a.category_id = cate.id
    LEFT JOIN comment cm ON a.id = cm.article_id AND cm.is_del = '0'
    WHERE a.is_del = '0' AND a.is_published = '1' AND cate.is_del = '0'
    ${category_id !== null ? " AND a.category_id = ?" : ""}
    ${keyword !== null ? " AND (a.title LIKE ? OR a.description LIKE ?)" : ""}
    ${starttime !== null ? " AND a.created_at >= ?" : ""}
    ${endtime !== null ? " AND a.created_at <= ?" : ""}
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;

  const params = [];
  const pushFilters = () => {
    if (category_id !== null) params.push(category_id);
    if (keyword !== null) {
      const like = `%${keyword}%`;
      params.push(like, like);
    }
    if (starttime !== null) params.push(starttime);
    if (endtime !== null) params.push(endtime);
  };

  pushFilters();
  pushFilters();

  if (pageNo !== null && pageSize !== null) {
    const offset = (pageNo - 1) * pageSize;
    sql += " LIMIT ? OFFSET ?";
    params.push(pageSize, offset);
  }

  const [rows] = await query(sql, params);
  return rows;
}

module.exports = { listAdmin, searchPublished };

/** 前台首页：分类 + 按分类聚合的文章列表 */
const { query } = require("../../db/index");

async function getIndexPageData() {
  const categoryQuery =
    "SELECT id, name, show_type, banner_url, sort_order FROM category WHERE is_del = '0' ORDER BY sort_order DESC";

  const articleQuery = `
    WITH RankedArticles AS (
      SELECT
        a.id, a.title, cat.name AS category, a.description, a.created_at,
        a.view_count, a.cover_url, a.is_pinned, cat.sort_order,
        ROW_NUMBER() OVER(PARTITION BY a.category_id ORDER BY a.created_at DESC) AS rn
      FROM article a
      INNER JOIN category cat ON a.category_id = cat.id
      WHERE a.is_del = '0' AND a.is_published = '1' AND cat.is_del = '0'
    )
    SELECT ra.*, IFNULL(c.comment_num, 0) AS comment_num
    FROM RankedArticles ra
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS comment_num
      FROM comment WHERE is_del = '0' GROUP BY article_id
    ) c ON ra.id = c.article_id
    ORDER BY ra.sort_order, ra.created_at DESC
  `;

  const [catList] = await query(categoryQuery);
  const [articleList] = await query(articleQuery);

  const blogList = { TOP: [] };
  catList.forEach((cat) => {
    blogList[cat.name] = [];
  });

  articleList.forEach((article) => {
    delete article.rn;
    if (blogList[article.category] && article.is_pinned == "0") {
      blogList[article.category].push(article);
    }
    if (article.is_pinned == "1") {
      blogList.TOP.push(article);
    }
  });

  return { catList, blogList };
}

module.exports = { getIndexPageData };

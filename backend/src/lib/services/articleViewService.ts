/** 文章阅读统计: 与详情接口分离, 按 IP + 自然日去重 */
import createError from 'http-errors'
import { query, type Rows } from '../../db/index.ts'
import * as base from '../repositories/baseRepository.ts'
import * as util from '../../util/util.ts'

interface PublishedArticleRow {
  id: number
  view_count: number
}

interface ViewRecordResult {
  counted: boolean
  view_count: number
}

/**
 * 今日是否已计过该 IP 对该文章的阅读
 */
async function hasViewedToday(articleId: number, ip: string): Promise<boolean> {
  const [rows] = await query<Rows<{ id: number }>>(
    `SELECT id FROM article_view_log
     WHERE article_id = ? AND ip = ? AND DATE(viewed_at) = CURDATE()
     LIMIT 1`,
    [articleId, ip],
  )
  return rows.length > 0
}

/**
 * 文章是否存在且已发布
 */
async function isPublishedArticle(articleId: number): Promise<PublishedArticleRow | null> {
  const [rows] = await query<Rows<PublishedArticleRow>>(
    `SELECT id, view_count FROM article
     WHERE id = ? AND is_del = 0 AND is_published = 1
     LIMIT 1`,
    [articleId],
  )
  return rows[0] || null
}

/**
 * 记录文章阅读 (同日同 IP 只计一次)
 */
async function recordArticleView(
  articleId: number | string,
  ip: string,
): Promise<ViewRecordResult> {
  const id = base.toPositiveInt(articleId, 0)
  if (!id) {
    throw createError(400, '无效的文章 ID')
  }

  const article = await isPublishedArticle(id)
  if (!article) {
    throw createError(404, '文章不存在或未发布')
  }

  const clientIp = ip || 'unknown'

  if (await hasViewedToday(id, clientIp)) {
    return { counted: false, view_count: article.view_count }
  }

  const now = util.getNow()
  await query(`INSERT INTO article_view_log (article_id, ip, viewed_at) VALUES (?, ?, ?)`, [
    id,
    clientIp,
    now,
  ])
  await query(`UPDATE article SET view_count = view_count + 1 WHERE id = ?`, [id])

  return {
    counted: true,
    view_count: (article.view_count ?? 0) + 1,
  }
}

export { recordArticleView, hasViewedToday, isPublishedArticle }

import { query, type Rows } from '../../db/index.ts'
import * as base from './baseRepository.ts'
import type { ArticleAdminListItem, ArticleSearchItem } from '../../types/entities.ts'

interface AdminListParams {
  pageNo?: number
  pageSize?: number
  title?: unknown
  category_id?: unknown
  is_pinned?: unknown
  is_published?: unknown
}

/** 管理端文章列表（含评论数、分类名） */
async function listAdmin({
  pageNo = 1,
  pageSize = 10,
  title,
  category_id,
  is_pinned,
  is_published,
}: AdminListParams = {}): Promise<ArticleAdminListItem[]> {
  const pNo = base.toPositiveInt(pageNo, 1)
  const pSize = base.toPositiveInt(pageSize, 10)
  const offset = (pNo - 1) * pSize

  // 动态筛选条件
  const conditions: string[] = []
  const params: unknown[] = []

  if (title != null && String(title).trim() !== '') {
    conditions.push('a.title LIKE ?')
    params.push(`%${String(title).trim()}%`)
  }
  if (category_id != null && !isNaN(Number(category_id)) && Number(category_id) !== 0) {
    conditions.push('a.category_id = ?')
    params.push(Number(category_id))
  }
  if (is_pinned != null && is_pinned !== '') {
    conditions.push('a.is_pinned = ?')
    params.push(String(is_pinned))
  }
  if (is_published != null && is_published !== '') {
    conditions.push('a.is_published = ?')
    params.push(String(is_published))
  }

  const whereExtra = conditions.length ? ' AND ' + conditions.join(' AND ') : ''

  const [rows] = await query<Rows<ArticleAdminListItem>>(
    `
    SELECT
      (SELECT COUNT(*) FROM article a2 WHERE a2.is_del = '0'${whereExtra.replace(/\ba\./g, 'a2.')}) AS total,
      COUNT(cm.article_id) AS comment_num,
      cate.name AS cate_name,
      a.*
    FROM article a
    LEFT JOIN category cate ON a.category_id = cate.id
    LEFT JOIN comment cm ON a.id = cm.article_id AND cm.is_del = '0'
    WHERE a.is_del = '0'${whereExtra}
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, ...params, pSize, offset],
  )
  return rows
}

/**
 * 前台已发布文章搜索
 * @param body 查询参数（req.query 原样传入）
 */
async function searchPublished(body: Record<string, unknown>): Promise<ArticleSearchItem[]> {
  const raw = body

  const keyword =
    raw.keyword && String(raw.keyword).trim() !== '' ? String(raw.keyword).trim() : null
  const category_id =
    raw.category_id != null && !isNaN(Number(raw.category_id)) && Number(raw.category_id) !== 0
      ? Number(raw.category_id)
      : null
  const starttime =
    raw.starttime && String(raw.starttime).trim() !== '' ? String(raw.starttime).trim() : null
  const endtime =
    raw.endtime && String(raw.endtime).trim() !== '' ? String(raw.endtime).trim() : null
  const pageNo: number | null =
    raw.pageNo != null && !isNaN(Number(raw.pageNo)) ? Number(raw.pageNo) : null
  const pageSize: number | null =
    raw.pageSize != null && !isNaN(Number(raw.pageSize)) ? Number(raw.pageSize) : null

  // 构建 WHERE 子句片段
  const conditions: string[] = []
  if (category_id !== null) conditions.push('category_id = ?')
  if (keyword !== null) conditions.push('(title LIKE ? OR description LIKE ?)')
  if (starttime !== null) conditions.push('created_at >= ?')
  if (endtime !== null) conditions.push('created_at <= ?')
  const whereClause = conditions.length ? ' AND ' + conditions.join(' AND ') : ''

  let sql = `
    SELECT
      (SELECT COUNT(*)
       FROM article a2
       LEFT JOIN category c2 ON a2.category_id = c2.id
       WHERE a2.is_del = '0' AND a2.is_published = '1' AND c2.is_del = '0'
       ${whereClause}
      ) AS total,
      COUNT(cm.article_id) AS comment_num,
      cate.name AS cate_name,
      a.*
    FROM article a
    LEFT JOIN category cate ON a.category_id = cate.id
    LEFT JOIN comment cm ON a.id = cm.article_id AND cm.is_del = '0'
    WHERE a.is_del = '0' AND a.is_published = '1' AND cate.is_del = '0'
    ${whereClause}
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `

  // 参数收集一次，用于子查询 + 主查询（各一份）
  const buildParams = (): unknown[] => {
    const p: unknown[] = []
    if (category_id !== null) p.push(category_id)
    if (keyword !== null) {
      const like = `%${keyword}%`
      p.push(like, like)
    }
    if (starttime !== null) p.push(starttime)
    if (endtime !== null) p.push(endtime)
    return p
  }
  const params = [...buildParams(), ...buildParams()]

  if (pageNo !== null && pageSize !== null) {
    const offset = (pageNo - 1) * pageSize
    sql += ' LIMIT ? OFFSET ?'
    params.push(pageSize, offset)
  }

  const [rows] = await query<Rows<ArticleSearchItem>>(sql, params)
  return rows
}

export { listAdmin, searchPublished }

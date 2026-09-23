import { query, type Rows } from '../../db/index.ts'
import * as base from './baseRepository.ts'
import type { CommentRow } from '../../types/entities.ts'

/** 按文章 id 查询未删除评论 */
async function findByArticleId(articleId: number | string): Promise<CommentRow[]> {
  const id = base.toPositiveInt(articleId, 0)
  if (!id) return []
  const [rows] = await query<Rows<CommentRow>>(
    "SELECT * FROM comment WHERE article_id = ? AND is_del = '0'",
    [id],
  )
  return rows
}

export { findByArticleId }

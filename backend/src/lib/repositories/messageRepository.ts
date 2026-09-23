import { query, type Rows } from '../../db/index.ts'
import * as base from './baseRepository.ts'
import type { MessageRow } from '../../types/entities.ts'

interface PageParams {
  pageNo?: number
  pageSize?: number
}

interface AdminPageResult {
  messages: MessageRow[]
  pages: number
  total: number
}

/** 管理端留言分页列表 */
async function listAdminPage({
  pageNo = 1,
  pageSize = 10,
}: PageParams = {}): Promise<AdminPageResult> {
  const pNo = base.toPositiveInt(pageNo, 1)
  const pSize = base.toPositiveInt(pageSize, 10)
  const [countRows] = await query<Rows<{ count: number }>>(
    "SELECT COUNT(*) AS count FROM messages WHERE is_del = '0'",
  )
  const count = countRows[0]?.count ?? 0
  const messages = await base.findPageActive('messages', { pageNo: pNo, pageSize: pSize })
  return {
    messages,
    pages: Math.ceil(count / pSize),
    total: count,
  }
}

export { listAdminPage }

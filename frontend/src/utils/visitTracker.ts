/**
 * 访问统计前端节流 (无 Redis 场景)
 * - 全站: 每个浏览器会话上报一次 PV
 * - 文章阅读: 由后端按 IP+自然日去重, 前端不做 session 阻断
 */

const SITE_VISIT_KEY = 'blog_site_visit_recorded'

/** 本会话是否已上报全站访问 */
export function hasRecordedSiteVisit(): boolean {
  try {
    return sessionStorage.getItem(SITE_VISIT_KEY) === '1'
  } catch {
    return false
  }
}

/** 标记本会话已上报全站访问 */
export function markSiteVisitRecorded(): void {
  try {
    sessionStorage.setItem(SITE_VISIT_KEY, '1')
  } catch {
    /* ignore */
  }
}

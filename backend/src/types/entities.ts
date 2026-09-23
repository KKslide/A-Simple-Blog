/**
 * 数据库实体类型
 *
 * 与 myblog 库 7 张表的结构一一对应（见 information_schema）。
 *
 * 类型映射规则（mysql2 默认行为）：
 *   - int / tinyint(1)   → number
 *   - varchar / longtext → string（可空列带 | null）
 *   - datetime           → Date（经 res.json 序列化后为 ISO 字符串）
 */

// ============================================================
// 基础表行类型
// ============================================================

/** article 文章表 */
export interface ArticleRow {
  id: number
  title: string
  category_id: number
  content: string | null
  description: string | null
  cover_url: string | null
  video_url: string | null
  view_count: number
  is_published: number
  is_pinned: number
  is_del: number
  created_at: Date | string
  updated_at: Date | string
}

/** category 分类表 */
export interface CategoryRow {
  id: number
  name: string
  banner_url: string | null
  sort_order: number
  show_type: string
  is_del: number
  created_at: Date | string
  updated_at: Date | string
}

/** comment 评论表 */
export interface CommentRow {
  id: number
  article_id: number
  nickname: string
  content: string
  ip: string | null
  is_del: number
  created_at: Date | string
}

/** messages 留言表 */
export interface MessageRow {
  id: number
  nickname: string
  content: string
  ip: string | null
  is_del: number
  created_at: Date | string
}

/** users 用户表 */
export interface UserRow {
  id: number
  username: string
  password: string
  is_admin: number
  created_at: Date | string
}

/** 不含密码的用户信息（authenticate 返回值） */
export type SafeUser = Omit<UserRow, 'password'>

/** visitors 全站访问记录表 */
export interface VisitorRow {
  id: number
  ip: string | null
  visited_at: Date | string
}

/** article_view_log 文章阅读记录表 */
export interface ArticleViewLogRow {
  id: number
  article_id: number
  ip: string
  viewed_at: Date | string
}

// ============================================================
// 查询结果复合类型
// ============================================================

/** 管理端文章列表行（含评论数、分类名、总数） */
export interface ArticleAdminListItem extends ArticleRow {
  total?: number
  comment_num?: number
  cate_name?: string | null
}

/** 前台文章搜索行（含评论数、分类名、总数） */
export interface ArticleSearchItem extends ArticleRow {
  total?: number
  comment_num?: number
  cate_name?: string | null
}

/** 前台首页文章行（按分类聚合用） */
export interface IndexArticleItem {
  id: number
  title: string
  category: string
  description: string | null
  created_at: Date | string
  view_count: number
  cover_url: string | null
  is_pinned: number
  sort_order: number
  comment_num: number
}

/** 文章详情行（contentService 主查询） */
export interface ContentDetailRow {
  id: number
  title: string
  category_id: number
  category: string
  category_banner_url: string | null
  content: string | null
  description: string | null
  created_at: Date | string
  view_count: number
  video_url: string | null
  cover_url: string | null
  is_published: number
  is_del: number
  /** JSON_ARRAYAGG 序列化字符串，需 JSON.parse 后为 CommentItemRow[] */
  comment: string | CommentItemRow[]
}

/** 评论 JSON 对象（JSON_ARRAYAGG(JSON_OBJECT(...)) 的元素） */
export interface CommentItemRow {
  id: number
  article_id: number
  nickname: string
  created_at: Date | string
  ip: string | null
  content: string
  is_del: number
}

/** 文章详情响应（含上下篇） */
export interface ContentDetailResult {
  prev: ArticleRow | null
  cur: ContentDetailRow
  next: ArticleRow | null
}

/** 仪表盘饼图行 */
export interface DashboardPieRow {
  name: string
  value: number
}

/** 仪表盘近 24 小时 PV 行 */
export interface DashboardTimelineRow {
  hour: number
  count: number
}

/** 仪表盘 PV/UV 汇总 */
export interface SiteVisitStats {
  pvTotal: number
  pvToday: number
  uvTotal: number
  uvToday: number
}

/** 仪表盘统计行 */
export interface DashboardStatsRow {
  userNum: number
  articleNum: number
}

// ============================================================
// baseRepository 白名单映射
// ============================================================

/** 表键 → 行类型的映射（供 baseRepository 泛型推导） */
export interface TableRowMap {
  category: CategoryRow
  article: ArticleRow
  comment: CommentRow
  messages: MessageRow
  users: UserRow
  visitors: VisitorRow
}

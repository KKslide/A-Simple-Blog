/**
 * API 相关类型定义
 * 统一存放所有接口请求/响应的数据类型
 *
 * 命名约定：
 *   - XxxItem      — 列表项（如 ArticleItem、CategoryItem）
 *   - XxxConfig    — 业务配置/表单（如 BlogItemConfig、ContentConfig）
 *   - XxxResponse  — 接口响应包装（如 ContentResponse）
 *   - XxxData      — 纯数据（不含 code/msg 包装）
 */

// ============================================================
// 通用响应
// ============================================================

/** 统一接口响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  msg?: string
  message?: string
  successed?: boolean
  data?: T
  [key: string]: unknown
}

/** 上传接口响应 */
export interface UploadResponse {
  code: number
  msg?: string
  data?: {
    imageUrl?: string
  }
}

// ============================================================
// 用户相关
// ============================================================

/** 登录用户信息 */
export interface UserDataConfig {
  id: number
  username: string
  is_admin: number
  login: boolean
}

/** 登录表单 */
export interface UserForm {
  username: string
  password: string
}

/** @deprecated 使用 ApiResponse<{ userInfo: {...} }> 替代 */
export interface LoginResponse {
  code: number
  msg?: string
  data?: {
    userInfo?: {
      id: number
      username: string
      is_admin: number
    }
  }
}

// ============================================================
// 文章相关
// ============================================================

/** 文章列表项（管理端） */
export interface ArticleItem {
  id: number
  title: string
  category_id: number
  cate_name?: string
  description: string
  is_published: string
  is_pinned: string
  content: string
  video_url: string
  cover_url: string
  created_at: string
  updated_at?: string
  view_count: number
  comment_num?: number
  total?: number
  [key: string]: unknown
}

/** 文章列表项（客户端） */
export interface BlogItemConfig {
  id: number
  title: string
  category: string
  category_id: number
  description: string
  created_at: string
  view_count: number
  cover_url: string
  video_url: string
  is_published: string | number
  is_pinned: string | number
  comment_num: number
}

/** 文章详情 */
export interface ContentConfig {
  id: number
  title: string
  category: string
  category_id: number
  category_banner_url?: string
  content: string
  description: string
  created_at: string
  view_count: number
  cover_url: string
  video_url: string
  is_published: string | number
  is_pinned?: string | number
  is_del: string | number
  comment?: CommentItem[]
}

/** 文章详情响应（含上下篇） */
export interface ContentResponse {
  code?: number
  msg?: string
  prev?: ContentConfig | null
  cur?: ContentConfig
  next?: ContentConfig | null
}

/** 文章详情数据（不含 code/msg 包装） */
export interface ContentData {
  prev?: ContentConfig | null
  cur?: ContentConfig
  next?: ContentConfig | null
}

/** 文章提交参数 */
export interface CommentSendConfig {
  contentid: number
  nickname: string
  content?: string
  comment: string
}

// ============================================================
// 分类相关
// ============================================================

/** 分类项 */
export interface CategoryItem {
  id: number
  name: string
  banner_url?: string
  sort_order?: number
  show_type?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

/** 分类项（客户端，别名保持兼容） */
export type CategoryItemConfig = CategoryItem

/** 评论项（客户端，别名保持兼容） */
export type CommentItemConfig = CommentItem
/** 客户端博客列表分组 */
export interface BloglistConfig {
  catList: CategoryItem[]
  blogList: Record<string, BlogItemConfig[]>
}

/** 客户端页面数据 */
export interface PageData {
  blogList?: BloglistConfig['blogList']
  catList?: BloglistConfig['catList']
}

// ============================================================
// 评论 / 留言
// ============================================================

/** 评论项 */
export interface CommentItem {
  id: number
  article_id: number
  nickname: string
  content: string
  created_at: string
  ip?: string
  is_del?: string | number
  [key: string]: unknown
}

/** 留言项 */
export interface MessageItem {
  id: number
  nickname: string
  content: string
  created_at: string
  ip?: string
  is_del?: string
  [key: string]: unknown
}

/** 留言数据（客户端） */
export interface MsgDataConfig {
  id: number
  nickname: string
  content: string
  ip?: string
  created_at: string
  is_del?: string | number
}

/** 留言提交参数 */
export interface MsgSendConfig {
  nickname?: string
  content?: string
}

// ============================================================
// Dashboard 图表
// ============================================================

export interface DashboardTagItem {
  tag: string
  value: number
}

export interface DashboardLineItem {
  time: string
  value: number
}

export interface DashboardPieItem {
  name: string
  value: number
}

export interface DashboardData {
  tag_list: DashboardTagItem[]
  line_chart_data: DashboardLineItem[]
  pie_chart_data: DashboardPieItem[]
}

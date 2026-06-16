/**
 * 统一接口响应格式
 * 成功: { code: 1, msg: "成功", data?: T }
 * 失败: { code: 0, msg: "错误提示" }
 */
export interface ApiResponse<T = unknown> {
  code: number
  msg?: string
  data?: T
}

export interface UploadResponse {
  code: number
  msg?: string
  data?: {
    imageUrl?: string
  }
}

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

export interface CommentItem {
  id: number
  article_id: number
  nickname: string
  content: string
  created_at: string
  ip?: string
  is_del?: string
  [key: string]: unknown
}

export interface MessageItem {
  id: number
  nickname: string
  content: string
  created_at: string
  ip?: string
  is_del?: string
  [key: string]: unknown
}

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

export interface UserForm {
  username: string
  password: string
}

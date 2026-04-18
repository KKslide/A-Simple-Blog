export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  msg?: string
  data?: T
  [key: string]: unknown
}

export interface UploadResponse {
  code: number
  imageUrl?: string
  [key: string]: unknown
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

export interface LoginResponse {
  code: number
  msg?: string
  userInfo?: {
    id: number
    username: string
    is_admin: number
  }
}

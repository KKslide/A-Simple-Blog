export interface ApiResponse<T = unknown> {
  code?: number
  msg?: string
  message?: string
  successed?: boolean
  data?: T
  [key: string]: unknown
}

export interface UserDataConfig {
  id: number
  username: string
  is_admin: number
  login: boolean
}

export interface CategoryItemConfig {
  id: number
  name: string
  banner_url?: string
  sort_order?: number
  show_type?: string
  created_at?: string
  updated_at?: string
}

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

export interface BloglistConfig {
  catList: CategoryItemConfig[]
  blogList: Record<string, BlogItemConfig[]>
}

export interface CommentItemConfig {
  id: number
  article_id: number
  nickname: string
  content: string
  ip?: string
  created_at: string
  is_del?: string | number
}

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
  comment?: CommentItemConfig[]
}

export interface ContentResponse {
  code?: number
  msg?: string
  prev?: ContentConfig | null
  cur?: ContentConfig
  next?: ContentConfig | null
}

export interface MsgDataConfig {
  id: number
  nickname: string
  content: string
  ip?: string
  created_at: string
  is_del?: string | number
}

export interface MsgSendConfig {
  nickname?: string
  content?: string
}

export interface CommentSendConfig {
  contentid: number
  nickname: string
  content: string
}

export interface PageData {
  blogList?: BloglistConfig['blogList']
  catList?: BloglistConfig['catList']
}

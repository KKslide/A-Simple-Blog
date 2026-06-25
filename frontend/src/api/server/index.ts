/**
 * 管理端 API 客户端
 *
 * 遵循 RESTful 规范：
 * - GET    读取资源
 * - POST   创建资源
 * - PUT    更新资源
 * - DELETE 删除资源
 *
 * 所有路径相对于 baseURL（开发环境为空，生产环境为 /api）
 */

import ApiHelper from '@/api/apiCaller.js'
import type {
  ApiResponse,
  UploadResponse,
  ArticleItem,
  CategoryItem,
  CommentItem,
  MessageItem,
  DashboardData,
} from '@/types/api'

class ServerAPI extends ApiHelper {
  // ============================================================
  // 认证相关
  // ============================================================

  /**
   * GET /admin/auth/status
   * 检查登录状态（页面刷新后恢复会话）
   */
  getAuthStatus() {
    return this.get<ApiResponse<{ loggedIn: boolean; userInfo?: { id: number; username: string; is_admin: number } }>>('/admin/auth/status')
  }

  /**
   * POST /admin/auth/login
   * 管理员登录
   * @param data - { username, password }
   */
  userLogin(data: Record<string, unknown>) {
    return this.post<ApiResponse<{ userInfo: { id: number; username: string; is_admin: number } }>, Record<string, unknown>>('/admin/auth/login', data)
  }

  /**
   * POST /admin/auth/logout
   * 管理员登出
   */
  userLogout() {
    return this.post<unknown>('/admin/auth/logout')
  }

  /**
   * PUT /admin/auth/password
   * 修改管理员密码或验证密码
   * @param data - { type: "check"|"edit", id?, username, password }
   */
  userEdit(data: Record<string, unknown>) {
    return this.put<ApiResponse, Record<string, unknown>>('/admin/auth/password', data)
  }

  // ============================================================
  // 仪表盘
  // ============================================================

  /**
   * GET /admin/dashboard
   * 获取仪表盘统计数据
   */
  getDashboard() {
    return this.get<ApiResponse<DashboardData>>('/admin/dashboard')
  }

  // ============================================================
  // 分类管理
  // ============================================================

  /**
   * GET /admin/categories
   * 获取分类列表（支持分页）
   * @param params - { pageNo?, pageSize?, searchType? }
   */
  getCategoryList(params: Record<string, unknown> = {}) {
    return this.get<ApiResponse<CategoryItem[]>>('/admin/categories', params)
  }

  /**
   * POST /admin/categories
   * 新增分类
   * @param data - { name, banner_url?, sort_order?, show_type? }
   */
  addCategory(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/categories', data)
  }

  /**
   * PUT /admin/categories/:id
   * 编辑分类
   * ⚠️ "Other" 是系统兜底分类，后端会拦截禁止编辑
   * @param id - 分类 ID
   * @param data - { name, banner_url?, sort_order?, show_type? }
   */
  editCategory(id: number, data: FormData | Record<string, unknown>) {
    return this.put<ApiResponse, FormData | Record<string, unknown>>(
      `/admin/categories/${id}`,
      data,
    )
  }

  /**
   * DELETE /admin/categories/:id
   * 删除分类
   * ⚠️ "Other" 是系统兜底分类，后端会拦截禁止删除
   * @param id - 分类 ID
   */
  delCategory(id: number) {
    return this.delete<ApiResponse>(`/admin/categories/${id}`)
  }

  // ============================================================
  // 文章管理
  // ============================================================

  /**
   * GET /admin/articles
   * 获取文章列表（支持分页和筛选）
   * @param params - { pageNo?, pageSize?, title?, category_id?, is_pinned?, is_published? }
   */
  getArticleList(params: Record<string, unknown> = {}) {
    return this.get<ApiResponse<ArticleItem[]>>('/admin/articles', params)
  }

  /**
   * POST /admin/articles
   * 新增文章
   * @param data - { title, category_id, content?, description?, cover_url?, video_url?, is_published?, is_pinned? }
   */
  addArticle(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/articles', data)
  }

  /**
   * PUT /admin/articles/:id
   * 编辑文章
   * @param id - 文章 ID
   * @param data - { title?, category_id?, content?, description?, cover_url?, video_url?, is_published?, is_pinned? }
   */
  editArticle(id: number, data: FormData | Record<string, unknown>) {
    return this.put<ApiResponse, FormData | Record<string, unknown>>(`/admin/articles/${id}`, data)
  }

  /**
   * DELETE /admin/articles/:id
   * 删除文章
   * @param id - 文章 ID
   */
  delArticle(id: number) {
    return this.delete<ApiResponse>(`/admin/articles/${id}`)
  }

  // ============================================================
  // 评论管理
  // ============================================================

  /**
   * GET /admin/comments
   * 获取文章的评论列表
   * @param params - { id: 文章ID }
   */
  getArticleComment(params: Record<string, unknown>) {
    return this.get<ApiResponse<CommentItem[]>>('/admin/comments', params)
  }

  /**
   * DELETE /admin/comments/:id
   * 删除评论
   * @param id - 评论 ID
   */
  delArticleComment(id: number) {
    return this.delete<ApiResponse>(`/admin/comments/${id}`)
  }

  // ============================================================
  // 留言管理
  // ============================================================

  /**
   * GET /admin/messages
   * 获取留言列表（分页）
   * @param params - { pageNo?, pageSize? }
   */
  getMsgList(params: Record<string, unknown> = {}) {
    return this.get<ApiResponse<{ messages: MessageItem[]; total: number; pages: number }>>(
      '/admin/messages',
      params,
    )
  }

  /**
   * DELETE /admin/messages/:id
   * 删除留言
   * @param id - 留言 ID
   */
  delMsg(id: number) {
    return this.delete<ApiResponse>(`/admin/messages/${id}`)
  }

  // ============================================================
  // 图片上传
  // ============================================================

  /**
   * POST /pic/img_upload
   * 本地图片上传
   * @param img - FormData，包含 file 字段
   */
  picUpload(img: FormData) {
    return this.post<UploadResponse, FormData>('/pic/img_upload', img)
  }
}

export default new ServerAPI()

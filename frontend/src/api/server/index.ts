import ApiHelper from "@/api/apiCaller.js";
import type {
  ApiResponse,
  UploadResponse,
  ArticleItem,
  CategoryItem,
  CommentItem,
  MessageItem,
  WorkItem,
  DashboardData,
  LoginResponse
} from "@/types/api";

class ServerAPI extends ApiHelper {
  // 仪表盘数据
  getDashboard() {
    return this.get<DashboardData>('/admin/dashboard')
  }

  // 分类管理
  getCategoryList() {
    return this.get<ApiResponse<CategoryItem[]>>('/admin/categories')
  }
  addCategory(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/categories/add', data)
  }
  delCategory(data: Record<string, unknown>) {
    return this.post<ApiResponse, Record<string, unknown>>('/admin/categories/del', data)
  }
  editCategory(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/categories/edit', data)
  }

  // 文章管理
  getArticleList(params: Record<string, unknown> = {}) {
    return this.get<ApiResponse<ArticleItem[]>>('/admin/articles', params)
  }
  addArticle(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/articles/add', data)
  }
  editArticle(data: FormData | Record<string, unknown>) {
    return this.post<ApiResponse, FormData | Record<string, unknown>>('/admin/articles/edit', data)
  }
  delArticle(data: Record<string, unknown>) {
    return this.post<ApiResponse, Record<string, unknown>>('/admin/articles/del', data)
  }

  // 评论管理
  getArticleComment(data: Record<string, unknown>) {
    return this.get<ApiResponse<CommentItem[]>>('/admin/comment', data)
  }
  delArticleComment(data: Record<string, unknown>) {
    return this.post<ApiResponse, Record<string, unknown>>('/admin/comment/del', data)
  }

  // 留言管理
  getMsgList(data: Record<string, unknown> = {}) {
    return this.get<{ messages: MessageItem[]; total: number; pages: number }>('/admin/message/get', data)
  }
  delMsg(data: Record<string, unknown>) {
    return this.post<unknown, Record<string, unknown>>('/admin/massage/del', data)
  }

  // 图片上传
  picUpload(img: FormData) {
    return this.post<UploadResponse, FormData>('/pic/img_upload', img)
  }

  // 登陆/登出/修改密码
  userLogin(data: Record<string, unknown>) {
    return this.post<LoginResponse, Record<string, unknown>>('/admin/login', data)
  }
  userLogout() {
    return this.post<unknown>('/admin/logout')
  }
  userEdit(data: Record<string, unknown>) {
    return this.post<{ code: number; msg?: string }, Record<string, unknown>>('/admin/info/edit', data)
  }

  // 作品管理
  getWorkList(params: Record<string, unknown> = {}) {
    return this.get<ApiResponse<WorkItem[]>>('/admin/works', params)
  }
  addWork(data: FormData | Record<string, unknown>) {
    return this.post<{ code: number; msg?: string }, FormData | Record<string, unknown>>('/admin/works/add', data)
  }
  editWork(data: FormData | Record<string, unknown>) {
    return this.post<{ code: number; msg?: string }, FormData | Record<string, unknown>>('/admin/works/edit', data)
  }
  delWork(data: Record<string, unknown>) {
    return this.post<{ code: number; msg?: string }, Record<string, unknown>>('/admin/works/del', data)
  }
}

export default new ServerAPI();

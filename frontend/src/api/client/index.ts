import type {
  MsgDataConfig,
  MsgSendConfig,
  BloglistConfig,
  ContentData,
  CommentSendConfig,
  BlogItemConfig,
  ApiResponse
} from '@/types/api'
import ApiHelper from "@/api/apiCaller.js";

/** 文章阅读统计响应 */
export interface ArticleViewResult {
  code: number
  msg?: string
  data?: {
    counted: boolean
    view_count: number
  }
}

class ClientAPI extends ApiHelper {
  /** 全站访问 PV (建议每会话调用一次) */
  visit() {
    return this.post("/user/visits");
  }

  getBlogList(data = {}) {
    return this.get<ApiResponse<BloglistConfig>>("/user/articles", data);
  }

  searchBlogList(params = {}) {
    return this.get<ApiResponse<BlogItemConfig[]>>('/user/articles/search', params);
  }

  getBlogContent(id: string | number) {
    return this.get<ApiResponse<ContentData>>(`/user/articles/${id}`);
  }

  /** 记录文章阅读 (与详情接口分离) */
  recordArticleView(id: string | number) {
    return this.post<ArticleViewResult>(`/user/articles/${id}/view`);
  }

  postBlogComment(id: string | number, data: Record<string, unknown>) {
    return this.post<ApiResponse, Record<string, unknown>>(`/user/articles/${id}/comments`, data);
  }

  getVlogList(params = {}) {
    return this.get<ApiResponse<BloglistConfig>>(`/user/articles`, params);
  }

  getMessage() {
    return this.get<ApiResponse<MsgDataConfig[]>>('/user/messages')
  }

  postMessage(data: MsgSendConfig) {
    return this.post("/user/messages", data)
  }

  getMapData(data = {}) {
    return this.get("/user/map", data)
  }
}

export default new ClientAPI();

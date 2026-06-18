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
    return this.post("/user/visit");
  }

  getBlogList(data = {}) {
    return this.get<ApiResponse<BloglistConfig>>("/user/page", data);
  }

  searchBlogList(params = {}) {
    return this.post<ApiResponse<BlogItemConfig[]>>('/user/search', params);
  }

  getBlogContent(data = {}) {
    return this.post<ApiResponse<ContentData>>("/user/content", data);
  }

  /** 记录文章阅读 (与详情接口分离) */
  recordArticleView(data: { contentid: number }) {
    return this.post<ArticleViewResult>("/user/content/view", data);
  }

  postBlogComment(data: CommentSendConfig) {
    return this.post("/user/comment", data);
  }

  getVlogList(params = {}) {
    return this.get<ApiResponse<BloglistConfig>>(`/user/page`, params);
  }

  getMessage() {
    return this.get<ApiResponse<MsgDataConfig[]>>('/user/message/get')
  }

  postMessage(data: MsgSendConfig) {
    return this.post("/user/message/add", data)
  }

  getMapData(data = {}) {
    return this.get("/user/map", data)
  }
}

export default new ClientAPI();

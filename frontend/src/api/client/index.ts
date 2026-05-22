import type {
  MsgDataConfig,
  MsgSendConfig,
  BloglistConfig,
  ContentResponse,
  CommentSendConfig,
  BlogItemConfig
} from '@/interfaces'
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
    return this.get<BloglistConfig>("/user/page", data);
  }

  searchBlogList(params = {}) {
    return this.post<BlogItemConfig[]>('/user/search', params);
  }

  getBlogContent(data = {}) {
    return this.post<ContentResponse>("/user/content", data);
  }

  /** 记录文章阅读 (与详情接口分离) */
  recordArticleView(data: { contentid: number }) {
    return this.post<ArticleViewResult>("/user/content/view", data);
  }

  postBlogComment(data: CommentSendConfig) {
    return this.post("/user/comment", data);
  }

  getVlogList(params = {}) {
    return this.get(`/user/page`, params);
  }

  getWorkList(data = {}) {
    return this.post("/user/getworklist", data);
  }

  getMessage() {
    return this.get<MsgDataConfig[]>('/user/message/get')
  }

  postMessage(data: MsgSendConfig) {
    return this.post("/user/message/add", data)
  }

  getMapData(data = {}) {
    return this.get("/user/map", data)
  }
}

export default new ClientAPI();

import type {
  MsgDataConfig,
  MsgSendConfig,
  BloglistConfig,
  ContentResponse,
  CommentSendConfig,
  BlogItemConfig
} from '@/interfaces'
import ApiHelper from "@/api/apiCaller.js";

class ClientAPI extends ApiHelper {
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

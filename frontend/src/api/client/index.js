import ApiHelper from "@/api/apiCaller.js";

class ClientAPI extends ApiHelper {
  visit() {
    return this.post("/user/visit");
  }

  getBlogList(data) {
    return this.get("/user/page", data);
  }

  searchBlogList(params) {
    return this.post('/user/search', params);
  }

  getBlogContent(data) {
    return this.post("/user/content", data);
  }

  postBlogComment(data) {
    return this.post("/user/comment", data);
  }

  getVlogList(params) {
    return this.get(`/user/page`, params);
  }

  getWorkList(data) {
    return this.post("/user/getworklist", data);
  }

  getMessage() {
    return this.get('/user/message/get')
  }

  postMessage(data) {
    return this.post("/user/message/add", data)
  }

  getMapData(data) {
    return this.get("/user/map", data)
  }
}

export default new ClientAPI();

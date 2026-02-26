import ApiHelper from "@/api/apiCaller.js";

class ServerAPI extends ApiHelper {
  getDashboard() {
    return this.get('/admin/dashboard')
  }
  getCategoryList() {
    return this.get('/admin/categories')
  }
  addCategory(data) {
    return this.post('/admin/categories/add', data)
  }
  delCategory(data) {
    return this.post('/admin/categories/del', data)
  }
  editCategory(data) {
    return this.post('/admin/categories/edit', data)
  }
  getArticleList(params) {
    return this.get('/admin/articles', params)
  }
  addArticle(data) {
    return this.post('/admin/articles/add', data)
  }
  editArticle(data) {
    return this.post('/admin/articles/edit', data)
  }
  delArticle(data) {
    return this.post('/admin/articles/del', data)
  }
  getArticleComment(data) {
    return this.get('/admin/comment', data)
  }
  delArticleComment(data) {
    return this.post('/admin/comment/del', data)
  }
  getMsgList(data) {
    return this.get('/admin/message/get', data)
  }
  delMsg(data) {
    return this.post('/admin/massage/del', data)
  }
  picUpload(img) {
    return this.post('/pic/img_upload', img)
  }
  /* **********登陆/登出/修改密码********** */
  userLogin(data) {
    return this.post('/admin/login', data)
  }
  userLogout() {
    return this.post('/admin/logout')
  }
  userEdit(data) {
    return this.post('/admin/info/edit', data)
  }
}

export default new ServerAPI();

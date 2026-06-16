# A Simple Blog

04-18
用ts把前端重写

## 环境配置

前后端均有 `.env.example` 模板文件，启动前需复制为 `.env` 并填入实际配置：

```bash
# 前端
cp frontend/.env.example frontend/.env

# 后端
cp backend/.env.example backend/.env
```

前端 `.env` 中需要自行替换的敏感配置：

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端 API 地址 |
| `VITE_MEDIA_URL` | 媒体资源地址 |
| `VITE_BAIDU_MAP_API` | 百度地图 WebGL API（替换 `ak` 参数） |
| `VITE_BAIDU_MAP_EXTENSION_CDN` | 百度地图 ECharts 扩展（替换 `ak` 参数） |

> **关于百度地图 API Key**：前端 Key 本质上是公开的（浏览器可直接查看），建议在 [百度地图开放平台](https://lbsyun.baidu.com/) 后台设置 Referer 域名白名单进行保护。

## ⚠️ 系统保留分类

**"Other" (id=3) 是系统兜底/默认分类，绝对不能删除。** 原因：
- 删除其他分类时，被删分类下的文章会自动归类到 Other
- Dashboard 饼图/统计依赖此分类
- 后端 `delCategory` 接口已做拦截保护，前端已禁用 Other 的删除按钮
- 如果误删 Other，前后端逻辑、文章归属、数据展示都会出错
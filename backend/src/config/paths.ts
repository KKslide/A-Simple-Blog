/**
 * 项目路径常量
 *
 * 基于 import.meta.url 定位后端项目根目录，与启动方式无关：
 * 本文件编译后位于 dist/config/paths.js，上溯两级即项目根目录。
 *
 * 依赖此常量的资源（.env / json/map / upload / 前端构建产物）
 * 全部位于根目录下，因此无需随编译复制。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 后端项目根目录（backend/） */
export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** .env 配置文件路径 */
export const ENV_PATH = path.join(ROOT_DIR, '.env')

/** 本地上传目录（backend/upload） */
export const UPLOAD_DIR = path.join(ROOT_DIR, 'upload')

/** ECharts 地图 GeoJSON 数据目录（backend/json/map） */
export const MAP_JSON_DIR = path.join(ROOT_DIR, 'json/map')

/** 前端构建产物目录（backend/dist/public，vite outDir） */
export const FRONTEND_DIST_DIR = path.join(ROOT_DIR, 'dist/public')

-- 访问统计功能迁移 (在已有库上执行一次即可)
-- 用法: mysql -u用户 -p 数据库名 < backend/scripts/migrate-visit-stats.sql

CREATE TABLE IF NOT EXISTS `article_view_log` (
  `id`         INT UNSIGNED   NOT NULL AUTO_INCREMENT          COMMENT '记录ID',
  `article_id` INT UNSIGNED   NOT NULL                         COMMENT '文章ID',
  `ip`         VARCHAR(45)    NOT NULL DEFAULT ''              COMMENT '访客 IP',
  `viewed_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_article_ip_day` (`article_id`, `ip`, `viewed_at`) COMMENT '同日同 IP 去重'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章阅读日志(去重)';

-- 若索引已存在会报错, 可忽略
ALTER TABLE `visitors` ADD KEY `idx_visited_at` (`visited_at`);

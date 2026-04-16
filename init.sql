/*
 优化说明:
   1. 所有表引擎统一改为 InnoDB (支持事务、外键、崩溃恢复)
   2. 所有表字符集统一改为 utf8mb4 + utf8mb4_unicode_ci (支持 emoji 及完整 Unicode)
   3. 布尔标志位统一改为 TINYINT(1), 语义更清晰, 索引效率更高
   4. 时间字段统一命名为 created_at / updated_at
   5. article.category (varchar) 改为 category_id (int 外键), 保证数据一致性
   6. 字段语义优化: composition->content, minpic_url->cover_url, video_src->video_url 等
   7. 修复 messages.add_time 错误使用 ON UPDATE 的 bug
   8. comment 表 t_id->id, a_id->article_id, user->nickname, comment->content
   9. 新增 article 与 category 之间的外键约束
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ----------------------------
-- 分类表
-- 需先于 article 表创建, 因为 article 有外键依赖此表
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id`         INT            NOT NULL AUTO_INCREMENT          COMMENT '分类ID, 主键',
  `name`       VARCHAR(100)   NOT NULL                         COMMENT '分类名称',
  `banner_url` VARCHAR(255)   DEFAULT NULL                     COMMENT '分类横幅图片 URL',
  `sort_order` INT            NOT NULL DEFAULT 0               COMMENT '排列顺序, 数值越大越靠前',
  `show_type`  VARCHAR(50)    NOT NULL DEFAULT 'card'          COMMENT '前端展示类型, 如: waterfall(瀑布流), card(卡片)',
  `is_del`     TINYINT(1)     NOT NULL DEFAULT 0               COMMENT '软删除标记: 0-正常, 1-已删除',
  `created_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类表';

-- 初始化默认分类
BEGIN;
INSERT INTO `category` (`id`, `name`, `created_at`, `updated_at`, `banner_url`, `sort_order`, `show_type`, `is_del`) 
VALUES (1, '默认分类', NOW(), NOW(), 'https://jpuboss.janime.cn/20260416fp9VMYNRXmHmkR0MaBlFWCkgOSIyqDWm', 0, 'card', 0);
COMMIT;

-- ----------------------------
-- 文章表
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT          COMMENT '文章ID, 主键',
  `title`       VARCHAR(255)   NOT NULL                         COMMENT '文章标题',
  `category_id` INT            NOT NULL                         COMMENT '所属分类ID, 关联 category.id',
  `content`     LONGTEXT       DEFAULT NULL                     COMMENT '文章正文内容 (富文本/Markdown)',
  `description` VARCHAR(500)   DEFAULT NULL                     COMMENT '文章摘要/简介',
  `cover_url`   VARCHAR(255)   DEFAULT NULL                     COMMENT '封面缩略图 URL',
  `video_url`   VARCHAR(255)   DEFAULT NULL                     COMMENT '视频类文章的视频 URL, 非视频类留空',
  `view_count`  INT UNSIGNED   NOT NULL DEFAULT 0               COMMENT '文章浏览次数',
  `is_published` TINYINT(1)   NOT NULL DEFAULT 0               COMMENT '是否发布: 0-草稿/隐藏, 1-已发布',
  `is_pinned`   TINYINT(1)    NOT NULL DEFAULT 0               COMMENT '是否置顶: 0-不置顶, 1-置顶',
  `is_del`      TINYINT(1)    NOT NULL DEFAULT 0               COMMENT '软删除标记: 0-正常, 1-已删除',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '文章创建时间',
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '文章最后编辑时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category_id` (`category_id`) COMMENT '分类ID索引, 加速按分类查询',
  KEY `idx_is_published` (`is_published`, `is_del`) COMMENT '发布状态复合索引, 加速前台列表查询'
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 外键: article.category_id -> category.id
-- 注: 若业务允许分类被删除后文章仍保留, 可改为 ON DELETE SET NULL (同时 category_id 允许为 NULL)
ALTER TABLE `article`
  ADD CONSTRAINT `fk_article_category`
  FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;


-- ----------------------------
-- 文章评论表
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id`         INT            NOT NULL AUTO_INCREMENT          COMMENT '评论ID, 主键',
  `article_id` INT            NOT NULL                         COMMENT '关联的文章ID, 对应 article.id',
  `nickname`   VARCHAR(100)   NOT NULL DEFAULT '匿名用户'       COMMENT '评论者昵称或邮箱',
  `content`    VARCHAR(500)   NOT NULL                         COMMENT '评论内容',
  `ip`         VARCHAR(45)    DEFAULT NULL                     COMMENT '评论者 IP 地址 (IPv4/IPv6, 最长 45 位)',
  `is_del`     TINYINT(1)     NOT NULL DEFAULT 0               COMMENT '软删除标记: 0-正常, 1-已删除(屏蔽)',
  `created_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_article_id` (`article_id`) COMMENT '文章ID索引, 加速查询某篇文章的所有评论'
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章评论表';


-- ----------------------------
-- 留言板表
-- 与 comment 的区别: 留言板是站点级别的公共留言, 不挂靠具体文章
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id`         INT            NOT NULL AUTO_INCREMENT          COMMENT '留言ID, 主键',
  `nickname`   VARCHAR(100)   NOT NULL DEFAULT '访客'          COMMENT '留言者昵称或邮箱',
  `content`    VARCHAR(500)   NOT NULL                         COMMENT '留言内容',
  `ip`         VARCHAR(45)    DEFAULT NULL                     COMMENT '留言者 IP 地址 (IPv4/IPv6)',
  `is_del`     TINYINT(1)     NOT NULL DEFAULT 0               COMMENT '软删除标记: 0-正常, 1-已删除(屏蔽)',
  -- 注意: 此处不加 ON UPDATE CURRENT_TIMESTAMP, 留言时间只记录首次写入时间, 不随后续操作变化
  `created_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '留言时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点留言板表';


-- ----------------------------
-- 用户表 (后台管理员账号)
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT            NOT NULL AUTO_INCREMENT          COMMENT '用户ID, 主键',
  `username`   VARCHAR(100)   NOT NULL UNIQUE                  COMMENT '用户名, 全局唯一',
  -- 密码字段存储 Hash 值 (推荐 bcrypt), 长度固定 60 位; 若用其他算法请调整长度
  `password`   CHAR(60)       NOT NULL                         COMMENT '密码 Hash 值 (如 bcrypt), 禁止明文存储',
  `is_admin`   TINYINT(1)     NOT NULL DEFAULT 0               COMMENT '是否为管理员: 0-普通用户, 1-管理员',
  `created_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '账号创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户/管理员账号表';

-- 初始化管理员账号, 密码为 123456
BEGIN;
INSERT INTO `users` (`id`, `username`, `password`, `is_admin`, `created_at`) 
VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 1, NOW());
COMMIT;

-- ----------------------------
-- 访客记录表 (PV/UV 统计原始数据)
-- ----------------------------
DROP TABLE IF EXISTS `visitors`;
CREATE TABLE `visitors` (
  `id`         INT            NOT NULL AUTO_INCREMENT          COMMENT '记录ID, 主键',
  `ip`         VARCHAR(45)    DEFAULT NULL                     COMMENT '访客 IP 地址 (IPv4/IPv6)',
  -- 不加 ON UPDATE, 只记录首次访问时间
  `visited_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_ip` (`ip`) COMMENT 'IP 索引, 用于 UV 去重统计'
) ENGINE=InnoDB AUTO_INCREMENT=769 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访客访问记录表 (用于 PV/UV 统计)';


SET FOREIGN_KEY_CHECKS = 1;
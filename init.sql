/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80020 (8.0.20)
 Source Host           : localhost:3306
 Source Schema         : myblog

 Target Server Type    : MySQL
 Target Server Version : 80020 (8.0.20)
 File Encoding         : 65001

 Date: 17/09/2025 23:05:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文章标题',
  `category` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '文章分类',
  `composition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '文章内容',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文章简介',
  `addtime` datetime DEFAULT NULL COMMENT '文章添加时间',
  `edittime` datetime DEFAULT NULL COMMENT '文章编辑时间',
  `viewnum` int DEFAULT '0' COMMENT '文章浏览次数',
  `minpic_url` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '文章缩略图',
  `video_src` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '视频分类的url',
  `is_show` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '0' COMMENT '是否显示 1-显示 0-不显示 ',
  `is_top` char(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '是否置顶 0-不置顶, 1-置顶',
  `is_del` char(1) CHARACTER SET utf8 NOT NULL DEFAULT '0' COMMENT '0-未删除; 1-已删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '分类名称',
  `addtime` timestamp NULL DEFAULT NULL COMMENT '分类添加时间',
  `edittime` timestamp NULL DEFAULT NULL COMMENT '分类修改时间',
  `banner` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '分类缩略图',
  `rank_index` int DEFAULT NULL COMMENT '排序, 数字越大越靠前',
  `is_del` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '0' COMMENT '0-未删除  1-已删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of category
-- ----------------------------
BEGIN;
INSERT INTO `category` (`id`, `name`, `addtime`, `edittime`, `banner`, `rank_index`, `is_del`) VALUES (1, 'Category', '2020-06-17 17:26:38', '2020-09-07 13:47:07', '/upload/category.jpg', 1, '0');
COMMIT;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `t_id` int NOT NULL AUTO_INCREMENT COMMENT '表格id',
  `a_id` int DEFAULT NULL COMMENT '与文章关联的id',
  `user` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '读者 或 用户',
  `time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '评论时间',
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '用户IP',
  `comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '评论内容',
  `is_del` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '0' COMMENT '0-未删除  1-已删除',
  PRIMARY KEY (`t_id`) USING BTREE,
  KEY `commentid` (`a_id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '留言时间',
  `viewer` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'stranger' COMMENT '访客名字或者邮箱',
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '留言信息',
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '用户IP',
  `is_del` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '0' COMMENT '该留言是否删除- 或屏蔽-',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名',
  `password` char(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码',
  `isadmin` tinyint(1) unsigned zerofill NOT NULL DEFAULT '0' COMMENT '是否管理员',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` (`id`, `username`, `password`, `isadmin`) VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 1);
COMMIT;

-- ----------------------------
-- Table structure for visitors
-- ----------------------------
DROP TABLE IF EXISTS `visitors`;
CREATE TABLE `visitors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=769 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

SET FOREIGN_KEY_CHECKS = 1;

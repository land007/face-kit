-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: 2018-10-19 10:37:32
-- 服务器版本： 5.7.22
-- PHP Version: 7.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `io-grpc`
--

-- --------------------------------------------------------

--
-- 表的结构 `tab_company__algorithm`
--

CREATE TABLE `tab_company__algorithm` (
  `company_algorithm_id` int(9) NOT NULL COMMENT '厂商ID',
  `company_name` varchar(64) NOT NULL COMMENT '厂商名称',
  `alg_version` varchar(15) DEFAULT NULL COMMENT '算法版本',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `sdk_file_path` varchar(256) NOT NULL COMMENT '厂商算法SDK文件路径'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `tab_company__algorithm`
--

INSERT INTO `tab_company__algorithm` (`company_algorithm_id`, `company_name`, `alg_version`, `create_time`, `update_time`, `sdk_file_path`) VALUES
(1, 'EYE', '1005', '2018-10-16 03:13:16', '2018-10-16 03:13:16', '');

-- --------------------------------------------------------

--
-- 表的结构 `tab_comparison_history`
--

CREATE TABLE `tab_comparison_history` (
  `identity_id` varchar(128) NOT NULL COMMENT '人员ID',
  `feature_id` varchar(64) NOT NULL COMMENT '特征ID',
  `id` int(19) NOT NULL COMMENT '自增序号',
  `name` varchar(128) NOT NULL,
  `feature` varchar(800) NOT NULL COMMENT '特征base64',
  `file_id` varchar(36) DEFAULT NULL COMMENT '文件唯一标识',
  `media_type_id` mediumint(9) DEFAULT NULL COMMENT '媒体文件类型ID(JPG、BMP、PNG、WSQ、MP3、WAV、AVI、RAW等ID)',
  `checksum` varchar(36) DEFAULT NULL COMMENT '文件校验值({SHA1/MD5}值)',
  `file_size` bigint(20) DEFAULT NULL COMMENT '文件大小',
  `bio_type_id` mediumint(9) NOT NULL COMMENT '生物特征类型ID',
  `create_time` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `company_algorithm_id` int(11) NOT NULL COMMENT '厂商算法ID',
  `library_code` varchar(64) NOT NULL COMMENT '特征库编码',
  `match_data` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='特征表';

-- --------------------------------------------------------

--
-- 表的结构 `tab_features`
--

CREATE TABLE `tab_features` (
  `identity_id` varchar(128) NOT NULL COMMENT '人员ID',
  `feature_id` varchar(64) NOT NULL COMMENT '特征ID',
  `id` int(19) NOT NULL COMMENT '自增序号',
  `name` varchar(128) NOT NULL COMMENT '人员姓名',
  `feature` varchar(800) NOT NULL COMMENT '特征base64',
  `file_id` varchar(36) DEFAULT NULL COMMENT '文件唯一标识',
  `media_type_id` mediumint(9) DEFAULT NULL COMMENT '媒体文件类型ID(JPG、BMP、PNG、WSQ、MP3、WAV、AVI、RAW等ID)',
  `checksum` varchar(36) DEFAULT NULL COMMENT '文件校验值({SHA1/MD5}值)',
  `file_size` bigint(20) DEFAULT NULL COMMENT '文件大小',
  `bio_type_id` mediumint(9) NOT NULL COMMENT '生物特征类型ID',
  `create_time` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_time` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `expire_time` timestamp NULL DEFAULT NULL COMMENT '到期时间',
  `company_algorithm_id` int(11) NOT NULL COMMENT '厂商算法ID',
  `library_code` varchar(64) NOT NULL COMMENT '特征库编码',
  `status_id` mediumint(9) DEFAULT NULL COMMENT '状态标志ID(0-正常,1-未启用,2-停用)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='特征表';

-- --------------------------------------------------------

--
-- 表的结构 `tab_library`
--

CREATE TABLE `tab_library` (
  `library_code` varchar(64) NOT NULL COMMENT '特征库标识',
  `library_name` varchar(256) DEFAULT NULL COMMENT '特征库名称',
  `library_id` mediumint(9) NOT NULL COMMENT '自增ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `tab_library`
--

INSERT INTO `tab_library` (`library_code`, `library_name`, `library_id`) VALUES
('', '', 928),
(':brary', ':brary', 929),
(':lbrary', ':lbrary', 930),
('abc', 'abc', 932),
('Test', 'Test', 931);

-- --------------------------------------------------------

--
-- 表的结构 `tab__bio_type`
--

CREATE TABLE `tab__bio_type` (
  `id` mediumint(9) NOT NULL,
  `bio_code` varchar(10) NOT NULL COMMENT '特征识别标识(FINGER: 指纹，FACE: 人脸，IRIS: 虹膜，FVEIN: 指静脉，OCR: 文字识别，VOCAL: 声纹)',
  `bio_name` varchar(30) DEFAULT NULL COMMENT '特征识别名称(指纹，人脸， 虹膜，指静脉，OCR，声纹)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `tab__bio_type`
--

INSERT INTO `tab__bio_type` (`id`, `bio_code`, `bio_name`) VALUES
(1, 'FINGER', '指纹'),
(2, 'FACE', '人脸'),
(3, 'IRIS', '虹膜'),
(4, 'FVEIN', '指静脉'),
(5, 'OCR', '文字识别'),
(6, 'VOCAL', '声纹');

-- --------------------------------------------------------

--
-- 表的结构 `tab__media_type`
--

CREATE TABLE `tab__media_type` (
  `id` mediumint(9) NOT NULL,
  `name` varchar(10) NOT NULL COMMENT '名称(1JPG、2BMP、3PNG、4WSQ、5MP3、6WAV、7AVI、8RAW、99等)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `tab__media_type`
--

INSERT INTO `tab__media_type` (`id`, `name`) VALUES
(1, 'JPG'),
(2, 'BMP'),
(3, 'PNG'),
(4, 'WSQ'),
(5, 'MP3'),
(6, 'WAV'),
(7, 'AVI'),
(8, 'RAW'),
(9, 'JPEG'),
(10, 'JPEG2000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tab_company__algorithm`
--
ALTER TABLE `tab_company__algorithm`
  ADD PRIMARY KEY (`company_algorithm_id`);

--
-- Indexes for table `tab_comparison_history`
--
ALTER TABLE `tab_comparison_history`
  ADD PRIMARY KEY (`identity_id`,`feature_id`,`library_code`) USING BTREE,
  ADD KEY `a_idx` (`bio_type_id`),
  ADD KEY `id` (`id`),
  ADD KEY `b_idx` (`media_type_id`),
  ADD KEY `c_idx` (`company_algorithm_id`),
  ADD KEY `d_idx` (`library_code`),
  ADD KEY `id_2` (`id`);

--
-- Indexes for table `tab_features`
--
ALTER TABLE `tab_features`
  ADD PRIMARY KEY (`identity_id`,`feature_id`,`library_code`) USING BTREE,
  ADD KEY `a_idx` (`bio_type_id`),
  ADD KEY `id` (`id`),
  ADD KEY `b_idx` (`media_type_id`),
  ADD KEY `c_idx` (`company_algorithm_id`),
  ADD KEY `d_idx` (`library_code`),
  ADD KEY `id_2` (`id`);

--
-- Indexes for table `tab_library`
--
ALTER TABLE `tab_library`
  ADD PRIMARY KEY (`library_code`),
  ADD KEY `library_id` (`library_id`);

--
-- Indexes for table `tab__bio_type`
--
ALTER TABLE `tab__bio_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tab__media_type`
--
ALTER TABLE `tab__media_type`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `tab_company__algorithm`
--
ALTER TABLE `tab_company__algorithm`
  MODIFY `company_algorithm_id` int(9) NOT NULL AUTO_INCREMENT COMMENT '厂商ID', AUTO_INCREMENT=2;

--
-- 使用表AUTO_INCREMENT `tab_comparison_history`
--
ALTER TABLE `tab_comparison_history`
  MODIFY `id` int(19) NOT NULL AUTO_INCREMENT COMMENT '自增序号';

--
-- 使用表AUTO_INCREMENT `tab_features`
--
ALTER TABLE `tab_features`
  MODIFY `id` int(19) NOT NULL AUTO_INCREMENT COMMENT '自增序号';

--
-- 使用表AUTO_INCREMENT `tab_library`
--
ALTER TABLE `tab_library`
  MODIFY `library_id` mediumint(9) NOT NULL AUTO_INCREMENT COMMENT '自增ID', AUTO_INCREMENT=933;

--
-- 使用表AUTO_INCREMENT `tab__bio_type`
--
ALTER TABLE `tab__bio_type`
  MODIFY `id` mediumint(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用表AUTO_INCREMENT `tab__media_type`
--
ALTER TABLE `tab__media_type`
  MODIFY `id` mediumint(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 限制导出的表
--

--
-- 限制表 `tab_features`
--
ALTER TABLE `tab_features`
  ADD CONSTRAINT `a` FOREIGN KEY (`bio_type_id`) REFERENCES `tab__bio_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `b` FOREIGN KEY (`media_type_id`) REFERENCES `tab__media_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `c` FOREIGN KEY (`company_algorithm_id`) REFERENCES `tab_company__algorithm` (`company_algorithm_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `d` FOREIGN KEY (`library_code`) REFERENCES `tab_library` (`library_code`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

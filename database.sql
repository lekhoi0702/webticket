-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: shuttle.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `organizer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('concert','sports','theater','conference','festival','workshop','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `venue_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `venue_address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `event_end_date` date DEFAULT NULL,
  `event_end_time` time DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_seat_map` tinyint(1) DEFAULT '0',
  `seat_map_config` json DEFAULT NULL,
  `status` enum('draft','published','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT '0',
  `total_capacity` int DEFAULT '0',
  `tickets_sold` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_city` (`city`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_slug` (`slug`),
  FULLTEXT KEY `idx_search` (`title`,`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `ticket_type_id` int DEFAULT NULL,
  `seat_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_ticket_type` (`ticket_type_id`),
  KEY `idx_seat` (`seat_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`ticket_type_id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`seat_id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_items_chk_2` CHECK ((`unit_price` >= 0)),
  CONSTRAINT `order_items_chk_3` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `order_items_chk_4` CHECK (((`ticket_type_id` is not null) or (`seat_id` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','bank_transfer','e_wallet','cash') COLLATE utf8mb4_unicode_ci DEFAULT 'credit_card',
  `payment_status` enum('pending','completed','failed','refunded','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `order_status` enum('pending','confirmed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user` (`user_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `seat_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `row_label` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('available','reserved','booked','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `order_id` int DEFAULT NULL,
  `booked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seat_id`),
  UNIQUE KEY `unique_seat` (`event_id`,`section`,`row_label`,`seat_number`),
  KEY `idx_event_status` (`event_id`,`status`),
  KEY `idx_section` (`event_id`,`section`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `seats_chk_1` CHECK ((`price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket_types`
--

DROP TABLE IF EXISTS `ticket_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_types` (
  `ticket_type_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `quantity_available` int NOT NULL,
  `quantity_sold` int DEFAULT '0',
  `min_purchase` int DEFAULT '1',
  `max_purchase` int DEFAULT '10',
  `sale_start_date` timestamp NULL DEFAULT NULL,
  `sale_end_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','sold_out','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_type_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `ticket_types_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_types_chk_1` CHECK ((`quantity_sold` <= `quantity_available`)),
  CONSTRAINT `ticket_types_chk_2` CHECK ((`price` >= 0)),
  CONSTRAINT `ticket_types_chk_3` CHECK ((`min_purchase` >= 1)),
  CONSTRAINT `ticket_types_chk_4` CHECK ((`max_purchase` >= `min_purchase`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `ticket_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` int NOT NULL,
  `order_item_id` int NOT NULL,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `ticket_type_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_info` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('active','used','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  KEY `order_item_id` (`order_item_id`),
  KEY `idx_ticket_code` (`ticket_code`),
  KEY `idx_order` (`order_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE RESTRICT,
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `tickets_ibfk_4` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'customer',
  `email_verified` tinyint(1) DEFAULT '0',
  `status` enum('active','suspended','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  CONSTRAINT `users_chk_1` CHECK ((((`role` = _utf8mb4'admin') and (`username` is not null)) or ((`role` = _utf8mb4'customer') and (`email` is not null))))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-01 20:58:59

CREATE DATABASE IF NOT EXISTS `inventory`;
USE `inventory`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
-- Host: localhost    Database: inventory
-- ------------------------------------------------------
-- Server version	9.2.0
-- Table structure for table `items`
--
DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items`
--
LOCK TABLES `items` WRITE;
INSERT INTO `items` VALUES (1,'Màn hình',3,'Dell 19','2025-02-03 10:21:43'),(2,'Máy vi tính',21,'PC HP Mini','2025-02-03 10:23:06'),(3,'Máy in',22,'Máy in Lazer 107a','2025-02-03 10:24:03'),(6,'Điện thoại bàn',6,'Vtech PoE','2025-02-03 10:32:34'),(7,'AP Wifi',12,'Aruba AP 303H','2025-02-03 10:33:04'),(8,'UPS',3,'Bộ lưu điện','2025-02-03 10:33:09'),(9,'Dây mạng',3,'Cuộn','2025-02-03 10:33:14'),(10,'Máy in',3,'máy in màu','2025-02-03 10:33:18'),(11,'Laptop',12,'laptop HP','2025-02-03 10:33:26'),(13,'Tivi Led',3,'Tivi LG LED chuyên dụng 55\" inch','2025-02-03 10:34:55'),(14,'IT Standalone 1',2,'11','2025-02-03 10:35:05'),(15,'Fusion Office',2,'Fusion Office','2025-02-03 10:47:54');
UNLOCK TABLES;

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'admin','$2b$10$EwMUbUptMQDM55VVJ0sOx.2Zvlp2CpEz2srgl4UfItjhPYTJcGWii',NULL,'2025-02-04 06:22:41');
UNLOCK TABLES;
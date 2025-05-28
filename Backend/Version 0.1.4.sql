CREATE DATABASE  IF NOT EXISTS `apuntanet_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `apuntanet_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: apuntanet_db
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_hogar` int NOT NULL,
  `fecha_auditora` timestamp NOT NULL,
  `grado_privilegio` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_idx` (`id_usuario`),
  KEY `hogar_administrado_idx` (`id_hogar`),
  CONSTRAINT `hogar_administrado` FOREIGN KEY (`id_hogar`) REFERENCES `hogar` (`id`),
  CONSTRAINT `usuario_administrador` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='sirve para almacenar quienes tienen permiso de modificar informacion sensible de las categorias de un hogar al que pertenece';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `casas_usuarios`
--

DROP TABLE IF EXISTS `casas_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `casas_usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_hogar` int DEFAULT NULL,
  `fecha_ingreso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario_idx` (`id_usuario`),
  KEY `id_hogar_idx` (`id_hogar`),
  CONSTRAINT `id_hogar` FOREIGN KEY (`id_hogar`) REFERENCES `hogar` (`id`),
  CONSTRAINT `id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='la tabla de todos los usuarios a los que pertenece un hogar';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `casas_usuarios`
--

LOCK TABLES `casas_usuarios` WRITE;
/*!40000 ALTER TABLE `casas_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `casas_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL,
  `id_hogar` int NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(45) NOT NULL,
  `grado_privilegio` int NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CasaPertenece_idx` (`id_hogar`),
  CONSTRAINT `CasaPertenece` FOREIGN KEY (`id_hogar`) REFERENCES `hogar` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hogar`
--

DROP TABLE IF EXISTS `hogar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hogar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(45) NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `codigo` varchar(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `creador_idx` (`id_usuario`),
  CONSTRAINT `creador` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hogar`
--

LOCK TABLES `hogar` WRITE;
/*!40000 ALTER TABLE `hogar` DISABLE KEYS */;
/*!40000 ALTER TABLE `hogar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monto_individual`
--

DROP TABLE IF EXISTS `monto_individual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monto_individual` (
  `id` int NOT NULL,
  `id_ticket` int NOT NULL,
  `id_usuario` int NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `monto_total` decimal(5,2) NOT NULL,
  `monto_abonado` decimal(5,2) NOT NULL,
  `comprobante` varchar(45) NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT NULL,
  `fecha_expiracion` timestamp NOT NULL,
  `estado` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pagoPertenece_idx` (`id_ticket`),
  KEY `UsuarioMonto_idx` (`id_usuario`),
  CONSTRAINT `pagoPertenece` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id`),
  CONSTRAINT `UsuarioMonto` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monto_individual`
--

LOCK TABLES `monto_individual` WRITE;
/*!40000 ALTER TABLE `monto_individual` DISABLE KEYS */;
/*!40000 ALTER TABLE `monto_individual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `id` int NOT NULL,
  `id_categoria` int NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(45) NOT NULL,
  `monto_total` decimal(5,2) NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `estado` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CategoriaPertenece_idx` (`id_categoria`),
  CONSTRAINT `CategoriaPertenece` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `correo` varchar(45) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `estado` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla con informacion del usuario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'Gael','HOLA12','gaelvalenzuela2309@gmail.com','6682272112',''),(4,'Filiberto','UnaMotomamiPlis1','filiberogalvez@gmail.com','6688858358',''),(5,'Jorge','hola12','jorge@gmail.com','6682542660',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'apuntanet_db'
--

--
-- Dumping routines for database 'apuntanet_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-27 23:23:01

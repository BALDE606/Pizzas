-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS pizzapissa;
USE pizzapissa;

-- Crear la tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Fecha del pedido: por defecto toma la fecha del servidor si no se proporciona
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    nombre VARCHAR(60) NOT NULL,
    direccion VARCHAR(250) NOT NULL,
    telefono VARCHAR(12) NOT NULL,
    importe FLOAT NOT NULL,
    pizzas JSON NOT NULL,
    -- estatus: 0 = pendiente, 1 = entregada, 3 = cancelada
    estatus TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
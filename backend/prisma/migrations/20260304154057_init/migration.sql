-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoDocumento` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `rol` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `foto` VARCHAR(191) NULL,
    `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaUltimaEdicion` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_documento_key`(`documento`),
    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    INDEX `Usuario_documento_idx`(`documento`),
    INDEX `Usuario_correo_idx`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Factura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigoFactura` VARCHAR(191) NOT NULL,
    `metodoPago` ENUM('EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'OTRO') NOT NULL,
    `lugarCompra` VARCHAR(191) NOT NULL,
    `nitProveedor` VARCHAR(191) NULL,
    `fechaHoraCompra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalPagar` DECIMAL(10, 2) NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    UNIQUE INDEX `Factura_codigoFactura_key`(`codigoFactura`),
    INDEX `Factura_fechaHoraCompra_idx`(`fechaHoraCompra`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `Producto_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacturaProducto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facturaId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `unidad` VARCHAR(191) NULL,
    `descuento` DECIMAL(5, 2) NULL,
    `precioTotal` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `FacturaProducto_facturaId_productoId_key`(`facturaId`, `productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Factura` ADD CONSTRAINT `Factura_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacturaProducto` ADD CONSTRAINT `FacturaProducto_facturaId_fkey` FOREIGN KEY (`facturaId`) REFERENCES `Factura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacturaProducto` ADD CONSTRAINT `FacturaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

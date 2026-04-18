-- Phase 1: add nullable currency/snapshot columns
ALTER TABLE `Usuario` ADD COLUMN `monedaBase` VARCHAR(3) NOT NULL DEFAULT 'COP';

ALTER TABLE `Factura`
  ADD COLUMN `moneda` VARCHAR(3) NULL,
  ADD COLUMN `monedaBase` VARCHAR(3) NULL,
  ADD COLUMN `tasaCambio` DECIMAL(18,6) NULL,
  ADD COLUMN `tasaCambioFecha` DATETIME(3) NULL,
  ADD COLUMN `tasaCambioFuente` VARCHAR(191) NULL,
  ADD COLUMN `totalPagarBase` DECIMAL(18,2) NULL;

ALTER TABLE `FacturaProducto`
  ADD COLUMN `precioUnitario` DECIMAL(10,2) NULL,
  ADD COLUMN `productoNombre` VARCHAR(191) NULL,
  ADD COLUMN `productoCodigo` VARCHAR(191) NULL;

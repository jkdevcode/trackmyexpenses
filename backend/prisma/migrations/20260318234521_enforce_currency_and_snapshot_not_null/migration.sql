-- AlterTable
ALTER TABLE `Factura` MODIFY `moneda` CHAR(3) NULL,
    MODIFY `monedaBase` CHAR(3) NULL;

-- AlterTable
ALTER TABLE `Usuario` MODIFY `monedaBase` CHAR(3) NOT NULL DEFAULT 'COP';

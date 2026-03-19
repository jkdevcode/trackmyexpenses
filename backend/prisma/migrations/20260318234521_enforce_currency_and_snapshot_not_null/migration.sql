-- AlterTable
ALTER TABLE `factura` MODIFY `moneda` CHAR(3) NULL,
    MODIFY `monedaBase` CHAR(3) NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `monedaBase` CHAR(3) NOT NULL DEFAULT 'COP';

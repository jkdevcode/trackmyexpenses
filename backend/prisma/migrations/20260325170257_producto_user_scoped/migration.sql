-- Add usuarioId to Producto (nullable first)
ALTER TABLE `Producto` ADD COLUMN `usuarioId` INTEGER NULL;

-- Backfill existing products to user 7
UPDATE `Producto`
SET `usuarioId` = 7
WHERE `usuarioId` IS NULL;

-- Enforce NOT NULL
ALTER TABLE `Producto` MODIFY `usuarioId` INTEGER NOT NULL;

-- Drop old unique index on codigo
DROP INDEX `Producto_codigo_key` ON `Producto`;

-- Add composite unique and index
CREATE UNIQUE INDEX `Producto_codigo_usuarioId_key` ON `Producto`(`codigo`, `usuarioId`);
CREATE INDEX `Producto_usuarioId_idx` ON `Producto`(`usuarioId`);

-- Add foreign key constraint
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

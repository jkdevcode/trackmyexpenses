-- Backfill currency and snapshot fields for legacy data
UPDATE Factura
SET
  moneda = COALESCE(moneda, 'COP'),
  monedaBase = COALESCE(monedaBase, 'COP'),
  tasaCambio = COALESCE(tasaCambio, 1),
  totalPagarBase = COALESCE(totalPagarBase, totalPagar)
WHERE moneda IS NULL OR monedaBase IS NULL OR tasaCambio IS NULL OR totalPagarBase IS NULL;

UPDATE FacturaProducto fp
JOIN Producto p ON p.id = fp.productoId
SET
  fp.productoNombre = COALESCE(fp.productoNombre, p.nombre),
  fp.productoCodigo = COALESCE(fp.productoCodigo, p.codigo),
  fp.precioUnitario = COALESCE(fp.precioUnitario, p.precioUnitario)
WHERE fp.productoNombre IS NULL OR fp.productoCodigo IS NULL OR fp.precioUnitario IS NULL;

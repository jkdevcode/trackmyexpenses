export const FACTURA_REPOSITORY = Symbol('FACTURA_REPOSITORY');

export type MetodoPagoValue =
  | 'EFECTIVO'
  | 'TARJETA_CREDITO'
  | 'TARJETA_DEBITO'
  | 'TRANSFERENCIA'
  | 'OTRO';

export type FacturaListItem = {
  id: number;
  codigoFactura: string;
  metodoPago: string;
  lugarCompra: string;
  nitProveedor: string | null;
  fechaHoraCompra: Date;
  totalPagar: unknown;
  moneda: string | null;
  monedaBase: string | null;
  tasaCambio: unknown;
  totalPagarBase: unknown;
  imagenUrl?: string | null;
  ocrSource?: string | null;
  usuarioId: number;
};

export type FacturaStatsDateRange = {
  startDate: Date;
  endDate: Date;
};

export type CreateFacturaRecordInput = {
  usuarioId: number;
  codigoFactura: string;
  metodoPago: MetodoPagoValue;
  lugarCompra: string;
  nitProveedor?: string;
  fechaHoraCompra: Date;
  totalPagar: number;
  moneda?: string | null;
  monedaBase?: string | null;
  tasaCambio?: number | null;
  tasaCambioFecha?: Date | null;
  tasaCambioFuente?: string | null;
  totalPagarBase?: number | null;
  imagenUrl?: string | null;
  ocrSource?: string | null;
};

export type CreateFacturaProductoInput = {
  facturaId: number;
  productoId: number;
  cantidad: number;
  unidad?: string;
  descuento: number;
  precioUnitario: number;
  precioTotal: number;
  productoNombre: string;
  productoCodigo: string;
};

export type CreateProductoInput = {
  nombre: string;
  codigo: string;
  precioUnitario: number;
};

export type UpdateFacturaRecordInput = {
  metodoPago?: MetodoPagoValue;
  lugarCompra?: string;
  nitProveedor?: string | null;
  fechaHoraCompra?: Date;
  totalPagar?: number;
  moneda?: string | null;
  monedaBase?: string | null;
  tasaCambio?: number | null;
  tasaCambioFecha?: Date | null;
  tasaCambioFuente?: string | null;
  totalPagarBase?: number | null;
};

export type FacturaProductoRecord = {
  id: number;
  productoId: number;
  cantidad: unknown;
  unidad: string | null;
  descuento: unknown;
  precioUnitario: unknown;
  precioTotal: unknown;
};

export type UpdateFacturaProductoSnapshotInput = {
  facturaId: number;
  productoId: number;
  cantidad: number;
  unidad?: string | null;
  descuento: number;
  precioUnitario: number;
  precioTotal: number;
};

export interface FacturaRepositoryTx {
  findProductosByIds(
    userId: number,
    productIds: number[],
  ): Promise<
    Array<{
      id: number;
      precioUnitario: unknown;
      nombre: string;
      codigo: string;
    }>
  >;
  findFacturaProductosByFacturaId(
    facturaId: number,
  ): Promise<FacturaProductoRecord[]>;
  createFactura(data: CreateFacturaRecordInput): Promise<{ id: number }>;
  createFacturaProducto(data: CreateFacturaProductoInput): Promise<{
    id: number;
    facturaId: number;
    productoId: number;
    cantidad: unknown;
    unidad: string | null;
    descuento: unknown;
    precioUnitario: unknown;
    precioTotal: unknown;
    productoNombre: string | null;
    productoCodigo: string | null;
  }>;
  findFacturaByIdWithRelations(facturaId: number): Promise<unknown>;
  findProductoByNombre(
    userId: number,
    nombre: string,
  ): Promise<{ id: number } | null>;
  createProducto(
    userId: number,
    data: CreateProductoInput,
  ): Promise<{ id: number }>;
  updateFacturaTotalAndGetDetails(
    facturaId: number,
    increment: number,
    incrementBase: number,
  ): Promise<unknown>;
  updateFactura(
    facturaId: number,
    data: UpdateFacturaRecordInput,
  ): Promise<unknown>;
  updateFacturaProductoSnapshot(
    data: UpdateFacturaProductoSnapshotInput,
  ): Promise<unknown>;
  deleteFacturaProductosByFacturaId(facturaId: number): Promise<number>;
  deleteFacturaById(facturaId: number): Promise<void>;
}

export interface FacturaRepository {
  transaction<T>(callback: (tx: FacturaRepositoryTx) => Promise<T>): Promise<T>;
  findFacturasByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
    page: number,
    limit: number,
  ): Promise<FacturaListItem[]>;
  countFacturasByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ): Promise<number>;
  findFacturaDetailByUser(
    userId: number,
    facturaId: number,
  ): Promise<Record<string, unknown> | null>;
  findFacturaIdByUser(
    userId: number,
    facturaId: number,
  ): Promise<{ id: number } | null>;
  findFacturaCurrencyByUser(
    userId: number,
    facturaId: number,
  ): Promise<{
    id: number;
    totalPagar: unknown;
    totalPagarBase: unknown;
    moneda: string | null;
    monedaBase: string | null;
    tasaCambio: unknown;
  } | null>;
  findProductoById(
    userId: number,
    productoId: number,
  ): Promise<{
    id: number;
    precioUnitario: unknown;
    nombre: string;
    codigo: string;
  } | null>;
  findUsuarioMonedaBase(userId: number): Promise<string | null>;
  countFacturasByUser(userId: number): Promise<number>;
  sumTotalPagarByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ): Promise<number>;
}

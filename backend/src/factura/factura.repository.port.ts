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
};

export type CreateFacturaProductoInput = {
  facturaId: number;
  productoId: number;
  cantidad: number;
  unidad?: string;
  descuento: number;
  precioTotal: number;
};

export type CreateProductoInput = {
  nombre: string;
  codigo: string;
  precioUnitario: number;
};

export interface FacturaRepositoryTx {
  findProductosByIds(
    productIds: number[],
  ): Promise<Array<{ id: number; precioUnitario: unknown }>>;
  createFactura(data: CreateFacturaRecordInput): Promise<{ id: number }>;
  createFacturaProducto(data: CreateFacturaProductoInput): Promise<{
    id: number;
    facturaId: number;
    productoId: number;
    cantidad: number;
    descuento: unknown;
    precioTotal: unknown;
  }>;
  findFacturaByIdWithRelations(facturaId: number): Promise<unknown>;
  findProductoByNombre(nombre: string): Promise<{ id: number } | null>;
  createProducto(data: CreateProductoInput): Promise<{ id: number }>;
  updateFacturaTotalAndGetDetails(
    facturaId: number,
    increment: number,
  ): Promise<unknown>;
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
  findProductoById(
    productoId: number,
  ): Promise<{ id: number; precioUnitario: unknown } | null>;
  countFacturasByUser(userId: number): Promise<number>;
  sumTotalPagarByUserAndRange(
    userId: number,
    range: FacturaStatsDateRange,
  ): Promise<number>;
}

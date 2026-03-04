export class FacturaNotFoundError extends Error {
  constructor(message = 'Factura no encontrada') {
    super(message);
    this.name = 'FacturaNotFoundError';
  }
}

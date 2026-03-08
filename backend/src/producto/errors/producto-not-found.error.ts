export class ProductoNotFoundError extends Error {
  constructor(message = 'Producto no encontrado') {
    super(message);
    this.name = 'ProductoNotFoundError';
  }
}

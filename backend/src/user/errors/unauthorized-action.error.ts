export class UnauthorizedActionError extends Error {
  constructor(message = 'No autorizado para realizar esta accion') {
    super(message);
    this.name = 'UnauthorizedActionError';
  }
}

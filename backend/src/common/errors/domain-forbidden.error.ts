export class DomainForbiddenError extends Error {
  constructor(message = 'Accion no permitida') {
    super(message);
    this.name = 'DomainForbiddenError';
  }
}
